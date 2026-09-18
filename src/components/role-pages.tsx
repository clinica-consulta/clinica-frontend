import { useState } from "react";
import { Activity, Bell, CalendarCheck, CalendarClock, CalendarDays, Check, CheckCircle2, CircleAlert, Clock3, FileText, ShieldCheck, Stethoscope, UserCheck, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, Modal, PageHeader, Section, SelectField, StatCard, StatusBadge, TextareaField, Toggle, Toolbar } from "@/components/page-kit";
import { AppointmentForm } from "@/components/appointment-form";
import { RescheduleModal } from "@/components/clinic-pages";
import { formatDate, isoDate, relativeDay, specialties, weekdays, type Appointment } from "@/lib/clinic-data";
import { useClinic, useReports } from "@/lib/clinic-store";

const openStatuses = ["Pendente", "Confirmada", "Aguardando", "Em atendimento"];

function usePatientScope() {
  const clinic = useClinic();
  const patient = clinic.currentPatient ?? clinic.patients[0] ?? null;
  const mine = clinic.appointments.filter((item) => item.patientId === patient?.id);
  return { clinic, patient, mine };
}

function useProfessionalScope() {
  const clinic = useClinic();
  const professional = clinic.currentProfessional ?? clinic.professionals[0] ?? null;
  const mine = clinic.appointments.filter((item) => item.professionalId === professional?.id);
  return { clinic, professional, mine };
}

function AppointmentRow({ item, right }: { item: Appointment; right?: React.ReactNode }) {
  const { patientById, professionalById } = useClinic();
  return <div className="grid gap-2.5 py-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
    <b className="text-primary">{item.time}</b>
    <div className="min-w-0"><p className="font-semibold">{patientById(item.patientId)?.name}</p><p className="text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {item.specialty} · {relativeDay(item.date)}</p></div>
    <div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.status} />{right}</div>
  </div>;
}

function Notice({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-md border border-border p-3"><span className="metric-icon metric-info">{icon}</span><div className="min-w-0"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p>{action && <div className="mt-2">{action}</div>}</div></article>;
}

function NotificationList({ role }: { role: "patient" | "professional" | "admin" | "receptionist" }) {
  const { notificationsFor, markNotificationRead, markAllNotificationsRead } = useClinic();
  const items = notificationsFor(role);
  return <Section title={`Recentes (${items.filter((item) => !item.read).length} não lidas)`} action={<Button variant="ghost" size="sm" onClick={() => { markAllNotificationsRead(role); toast.success("Notificações marcadas como lidas"); }}>Marcar todas</Button>}>
    {items.length ? <div className="space-y-3">{items.map((item) => <article key={item.id} className={`grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-md border p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] ${item.read ? "border-border" : "border-primary/40 bg-muted/55"}`}>
      <span className="metric-icon metric-info size-10"><Bell /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.text}</p><p className="mt-1 text-[11px] text-muted-foreground">{formatDate(item.createdAt)}</p></div>
      {!item.read && <Button className="col-start-2 justify-self-start sm:col-start-3 sm:row-start-1 sm:self-center" variant="ghost" size="sm" onClick={() => markNotificationRead(item.id)}>Marcar lida</Button>}
    </article>)}</div> : <EmptyHint>Nenhuma notificação por aqui.</EmptyHint>}
  </Section>;
}

/* ---------------- Paciente ---------------- */

