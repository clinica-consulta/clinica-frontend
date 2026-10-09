import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, BadgeCheck, BarChart3, RefreshCw, Shield, TrendingUp, UserX, Bell, BriefcaseMedical, CalendarRange, CheckCheck, ClipboardList, ClipboardPlus, FileText, HeartPulse, Info, MoreVertical, SlidersHorizontal, ChevronRight, CircleX, Eye, Headset, History, MapPin, Plus, Syringe, CalendarCheck, CalendarClock, CalendarDays, Check, CheckCircle2, CircleAlert, Clock3, Lock, ShieldCheck, Stethoscope, Tags, UserCheck, UsersRound, X } from "lucide-react";
import { AlarmClock, BellRing, CalendarX, ChevronDown, ChevronLeft, CircleCheck, CircleHelp, IdCard, ListFilter, Mail, Pencil, Phone, ScrollText, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, Modal, PageHeader, Section, SelectField, StatCard, StatusBadge, Toggle, Toolbar } from "@/components/page-kit";
import { AppointmentForm } from "@/components/appointment-form";
import { RescheduleModal } from "@/components/clinic-pages";
import { formatDate, isoDate, openStatuses, relativeDay, weekdays, type Appointment } from "@/lib/clinic-data";
import { useClinic, useReports } from "@/lib/clinic-store";

import { AppointmentRow, Dot, Notice, NotificationList, usePatientScope, useProfessionalScope } from "@/components/role-shared";

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



/* ---------------------------------------------------------------- Agendar consulta */

const weekLetters = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const toIsoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const brDate = (iso: string) => iso.split("-").reverse().join("/");
const softShadow = "shadow-[0_1px_2px_rgb(11_28_48/8%)]";

