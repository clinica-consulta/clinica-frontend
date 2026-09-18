import { useMemo, useState } from "react";
import { Activity, CalendarCheck, CalendarClock, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, Clock3, MessageSquareText, MoreHorizontal, Phone, Send, Stethoscope, UserCheck, Users, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, Modal, PageHeader, Section, SelectField, StatCard, StatusBadge, TextareaField, Toggle, Toolbar } from "@/components/page-kit";
import { AppointmentForm } from "@/components/appointment-form";
import { formatDate, isoDate, relativeDay, slotRange, specialties, weekdays, type Appointment } from "@/lib/clinic-data";
import { useClinic, useReports } from "@/lib/clinic-store";

function useAppointmentActions() {
  const { setAppointmentStatus, sendReminder, patientById } = useClinic();
  return {
    confirm: (item: Appointment) => { setAppointmentStatus(item.id, "Confirmada"); toast.success("Consulta confirmada", { description: `${patientById(item.patientId)?.name} · ${item.time}` }); },
    checkIn: (item: Appointment) => { setAppointmentStatus(item.id, "Aguardando"); toast.success("Check-in realizado", { description: `${patientById(item.patientId)?.name} está aguardando atendimento.` }); },
    start: (item: Appointment) => { setAppointmentStatus(item.id, "Em atendimento"); toast.success("Atendimento iniciado"); },
    complete: (item: Appointment) => { setAppointmentStatus(item.id, "Concluída"); toast.success("Atendimento concluído"); },
    noShow: (item: Appointment) => { setAppointmentStatus(item.id, "Falta"); toast.warning("Falta registrada"); },
    cancel: (item: Appointment) => { setAppointmentStatus(item.id, "Cancelada"); toast.warning("Consulta cancelada", { description: `${patientById(item.patientId)?.name} · ${formatDate(item.date)}` }); },
    remind: (item: Appointment) => { sendReminder(item.id); toast.success("Lembrete enviado", { description: `${patientById(item.patientId)?.name} recebeu o aviso de confirmação.` }); },
  };
}