export function PatientDashboardPage() {
  const { clinic, patient, mine } = usePatientScope();
  const upcoming = mine.filter((item) => openStatuses.includes(item.status) && item.date >= isoDate(0)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const next = upcoming[0];
  const done = mine.filter((item) => item.status === "Concluída").length;
  const unread = clinic.notificationsFor("patient").filter((item) => !item.read).length;

  return <>
    <PageHeader eyebrow="Área do paciente" title={`Olá, ${patient?.name.split(" ")[0] ?? "paciente"}`} description="Acompanhe suas consultas e cuide dos próximos passos do seu atendimento." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Próxima consulta" value={next ? relativeDay(next.date) : "—"} detail={next ? `${next.time} · ${next.specialty}` : "Nenhuma agendada"} icon={<CalendarCheck />} />
      <StatCard label="Consultas realizadas" value={String(done)} detail="Histórico completo" icon={<CheckCircle2 />} tone="success" />
      <StatCard label="Notificações" value={String(unread)} detail="Não lidas" icon={<Bell />} tone="warning" />
      <StatCard label="Agendadas" value={String(upcoming.length)} detail="Próximos atendimentos" icon={<Clock3 />} tone="info" />
    </div>
    <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
      <Section title="Próxima consulta">
        {next ? <div className="rounded-md bg-muted/55 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="font-display text-lg uppercase">{clinic.professionalById(next.professionalId)?.name}</p><p className="text-xs text-muted-foreground sm:text-sm">{next.specialty} · {relativeDay(next.date)} às {next.time}</p></div>
            <StatusBadge status={next.status} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {next.status === "Pendente" && <Button onClick={() => { clinic.setAppointmentStatus(next.id, "Confirmada"); toast.success("Presença confirmada"); }}><Check />Confirmar presença</Button>}
            {next.date === isoDate(0) && next.status !== "Aguardando" && <Button variant="outline" onClick={() => { clinic.setAppointmentStatus(next.id, "Aguardando"); toast.success("Check-in realizado"); }}><UserCheck />Fazer check-in</Button>}
            <Button variant="outline" onClick={() => { clinic.setAppointmentStatus(next.id, "Cancelada"); toast.warning("Consulta cancelada"); }}><X />Cancelar</Button>
          </div>
        </div> : <EmptyHint>Você não tem consultas agendadas. Use "Agendar consulta" no menu.</EmptyHint>}
      </Section>
      <Section title="Lembretes">
        <div className="space-y-3">
          {next && !next.preForm && <Notice icon={<FileText />} title="Pré-atendimento pendente" text="Preencha o formulário antes da sua consulta." />}
          <Notice icon={<CalendarClock />} title="Chegue com antecedência" text="Recomendamos chegar 15 minutos antes do horário." />
          {unread > 0 && <Notice icon={<Bell />} title={`${unread} notificação(ões) nova(s)`} text="Veja as atualizações na página de notificações." />}
        </div>
      </Section>
    </div>
  </>;
}

export function PatientAppointmentsPage() {
  const { clinic, mine } = usePatientScope();
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const upcoming = mine.filter((item) => openStatuses.includes(item.status)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const history = mine.filter((item) => !openStatuses.includes(item.status)).sort((a, b) => b.date.localeCompare(a.date));

  return <>
    <PageHeader eyebrow="Seu histórico" title="Minhas consultas" description="Acompanhe seus próximos atendimentos e consultas anteriores." />
    <div className="grid gap-6">
      <Section title={`Próximas consultas (${upcoming.length})`}>
        {upcoming.length ? <div className="divide-y divide-border">{upcoming.map((item) => <AppointmentRow key={item.id} item={item} right={<div className="flex flex-wrap gap-2">
          {item.status === "Pendente" && <Button size="sm" onClick={() => { clinic.setAppointmentStatus(item.id, "Confirmada"); toast.success("Consulta confirmada"); }}>Confirmar</Button>}
          <Button size="sm" variant="outline" onClick={() => setReschedule(item)}>Reagendar</Button>
          <Button size="sm" variant="ghost" onClick={() => { clinic.setAppointmentStatus(item.id, "Cancelada"); toast.warning("Consulta cancelada"); }}>Cancelar</Button>
        </div>} />)}</div> : <EmptyHint>Nenhuma consulta agendada.</EmptyHint>}
      </Section>
      <Section title="Histórico">
        {history.length ? <div className="divide-y divide-border">{history.map((item) => <AppointmentRow key={item.id} item={item} />)}</div> : <EmptyHint>Você ainda não tem consultas anteriores.</EmptyHint>}
      </Section>
    </div>
    <RescheduleModal appointment={reschedule} onClose={() => setReschedule(null)} />
  </>;
}

export function PatientBookingPage() {
  const { patient } = usePatientScope();
  return <>
    <PageHeader eyebrow="Novo atendimento" title="Agendar consulta" description="Escolha a especialidade, o profissional e um horário disponível." />
    <Section title="Dados do agendamento">{patient ? <AppointmentForm fixedPatientId={patient.id} /> : <EmptyHint>Cadastro do paciente não encontrado.</EmptyHint>}</Section>
  </>;
}

export function PatientCheckInPage() {
  const { clinic, mine } = usePatientScope();
  const todayItem = mine.filter((item) => item.date === isoDate(0) && openStatuses.includes(item.status)).sort((a, b) => a.time.localeCompare(b.time))[0];
  const [form, setForm] = useState({ reason: "", medications: "", allergies: "" });

  return <>
    <PageHeader eyebrow="Atendimento de hoje" title="Check-in digital" description="Confirme sua chegada e preencha os dados antes da consulta." />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Section title="Sua consulta">
        {todayItem ? <div className="space-y-4">
          <div><p className="font-display text-xl uppercase">{todayItem.specialty}</p><p className="text-xs text-muted-foreground sm:text-sm">{clinic.professionalById(todayItem.professionalId)?.name} · hoje às {todayItem.time}</p></div>
          <StatusBadge status={todayItem.status} />
          <Button disabled={todayItem.status === "Aguardando" || todayItem.status === "Em atendimento"} onClick={() => { clinic.setAppointmentStatus(todayItem.id, "Aguardando"); toast.success("Check-in realizado", { description: "A equipe já sabe que você chegou." }); }}>
            {todayItem.status === "Aguardando" || todayItem.status === "Em atendimento" ? <><Check />Presença confirmada</> : "Fazer check-in"}
          </Button>
        </div> : <EmptyHint>Você não tem consultas para hoje.</EmptyHint>}
      </Section>
      <Section title="Pré-atendimento">
        {todayItem ? <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); clinic.savePreForm(todayItem.id, form); toast.success("Formulário enviado", { description: "As informações foram salvas para o atendimento." }); }}>
          <TextareaField label="Motivo da consulta" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required />
          <Field label="Medicamentos em uso" value={form.medications} onChange={(event) => setForm({ ...form, medications: event.target.value })} />
          <Field label="Alergias" value={form.allergies} onChange={(event) => setForm({ ...form, allergies: event.target.value })} />
          <Button type="submit" variant="outline">Enviar formulário</Button>
          {todayItem.preForm && <p className="text-xs text-muted-foreground">Formulário já enviado para esta consulta.</p>}
        </form> : <EmptyHint>O formulário fica disponível no dia da consulta.</EmptyHint>}
      </Section>
    </div>
  </>;
}