function BookingCalendar({ value, onChange, slotsFor }: { value: string; onChange: (date: string) => void; slotsFor: (date: string) => number }) {
  const [month, setMonth] = useState(() => { const d = new Date(`${value}T12:00:00`); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = isoDate(0);
  const lead = month.getDay();
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const prevTotal = new Date(month.getFullYear(), month.getMonth(), 0).getDate();
  const trail = (7 - ((lead + total) % 7)) % 7;
  const days = Array.from({ length: total }, (_, i) => toIsoDay(new Date(month.getFullYear(), month.getMonth(), i + 1)));
  const outside = "grid h-9 place-items-center text-[13px] text-subtle-foreground/40 md:h-12 md:text-sm";

  return (
    <div className="rounded-xl bg-soft px-3 py-4 md:bg-soft/70 md:px-4 md:pb-5">
      <div className="mb-3 flex items-center justify-between md:mb-4">
        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></Button>
        <b className="text-[17px] font-semibold leading-6 [text-transform:capitalize]">{monthLabel.format(month).replace(" de ", " De ")}</b>
        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold leading-4 text-muted-foreground md:gap-x-3">{weekLetters.map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className="mt-2 grid grid-cols-7 gap-1 md:mt-3 md:gap-x-3 md:gap-y-1">
        {Array.from({ length: lead }, (_, i) => <span key={`p${i}`} className={outside}>{prevTotal - lead + i + 1}</span>)}
        {days.map((date) => {
          const past = date < today;
          const free = past ? 0 : slotsFor(date);
          const selected = date === value;
          return (
            <button type="button" key={date} disabled={past || (!free && !selected)} onClick={() => onChange(date)} title={past ? "" : `${free} horário(s) livre(s)`}
              className={`relative grid h-9 place-items-center rounded-lg text-[13px] leading-5 transition-colors md:h-12 md:text-sm ${selected ? "bg-strong font-bold text-strong-foreground md:ring-2 md:ring-strong md:ring-offset-2 md:ring-offset-soft" : free ? "bg-success-soft font-semibold text-foreground hover:bg-success-soft/70" : "text-subtle-foreground/50"}`}>
              {Number(date.slice(8))}
              {free > 0 && <span className={`absolute bottom-1 size-1 rounded-full md:bottom-1.5 ${selected ? "bg-strong-foreground" : "bg-success"}`} />}
            </button>
          );
        })}
        {Array.from({ length: trail }, (_, i) => <span key={`n${i}`} className={outside}>{i + 1}</span>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground md:mt-5 md:pl-1">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" />Dias com horários disponíveis</span>
        <span className="hidden items-center gap-1.5 md:flex"><span className="size-2 rounded-full bg-strong" />Dia selecionado</span>
      </div>
    </div>
  );
}

function IconSelect({ label, icon, display, value, onChange, options }: { label: string; icon: React.ReactNode; display: React.ReactNode; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="grid min-w-0 gap-2">
      <span className="text-[13px] font-semibold leading-[18px] text-foreground">{label}</span>
      <label className={`relative flex h-12 min-w-0 items-center gap-3 rounded-lg bg-soft px-4 focus-within:ring-2 focus-within:ring-ring md:bg-card md:ring-1 md:ring-border/70 md:shadow-[0_1px_2px_rgb(11_28_48/8%)] [&>svg]:shrink-0`}>
        <span className="text-foreground [&>svg]:size-[18px]">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-[15px] leading-6">{display}</span>
        <ChevronDown className="size-[18px] text-foreground" />
        <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      </label>
    </div>
  );
}

export function PatientBookingPage() {
  const { patient } = usePatientScope();
  return <>
    <PageHeader title="Agendar Consulta" description="Escolha a especialidade, o médico e um horário disponível." />
    {patient ? <PatientBookingForm patientId={patient.id} /> : <EmptyHint>Cadastro do paciente não encontrado.</EmptyHint>}
  </>;
}

function PatientBookingForm({ patientId }: { patientId: string }) {
  const { professionals, activeSpecialties, createAppointment, availableSlots, checkEligibility, patientById } = useClinic();
  const navigate = useNavigate();
  const patient = patientById(patientId);
  const [specialty, setSpecialty] = useState(activeSpecialties[0] ?? "");
  const activeSpecialty = activeSpecialties.includes(specialty) ? specialty : activeSpecialties[0] ?? "";
  const eligible = useMemo(() => professionals.filter((item) => item.active && item.specialty === activeSpecialty), [professionals, activeSpecialty]);
  const [professionalId, setProfessionalId] = useState(eligible[0]?.id ?? "");
  const activeProfessionalId = eligible.some((item) => item.id === professionalId) ? professionalId : eligible[0]?.id ?? "";
  const professional = eligible.find((item) => item.id === activeProfessionalId);
  const [date, setDate] = useState(() => {
    const first = eligible[0]?.id;
    for (let offset = 0; first && offset <= 30; offset += 1) if (availableSlots(first, isoDate(offset)).length) return isoDate(offset);
    return isoDate(1);
  });
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState("");
  const [confirming, setConfirming] = useState(false);
  const slots = activeProfessionalId ? availableSlots(activeProfessionalId, date) : [];
  const activeTime = slots.includes(time) ? time : slots[0] ?? "";
  const eligibility = activeSpecialty ? checkEligibility(patientId, activeSpecialty) : { ok: false, reason: "Selecione a especialidade." };
  const morning = slots.some((slot) => slot < "12:00");
  const afternoon = slots.some((slot) => slot >= "12:00");
  const period = morning && afternoon ? "Manhã & Tarde disponíveis" : morning ? "Manhã disponível" : afternoon ? "Tarde disponível" : "Sem horários livres";

  function review(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eligibility.ok) { toast.error("Agendamento bloqueado", { description: eligibility.reason }); return; }
    if (!activeProfessionalId || !activeTime) { toast.error("Selecione profissional e horário disponível."); return; }
    setConfirming(true);
  }

  function submit() {
    const created = createAppointment({ patientId, professionalId: activeProfessionalId, date, time: activeTime, notes, channel: "Paciente" });
    setConfirming(false);
    if (!created) { toast.error("Esse horário não está mais disponível."); return; }
    toast.success("Consulta agendada", { description: `${brDate(date)} às ${activeTime}.` });
    setNotes("");
    setTime("");
    navigate({ to: "/paciente" });
  }

  const card = `rounded-xl bg-card p-4 ${softShadow} md:rounded-none md:bg-transparent md:p-0 md:shadow-none`;
  const chip = "flex items-center gap-1 rounded-full bg-success-soft/70 px-2.5 py-0.5 text-[11px] font-medium leading-4 text-success-strong";

  return <>
    <form onSubmit={review}>
      <div className={`grid gap-4 md:block md:overflow-hidden md:rounded-xl md:bg-card md:shadow-[0_1px_2px_rgb(11_28_48/8%)]`}>
        <div className="hidden items-center justify-between bg-soft/60 px-6 py-4 md:flex">
          <h2 className="text-[15px] font-semibold uppercase leading-6 tracking-[0.8px] text-soft-foreground">Dados do agendamento</h2>
          <span className={chip}><CalendarCheck className="size-3.5" />Etapa 1 de 2</span>
        </div>
        <div className="contents md:block md:space-y-6 md:p-6">
          <section className={card}>
            <h2 className="eyebrow mb-4 flex items-center gap-1.5 text-soft-foreground md:hidden"><ClipboardPlus className="size-4 text-foreground" />Dados do agendamento</h2>
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <IconSelect label="Especialidade" icon={<HeartPulse />} display={activeSpecialty || "Selecione"} value={activeSpecialty} onChange={setSpecialty} options={activeSpecialties.map((item) => ({ value: item, label: item }))} />
              <IconSelect label="Profissional" icon={<Stethoscope />} display={professional ? <>{professional.name}<span className="hidden md:inline"> ({professional.crm})</span></> : "Nenhum profissional disponível"} value={activeProfessionalId} onChange={setProfessionalId} options={eligible.map((item) => ({ value: item.id, label: `${item.name} (${item.crm})` }))} />
            </div>
            {professional && <div className="mt-4 flex items-center gap-3 rounded-lg bg-soft p-3 md:mt-4 md:gap-4 md:rounded-xl md:p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-avatar text-sm font-bold text-white md:size-12">{professional.initials}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[15px] font-bold leading-5">{professional.name}<BadgeCheck className="size-4 shrink-0 text-success" /></p>
                <p className="truncate text-xs leading-5 text-muted-foreground md:text-[13px]"><span className="md:hidden">{professional.crm} · {professional.specialty}</span><span className="hidden md:inline">Especialista em {professional.specialty} • {professional.crm} • Unidade Jardins</span></p>
              </div>
              {eligibility.ok && <span className={`hidden shrink-0 items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-xs font-medium md:flex ${softShadow}`}><CircleCheck className="size-4 text-success" />Credenciamento pleno</span>}
            </div>}
          </section>

          <section className={card}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="eyebrow flex items-center gap-1.5 text-soft-foreground md:hidden"><CalendarDays className="size-4 text-foreground" />Data e horário</h2>
              <h2 className="hidden text-[17px] font-bold leading-6 md:block">Data e horário</h2>
              <span className={`${chip} md:hidden`}>Passo 2 de 3</span>
              <span className="hidden text-xs text-muted-foreground md:block">Fuso horário: Horário de Brasília (GMT-3)</span>
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] md:items-start md:gap-6">
              <BookingCalendar value={date} onChange={(next) => { setDate(next); setTime(""); }} slotsFor={(day) => (activeProfessionalId ? availableSlots(activeProfessionalId, day).length : 0)} />
              <div className="md:rounded-xl md:bg-soft/70 md:p-4">
                <div className="flex items-center justify-between gap-2">
                  <b className="text-[15px] font-bold leading-6">{brDate(date)}</b>
                  <span className="rounded-full bg-accent/80 px-2.5 py-0.5 text-[11px] font-medium leading-4 text-soft-foreground md:bg-success-soft/70 md:text-success-strong">{slots.length} horário(s) livre(s)</span>
                </div>
                <p className="mb-3 hidden text-xs text-muted-foreground md:block">{period}</p>
                {slots.length ? <div className="mt-2 grid grid-cols-4 gap-2 md:mt-0">{slots.map((slot) => (
                  <button type="button" key={slot} onClick={() => setTime(slot)} className={`h-9 rounded-lg text-[15px] font-semibold leading-5 transition-colors md:font-medium ${slot === activeTime ? "bg-strong text-strong-foreground md:ring-2 md:ring-strong md:ring-offset-2 md:ring-offset-soft" : `bg-soft hover:bg-accent md:bg-card md:shadow-[0_1px_2px_rgb(11_28_48/8%)]`}`}>{slot}</button>
                ))}</div> : <div className="mt-2"><EmptyHint>Nenhum horário disponível nessa data.</EmptyHint></div>}
                <p className="mt-4 hidden items-center gap-1.5 text-xs text-muted-foreground md:flex"><Clock3 className="size-3.5" />Duração estimada: 30 minutos por atendimento</p>
              </div>
            </div>
          </section>

          <div className={`${eligibility.ok ? "hidden md:flex" : "flex"} items-center gap-4 rounded-xl p-4 ${eligibility.ok ? "bg-success-soft/60" : "bg-destructive-soft"}`}>
            <span className={`grid size-10 shrink-0 place-items-center rounded-full text-white ${eligibility.ok ? "bg-success" : "bg-destructive"}`}>{eligibility.ok ? <ShieldCheck className="size-5" /> : <CircleAlert className="size-5" />}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-5">{eligibility.ok ? "Elegibilidade confirmada" : "Elegibilidade não confirmada"}</p>
              <p className="text-sm leading-5 text-soft-foreground">{eligibility.reason}</p>
            </div>
            {eligibility.ok && <CircleCheck className="hidden size-5 shrink-0 text-success md:block" />}
          </div>

          <section className={card}>
            <label className="grid gap-2">
              <span className="flex items-center justify-between gap-2"><span className="text-[13px] font-semibold leading-[18px]"><span className="md:hidden">Observações (opcional)</span><span className="hidden md:inline">Observações</span></span><span className="text-xs text-muted-foreground"><span className="md:hidden">Máx. 250 caracteres</span><span className="hidden md:inline">Opcional</span></span></span>
              <textarea value={notes} maxLength={250} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Ex: Primeira consulta de rotina, sintomas recentes ou pedidos de exames prévios..." className="min-h-[74px] w-full resize-none rounded-lg bg-soft px-4 py-3 text-sm outline-none placeholder:text-subtle-foreground focus:ring-2 focus:ring-ring md:min-h-24" />
            </label>
          </section>
        </div>
        <div className="hidden items-center justify-between gap-4 border-t border-border/70 px-6 py-5 md:flex">
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><ScrollText className="size-4 text-foreground" />Cancelamento e remarcação gratuitos até 24h antes do horário.</p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: "/paciente" })} className={`h-10 rounded-lg bg-card px-6 text-sm font-semibold ${softShadow}`}>Voltar</Button>
            <Button type="submit" disabled={!slots.length || !eligibility.ok} className="h-10 rounded-lg bg-strong px-6 text-sm font-semibold hover:bg-strong/90">Continuar para confirmação<ArrowRight /></Button>
          </div>
        </div>
      </div>
      <div className="mt-4 md:hidden">
        <Button type="submit" disabled={!slots.length || !eligibility.ok} className="h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-[0_2px_6px_rgb(11_28_48/18%)]">Continuar para confirmação<ArrowRight /></Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5 text-success" />Cancelamento e remarcação gratuitos até 24h antes</p>
      </div>
    </form>

    <div className="mt-8 hidden gap-4 md:grid md:grid-cols-3">
      {[
        { icon: <IdCard />, title: "Documentação Necessária", text: "Leve documento original com foto e sua carteirinha física ou digital no app." },
        { icon: <MapPin />, title: "Local do Atendimento", text: "Unidade Jardins — Sala 402, 4º Andar. Estacionamento no local." },
        { icon: <BellRing />, title: "Lembretes Automáticos", text: "Enviaremos confirmações por SMS e WhatsApp antes da consulta." },
      ].map((item) => <article key={item.title} className="surface flex gap-4 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-soft text-foreground [&>svg]:size-[18px]">{item.icon}</span><div><p className="text-sm font-bold leading-5">{item.title}</p><p className="mt-1 text-xs leading-4 text-muted-foreground">{item.text}</p></div></article>)}
    </div>

    <Modal open={confirming} title="Confirmar agendamento" description="Revise os dados antes de concluir." onClose={() => setConfirming(false)}>
      <dl className="grid gap-2 rounded-xl bg-soft p-4 text-sm">
        {[["Especialidade", activeSpecialty], ["Profissional", professional?.name ?? "—"], ["Data", brDate(date)], ["Horário", activeTime], ["Convênio", patient?.insurance ?? "—"], ["Observações", notes || "—"]].map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
      </dl>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setConfirming(false)} className="h-10 rounded-lg bg-soft px-5 font-semibold">Voltar</Button>
        <Button type="button" onClick={submit} className="h-10 rounded-lg bg-strong px-5 font-semibold hover:bg-strong/90"><CheckCircle2 />Confirmar agendamento</Button>
      </div>
    </Modal>
  </>;
}

