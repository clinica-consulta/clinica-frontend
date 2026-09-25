import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Activity, Bell, CalendarCheck, CalendarClock, CalendarDays, Check, CheckCircle2, CircleAlert, Clock3, Lock, ShieldCheck, Stethoscope, Tags, UserCheck, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, Modal, PageHeader, Section, SelectField, StatCard, StatusBadge, Toggle, Toolbar } from "@/components/page-kit";
import { AppointmentForm } from "@/components/appointment-form";
import { RescheduleModal } from "@/components/clinic-pages";
import { formatDate, isoDate, openStatuses, relativeDay, weekdays, type Appointment } from "@/lib/clinic-data";
import { useClinic, useReports } from "@/lib/clinic-store";

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
  const { notificationsFor } = useClinic();
  const items = notificationsFor(role);
  return <Section title={`Recentes (${items.length})`}>
    {items.length ? <div className="space-y-3">{items.map((item) => <article key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-md border border-border p-3">
      <span className="metric-icon metric-info size-10"><Bell /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.text}</p><p className="mt-1 text-[11px] text-muted-foreground">{formatDate(item.createdAt)}</p></div>
    </article>)}</div> : <EmptyHint>Nenhuma notificação por aqui.</EmptyHint>}
  </Section>;
}

/* ---------------- Paciente ---------------- */

export function PatientDashboardPage() {
  const { clinic, patient, mine } = usePatientScope();
  const navigate = useNavigate();
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const upcoming = mine.filter((item) => openStatuses.includes(item.status)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const history = mine.filter((item) => !openStatuses.includes(item.status)).sort((a, b) => b.date.localeCompare(a.date));

  return <>
    <PageHeader eyebrow="Área do paciente" title={`Olá, ${patient?.name.split(" ")[0] ?? "paciente"}`} description="Bem-vindo(a)! Confirme, cancele, remarque e acompanhe o status das suas consultas." action="Agendar consulta" onAction={() => navigate({ to: "/paciente/agendar" })} />
    <div className="grid gap-6">
      <Section title={`Próximas consultas (${upcoming.length})`}>
        {upcoming.length ? <div className="divide-y divide-border">{upcoming.map((item) => <AppointmentRow key={item.id} item={item} right={<div className="flex flex-wrap gap-2">
          {item.confirmationReply !== "Confirmou" && <Button size="sm" onClick={() => { clinic.setAppointmentStatus(item.id, "Confirmada", "Paciente confirmou presença"); toast.success("Consulta confirmada"); }}>Confirmar</Button>}
          <Button size="sm" variant="outline" onClick={() => setReschedule(item)}>Remarcar</Button>
          <Button size="sm" variant="outline" onClick={() => setDetail(item)}>Detalhes</Button>
          <Button size="sm" variant="ghost" onClick={() => { clinic.setAppointmentStatus(item.id, "Cancelada", "Consulta cancelada pelo paciente"); toast.warning("Consulta cancelada"); }}>Cancelar</Button>
        </div>} />)}</div> : <EmptyHint>Nenhuma consulta agendada.</EmptyHint>}
      </Section>
      <Section title={`Histórico (${history.length})`}>
        {history.length ? <div className="divide-y divide-border">{history.map((item) => <AppointmentRow key={item.id} item={item} right={<Button size="sm" variant="outline" onClick={() => setDetail(item)}>Detalhes</Button>} />)}</div> : <EmptyHint>Você ainda não tem consultas anteriores.</EmptyHint>}
      </Section>
    </div>
    <RescheduleModal appointment={reschedule} onClose={() => setReschedule(null)} />
    <Modal open={Boolean(detail)} title="Dados da consulta" description={detail ? `${detail.specialty} · ${formatDate(detail.date)} às ${detail.time}` : ""} onClose={() => setDetail(null)}>
      {detail && <div className="space-y-2 text-sm">
        <p><b>Médico:</b> {clinic.professionalById(detail.professionalId)?.name}</p>
        <p><b>Especialidade:</b> {detail.specialty}</p>
        <p><b>Data:</b> {formatDate(detail.date)}</p>
        <p><b>Horário:</b> {detail.time}</p>
        <p><b>Status:</b> {detail.status}</p>
        <p><b>Sua resposta:</b> {detail.confirmationReply}</p>
        <p><b>Observações:</b> {detail.notes || "—"}</p>
      </div>}
    </Modal>
  </>;
}

export function PatientBookingPage() {
  const { patient } = usePatientScope();
  return <>
    <PageHeader eyebrow="Novo atendimento" title="Agendar consulta" description="Escolha a especialidade, o médico e um horário disponível." />
    <Section title="Dados do agendamento">{patient ? <AppointmentForm fixedPatientId={patient.id} channel="Paciente" /> : <EmptyHint>Cadastro do paciente não encontrado.</EmptyHint>}</Section>
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
    <PageHeader eyebrow="Seus dados" title="Meu perfil" description="Visualize e atualize seus dados pessoais e o convênio." />
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
          insurance: String(data.get("insurance") ?? "Particular"),
        });
        toast.success("Perfil atualizado", { description: "Suas informações foram salvas." });
      }}>
        <Field label="Nome completo" name="name" defaultValue={patient.name} required />
        <Field label="CPF" name="cpf" defaultValue={patient.cpf} required />
        <Field label="Telefone" name="phone" defaultValue={patient.phone} required />
        <Field label="E-mail" name="email" type="email" defaultValue={patient.email} required />
        <Field label="Data de nascimento" name="birthDate" type="date" defaultValue={patient.birthDate} required />
        <SelectField label="Convênio" name="insurance" defaultValue={patient.insurance} options={clinic.insurances.map((item) => ({ value: item.name, label: item.name }))} />
        <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
      </form>
    </Section>
  </>;
}

