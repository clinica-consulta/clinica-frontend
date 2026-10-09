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

import { AppointmentRow, Dot, Notice, NotificationList, usePatientScope, useProfessionalScope } from "@/components/role-shared";

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
