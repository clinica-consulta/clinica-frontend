import { SiteSelect } from "@/components/site-select";
import { useMemo, useState } from "react";
import { Activity, Lightbulb, BriefcaseMedical, ListFilter, Pencil, Info, LogIn, ChevronDown, Clock3, MoreVertical, Stethoscope, CalendarCheck, CalendarCheck2, CalendarDays, MailCheck, Plus, SlidersHorizontal, CalendarClock, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, History, MessageSquareText, MoreHorizontal, Phone, Send, ShieldCheck, Users, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, Modal, PageHeader, SearchInput, Section, SelectField, StatCard, StatusBadge, TextareaField, Toggle, Toolbar } from "@/components/page-kit";
import { AppointmentForm } from "@/components/appointment-form";
import { MiniCalendar, SlotPicker } from "@/components/mini-calendar";
import { appointmentStatuses, formatDate, isoDate, openStatuses, relativeDay, slotRange, type Appointment } from "@/lib/clinic-data";
import { useClinic, useReports } from "@/lib/clinic-store";

function useAppointmentActions() {
  const { setAppointmentStatus, sendReminder, patientById } = useClinic();
  return {
    confirm: (item: Appointment) => { setAppointmentStatus(item.id, "Confirmada", "Consulta confirmada"); toast.success("Consulta confirmada", { description: `${patientById(item.patientId)?.name} · ${item.time}` }); },
    complete: (item: Appointment) => { setAppointmentStatus(item.id, "Realizada", "Consulta registrada como realizada"); toast.success("Consulta registrada como realizada"); },
    noShow: (item: Appointment) => { setAppointmentStatus(item.id, "Não compareceu", "Ausência registrada"); toast.warning("Ausência registrada"); },
    cancel: (item: Appointment) => { setAppointmentStatus(item.id, "Cancelada", "Consulta cancelada e horário liberado"); toast.warning("Consulta cancelada", { description: `Horário ${item.time} liberado · ${formatDate(item.date)}` }); },
    remind: (item: Appointment) => { sendReminder(item.id); toast.success("Lembrete enviado", { description: `${patientById(item.patientId)?.name} recebeu o pedido de confirmação.` }); },
  };
}