/* ---------------- Médico ---------------- */

export function ProfessionalDashboardPage() {
  const { clinic, professional, mine } = useProfessionalScope();
  const today = mine.filter((item) => item.date === isoDate(0) && item.status !== "Cancelada");
  const open = today.filter((item) => openStatuses.includes(item.status)).sort((a, b) => a.time.localeCompare(b.time));
  const done = today.filter((item) => item.status === "Realizada");

  return <>
    <PageHeader eyebrow="Área médica" title={`Bom dia, ${professional?.name.split(" ").slice(0, 2).join(" ") ?? ""}`} description="Acompanhe sua agenda do dia e registre o resultado dos atendimentos." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Consultas hoje" value={String(today.length)} detail={`${today.filter((item) => item.status === "Confirmada").length} confirmadas`} icon={<CalendarCheck />} />
      <StatCard label="Em aberto" value={String(open.length)} detail="Aguardando atendimento" icon={<Clock3 />} tone="warning" />
      <StatCard label="Realizadas" value={String(done.length)} detail="Até o momento" icon={<CheckCircle2 />} tone="success" />
      <StatCard label="Meus pacientes" value={String(new Set(mine.map((item) => item.patientId)).size)} detail="Vinculados a você" icon={<Activity />} tone="info" />
    </div>
    <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
      <Section title="Atendimentos de hoje">
        {open.length ? <div className="divide-y divide-border">{open.map((item) => <AppointmentRow key={item.id} item={item} right={<Button size="sm" onClick={() => { clinic.setAppointmentStatus(item.id, "Realizada", "Consulta realizada"); toast.success("Consulta registrada como realizada"); }}>Realizada</Button>} />)}</div> : <EmptyHint>Sem atendimentos em aberto para hoje.</EmptyHint>}
      </Section>
      <Section title="Resumo do dia">
        <div className="space-y-3">
          {today.filter((item) => item.confirmationReply === "Sem resposta").map((item) => <Notice key={item.id} icon={<CircleAlert />} title="Confirmação pendente" text={`${clinic.patientById(item.patientId)?.name} ainda não confirmou o horário de ${item.time}.`} />)}
          <Notice icon={<UserCheck />} title={`${done.length} consulta(s) realizada(s)`} text="Registros enviados para o histórico do paciente." />
        </div>
      </Section>
    </div>
  </>;
}

