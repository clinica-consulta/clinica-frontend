import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, BadgeCheck, BarChart3, RefreshCw, Shield, TrendingUp, UserX, Bell, BriefcaseMedical, CalendarRange, CheckCheck, ClipboardList, ClipboardPlus, FileText, HeartPulse, Info, MoreVertical, SlidersHorizontal, ChevronRight, CircleX, Eye, Headset, History, MapPin, Plus, Syringe, CalendarCheck, CalendarClock, CalendarDays, Check, CheckCircle2, CircleAlert, Clock3, Lock, ShieldCheck, Stethoscope, Tags, UserCheck, UsersRound, X } from "lucide-react";
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
  const history = mine.filter((item) => !openStatuses.includes(item.status)).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const pendingConfirm = upcoming.filter((item) => item.confirmationReply !== "Confirmou").length;
  const confirm = (item: Appointment) => { clinic.setAppointmentStatus(item.id, "Confirmada", "Paciente confirmou presença"); toast.success("Consulta confirmada"); };
  const cancel = (item: Appointment) => { clinic.setAppointmentStatus(item.id, "Cancelada", "Consulta cancelada pelo paciente"); toast.warning("Consulta cancelada"); };
  const doctorName = (item: Appointment) => clinic.professionalById(item.professionalId)?.name ?? "";

  return <>
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[28px] font-bold leading-9 tracking-[-0.8px] md:text-[32px] md:leading-10">Olá, {patient?.name.split(" ")[0] ?? "paciente"}</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground md:leading-5">Bem-vindo(a)! Confirme, cancele, remarque e acompanhe o status das suas consultas.</p>
      </div>
      <Button onClick={() => navigate({ to: "/paciente/agendar" })} className="h-11 w-full rounded-xl px-5 text-[15px] font-semibold md:w-auto md:rounded-lg"><Plus />Agendar consulta</Button>
    </header>

    <section className="md:surface md:overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-1 pb-3 md:bg-soft/60 md:px-6 md:py-3.5">
        <h2 className="eyebrow flex items-center gap-1.5 text-foreground md:text-muted-foreground"><CalendarDays className="hidden size-4 text-foreground md:block" />Próximas consultas ({upcoming.length})</h2>
        {upcoming[0] && <span className="flex items-center gap-1 text-xs font-medium text-success md:hidden"><Clock3 className="size-3.5" />{relativeDay(upcoming[0].date)}</span>}
        {pendingConfirm > 0 && <span className="hidden rounded-full bg-success-soft/60 px-2 py-0.5 text-[11px] font-medium text-success md:inline">{pendingConfirm} confirmação pendente</span>}
      </div>
      {upcoming.length ? <div className="grid gap-3 md:gap-0 md:divide-y md:divide-border/60">{upcoming.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-xl border-t-4 border-success bg-card md:border-border/60 shadow-[0_1px_1px_rgb(0_0_0/5%)] md:rounded-none md:border-t-0 md:shadow-none">
          <div className="hidden items-center gap-6 px-6 py-6 md:flex">
            <div className="grid w-[98px] shrink-0 place-items-center rounded-xl bg-soft py-3"><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Horário</span><b className="text-[26px] font-bold leading-8">{item.time}</b></div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-base font-bold leading-6">{patient?.name}<span className="rounded bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">Presencial</span></p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">{doctorName(item)}</span><Dot />{item.specialty}<Dot /><span className="flex items-center gap-1 font-medium text-success"><CalendarCheck className="size-3.5" />{relativeDay(item.date)}</span></p>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-subtle-foreground"><MapPin className="size-3.5" />Unidade Jardins — Sala 402, 4º Andar</p>
            </div>
            <StatusBadge status={item.status} />
            <div className="flex shrink-0 items-center gap-2">
              {item.confirmationReply !== "Confirmou" && <Button onClick={() => confirm(item)} className="h-10 rounded-lg bg-strong px-4 hover:bg-strong/90"><CheckCircle2 />Confirmar</Button>}
              <Button variant="ghost" onClick={() => setReschedule(item)} className="h-10 rounded-lg bg-soft px-3.5 font-semibold hover:bg-accent">Remarcar</Button>
              <Button variant="ghost" onClick={() => setDetail(item)} className="h-10 rounded-lg bg-soft px-3.5 font-semibold hover:bg-accent">Detalhes</Button>
              <Button variant="ghost" onClick={() => cancel(item)} className="h-10 rounded-lg px-3.5 font-medium text-subtle-foreground">Cancelar</Button>
            </div>
          </div>
          <div className="p-4 md:hidden">
            <div className="flex gap-3">
              <div className="grid h-[58px] w-[76px] shrink-0 place-items-center rounded-lg bg-soft"><b className="text-xl font-semibold leading-6">{item.time}</b><span className="text-xs text-muted-foreground">horário</span></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><p className="truncate text-base font-bold leading-6">{patient?.name}</p><span className="flex shrink-0 items-center gap-1 text-xs font-medium text-success"><span className="size-1.5 rounded-full bg-success" />{item.status}</span></div>
                <p className="truncate text-sm text-muted-foreground">{doctorName(item)} · {item.specialty}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />{relativeDay(item.date)} · Presencial</p>
              </div>
            </div>
            {item.confirmationReply !== "Confirmou" && <Button onClick={() => confirm(item)} className="mt-4 h-9 w-full rounded-lg"><CheckCircle2 />Confirmar presença</Button>}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setReschedule(item)} className="h-9 rounded-lg bg-soft font-semibold"><CalendarClock />Remarcar</Button>
              <Button variant="ghost" onClick={() => setDetail(item)} className="h-9 rounded-lg bg-soft font-semibold"><Eye />Detalhes</Button>
            </div>
            <button type="button" onClick={() => cancel(item)} className="mx-auto mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><CircleX className="size-3.5" />Cancelar consulta</button>
          </div>
        </article>
      ))}</div> : <div className="md:p-6"><EmptyHint>Nenhuma consulta agendada.</EmptyHint></div>}
    </section>

    <section className="mt-6 md:surface md:mt-8 md:overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-1 pb-3 md:bg-soft/60 md:px-6 md:py-3.5">
        <h2 className="eyebrow flex items-center gap-1.5 text-foreground md:text-muted-foreground"><History className="hidden size-4 text-foreground md:block" />Histórico ({history.length})</h2>
        <button type="button" className="flex items-center gap-0.5 text-xs font-medium text-foreground md:text-[13px] md:font-semibold">Ver todas<ChevronRight className="size-3.5" /></button>
      </div>
      {history.length ? <div className="divide-y divide-border/60 rounded-xl bg-card shadow-[0_1px_1px_rgb(0_0_0/5%)] md:rounded-none md:shadow-none">{history.map((item) => (
        <div key={item.id} className="flex items-center gap-4 px-4 py-4 md:gap-6 md:px-6">
          <b className="w-12 shrink-0 text-lg font-bold md:w-[62px] md:text-[17px]">{item.time}</b>
          <div className="min-w-0 flex-1"><p className="truncate text-base font-semibold leading-5 md:text-sm">{patient?.name}</p><p className="truncate text-[13px] text-muted-foreground"><span className="md:hidden">{doctorName(item)} · {item.specialty}</span><span className="hidden items-center gap-2 md:flex">{doctorName(item)}<Dot />{item.specialty}<Dot />{formatDate(item.date)}</span></p><p className="text-xs text-subtle-foreground md:hidden">{formatDate(item.date)}</p></div>
          <div className="flex shrink-0 flex-col items-end gap-1.5 md:flex-row md:items-center md:gap-6">
            <span className={`flex items-center gap-1.5 text-xs md:text-sm ${item.status === "Realizada" ? "font-medium text-success-strong" : "text-muted-foreground"}`}><span className={`size-1.5 rounded-full md:size-2 ${item.status === "Realizada" ? "bg-success" : "bg-subtle-foreground"}`} />{item.status}</span>
            <Button variant="ghost" size="sm" onClick={() => setDetail(item)} className="h-7 rounded-md bg-soft px-3 text-xs font-semibold md:h-8 md:text-sm">Detalhes</Button>
          </div>
        </div>
      ))}</div> : <EmptyHint>Você ainda não tem consultas anteriores.</EmptyHint>}
    </section>

    <div className="mt-6 hidden gap-4 md:mt-8 md:grid md:grid-cols-3">
      {[
        { icon: <BriefcaseMedical />, title: "Receitas e Exames", text: "Acesse laudos laboratoriais e prescrições digitais emitidas pelos especialistas." },
        { icon: <Syringe />, title: "Vacinação e Prevenção", text: "Acompanhe seu calendário imunológico e campanhas preventivas ativas." },
        { icon: <Headset />, title: "Central de Ajuda", text: "Dúvidas sobre preparo de exames ou horários de atendimento clínico." },
      ].map((card) => <article key={card.title} className="surface flex gap-4 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-soft text-foreground [&>svg]:size-[18px]">{card.icon}</span><div><p className="text-sm font-bold leading-5">{card.title}</p><p className="mt-1 text-xs leading-4 text-muted-foreground">{card.text}</p></div></article>)}
    </div>
    <div className="mt-6 flex items-center gap-3 rounded-xl bg-success-soft/50 p-4 md:hidden"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success"><ShieldCheck className="size-5" /></span><div><p className="text-sm font-bold leading-5">Elegibilidade confirmada</p><p className="text-xs leading-4 text-muted-foreground">Plano {patient?.insurance ?? "Particular"} cobre consultas com coparticipação zero.</p></div></div>

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