export function RescheduleModal({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const { availableSlots, rescheduleAppointment } = useClinic();
  const [date, setDate] = useState(appointment?.date ?? isoDate(1));
  const [time, setTime] = useState("");
  const slots = appointment ? availableSlots(appointment.professionalId, date, appointment.id) : [];
  const chosen = slots.includes(time) ? time : slots[0] ?? "";

  return (
    <Modal open={Boolean(appointment)} title="Remarcar consulta" description="Escolha uma nova data e um horário livre." onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Nova data" type="date" value={date} min={isoDate(0)} onChange={(event) => setDate(event.target.value)} />
        {slots.length ? <SelectField label="Novo horário" value={chosen} onChange={(event) => setTime(event.target.value)} options={slots.map((item) => ({ value: item, label: item }))} /> : <EmptyHint>Sem horários livres nessa data.</EmptyHint>}
        <Button disabled={!slots.length} onClick={() => {
          if (!appointment) return;
          const done = rescheduleAppointment(appointment.id, date, chosen);
          toast[done ? "success" : "error"](done ? "Consulta remarcada" : "Horário indisponível", done ? { description: `${formatDate(date)} às ${chosen}.` } : undefined);
          if (done) onClose();
        }}>Salvar novo horário</Button>
      </div>
    </Modal>
  );
}

export function ManageModal({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const actions = useAppointmentActions();
  const { patientById, professionalById } = useClinic();
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  if (!appointment) return null;
  const patient = patientById(appointment.patientId);
  return (
    <>
      <Modal open={Boolean(appointment) && !reschedule} title="Gerenciar consulta" description={`${patient?.name} · ${professionalById(appointment.professionalId)?.name} · ${relativeDay(appointment.date)} às ${appointment.time}`} onClose={onClose}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={() => { actions.confirm(appointment); onClose(); }}><Check />Confirmar</Button>
          <Button variant="outline" onClick={() => { actions.remind(appointment); onClose(); }}><Send />Enviar lembrete</Button>
          <Button variant="outline" onClick={() => setReschedule(appointment)}><CalendarClock />Remarcar</Button>
          <Button variant="outline" onClick={() => { actions.complete(appointment); onClose(); }}><CheckCircle2 />Registrar realizada</Button>
          <Button variant="outline" onClick={() => { actions.noShow(appointment); onClose(); }}><CircleAlert />Registrar ausência</Button>
          <Button variant="outline" onClick={() => { actions.cancel(appointment); onClose(); }}><X />Cancelar consulta</Button>
        </div>
        <div className="mt-4 rounded-md bg-muted/60 p-3 text-xs sm:text-sm">
          <b className="block">Dados da consulta</b>
          <p className="mt-1 text-muted-foreground">Especialidade: {appointment.specialty}</p>
          <p className="text-muted-foreground">Convênio do paciente: {patient?.insurance ?? "—"}</p>
          <p className="text-muted-foreground">Canal do agendamento: {appointment.channel}</p>
          <p className="text-muted-foreground">Resposta do paciente: {appointment.confirmationReply}</p>
          <p className="text-muted-foreground">Lembrete: {appointment.reminderSentAt ? formatDate(appointment.reminderSentAt) : "não enviado"}</p>
        </div>
        <div className="mt-3 rounded-md border border-border p-3 text-xs sm:text-sm">
          <b className="flex items-center gap-2"><History className="size-4" />Alterações registradas</b>
          <ul className="mt-2 space-y-1 text-muted-foreground">{appointment.history.length ? appointment.history.map((entry, index) => <li key={`${entry.at}-${index}`}>{formatDate(entry.at)} · {entry.text}</li>) : <li>Nenhuma alteração registrada.</li>}</ul>
        </div>
      </Modal>
      <RescheduleModal appointment={reschedule} onClose={() => { setReschedule(null); onClose(); }} />
    </>
  );
}

export function DashboardPage() {
  const { appointments, professionals, sendAllReminders, sendReminder, availableSlots, patientById, professionalById, session } = useClinic();
  const [newOpen, setNewOpen] = useState(false);
  const active = professionals.filter((item) => item.active);
  const [proId, setProId] = useState(active[0]?.id ?? "");
  const [calDate, setCalDate] = useState(isoDate(0));
  const [slot, setSlot] = useState("");
  const today = appointments.filter((item) => item.date === isoDate(0) && item.status !== "Cancelada").sort((a, b) => a.time.localeCompare(b.time));
  const confirmed = today.filter((item) => item.status === "Confirmada").length;
  const ready = today.length ? Math.round((confirmed / today.length) * 100) : 0;
  const pending = appointments.filter((item) => item.confirmationReply === "Sem resposta" && openStatuses.includes(item.status) && item.date >= isoDate(0)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const slots = proId ? availableSlots(proId, calDate) : [];
  const chosen = slots.includes(slot) ? slot : slots[0] ?? "";
  const doctor = professionalById(proId);
  const remindAll = () => { const sent = sendAllReminders(); toast[sent ? "success" : "info"](sent ? `${sent} lembrete(s) enviado(s)` : "Todos os lembretes já foram enviados"); };

  return <>
    <header className="mb-6 md:mb-6">
      <p className="mb-1 hidden text-[11px] font-bold uppercase leading-4 tracking-[1.1px] text-muted-foreground md:block">Visão geral</p>
      <div className="flex items-center justify-between gap-3 md:block">
        <h1 className="text-[26px] font-bold leading-8 tracking-[-0.8px] md:text-[32px] md:leading-10">{greeting()}, {firstName(session?.name)}</h1>
        <Button onClick={() => setNewOpen(true)} className="h-9 shrink-0 rounded-lg px-3 text-sm font-semibold md:hidden"><Plus />Nova consulta</Button>
      </div>
      <p className="mt-2 max-w-[260px] text-sm leading-5 text-muted-foreground md:mt-0.5 md:max-w-none">Acompanhe os agendamentos do dia e as confirmações pendentes.</p>
      <Button onClick={() => setNewOpen(true)} className="mt-6 hidden h-10 rounded-lg px-5 text-sm font-semibold shadow-[0_1px_1px_rgb(0_0_0/5%)] md:inline-flex"><Plus />Nova consulta</Button>
    </header>

    <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-2">
      <section className="surface overflow-hidden md:p-6">
        <div className="flex items-center justify-between gap-2 bg-soft px-4 py-3 md:bg-transparent md:p-0 md:pb-4">
          <h2 className="eyebrow">Consultas hoje ({today.length} • {confirmed} confirmadas)</h2>
          <span className="hidden rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold leading-[14px] text-success md:inline">{ready}% prontas</span>
          <CalendarDays className="size-4 text-muted-foreground md:hidden" />
        </div>
        {today.length ? <div className="divide-y divide-border/60 md:divide-y-0">{today.map((item, index) => (
          <div key={item.id}>
            {index > 0 && <div className="hidden py-1 md:block"><div className="h-px bg-border/60" /></div>}
            <div className="flex items-center justify-between gap-3 px-4 py-4 md:-mx-2 md:rounded-lg md:px-2 md:py-3.5 md:hover:bg-soft/50">
              <div className="flex min-w-0 items-center gap-4">
                <span className="w-14 shrink-0 text-base font-bold leading-6">{item.time}</span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold leading-5">{patientById(item.patientId)?.name}</p><p className="truncate text-xs leading-4 text-muted-foreground">{professionalById(item.professionalId)?.name} • {item.specialty}</p></div>
              </div>
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}</div> : <div className="p-4 md:p-0"><EmptyHint>Nenhuma consulta para hoje.</EmptyHint></div>}
      </section>

      <section className="surface overflow-hidden md:p-6">
        <div className="flex items-center justify-between gap-2 bg-soft px-4 py-3 md:bg-transparent md:p-0 md:pb-4">
          <h2 className="eyebrow">Aguardando confirmação ({pending.length})</h2>
          <button type="button" onClick={remindAll} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent/60 px-3 py-1.5 text-xs font-semibold leading-[18px] text-soft-foreground transition hover:bg-accent md:bg-soft md:text-[13px]"><Send className="size-3.5" /><span className="max-w-16 text-center md:max-w-none">Enviar lembretes</span></button>
        </div>
        {pending.length ? <div className="divide-y divide-border/60 md:divide-y-0">{pending.map((item, index) => (
          <div key={item.id}>
            {index > 0 && <div className="hidden py-1 md:block"><div className="h-px bg-border/60" /></div>}
            <div className="hidden items-center justify-between gap-3 md:-mx-2 md:flex md:rounded-lg md:px-2 md:py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-20 shrink-0"><b className="block text-sm leading-5">{formatDate(item.date).slice(0, 5)}</b><span className="block text-[11px] font-medium leading-[14px] text-muted-foreground">{item.time}</span></span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold leading-5">{patientById(item.patientId)?.name}</p><p className="truncate text-xs leading-4 text-subtle-foreground">{professionalById(item.professionalId)?.name} • {item.reminderSentAt ? "Lembrete enviado" : "Sem lembrete"}</p></div>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 px-4 py-4 md:hidden">
              <b className="text-sm leading-5">{formatDate(item.date).slice(0, 5)} • {item.time}</b>
              <span className="justify-self-end"><StatusBadge status={item.status} /></span>
              <div className="min-w-0"><p className="truncate text-sm font-semibold leading-5">{patientById(item.patientId)?.name}</p><p className="truncate text-xs leading-4 text-muted-foreground">{professionalById(item.professionalId)?.name} • {item.reminderSentAt ? "Lembrete enviado" : "Sem lembrete"}</p></div>
              <button type="button" aria-label="Enviar lembrete" onClick={() => { sendReminder(item.id); toast.success("Lembrete enviado"); }} className="grid size-8 place-items-center self-end rounded-full bg-accent/70 text-foreground"><MailCheck className="size-4" /></button>
            </div>
          </div>
        ))}</div> : <div className="p-4 md:p-0"><EmptyHint>Todas as consultas estão confirmadas.</EmptyHint></div>}
        <div className="hidden pt-6 md:block"><p className="flex items-center gap-3 rounded-lg bg-soft p-3 text-xs leading-[15px] text-muted-foreground"><MessageSquareText className="size-[18px] shrink-0 text-foreground" />Os lembretes automáticos por WhatsApp e SMS são disparados 24h antes do horário marcado.</p></div>
      </section>
    </div>

    <section className="surface mt-4 p-4 md:mt-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="eyebrow">Horários disponíveis</h2>
        <div className="hidden items-center gap-2 text-[11px] font-medium leading-[14px] text-muted-foreground md:flex"><span className="size-2.5 rounded-full bg-success" />Dias com vagas<span className="ml-2 size-2.5 rounded-full bg-strong" />Dia selecionado</div>
        <SlidersHorizontal className="size-4 text-muted-foreground md:hidden" />
      </div>
      <div className="mt-4 grid gap-5 md:mt-6 md:grid-cols-12 md:gap-8">
        <div className="grid content-start gap-5 md:col-span-4">
          <label className="grid gap-1.5 text-[13px] font-semibold leading-[18px]">Médico
            <SiteSelect value={proId} onChange={(event) => setProId(event.target.value)} className="h-11 w-full rounded-lg bg-soft px-3.5 text-sm font-normal outline-none ring-1 ring-transparent focus:ring-ring md:h-[38px] md:bg-card md:text-[13px] md:ring-input/60">
              {active.map((item) => <option key={item.id} value={item.id}>{item.name} • {item.specialty}</option>)}
            </SiteSelect>
          </label>
          <MiniCalendar value={calDate} onChange={setCalDate} slotsFor={(day) => (proId ? availableSlots(proId, day).length : 0)} />
        </div>
        <div className="grid content-start gap-4 md:col-span-8">
          <div className="flex items-center justify-between gap-3 md:pb-2">
            <div><h3 className="text-base font-bold leading-6">{formatDate(calDate)} • {relativeDay(calDate)}</h3><p className="text-xs leading-4 text-muted-foreground">{slots.length} horário(s) livre(s)</p></div>
            <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-semibold text-success md:hidden">{slots.length ? "Disponível" : "Sem vagas"}</span>
            <span className="hidden items-center gap-2 text-[11px] font-medium text-subtle-foreground md:flex">Turno:<span className="rounded bg-accent px-2.5 py-1 text-[13px] font-semibold leading-[18px] text-foreground">Integral</span></span>
          </div>
          {slots.length ? <SlotPicker slots={slots} value={chosen} onChange={setSlot} /> : <EmptyHint>Nenhum horário disponível nesta data.</EmptyHint>}
          {chosen && <div className="hidden pt-4 md:block"><div className="flex items-center justify-between gap-4 rounded-xl bg-soft/40 p-4">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-success-soft/50 text-success"><CalendarCheck className="size-[18px]" /></span><div><p className="text-sm font-bold leading-5">Horário de {chosen} reservado para marcação</p><p className="text-xs leading-4 text-muted-foreground">Duração estimada: 30 minutos • {doctor?.name}</p></div></div>
            <Button onClick={() => setNewOpen(true)} className="rounded-lg bg-strong px-4 text-sm font-semibold hover:bg-strong/90"><CalendarCheck2 />Agendar neste horário</Button>
          </div></div>}
        </div>
      </div>
    </section>
    <Modal open={newOpen} title="Nova consulta" description="Busque o paciente pelo CPF e agende em nome dele (presencial ou por telefone)." onClose={() => setNewOpen(false)}><AppointmentForm onDone={() => setNewOpen(false)} /></Modal>
  </>;
}

export function AgendaPage() {
  const { appointments, professionals, patientById, professionalById, availableSlots, waitlist, setAppointmentStatus } = useClinic();
  const [date, setDate] = useState(isoDate(0));
  const [newOpen, setNewOpen] = useState(false);
  const [manage, setManage] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState("Todos");
  const allActive = professionals.filter((item) => item.active);
  const active = allActive.filter((item) => doctor === "Todos" || item.id === doctor);
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const hours = useMemo(() => {
    const all = new Set<string>();
    active.forEach((professional) => {
      const day = professional.availability[weekday];
      if (day?.active) slotRange(day.start, day.end).forEach((slot) => all.add(slot));
    });
    return [...all].sort();
  }, [active, weekday]);
  const dayItems = appointments.filter((item) => item.date === date && item.status !== "Cancelada" && active.some((pro) => pro.id === item.professionalId));
  const at = (professionalId: string, hour: string) => dayItems.find((item) => item.professionalId === professionalId && item.time === hour);
  const freeTotal = active.reduce((sum, pro) => sum + availableSlots(pro.id, date).length, 0);
  const waiting = waitlist.filter((item) => item.status === "Aguardando").length;
  const nextUp = dayItems.filter((item) => openStatuses.includes(item.status)).sort((x, y) => x.time.localeCompare(y.time))[0];
  const endOf = (time: string) => { const [h, m] = time.split(":").map(Number); const total = (h ?? 0) * 60 + (m ?? 0) + 30; return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; };

  function shift(days: number) {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + days);
    setDate(next.toISOString().slice(0, 10));
  }

  const dateBar = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-2"><Button variant="ghost" size="icon" className="size-9 rounded-lg bg-soft" onClick={() => shift(-1)} aria-label="Dia anterior"><ChevronLeft /></Button><Button variant="ghost" size="icon" className="size-9 rounded-lg bg-soft" onClick={() => shift(1)} aria-label="Próximo dia"><ChevronRight /></Button></div>
      <p className="flex items-center gap-1.5 text-base md:text-xl"><CalendarDays className="size-4 md:hidden" /><b className="font-bold">{formatDate(date)}</b><span className="text-muted-foreground">•</span><span className="text-muted-foreground md:font-medium">{relativeDay(date)}</span></p>
      <Button variant="ghost" className="h-9 rounded-lg bg-accent/70 px-4 font-semibold md:bg-soft" onClick={() => setDate(isoDate(0))}>Hoje</Button>
    </div>
  );

  return <>
    <PageHeader eyebrow="Organização diária" title="Agenda" description="Visualize a agenda diária dos médicos e a disponibilidade de horários." action="Agendar consulta" onAction={() => setNewOpen(true)} />

    <div className="horizontal-nav -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:mb-6 md:px-0" role="tablist" aria-label="Filtrar por médico">
      <button type="button" onClick={() => setDoctor("Todos")} className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold shadow-[0_1px_1px_rgb(0_0_0/5%)] ${doctor === "Todos" ? "bg-primary text-primary-foreground" : "bg-card"}`}><UsersRound className="size-4 md:hidden" />Todos os médicos<span className="rounded-full bg-white/15 px-1.5 text-[11px] md:hidden">{allActive.length}</span></button>
      {allActive.map((item) => <button type="button" key={item.id} onClick={() => setDoctor(item.id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold shadow-[0_1px_1px_rgb(0_0_0/5%)] ${doctor === item.id ? "bg-primary text-primary-foreground" : "bg-card"}`}><span className="grid size-6 place-items-center rounded-full bg-accent text-[10px] font-bold text-foreground md:hidden">{item.name.replace(/^Dra?\.\s/, "").split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>{item.name}<span className="text-xs font-normal opacity-70 md:hidden">• {item.specialty}</span></button>)}
    </div>

    {/* Desktop: grade por médico */}
    <section className="surface hidden overflow-hidden md:block">
      <div className="px-6 py-4">{dateBar}</div>
      {hours.length ? <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: `100px repeat(${active.length}, minmax(200px,1fr))` }}>
          <div className="bg-soft" />
          {active.map((pro) => <div key={pro.id} className="bg-soft py-3 text-center"><p className="text-sm font-bold leading-5">{pro.name}</p><p className="text-[11px] text-muted-foreground">{pro.specialty}</p></div>)}
          {hours.flatMap((hour) => [
            <div key={`${hour}-t`} className="h-16 bg-soft/40 pr-4 pt-3 text-right text-sm font-semibold text-muted-foreground md:pl-8 md:text-left">{hour}</div>,
            ...active.map((pro) => {
              const item = at(pro.id, hour);
              const day = pro.availability[weekday];
              const open = day?.active && slotRange(day.start, day.end).includes(hour) && availableSlots(pro.id, date).includes(hour);
              return <div key={`${hour}-${pro.id}`} className="h-16 p-1.5">
                {item ? <button type="button" onClick={() => setManage(item)} className="flex size-full flex-col justify-center rounded-lg bg-accent/70 px-3 text-left shadow-[0_1px_2px_rgb(0_0_0/6%)]">
                  <span className="flex items-center justify-between gap-2"><b className="truncate text-sm font-bold">{patientById(item.patientId)?.name}</b><span className="scale-[.8] origin-right"><StatusBadge status={item.status} /></span></span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{item.time} - {endOf(item.time)} • {item.notes || "Consulta"}</span>
                </button> : open ? <button type="button" aria-label={`Agendar ${hour} com ${pro.name}`} onClick={() => setNewOpen(true)} className="size-full rounded-lg transition hover:bg-soft" /> : null}
              </div>;
            }),
          ])}
        </div>
      </div> : <div className="px-6 pb-6"><EmptyHint>Nenhum médico atende nesta data.</EmptyHint></div>}
      <div className="flex items-center justify-between bg-soft/40 px-6 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" />Confirmada</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Aguardando recepção</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-accent" />Horário disponível</span></div>
        <span className="flex items-center gap-1.5 text-foreground"><Info className="size-4" />Clique em um horário vazio para criar agendamento rápido</span>
      </div>
    </section>

    {/* Mobile: linha do tempo */}
    <div className="md:hidden">
      <div className="surface p-3">{dateBar}</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="surface p-3"><p className="text-[11px] text-muted-foreground">Atendimentos</p><p className="text-lg font-bold">{dayItems.length} <span className="text-xs font-normal text-muted-foreground">/{appointments.filter((item) => item.date === date).length || dayItems.length}</span></p></div>
        <div className="surface p-3"><p className="text-[11px] text-muted-foreground">Livres</p><p className="text-lg font-bold text-success">{freeTotal} <span className="text-xs font-normal text-success/70">vagas</span></p></div>
        <div className="surface p-3"><p className="text-[11px] text-muted-foreground">Em Espera</p><p className="text-lg font-bold">{waiting} <span className="text-xs font-normal text-muted-foreground">fila</span></p></div>
      </div>
      <div className="mt-4 grid gap-3">
        {hours.length ? hours.map((hour) => {
          const items = dayItems.filter((item) => item.time === hour);
          const freeRooms = active.filter((pro) => availableSlots(pro.id, date).includes(hour)).length;
          return <div key={hour} className="grid grid-cols-[52px_minmax(0,1fr)] gap-3">
            <div className="pt-3"><b className="block text-[15px] leading-5">{hour}</b>{items.length > 0 && <span className="text-xs font-medium text-success">30 min</span>}</div>
            <div className="grid gap-2">
              {items.map((item) => <article key={item.id} className="rounded-xl border-l-4 border-strong bg-accent/60 p-4 shadow-[0_1px_2px_rgb(0_0_0/6%)]">
                <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="flex flex-wrap items-center gap-2 text-base font-bold leading-5">{patientById(item.patientId)?.name}<span className="scale-90 origin-left"><StatusBadge status={item.status} /></span></p><p className="mt-0.5 text-[13px] text-muted-foreground">{professionalById(item.professionalId)?.name} • {item.specialty}</p></div><Button variant="ghost" size="icon" className="size-8 rounded-lg bg-card" aria-label="Gerenciar" onClick={() => setManage(item)}><MoreVertical /></Button></div>
                <div className="mt-3 flex items-center justify-between border-t border-input/50 pt-3 text-xs"><span className="text-muted-foreground">Convênio: <b className="font-semibold text-foreground">{patientById(item.patientId)?.insurance}</b></span>{item.status !== "Realizada" && <button type="button" onClick={() => { setAppointmentStatus(item.id, "Confirmada", "Check-in realizado na recepção"); toast.success("Check-in realizado"); }} className="flex items-center gap-1 rounded-md bg-strong px-2.5 py-1 font-semibold text-strong-foreground"><LogIn className="size-3.5" />Check-in</button>}</div>
              </article>)}
              {freeRooms > 0 && !items.length && <button type="button" onClick={() => setNewOpen(true)} className="surface flex items-center gap-3 p-4 text-left"><span className="grid size-7 place-items-center rounded-md bg-accent/70"><Plus className="size-4" /></span><span className="min-w-0 flex-1"><b className="block text-[15px] font-semibold leading-5">Horário vago</b><span className="text-[13px] text-muted-foreground">Disponível em {freeRooms} consultório{freeRooms > 1 ? "s" : ""}</span></span><span className="rounded-full bg-success-soft/70 px-2 py-0.5 text-[11px] font-semibold text-success">Livre</span></button>}
            </div>
          </div>;
        }) : <EmptyHint>Nenhum médico atende nesta data.</EmptyHint>}
      </div>
      {nextUp && <div className="mt-6 flex gap-3 rounded-xl bg-soft p-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-strong text-strong-foreground"><BriefcaseMedical className="size-5" /></span><div><p className="text-sm font-bold">Dica de Atendimento</p><p className="text-xs leading-4 text-muted-foreground">Próximo paciente de {professionalById(nextUp.professionalId)?.name}: {patientById(nextUp.patientId)?.name} às {nextUp.time}. {nextUp.reminderSentAt ? "Lembrete já enviado por WhatsApp." : "Lembrete ainda não enviado."}</p></div></div>}
    </div>

    <Modal open={newOpen} title="Agendar consulta" onClose={() => setNewOpen(false)}><AppointmentForm onDone={() => setNewOpen(false)} /></Modal>
    <ManageModal appointment={manage} onClose={() => setManage(null)} />
  </>;
}