export function RescheduleModal({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const { availableSlots, rescheduleAppointment } = useClinic();
  const [date, setDate] = useState(appointment?.date ?? isoDate(1));
  const [time, setTime] = useState("");
  const slots = appointment ? availableSlots(appointment.professionalId, date, appointment.id) : [];
  const chosen = slots.includes(time) ? time : slots[0] ?? "";

  return (
    <Modal open={Boolean(appointment)} title="Reagendar consulta" description="Escolha uma nova data e um horário livre." onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Nova data" type="date" value={date} min={isoDate(0)} onChange={(event) => setDate(event.target.value)} />
        {slots.length ? <SelectField label="Novo horário" value={chosen} onChange={(event) => setTime(event.target.value)} options={slots.map((item) => ({ value: item, label: item }))} /> : <EmptyHint>Sem horários livres nessa data.</EmptyHint>}
        <Button disabled={!slots.length} onClick={() => {
          if (!appointment) return;
          const done = rescheduleAppointment(appointment.id, date, chosen);
          toast[done ? "success" : "error"](done ? "Consulta reagendada" : "Horário indisponível", done ? { description: `${formatDate(date)} às ${chosen}.` } : undefined);
          if (done) onClose();
        }}>Salvar novo horário</Button>
      </div>
    </Modal>
  );
}

function ManageModal({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
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
          <Button variant="outline" onClick={() => { actions.checkIn(appointment); onClose(); }}><UserCheck />Registrar check-in</Button>
          <Button variant="outline" onClick={() => setReschedule(appointment)}><CalendarClock />Reagendar</Button>
          <Button variant="outline" onClick={() => { actions.complete(appointment); onClose(); }}><CheckCircle2 />Concluir</Button>
          <Button variant="outline" onClick={() => { actions.noShow(appointment); onClose(); }}><CircleAlert />Registrar falta</Button>
          <Button variant="outline" className="sm:col-span-2" onClick={() => { actions.cancel(appointment); onClose(); }}><X />Cancelar consulta</Button>
        </div>
        {appointment.preForm && <div className="mt-4 rounded-md bg-muted/60 p-4 text-sm"><b className="block">Pré-atendimento</b><p className="mt-1 text-muted-foreground">Motivo: {appointment.preForm.reason || "—"}</p><p className="text-muted-foreground">Medicamentos: {appointment.preForm.medications || "—"}</p><p className="text-muted-foreground">Alergias: {appointment.preForm.allergies || "—"}</p></div>}
      </Modal>
      <RescheduleModal appointment={reschedule} onClose={() => { setReschedule(null); onClose(); }} />
    </>
  );
}

export function DashboardPage() {
  const { appointments, waitlist, sendAllReminders, patientById, professionalById } = useClinic();
  const reports = useReports();
  const [newOpen, setNewOpen] = useState(false);
  const today = appointments.filter((item) => item.date === isoDate(0));
  const confirmed = today.filter((item) => item.status === "Confirmada").length;
  const pending = appointments.filter((item) => item.status === "Pendente" && item.date >= isoDate(0));
  const waiting = today.filter((item) => item.status === "Aguardando" || item.status === "Em atendimento");
  const next = today.filter((item) => !["Cancelada", "Concluída", "Falta"].includes(item.status)).sort((a, b) => a.time.localeCompare(b.time));

  return <>
    <PageHeader eyebrow="Visão geral" title="Bom dia, Rafaela" description="Acompanhe o movimento da clínica e o que precisa da sua atenção hoje." action="Nova consulta" onAction={() => setNewOpen(true)} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Consultas hoje" value={String(today.length)} detail={`${confirmed} confirmadas`} icon={<CalendarCheck />} />
      <StatCard label="Aguardando confirmação" value={String(pending.length)} detail="Enviar lembretes" icon={<MessageSquareText />} tone="warning" />
      <StatCard label="Check-ins realizados" value={String(waiting.length)} detail={`${today.filter((item) => item.status === "Em atendimento").length} em atendimento`} icon={<UserCheck />} tone="success" />
      <StatCard label="Taxa de presença" value={`${reports.attendance}%`} detail="Histórico da clínica" icon={<Activity />} tone="info" />
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
      <Section title="Próximas consultas">
        {next.length ? <div className="divide-y divide-border">{next.slice(0, 5).map((item) => <div key={item.id} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 py-3"><span className="text-sm font-bold text-primary">{item.time}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{patientById(item.patientId)?.name}</p><p className="truncate text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {item.specialty}</p></div><StatusBadge status={item.status} /></div>)}</div> : <EmptyHint>Nenhuma consulta para hoje.</EmptyHint>}
      </Section>
      <div className="space-y-6">
        <Section title="Atenção necessária">
          <div className="space-y-3">
            <div className="flex gap-3 rounded-md bg-muted/60 p-3"><span className="metric-icon metric-warning size-9"><CircleAlert /></span><div className="min-w-0"><p className="text-sm font-semibold">{pending.length} confirmações pendentes</p><p className="text-xs text-muted-foreground">Consultas sem resposta do paciente</p>{pending.length > 0 && <Button size="sm" variant="outline" className="mt-2" onClick={() => { const sent = sendAllReminders(); toast[sent ? "success" : "info"](sent ? `${sent} lembrete(s) enviado(s)` : "Todos os lembretes já foram enviados"); }}><Send />Enviar lembretes</Button>}</div></div>
            <div className="flex gap-3 rounded-md bg-muted/60 p-3"><span className="metric-icon metric-info size-9"><Users /></span><div><p className="text-sm font-semibold">{waitlist.filter((item) => item.status === "Aguardando").length} pessoas na fila</p><p className="text-xs text-muted-foreground">Ofereça horários liberados</p></div></div>
            <div className="flex gap-3 rounded-md bg-muted/60 p-3"><span className="metric-icon metric-primary size-9"><Clock3 /></span><div><p className="text-sm font-semibold">{waiting.length} na sala de espera</p><p className="text-xs text-muted-foreground">Pacientes com check-in feito</p></div></div>
          </div>
        </Section>
        <Section title="Consultas por dia">
          <div className="space-y-4">{reports.perDay.map((day) => <div key={day.date} className="grid grid-cols-[52px_1fr_28px] items-center gap-3 text-xs"><span className="font-medium">{formatDate(day.date).slice(0, 5)}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, day.total * 25)}%` }} /></div><span className="text-right text-muted-foreground">{day.total}</span></div>)}</div>
        </Section>
      </div>
    </div>
    <Modal open={newOpen} title="Nova consulta" description="Agende um atendimento para um paciente." onClose={() => setNewOpen(false)}><AppointmentForm onDone={() => setNewOpen(false)} /></Modal>
  </>;
}

export function AgendaPage() {
  const { appointments, professionals, patientById } = useClinic();
  const [date, setDate] = useState(isoDate(0));
  const [newOpen, setNewOpen] = useState(false);
  const [manage, setManage] = useState<Appointment | null>(null);
  const active = professionals.filter((item) => item.active);
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const hours = useMemo(() => {
    const all = new Set<string>();
    active.forEach((professional) => {
      const day = professional.availability[weekday];
      if (day?.active) slotRange(day.start, day.end).forEach((slot) => all.add(slot));
    });
    return [...all].sort();
  }, [active, weekday]);

  function shift(days: number) {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + days);
    setDate(next.toISOString().slice(0, 10));
  }

  return <>
    <PageHeader eyebrow="Organização diária" title="Agenda" description="Visualize horários e disponibilidade dos profissionais." action="Agendar consulta" onAction={() => setNewOpen(true)} />
    <div className="surface overflow-hidden">
      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[auto_1fr_auto]">
        <div className="flex gap-1"><Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Dia anterior"><ChevronLeft /></Button><Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Próximo dia"><ChevronRight /></Button></div>
        <p className="self-center text-center font-semibold">{formatDate(date)} · {relativeDay(date)}</p>
        <Button variant="outline" onClick={() => setDate(isoDate(0))}>Hoje</Button>
      </div>
      {hours.length ? (
        <div className="overflow-x-auto"><div className="grid min-w-[760px]" style={{ gridTemplateColumns: `72px repeat(${active.length}, minmax(200px,1fr))` }}>
          <div className="agenda-head" />
          {active.map((professional) => <div className="agenda-head" key={professional.id}><p className="text-sm font-semibold">{professional.name}</p><p className="text-xs text-muted-foreground">{professional.specialty}</p></div>)}
          {hours.flatMap((hour) => [
            <div key={`${hour}-t`} className="agenda-time">{hour}</div>,
            ...active.map((professional) => {
              const item = appointments.find((appointment) => appointment.professionalId === professional.id && appointment.date === date && appointment.time === hour && appointment.status !== "Cancelada");
              return <div key={`${hour}-${professional.id}`} className="agenda-cell">{item && <button className="appointment-block" onClick={() => setManage(item)}><b>{patientById(item.patientId)?.name}</b><span>{item.status}</span></button>}</div>;
            }),
          ])}
        </div></div>
      ) : <div className="p-5"><EmptyHint>Nenhum profissional atende nesta data.</EmptyHint></div>}
    </div>
    <Modal open={newOpen} title="Agendar consulta" onClose={() => setNewOpen(false)}><AppointmentForm onDone={() => setNewOpen(false)} /></Modal>
    <ManageModal appointment={manage} onClose={() => setManage(null)} />
  </>;
}

export function ConsultasPage() {
  const { appointments, patientById, professionalById } = useClinic();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [manage, setManage] = useState<Appointment | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const list = appointments
    .filter((item) => (status === "Todos" ? true : item.status === status))
    .filter((item) => {
      const text = `${patientById(item.patientId)?.name} ${professionalById(item.professionalId)?.name} ${item.specialty}`.toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  return <>
    <PageHeader eyebrow="Atendimentos" title="Consultas" description="Acompanhe, confirme, reagende ou cancele os atendimentos." action="Nova consulta" onAction={() => setNewOpen(true)} />
    <Toolbar placeholder="Buscar por paciente ou profissional..." value={search} onChange={setSearch} filter={<SelectField label="" aria-label="Filtrar status" value={status} onChange={(event) => setStatus(event.target.value)} options={["Todos", "Pendente", "Confirmada", "Aguardando", "Em atendimento", "Concluída", "Cancelada", "Falta"].map((item) => ({ value: item, label: item }))} />} />
    <Section title={`Consultas (${list.length})`}>
      {list.length ? <>
        <div className="hidden overflow-x-auto md:block"><table className="data-table"><thead><tr><th>Horário</th><th>Paciente</th><th>Profissional</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{list.map((item) => <tr key={item.id}><td><b>{item.time}</b><small>{formatDate(item.date)}</small></td><td>{patientById(item.patientId)?.name}<small>#{item.id}</small></td><td>{professionalById(item.professionalId)?.name}<small>{item.specialty}</small></td><td><StatusBadge status={item.status} /></td><td><Button variant="ghost" size="icon" onClick={() => setManage(item)} aria-label="Gerenciar"><MoreHorizontal /></Button></td></tr>)}</tbody></table></div>
        <div className="space-y-3 md:hidden">{list.map((item) => <article key={item.id} className="rounded-md border border-border p-4"><div className="flex justify-between gap-2"><b>{item.time} · {patientById(item.patientId)?.name}</b><StatusBadge status={item.status} /></div><p className="mt-2 text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {formatDate(item.date)}</p><Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setManage(item)}>Gerenciar</Button></article>)}</div>
      </> : <EmptyHint>Nenhuma consulta encontrada com esses filtros.</EmptyHint>}
    </Section>
    <ManageModal appointment={manage} onClose={() => setManage(null)} />
    <Modal open={newOpen} title="Nova consulta" onClose={() => setNewOpen(false)}><AppointmentForm onDone={() => setNewOpen(false)} /></Modal>
  </>;
}

export function PacientesPage() {
  const { patients, appointments, addPatient, updatePatient, togglePatientStatus } = useClinic();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const list = patients.filter((item) => `${item.name} ${item.email} ${item.phone} ${item.cpf}`.toLowerCase().includes(search.toLowerCase()));
  const patient = patients.find((item) => item.id === editing) ?? null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      cpf: String(data.get("cpf") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      birthDate: String(data.get("birthDate") ?? ""),
    };
    if (patient) { updatePatient(patient.id, payload); toast.success("Cadastro atualizado"); setEditing(null); }
    else { addPatient(payload); toast.success("Paciente cadastrado", { description: payload.name }); setFormOpen(false); }
  }

  return <>
    <PageHeader eyebrow="Cadastros" title="Pacientes" description="Encontre informações e mantenha os cadastros organizados." action="Novo paciente" onAction={() => setFormOpen(true)} />
    <Toolbar placeholder="Buscar nome, telefone ou e-mail..." value={search} onChange={setSearch} />
    {list.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((item) => {
      const history = appointments.filter((appointment) => appointment.patientId === item.id);
      const last = history.filter((appointment) => appointment.date <= isoDate(0)).sort((a, b) => b.date.localeCompare(a.date))[0];
      return <article key={item.id} className="surface p-5">
        <div className="flex items-start justify-between"><span className="avatar">{item.initials}</span><StatusBadge status={item.status} /></div>
        <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{item.email}</p>
        <p className="text-sm text-muted-foreground">{item.phone}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs"><span className="text-muted-foreground">Última consulta</span><b>{last ? formatDate(last.date) : "—"}</b></div>
        <div className="mt-4 grid gap-2"><Button variant="outline" onClick={() => setEditing(item.id)}>Editar cadastro</Button><Button variant="ghost" onClick={() => { togglePatientStatus(item.id); toast.success(item.status === "Ativo" ? "Paciente inativado" : "Paciente reativado"); }}>{item.status === "Ativo" ? "Inativar" : "Reativar"}</Button></div>
      </article>;
    })}</div> : <EmptyHint>Nenhum paciente encontrado.</EmptyHint>}
    <Modal open={formOpen || Boolean(patient)} title={patient ? "Editar paciente" : "Novo paciente"} onClose={() => { setFormOpen(false); setEditing(null); }}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Nome completo" name="name" required defaultValue={patient?.name ?? ""} />
        <Field label="CPF" name="cpf" required defaultValue={patient?.cpf ?? ""} placeholder="000.000.000-00" />
        <Field label="Telefone" name="phone" required defaultValue={patient?.phone ?? ""} placeholder="(00) 00000-0000" />
        <Field label="E-mail" name="email" type="email" required defaultValue={patient?.email ?? ""} />
        <Field label="Data de nascimento" name="birthDate" type="date" required defaultValue={patient?.birthDate ?? ""} />
        <div className="sm:col-span-2"><Button type="submit">{patient ? "Salvar alterações" : "Cadastrar paciente"}</Button></div>
      </form>
    </Modal>
  </>;
}

export function WaitlistPage() {
  const { waitlist, patients, patientById, addToWaitlist, inviteFromWaitlist, removeFromWaitlist } = useClinic();
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

  return <>
    <PageHeader eyebrow="Otimização da agenda" title="Fila de espera" description="Preencha horários liberados com rapidez e reduza a ociosidade." action="Adicionar à fila" onAction={() => setOpen(true)} />
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <StatCard label="Na fila" value={String(queue.filter((item) => item.status === "Aguardando").length)} detail="Aguardando horário" icon={<UsersRound />} />
      <StatCard label="Convites enviados" value={String(queue.filter((item) => item.status === "Convidado").length)} detail="Esperando resposta" icon={<CalendarClock />} tone="warning" />
      <StatCard label="Total na lista" value={String(queue.length)} detail="Pacientes registrados" icon={<CheckCircle2 />} tone="success" />
    </div>
    <Section title="Pacientes aguardando">
      {queue.length ? <div className="space-y-3">{queue.map((item, index) => <article key={item.id} className="grid gap-4 rounded-md border border-border p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><b>{patientById(item.patientId)?.name ?? "Paciente"}</b><StatusBadge status={item.priority} /><StatusBadge status={item.status} /></div><p className="text-xs text-muted-foreground">{item.specialty} · {item.preference} · desde {formatDate(item.createdAt)}</p></div>
        <div className="flex flex-wrap gap-2"><Button disabled={item.status === "Convidado"} onClick={() => inviteFromWaitlist(item.id)}>{item.status === "Convidado" ? <><Check />Enviado</> : <><Phone />Oferecer horário</>}</Button><Button variant="ghost" onClick={() => { removeFromWaitlist(item.id); toast.success("Paciente removido da fila"); }} aria-label="Remover"><X /></Button></div>
      </article>)}</div> : <EmptyHint>A fila de espera está vazia.</EmptyHint>}
    </Section>
    <Modal open={open} title="Adicionar à fila" onClose={() => setOpen(false)}>
      <form className="grid gap-4" onSubmit={submit}>
        <SelectField label="Paciente" name="patientId" options={patients.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Especialidade" name="specialty" options={specialties.map((item) => ({ value: item, label: item }))} />
        <SelectField label="Preferência" name="preference" options={["Manhã", "Tarde", "Qualquer horário"].map((item) => ({ value: item, label: item }))} />
        <SelectField label="Prioridade" name="priority" options={["Normal", "Alta"].map((item) => ({ value: item, label: item }))} />
        <Button type="submit">Adicionar</Button>
      </form>
    </Modal>
  </>;
}

export function CheckInPage() {
  const { appointments, patientById, professionalById } = useClinic();
  const actions = useAppointmentActions();
  const today = appointments.filter((item) => item.date === isoDate(0) && item.status !== "Cancelada").sort((a, b) => a.time.localeCompare(b.time));
  const waiting = today.filter((item) => item.status === "Aguardando");
  const inService = today.filter((item) => item.status === "Em atendimento");

  return <>
    <PageHeader eyebrow="Recepção" title="Check-in digital" description="Registre a chegada e acompanhe quem está aguardando atendimento." />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_340px]">
      <Section title="Chegadas de hoje">
        {today.length ? <div className="space-y-3">{today.map((item) => {
          const arrived = ["Aguardando", "Em atendimento", "Concluída"].includes(item.status);
          return <article key={item.id} className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
            <b className="text-primary">{item.time}</b>
            <div><p className="font-semibold">{patientById(item.patientId)?.name}</p><p className="text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {item.status}</p></div>
            <Button variant={arrived ? "secondary" : "default"} disabled={arrived} onClick={() => actions.checkIn(item)}>{arrived ? <><Check />Presente</> : "Fazer check-in"}</Button>
          </article>;
        })}</div> : <EmptyHint>Sem consultas para hoje.</EmptyHint>}
      </Section>
      <Section title="Resumo">
        <div className="space-y-5">
          <div><p className="font-display text-4xl text-primary">{today.filter((item) => ["Aguardando", "Em atendimento", "Concluída"].includes(item.status)).length}</p><p className="text-sm text-muted-foreground">check-ins realizados</p></div>
          <div className="border-t border-border pt-4"><p className="font-display text-4xl text-warning">{waiting.length}</p><p className="text-sm text-muted-foreground">pacientes aguardando</p></div>
          <div className="border-t border-border pt-4"><p className="font-display text-4xl text-info">{inService.length}</p><p className="text-sm text-muted-foreground">em atendimento agora</p></div>
        </div>
      </Section>
    </div>
  </>;
}

export function ProfessionalsPage() {
  const { professionals, appointments, addProfessional, toggleProfessional } = useClinic();
  const [open, setOpen] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addProfessional({
      name: String(data.get("name") ?? ""),
      specialty: String(data.get("specialty") ?? ""),
      crm: String(data.get("crm") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
    });
    toast.success("Profissional cadastrado");
    setOpen(false);
  }

  return <>
    <PageHeader eyebrow="Equipe clínica" title="Profissionais" description="Gerencie a equipe, especialidades e disponibilidade." action="Novo profissional" onAction={() => setOpen(true)} />
    <div className="grid gap-4 lg:grid-cols-3">{professionals.map((professional) => {
      const todayItems = appointments.filter((item) => item.professionalId === professional.id && item.date === isoDate(0) && item.status !== "Cancelada");
      const next = todayItems.filter((item) => !["Concluída", "Falta"].includes(item.status)).sort((a, b) => a.time.localeCompare(b.time))[0];
      return <article key={professional.id} className="surface overflow-hidden">
        <div className={`h-1.5 ${professional.color}`} />
        <div className="p-5">
          <div className="flex gap-3"><span className="avatar">{professional.initials}</span><div><h2 className="font-semibold">{professional.name}</h2><p className="text-sm text-muted-foreground">{professional.specialty}</p><p className="mt-1 text-xs text-muted-foreground">{professional.crm}</p></div></div>
          <div className="mt-5 grid grid-cols-2 border-y border-border py-4 text-center"><div><b className="block text-xl">{todayItems.length}</b><span className="text-xs text-muted-foreground">Hoje</span></div><div className="border-l border-border"><b className="block text-xl">{next?.time ?? "—"}</b><span className="text-xs text-muted-foreground">Próximo</span></div></div>
          <div className="mt-4 flex items-center justify-between"><StatusBadge status={professional.active ? "Ativo" : "Inativo"} /><Button variant="outline" size="sm" onClick={() => { toggleProfessional(professional.id); toast.success(professional.active ? "Profissional inativado" : "Profissional ativado"); }}>{professional.active ? "Inativar" : "Ativar"}</Button></div>
        </div>
      </article>;
    })}</div>
    <Modal open={open} title="Novo profissional" onClose={() => setOpen(false)}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Nome completo" name="name" required />
        <SelectField label="Especialidade" name="specialty" options={specialties.map((item) => ({ value: item, label: item }))} />
        <Field label="CRM" name="crm" required placeholder="CRM 00000" />
        <Field label="Telefone" name="phone" required />
        <Field label="E-mail" name="email" type="email" required className="sm:col-span-2" />
        <div className="sm:col-span-2"><Button type="submit">Cadastrar profissional</Button></div>
      </form>
    </Modal>
  </>;
}

export function ReportsPage() {
  const reports = useReports();
  const { appointments } = useClinic();
  const max = Math.max(1, ...reports.perDay.map((day) => day.total));

  return <>
    <PageHeader eyebrow="Indicadores" title="Relatórios" description="Acompanhe consultas, faltas e desempenho da agenda." />
    <Toolbar placeholder="Buscar indicador..." exportAction={() => {
      const rows = [["Data", "Horário", "Status", "Especialidade"], ...appointments.map((item) => [item.date, item.time, item.status, item.specialty])];
      toast.success("Relatório exportado", { description: `${rows.length - 1} consultas incluídas no arquivo demonstrativo.` });
    }} />
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Consultas registradas" value={String(reports.total)} detail={`${reports.done} concluídas`} icon={<CalendarDays />} />
      <StatCard label="Faltas" value={String(reports.noShow)} detail={`${reports.total ? Math.round((reports.noShow / reports.total) * 100) : 0}% do total`} icon={<CircleAlert />} tone="warning" />
      <StatCard label="Cancelamentos" value={String(reports.canceled)} detail="Consultas canceladas" icon={<CalendarClock />} tone="info" />
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
      <Section title="Consultas por dia">
        <div className="flex h-64 items-end gap-3">{reports.perDay.map((day) => <div key={day.date} className="flex flex-1 flex-col items-center gap-2"><span className="text-[10px] text-muted-foreground">{day.total}</span><div className="w-full max-w-12 rounded-t-sm bg-primary/80" style={{ height: `${(day.total / max) * 180 + 4}px` }} /><span className="text-xs text-muted-foreground">{formatDate(day.date).slice(0, 5)}</span></div>)}</div>
      </Section>
      <Section title="Presença">
        <div className="grid place-items-center py-5">
          <div className="report-ring grid size-40 place-items-center rounded-full"><div className="grid size-28 place-items-center rounded-full bg-card text-center"><span><b className="block font-display text-3xl">{reports.attendance}%</b><small className="text-muted-foreground">presença</small></span></div></div>
          <div className="mt-6 grid w-full grid-cols-2 gap-3 text-center text-xs"><div className="rounded-md bg-success-soft p-3"><b className="block text-lg text-success">{reports.done}</b>Compareceram</div><div className="rounded-md bg-warning-soft p-3"><b className="block text-lg text-warning-strong">{reports.noShow}</b>Faltaram</div></div>
        </div>
      </Section>
    </div>
  </>;
}

export function ProfilePage() {
  const { settings, updateSettings } = useClinic();
  const [reminders, setReminders] = useState(true);
  const [confirmations, setConfirmations] = useState(true);

  return <>
    <PageHeader eyebrow="Preferências" title="Perfil e configurações" description="Atualize seus dados e preferências de comunicação." />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Section title="Dados do perfil">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); toast.success("Perfil atualizado", { description: "Suas alterações foram salvas." }); }}>
          <Field label="Nome completo" defaultValue="Rafaela Costa" />
          <Field label="E-mail" defaultValue="recepcao@demo.com" />
          <Field label="Telefone" defaultValue="(11) 99912-8400" />
          <Field label="Função" defaultValue="Recepcionista" disabled />
          <TextareaField label="Observações internas" className="sm:col-span-2" placeholder="Anotações da recepção" />
          <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
        </form>
      </Section>
      <Section title="Notificações">
        <div className="space-y-4">
          <Toggle label="Lembretes de consultas" description="Avisos antes de cada atendimento" checked={reminders} onChange={(value) => { setReminders(value); toast.success(value ? "Lembretes ativados" : "Lembretes desativados"); }} />
          <Toggle label="Confirmações pendentes" description="Alertas de pacientes sem resposta" checked={confirmations} onChange={(value) => { setConfirmations(value); toast.success(value ? "Alertas ativados" : "Alertas desativados"); }} />
          <Toggle label="Confirmação automática" description="Confirmar consultas ao agendar" checked={settings.autoConfirm} onChange={(value) => { updateSettings({ autoConfirm: value }); toast.success(value ? "Confirmação automática ativada" : "Confirmação automática desativada"); }} />
          <SelectField label="Antecedência do lembrete" value={String(settings.reminderHours)} onChange={(event) => { updateSettings({ reminderHours: Number(event.target.value) }); toast.success("Antecedência atualizada"); }} options={[["12", "12 horas"], ["24", "24 horas"], ["48", "48 horas"]].map(([value, label]) => ({ value: value as string, label: label as string }))} />
        </div>
      </Section>
    </div>
    <Section title="Horários de atendimento da clínica" className="mt-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{weekdays.map((day) => <div key={day.value} className="flex items-center justify-between rounded-md bg-muted/55 px-4 py-3 text-sm"><span>{day.label}</span><b><Stethoscope className="mr-1 inline size-4 align-[-2px]" />08:00 – 18:00</b></div>)}</div>
    </Section>
  </>;
}
