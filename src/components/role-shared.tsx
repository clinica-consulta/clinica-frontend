/* eslint-disable react-refresh/only-export-components */
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


export function usePatientScope() {
  const clinic = useClinic();
  const patient = clinic.currentPatient ?? clinic.patients[0] ?? null;
  const mine = clinic.appointments.filter((item) => item.patientId === patient?.id);
  return { clinic, patient, mine };
}

export function useProfessionalScope() {
  const clinic = useClinic();
  const professional = clinic.currentProfessional ?? clinic.professionals[0] ?? null;
  const mine = clinic.appointments.filter((item) => item.professionalId === professional?.id);
  return { clinic, professional, mine };
}

export function AppointmentRow({ item, right }: { item: Appointment; right?: React.ReactNode }) {
  const { patientById, professionalById } = useClinic();
  return <div className="grid gap-2.5 py-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
    <b className="text-primary">{item.time}</b>
    <div className="min-w-0"><p className="font-semibold">{patientById(item.patientId)?.name}</p><p className="text-xs text-muted-foreground">{professionalById(item.professionalId)?.name} · {item.specialty} · {relativeDay(item.date)}</p></div>
    <div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.status} />{right}</div>
  </div>;
}

export function Notice({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-md border border-border p-3"><span className="metric-icon metric-info">{icon}</span><div className="min-w-0"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p>{action && <div className="mt-2">{action}</div>}</div></article>;
}

export function NotificationList({ role }: { role: "patient" | "professional" | "admin" | "receptionist" }) {
  const { notificationsFor } = useClinic();
  const items = notificationsFor(role);
  return <Section title={`Recentes (${items.length})`}>
    {items.length ? <div className="space-y-3">{items.map((item) => <article key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 rounded-md border border-border p-3">
      <span className="metric-icon metric-info size-10"><Bell /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.text}</p><p className="mt-1 text-[11px] text-muted-foreground">{formatDate(item.createdAt)}</p></div>
    </article>)}</div> : <EmptyHint>Nenhuma notificação por aqui.</EmptyHint>}
  </Section>;
}


export function Dot() { return <span className="size-1 rounded-full bg-input" />; }
