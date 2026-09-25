import { useMemo, useState } from "react";
import { Activity, CalendarCheck, CalendarClock, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, History, MessageSquareText, MoreHorizontal, Phone, Send, ShieldCheck, Users, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, Modal, PageHeader, Section, SelectField, StatCard, StatusBadge, TextareaField, Toggle, Toolbar } from "@/components/page-kit";
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
  const { appointments, professionals, sendAllReminders, availableSlots, patientById, professionalById } = useClinic();
  const reports = useReports();
  const [newOpen, setNewOpen] = useState(false);
  const active = professionals.filter((item) => item.active);
  const [proId, setProId] = useState(active[0]?.id ?? "");
  const [calDate, setCalDate] = useState(isoDate(0));
  const today = appointments.filter((item) => item.date === isoDate(0) && item.status !== "Cancelada").sort((a, b) => a.time.localeCompare(b.time));
  const confirmed = today.filter((item) => item.status === "Confirmada").length;
  const pending = appointments.filter((item) => item.confirmationReply === "Sem resposta" && openStatuses.includes(item.status) && item.date >= isoDate(0)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const slots = proId ? availableSlots(proId, calDate) : [];

  return <>
    <PageHeader eyebrow="Visão geral" title="Bom dia, Rafaela" description="Acompanhe os agendamentos do dia e as confirmações pendentes." action="Nova consulta" onAction={() => setNewOpen(true)} />
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard label="Realizadas hoje" value={String(today.filter((item) => item.status === "Realizada").length)} detail={`${today.filter((item) => item.status === "Não compareceu").length} ausências`} icon={<CheckCircle2 />} tone="success" />
      <StatCard label="Taxa de presença" value={`${reports.attendance}%`} detail="Histórico da clínica" icon={<Activity />} tone="info" />
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <Section title={`Consultas hoje (${today.length} · ${confirmed} confirmadas)`}>
        {today.length ? <div className="divide-y divide-border">{today.map((item) => <div key={item.id} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 py-3"><span className="text-sm font-bold text-primary">{item.time}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{patientById(item.patientId)?.name}</p><p className="truncate text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {item.specialty}</p></div><StatusBadge status={item.status} /></div>)}</div> : <EmptyHint>Nenhuma consulta para hoje.</EmptyHint>}
      </Section>
      <Section title={`Aguardando confirmação (${pending.length})`} action={pending.length > 0 ? <Button size="sm" variant="outline" onClick={() => { const sent = sendAllReminders(); toast[sent ? "success" : "info"](sent ? `${sent} lembrete(s) enviado(s)` : "Todos os lembretes já foram enviados"); }}><Send />Enviar lembretes</Button> : undefined}>
        {pending.length ? <div className="divide-y divide-border">{pending.map((item) => <div key={item.id} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 py-3"><span className="text-xs font-bold text-primary">{formatDate(item.date).slice(0, 5)} · {item.time}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{patientById(item.patientId)?.name}</p><p className="truncate text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {item.reminderSentAt ? "Lembrete enviado" : "Sem lembrete"}</p></div><StatusBadge status={item.status} /></div>)}</div> : <EmptyHint>Todas as consultas estão confirmadas.</EmptyHint>}
      </Section>
    </div>
    <Section title="Horários disponíveis" className="mt-5">
      <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
        <div className="grid gap-3">
          <SelectField label="Médico" value={proId} onChange={(event) => setProId(event.target.value)} options={active.map((item) => ({ value: item.id, label: `${item.name} · ${item.specialty}` }))} />
          <MiniCalendar value={calDate} onChange={setCalDate} slotsFor={(day) => (proId ? availableSlots(proId, day).length : 0)} />
        </div>
        <div className="grid content-start gap-2">
          <p className="text-sm font-semibold">{formatDate(calDate)} · {relativeDay(calDate)}</p>
          <p className="text-xs text-muted-foreground">{slots.length} horário(s) livre(s)</p>
          {slots.length ? <SlotPicker slots={slots} /> : <EmptyHint>Nenhum horário disponível nesta data.</EmptyHint>}
        </div>
      </div>
    </Section>
    <Modal open={newOpen} title="Nova consulta" description="Busque o paciente pelo CPF e agende em nome dele (presencial ou por telefone)." onClose={() => setNewOpen(false)}><AppointmentForm onDone={() => setNewOpen(false)} /></Modal>
  </>;
}