export function ProfessionalAgendaPage() {
  const { clinic, professional, mine } = useProfessionalScope();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(isoDate(0));
  const blocks = professional ? clinic.blocks.filter((item) => item.professionalId === professional.id && item.startDate <= date && item.endDate >= date) : [];
  const [detail, setDetail] = useState<Appointment | null>(null);
  const today = mine
    .filter((item) => item.date === date && item.status !== "Cancelada")
    .filter((item) => (clinic.patientById(item.patientId)?.name ?? "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.time.localeCompare(b.time));

  return <>
    <PageHeader eyebrow="Organização diária" title="Minha agenda" description="Visualize sua agenda e registre consultas realizadas e ausências." />
    <div className="mb-4 grid gap-2.5 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-end"><Field label="Data" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><Toolbar placeholder="Buscar paciente..." value={search} onChange={setSearch} /></div>
    <Section title={`${formatDate(date)} · ${today.length} atendimento(s)`}>
      {blocks.map((block) => <p key={block.id} className="mb-2 text-xs text-warning-strong">Período bloqueado: {block.startTime}–{block.endTime} · {block.reason}</p>)}
      {today.length ? <div className="divide-y divide-border">{today.map((item) => <AppointmentRow key={item.id} item={item} right={<div className="flex flex-wrap gap-2">
        {openStatuses.includes(item.status) && <Button size="sm" onClick={() => { clinic.setAppointmentStatus(item.id, "Realizada", "Consulta realizada"); toast.success("Consulta registrada como realizada"); }}>Realizada</Button>}
        {openStatuses.includes(item.status) && <Button size="sm" variant="ghost" onClick={() => { clinic.setAppointmentStatus(item.id, "Não compareceu", "Ausência registrada pelo médico"); toast.warning("Ausência registrada"); }}>Não compareceu</Button>}
        <Button size="sm" variant="outline" onClick={() => setDetail(item)}>Ficha</Button>
      </div>} />)}</div> : <EmptyHint>Nenhum atendimento nesta data.</EmptyHint>}
    </Section>
    <Modal open={Boolean(detail)} title="Ficha do atendimento" description={detail ? `${clinic.patientById(detail.patientId)?.name} · ${detail.time}` : ""} onClose={() => setDetail(null)}>
      {detail && <div className="space-y-2 text-sm">
        <p><b>Paciente:</b> {clinic.patientById(detail.patientId)?.name}</p>
        <p><b>Data:</b> {formatDate(detail.date)}</p>
        <p><b>Horário:</b> {detail.time}</p>
        <p><b>Especialidade:</b> {detail.specialty}</p>
        <p><b>Status:</b> {detail.status}</p>
        <p><b>Convênio:</b> {clinic.patientById(detail.patientId)?.insurance ?? "—"}</p>
        <p><b>Observações:</b> {detail.notes || "—"}</p>
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
      const last = history.filter((item) => item.status === "Realizada").sort((a, b) => b.date.localeCompare(a.date))[0];
      return <article key={patient!.id} className="surface p-4">
        <span className="avatar">{patient!.initials}</span>
        <h2 className="mt-4 font-semibold">{patient!.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{patient!.phone}</p>
        <p className="text-sm text-muted-foreground">Convênio: {patient!.insurance}</p>
        <div className="mt-4 grid grid-cols-2 border-t border-border pt-4 text-center text-xs"><div><b className="block text-lg">{history.length}</b>atendimentos</div><div className="border-l border-border"><b className="block text-lg">{last ? formatDate(last.date).slice(0, 5) : "—"}</b>último</div></div>
      </article>;
    })}</div> : <EmptyHint>Nenhum paciente encontrado.</EmptyHint>}
  </>;
}

