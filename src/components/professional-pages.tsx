import { SiteSelect } from "@/components/site-select";
import { DatePicker } from "@/components/date-picker";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, BadgeCheck, BarChart3, RefreshCw, Shield, TrendingUp, UserX, Bell, BriefcaseMedical, CalendarRange, CheckCheck, ClipboardList, ClipboardPlus, FileText, HeartPulse, Info, MoreVertical, SlidersHorizontal, ChevronRight, CircleX, Eye, Headset, History, MapPin, Plus, Syringe, CalendarCheck, CalendarClock, CalendarDays, Check, CheckCircle2, CircleAlert, Clock3, Lock, ShieldCheck, Stethoscope, Tags, UserCheck, UsersRound, X, AlarmClock, Ban, CalendarX2, ChevronDown, ChevronLeft, CircleHelp, CircleMinus, CirclePlus, IdCard, Mail, Phone, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, Modal, PageHeader, SearchInput, Section, SelectField, StatCard, StatusBadge, Toggle, Toolbar } from "@/components/page-kit";
import { AppointmentForm } from "@/components/appointment-form";
import { RescheduleModal } from "@/components/clinic-pages";
import { formatDate, isoDate, openStatuses, relativeDay, minutesOf, weekdays, type Appointment } from "@/lib/clinic-data";
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


/* ---------- Componentes locais das telas do profissional ---------- */

function ProHeader({ eyebrow, title, description, mobileDescription, greenEyebrow = false, aside }: { eyebrow: string; title: string; description: string; mobileDescription?: string; greenEyebrow?: boolean; aside?: React.ReactNode }) {
  return <header className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      <p className={`mb-1 hidden text-[11px] font-bold uppercase leading-4 tracking-[1.1px] md:block ${greenEyebrow ? "text-success" : "text-muted-foreground"}`}>{eyebrow}</p>
      <h1 className="text-[28px] font-bold leading-9 tracking-[-0.8px] text-foreground md:text-[32px] md:uppercase md:leading-10">{title}</h1>
      <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted-foreground md:mt-0.5 md:text-sm">{mobileDescription ? <><span className="md:hidden">{mobileDescription}</span><span className="hidden md:inline">{description}</span></> : description}</p>
    </div>
    {aside}
  </header>;
}

function MiniBars({ tone }: { tone: "success" | "info" }) {
  const bars = tone === "success" ? ["h-2.5 bg-success-soft", "h-4 bg-success/70", "h-5 bg-success"] : ["h-3 bg-accent", "h-2 bg-ring/50", "h-5 bg-strong"];
  return <span className="flex items-end gap-1" aria-hidden>{bars.map((bar, index) => <span key={index} className={`w-2 rounded-t-sm ${bar}`} />)}</span>;
}