export function AgendaPage() {
  const { appointments, professionals, patientById, availableSlots } = useClinic();
  const [date, setDate] = useState(isoDate(0));
  const [newOpen, setNewOpen] = useState(false);
  const [manage, setManage] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState("Todos");
  const active = professionals.filter((item) => item.active && (doctor === "Todos" || item.id === doctor));
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
    <PageHeader eyebrow="Organização diária" title="Agenda" description="Visualize a agenda diária dos médicos e a disponibilidade de horários." action="Agendar consulta" onAction={() => setNewOpen(true)} />
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por médico">
      {[{ id: "Todos", name: "Todos os médicos" }, ...professionals.filter((item) => item.active)].map((item) => <Button key={item.id} size="sm" variant={doctor === item.id ? "default" : "outline"} onClick={() => setDoctor(item.id)}>{item.name}</Button>)}
    </div>
    {doctor !== "Todos" && <div className="mb-4 grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]"><MiniCalendar key={doctor} value={date} onChange={setDate} slotsFor={(day) => availableSlots(doctor, day).length} /><div className="surface p-4"><p className="text-sm font-semibold">Horários livres · {formatDate(date)}</p><div className="mt-3">{availableSlots(doctor, date).length ? <SlotPicker slots={availableSlots(doctor, date)} /> : <EmptyHint>Nenhum horário livre nesta data.</EmptyHint>}</div></div></div>}
    <div className="surface overflow-hidden">
      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[auto_1fr_auto]">
        <div className="flex gap-1"><Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Dia anterior"><ChevronLeft /></Button><Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Próximo dia"><ChevronRight /></Button></div>
        <p className="self-center text-center font-semibold">{formatDate(date)} · {relativeDay(date)}</p>
        <Button variant="outline" onClick={() => setDate(isoDate(0))}>Hoje</Button>
      </div>
      {hours.length ? (
        <div className="overflow-x-auto"><div className="grid" style={{ gridTemplateColumns: `64px repeat(${active.length}, minmax(170px,1fr))`, minWidth: active.length > 1 ? 660 : undefined }}>
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
      ) : <div className="p-5"><EmptyHint>Nenhum médico atende nesta data.</EmptyHint></div>}
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

  return <>
    <PageHeader eyebrow="Atendimentos" title="Consultas" description="Acompanhe, confirme, remarque ou cancele os agendamentos." action="Nova consulta" onAction={() => setNewOpen(true)} />
    <Toolbar placeholder="Buscar por paciente, CPF ou médico..." value={search} onChange={setSearch} />
    <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Data" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      <SelectField label="Médico" value={professional} onChange={(event) => setProfessional(event.target.value)} options={[{ value: "Todos", label: "Todos" }, ...professionals.map((item) => ({ value: item.id, label: item.name }))]} />
      <SelectField label="Especialidade" value={specialty} onChange={(event) => setSpecialty(event.target.value)} options={[{ value: "Todas", label: "Todas" }, ...activeSpecialties.map((item) => ({ value: item, label: item }))]} />
      <SelectField label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={[{ value: "Todos", label: "Todos" }, ...appointmentStatuses.map((item) => ({ value: item, label: item }))]} />
    </div>
    <Section title={`Consultas (${list.length})`} action={date || status !== "Todos" || professional !== "Todos" || specialty !== "Todas" ? <Button variant="ghost" size="sm" onClick={() => { setDate(""); setStatus("Todos"); setProfessional("Todos"); setSpecialty("Todas"); }}>Limpar filtros</Button> : undefined}>
      {list.length ? <>
        <div className="hidden overflow-x-auto md:block"><table className="data-table"><thead><tr><th>Horário</th><th>Paciente</th><th>Médico</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{list.map((item) => <tr key={item.id}><td><b>{item.time}</b><small>{formatDate(item.date)}</small></td><td>{patientById(item.patientId)?.name}<small>#{item.id} · {item.channel}</small></td><td>{professionalById(item.professionalId)?.name}<small>{item.specialty}</small></td><td><StatusBadge status={item.status} /></td><td><Button variant="ghost" size="icon" onClick={() => setManage(item)} aria-label="Gerenciar"><MoreHorizontal /></Button></td></tr>)}</tbody></table></div>
        <div className="space-y-3 md:hidden">{list.map((item) => <article key={item.id} className="rounded-md border border-border p-4"><div className="flex justify-between gap-2"><b>{item.time} · {patientById(item.patientId)?.name}</b><StatusBadge status={item.status} /></div><p className="mt-2 text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {formatDate(item.date)}</p><Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setManage(item)}>Gerenciar</Button></article>)}</div>
      </> : <EmptyHint>Nenhuma consulta encontrada com esses filtros.</EmptyHint>}
    </Section>
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

  return <>
    <PageHeader eyebrow="Cadastros" title="Pacientes" description="Pesquise por nome, CPF ou contato e mantenha os cadastros atualizados." action="Novo paciente" onAction={() => setFormOpen(true)} />
    <Toolbar placeholder="Buscar nome, CPF, telefone ou convênio..." value={search} onChange={setSearch} />
    {list.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((item) => {
      const items = appointments.filter((appointment) => appointment.patientId === item.id);
      const last = items.filter((appointment) => appointment.date <= isoDate(0)).sort((a, b) => b.date.localeCompare(a.date))[0];
      return <article key={item.id} className="surface p-4">
        <div className="flex items-start justify-between"><span className="avatar">{item.initials}</span><StatusBadge status={item.status} /></div>
        <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{item.cpf}</p>
        <p className="text-sm text-muted-foreground">{item.phone}</p>
        <p className="text-sm text-muted-foreground">Convênio: {item.insurance}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs"><span className="text-muted-foreground">Última consulta</span><b>{last ? formatDate(last.date) : "—"}</b></div>
        <div className="mt-4 grid gap-2">
          <Button variant="outline" onClick={() => setHistoryOf(item.id)}><History />Histórico ({items.length})</Button>
          <Button variant="outline" onClick={() => setEligibilityOf(item.id)}><ShieldCheck />Verificar elegibilidade</Button>
          <Button variant="outline" onClick={() => setEditing(item.id)}>Editar cadastro</Button>
        </div>
      </article>;
    })}</div> : <EmptyHint>Nenhum paciente encontrado.</EmptyHint>}

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

  return <>
    <PageHeader eyebrow="Otimização da agenda" title="Fila de espera" description="Preencha horários liberados com rapidez e reduza a ociosidade." action="Adicionar à fila" onAction={() => setOpen(true)} />
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
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

export function ProfilePage() {
  const { settings, updateSettings } = useClinic();
  const [reminders, setReminders] = useState(true);

  return <>
    <PageHeader eyebrow="Preferências" title="Perfil e configurações" description="Atualize seus dados e as preferências de confirmação da recepção." />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Section title="Dados do perfil">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); toast.success("Perfil atualizado", { description: "Suas alterações foram salvas." }); }}>
          <Field label="Nome completo" defaultValue="Rafaela Costa" />
          <Field label="E-mail" defaultValue="recepcao@demo.com" />
          <Field label="Telefone" defaultValue="(11) 99912-8400" />
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