export function PatientNotificationsPage() {
  return <>
    <PageHeader eyebrow="Atualizações" title="Notificações" description="Veja confirmações, lembretes e informações sobre seus atendimentos." />
    <NotificationList role="patient" />
  </>;
}

export function PatientProfilePage() {
  const { clinic, patient } = usePatientScope();
  if (!patient) return <EmptyHint>Cadastro não encontrado.</EmptyHint>;
  return <>
    <PageHeader eyebrow="Seus dados" title="Meu perfil" description="Mantenha seus dados pessoais e preferências atualizados." />
    <Section title="Informações pessoais">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        clinic.updatePatient(patient.id, {
          name: String(data.get("name") ?? ""),
          cpf: String(data.get("cpf") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          birthDate: String(data.get("birthDate") ?? ""),
        });
        toast.success("Perfil atualizado", { description: "Suas informações foram salvas." });
      }}>
        <Field label="Nome completo" name="name" defaultValue={patient.name} required />
        <Field label="CPF" name="cpf" defaultValue={patient.cpf} required />
        <Field label="Telefone" name="phone" defaultValue={patient.phone} required />
        <Field label="E-mail" name="email" type="email" defaultValue={patient.email} required />
        <Field label="Data de nascimento" name="birthDate" type="date" defaultValue={patient.birthDate} required />
        <Field label="Perfil" defaultValue="Paciente" disabled />
        <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
      </form>
    </Section>
  </>;
}

/* ---------------- Profissional ---------------- */