function shiftDate(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const periodOf = (time: string) => (Number(time.slice(0, 2)) < 12 ? "Manhã" : "Tarde");

/* ---------- Minha agenda ---------- */

export function ProfessionalAgendaPage() {
  const { clinic, professional, mine } = useProfessionalScope();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(isoDate(0));
  const blocks = professional ? clinic.blocks.filter((item) => item.professionalId === professional.id && item.startDate <= date && item.endDate >= date) : [];
  const [detail, setDetail] = useState<Appointment | null>(null);
  const ofDay = mine.filter((item) => item.date === date && item.status !== "Cancelada");
  const list = ofDay
    .filter((item) => (clinic.patientById(item.patientId)?.name ?? "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.time.localeCompare(b.time));
  const confirmed = ofDay.filter((item) => item.status === "Confirmada");
  const waiting = ofDay.filter((item) => item.status === "Agendada" || item.status === "Remarcada").sort((a, b) => a.time.localeCompare(b.time));
  const share = ofDay.length ? Math.round((confirmed.length / ofDay.length) * 100) : 0;
  const complete = (item: Appointment) => { clinic.setAppointmentStatus(item.id, "Realizada", "Consulta realizada"); toast.success("Consulta registrada como realizada"); };
  const absent = (item: Appointment) => { clinic.setAppointmentStatus(item.id, "Não compareceu", "Ausência registrada pelo médico"); toast.warning("Ausência registrada"); };
  const title = `${formatDate(date)} • ${list.length} atendimento(s)`;

  return <>
    <ProHeader greenEyebrow eyebrow="Organização diária" title="Minha agenda" description="Visualize sua agenda e registre consultas realizadas e ausências." />

    {/* Filtros desktop */}
    <div className="mb-6 hidden grid-cols-[224px_minmax(0,1fr)] items-end gap-4 md:grid">
      <label className="grid gap-1.5 text-[13px] font-semibold leading-[18px]">Data
        <DatePicker value={date} required onChange={setDate} aria-label="Data">{(label) => (
          <span className="flex h-[42px] items-center justify-between rounded-lg bg-card px-3 text-sm font-normal shadow-[0_1px_2px_rgb(0_0_0/8%)] ring-1 ring-border/50">{label}<CalendarDays className="size-[18px]" /></span>
        )}</DatePicker>
      </label>
      <SearchInput placeholder="Buscar paciente..." value={search} onChange={setSearch} className="[&>input]:h-[42px]" />
    </div>

    {/* Filtros mobile */}
    <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2 md:hidden">
      <div className="surface relative flex items-center gap-3 p-3">
        <span className="min-w-0 flex-1"><DatePicker value={date} required onChange={setDate} aria-label="Data">{(label) => (
          <span className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent"><CalendarDays className="size-[18px]" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[11px] leading-4 text-muted-foreground">Data selecionada</span><b className="block text-[17px] leading-6">{label}</b></span>
          </span>
        )}</DatePicker></span>
        <button type="button" onClick={() => setDate(isoDate(0))} className="relative z-10 flex items-center gap-0.5 text-xs font-semibold">Hoje<ChevronDown className="size-3.5" /></button>
      </div>
      <div className="surface flex items-center px-1">
        <button type="button" aria-label="Dia anterior" onClick={() => setDate(shiftDate(date, -1))} className="grid size-9 place-items-center"><ChevronLeft className="size-4" /></button>
        <button type="button" aria-label="Próximo dia" onClick={() => setDate(shiftDate(date, 1))} className="grid size-9 place-items-center"><ChevronRight className="size-4" /></button>
      </div>
    </div>
    <SearchInput placeholder="Buscar paciente por nome ou prontuário..." value={search} onChange={setSearch} className="mb-5 block md:hidden" />

    {/* Lista desktop */}
    <section className="surface hidden p-6 md:block">
      <h2 className="pb-2 text-sm font-bold uppercase leading-5">{title}</h2>
      {blocks.map((block) => <p key={block.id} className="mb-2 text-xs text-warning-strong">Período bloqueado: {block.startTime}–{block.endTime} · {block.reason}</p>)}
      {list.length ? list.map((item) => (
        <div key={item.id} className="flex items-center gap-5 py-4">
          <b className="w-[68px] shrink-0 text-[22px] font-bold leading-7">{item.time}</b>
          <div className="min-w-0 flex-1"><p className="text-base font-semibold leading-6">{clinic.patientById(item.patientId)?.name}</p><p className="text-xs leading-4 text-muted-foreground">{professional?.name} • {item.specialty} • {relativeDay(item.date)}</p></div>
          <span className="mr-2 flex items-center gap-2 text-sm font-medium"><span className={`size-1.5 rounded-full ${item.status === "Confirmada" ? "bg-success" : item.status === "Realizada" ? "bg-success" : "bg-subtle-foreground"}`} />{item.status}</span>
          {openStatuses.includes(item.status) && <>
            <Button onClick={() => complete(item)} className="h-9 rounded-lg bg-strong px-4 text-sm font-semibold hover:bg-strong/90">Realizada</Button>
            <Button variant="ghost" onClick={() => absent(item)} className="h-9 rounded-lg px-3 text-sm font-medium">Não compareceu</Button>
          </>}
          <Button variant="ghost" onClick={() => setDetail(item)} className="h-9 rounded-lg bg-card px-4 text-sm font-semibold shadow-[0_1px_3px_rgb(0_0_0/10%)]">Ficha</Button>
        </div>
      )) : <EmptyHint>Nenhum atendimento nesta data.</EmptyHint>}
    </section>

    {/* Lista mobile */}
    <section className="md:hidden">
      <div className="flex items-center justify-between pb-3"><h2 className="text-xs font-bold uppercase leading-4 text-soft-foreground">{title}</h2><span className="flex items-center gap-1 text-xs font-semibold"><SlidersHorizontal className="size-3.5" />Filtros</span></div>
      {blocks.map((block) => <p key={block.id} className="mb-2 text-xs text-warning-strong">Período bloqueado: {block.startTime}–{block.endTime} · {block.reason}</p>)}
      {list.length ? <div className="grid gap-3">{list.map((item) => {
        const patient = clinic.patientById(item.patientId);
        const confirmedItem = item.status === "Confirmada";
        const open = openStatuses.includes(item.status);
        return <article key={item.id} className="surface p-4">
          <div className="flex items-start gap-3">
            <div className={`grid h-12 w-11 shrink-0 place-items-center content-center rounded-lg ${confirmedItem ? "bg-strong text-white" : "bg-accent text-foreground"}`}><b className="text-[13px] leading-4">{item.time}</b><span className="text-[8px] font-medium uppercase leading-3 opacity-80">{periodOf(item.time)}</span></div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[17px] font-bold leading-6">{patient?.name}<span className={`size-1.5 rounded-full ${confirmedItem ? "bg-success" : "bg-ring/50"}`} /></p>
              <p className="text-xs leading-4 text-muted-foreground">{professional?.name} • <span className="text-success">{item.specialty}</span> • {relativeDay(item.date)}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-3 flex items-center gap-2 truncate rounded-lg bg-soft px-2.5 py-1.5 text-xs text-soft-foreground"><ShieldCheck className="size-3.5 shrink-0" /><span className="truncate">{patient?.insurance === "Particular" ? "Particular" : `Plano ${patient?.insurance ?? "—"}`} • {item.notes || "Consulta de rotina"}</span></p>
          <div className="mt-3 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.9fr)] gap-2">
            <Button disabled={!open} onClick={() => complete(item)} className="h-9 rounded-lg bg-primary px-2 text-sm font-semibold"><CheckCircle2 />Realizada</Button>
            <Button disabled={!open} variant="ghost" onClick={() => absent(item)} className="h-9 rounded-lg bg-accent px-2 text-sm font-semibold"><CalendarX2 />Ausente</Button>
            <Button variant="ghost" onClick={() => setDetail(item)} className="h-9 rounded-lg bg-accent px-2 text-sm font-semibold"><ClipboardList />Ficha</Button>
          </div>
        </article>;
      })}</div> : <EmptyHint>Nenhum atendimento nesta data.</EmptyHint>}
    </section>

    {/* Resumo desktop */}
    <div className="mt-6 hidden grid-cols-3 gap-4 md:grid">
      <article className="surface flex items-center gap-4 px-4 py-4"><span className="grid size-10 place-items-center rounded-lg bg-success-soft text-success-strong"><CalendarCheck className="size-5" /></span><div className="flex-1"><p className="text-[11px] font-medium uppercase leading-4 tracking-[0.55px]">Confirmadas</p><b className="text-xl leading-6">{confirmed.length}</b></div><MiniBars tone="success" /></article>
      <article className="surface flex items-center gap-4 px-4 py-4"><span className="grid size-10 place-items-center rounded-lg bg-accent"><Clock3 className="size-5" /></span><div className="flex-1"><p className="text-[11px] font-medium uppercase leading-4 tracking-[0.55px]">Aguardando</p><b className="text-xl leading-6">{waiting.length}</b></div><MiniBars tone="info" /></article>
      <article className="surface flex items-center gap-4 px-4 py-4"><span className="grid size-10 place-items-center rounded-lg bg-soft"><Stethoscope className="size-5" /></span><div className="flex-1"><p className="text-[11px] font-medium uppercase leading-4 tracking-[0.55px]">Especialidade</p><b className="text-xl leading-6">{professional?.specialty}</b></div><BadgeCheck className="size-5 text-success" /></article>
    </div>

    {/* Resumo mobile */}
    <section className="mt-6 md:hidden">
      <div className="flex items-center justify-between pb-3"><h2 className="text-xs font-bold uppercase leading-4 text-soft-foreground">Resumo do dia</h2><span className="text-xs font-medium text-success">{new Set(ofDay.map((item) => item.patientId)).size} pacientes totais</span></div>
      <div className="grid grid-cols-2 gap-3">
        <article className="surface p-4"><div className="flex items-start justify-between"><span className="grid size-8 place-items-center rounded-lg bg-success-soft text-success-strong"><CalendarCheck className="size-4" /></span><MiniBars tone="success" /></div><p className="mt-3 text-[11px] font-medium uppercase leading-4 tracking-[0.55px]">Confirmadas</p><p className="flex items-baseline gap-1.5"><b className="text-xl">{confirmed.length}</b><span className="text-xs text-success">{share}% da grade</span></p></article>
        <article className="surface p-4"><div className="flex items-start justify-between"><span className="grid size-8 place-items-center rounded-lg bg-accent"><Clock3 className="size-4" /></span><MiniBars tone="info" /></div><p className="mt-3 text-[11px] font-medium uppercase leading-4 tracking-[0.55px]">Aguardando</p><p className="flex items-baseline gap-1.5"><b className="text-xl">{waiting.length}</b>{waiting[0] && <span className="text-xs text-muted-foreground">{waiting[0].time} h</span>}</p></article>
      </div>
      <article className="surface mt-3 flex items-center gap-3 p-4"><span className="grid size-10 place-items-center rounded-lg bg-accent"><Stethoscope className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-medium uppercase leading-4 tracking-[0.55px] text-muted-foreground">Especialidade ativa</p><b className="text-lg leading-6">{professional?.specialty}</b></div><span className="flex items-center gap-1.5 rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-success"><BadgeCheck className="size-4" />CRM Ativo</span></article>
    </section>

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

/* ---------- Meus pacientes ---------- */

const avatarTones = ["bg-primary text-white", "bg-success text-white", "bg-avatar text-white/70", "bg-success-soft text-success-strong"];

export function ProfessionalPatientsPage() {
  const { clinic, mine } = useProfessionalScope();
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"recent" | "name">("recent");
  const [record, setRecord] = useState<string | null>(null);
  const ids = [...new Set(mine.map((item) => item.patientId))];
  const rows = ids
    .map((id) => clinic.patientById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => `${item.name} ${item.email} ${item.phone}`.toLowerCase().includes(search.toLowerCase()))
    .map((patient) => {
      const history = mine.filter((item) => item.patientId === patient.id);
      const last = history.filter((item) => item.status === "Realizada").sort((a, b) => b.date.localeCompare(a.date))[0];
      const latest = [...history].sort((a, b) => b.date.localeCompare(a.date))[0];
      return { patient, history, last, latest: latest?.date ?? "" };
    })
    .sort((a, b) => (order === "name" ? a.patient.name.localeCompare(b.patient.name) : b.latest.localeCompare(a.latest)));
  const selected = rows.find((row) => row.patient.id === record) ?? null;
  const orderSelect = <SiteSelect value={order} onChange={(event) => setOrder(event.target.value as "recent" | "name")} className="cursor-pointer bg-transparent text-xs font-semibold outline-none md:text-[13px]"><option value="recent">Mais recente</option><option value="name">Nome (A–Z)</option></SiteSelect>;

  return <>
    <ProHeader eyebrow="Acompanhamento" title="Meus pacientes" description="Consulte os pacientes vinculados aos seus atendimentos." />
    <SearchInput placeholder="Buscar nome ou contato..." value={search} onChange={setSearch} className="block [&>input]:h-12 [&>input]:rounded-xl" />

    <div className="mb-4 mt-3 flex items-center justify-end gap-3 md:mb-4 md:mt-6 md:justify-between">
      <p className="hidden items-center gap-2 text-[13px] font-medium md:flex"><UsersRound className="size-4" /><span>Mostrando <b>{rows.length}</b> pacientes ativos</span></p>
      <label className="flex items-center gap-2 rounded-lg bg-soft px-3 py-1.5 md:bg-transparent md:p-0"><span className="text-[11px] font-bold uppercase tracking-[1.1px] text-soft-foreground md:font-medium md:tracking-[0.55px]">Ordenação:</span><span className="md:rounded-md md:bg-card md:px-3 md:py-1">{orderSelect}</span></label>
    </div>

    {rows.length ? <div className="grid gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">{rows.map(({ patient, history, last }, index) => <article key={patient.id} className="surface overflow-hidden">
      {/* desktop */}
      <div className="hidden md:block">
        <div className="p-6 pb-5">
          <span className="grid size-12 place-items-center rounded-full bg-accent text-base font-bold">{patient.initials}</span>
          <h2 className="mt-4 text-xl font-bold leading-7 tracking-[-0.3px]">{patient.name}</h2>
          <p className="text-sm leading-5 text-muted-foreground">{patient.phone}</p>
          <p className="text-sm leading-5 text-muted-foreground">Convênio: {patient.insurance}</p>
        </div>
        <div className="grid grid-cols-2 border-t border-border py-4 text-center">
          <div><b className="block text-[26px] leading-8">{history.length}</b><span className="text-xs text-muted-foreground">atendimentos</span></div>
          <div><b className="block text-[26px] leading-8">{last ? formatDate(last.date).slice(0, 5) : "—"}</b><span className="text-xs text-muted-foreground">último</span></div>
        </div>
      </div>
      {/* mobile */}
      <div className="md:hidden">
        <div className="flex items-start gap-3 p-4">
          <span className={`grid size-12 shrink-0 place-items-center rounded-full text-base font-semibold ${avatarTones[index % avatarTones.length]}`}>{patient.initials}</span>
          <div className="min-w-0 flex-1 pt-1"><h2 className="truncate text-[17px] font-bold leading-6">{patient.name}</h2><p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" />{patient.phone}</p></div>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${patient.insurance === "Saúde Total" ? "bg-success-soft text-success-strong" : "bg-accent text-soft-foreground"}`}>{patient.insurance}</span>
        </div>
        <div className="flex items-center gap-2 bg-soft px-4 py-3 text-xs">
          <span className="flex items-start gap-1.5"><ClipboardList className="mt-0.5 size-3.5" /><span><b className="text-sm">{history.length}</b> <span className="text-muted-foreground">atendimentos</span></span></span>
          <span className="size-1 rounded-full bg-input" />
          <span className="flex items-start gap-1.5"><History className="mt-0.5 size-3.5 text-success" /><span><b className="text-sm">{last ? formatDate(last.date).slice(0, 5) : "—"}</b> <span className="text-muted-foreground">último</span></span></span>
          <Button onClick={() => setRecord(patient.id)} className={`ml-auto h-8 rounded-lg px-3 text-[13px] font-semibold ${index === 0 ? "" : "bg-accent text-foreground hover:bg-accent/80"}`}>Prontuário<ArrowRight /></Button>
        </div>
      </div>
    </article>)}</div> : <EmptyHint>Nenhum paciente encontrado.</EmptyHint>}

    <Modal open={Boolean(selected)} title="Prontuário" description={selected ? `${selected.patient.name} · ${selected.patient.insurance}` : ""} onClose={() => setRecord(null)}>
      {selected && <div className="space-y-3 text-sm">
        <p><b>Telefone:</b> {selected.patient.phone}</p>
        <p><b>E-mail:</b> {selected.patient.email}</p>
        <div className="space-y-2">{[...selected.history].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-soft px-3 py-2"><span><b>{formatDate(item.date)}</b> · {item.time}<span className="block text-xs text-muted-foreground">{item.notes || item.specialty}</span></span><StatusBadge status={item.status} /></div>)}</div>
      </div>}
    </Modal>
  </>;
}

/* ---------- Meus horários ---------- */

export function ProfessionalAvailabilityPage() {
  const { clinic, professional } = useProfessionalScope();
  if (!professional) return <EmptyHint>Perfil médico não encontrado.</EmptyHint>;
  const blocks = clinic.blocks.filter((item) => item.professionalId === professional.id);
  const todayIndex = new Date(`${isoDate(0)}T12:00:00`).getDay();
  const hours = weekdays.reduce((sum, day) => {
    const value = professional.availability[day.value];
    return value?.active ? sum + (minutesOf(value.end) - minutesOf(value.start)) / 60 : sum;
  }, 0);
  const hoursLabel = `${Number.isInteger(hours) ? hours : hours.toFixed(1)} horas`;
  const askAdmin = (title: string, text: string) => { clinic.notify({ title, text: `${professional.name}: ${text}`, audience: ["admin"] }); toast.success("Solicitação enviada", { description: "A administração foi notificada." }); };

  return <>
    <ProHeader greenEyebrow eyebrow="Agenda médica" title="Meus horários" description="Consulte seus horários de atendimento. Alterações são feitas pela administração." />

    <section className="surface p-4 md:p-6">
      <div className="mb-4 flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="flex items-center gap-2.5 text-sm font-bold uppercase leading-5 md:gap-2 md:text-base md:tracking-[0.3px]"><span className="grid size-8 place-items-center rounded-lg bg-accent md:size-auto md:bg-transparent"><Clock3 className="size-[18px] md:hidden" /><CalendarDays className="hidden size-5 md:block" /></span>Horários da semana</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-[11px] font-medium"><span className="size-1.5 rounded-full bg-success" />Carga horária semanal: <b>{hoursLabel}</b></span>
      </div>
      <div className="space-y-1.5 md:space-y-1">{weekdays.map((day) => {
        const value = professional.availability[day.value] ?? { active: false, start: "08:00", end: "17:00" };
        const isToday = day.value === todayIndex;
        return <div key={day.value} className={`flex h-[50px] items-center gap-3 rounded-lg px-4 text-sm md:h-12 ${isToday ? "bg-success-soft" : "bg-soft"}`}>
          <span className={`size-1.5 shrink-0 rounded-full md:size-2 ${value.active ? "bg-success" : "bg-input"}`} />
          <span className={`flex flex-1 items-center gap-2 ${isToday ? "font-bold" : value.active ? "font-semibold md:font-medium" : "font-medium text-subtle-foreground"}`}>{day.label}{isToday && <><span className="hidden rounded bg-card px-2 py-0.5 text-[10px] font-semibold md:inline">Hoje</span><span className="rounded-full bg-success px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-white md:hidden">Hoje</span></>}</span>
          {value.active
            ? <b className="flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1 text-[13px] md:bg-transparent md:p-0 md:text-[15px]">{isToday ? <AlarmClock className="size-3.5 md:hidden" /> : <Clock3 className="size-3.5 md:hidden" />}<Clock3 className="hidden size-4 md:block" />{value.start} – {value.end}</b>
            : <span className="flex items-center gap-1.5 text-[13px] text-subtle-foreground md:text-[15px] md:font-bold md:text-soft-foreground"><Ban className="size-3.5 md:hidden" /><CircleMinus className="hidden size-4 md:block" />Sem atendimento</span>}
        </div>;
      })}</div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-4 text-soft-foreground"><Lock className="size-3.5 shrink-0" />Somente a administração pode alterar agendas médicas.</p>
    </section>

    <section className="surface mt-4 p-4 md:mt-6 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-2.5 text-sm font-bold uppercase leading-5 md:gap-2 md:text-base md:tracking-[0.3px]"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent md:size-auto md:bg-transparent"><CalendarX2 className="size-[18px] md:size-5" /></span><span className="truncate">Bloqueios registrados</span></h2>
        <button type="button" onClick={() => askAdmin("Solicitação de bloqueio", "pediu o bloqueio de um período na agenda.")} className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[13px] font-semibold md:rounded-md md:px-3 md:py-1 md:text-xs md:font-medium"><CirclePlus className="size-4 md:hidden" /><CircleHelp className="hidden size-3.5 md:block" />Solicitar Bloqueio</button>
      </div>
      {blocks.length ? <div className="space-y-1.5">{blocks.map((block) => <div key={block.id} className="flex items-center gap-3 rounded-lg bg-soft px-4 py-3 text-sm"><CalendarX2 className="size-4 shrink-0" /><div className="min-w-0 flex-1"><b>{formatDate(block.startDate)}{block.endDate !== block.startDate && ` a ${formatDate(block.endDate)}`}</b><p className="text-xs text-muted-foreground">{block.startTime}–{block.endTime} · {block.reason}</p></div></div>)}</div>
        : <div className="grid place-items-center rounded-xl bg-soft px-6 py-8 text-center md:py-9">
          <span className="grid size-12 place-items-center rounded-full bg-card text-soft-foreground md:size-auto md:bg-transparent md:text-subtle-foreground"><CalendarCheck className="size-6 md:size-7" /></span>
          <p className="mt-3 text-base font-bold leading-6 md:mt-2 md:text-[15px] md:font-normal">Nenhum período bloqueado na sua agenda.</p>
          <p className="mt-1 max-w-[280px] text-xs leading-4 text-muted-foreground md:max-w-none md:text-[11px]">Férias, congressos ou folgas agendadas aparecerão aqui quando confirmadas pelo RH.</p>
        </div>}
    </section>

    <section className="mt-6 hidden items-center gap-4 rounded-xl bg-success-soft/50 px-4 py-4 md:flex">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success-strong"><CircleHelp className="size-5" /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-bold leading-5">Precisa ajustar sua grade de horários?</p><p className="text-xs leading-4 text-muted-foreground">Encaminhe a solicitação de remanejamento para a coordenação clínica com 15 dias de antecedência.</p></div>
      <Button onClick={() => askAdmin("Ajuste de grade solicitado", "pediu um remanejamento da grade de horários.")} className="h-9 rounded-lg bg-strong px-4 text-sm font-semibold hover:bg-strong/90"><Send />Falar com Administração</Button>
    </section>
  </>;
}

/* ---------- Notificações ---------- */

export function ProfessionalNotificationsPage() {
  const clinic = useClinic();
  const items = clinic.notificationsFor("professional");
  const unread = items.filter((item) => !item.read).length;
  return <>
    <ProHeader eyebrow="Atualizações" title="Notificações" description="Acompanhe confirmações e alterações da sua agenda." />
    <section className="surface p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2.5 text-sm font-bold uppercase leading-5 md:gap-2 md:text-base md:tracking-[0.3px]"><span className="grid size-8 place-items-center rounded-lg bg-accent md:size-auto md:bg-transparent"><Bell className="size-[18px] md:size-5" /></span>Recentes</h2>
        {unread > 0 && <button type="button" onClick={() => { clinic.markAllNotificationsRead("professional"); toast.success("Notificações marcadas como lidas"); }} className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold md:rounded-md md:py-1"><CheckCheck className="size-3.5" />Marcar todas como lidas</button>}
      </div>
      {items.length ? <div className="space-y-1.5">{items.map((item) => (
        <button type="button" key={item.id} onClick={() => !item.read && clinic.markNotificationRead(item.id)} className={`flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left ${item.read ? "bg-soft/60" : "bg-soft"}`}>
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.read ? "bg-card text-subtle-foreground" : "bg-accent"}`}><Bell className="size-4" /></span>
          <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-semibold leading-5">{item.title}{!item.read && <span className="size-1.5 rounded-full bg-success" />}</span><span className="block text-xs leading-4 text-muted-foreground">{item.text}</span></span>
          <span className="shrink-0 text-[11px] text-subtle-foreground">{relativeDay(item.createdAt)}</span>
        </button>
      ))}</div> : <div className="grid place-items-center rounded-xl bg-soft px-6 py-8 text-center"><Bell className="size-6 text-subtle-foreground" /><p className="mt-2 text-sm">Nenhuma notificação por aqui.</p></div>}
    </section>
  </>;
}

/* ---------- Meu perfil ---------- */

function ProfileField({ label, mobileLabel, icon, tag, locked = false, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; mobileLabel?: string; icon: React.ReactNode; tag: string; locked?: boolean }) {
  return <label className={`grid min-w-0 gap-1.5 md:gap-2 ${className}`}>
    <span className="flex items-center justify-between text-[13px] font-semibold leading-[18px]"><span><span className="md:hidden">{mobileLabel ?? label}</span><span className="hidden md:inline">{label}</span></span><span className={`flex items-center gap-1 text-[11px] font-medium md:hidden ${locked ? "text-muted-foreground" : "text-success"}`}>{locked && <Lock className="size-3" />}{tag}</span></span>
    <span className={`relative flex h-11 items-center rounded-lg md:h-[42px] ${locked ? "bg-accent text-soft-foreground" : "bg-soft md:bg-card md:ring-1 md:ring-input/70 focus-within:ring-1 focus-within:ring-ring"}`}>
      <span className="pointer-events-none absolute left-3.5 text-soft-foreground md:hidden [&>svg]:size-4">{icon}</span>
      <input {...props} disabled={locked} className="h-full w-full min-w-0 rounded-lg bg-transparent pl-10 pr-10 text-sm text-foreground outline-none disabled:text-soft-foreground disabled:opacity-100 md:px-3.5 md:disabled:text-foreground" />
      {locked && <Lock className="pointer-events-none absolute right-3.5 size-4 text-soft-foreground md:hidden" />}
    </span>
  </label>;
}

export function ProfessionalProfilePage() {
  const { clinic, professional } = useProfessionalScope();
  if (!professional) return <EmptyHint>Perfil não encontrado.</EmptyHint>;
  const female = professional.name.startsWith("Dra");
  return <>
    <ProHeader eyebrow="Dados profissionais" title="Meu perfil" description="Atualize seus dados de contato." mobileDescription="Atualize seus dados de contato e preferências." />
    <section className="surface p-5 md:p-8">
      <h2 className="mb-4 hidden text-sm font-bold uppercase leading-5 tracking-[0.3px] md:block">Informações profissionais</h2>

      <div className="mb-5 flex items-center gap-4 md:hidden">
        <span className="relative grid size-16 shrink-0 place-items-center rounded-full bg-avatar text-2xl font-semibold text-success-soft">{professional.initials}<span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full border-2 border-card bg-success-soft text-success"><Check className="size-3" strokeWidth={3} /></span></span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-base font-bold leading-6">{professional.name}<span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success-strong">{female ? "Médica Ativa" : "Médico Ativo"}</span></p>
          <p className="flex items-center gap-1.5 text-[13px] text-soft-foreground"><HeartPulse className="size-3.5" />{professional.specialty}</p>
        </div>
      </div>
      <p className="mb-5 flex gap-2.5 rounded-xl bg-soft p-3.5 text-xs leading-[18px] text-soft-foreground md:hidden"><Info className="mt-0.5 size-4 shrink-0" />Campos com cadeado são validados pelo Conselho Regional e exigem protocolo para alteração cadastral.</p>

      <form className="grid gap-4 md:grid-cols-2 md:gap-x-6" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        clinic.updateProfessional(professional.id, {
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
        });
        toast.success("Perfil atualizado", { description: "Suas informações foram salvas." });
      }}>
        <ProfileField label="Nome completo" name="name" icon={<UserRound />} tag="Editável" defaultValue={professional.name} required />
        <ProfileField label="E-mail" name="email" type="email" icon={<Mail />} tag="Editável" defaultValue={professional.email} required />
        <ProfileField label="Telefone" mobileLabel="Telefone de contato" name="phone" icon={<Phone />} tag="Editável" defaultValue={professional.phone} required />
        <hr className="my-1 border-border md:hidden" />
        <ProfileField label="Especialidade" icon={<BriefcaseMedical />} tag="Verificado" locked defaultValue={professional.specialty} />
        <ProfileField label="CRM" icon={<IdCard />} tag="Oficial" locked defaultValue={professional.crm} />
        <ProfileField label="Perfil" mobileLabel="Perfil de acesso" icon={<ShieldCheck />} tag="Restrito" locked defaultValue="Médico" />
        <div className="mt-2 md:col-span-2 md:mt-4"><Button type="submit" className="h-12 w-full rounded-lg bg-primary text-[15px] font-semibold shadow-[0_4px_10px_rgb(45_68_87/25%)] md:h-10 md:w-auto md:bg-strong md:px-5 md:text-sm md:shadow-none md:hover:bg-strong/90"><Check className="md:hidden" />Salvar alterações</Button></div>
      </form>
    </section>
  </>;
}
