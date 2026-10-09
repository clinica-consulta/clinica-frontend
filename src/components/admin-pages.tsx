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