export function ConsultasPage() {
  const { appointments, professionals, activeSpecialties, patientById, professionalById } = useClinic();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [professional, setProfessional] = useState("Todos");
  const [specialty, setSpecialty] = useState("Todas");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [mobileCount, setMobileCount] = useState(5);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [manage, setManage] = useState<Appointment | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const list = appointments
    .filter((item) => (status === "Todos" ? true : item.status === status))
    .filter((item) => (professional === "Todos" ? true : item.professionalId === professional))
    .filter((item) => (specialty === "Todas" ? true : item.specialty === specialty))
    .filter((item) => (date ? item.date === date : true))
    .filter((item) => {
      const text = `${patientById(item.patientId)?.name} ${patientById(item.patientId)?.cpf} ${professionalById(item.professionalId)?.name} ${item.specialty}`.toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const pageSize = 5;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(page, pages);
  const visible = list.slice((current - 1) * pageSize, current * pageSize);
  const filtered = date || status !== "Todos" || professional !== "Todos" || specialty !== "Todas";
  const clear = () => { setDate(""); setStatus("Todos"); setProfessional("Todos"); setSpecialty("Todas"); };
  const initials = (name = "") => name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const todayChip = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date()).replace(".", "").replace(" de ", " ").replace(/ (\p{L})/u, (_, c: string) => ` ${c.toUpperCase()}`);
  const filterList = [
    <Field key="date" label="Data" type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} />,
    <SelectField key="pro" label="Médico" value={professional} onChange={(event) => { setProfessional(event.target.value); setPage(1); }} options={[{ value: "Todos", label: "Todos" }, ...professionals.map((item) => ({ value: item.id, label: item.name }))]} />,
    <SelectField key="specialty" label="Especialidade" value={specialty} onChange={(event) => { setSpecialty(event.target.value); setPage(1); }} options={[{ value: "Todas", label: "Todas" }, ...activeSpecialties.map((item) => ({ value: item, label: item }))]} />,
    <SelectField key="status" label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} options={[{ value: "Todos", label: "Todos" }, ...appointmentStatuses.map((item) => ({ value: item, label: item }))]} />,
  ];

  return <>
    <PageHeader eyebrow="Atendimentos" title="Consultas" description="Acompanhe, confirme, remarque ou cancele os agendamentos." mobileDescription="Acompanhe, confirme, remarque ou cancele os agendamentos da recepção." action="Nova consulta" onAction={() => setNewOpen(true)} />

    {/* Filtros desktop */}
    <div className="hidden md:block">
      <SearchInput placeholder="Buscar por paciente, CPF ou médico..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
      <div className="mt-6 grid grid-cols-4 gap-4">{filterList}</div>
    </div>

    {/* Filtros mobile */}
    <div className="surface p-4 md:hidden [&_input]:bg-soft [&_input]:shadow-none [&_input]:ring-0 [&_select]:bg-soft [&_select]:shadow-none [&_select]:ring-0">
      <SearchInput placeholder="Buscar por paciente, CPF ou médico..." value={search} onChange={setSearch} className="[&_input]:h-11" />
      <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="mt-4 flex w-full items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="size-4" />Filtros avançados<span className="size-1.5 rounded-full bg-success" /><ChevronDown className={`ml-auto size-4 transition ${filtersOpen ? "rotate-180" : ""}`} /></button>
      {filtersOpen && <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3">{[filterList[0], filterList[3], filterList[1], filterList[2]]}</div>}
      {filtered && <button type="button" onClick={clear} className="mt-3 text-xs font-semibold text-muted-foreground underline">Limpar filtros</button>}
    </div>

    {/* Lista desktop */}
    <section className="surface mt-6 hidden overflow-hidden md:mt-7 md:block">
      <div className="flex items-center justify-between px-6 py-5"><h2 className="text-lg font-bold uppercase leading-6">Consultas ({list.length})</h2><div className="flex items-center gap-4">{filtered && <button type="button" onClick={clear} className="text-xs font-semibold text-muted-foreground underline">Limpar filtros</button>}<span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-success" />Atualizado há instantes</span></div></div>
      {list.length ? <table className="w-full text-left">
        <thead className="bg-soft text-[11px] font-bold uppercase tracking-[0.55px] text-muted-foreground"><tr><th className="px-6 py-3.5">Horário</th><th className="px-6 py-3.5">Paciente</th><th className="px-6 py-3.5">Médico</th><th className="px-6 py-3.5">Status</th><th className="px-6 py-3.5 text-right">Ações</th></tr></thead>
        <tbody>{visible.map((item) => <tr key={item.id} className="text-sm">
          <td className="px-6 py-4"><b className="block font-bold leading-5">{item.time}</b><span className="text-xs text-muted-foreground">{formatDate(item.date)}</span></td>
          <td className="px-6 py-4"><b className="block font-semibold leading-5">{patientById(item.patientId)?.name}</b><span className="text-xs text-muted-foreground">#{item.code || "…"} • {item.channel === "Recepção" ? "Recepção" : "Paciente"}</span></td>
          <td className="px-6 py-4"><span className="block leading-5">{professionalById(item.professionalId)?.name}</span><span className="text-xs text-muted-foreground">{item.specialty}</span></td>
          <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
          <td className="px-6 py-4 text-right align-top"><Button variant="ghost" size="icon" className="size-8" onClick={() => setManage(item)} aria-label="Gerenciar"><MoreHorizontal /></Button></td>
        </tr>)}</tbody>
      </table> : <div className="px-6 pb-6"><EmptyHint>Nenhuma consulta encontrada com esses filtros.</EmptyHint></div>}
      <div className="flex items-center justify-between bg-soft px-6 py-3 text-xs text-muted-foreground">
        <span>Exibindo {visible.length} de {list.length} atendimentos</span>
        <div className="flex items-center gap-2 text-sm">
          <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded-md bg-card/60 px-3 py-1.5 font-medium text-foreground disabled:text-subtle-foreground">Anterior</button>
          {Array.from({ length: pages }, (_, index) => <button type="button" key={index} onClick={() => setPage(index + 1)} className={`min-w-7 rounded-md px-2 py-1.5 font-bold ${current === index + 1 ? "text-foreground" : "text-muted-foreground"}`}>{index + 1}</button>)}
          <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className="rounded-md bg-card px-3 py-1.5 font-semibold text-foreground shadow-[0_1px_1px_rgb(0_0_0/5%)] disabled:text-subtle-foreground">Próxima</button>
        </div>
      </div>
    </section>

    {/* Lista mobile */}
    <section className="mt-6 md:hidden">
      <div className="mb-3 flex items-center gap-2 px-1"><h2 className="eyebrow">Consultas ({list.length})</h2><span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold">Hoje • {todayChip}</span><span className="ml-auto text-xs text-muted-foreground">Mostrando {Math.min(mobileCount, list.length)} de {list.length}</span></div>
      {list.length ? <div className="grid gap-3">{list.slice(0, mobileCount).map((item) => {
        const patient = patientById(item.patientId);
        return <article key={item.id} className="surface p-4">
          <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold">{initials(patient?.name)}</span><div className="min-w-0 flex-1"><p className="truncate text-base font-semibold leading-5">{patient?.name}</p><p className="text-xs text-muted-foreground">#{item.code || "…"} • {item.channel === "Recepção" ? "Recepção" : "Paciente"}</p></div><Button variant="ghost" size="icon" className="size-8" aria-label="Gerenciar" onClick={() => setManage(item)}><MoreVertical /></Button></div>
          <div className="mt-3 grid gap-2 rounded-lg bg-soft p-3">
            <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-sm"><Clock3 className="size-4" /><b className="font-bold">{item.time}</b><span className="text-xs text-muted-foreground">• {formatDate(item.date)}{item.date === isoDate(0) ? " (Hoje)" : ""}</span></span><span className="scale-90 origin-right"><StatusBadge status={item.status} /></span></div>
            <p className="flex items-center gap-1.5 text-sm"><Stethoscope className="size-4" /><b className="font-semibold">{professionalById(item.professionalId)?.name}</b><span className="text-xs text-muted-foreground">• {item.specialty}</span></p>
          </div>
        </article>;
      })}</div> : <EmptyHint>Nenhuma consulta encontrada com esses filtros.</EmptyHint>}
      {mobileCount < list.length && <button type="button" onClick={() => setMobileCount((count) => count + 5)} className="mt-4 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-accent/70 text-sm font-semibold">Carregar mais consultas<ChevronDown className="size-4" /></button>}
    </section>

    <ManageModal appointment={manage} onClose={() => setManage(null)} />
    <Modal open={newOpen} title="Nova consulta" onClose={() => setNewOpen(false)}><AppointmentForm onDone={() => setNewOpen(false)} /></Modal>
  </>;
}