/* ---------------------------------------------------------------- Notificações */

function noticeMeta(title: string) {
  const t = title.toLowerCase();
  if (t.includes("lembrete")) return { tag: "Requer Ação", tone: "text-foreground", icon: <AlarmClock /> };
  if (t.includes("fila") || t.includes("oferecid")) return { tag: "Fila Prioritária", tone: "text-info", icon: <Clock3 /> };
  if (t.includes("cancel")) return { tag: "Cancelamento", tone: "text-destructive", icon: <CalendarX /> };
  if (t.includes("remarc")) return { tag: "Remarcação", tone: "text-info", icon: <CalendarClock /> };
  if (t.includes("confirm") || t.includes("agendad") || t.includes("consulta")) return { tag: "Agendamento Confirmado", tone: "text-success", icon: <CalendarCheck /> };
  return { tag: "", tone: "", icon: <CalendarDays /> };
}

function HelpBanner({ text, mobileText }: { text: string; mobileText: string }) {
  const { settings } = useClinic();
  return (
    <div className="mt-8 flex items-center gap-3 rounded-xl bg-success-soft/60 p-4 md:gap-4 md:p-6">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success text-white md:size-12 md:rounded-xl md:bg-success-soft md:text-foreground"><Headset className="size-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold leading-5 md:text-[17px] md:leading-6">Precisa de ajuda?</p>
        <p className="text-xs leading-4 text-soft-foreground md:text-[15px] md:leading-6"><span className="md:hidden">{mobileText}</span><span className="hidden md:inline">{text}</span></p>
      </div>
      <Button type="button" onClick={() => toast.info("Central de atendimento", { description: `Ligue ${settings.phone} ou escreva para ${settings.email}.` })} className="h-8 shrink-0 rounded-lg bg-card px-3 text-sm font-semibold text-foreground hover:bg-card/80 md:h-10 md:bg-avatar md:px-6 md:text-white md:hover:bg-avatar/90"><CircleHelp className="hidden md:block" />Ajuda</Button>
    </div>
  );
}