export function ProfessionalDashboardPage() {
  const { clinic, professional, mine } = useProfessionalScope();
  const today = mine.filter((item) => item.date === isoDate(0) && item.status !== "Cancelada");
  const waiting = today.filter((item) => item.status === "Aguardando");
  const done = today.filter((item) => item.status === "Concluída");
  const next = today.filter((item) => openStatuses.includes(item.status)).sort((a, b) => a.time.localeCompare(b.time));

  return <>
    <PageHeader eyebrow="Área profissional" title={`Bom dia, ${professional?.name.split(" ").slice(0, 2).join(" ") ?? ""}`} description="Acompanhe sua agenda, pacientes e andamento dos atendimentos de hoje." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Consultas hoje" value={String(today.length)} detail={`${today.filter((item) => item.status === "Confirmada").length} confirmadas`} icon={<CalendarCheck />} />
      <StatCard label="Aguardando" value={String(waiting.length)} detail="Check-in realizado" icon={<Clock3 />} tone="warning" />
      <StatCard label="Concluídas" value={String(done.length)} detail="Até o momento" icon={<CheckCircle2 />} tone="success" />
      <StatCard label="Total de pacientes" value={String(new Set(mine.map((item) => item.patientId)).size)} detail="Vinculados a você" icon={<Activity />} tone="info" />
    </div>
    <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
      <Section title="Próximos atendimentos">
        {next.length ? <div className="divide-y divide-border">{next.map((item) => <AppointmentRow key={item.id} item={item} right={item.status === "Aguardando" ? <Button size="sm" onClick={() => { clinic.setAppointmentStatus(item.id, "Em atendimento"); toast.success("Atendimento iniciado"); }}>Atender</Button> : undefined} />)}</div> : <EmptyHint>Sem atendimentos para hoje.</EmptyHint>}
      </Section>
      <Section title="Resumo do dia">
        <div className="space-y-3">
          {waiting.length ? waiting.map((item) => <Notice key={item.id} icon={<UserCheck />} title={`${clinic.patientById(item.patientId)?.name} chegou`} text={`Check-in feito para o horário de ${item.time}.`} />) : <Notice icon={<UserCheck />} title="Nenhum paciente aguardando" text="A sala de espera está vazia." />}
          {today.filter((item) => item.status === "Pendente").map((item) => <Notice key={item.id} icon={<CircleAlert />} title="Confirmação pendente" text={`${clinic.patientById(item.patientId)?.name} ainda não confirmou.`} />)}
        </div>
      </Section>
    </div>
  </>;
}

export function ProfessionalAgendaPage() {
  const { mine } = useProfessionalScope();
  const [date, setDate] = useState(isoDate(0));
  const items = mine.filter((item) => item.date === date && item.status !== "Cancelada").sort((a, b) => a.time.localeCompare(b.time));

  return <>
    <PageHeader eyebrow="Organização diária" title="Minha agenda" description="Visualize seus horários e acompanhe os pacientes agendados." />
    <div className="mb-5 grid gap-3 sm:max-w-xs"><Field label="Data" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div>
    <Section title={`${formatDate(date)} · ${items.length} atendimento(s)`}>
      {items.length ? <div className="divide-y divide-border">{items.map((item) => <AppointmentRow key={item.id} item={item} />)}</div> : <EmptyHint>Nenhum atendimento nesta data.</EmptyHint>}
    </Section>
  </>;
}

