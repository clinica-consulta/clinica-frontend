import { SiteSelect } from "@/components/site-select";
import { DatePicker } from "@/components/date-picker";
import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, BadgeCheck, BarChart3, RefreshCw, Shield, TrendingUp, UserX, Bell, BriefcaseMedical, CalendarRange, CheckCheck, ClipboardList, ClipboardPlus, FileText, HeartPulse, Info, MoreVertical, SlidersHorizontal, ChevronRight, CircleX, Eye, Headset, History, MapPin, Plus, Syringe, CalendarCheck, CalendarClock, CalendarDays, Check, CheckCircle2, CircleAlert, Clock3, Lock, ShieldCheck, Stethoscope, Tags, UserCheck, UsersRound, X, Ban, Building2, CalendarOff, CalendarX2, ChevronDown, ChevronLeft, Contact, IdCard, LayoutList, LockKeyhole, Mail, Pencil, Phone, Save, Shapes, ShieldPlus, UserPlus, UserRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, Modal, PageHeader, SearchInput, Section, SelectField, StatCard, StatusBadge, Toggle, Toolbar } from "@/components/page-kit";
import { AppointmentForm } from "@/components/appointment-form";
import { RescheduleModal } from "@/components/clinic-pages";
import { formatDate, isoDate, openStatuses, relativeDay, weekdays, type Appointment } from "@/lib/clinic-data";
import { useClinic, useReports } from "@/lib/clinic-store";

import { AppointmentRow, Dot, Notice, NotificationList, usePatientScope, useProfessionalScope } from "@/components/role-shared";

export function AdminDashboardPage() {
  const { patients, professionals, appointments, staff, specialties, session } = useClinic();
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
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground md:text-sm"><span className="md:hidden">Acompanhe usuários, médicos e indicadores da clínica.</span><span className="hidden md:inline">Acompanhe usuários, médicos, especialidades e indicadores da clínica.</span></p>
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
        <div className="relative mt-auto flex items-center justify-between pt-6 text-xs"><span className="text-sidebar-muted">Sessão: {session?.name}</span><button type="button" onClick={() => toast.success("Log exportado")} className="rounded-md bg-success-soft px-4 py-1 font-semibold text-success-strong">Exportar Log</button></div>
      </article>
    </div>
  </>;
}


/* ---------- Componentes locais das telas do administrador ---------- */

function AdminHeader({ eyebrow, title, mobileTitle, description, mobileDescription, dot = false, eyebrowClass = "text-muted-foreground", badge, action, actionIcon, mobileActionIcon, mobileAction, onAction, mobileBlockAction = false, aside, mobileTitleClass = "text-[26px]" }: {
  eyebrow: string; title: string; mobileTitle?: string; description: string; mobileDescription?: string; dot?: boolean; eyebrowClass?: string; badge?: ReactNode;
  action?: string; actionIcon?: ReactNode; mobileActionIcon?: ReactNode; mobileAction?: string; onAction?: () => void; mobileBlockAction?: boolean; aside?: ReactNode; mobileTitleClass?: string;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-6">
      <div className="min-w-0">
        <p className={`mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase leading-4 tracking-[1.1px] ${eyebrowClass}`}>{dot && <span className="size-1.5 rounded-full bg-success md:hidden" />}{eyebrow}</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className={`min-w-0 ${mobileTitleClass} font-bold leading-8 tracking-[-0.8px] text-foreground md:text-[32px] md:uppercase md:leading-10 ${mobileTitle ? "" : "uppercase"}`}>
            {mobileTitle ? <><span className="md:hidden">{mobileTitle}</span><span className="hidden md:inline">{title}</span></> : title}
          </h1>
          {badge && <span className="shrink-0 md:hidden">{badge}</span>}
          {action && !mobileBlockAction && <Button onClick={onAction} className="h-9 shrink-0 rounded-lg bg-strong px-3 text-sm font-semibold hover:bg-strong/90 md:hidden">{mobileActionIcon ?? actionIcon ?? <Plus />}{mobileAction ?? action}</Button>}
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted-foreground md:mt-0.5 md:text-sm">{mobileDescription ? <><span className="md:hidden">{mobileDescription}</span><span className="hidden md:inline">{description}</span></> : description}</p>
      </div>
      {action && mobileBlockAction && <Button onClick={onAction} className="h-12 w-full rounded-lg bg-strong text-[15px] font-semibold hover:bg-strong/90 md:hidden">{mobileActionIcon ?? actionIcon ?? <Plus />}{mobileAction ?? action}</Button>}
      {aside}
      {action && <Button onClick={onAction} className="hidden h-10 shrink-0 rounded-lg bg-strong px-5 text-sm font-semibold shadow-[0_1px_1px_rgb(0_0_0/5%)] hover:bg-strong/90 md:inline-flex">{actionIcon ?? <Plus />}{action}</Button>}
    </header>
  );
}

function Pill({ status, className = "" }: { status: string; className?: string }) {
  const tone = status === "Ativo" || status === "Ativa" ? "bg-success-soft text-success-strong" : status === "Pendente" ? "bg-destructive-soft text-destructive" : "bg-muted text-muted-foreground";
  const dot = status === "Ativo" || status === "Ativa" ? "bg-success" : status === "Pendente" ? "bg-destructive" : "bg-subtle-foreground";
  return <span className={`inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11px] font-medium leading-4 ${tone} ${className}`}><span className={`size-1.5 rounded-full ${dot}`} />{status}</span>;
}

function DotStatus({ status }: { status: string }) {
  const dot = status === "Ativo" || status === "Ativa" ? "bg-success" : status === "Pendente" ? "bg-destructive" : "bg-subtle-foreground";
  return <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold"><span className={`size-1.5 rounded-full ${dot}`} />{status}</span>;
}

function Initials({ name, className = "" }: { name: string; className?: string }) {
  const value = name.replace(/^(Dra?\.)\s+/, "").split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <span className={`grid shrink-0 place-items-center rounded-full font-bold ${className}`}>{value}</span>;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-avatar md:bg-success" : "bg-input"}`}><span className={`absolute top-1 size-5 rounded-full bg-card shadow transition-all ${checked ? "left-6" : "left-1"}`} /></button>;
}