export function ProfessionalAvailabilityPage() {
  const { clinic, professional } = useProfessionalScope();
  if (!professional) return <EmptyHint>Perfil médico não encontrado.</EmptyHint>;
  const blocks = clinic.blocks.filter((item) => item.professionalId === professional.id);
  return <>
    <PageHeader eyebrow="Agenda médica" title="Meus horários" description="Consulte seus horários de atendimento. Alterações são feitas pela administração." />
    <Section title="Horários da semana">
      <div className="space-y-2">{weekdays.map((day) => {
        const value = professional.availability[day.value] ?? { active: false, start: "08:00", end: "17:00" };
        return <div key={day.value} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md bg-muted/55 px-3 py-2.5 text-sm">
          <span>{day.label}</span>
          <b className="text-xs sm:text-sm">{value.active ? `${value.start} – ${value.end}` : "Sem atendimento"}</b>
        </div>;
      })}</div>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" />Somente a administração pode alterar agendas médicas.</p>
    </Section>
    <Section title="Bloqueios registrados" className="mt-5">
      {blocks.length ? <div className="space-y-2">{blocks.map((block) => <div key={block.id} className="rounded-md border border-border p-3 text-xs sm:text-sm"><b>{formatDate(block.startDate)} a {formatDate(block.endDate)}</b><p className="text-muted-foreground">{block.startTime}–{block.endTime} · {block.reason}</p></div>)}</div> : <EmptyHint>Nenhum período bloqueado na sua agenda.</EmptyHint>}
    </Section>
  </>;
}

export function ProfessionalNotificationsPage() {
  return <>
    <PageHeader eyebrow="Atualizações" title="Notificações" description="Acompanhe confirmações e alterações da sua agenda." />
    <NotificationList role="professional" />
  </>;
}

export function ProfessionalProfilePage() {
  const { clinic, professional } = useProfessionalScope();
  if (!professional) return <EmptyHint>Perfil não encontrado.</EmptyHint>;
  return <>
    <PageHeader eyebrow="Dados profissionais" title="Meu perfil" description="Atualize seus dados de contato." />
    <Section title="Informações profissionais">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        clinic.updateProfessional(professional.id, {
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
        });
        toast.success("Perfil atualizado", { description: "Suas informações foram salvas." });
      }}>
        <Field label="Nome completo" name="name" defaultValue={professional.name} required />
        <Field label="E-mail" name="email" type="email" defaultValue={professional.email} required />
        <Field label="Telefone" name="phone" defaultValue={professional.phone} required />
        <Field label="Especialidade" defaultValue={professional.specialty} disabled />
        <Field label="CRM" defaultValue={professional.crm} disabled />
        <Field label="Perfil" defaultValue="Médico" disabled />
        <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
      </form>
    </Section>
  </>;
}

/* ---------------- Administrador ---------------- */

