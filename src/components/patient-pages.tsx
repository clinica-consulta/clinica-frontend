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