function CardTitle({ icon, children, action }: { icon?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return <div className="mb-4 flex items-center justify-between gap-3 md:mb-6"><h2 className="flex min-w-0 items-center gap-2 text-[15px] font-semibold uppercase leading-5 tracking-[0.2px] [&>svg]:size-[18px] [&>svg]:shrink-0">{icon}{children}</h2>{action}</div>;
}

function SoftField({ label, icon, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: ReactNode }) {
  return <label className={`grid min-w-0 gap-2 text-[13px] font-semibold leading-[18px] text-foreground ${className}`}>{label}<span className="relative block"><input {...props} className="h-11 w-full min-w-0 rounded-lg bg-soft px-3.5 pr-11 text-[15px] font-normal text-foreground outline-none ring-1 ring-transparent focus:ring-ring" /><span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">{icon}</span></span></label>;
}

const roleLabel = (role: string) => (role === "admin" ? "Administrador" : role === "professional" ? "Médico" : role === "patient" ? "Paciente" : "Recepção");

/* ---------- Usuários e permissões ---------- */

const USERS_PAGE = 4;

export function AdminUsersPage() {
  const { staff, patients, professionals, addStaff, updateStaff, togglePatientStatus, toggleProfessional } = useClinic();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("Todos");
  const [page, setPage] = useState(0);
  const all = [
    ...staff.map((item) => ({ key: `s-${item.id}`, name: item.name, email: item.email, role: roleLabel(item.role), detail: "", admin: item.role === "admin", status: item.status as string, toggle: () => { updateStaff(item.id, { status: item.status === "Ativo" ? "Inativo" : "Ativo" }); toast.success("Acesso atualizado"); } })),
    ...professionals.map((item) => ({ key: `m-${item.id}`, name: item.name, email: item.email, role: "Médico", detail: item.specialty, admin: false, status: item.active ? "Ativo" : "Inativo", toggle: () => { toggleProfessional(item.id); toast.success("Acesso atualizado"); } })),
    ...patients.map((item) => ({ key: `p-${item.id}`, name: item.name, email: item.email, role: "Paciente", detail: "", admin: false, status: item.status as string, toggle: () => { togglePatientStatus(item.id); toast.success("Acesso atualizado"); } })),
  ];
  const rows = all
    .filter((item) => (role === "Todos" ? true : item.role === role))
    .filter((item) => `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(search.toLowerCase()));
  const pages = Math.max(1, Math.ceil(rows.length / USERS_PAGE));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * USERS_PAGE, current * USERS_PAGE + USERS_PAGE);
  const actives = all.filter((item) => item.status === "Ativo").length;
  const pending = all.filter((item) => item.status === "Pendente").length;
  const roles = ["Todos", "Recepção", "Médico", "Administrador", "Paciente"];
  const avatarTone = (item: (typeof all)[number], mobile = false) => item.status === "Pendente" ? "bg-destructive-soft text-destructive" : item.admin ? (mobile ? "bg-avatar text-white" : "bg-success-soft text-success") : "bg-accent text-foreground";
  const roleIcon = (value: string) => value === "Administrador" ? <ShieldCheck /> : value === "Médico" ? <Stethoscope /> : value === "Paciente" ? <UserRound /> : <Contact />;
  const changeFilter = (value: string) => { setRole(value); setPage(0); };

  return <>
    <AdminHeader eyebrow="Controle de acesso" dot eyebrowClass="text-foreground md:text-muted-foreground" title="Usuários e permissões" mobileTitle="Usuários e Permissões" mobileTitleClass="text-[21px]" description="Gerencie contas e os perfis de acesso da plataforma." mobileDescription="Gerencie contas e os perfis de acesso da plataforma clínica." action="Novo usuário" mobileAction="Novo" mobileActionIcon={<UserPlus />} onAction={() => setOpen(true)} />

    <div className="mb-4 grid gap-4 md:mb-0 md:grid-cols-[minmax(0,1fr)_292px]">
      <SearchInput placeholder="Buscar nome ou e-mail..." value={search} onChange={(value) => { setSearch(value); setPage(0); }} className="[&_input]:h-12 [&_input]:ring-0" />
      <label className="relative hidden md:block"><span className="sr-only">Filtrar perfil</span><SiteSelect value={role} onChange={(event) => changeFilter(event.target.value)} className="h-12 w-full appearance-none rounded-lg bg-card px-4 text-[15px] shadow-[0_1px_2px_rgb(0_0_0/6%)] outline-none focus:ring-1 focus:ring-ring">{roles.map((item) => <option key={item} value={item}>{item}</option>)}</SiteSelect></label>
    </div>

    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">{roles.map((item) => <button key={item} type="button" onClick={() => changeFilter(item)} className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold ${role === item ? "bg-strong text-strong-foreground" : "bg-card shadow-[0_1px_2px_rgb(0_0_0/6%)]"}`}>{item}{item === "Todos" && <span className="ml-1.5 font-normal opacity-80">({all.length})</span>}</button>)}</div>

    {/* Mobile */}
    <div className="md:hidden">
      <div className="mb-3 flex items-center justify-between"><p className="eyebrow">Usuários cadastrados ({rows.length})</p><span className="flex items-center gap-1.5 text-[11px] font-semibold text-success"><span className="size-1.5 rounded-full bg-success" />{actives} Ativos</span></div>
      {visible.length ? <div className="space-y-3">{visible.map((item) => <article key={item.key} className="surface p-4">
        <div className="flex items-start gap-3"><Initials name={item.name} className={`size-11 text-base ${avatarTone(item, true)}`} /><div className="min-w-0 flex-1 pt-1"><b className="flex items-center gap-1.5 text-[15px] font-semibold leading-5"><span className="truncate">{item.name}</span>{item.admin && <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" />}</b><p className="truncate text-[13px] text-muted-foreground">{item.email}</p></div><Pill status={item.status} /></div>
        <div className="mt-3 flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground [&>svg]:size-3.5 [&>svg]:shrink-0">{roleIcon(item.role)}{item.role}{item.detail && <> • {item.detail}</>}</span><button type="button" onClick={item.toggle} className={`h-8 shrink-0 rounded-lg px-3.5 text-sm font-semibold ${item.status === "Ativo" ? "bg-accent text-foreground" : "bg-strong text-strong-foreground"}`}>{item.status === "Ativo" ? "Desativar" : "Ativar"}</button></div>
      </article>)}</div> : <EmptyHint>Nenhum usuário encontrado.</EmptyHint>}
    </div>

    {/* Desktop */}
    <section className="surface hidden p-6 md:block">
      <div className="mb-6 flex items-center justify-between pt-4"><h2 className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[0.2px]">Usuários cadastrados<span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium">{rows.length}</span></h2><span className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-success" />{actives} Ativos</span>{pending > 0 && <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-destructive" />{pending} Pendente{pending > 1 ? "s" : ""}</span>}</span></div>
      {visible.length ? <div className="space-y-2">{visible.map((item) => <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_132px_118px_92px] items-center gap-4 rounded-lg bg-soft px-4 py-4">
        <div className="flex min-w-0 items-center gap-4"><Initials name={item.name} className={`size-10 text-sm ${avatarTone(item)}`} /><div className="min-w-0"><b className="flex items-center gap-1 text-sm font-semibold leading-5"><span className="truncate">{item.name}</span>{item.admin && <ShieldCheck className="size-4 shrink-0 text-success" />}</b><p className="truncate text-[13px] text-muted-foreground">{item.email}</p></div></div>
        <span className="text-[15px] text-muted-foreground">{item.role}</span>
        <DotStatus status={item.status} />
        <button type="button" onClick={item.toggle} className={`h-8 justify-self-end rounded-md px-4 text-sm font-semibold shadow-[0_1px_2px_rgb(0_0_0/6%)] ${item.status === "Ativo" ? "bg-card text-foreground" : "bg-success text-white"}`}>{item.status === "Ativo" ? "Desativar" : "Ativar"}</button>
      </div>)}</div> : <EmptyHint>Nenhum usuário encontrado.</EmptyHint>}
      <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground"><span>Exibindo {visible.length} de {rows.length} usuários registrados</span><span className="flex items-center gap-3"><button type="button" aria-label="Página anterior" disabled={current === 0} onClick={() => setPage(current - 1)} className="grid size-8 place-items-center rounded-md bg-soft disabled:opacity-40"><ChevronLeft className="size-4" /></button><b className="font-semibold text-foreground">Página {current + 1}</b><button type="button" aria-label="Próxima página" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="grid size-8 place-items-center rounded-md bg-accent text-foreground disabled:opacity-40"><ChevronRight className="size-4" /></button></span></div>
    </section>
    {pages > 1 && <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground md:hidden"><span>Exibindo {visible.length} de {rows.length}</span><span className="flex items-center gap-3"><button type="button" aria-label="Página anterior" disabled={current === 0} onClick={() => setPage(current - 1)} className="grid size-8 place-items-center rounded-md bg-card disabled:opacity-40"><ChevronLeft className="size-4" /></button><b className="font-semibold text-foreground">Página {current + 1}</b><button type="button" aria-label="Próxima página" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="grid size-8 place-items-center rounded-md bg-accent disabled:opacity-40"><ChevronRight className="size-4" /></button></span></div>}

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

/* ---------- Gestão de médicos ---------- */

function StatStrip({ items }: { items: { icon: ReactNode; label: string; value: string }[] }) {
  return <div className="mb-6 hidden grid-cols-4 gap-4 rounded-xl bg-soft p-2 md:mb-10 md:grid">{items.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-lg bg-card px-4 py-2 shadow-[0_1px_2px_rgb(0_0_0/5%)]"><span className="[&>svg]:size-[18px]">{item.icon}</span><span className="min-w-0"><span className="block text-[11px] leading-4">{item.label}</span><b className="block truncate text-sm font-semibold leading-5">{item.value}</b></span></div>)}</div>;
}

export function AdminProfessionalsPage() {
  const { professionals, appointments, specialties, activeSpecialties, addProfessional, updateProfessional, toggleProfessional, deleteProfessional } = useClinic();
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const current = professionals.find((item) => item.id === editing) ?? null;
  const actives = professionals.filter((item) => item.active).length;
  const countFor = (id: string) => appointments.filter((item) => item.professionalId === id).length;
  const filtered = professionals.filter((item) => `${item.name} ${item.crm} ${item.specialty}`.toLowerCase().includes(search.toLowerCase()));
  const toggle = (id: string, active: boolean) => { toggleProfessional(id); toast.success(active ? "Médico desativado (histórico preservado)" : "Médico ativado"); };
  const plural = (value: number, one: string, many: string) => `${value} ${value === 1 ? one : many}`;
  const toRemove = professionals.find((item) => item.id === removing) ?? null;
  const removeCount = toRemove ? countFor(toRemove.id) : 0;

  async function confirmRemove() {
    if (!toRemove) return;
    setDeleting(true);
    const ok = await deleteProfessional(toRemove.id);
    setDeleting(false);
    if (ok) { toast.success("Médico excluído"); setRemoving(null); }
  }

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
    <AdminHeader eyebrow="Equipe clínica" dot eyebrowClass="text-foreground md:text-success" title="Gestão de médicos" description="Cadastre, edite, desative ou exclua médicos sem apagar o histórico de consultas." badge={<span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium">{actives} ativos</span>} action="Novo médico" onAction={() => setOpen(true)} mobileBlockAction />

    <StatStrip items={[
      { icon: <UserCheck />, label: "Ativos", value: plural(actives, "profissional", "profissionais") },
      { icon: <UserX />, label: "Inativos", value: plural(professionals.length - actives, "profissional", "profissionais") },
      { icon: <CalendarCheck />, label: "Consultas Registradas", value: `${appointments.length} totais` },
      { icon: <Shapes />, label: "Especialidades", value: plural(specialties.length, "cadastrada", "cadastradas") },
    ]} />

    <SearchInput placeholder="Buscar por nome, CRM ou especialidade..." value={search} onChange={setSearch} className="mb-4 block md:hidden [&_input]:h-12 [&_input]:ring-0" />

    {filtered.length ? <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">{filtered.map((professional) => <article key={professional.id} className="surface p-4 md:p-6">
      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-start gap-3"><Initials name={professional.name} className="size-12 bg-accent text-base text-foreground" /><div className="min-w-0 flex-1 pt-1.5"><h2 className="truncate text-base font-bold leading-5">{professional.name}</h2><p className="truncate text-xs text-muted-foreground">{professional.specialty} • {professional.crm}</p></div><Pill status={professional.active ? "Ativo" : "Inativo"} /></div>
        <p className="mt-4 flex items-center gap-2 truncate text-[13px] text-muted-foreground"><Mail className="size-4 shrink-0" />{professional.email}</p>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-soft px-3 py-2.5 text-sm font-semibold"><span className="flex items-center gap-2"><CalendarCheck className="size-4" />Consultas registradas</span><b className="font-bold">{countFor(professional.id)}</b></div>
        <Button variant="ghost" onClick={() => setEditing(professional.id)} className="mt-4 h-11 w-full rounded-lg bg-accent text-[15px] font-semibold hover:bg-accent/80"><Pencil />Editar dados</Button>
        <div className="mt-2 flex items-center justify-center gap-6"><button type="button" onClick={() => toggle(professional.id, professional.active)} className="flex h-9 items-center gap-1.5 text-sm font-medium"><Ban className="size-4" />{professional.active ? "Desativar médico" : "Ativar médico"}</button><button type="button" onClick={() => setRemoving(professional.id)} className="flex h-9 items-center gap-1.5 text-sm font-medium text-destructive"><Trash2 className="size-4" />Excluir</button></div>
      </div>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between"><Initials name={professional.name} className="size-12 bg-accent text-base text-foreground" /><Pill status={professional.active ? "Ativo" : "Inativo"} className="mt-0.5" /></div>
        <h2 className="mt-6 truncate text-xl font-bold leading-7 tracking-[-0.3px]">{professional.name}</h2>
        <p className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">{professional.specialty}<span className="size-1 rounded-full bg-input" />{professional.crm}</p>
        <p className="mt-1 truncate text-[13px] text-muted-foreground">{professional.email}</p>
        <div className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground"><b className="mr-2 font-bold text-foreground">{countFor(professional.id)}</b>consultas registradas</div>
        <Button variant="ghost" onClick={() => setEditing(professional.id)} className="mt-6 h-9 w-full rounded-lg bg-accent text-sm font-semibold hover:bg-accent/80">Editar dados</Button>
        <div className="mt-2 flex items-center justify-center gap-6"><button type="button" onClick={() => toggle(professional.id, professional.active)} className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground">{professional.active ? "Desativar" : "Ativar"}</button><button type="button" onClick={() => setRemoving(professional.id)} className="flex h-8 items-center gap-1 text-xs font-medium text-destructive hover:opacity-80"><Trash2 className="size-3.5" />Excluir</button></div>
      </div>
    </article>)}</div> : <EmptyHint>Nenhum médico encontrado.</EmptyHint>}

    <aside className="mt-6 flex items-start gap-4 rounded-xl bg-soft p-4 md:mt-14 md:items-center md:p-6">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent md:size-10 md:bg-success-soft md:text-success [&>svg]:size-4 md:[&>svg]:size-5"><ShieldCheck /></span>
      <div className="min-w-0 flex-1"><b className="block text-sm font-bold leading-5 md:text-[15px] md:font-semibold"><span className="md:hidden">Histórico Preservado</span><span className="hidden md:inline">Histórico protegido e auditado</span></b><p className="text-xs leading-4 text-muted-foreground md:text-[13px]"><span className="md:hidden">Ao desativar um médico da equipe, os agendamentos anteriores e relatórios clínicos permanecem acessíveis no arquivo central.</span><span className="hidden md:inline">Desativar um médico remove-o da nova agenda de marcação, mantendo todos os prontuários anteriores intactos.</span></p></div>
      <button type="button" onClick={() => toast.info("Políticas de desativação", { description: "Médicos inativos saem da agenda de marcação; consultas e prontuários anteriores continuam disponíveis." })} className="hidden shrink-0 items-center gap-1 text-sm font-semibold md:flex">Políticas de desativação<ArrowRight className="size-4" /></button>
    </aside>

    <Modal open={Boolean(toRemove)} title="Excluir médico" onClose={() => setRemoving(null)}>
      {toRemove && (removeCount > 0
        ? <div className="grid gap-4 text-sm">
            <p><b>{toRemove.name}</b> tem {plural(removeCount, "consulta registrada", "consultas registradas")}. Para não apagar o histórico dos pacientes, ele não pode ser excluído.</p>
            <p className="text-muted-foreground">Você pode desativá-lo: ele sai da agenda de marcação e perde o acesso ao sistema, mas o histórico continua guardado.</p>
            <div className="flex flex-wrap gap-2">{toRemove.active && <Button onClick={() => { toggle(toRemove.id, true); setRemoving(null); }}><Ban />Desativar médico</Button>}<Button variant="ghost" className="bg-soft" onClick={() => setRemoving(null)}>Voltar</Button></div>
          </div>
        : <div className="grid gap-4 text-sm">
            <p>Excluir <b>{toRemove.name}</b> ({toRemove.specialty})? O cadastro, o login e os bloqueios de agenda dele serão apagados. Isso não pode ser desfeito.</p>
            <div className="flex flex-wrap gap-2"><Button variant="destructive" disabled={deleting} onClick={() => void confirmRemove()}><Trash2 />{deleting ? "Excluindo…" : "Excluir médico"}</Button><Button variant="ghost" className="bg-soft" onClick={() => setRemoving(null)}>Cancelar</Button></div>
          </div>)}
    </Modal>

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

/* ---------- Especialidades (sem tela no protótipo: segue o padrão de Médicos/Usuários) ---------- */

export function AdminSpecialtiesPage() {
  const { specialties, professionals, appointments, insurances, addSpecialty, updateSpecialty, toggleSpecialty } = useClinic();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const current = specialties.find((item) => item.id === editing) ?? null;
  const actives = specialties.filter((item) => item.active).length;
  const rows = specialties.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).map((item) => ({
    ...item,
    pros: professionals.filter((pro) => pro.specialty === item.name),
    count: appointments.filter((appointment) => appointment.specialty === item.name).length,
    plans: insurances.filter((plan) => plan.active && (!plan.covered.length || plan.covered.includes(item.name))).map((plan) => plan.name),
  }));
  const toggle = (id: string, active: boolean) => { toggleSpecialty(id); toast.success(active ? "Especialidade desativada" : "Especialidade ativada"); };

  return <>
    <AdminHeader eyebrow="Configuração clínica" dot title="Especialidades" description="Cadastre, edite e desative especialidades sem apagar consultas anteriores." badge={<span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium">{actives} ativas</span>} action="Nova especialidade" onAction={() => setOpen(true)} mobileBlockAction />

    <StatStrip items={[
      { icon: <BadgeCheck />, label: "Ativas", value: `${actives} especialidade${actives === 1 ? "" : "s"}` },
      { icon: <CircleX />, label: "Inativas", value: `${specialties.length - actives} especialidade${specialties.length - actives === 1 ? "" : "s"}` },
      { icon: <Stethoscope />, label: "Médicos vinculados", value: `${professionals.length} profissiona${professionals.length === 1 ? "l" : "is"}` },
      { icon: <ShieldPlus />, label: "Convênios", value: `${insurances.filter((plan) => plan.active).length} ativos` },
    ]} />

    <SearchInput placeholder="Buscar especialidade..." value={search} onChange={setSearch} className="mb-4 block md:hidden [&_input]:h-12 [&_input]:ring-0" />

    {/* Mobile */}
    <div className="space-y-3 md:hidden">{rows.map((item) => <article key={item.id} className="surface p-4">
      <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent [&>svg]:size-5"><Tags /></span><div className="min-w-0 flex-1 pt-0.5"><h2 className="truncate text-base font-bold leading-5">{item.name}</h2><p className="text-xs text-muted-foreground">{item.pros.length} médico(s) • {item.count} consulta(s)</p></div><Pill status={item.active ? "Ativa" : "Inativa"} /></div>
      <p className="mt-3 flex items-start gap-2 text-[13px] text-muted-foreground"><ShieldPlus className="mt-0.5 size-4 shrink-0" />{item.plans.join(", ") || "Sem convênios"}</p>
      <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="ghost" onClick={() => setEditing(item.id)} className="h-10 rounded-lg bg-accent font-semibold hover:bg-accent/80"><Pencil />Editar</Button><button type="button" onClick={() => toggle(item.id, item.active)} className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-medium"><Ban className="size-4" />{item.active ? "Desativar" : "Ativar"}</button></div>
    </article>)}</div>

    {/* Desktop */}
    <section className="surface hidden p-6 md:block">
      <div className="mb-6 flex items-center justify-between gap-4"><h2 className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[0.2px]">Especialidades cadastradas<span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium">{specialties.length}</span></h2><SearchInput placeholder="Buscar especialidade..." value={search} onChange={setSearch} className="block w-72 [&_input]:h-10 [&_input]:bg-soft [&_input]:shadow-none [&_input]:ring-0" /></div>
      <div className="space-y-2">{rows.map((item) => <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px_auto] items-center gap-4 rounded-lg bg-soft px-4 py-4">
        <div className="flex min-w-0 items-center gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent [&>svg]:size-[18px]"><Tags /></span><div className="min-w-0"><b className="block truncate text-sm font-semibold leading-5">{item.name}</b><p className="truncate text-[13px] text-muted-foreground">{item.pros.length} médico(s) • {item.count} consulta(s)</p></div></div>
        <span className="truncate text-[13px] text-muted-foreground" title={item.plans.join(", ")}>Convênios: {item.plans.join(", ") || "—"}</span>
        <DotStatus status={item.active ? "Ativa" : "Inativa"} />
        <span className="flex items-center gap-2 justify-self-end"><button type="button" onClick={() => setEditing(item.id)} className="h-8 rounded-md bg-card px-4 text-sm font-semibold shadow-[0_1px_2px_rgb(0_0_0/6%)]">Editar</button><button type="button" onClick={() => toggle(item.id, item.active)} className={`h-8 rounded-md px-4 text-sm font-semibold ${item.active ? "text-muted-foreground hover:text-foreground" : "bg-success text-white"}`}>{item.active ? "Desativar" : "Ativar"}</button></span>
      </div>)}</div>
      {!rows.length && <EmptyHint>Nenhuma especialidade encontrada.</EmptyHint>}
    </section>

    <aside className="mt-6 flex items-start gap-4 rounded-xl bg-soft p-4 md:mt-10 md:items-center md:p-6">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent md:size-10 md:bg-success-soft md:text-success [&>svg]:size-4 md:[&>svg]:size-5"><ShieldCheck /></span>
      <div className="min-w-0 flex-1"><b className="block text-sm font-bold leading-5 md:text-[15px] md:font-semibold">Consultas anteriores preservadas</b><p className="text-xs leading-4 text-muted-foreground md:text-[13px]">Desativar uma especialidade a remove da nova marcação, mantendo o histórico de consultas e médicos vinculados.</p></div>
    </aside>

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

/* ---------- Agendas e horários ---------- */

const timeInput = "h-9 w-full appearance-none rounded-md bg-card px-2 text-[13px] outline-none focus:ring-1 focus:ring-ring";
const timeOptions = Array.from({ length: 33 }, (_, index) => `${String(6 + Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`);

function TimeSelect({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className: string }) {
  const options = timeOptions.includes(value) ? timeOptions : [...timeOptions, value].sort();
  return <SiteSelect chevron={false} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={className}>{options.map((item) => <option key={item} value={item}>{item}</option>)}</SiteSelect>;
}

export function AdminSchedulesPage() {
  const { professionals, appointments, blocks, patientById, setAvailability, addBlock, removeBlock } = useClinic();
  const [selected, setSelected] = useState(professionals[0]?.id ?? "");
  const [date, setDate] = useState(isoDate(0));
  const [blockOpen, setBlockOpen] = useState(false);
  const professional = professionals.find((item) => item.id === selected) ?? professionals[0] ?? null;
  const days = weekdays.map((day) => ({ ...day, value: day.value, avail: professional?.availability[day.value] ?? { active: false, start: "08:00", end: "17:00" } }));
  const activeDays = days.filter((day) => day.avail.active).length;
  const setDay = (weekday: number, value: { active: boolean; start: string; end: string }) => professional && setAvailability(professional.id, weekday, value);
  const toggleDay = (day: (typeof days)[number]) => { setDay(day.value, { ...day.avail, active: !day.avail.active }); toast.success(day.avail.active ? `${day.label} sem atendimento` : `${day.label} liberada`); };
  const weekdayShort = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)).replace(".", "").replace(/^./, (c) => c.toUpperCase());
  const avatarTones = ["bg-success-soft text-success", "bg-accent text-foreground", "bg-success-soft text-success"];
  const agenda = professionals.map((item) => ({ item, list: appointments.filter((appointment) => appointment.professionalId === item.id && appointment.date === date && appointment.status !== "Cancelada").sort((a, b) => a.time.localeCompare(b.time)) }));

  return <>
    <AdminHeader eyebrow="Agendas médicas" eyebrowClass="text-success md:text-muted-foreground" title="Agendas e horários" mobileTitle="Agendas e Horários" description="Defina horários de atendimento, bloqueie períodos e veja a agenda centralizada." mobileDescription="Defina horários de atendimento, bloqueie períodos e veja a agenda." action="Bloquear período" mobileActionIcon={<CalendarX2 />} onAction={() => setBlockOpen(true)} />

    {/* Filtros */}
    <div className="surface mb-4 grid gap-4 p-4 md:mb-6 md:grid-cols-2 md:bg-transparent md:p-0 md:shadow-none lg:max-w-[1012px]">
      <label className="grid gap-2 text-[13px] font-semibold"><span className="flex items-center gap-1.5"><Stethoscope className="size-4 text-success md:hidden" />Médico</span><span className="relative"><SiteSelect value={professional?.id ?? ""} onChange={(event) => setSelected(event.target.value)} className="h-11 w-full appearance-none rounded-lg bg-soft px-3.5 text-[15px] font-medium outline-none focus:ring-1 focus:ring-ring md:h-12 md:bg-card md:px-4 md:font-normal md:shadow-[0_1px_2px_rgb(0_0_0/6%)]">{professionals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SiteSelect></span></label>
      <div className="grid gap-2 text-[13px] font-semibold"><span className="flex items-center gap-1.5"><CalendarDays className="size-4 md:hidden" />Dia da agenda centralizada</span><DatePicker value={date} required onChange={(next) => setDate(next || isoDate(0))} aria-label="Dia da agenda centralizada" className="flex h-11 w-full items-center justify-between rounded-lg bg-soft px-3.5 text-[15px] font-medium md:h-12 md:bg-card md:px-4 md:font-normal md:shadow-[0_1px_2px_rgb(0_0_0/6%)]" /></div>
    </div>

    {/* Horários */}
    {professional && <section className="surface p-4 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3 md:mb-6 md:items-center">
        <h2 className="flex items-start gap-2 text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-soft-foreground md:items-center md:text-foreground"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-success md:hidden" /><span><span className="md:hidden">Horários da semana</span><span className="hidden md:inline">Horários de atendimento</span> • {professional.name}</span></h2>
        <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success-strong"><span className="md:hidden">{activeDays} dias ativos</span><span className="hidden md:inline">{activeDays ? "Configuração Ativa" : "Sem atendimento"}</span></span>
      </div>
      <div className="space-y-2">{days.map((day) => <div key={day.value} className={`rounded-lg px-3 py-2.5 md:grid md:grid-cols-[140px_auto_minmax(0,1fr)_auto_minmax(0,1fr)_112px] md:items-center md:gap-4 md:px-4 md:py-4 ${day.avail.active ? "bg-soft" : "bg-soft/60"}`}>
        {/* Mobile */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          <div className="min-w-0"><b className={`block text-[15px] leading-5 ${day.avail.active ? "font-bold" : "font-medium text-muted-foreground"}`}>{day.label}</b><span className={`flex items-center gap-1 text-[13px] ${day.avail.active ? "text-muted-foreground" : "text-subtle-foreground"}`}><Clock3 className="size-3.5" /><TimeSelect label={`Início ${day.label}`} value={day.avail.start} onChange={(value) => setDay(day.value, { ...day.avail, start: value })} className="w-[44px] appearance-none bg-transparent p-0 tabular-nums outline-none" />às<TimeSelect label={`Fim ${day.label}`} value={day.avail.end} onChange={(value) => setDay(day.value, { ...day.avail, end: value })} className="w-[44px] appearance-none bg-transparent p-0 tabular-nums outline-none" /></span></div>
          <button type="button" onClick={() => toggleDay(day)} className={`h-8 shrink-0 rounded-md px-3 text-sm font-semibold ${day.avail.active ? "bg-strong text-strong-foreground" : "bg-accent text-muted-foreground"}`}>{day.avail.active ? "Atende" : "Não atende"}</button>
        </div>
        {/* Desktop */}
        <b className={`hidden text-[15px] md:block ${day.avail.active ? "font-bold" : "font-medium text-muted-foreground"}`}>{day.label}</b>
        <span className="hidden text-xs text-muted-foreground md:block">Início</span>
        <span className="relative hidden md:block"><TimeSelect label={`Início ${day.label}`} value={day.avail.start} onChange={(value) => setDay(day.value, { ...day.avail, start: value })} className={timeInput} /><Clock3 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" /></span>
        <span className="hidden text-xs text-muted-foreground md:block">Fim</span>
        <span className="relative hidden md:block"><TimeSelect label={`Fim ${day.label}`} value={day.avail.end} onChange={(value) => setDay(day.value, { ...day.avail, end: value })} className={timeInput} /><Clock3 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" /></span>
        <button type="button" onClick={() => toggleDay(day)} className={`hidden h-9 rounded-md text-sm font-semibold md:block ${day.avail.active ? "bg-foreground text-white" : "bg-accent text-soft-foreground"}`}>{day.avail.active ? "Atende" : "Não atende"}</button>
      </div>)}</div>
    </section>}

    {/* Bloqueios */}
    <section className="surface mt-4 p-4 md:mt-6 md:p-6">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-soft-foreground md:text-foreground"><span className="md:hidden">Bloqueios registrados</span><span className="hidden md:inline">Bloqueios</span> ({blocks.length})</h2><LockKeyhole className="size-4 text-muted-foreground md:hidden" /></div>
      {blocks.length ? <div className="space-y-2">{blocks.map((block) => <div key={block.id} className="flex items-start gap-3 rounded-lg bg-soft p-3 md:items-center md:px-4 md:py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent md:hidden [&>svg]:size-4"><CalendarOff /></span>
        <div className="min-w-0 flex-1">
          <b className="block text-[15px] font-semibold leading-5">{professionals.find((item) => item.id === block.professionalId)?.name ?? "Médico"}</b>
          <p className="text-[13px] text-muted-foreground md:hidden">{formatDate(block.startDate)}{block.endDate !== block.startDate && ` a ${formatDate(block.endDate)}`} • <b className="whitespace-nowrap font-semibold text-foreground">{block.startTime} - {block.endTime}</b></p>
          <p className="flex items-center gap-1.5 text-xs text-success md:hidden"><span className="size-1.5 rounded-full bg-success" />{block.reason}</p>
          <p className="hidden text-xs text-muted-foreground md:block">{formatDate(block.startDate)} a {formatDate(block.endDate)} • {block.startTime}–{block.endTime} • {block.reason}</p>
        </div>
        <button type="button" onClick={() => { removeBlock(block.id); toast.success("Bloqueio removido"); }} className="h-8 shrink-0 rounded-md px-1 text-sm font-semibold text-destructive md:px-3 md:text-foreground md:hover:bg-accent">Remover</button>
      </div>)}</div> : <EmptyHint>Nenhum período bloqueado.</EmptyHint>}
    </section>

    {/* Agenda centralizada */}
    <section className="surface mt-4 p-4 md:mt-6 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-soft-foreground md:text-foreground"><LayoutList className="size-4 md:hidden" />Agenda centralizada • {formatDate(date)}</h2><span className="text-xs font-medium md:hidden">{weekdayShort}</span><span className="hidden items-center gap-1.5 text-xs md:flex"><span className="size-1.5 rounded-full bg-success" />Sincronizado</span></div>
      <div className="space-y-2">{agenda.map(({ item, list }, index) => <div key={item.id} className="rounded-lg bg-soft p-3 md:px-4 md:py-3">
        <div className="flex items-center gap-3">
          <Initials name={item.name} className={`size-9 text-sm font-medium md:hidden ${avatarTones[index % avatarTones.length]}`} />
          <div className="min-w-0 flex-1"><b className="block truncate text-[15px] font-semibold leading-5">{item.name}</b>{!list.length && <p className="text-[13px] text-muted-foreground"><span className="md:hidden">Sem consultas agendadas</span><span className="hidden md:inline">Sem consultas nesta data.</span></p>}{list.length > 0 && <p className="text-[13px] text-muted-foreground md:hidden">{list.length} consulta{list.length > 1 ? "s" : ""} agendada{list.length > 1 ? "s" : ""}</p>}</div>
          <CalendarCheck className="size-[18px] shrink-0 text-muted-foreground md:hidden" />
        </div>
        {list.length > 0 && <div className="mt-2 space-y-1.5 md:mt-1.5">{list.map((appointment) => <div key={appointment.id} className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-2 text-xs"><b className="text-primary">{appointment.time}</b><span className="truncate">{patientById(appointment.patientId)?.name}</span><StatusBadge status={appointment.status} /></div>)}</div>}
      </div>)}</div>
    </section>

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
        <SelectField label="Médico" name="professionalId" defaultValue={professional?.id} className="sm:col-span-2" options={professionals.map((item) => ({ value: item.id, label: item.name }))} />
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

/* ---------- Configurações ---------- */

export function AdminSettingsPage() {
  const { settings, updateSettings, insurances, staff, specialties, saveInsurance, toggleInsurance } = useClinic();
  const navigate = useNavigate();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<{ id?: string; name: string; covered: string[] } | null>(null);
  const activePlans = insurances.filter((plan) => plan.active);
  const staffTone = (role: string, mobile = false) => role === "admin" ? (mobile ? "bg-avatar text-white" : "bg-success-soft text-success") : "bg-accent text-foreground";
  const planDots = ["bg-success", "bg-foreground", "bg-subtle-foreground"];

  return <>
    <AdminHeader eyebrow="Administração" title="Configurações" description="Atualize os dados institucionais, convênios e preferências gerais." mobileDescription="Atualize dados institucionais, convênios e preferências." aside={<span className="hidden items-center gap-2 self-end rounded-full bg-success-soft px-4 py-1 text-xs font-medium text-success-strong md:flex"><span className="size-2 rounded-full bg-success" />Sistema Operacional &amp; Conectado</span>} />

    <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
      <section className="surface p-6">
        <CardTitle icon={<Building2 />} action={<><span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success-strong md:hidden">Ativa</span><span className="hidden rounded bg-soft px-2 py-1 text-[11px] font-medium md:inline">ID: CLI-2026-SP</span></>}>Dados da clínica</CardTitle>
        <form className="grid gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-4 md:pt-4" onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          updateSettings({ name: String(data.get("name") ?? ""), cnpj: String(data.get("cnpj") ?? ""), phone: String(data.get("phone") ?? ""), email: String(data.get("email") ?? "") });
          setSavedAt(new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
          toast.success("Configurações salvas", { description: "Os dados da clínica foram atualizados." });
        }}>
          <SoftField label="Nome da clínica" name="name" defaultValue={settings.name} required icon={<><Building2 className="md:hidden" /><Pencil className="hidden md:block" /></>} />
          <SoftField label="CNPJ" name="cnpj" defaultValue={settings.cnpj} required icon={<IdCard />} />
          <SoftField label="Telefone" name="phone" defaultValue={settings.phone} required icon={<Phone />} />
          <SoftField label="E-mail" name="email" type="email" defaultValue={settings.email} required icon={<Mail />} />
          <div className="mt-2 flex flex-col gap-3 md:col-span-2 md:mt-4 md:flex-row md:items-center md:justify-between">
            <Button type="submit" className="h-12 rounded-lg bg-strong px-6 text-[15px] font-semibold hover:bg-strong/90"><Save />Salvar alterações</Button>
            <span className="hidden text-xs italic text-muted-foreground md:inline">{savedAt ? `Última sincronização: hoje às ${savedAt}` : "Dados sincronizados com o portal do paciente"}</span>
          </div>
        </form>
      </section>

      <section className="surface p-6">
        <CardTitle icon={<ShieldPlus />} action={<button type="button" aria-label="Adicionar convênio" onClick={() => setPlanForm({ name: "", covered: [] })} className="grid size-7 place-items-center rounded-full bg-accent"><Plus className="size-4" /></button>}>Convênios e cobertura</CardTitle>
        <div className="space-y-2">{insurances.map((plan, index) => <div key={plan.id} className="rounded-lg bg-soft p-4">
          <div className="flex items-center gap-2.5"><span className={`size-2 shrink-0 rounded-full md:hidden ${planDots[index % planDots.length]}`} /><b className="flex-1 text-[15px] font-semibold">{plan.name}</b><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium md:hidden ${plan.covered.length ? "bg-success-soft text-success-strong" : "bg-card/70 text-muted-foreground"}`}>{plan.covered.length ? "Credenciado" : "Padrão"}</span><span className={`hidden size-2 rounded-full md:block ${plan.active ? "bg-success" : "bg-subtle-foreground"}`} /></div>
          <p className="mt-1 pl-[18px] text-sm text-muted-foreground md:pl-0 md:text-[13px]">{plan.covered.length ? `Cobre: ${plan.covered.join(", ")}` : "Cobre todas as especialidades"}{!plan.active && " · Inativo"}</p>
          <div className="mt-2 flex gap-2 pl-[18px] md:pl-0"><button type="button" onClick={() => setPlanForm({ id: plan.id, name: plan.name, covered: plan.covered })} className="h-7 rounded-md bg-card px-3 text-xs font-semibold">Editar</button><button type="button" onClick={() => { toggleInsurance(plan.id); toast.success(plan.active ? `${plan.name} desativado` : `${plan.name} ativado`); }} className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground hover:text-foreground">{plan.active ? "Desativar" : "Ativar"}</button></div>
        </div>)}</div>
        {!insurances.length && <EmptyHint>Nenhum convênio cadastrado. Clique em + para adicionar.</EmptyHint>}
        <div className="mt-6 hidden items-center justify-between text-xs md:flex"><span className="text-muted-foreground">{activePlans.length} convênios ativos</span><button type="button" onClick={() => navigate({ to: "/administrador/especialidades" })} className="flex items-center gap-1 font-semibold">Gerenciar regras<ArrowRight className="size-3.5" /></button></div>
      </section>
    </div>

    <Modal open={Boolean(planForm)} title={planForm?.id ? "Editar convênio" : "Novo convênio"} description="Marque as especialidades cobertas. Sem nenhuma marcada, o convênio cobre todas." onClose={() => setPlanForm(null)}>
      {planForm && <form className="grid gap-4" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        if (!name) return;
        if (insurances.some((plan) => plan.id !== planForm.id && plan.name.toLowerCase() === name.toLowerCase())) { toast.error("Já existe um convênio com esse nome"); return; }
        saveInsurance({ ...(planForm.id && { id: planForm.id }), name, covered: data.getAll("covered").map(String) });
        toast.success(planForm.id ? "Convênio atualizado" : "Convênio cadastrado", { description: name });
        setPlanForm(null);
      }}>
        <Field label="Nome do convênio" name="name" defaultValue={planForm.name} placeholder="Ex.: Unimed" required />
        <fieldset className="grid gap-2"><legend className="mb-2 text-sm font-semibold">Especialidades cobertas</legend>
          {specialties.length ? specialties.map((item) => <label key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="covered" value={item.name} defaultChecked={planForm.covered.includes(item.name)} className="size-4 accent-primary" />{item.name}</label>) : <p className="text-sm text-muted-foreground">Nenhuma especialidade cadastrada.</p>}
        </fieldset>
        <Button type="submit">{planForm.id ? "Salvar alterações" : "Cadastrar convênio"}</Button>
      </form>}
    </Modal>

    <section className="surface mt-4 p-6 md:mt-6">
      <CardTitle icon={<SlidersHorizontal />}>Preferências de confirmação</CardTitle>
      <div className="grid gap-5 md:flex md:items-center md:justify-between md:gap-6 md:rounded-lg md:bg-soft md:p-4">
        <div className="flex items-center gap-4 rounded-lg bg-soft p-4 md:bg-transparent md:p-0">
          <span className="order-2 md:order-none"><Switch label="Confirmação automática" checked={settings.autoConfirm} onChange={(value) => { updateSettings({ autoConfirm: value }); toast.success(value ? "Confirmação automática ativada" : "Confirmação automática desativada"); }} /></span>
          <span className="min-w-0 flex-1"><b className="block text-[15px] font-semibold">Confirmação automática</b><span className="text-xs text-muted-foreground">Consultas já criadas como confirmadas</span></span>
        </div>
        <label className="grid gap-2 text-[15px] font-semibold md:flex md:items-center md:gap-4">
          <span className="flex items-center gap-2"><Bell className="hidden size-4 text-info-strong md:block" />Antecedência do lembrete</span>
          <span className="relative block md:w-56"><SiteSelect value={String(settings.reminderHours)} onChange={(event) => { updateSettings({ reminderHours: Number(event.target.value) }); toast.success("Antecedência atualizada"); }} className="h-11 w-full appearance-none rounded-lg bg-soft px-3.5 text-[15px] font-normal outline-none focus:ring-1 focus:ring-ring md:h-11 md:bg-card">{[12, 24, 48].map((hours) => <option key={hours} value={hours}>{hours} horas antes</option>)}</SiteSelect></span>
        </label>
      </div>
      <div className="mt-6 md:mt-6 md:border-t md:border-border md:pt-6">
        <div className="mb-3 flex items-center justify-between gap-3 md:mb-4"><h3 className="flex items-center gap-2 text-[13px] font-medium uppercase md:text-[15px] md:font-semibold md:normal-case [&>svg]:size-4"><Contact className="md:hidden" /><UsersRound className="hidden md:block" /><span className="md:hidden">Equipe interna</span><span className="hidden md:inline">Equipe interna com acesso a preferências</span></h3><span className="text-[11px] text-muted-foreground md:text-xs">{staff.length} colaboradores<span className="hidden md:inline"> autorizados</span></span></div>
        <div className="grid gap-2 md:grid-cols-3 md:gap-4">{staff.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-lg bg-soft px-2.5 py-2 md:gap-4 md:p-4">
          <Initials name={item.name} className={`size-9 text-sm md:size-10 ${staffTone(item.role, true)} md:hidden`} />
          <Initials name={item.name} className={`hidden size-10 text-sm md:grid ${staffTone(item.role)}`} />
          <div className="min-w-0 flex-1"><b className="block truncate text-sm font-semibold leading-5 md:text-[15px]">{item.name}</b><p className="truncate text-xs text-muted-foreground md:text-[13px]">{item.email}</p><p className={`hidden text-xs md:block ${item.role === "admin" ? "text-success" : "text-muted-foreground"}`}>{roleLabel(item.role)}</p></div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium md:hidden ${item.role === "admin" ? "bg-success-soft text-success-strong" : "bg-card text-muted-foreground"}`}>{roleLabel(item.role)}</span>
        </div>)}</div>
      </div>
    </section>
  </>;
}