export function PacientesPage() {
  const { patients, appointments, insurances, activeSpecialties, checkEligibility, professionalById, addPatient, updatePatient } = useClinic();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [historyOf, setHistoryOf] = useState<string | null>(null);
  const [eligibilityOf, setEligibilityOf] = useState<string | null>(null);
  const list = patients.filter((item) => `${item.name} ${item.email} ${item.phone} ${item.cpf} ${item.insurance}`.toLowerCase().includes(search.toLowerCase()));
  const patient = patients.find((item) => item.id === editing) ?? null;
  const historyPatient = patients.find((item) => item.id === historyOf) ?? null;
  const eligibilityPatient = patients.find((item) => item.id === eligibilityOf) ?? null;
  const history = historyPatient ? appointments.filter((item) => item.patientId === historyPatient.id).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)) : [];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      cpf: String(data.get("cpf") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      birthDate: String(data.get("birthDate") ?? ""),
      insurance: String(data.get("insurance") ?? "Particular"),
    };
    if (patient) { updatePatient(patient.id, payload); toast.success("Cadastro atualizado"); setEditing(null); }
    else { addPatient(payload); toast.success("Paciente cadastrado", { description: payload.name }); setFormOpen(false); }
  }

  const [tab, setTab] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
  const [page, setPage] = useState(1);
  const shown = list.filter((item) => tab === "Todos" || item.status === tab);
  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(shown.length / pageSize));
  const current = Math.min(page, pages);
  const visible = shown.slice((current - 1) * pageSize, current * pageSize);
  const count = (status?: "Ativo" | "Inativo") => list.filter((item) => !status || item.status === status).length;

  return <>
    <PageHeader eyebrow="Cadastros" title="Pacientes" description="Pesquise por nome, CPF ou contato e mantenha os cadastros atualizados com conferência de elegibilidade em tempo real." mobileDescription="Pesquise por nome, CPF ou contato e mantenha os cadastros atualizados." action="Novo paciente" onAction={() => setFormOpen(true)} />
    <div className="surface flex items-center gap-3 p-2 pl-0 md:p-2">
      <SearchInput placeholder="Buscar nome, CPF, telefone ou convênio..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} className="flex-1 [&_input]:shadow-none [&_input]:ring-0 md:[&_input]:bg-soft/60" />
      <div className="hidden items-center gap-1 md:flex">{(["Todos", "Ativo", "Inativo"] as const).map((key) => <button type="button" key={key} onClick={() => { setTab(key); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${tab === key ? "bg-strong text-strong-foreground" : "text-foreground hover:bg-soft"}`}>{key === "Todos" ? "Todos" : `${key}s`} ({count(key === "Todos" ? undefined : key)})</button>)}</div>
      <button type="button" aria-label="Filtrar" onClick={() => setTab(tab === "Todos" ? "Ativo" : tab === "Ativo" ? "Inativo" : "Todos")} className="grid size-9 shrink-0 place-items-center rounded-lg md:bg-soft"><SlidersHorizontal className="size-4 md:hidden" /><ListFilter className="hidden size-4 md:block" /></button>
    </div>
    <div className="mt-2 flex items-center justify-between px-1 text-xs text-muted-foreground md:hidden"><span>Exibindo {shown.length} pacientes{tab !== "Todos" ? ` (${tab.toLowerCase()}s)` : ""}</span><span className="flex items-center gap-1 text-success"><span className="size-1.5 rounded-full bg-success" />{count("Ativo")} ativos</span></div>

    {shown.length ? <div className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2 md:gap-6 xl:grid-cols-3">{shown.map((item, position) => {
      const items = appointments.filter((appointment) => appointment.patientId === item.id);
      const last = items.filter((appointment) => appointment.date <= isoDate(0)).sort((a, b) => b.date.localeCompare(a.date))[0];
      const inactive = item.status === "Inativo";
      const offPage = position < (current - 1) * pageSize || position >= current * pageSize;
      return <article key={item.id} className={`surface p-4 md:p-6 ${offPage ? "md:hidden" : ""}`}>
        <div className="flex items-start gap-3 md:block">
          <div className="flex items-start justify-between md:mb-4"><span className="grid size-12 place-items-center rounded-full bg-accent text-base font-bold">{item.initials}</span><span className="hidden md:inline-flex"><StatusBadge status={item.status} /></span></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2"><h2 className="truncate text-lg font-semibold leading-6 md:text-xl md:font-medium">{item.name}</h2><span className="scale-90 origin-right md:hidden"><StatusBadge status={item.status} /></span></div>
            <p className="text-[13px] text-muted-foreground md:mt-1 md:text-[15px] md:text-foreground"><span className="md:hidden">CPF: </span>{item.cpf}</p>
            <p className="hidden text-[15px] md:block">{item.phone}</p>
            <p className="mt-0.5 hidden text-sm font-semibold md:block"><span className="text-muted-foreground">Convênio:</span> {item.insurance}</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-soft p-3 md:mt-4 md:flex md:items-center md:justify-between md:px-3 md:py-4">
          <div className="mb-1.5 flex items-center justify-between text-xs md:hidden"><span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="size-3.5" />{item.phone}</span><span className="font-medium">{item.insurance}</span></div>
          <div className="flex w-full items-center justify-between"><span className="text-xs text-muted-foreground">Última consulta</span><b className={`text-[15px] ${inactive ? "font-medium" : "font-bold"}`}>{last ? formatDate(last.date) : "—"}</b></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:mt-7">
          <Button variant="ghost" onClick={() => setHistoryOf(item.id)} className="h-9 rounded-lg bg-card font-semibold shadow-[0_1px_2px_rgb(0_0_0/5%)] md:bg-soft md:shadow-none"><History />Histórico ({items.length})</Button>
          <Button variant="ghost" onClick={() => setEligibilityOf(item.id)} className="h-9 rounded-lg bg-card font-semibold shadow-[0_1px_2px_rgb(0_0_0/5%)] md:bg-soft md:font-medium md:shadow-none"><ShieldCheck />Verificar</Button>
          <Button variant="ghost" onClick={() => { if (inactive) { updatePatient(item.id, { status: "Ativo" }); toast.success("Cadastro reativado"); } else setEditing(item.id); }} className="col-span-2 h-9 rounded-lg bg-accent/60 font-semibold md:bg-soft"><Pencil className="md:hidden" />{inactive ? <><span className="md:hidden">Reativar / Editar</span><span className="hidden md:inline">Reativar cadastro</span></> : "Editar cadastro"}</Button>
        </div>
      </article>;
    })}</div> : <div className="mt-6"><EmptyHint>Nenhum paciente encontrado.</EmptyHint></div>}

    <div className="mt-8 hidden items-center justify-between px-2 text-xs text-muted-foreground md:flex">
      <span>Mostrando <b className="text-foreground">{visible.length}</b> de <b className="text-foreground">{shown.length}</b> pacientes cadastrados</span>
      <div className="flex items-center gap-2 text-sm">
        <button type="button" aria-label="Página anterior" disabled={current === 1} onClick={() => setPage(current - 1)} className="grid size-8 place-items-center rounded-md bg-card text-foreground disabled:text-input"><ChevronLeft className="size-4" /></button>
        {Array.from({ length: pages }, (_, index) => <button type="button" key={index} onClick={() => setPage(index + 1)} className={`grid size-8 place-items-center rounded-md font-semibold ${current === index + 1 ? "bg-strong text-strong-foreground" : "bg-card text-foreground"}`}>{index + 1}</button>)}
        <button type="button" aria-label="Próxima página" disabled={current === pages} onClick={() => setPage(current + 1)} className="grid size-8 place-items-center rounded-md bg-card text-foreground disabled:text-input"><ChevronRight className="size-4" /></button>
      </div>
    </div>

    <Modal open={formOpen || Boolean(patient)} title={patient ? "Editar paciente" : "Novo paciente"} onClose={() => { setFormOpen(false); setEditing(null); }}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Nome completo" name="name" required defaultValue={patient?.name ?? ""} />
        <Field label="CPF" name="cpf" required defaultValue={patient?.cpf ?? ""} placeholder="000.000.000-00" />
        <Field label="Telefone" name="phone" required defaultValue={patient?.phone ?? ""} placeholder="(00) 00000-0000" />
        <Field label="E-mail" name="email" type="email" required defaultValue={patient?.email ?? ""} />
        <Field label="Data de nascimento" name="birthDate" type="date" required defaultValue={patient?.birthDate ?? ""} />
        <SelectField label="Convênio" name="insurance" defaultValue={patient?.insurance ?? "Particular"} options={insurances.map((item) => ({ value: item.name, label: item.name }))} />
        <div className="sm:col-span-2"><Button type="submit">{patient ? "Salvar alterações" : "Cadastrar paciente"}</Button></div>
      </form>
    </Modal>

    <Modal open={Boolean(historyPatient)} title="Histórico do paciente" description={historyPatient ? `${historyPatient.name} · ${historyPatient.cpf}` : ""} onClose={() => setHistoryOf(null)}>
      {history.length ? <div className="divide-y divide-border">{history.map((item) => <div key={item.id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><b className="text-sm">{formatDate(item.date)} às {item.time}</b><p className="text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {item.specialty} · {item.channel}</p></div><StatusBadge status={item.status} /></div>)}</div> : <EmptyHint>Esse paciente ainda não possui consultas.</EmptyHint>}
    </Modal>

    <Modal open={Boolean(eligibilityPatient)} title="Elegibilidade e convênio" description={eligibilityPatient ? `${eligibilityPatient.name} · ${eligibilityPatient.insurance}` : ""} onClose={() => setEligibilityOf(null)}>
      <div className="space-y-2">
        {eligibilityPatient && activeSpecialties.map((name) => {
          const result = checkEligibility(eligibilityPatient.id, name);
          return <div key={name} className={`grid gap-1 rounded-md border p-3 text-xs sm:text-sm ${result.ok ? "border-success/40 bg-success-soft" : "border-warning/40 bg-warning-soft"}`}>
            <b>{name}</b>
            <span className="text-muted-foreground">{result.ok ? "Elegível" : "Não elegível"} · {result.reason}</span>
          </div>;
        })}
      </div>
    </Modal>
  </>;
}

export function WaitlistPage() {
  const { waitlist, patients, activeSpecialties, patientById, addToWaitlist, inviteFromWaitlist, removeFromWaitlist } = useClinic();
  const [open, setOpen] = useState(false);
  const queue = waitlist;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addToWaitlist({
      patientId: String(data.get("patientId") ?? ""),
      specialty: String(data.get("specialty") ?? ""),
      preference: String(data.get("preference") ?? ""),
      priority: String(data.get("priority") ?? "Normal") as "Alta" | "Normal",
    });
    toast.success("Paciente adicionado à fila");
    setOpen(false);
  }

  const waiting = queue.filter((item) => item.status === "Aguardando").length;
  const invited = queue.filter((item) => item.status === "Convidado").length;
  const ordered = [...queue].sort((x, y) => (x.priority === y.priority ? x.createdAt.localeCompare(y.createdAt) : x.priority === "Alta" ? -1 : 1));
  const pill = (label: string, tone: "danger" | "muted" | "info") => <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${tone === "danger" ? "bg-destructive-soft text-destructive" : tone === "info" ? "bg-accent text-accent-foreground" : "bg-accent/60 text-foreground md:bg-soft"}`}><span className={`size-1.5 rounded-full ${tone === "danger" ? "bg-destructive" : tone === "info" ? "bg-ring/50" : "bg-subtle-foreground"}`} />{label}</span>;
  const offer = (id: string) => { inviteFromWaitlist(id); toast.success("Convite enviado", { description: "O paciente recebeu a oferta do horário liberado." }); };
  const remove = (id: string) => { removeFromWaitlist(id); toast.success("Paciente removido da fila"); };
  const stats = [
    { label: "Na fila", short: "Na fila", value: waiting, detail: "Aguardando horário", shortDetail: "Aguardando", icon: <UsersRound /> },
    { label: "Convites enviados", short: "Convites", value: invited, detail: "Esperando resposta", shortDetail: "Esperando", icon: <MailCheck /> },
    { label: "Total na lista", short: "Total lista", value: queue.length, detail: "Pacientes registrados", shortDetail: "Registrados", icon: <Clock3 /> },
  ];

  return <>
    <header className="mb-6 flex flex-col gap-4 md:mb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-1 hidden text-[11px] font-bold uppercase leading-4 tracking-[1.1px] text-muted-foreground md:block">Otimização da agenda</p>
        <h1 className="text-[26px] font-bold leading-8 tracking-[-0.8px] md:text-[32px] md:leading-10">Fila de espera</h1>
        <p className="mt-2 text-sm leading-5 text-muted-foreground md:mt-0.5">Preencha horários liberados com rapidez e reduza a ociosidade<span className="md:hidden"> da clínica</span>.</p>
      </div>
      <Button onClick={() => setOpen(true)} className="h-11 w-full rounded-xl text-[15px] font-semibold md:h-10 md:w-auto md:rounded-lg md:px-5 md:text-sm"><Plus />Adicionar à fila</Button>
    </header>

    <div className="grid grid-cols-3 gap-2 md:gap-5">
      {stats.map((stat) => <article key={stat.label} className="surface p-3 md:flex md:gap-4 md:p-5">
        <div className="flex items-center justify-between md:block"><span className="text-foreground md:grid md:size-12 md:place-items-center md:rounded-xl md:bg-soft [&>svg]:size-4 md:[&>svg]:size-6">{stat.icon}</span><span className="text-[11px] md:hidden">{stat.short}</span></div>
        <div><p className="hidden text-sm font-medium md:block">{stat.label}</p><p className="mt-1 text-xl font-bold md:mt-0 md:text-[32px] md:leading-10">{stat.value}</p><p className="text-xs text-muted-foreground md:hidden">{stat.shortDetail}</p><p className="hidden text-xs md:block">{stat.detail}</p></div>
      </article>)}
    </div>

    <section className="mt-4 md:surface md:mt-6 md:p-6">
      <div className="flex items-center justify-between px-1 pb-3 md:px-0 md:pb-4"><h2 className="eyebrow">Pacientes aguardando<span className="md:hidden"> ({queue.length})</span></h2><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-success-soft md:bg-success" /><span className="md:hidden">Tempo real</span><span className="hidden md:inline">Atualizado em tempo real</span></span></div>
      {ordered.length ? <div className="grid gap-3 md:gap-4">{ordered.map((item, index) => {
        const name = patientById(item.patientId)?.name ?? "Paciente";
        const invitedItem = item.status === "Convidado";
        const priorityPill = item.priority === "Alta" ? pill("Alta", "danger") : pill("Normal", "muted");
        const statusPill = pill(item.status, "info");
        return <article key={item.id}>
          <div className="hidden items-center gap-4 rounded-lg bg-soft px-5 py-4 shadow-[0_1px_2px_rgb(0_0_0/5%)] md:flex">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-avatar text-base font-semibold text-white">{index + 1}</span>
            <div className="min-w-0 flex-1"><p className="flex flex-wrap items-center gap-2 text-base font-semibold">{name}{priorityPill}{statusPill}</p><p className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">{item.specialty}<span className="size-1 rounded-full bg-input" />{item.preference}<span className="size-1 rounded-full bg-input" />desde {formatDate(item.createdAt)}</p></div>
            <Button disabled={invitedItem} onClick={() => offer(item.id)} className="h-9 rounded-lg px-4 text-sm font-semibold">{invitedItem ? <><Check />Convite enviado</> : <><Phone />Oferecer horário</>}</Button>
            <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Remover"><X /></Button>
          </div>
          <div className="surface p-4 md:hidden">
            <div className="flex gap-3">
              <span className="mt-4 grid size-8 shrink-0 place-items-center rounded-full bg-avatar text-sm font-semibold text-white">{index + 1}</span>
              <div className="min-w-0 flex-1"><p className="flex flex-wrap items-center gap-2 text-base font-semibold">{name}{item.priority === "Alta" ? priorityPill : pill("Normal", "info")}</p><div className="mt-1">{statusPill}</div><p className="mt-1 text-xs text-muted-foreground">{item.specialty} • {item.preference} • desde {formatDate(item.createdAt)}</p></div>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => remove(item.id)} aria-label="Remover"><X /></Button>
            </div>
            <div className="mt-3 flex gap-2"><Button disabled={invitedItem} onClick={() => offer(item.id)} className="h-10 flex-1 rounded-lg text-[15px] font-semibold">{invitedItem ? <><Check />Convite enviado</> : <><Phone />Oferecer horário</>}</Button><Button variant="ghost" size="icon" className="h-10 w-9 rounded-lg bg-soft" aria-label="Mais opções"><MoreHorizontal /></Button></div>
          </div>
        </article>;
      })}</div> : <EmptyHint>A fila de espera está vazia.</EmptyHint>}
      <div className="mt-8 hidden items-center justify-between text-xs text-muted-foreground md:flex"><span className="flex items-center gap-1.5 text-[13px]"><ShieldCheck className="size-4 text-success" />Critério de ordenação inteligente: Prioridade Clínica e Data de Solicitação.</span><span>Mostrando {ordered.length} de {queue.length} pacientes</span></div>
    </section>
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-accent/70 p-4 md:hidden"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-card"><Lightbulb className="size-5" /></span><div><p className="text-sm font-bold">Dica de Recepcionista</p><p className="text-xs leading-4 text-muted-foreground">Pacientes com status "Alta" têm desistências prioritárias na especialidade.</p></div></div>
    <Modal open={open} title="Adicionar à fila" onClose={() => setOpen(false)}>
      <form className="grid gap-4" onSubmit={submit}>
        <SelectField label="Paciente" name="patientId" options={patients.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Especialidade" name="specialty" options={activeSpecialties.map((item) => ({ value: item, label: item }))} />
        <SelectField label="Preferência" name="preference" options={["Manhã", "Tarde", "Qualquer horário"].map((item) => ({ value: item, label: item }))} />
        <SelectField label="Prioridade" name="priority" options={["Normal", "Alta"].map((item) => ({ value: item, label: item }))} />
        <Button type="submit">Adicionar</Button>
      </form>
    </Modal>
  </>;
}

export function ProfessionalsPage() {
  const { professionals, appointments, blocks, patientById } = useClinic();
  const [date, setDate] = useState(isoDate(0));

  return <>
    <PageHeader eyebrow="Equipe clínica" title="Médicos" description="Consulte especialidades, disponibilidade e a agenda diária de cada médico." />
    <div className="mb-4 grid gap-3 sm:max-w-xs"><Field label="Agenda do dia" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div>
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{professionals.map((professional) => {
      const dayItems = appointments.filter((item) => item.professionalId === professional.id && item.date === date && item.status !== "Cancelada").sort((a, b) => a.time.localeCompare(b.time));
      const dayBlocks = blocks.filter((item) => item.professionalId === professional.id && item.startDate <= date && item.endDate >= date);
      const weekday = new Date(`${date}T12:00:00`).getDay();
      const shift = professional.availability[weekday];
      return <article key={professional.id} className="surface overflow-hidden">
        <div className={`h-1.5 ${professional.color}`} />
        <div className="p-4">
          <div className="flex gap-3"><span className="avatar">{professional.initials}</span><div className="min-w-0"><h2 className="truncate font-semibold">{professional.name}</h2><p className="text-sm text-muted-foreground">{professional.specialty}</p><p className="mt-1 text-xs text-muted-foreground">{professional.crm}</p></div></div>
          <p className="mt-4 text-xs text-muted-foreground">{shift?.active ? `Atende das ${shift.start} às ${shift.end}` : "Não atende nesta data"}</p>
          {dayBlocks.map((block) => <p key={block.id} className="mt-1 text-xs text-warning-strong">Bloqueio {block.startTime}–{block.endTime} · {block.reason}</p>)}
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {dayItems.length ? dayItems.map((item) => <div key={item.id} className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-2 text-xs"><b className="text-primary">{item.time}</b><span className="truncate">{patientById(item.patientId)?.name}</span><StatusBadge status={item.status} /></div>) : <p className="text-xs text-muted-foreground">Nenhuma consulta nesta data.</p>}
          </div>
          <div className="mt-4"><StatusBadge status={professional.active ? "Ativo" : "Inativo"} /></div>
        </div>
      </article>;
    })}</div>
  </>;
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
}

function firstName(name = "") {
  return name.trim().split(/\s+/)[0] ?? "";
}

export function ProfilePage() {
  const { settings, updateSettings, session, updateMyAccount } = useClinic();
  const [reminders, setReminders] = useState(true);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await updateMyAccount({ name: String(data.get("name") ?? ""), phone: String(data.get("phone") ?? "") });
      toast.success("Perfil atualizado", { description: "Suas alterações foram salvas." });
    } catch (error) {
      toast.error("Não foi possível salvar", { description: (error as Error).message });
    }
  }

  return <>
    <PageHeader eyebrow="Preferências" title="Perfil e configurações" description="Atualize seus dados e as preferências de confirmação da recepção." />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Section title="Dados do perfil">
        <form key={session?.name} className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
          <Field label="Nome completo" name="name" defaultValue={session?.name} required />
          <Field label="E-mail" defaultValue={session?.email} disabled />
          <Field label="Telefone" name="phone" defaultValue={session?.phone} />
          <Field label="Perfil de acesso" defaultValue="Recepção / Equipe de marcação" disabled />
          <TextareaField label="Observações internas" className="sm:col-span-2" placeholder="Anotações da recepção" />
          <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
        </form>
      </Section>
      <Section title="Confirmações">
        <div className="space-y-4">
          <Toggle label="Lembretes de confirmação" description="Avisos enviados antes de cada consulta" checked={reminders} onChange={(value) => { setReminders(value); toast.success(value ? "Lembretes ativados" : "Lembretes desativados"); }} />
          <Toggle label="Confirmação automática" description="Consultas já criadas como confirmadas" checked={settings.autoConfirm} onChange={(value) => { updateSettings({ autoConfirm: value }); toast.success(value ? "Confirmação automática ativada" : "Confirmação automática desativada"); }} />
          <SelectField label="Antecedência do lembrete" value={String(settings.reminderHours)} onChange={(event) => { updateSettings({ reminderHours: Number(event.target.value) }); toast.success("Antecedência atualizada"); }} options={[{ value: "12", label: "12 horas" }, { value: "24", label: "24 horas" }, { value: "48", label: "48 horas" }]} />
        </div>
      </Section>
    </div>
  </>;
}