export function ProfessionalAppointmentsPage() {
  const { clinic, mine } = useProfessionalScope();
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Appointment | null>(null);
  const today = mine
    .filter((item) => item.date === isoDate(0) && item.status !== "Cancelada")
    .filter((item) => (clinic.patientById(item.patientId)?.name ?? "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.time.localeCompare(b.time));

  return <>
    <PageHeader eyebrow="Fluxo clínico" title="Atendimentos" description="Acompanhe o status dos seus atendimentos de hoje." />
    <Toolbar placeholder="Buscar paciente..." value={search} onChange={setSearch} />
    <Section title="Pacientes do dia">
      {today.length ? <div className="divide-y divide-border">{today.map((item) => <AppointmentRow key={item.id} item={item} right={<div className="flex flex-wrap gap-2">
        {item.status === "Aguardando" && <Button size="sm" onClick={() => { clinic.setAppointmentStatus(item.id, "Em atendimento"); toast.success("Atendimento iniciado"); }}>Iniciar</Button>}
        {item.status === "Em atendimento" && <Button size="sm" onClick={() => { clinic.setAppointmentStatus(item.id, "Concluída"); toast.success("Atendimento concluído"); }}>Concluir</Button>}
        {openStatuses.includes(item.status) && <Button size="sm" variant="ghost" onClick={() => { clinic.setAppointmentStatus(item.id, "Falta"); toast.warning("Falta registrada"); }}>Falta</Button>}
        <Button size="sm" variant="outline" onClick={() => setDetail(item)}>Ficha</Button>
      </div>} />)}</div> : <EmptyHint>Nenhum atendimento para hoje.</EmptyHint>}
    </Section>
    <Modal open={Boolean(detail)} title="Ficha do atendimento" description={detail ? `${clinic.patientById(detail.patientId)?.name} · ${detail.time}` : ""} onClose={() => setDetail(null)}>
      {detail && <div className="space-y-3 text-sm">
        <p><b>Especialidade:</b> {detail.specialty}</p>
        <p><b>Observações:</b> {detail.notes || "—"}</p>
        <div className="rounded-md bg-muted/60 p-4"><b className="block">Pré-atendimento</b>{detail.preForm ? <><p className="mt-1 text-muted-foreground">Motivo: {detail.preForm.reason || "—"}</p><p className="text-muted-foreground">Medicamentos: {detail.preForm.medications || "—"}</p><p className="text-muted-foreground">Alergias: {detail.preForm.allergies || "—"}</p></> : <p className="mt-1 text-muted-foreground">Formulário não enviado pelo paciente.</p>}</div>
      </div>}
    </Modal>
  </>;
}

export function ProfessionalPatientsPage() {
  const { clinic, mine } = useProfessionalScope();
  const [search, setSearch] = useState("");
  const ids = [...new Set(mine.map((item) => item.patientId))];
  const list = ids.map((id) => clinic.patientById(id)).filter(Boolean).filter((item) => `${item!.name} ${item!.email}`.toLowerCase().includes(search.toLowerCase()));

  return <>
    <PageHeader eyebrow="Acompanhamento" title="Meus pacientes" description="Consulte os pacientes vinculados aos seus atendimentos." />
    <Toolbar placeholder="Buscar nome ou contato..." value={search} onChange={setSearch} />
    {list.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((patient) => {
      const history = mine.filter((item) => item.patientId === patient!.id);
      const last = history.filter((item) => item.status === "Concluída").sort((a, b) => b.date.localeCompare(a.date))[0];
      return <article key={patient!.id} className="surface p-4">
        <span className="avatar">{patient!.initials}</span>
        <h2 className="mt-4 font-semibold">{patient!.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{patient!.email}</p>
        <p className="text-sm text-muted-foreground">{patient!.phone}</p>
        <div className="mt-4 grid grid-cols-2 border-t border-border pt-4 text-center text-xs"><div><b className="block text-lg">{history.length}</b>atendimentos</div><div className="border-l border-border"><b className="block text-lg">{last ? formatDate(last.date).slice(0, 5) : "—"}</b>último</div></div>
      </article>;
    })}</div> : <EmptyHint>Nenhum paciente encontrado.</EmptyHint>}
  </>;
}

export function ProfessionalAvailabilityPage() {
  const { clinic, professional } = useProfessionalScope();
  if (!professional) return <EmptyHint>Perfil profissional não encontrado.</EmptyHint>;
  return <>
    <PageHeader eyebrow="Agenda profissional" title="Disponibilidade" description="Defina os períodos em que você estará disponível para consultas." />
    <Section title="Horários da semana">
      <div className="space-y-3">{weekdays.map((day) => {
        const value = professional.availability[day.value] ?? { active: false, start: "08:00", end: "17:00" };
        return <div key={day.value} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[140px_1fr_1fr_auto] md:items-end">
          <b className="self-center">{day.label}</b>
          <Field label="Início" type="time" value={value.start} onChange={(event) => clinic.setAvailability(professional.id, day.value, { ...value, start: event.target.value })} />
          <Field label="Fim" type="time" value={value.end} onChange={(event) => clinic.setAvailability(professional.id, day.value, { ...value, end: event.target.value })} />
          <Button variant={value.active ? "default" : "outline"} onClick={() => { clinic.setAvailability(professional.id, day.value, { ...value, active: !value.active }); toast.success(value.active ? `${day.label} desativada` : `${day.label} ativada`); }}>{value.active ? "Disponível" : "Indisponível"}</Button>
        </div>;
      })}</div>
    </Section>
  </>;
}

export function ProfessionalNotificationsPage() {
  return <>
    <PageHeader eyebrow="Atualizações" title="Notificações" description="Acompanhe chegadas, alterações e confirmações da sua agenda." />
    <NotificationList role="professional" />
  </>;
}

export function ProfessionalProfilePage() {
  const { clinic, professional } = useProfessionalScope();
  if (!professional) return <EmptyHint>Perfil não encontrado.</EmptyHint>;
  return <>
    <PageHeader eyebrow="Dados profissionais" title="Meu perfil" description="Atualize seus dados de contato e informações profissionais." />
    <Section title="Informações profissionais">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        clinic.updateProfessional(professional.id, {
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          specialty: String(data.get("specialty") ?? ""),
          crm: String(data.get("crm") ?? ""),
          phone: String(data.get("phone") ?? ""),
        });
        toast.success("Perfil atualizado", { description: "Suas informações foram salvas." });
      }}>
        <Field label="Nome completo" name="name" defaultValue={professional.name} required />
        <Field label="E-mail" name="email" type="email" defaultValue={professional.email} required />
        <SelectField label="Especialidade" name="specialty" defaultValue={professional.specialty} options={specialties.map((item) => ({ value: item, label: item }))} />
        <Field label="CRM" name="crm" defaultValue={professional.crm} required />
        <Field label="Telefone" name="phone" defaultValue={professional.phone} required />
        <Field label="Perfil" defaultValue="Profissional de Saúde" disabled />
        <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
      </form>
    </Section>
  </>;
}