export function PatientNotificationsPage() {
  const { clinic } = usePatientScope();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const items = clinic.notificationsFor("patient");
  const unread = items.filter((item) => !item.read).length;
  const list = onlyUnread ? items.filter((item) => !item.read) : items;
  const markAll = () => { clinic.markAllNotificationsRead("patient"); toast.success("Notificações marcadas como lidas"); };
  const unreadLabel = unread ? `${unread} ${unread === 1 ? "nova atualização" : "novas atualizações"}` : "Nenhuma atualização nova";
  const filterButton = <Button type="button" variant="ghost" size="icon" aria-pressed={onlyUnread} title={onlyUnread ? "Mostrar todas" : "Mostrar só não lidas"} onClick={() => setOnlyUnread((v) => !v)} className={`size-8 rounded-lg ${onlyUnread ? "bg-accent" : ""}`}><ListFilter /></Button>;

  return <>
    <PageHeader title="Notificações" description="Veja confirmações, lembretes e informações sobre seus atendimentos." aside={
      <div className="hidden items-center gap-2 md:flex">
        <span className="flex items-center gap-2 rounded-full bg-success-soft/70 px-4 py-1.5 text-xs font-medium text-success-strong"><span className="size-2 rounded-full bg-success" />{unreadLabel}</span>
        <Button type="button" variant="ghost" onClick={markAll} disabled={!unread} className={`h-9 rounded-lg bg-soft px-4 text-sm font-semibold ${softShadow}`}><CheckCheck />Marcar como lidas</Button>
      </div>
    } />

    <div className="mb-6 flex items-center justify-between gap-2 rounded-xl bg-soft px-4 py-3 md:hidden">
      <span className="flex items-center gap-2 text-sm font-semibold"><span className={`size-2 rounded-full ${unread ? "bg-success" : "bg-subtle-foreground"}`} />{unreadLabel}</span>
      <button type="button" onClick={markAll} disabled={!unread} className="text-sm font-semibold disabled:opacity-50">Marcar como lidas</button>
    </div>

    <section className="md:surface md:overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-1 pb-2 md:bg-soft/60 md:px-6 md:py-3">
        <h2 className="eyebrow text-soft-foreground md:text-[15px] md:leading-6 md:tracking-[0.8px] md:text-foreground">Recentes ({list.length})</h2>
        <div className="flex items-center gap-3"><span className="hidden text-xs text-muted-foreground md:inline">{onlyUnread ? "Exibindo apenas não lidas" : "Exibindo mensagens dos últimos 30 dias"}</span>{filterButton}</div>
      </div>
      {list.length ? <div className="grid gap-3 md:gap-4 md:p-6">{list.map((item) => {
        const meta = noticeMeta(item.title);
        return (
          <article key={item.id} onClick={() => { if (!item.read) clinic.markNotificationRead(item.id); }} className={`relative flex cursor-default gap-4 rounded-xl bg-card p-4 ${softShadow} md:items-center md:px-4 md:py-5`}>
            <span className="grid size-10 shrink-0 place-items-center self-start rounded-lg bg-accent/70 text-foreground md:size-12 [&>svg]:size-[18px] md:[&>svg]:size-5"><Bell /></span>
            <div className="min-w-0 flex-1 pr-4 md:pr-0">
              <p className="flex items-center gap-2 text-[15px] font-bold leading-6 md:text-[17px]">{item.title}{!item.read && <span className="hidden size-2 rounded-full bg-success md:inline-block" />}</p>
              <p className="mt-0.5 text-sm leading-5 text-soft-foreground md:mt-1 md:text-[15px] md:leading-6">{item.text}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="md:hidden"><Clock3 className="size-3.5" /></span>
                <span className="hidden md:inline [&>svg]:size-3.5">{meta.icon}</span>
                {formatDate(item.createdAt)}
                {meta.tag && <span className={`hidden items-center gap-2 font-medium md:flex ${meta.tone}`}><Dot />{meta.tag}</span>}
              </p>
            </div>
            {!item.read && <span className="absolute right-4 top-5 size-2 rounded-full bg-success md:hidden" />}
            <button type="button" onClick={(event) => { event.stopPropagation(); clinic.markNotificationRead(item.id); }} disabled={item.read} className="hidden shrink-0 items-center gap-3 text-xs text-soft-foreground disabled:text-subtle-foreground md:flex">{item.read ? "Lida" : "Marcar lida"}<ChevronRight className="size-4 text-foreground" /></button>
          </article>
        );
      })}</div> : <div className="md:p-6"><EmptyHint>{onlyUnread ? "Nenhuma notificação não lida." : "Nenhuma notificação por aqui."}</EmptyHint></div>}
    </section>

    <HelpBanner mobileText="Fale com nossa central de atendimento" text="Fale com nossa central de atendimento ou envie uma solicitação ao suporte." />
  </>;
}