function Dot() { return <span className="size-1 rounded-full bg-input" />; }

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
  const navigate = useNavigate();
  const today = mine.filter((item) => item.date === isoDate(0) && item.status !== "Cancelada");
  const open = today.filter((item) => openStatuses.includes(item.status)).sort((a, b) => a.time.localeCompare(b.time));
  const done = today.filter((item) => item.status === "Realizada");
  const greeting = professional?.name.split(" ").slice(0, 2).join(" ") ?? "";
  const complete = (item: Appointment) => { clinic.setAppointmentStatus(item.id, "Realizada", "Consulta realizada"); toast.success("Consulta registrada como realizada"); };
  const stats = [
    { label: "Consultas hoje", value: today.length, detail: `${today.filter((item) => item.status === "Confirmada").length} confirmadas`, icon: <CalendarDays />, dot: "bg-success", accent: true },
    { label: "Em aberto", value: open.length, detail: "Aguardando atendimento", icon: <Clock3 />, dot: "bg-ring", accent: false },
    { label: "Realizadas", value: done.length, detail: "Até o momento", icon: <CheckCircle2 />, dot: "bg-input", accent: false },
    { label: "Meus pacientes", value: new Set(mine.map((item) => item.patientId)).size, detail: "Vinculados a você", icon: <HeartPulse />, dot: "bg-success", accent: true },
  ];

  return <>
    <header className="mb-6">
      <p className="mb-1 hidden text-[11px] font-bold uppercase leading-4 tracking-[1.1px] text-muted-foreground md:block">Área médica</p>
      <h1 className="text-[28px] font-bold leading-9 tracking-[-0.8px] md:text-[32px] md:uppercase md:leading-10">Bom dia, {greeting}</h1>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">Acompanhe sua agenda do dia e registre o resultado dos atendimentos.</p>
    </header>

    <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="surface relative flex flex-col gap-3 p-4 md:flex-row md:gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-soft text-foreground [&>svg]:size-5">{stat.icon}</span>
          <span className={`absolute right-4 top-5 size-1.5 rounded-full md:hidden ${stat.dot}`} />
          <div className="min-w-0">
            <p className="text-sm leading-5 md:text-xs">{stat.label}</p>
            <p className="text-[32px] font-bold leading-10">{stat.value}</p>
            <p className={`text-xs leading-4 md:text-muted-foreground ${stat.accent ? "text-success" : "text-muted-foreground"}`}>{stat.detail}</p>
          </div>
        </article>
      ))}
    </div>

    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section className="md:surface md:p-6">
        <div className="flex items-center justify-between pb-3 md:pb-4">
          <h2 className="eyebrow flex items-center gap-2 text-foreground md:text-muted-foreground">Atendimentos de hoje<span className="rounded-full bg-accent px-1.5 text-[11px] text-foreground md:hidden">{open.length}</span></h2>
          <span className="flex items-center gap-1 text-[13px] font-semibold md:hidden">Filtrar<SlidersHorizontal className="size-3.5" /></span>
        </div>
        {open.length ? <div className="grid gap-3 md:gap-0 md:divide-y md:divide-border/60">{open.map((item) => (
          <article key={item.id}>
            <div className="hidden items-center gap-5 py-4 md:flex">
              <b className="w-[72px] shrink-0 text-[22px] font-bold leading-7">{item.time}</b>
              <div className="min-w-0 flex-1"><p className="text-base font-semibold leading-6">{clinic.patientById(item.patientId)?.name}</p><p className="text-xs leading-4 text-muted-foreground">{professional?.name} • {item.specialty} • {relativeDay(item.date)}</p></div>
              <span className="flex items-center gap-2 text-sm font-medium"><span className={`size-2 rounded-full ${item.status === "Confirmada" ? "bg-success" : "bg-foreground"}`} />{item.status}</span>
              <Button onClick={() => complete(item)} className="h-9 rounded-lg bg-strong px-5 text-sm font-semibold hover:bg-strong/90">Realizada</Button>
            </div>
            <div className="surface p-4 md:hidden">
              <div className="flex items-start gap-4">
                <div className="grid h-[46px] w-[62px] shrink-0 place-items-center rounded-lg bg-soft"><b className="text-[15px] leading-5">{item.time}</b><span className="text-[10px] font-medium uppercase text-muted-foreground">{Number(item.time.slice(0, 2)) < 12 ? "Manhã" : "Tarde"}</span></div>
                <div className="min-w-0 flex-1"><p className="text-base font-bold leading-5">{clinic.patientById(item.patientId)?.name}</p><p className="mt-0.5 text-xs leading-4 text-muted-foreground">{professional?.name} • {item.specialty} • {relativeDay(item.date)}</p></div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => complete(item)} className="h-9 flex-1 rounded-lg"><CheckCheck />Realizada</Button>
                <Button variant="ghost" size="icon" aria-label="Prontuário" className="size-9 rounded-lg bg-soft"><ClipboardList /></Button>
                <Button variant="ghost" size="icon" aria-label="Mais opções" className="size-9 rounded-lg bg-soft"><MoreVertical /></Button>
              </div>
            </div>
          </article>
        ))}</div> : <EmptyHint>Sem atendimentos em aberto para hoje.</EmptyHint>}
      </section>

      <section className="surface p-4 md:p-6">
        <div className="flex items-center justify-between pb-4">
          <h2 className="flex items-center gap-3 text-base font-bold uppercase md:eyebrow"><span className="grid size-8 place-items-center rounded-lg bg-success-soft text-success md:hidden"><Activity className="size-4" /></span>Resumo do dia</h2>
          <span className="text-xs font-medium text-success md:hidden">Hoje</span>
        </div>
        <div className="space-y-3 md:space-y-4">
          {today.filter((item) => item.confirmationReply === "Sem resposta").map((item) => <SummaryNote key={item.id} icon={<Info />} title="Confirmação pendente" text={`${clinic.patientById(item.patientId)?.name} ainda não confirmou o horário de ${item.time}.`} />)}
          <SummaryNote icon={<ClipboardPlus />} title={`${done.length} consulta(s) realizada(s)`} text="Registros enviados para o histórico do paciente." />
        </div>
        <div className="mt-4 grid gap-2 border-border md:mt-5 md:gap-0 md:border-t md:pt-3">
          <button type="button" onClick={() => toast.info("Emissão de documentos em breve")} className="flex items-center gap-3 rounded-lg bg-soft/60 p-3 text-left text-sm font-medium md:bg-transparent md:px-0 md:py-2.5"><FileText className="size-4" /><span className="flex-1">Emitir Atestado ou Receita</span><ChevronRight className="size-4" /></button>
          <button type="button" onClick={() => navigate({ to: "/profissional/agenda" })} className="flex items-center gap-3 rounded-lg bg-soft/60 p-3 text-left text-sm font-medium md:bg-transparent md:px-0 md:py-2.5"><CalendarRange className="size-4" /><span className="flex-1">Ver escala semanal completa</span><ChevronRight className="size-4" /></button>
        </div>
      </section>
    </div>
  </>;
}