/* ---------------- Administrador ---------------- */

export function AdminDashboardPage() {
  const { patients, professionals, appointments, staff, waitlist } = useClinic();
  const reports = useReports();
  const pendingUsers = staff.filter((item) => item.status === "Pendente").length;
  const monthly = appointments.filter((item) => item.date.slice(0, 7) === isoDate(0).slice(0, 7)).length;

  return <>
    <PageHeader eyebrow="Administração" title="Visão geral" description="Acompanhe os principais indicadores e a operação da clínica." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Usuários ativos" value={String(patients.length + professionals.length + staff.length)} detail={`${patients.length} pacientes`} icon={<UsersRound />} />
      <StatCard label="Profissionais" value={String(professionals.filter((item) => item.active).length)} detail={`${new Set(professionals.map((item) => item.specialty)).size} especialidades`} icon={<Stethoscope />} tone="info" />
      <StatCard label="Consultas no mês" value={String(monthly)} detail={`${reports.attendance}% de presença`} icon={<CalendarDays />} tone="success" />
      <StatCard label="Pendências" value={String(pendingUsers + waitlist.filter((item) => item.status === "Aguardando").length)} detail="Requerem revisão" icon={<ShieldCheck />} tone="warning" />
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <Section title="Desempenho da clínica">
        <div className="space-y-4">
          {[["Consultas registradas", String(reports.total)], ["Taxa de presença", `${reports.attendance}%`], ["Faltas", String(reports.noShow)], ["Cancelamentos", String(reports.canceled)]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-border pb-3 text-sm"><span className="text-muted-foreground">{label}</span><b>{value}</b></div>)}
        </div>
      </Section>
      <Section title="Atenção necessária">
        <div className="space-y-3">
          <Notice icon={<CircleAlert />} title={`${pendingUsers} cadastro(s) pendente(s)`} text="Usuários aguardando liberação de acesso." />
          <Notice icon={<Activity />} title="Fila de espera" text={`${waitlist.filter((item) => item.status === "Aguardando").length} paciente(s) aguardando horário.`} />
        </div>
      </Section>
    </div>
  </>;
}

export function AdminUsersPage() {
  const { staff, patients, professionals, addStaff, updateStaff, togglePatientStatus, toggleProfessional } = useClinic();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rows = [
    ...staff.map((item) => ({ id: item.id, name: item.name, email: item.email, role: item.role === "admin" ? "Administrador" : "Recepcionista", status: item.status, toggle: () => { updateStaff(item.id, { status: item.status === "Ativo" ? "Inativo" : "Ativo" }); toast.success("Acesso atualizado"); } })),
    ...professionals.map((item) => ({ id: item.id, name: item.name, email: item.email, role: "Profissional", status: item.active ? "Ativo" : "Inativo", toggle: () => { toggleProfessional(item.id); toast.success("Acesso atualizado"); } })),
    ...patients.map((item) => ({ id: item.id, name: item.name, email: item.email, role: "Paciente", status: item.status, toggle: () => { togglePatientStatus(item.id); toast.success("Acesso atualizado"); } })),
  ].filter((item) => `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(search.toLowerCase()));

  return <>
    <PageHeader eyebrow="Controle de acesso" title="Usuários" description="Gerencie contas e níveis de acesso da plataforma." action="Novo usuário" onAction={() => setOpen(true)} />
    <Toolbar placeholder="Buscar nome ou perfil..." value={search} onChange={setSearch} />
    <Section title={`Usuários cadastrados (${rows.length})`}>
      {rows.length ? <div className="space-y-3">{rows.map((item) => <div key={`${item.role}-${item.id}`} className="grid gap-2.5 rounded-md border border-border p-3 md:grid-cols-[minmax(0,1fr)_140px_105px_auto] md:items-center">
        <div className="min-w-0"><b className="block truncate">{item.name}</b><span className="text-xs text-muted-foreground">{item.email}</span></div>
        <span className="text-sm text-muted-foreground">{item.role}</span>
        <StatusBadge status={item.status} />
        <Button variant="outline" size="sm" onClick={item.toggle}>{item.status === "Ativo" ? "Desativar" : "Ativar"}</Button>
      </div>)}</div> : <EmptyHint>Nenhum usuário encontrado.</EmptyHint>}
    </Section>
    <Modal open={open} title="Novo usuário interno" description="Cadastre recepcionistas e administradores." onClose={() => setOpen(false)}>
      <form className="grid gap-4" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        addStaff({ name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), role: String(data.get("role") ?? "receptionist") as "receptionist" | "admin", status: "Ativo" });
        toast.success("Usuário cadastrado");
        setOpen(false);
      }}>
        <Field label="Nome completo" name="name" required />
        <Field label="E-mail" name="email" type="email" required />
        <SelectField label="Perfil de acesso" name="role" options={[{ value: "receptionist", label: "Recepcionista" }, { value: "admin", label: "Administrador" }]} />
        <Button type="submit">Cadastrar usuário</Button>
      </form>
    </Modal>
  </>;
}

export function AdminProfessionalsPage() {
  const { professionals, appointments, addProfessional, updateProfessional, toggleProfessional } = useClinic();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const current = professionals.find((item) => item.id === editing) ?? null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      specialty: String(data.get("specialty") ?? ""),
      crm: String(data.get("crm") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
    };
    if (current) { updateProfessional(current.id, payload); toast.success("Profissional atualizado"); setEditing(null); }
    else { addProfessional(payload); toast.success("Profissional cadastrado"); setOpen(false); }
  }

  return <>
    <PageHeader eyebrow="Equipe clínica" title="Gestão de profissionais" description="Gerencie profissionais, especialidades e disponibilidade." action="Novo profissional" onAction={() => setOpen(true)} />
    <div className="grid gap-4 lg:grid-cols-3">{professionals.map((professional) => <article key={professional.id} className="surface p-4">
      <div className="flex items-start justify-between"><span className="avatar">{professional.initials}</span><StatusBadge status={professional.active ? "Ativo" : "Inativo"} /></div>
      <h2 className="mt-4 font-semibold">{professional.name}</h2>
      <p className="text-sm text-muted-foreground">{professional.specialty} · {professional.crm}</p>
      <p className="text-sm text-muted-foreground">{professional.email}</p>
      <div className="mt-4 border-t border-border pt-4 text-sm"><b>{appointments.filter((item) => item.professionalId === professional.id).length}</b> consultas registradas</div>
      <div className="mt-4 grid gap-2"><Button variant="outline" onClick={() => setEditing(professional.id)}>Editar dados</Button><Button variant="ghost" onClick={() => { toggleProfessional(professional.id); toast.success(professional.active ? "Profissional inativado" : "Profissional ativado"); }}>{professional.active ? "Inativar acesso" : "Ativar acesso"}</Button></div>
    </article>)}</div>
    <Modal open={open || Boolean(current)} title={current ? "Editar profissional" : "Novo profissional"} onClose={() => { setOpen(false); setEditing(null); }}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Nome completo" name="name" defaultValue={current?.name ?? ""} required />
        <SelectField label="Especialidade" name="specialty" defaultValue={current?.specialty ?? specialties[0]} options={specialties.map((item) => ({ value: item, label: item }))} />
        <Field label="CRM" name="crm" defaultValue={current?.crm ?? ""} required />
        <Field label="Telefone" name="phone" defaultValue={current?.phone ?? ""} required />
        <Field label="E-mail" name="email" type="email" defaultValue={current?.email ?? ""} required className="sm:col-span-2" />
        <div className="sm:col-span-2"><Button type="submit">{current ? "Salvar alterações" : "Cadastrar profissional"}</Button></div>
      </form>
    </Modal>
  </>;
}

export function AdminReportsPage() {
  const reports = useReports();
  const { appointments } = useClinic();
  const max = Math.max(1, ...reports.perDay.map((day) => day.total));

  return <>
    <PageHeader eyebrow="Indicadores gerenciais" title="Relatórios" description="Analise consultas, faltas, ocupação e desempenho da clínica." />
    <Toolbar placeholder="Buscar indicador..." exportAction={() => toast.success("Relatório exportado", { description: `${appointments.length} consultas incluídas no arquivo demonstrativo.` })} />
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Consultas" value={String(reports.total)} detail={`${reports.done} concluídas`} icon={<CalendarCheck />} />
      <StatCard label="Faltas" value={String(reports.noShow)} detail={`${reports.total ? Math.round((reports.noShow / reports.total) * 100) : 0}% do total`} icon={<CircleAlert />} tone="warning" />
      <StatCard label="Presença" value={`${reports.attendance}%`} detail="Média histórica" icon={<Activity />} tone="success" />
    </div>
    <Section title="Consultas por dia" className="mt-5">
      <div className="flex h-48 items-end gap-2 sm:gap-3">{reports.perDay.map((day) => <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2"><span className="text-[10px] text-muted-foreground">{day.total}</span><div className="w-full max-w-10 rounded-t-sm bg-primary/80" style={{ height: `${(day.total / max) * 125 + 4}px` }} /><span className="text-[10px] text-muted-foreground sm:text-xs">{formatDate(day.date).slice(0, 5)}</span></div>)}</div>
    </Section>
    <Section title="Ocupação por profissional" className="mt-5">
      <div className="space-y-3">{reports.bySpecialty.map((item) => <div key={item.professional} className="grid grid-cols-[minmax(0,100px)_minmax(60px,1fr)_38px] items-center gap-2 text-xs sm:grid-cols-[minmax(0,140px)_1fr_44px] sm:gap-3 sm:text-sm"><span className="truncate">{item.professional}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${item.occupancy}%` }} /></div><b>{item.occupancy}%</b></div>)}</div>
    </Section>
  </>;
}