/* ---------------------------------------------------------------- Meu perfil */

function ProfileInput({ label, icon, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ReactNode }) {
  return (
    <label className={`grid min-w-0 gap-2 text-[13px] font-semibold leading-[18px] text-foreground ${className}`}>{label}
      <span className="relative block">
        <input {...props} className="h-11 w-full min-w-0 rounded-lg bg-soft px-3.5 pr-10 text-[15px] font-normal text-foreground outline-none focus:ring-2 focus:ring-ring md:pr-3.5" />
        {icon && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground md:hidden [&>svg]:size-[18px]">{icon}</span>}
      </span>
    </label>
  );
}

export function PatientProfilePage() {
  const { clinic, patient } = usePatientScope();
  if (!patient) return <EmptyHint>Cadastro não encontrado.</EmptyHint>;
  const active = patient.status === "Ativo";
  const code = patient.cpf.replace(/\D/g, "").slice(-5) || patient.id;
  return <div className="mx-auto max-w-[1024px]">
    <PageHeader title="Meu perfil" description="Visualize e atualize seus dados pessoais e o convênio." />
    <form key={patient.id} className="surface p-4 md:p-8" onSubmit={(event) => {
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
      <div className="flex items-center gap-4 md:gap-6">
        <span className="relative grid size-16 shrink-0 place-items-center rounded-full bg-avatar text-xl font-bold text-white">
          {patient.initials}
          <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full border-2 border-card bg-success text-white md:hidden"><Pencil className="size-3" /></span>
          <span className={`absolute bottom-0 right-0 hidden size-3.5 rounded-full border-2 border-card md:block ${active ? "bg-success" : "bg-subtle-foreground"}`} />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[17px] font-bold leading-6">{patient.name}<span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ${active ? "bg-success-soft text-success-strong" : "bg-muted text-muted-foreground"}`}><span className={`size-1.5 rounded-full md:hidden ${active ? "bg-success" : "bg-subtle-foreground"}`} />Paciente {active ? "Ativo" : "Inativo"}</span></p>
          <p className="text-xs leading-5 text-muted-foreground">Titular • ID: #{code}</p>
        </div>
        <p className="ml-auto hidden text-[11px] font-bold uppercase leading-4 tracking-[1.1px] text-soft-foreground md:block">Informações pessoais</p>
      </div>
      <div className="mt-6 flex items-center justify-between md:hidden"><p className="eyebrow text-soft-foreground">Informações pessoais</p><Lock className="size-[18px] text-foreground" /></div>

      <div className="mt-4 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-x-6 md:gap-y-3">
        <ProfileInput label="Nome completo" name="name" defaultValue={patient.name} required icon={<User />} />
        <ProfileInput label="CPF" name="cpf" defaultValue={patient.cpf} required icon={<IdCard />} />
        <ProfileInput label="Telefone" name="phone" defaultValue={patient.phone} required icon={<Phone />} />
        <ProfileInput label="E-mail" name="email" type="email" defaultValue={patient.email} required icon={<Mail />} />
        <ProfileInput label="Data de nascimento" name="birthDate" type="date" defaultValue={patient.birthDate} required />
        <label className="grid min-w-0 gap-2 text-[13px] font-semibold leading-[18px] text-foreground">Convênio
          <span className="relative block">
            <select name="insurance" defaultValue={patient.insurance} className="h-11 w-full min-w-0 appearance-none rounded-lg bg-soft px-3.5 pr-10 text-[15px] font-normal outline-none focus:ring-2 focus:ring-ring">{clinic.insurances.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 text-foreground" />
          </span>
        </label>
      </div>
      <Button type="submit" className="mt-5 h-12 w-full rounded-lg bg-primary text-[15px] font-semibold md:mt-9 md:h-10 md:w-auto md:px-6"><CircleCheck className="md:hidden" /><Check className="hidden md:block" />Salvar alterações</Button>
    </form>

    <button type="button" onClick={() => toast.info("Alteração de carteirinha", { description: `Fale com a central pelo ${clinic.settings.phone}.` })} className="mt-8 flex w-full items-center gap-3 rounded-xl bg-soft p-4 text-left md:hidden">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-foreground"><CircleHelp className="size-5" /></span>
      <span className="min-w-0 flex-1"><b className="block text-[15px] leading-5">Precisa alterar a carteirinha?</b><span className="text-xs text-muted-foreground">Fale com nossa central de atendimento</span></span>
      <ChevronRight className="size-5 text-foreground" />
    </button>
  </div>;
}