function SummaryNote({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="flex gap-4 rounded-xl bg-soft p-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-card/70 text-foreground md:bg-accent/60 [&>svg]:size-[18px]">{icon}</span><div className="min-w-0"><p className="text-sm font-bold leading-5 md:text-[15px]">{title}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{text}</p></div></article>;
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
  const navigate = useNavigate();
  const monthly = appointments.filter((item) => item.date.slice(0, 7) === isoDate(0).slice(0, 7)).length;
  const todayCount = appointments.filter((item) => item.date === isoDate(0)).length;
  const activePros = professionals.filter((item) => item.active);
  const activeSpecs = specialties.filter((item) => item.active);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date());
  const year = isoDate(0).slice(0, 4);
  const max = Math.max(reports.total, 1);
  const rows = [
    { label: "Consultas registradas", hint: "Total acumulado de agendamentos no período", value: String(reports.total), pct: 72, icon: <ClipboardList />, tone: "bg-soft text-foreground", bar: "bg-strong", text: "" },
    { label: "Taxa de presença", hint: "Pacientes atendidos pontualmente", value: `${reports.attendance}%`, pct: reports.attendance, icon: <CheckCircle2 />, tone: "bg-success-soft text-success", bar: "bg-success", text: "text-success", tag: reports.attendance >= 80 ? "Meta atingida" : "" },
    { label: "Não compareceu", hint: "Ausência sem aviso prévio (No-show)", value: String(reports.noShow), pct: Math.round((reports.noShow / max) * 100), icon: <UserX />, tone: "bg-soft text-foreground", bar: "bg-subtle-foreground", text: "" },
    { label: "Cancelamentos", hint: "Desmarcações solicitadas por pacientes ou médicos", value: String(reports.canceled), pct: Math.round((reports.canceled / max) * 100), icon: <CircleX />, tone: "bg-destructive-soft text-destructive", bar: "bg-destructive", text: "text-destructive" },
  ];
  const initials = (name: string) => name.replace(/^(Dra?\.)\s+/, "").split(" ").map((part) => part[0]).slice(0, 2).join("");

  return <>
    <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase leading-4 tracking-[1.1px] text-muted-foreground"><span className="size-1.5 rounded-full bg-success md:bg-foreground" />Administração</p>
        <div className="flex items-center justify-between gap-3"><h1 className="text-[28px] font-bold uppercase leading-9 tracking-[-0.8px] md:text-[32px] md:leading-10">Visão geral</h1><span className="rounded-full bg-soft px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground md:hidden">{monthLabel.slice(0, 3)} {year}</span></div>
        <p className="mt-0.5 text-sm leading-5 text-muted-foreground">Acompanhe usuários, médicos, especialidades e indicadores da clínica.</p>
      </div>
      <div className="hidden items-center gap-3 md:flex"><span className="flex items-center gap-1.5 rounded-full bg-accent/70 px-3 py-1 text-xs font-medium"><span className="size-1.5 rounded-full bg-success" />Sistema Operacional</span><RefreshCw className="size-4 text-muted-foreground" /></div>
    </header>

    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
      <article className="surface p-4 md:flex md:gap-4 md:p-6">
        <span className="order-2 ml-auto grid size-8 place-items-center rounded-lg bg-accent/70 md:order-none md:ml-0 md:size-12 md:rounded-xl md:bg-soft [&>svg]:size-4 md:[&>svg]:size-5 float-right"><UsersRound /></span>
        <div><p className="text-sm leading-5">Usuários</p><p className="mt-3 flex items-baseline gap-1.5 text-[32px] font-bold leading-10 md:mt-0">{patients.length + professionals.length + staff.length}<span className="hidden rounded-full bg-success-soft/70 px-1.5 text-xs font-medium text-success md:inline">+2 este mês</span></p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground md:text-[13px]"><span className="size-1.5 rounded-full bg-success-soft md:bg-input" />{patients.length} pacientes<span className="hidden md:inline">cadastrados</span></p></div>
      </article>
      <article className="surface p-4 md:flex md:gap-4 md:p-6">
        <span className="float-right grid size-8 place-items-center rounded-lg bg-success-soft text-success md:size-12 md:rounded-xl [&>svg]:size-4 md:[&>svg]:size-5"><Stethoscope /></span>
        <div><p className="text-sm leading-5">Médicos ativos</p><p className="mt-3 flex items-baseline gap-1.5 text-[32px] font-bold leading-10 md:mt-0">{activePros.length}<span className="hidden text-xs font-medium text-ring md:inline">100% disponíveis</span></p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground md:text-[13px]"><span className="size-1.5 rounded-full bg-success" />{activeSpecs.length} <span className="md:hidden">esp. ativas</span><span className="hidden md:inline">especialidades ativas</span></p></div>
      </article>
      <article className="surface col-span-2 flex items-center gap-4 p-4 md:col-span-1 md:items-start md:p-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/60 md:size-12 md:bg-soft [&>svg]:size-5"><CalendarDays /></span>
        <div className="flex-1"><p className="text-sm leading-5">Consultas no mês</p><p className="flex items-baseline gap-2 text-[32px] font-bold leading-10">{monthly}<span className="text-xs font-normal text-muted-foreground"><span className="md:hidden">{reports.attendance}% de presença</span><span className="hidden md:inline">agendadas hoje</span></span></p><p className="hidden items-center gap-1.5 text-[13px] text-muted-foreground md:flex"><span className="size-1.5 rounded-full bg-success" /><b className="font-medium text-success">{reports.attendance}% de presença</b> média global</p></div>
        <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-medium md:hidden">Em curso</span>
        <span className="sr-only">{todayCount} consultas hoje</span>
      </article>
    </div>

    <section className="surface mt-6 overflow-hidden md:mt-6">
      <div className="flex items-center justify-between gap-3 bg-soft/70 px-4 py-3 md:bg-transparent md:px-6 md:pb-2 md:pt-6">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide md:text-lg md:tracking-normal"><BarChart3 className="size-4 md:hidden" />Desempenho da clínica<span className="hidden rounded bg-accent px-1.5 py-0.5 text-xs font-medium normal-case md:inline">{monthLabel.replace(/^./, (c) => c.toUpperCase())} / {year}</span></h2>
        <span className="text-xs text-muted-foreground md:hidden">Ciclo Atual</span>
        <span className="hidden items-center gap-1.5 text-xs font-medium md:flex"><TrendingUp className="size-4" />Indicadores consolidados</span>
      </div>
      <div className="md:px-6 md:pb-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-4 border-b border-border/40 px-4 py-3 last:border-0 md:border-0 md:px-0 md:py-4">
            <span className={`grid size-7 shrink-0 place-items-center rounded-md md:size-9 md:rounded-lg [&>svg]:size-4 ${row.tone}`}>{row.icon}</span>
            <div className="min-w-0 flex-1"><p className="flex items-center gap-2 text-[15px] font-medium leading-5">{row.label}{row.tag && <span className="hidden rounded bg-success-soft px-1.5 text-[11px] font-semibold text-success md:inline">{row.tag}</span>}</p><p className="hidden text-[13px] text-muted-foreground md:block">{row.hint}</p></div>
            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-accent md:block"><div className={`h-full rounded-full ${row.bar}`} style={{ width: `${Math.max(row.pct, 6)}%` }} /></div>
            <b className={`w-14 text-right text-lg font-semibold md:text-xl ${row.text}`}>{row.value}</b>
          </div>
        ))}
      </div>
      <div className="hidden items-center justify-between bg-soft/50 px-6 py-2.5 text-xs md:flex"><span className="flex items-center gap-1.5 text-muted-foreground"><BadgeCheck className="size-4 text-success" />Estatísticas atualizadas automaticamente a cada consulta confirmada</span><button type="button" className="flex items-center gap-1 font-semibold">Ver relatório analítico completo<ArrowRight className="size-3.5" /></button></div>
    </section>

    <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground md:hidden">Ações rápidas</p>
    <div className="grid grid-cols-2 gap-3 md:hidden">
      <Button onClick={() => navigate({ to: "/administrador/profissionais" })} className="h-12 rounded-xl bg-avatar text-[15px] hover:bg-avatar/90"><Stethoscope />Gerenciar Médicos</Button>
      <Button variant="ghost" onClick={() => navigate({ to: "/administrador/usuarios" })} className="h-12 rounded-xl bg-card text-[15px] shadow-[0_1px_1px_rgb(0_0_0/5%)]"><UsersRound />Ver Usuários</Button>
    </div>

    <div className="mt-6 hidden gap-4 md:grid md:grid-cols-3">
      <article className="surface flex flex-col p-6 pb-0">
        <div className="flex items-center justify-between"><h3 className="eyebrow text-foreground">Equipe médica ativa</h3><span className="size-2 rounded-full bg-success" /></div>
        <ul className="mt-3 flex-1 space-y-2.5">{activePros.slice(0, 3).map((pro) => <li key={pro.id} className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-full bg-strong text-xs font-bold text-strong-foreground">{initials(pro.name)}</span><span><b className="block text-sm font-medium leading-4">{pro.name}</b><span className="text-xs text-muted-foreground">{pro.specialty}</span></span></li>)}</ul>
        <div className="-mx-6 mt-4 flex items-center justify-between bg-soft/50 px-6 py-3 text-xs"><span className="text-muted-foreground">{activeSpecs.length} especialidades cobertas</span><button type="button" onClick={() => navigate({ to: "/administrador/profissionais" })} className="font-semibold">Gerenciar</button></div>
      </article>
      <article className="surface flex flex-col p-6 pb-0">
        <div className="flex items-center justify-between"><h3 className="eyebrow text-foreground">Configurações de agendamento</h3><SlidersHorizontal className="size-4" /></div>
        <p className="mt-3 text-[15px] font-semibold">Agendas abertas para {new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)).replace(/^./, (c) => c.toUpperCase())}</p>
        <p className="mt-1 text-xs leading-4 text-muted-foreground">As grades horárias para os próximos 30 dias já se encontram sincronizadas com o portal de autoatendimento ao paciente.</p>
        <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">{activeSpecs.map((spec, index) => <span key={spec.id} className="h-fit rounded bg-accent/60 px-1.5 py-0.5 text-xs">{spec.name} ({["Manhã", "Tarde", "Integral"][index % 3]})</span>)}</div>
        <div className="-mx-6 mt-4 flex items-center justify-between bg-soft/50 px-6 py-3 text-xs"><span className="text-muted-foreground">Turnos configurados</span><button type="button" onClick={() => navigate({ to: "/administrador/agendas" })} className="font-semibold">Ajustar horários</button></div>
      </article>
      <article className="relative flex flex-col overflow-hidden rounded-xl bg-strong p-6 text-strong-foreground">
        <span className="absolute -bottom-10 -right-10 size-36 rounded-full bg-white/5" />
        <div className="flex items-center justify-between"><h3 className="text-[11px] font-bold uppercase tracking-[0.55px] text-sidebar-muted">Integridade e backup</h3><span className="size-2 rounded-full bg-success-soft" /></div>
        <p className="mt-3 text-[17px] font-semibold">Ambiente Clínico Protegido</p>
        <p className="mt-1.5 text-xs leading-4 text-sidebar-muted">Todos os registros de pacientes e prontuários estão salvaguardados com criptografia de ponta a ponta (AES-256).</p>
        <div className="mt-3 flex items-center gap-2.5 rounded-md bg-white/5 px-2.5 py-2"><Shield className="size-4" /><span><b className="block text-xs font-semibold">Último backup: Hoje, 04:00</b><span className="text-[10px] text-sidebar-muted">Auditoria LGPD conforme</span></span></div>
        <div className="relative mt-auto flex items-center justify-between pt-6 text-xs"><span className="text-sidebar-muted">Sessão: Marcelo Andrade</span><button type="button" onClick={() => toast.success("Log exportado")} className="rounded-md bg-success-soft px-4 py-1 font-semibold text-success-strong">Exportar Log</button></div>
      </article>
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