export function AdminSettingsPage() {
  const { settings, updateSettings, staff } = useClinic();
  return <>
    <PageHeader eyebrow="Administração" title="Configurações" description="Atualize os dados institucionais e preferências gerais." />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Section title="Dados da clínica">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          updateSettings({ name: String(data.get("name") ?? ""), cnpj: String(data.get("cnpj") ?? ""), phone: String(data.get("phone") ?? ""), email: String(data.get("email") ?? "") });
          toast.success("Configurações salvas", { description: "Os dados da clínica foram atualizados." });
        }}>
          <Field label="Nome da clínica" name="name" defaultValue={settings.name} required />
          <Field label="CNPJ" name="cnpj" defaultValue={settings.cnpj} required />
          <Field label="Telefone" name="phone" defaultValue={settings.phone} required />
          <Field label="E-mail" name="email" type="email" defaultValue={settings.email} required />
          <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
        </form>
      </Section>
      <Section title="Preferências de lembretes">
        <div className="space-y-4">
          <Toggle label="Confirmação automática" description="Consultas já criadas confirmadas" checked={settings.autoConfirm} onChange={(value) => { updateSettings({ autoConfirm: value }); toast.success(value ? "Confirmação automática ativada" : "Confirmação automática desativada"); }} />
          <SelectField label="Antecedência do lembrete" value={String(settings.reminderHours)} onChange={(event) => { updateSettings({ reminderHours: Number(event.target.value) }); toast.success("Antecedência atualizada"); }} options={[{ value: "12", label: "12 horas" }, { value: "24", label: "24 horas" }, { value: "48", label: "48 horas" }]} />
          <div className="border-t border-border pt-4"><p className="text-sm font-semibold">Equipe interna</p>{staff.map((item) => <p key={item.id} className="mt-1 text-xs text-muted-foreground">{item.name} · {item.email}</p>)}</div>
        </div>
      </Section>
    </div>
  </>;
}