export function AdminDashboardPage() {
  const { patients, professionals, appointments, staff, specialties } = useClinic();
  const reports = useReports();
  const monthly = appointments.filter((item) => item.date.slice(0, 7) === isoDate(0).slice(0, 7)).length;

  return <>
    <PageHeader eyebrow="Administração" title="Visão geral" description="Acompanhe usuários, médicos, especialidades e indicadores da clínica." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard label="Usuários" value={String(patients.length + professionals.length + staff.length)} detail={`${patients.length} pacientes`} icon={<UsersRound />} />
      <StatCard label="Médicos ativos" value={String(professionals.filter((item) => item.active).length)} detail={`${specialties.filter((item) => item.active).length} especialidades ativas`} icon={<Stethoscope />} tone="info" />
      <StatCard label="Consultas no mês" value={String(monthly)} detail={`${reports.attendance}% de presença`} icon={<CalendarDays />} tone="success" />
    </div>
    <div className="mt-5 grid gap-4">
      <Section title="Desempenho da clínica">
        <div className="space-y-4">
          {[["Consultas registradas", String(reports.total)], ["Taxa de presença", `${reports.attendance}%`], ["Não compareceu", String(reports.noShow)], ["Cancelamentos", String(reports.canceled)]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-border pb-3 text-sm"><span className="text-muted-foreground">{label}</span><b>{value}</b></div>)}
        </div>
      </Section>
    </div>
  </>;
}

export function AdminUsersPage() {
  const { staff, patients, professionals, addStaff, updateStaff, togglePatientStatus, toggleProfessional } = useClinic();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("Todos");
  const rows = [
    ...staff.map((item) => ({ id: item.id, name: item.name, email: item.email, role: item.role === "admin" ? "Administrador" : "Recepção", status: item.status as string, toggle: () => { updateStaff(item.id, { status: item.status === "Ativo" ? "Inativo" : "Ativo" }); toast.success("Acesso atualizado"); } })),
    ...professionals.map((item) => ({ id: item.id, name: item.name, email: item.email, role: "Médico", status: item.active ? "Ativo" : "Inativo", toggle: () => { toggleProfessional(item.id); toast.success("Acesso atualizado"); } })),
    ...patients.map((item) => ({ id: item.id, name: item.name, email: item.email, role: "Paciente", status: item.status as string, toggle: () => { togglePatientStatus(item.id); toast.success("Acesso atualizado"); } })),
  ]
    .filter((item) => (role === "Todos" ? true : item.role === role))
    .filter((item) => `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(search.toLowerCase()));

  return <>
    <PageHeader eyebrow="Controle de acesso" title="Usuários e permissões" description="Gerencie contas e os perfis de acesso da plataforma." action="Novo usuário" onAction={() => setOpen(true)} />
    <Toolbar placeholder="Buscar nome ou e-mail..." value={search} onChange={setSearch} filter={<SelectField label="" aria-label="Filtrar perfil" value={role} onChange={(event) => setRole(event.target.value)} options={["Todos", "Paciente", "Recepção", "Médico", "Administrador"].map((item) => ({ value: item, label: item }))} />} />
    <Section title={`Usuários cadastrados (${rows.length})`}>
      {rows.length ? <div className="space-y-3">{rows.map((item) => <div key={`${item.role}-${item.id}`} className="grid gap-2.5 rounded-md border border-border p-3 md:grid-cols-[minmax(0,1fr)_140px_105px_auto] md:items-center">
        <div className="min-w-0"><b className="block truncate">{item.name}</b><span className="text-xs text-muted-foreground">{item.email}</span></div>
        <span className="text-sm text-muted-foreground">{item.role}</span>
        <StatusBadge status={item.status} />
        <Button variant="outline" size="sm" onClick={item.toggle}>{item.status === "Ativo" ? "Desativar" : "Ativar"}</Button>
      </div>)}</div> : <EmptyHint>Nenhum usuário encontrado.</EmptyHint>}
    </Section>
    <Modal open={open} title="Novo usuário interno" description="Cadastre equipe de recepção e administradores." onClose={() => setOpen(false)}>
      <form className="grid gap-4" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        addStaff({ name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), role: String(data.get("role") ?? "receptionist") as "receptionist" | "admin", status: "Ativo" });
        toast.success("Usuário cadastrado");
        setOpen(false);
      }}>
        <Field label="Nome completo" name="name" required />
        <Field label="E-mail" name="email" type="email" required />
        <SelectField label="Perfil de acesso" name="role" options={[{ value: "receptionist", label: "Recepção / Equipe de marcação" }, { value: "admin", label: "Administrador" }]} />
        <Button type="submit">Cadastrar usuário</Button>
      </form>
    </Modal>
  </>;
}

export function AdminProfessionalsPage() {
  const { professionals, appointments, activeSpecialties, addProfessional, updateProfessional, toggleProfessional } = useClinic();
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
    if (current) { updateProfessional(current.id, payload); toast.success("Médico atualizado"); setEditing(null); }
    else { addProfessional(payload); toast.success("Médico cadastrado"); setOpen(false); }
  }

  return <>
    <PageHeader eyebrow="Equipe clínica" title="Gestão de médicos" description="Cadastre, edite e desative médicos sem apagar o histórico de consultas." action="Novo médico" onAction={() => setOpen(true)} />
    <div className="grid gap-4 lg:grid-cols-3">{professionals.map((professional) => <article key={professional.id} className="surface p-4">
      <div className="flex items-start justify-between"><span className="avatar">{professional.initials}</span><StatusBadge status={professional.active ? "Ativo" : "Inativo"} /></div>
      <h2 className="mt-4 font-semibold">{professional.name}</h2>
      <p className="text-sm text-muted-foreground">{professional.specialty} · {professional.crm}</p>
      <p className="text-sm text-muted-foreground">{professional.email}</p>
      <div className="mt-4 border-t border-border pt-4 text-sm"><b>{appointments.filter((item) => item.professionalId === professional.id).length}</b> consultas registradas</div>
      <div className="mt-4 grid gap-2"><Button variant="outline" onClick={() => setEditing(professional.id)}>Editar dados</Button><Button variant="ghost" onClick={() => { toggleProfessional(professional.id); toast.success(professional.active ? "Médico desativado (histórico preservado)" : "Médico ativado"); }}>{professional.active ? "Desativar" : "Ativar"}</Button></div>
    </article>)}</div>
    <Modal open={open || Boolean(current)} title={current ? "Editar médico" : "Novo médico"} onClose={() => { setOpen(false); setEditing(null); }}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Nome completo" name="name" defaultValue={current?.name ?? ""} required />
        <SelectField label="Especialidade" name="specialty" defaultValue={current?.specialty ?? activeSpecialties[0] ?? ""} options={activeSpecialties.map((item) => ({ value: item, label: item }))} />
        <Field label="CRM" name="crm" defaultValue={current?.crm ?? ""} required />
        <Field label="Telefone" name="phone" defaultValue={current?.phone ?? ""} required />
        <Field label="E-mail" name="email" type="email" defaultValue={current?.email ?? ""} required className="sm:col-span-2" />
        <div className="sm:col-span-2"><Button type="submit">{current ? "Salvar alterações" : "Cadastrar médico"}</Button></div>
      </form>
    </Modal>
  </>;
}

export function AdminSpecialtiesPage() {
  const { specialties, professionals, appointments, insurances, addSpecialty, updateSpecialty, toggleSpecialty } = useClinic();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const current = specialties.find((item) => item.id === editing) ?? null;

  return <>
    <PageHeader eyebrow="Configuração clínica" title="Especialidades" description="Cadastre, edite e desative especialidades sem apagar consultas anteriores." action="Nova especialidade" onAction={() => setOpen(true)} />
    <Section title={`Especialidades (${specialties.length})`}>
      <div className="space-y-3">{specialties.map((item) => <div key={item.id} className="grid gap-2.5 rounded-md border border-border p-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
        <div className="min-w-0"><b className="block truncate">{item.name}</b><span className="text-xs text-muted-foreground">{professionals.filter((pro) => pro.specialty === item.name).length} médico(s) · {appointments.filter((appointment) => appointment.specialty === item.name).length} consulta(s)</span></div>
        <span className="text-xs text-muted-foreground">Convênios: {insurances.filter((plan) => plan.active && (!plan.covered.length || plan.covered.includes(item.name))).map((plan) => plan.name).join(", ") || "—"}</span>
        <StatusBadge status={item.active ? "Ativo" : "Inativo"} />
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(item.id)}>Editar</Button><Button variant="ghost" size="sm" onClick={() => { toggleSpecialty(item.id); toast.success(item.active ? "Especialidade desativada" : "Especialidade ativada"); }}>{item.active ? "Desativar" : "Ativar"}</Button></div>
      </div>)}</div>
    </Section>
    <Modal open={open || Boolean(current)} title={current ? "Editar especialidade" : "Nova especialidade"} onClose={() => { setOpen(false); setEditing(null); }}>
      <form className="grid gap-4" onSubmit={(event) => {
        event.preventDefault();
        const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
        if (!name) return;
        if (current) { updateSpecialty(current.id, name); toast.success("Especialidade atualizada"); setEditing(null); }
        else { addSpecialty(name); toast.success("Especialidade cadastrada"); setOpen(false); }
      }}>
        <Field label="Nome da especialidade" name="name" defaultValue={current?.name ?? ""} required />
        <Button type="submit">{current ? "Salvar alterações" : "Cadastrar especialidade"}</Button>
      </form>
    </Modal>
  </>;
}

export function AdminSchedulesPage() {
  const { professionals, appointments, blocks, patientById, setAvailability, addBlock, removeBlock } = useClinic();
  const [selected, setSelected] = useState(professionals[0]?.id ?? "");
  const [date, setDate] = useState(isoDate(0));
  const [blockOpen, setBlockOpen] = useState(false);
  const professional = professionals.find((item) => item.id === selected) ?? professionals[0] ?? null;

  return <>
    <PageHeader eyebrow="Agendas médicas" title="Agendas e horários" description="Defina horários de atendimento, bloqueie períodos e veja a agenda centralizada." action="Bloquear período" onAction={() => setBlockOpen(true)} />
    <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:max-w-2xl">
      <SelectField label="Médico" value={professional?.id ?? ""} onChange={(event) => setSelected(event.target.value)} options={professionals.map((item) => ({ value: item.id, label: item.name }))} />
      <Field label="Dia da agenda centralizada" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
    </div>
    {professional && <Section title={`Horários de atendimento · ${professional.name}`}>
      <div className="space-y-3">{weekdays.map((day) => {
        const value = professional.availability[day.value] ?? { active: false, start: "08:00", end: "17:00" };
        return <div key={day.value} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[140px_1fr_1fr_auto] md:items-end">
          <b className="self-center">{day.label}</b>
          <Field label="Início" type="time" value={value.start} onChange={(event) => setAvailability(professional.id, day.value, { ...value, start: event.target.value })} />
          <Field label="Fim" type="time" value={value.end} onChange={(event) => setAvailability(professional.id, day.value, { ...value, end: event.target.value })} />
          <Button variant={value.active ? "default" : "outline"} onClick={() => { setAvailability(professional.id, day.value, { ...value, active: !value.active }); toast.success(value.active ? `${day.label} sem atendimento` : `${day.label} liberada`); }}>{value.active ? "Atende" : "Não atende"}</Button>
        </div>;
      })}</div>
    </Section>}

    <Section title={`Bloqueios (${blocks.length})`} className="mt-5">
      {blocks.length ? <div className="space-y-2">{blocks.map((block) => <div key={block.id} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0"><b className="text-sm">{professionals.find((item) => item.id === block.professionalId)?.name ?? "Médico"}</b><p className="text-xs text-muted-foreground">{formatDate(block.startDate)} a {formatDate(block.endDate)} · {block.startTime}–{block.endTime} · {block.reason}</p></div>
        <Button variant="ghost" size="sm" onClick={() => { removeBlock(block.id); toast.success("Bloqueio removido"); }}>Remover</Button>
      </div>)}</div> : <EmptyHint>Nenhum período bloqueado.</EmptyHint>}
    </Section>

    <Section title={`Agenda centralizada · ${formatDate(date)}`} className="mt-5">
      <div className="space-y-4">{professionals.map((item) => {
        const dayItems = appointments.filter((appointment) => appointment.professionalId === item.id && appointment.date === date && appointment.status !== "Cancelada").sort((a, b) => a.time.localeCompare(b.time));
        return <div key={item.id} className="rounded-md border border-border p-3">
          <b className="text-sm">{item.name}</b>
          <div className="mt-2 space-y-1.5">{dayItems.length ? dayItems.map((appointment) => <div key={appointment.id} className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-2 text-xs"><b className="text-primary">{appointment.time}</b><span className="truncate">{patientById(appointment.patientId)?.name}</span><StatusBadge status={appointment.status} /></div>) : <p className="text-xs text-muted-foreground">Sem consultas nesta data.</p>}</div>
        </div>;
      })}</div>
    </Section>

    <Modal open={blockOpen} title="Bloquear horário ou período" description="Nenhuma consulta poderá ser agendada nesse intervalo." onClose={() => setBlockOpen(false)}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        addBlock({
          professionalId: String(data.get("professionalId") ?? ""),
          startDate: String(data.get("startDate") ?? isoDate(0)),
          endDate: String(data.get("endDate") ?? isoDate(0)),
          startTime: String(data.get("startTime") ?? "08:00"),
          endTime: String(data.get("endTime") ?? "18:00"),
          reason: String(data.get("reason") ?? ""),
        });
        toast.success("Período bloqueado");
        setBlockOpen(false);
      }}>
        <SelectField label="Médico" name="professionalId" className="sm:col-span-2" options={professionals.map((item) => ({ value: item.id, label: item.name }))} />
        <Field label="Data inicial" name="startDate" type="date" defaultValue={isoDate(1)} required />
        <Field label="Data final" name="endDate" type="date" defaultValue={isoDate(1)} required />
        <Field label="Hora inicial" name="startTime" type="time" defaultValue="08:00" required />
        <Field label="Hora final" name="endTime" type="time" defaultValue="18:00" required />
        <Field label="Motivo" name="reason" className="sm:col-span-2" placeholder="Férias, congresso, reunião..." required />
        <div className="sm:col-span-2"><Button type="submit">Bloquear</Button></div>
      </form>
    </Modal>
  </>;
}

export function AdminSettingsPage() {
  const { settings, updateSettings, insurances, staff } = useClinic();
  return <>
    <PageHeader eyebrow="Administração" title="Configurações" description="Atualize os dados institucionais, convênios e preferências gerais." />
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
      <Section title="Convênios e cobertura">
        <div className="space-y-3">
          {insurances.map((plan) => <div key={plan.id} className="rounded-md border border-border p-3 text-xs sm:text-sm">
            <b>{plan.name}</b>
            <p className="text-muted-foreground">{plan.covered.length ? `Cobre: ${plan.covered.join(", ")}` : "Atendimento particular (todas as especialidades)"}</p>
          </div>)}
        </div>
      </Section>
    </div>
    <Section title="Preferências de confirmação" className="mt-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <Toggle label="Confirmação automática" description="Consultas já criadas como confirmadas" checked={settings.autoConfirm} onChange={(value) => { updateSettings({ autoConfirm: value }); toast.success(value ? "Confirmação automática ativada" : "Confirmação automática desativada"); }} />
        <SelectField label="Antecedência do lembrete" value={String(settings.reminderHours)} onChange={(event) => { updateSettings({ reminderHours: Number(event.target.value) }); toast.success("Antecedência atualizada"); }} options={[{ value: "12", label: "12 horas" }, { value: "24", label: "24 horas" }, { value: "48", label: "48 horas" }]} />
        <div className="lg:col-span-2 border-t border-border pt-4"><p className="text-sm font-semibold">Equipe interna</p>{staff.map((item) => <p key={item.id} className="mt-1 text-xs text-muted-foreground">{item.name} · {item.email} · {item.role === "admin" ? "Administrador" : "Recepção"}</p>)}</div>
      </div>
    </Section>
  </>;
}
