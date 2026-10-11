import type { UserRole } from "@/lib/role-data";

export type AppointmentStatus =
  | "Agendada"
  | "Confirmada"
  | "Remarcada"
  | "Realizada"
  | "Cancelada"
  | "Não compareceu";

export const appointmentStatuses: AppointmentStatus[] = [
  "Agendada",
  "Confirmada",
  "Remarcada",
  "Realizada",
  "Cancelada",
  "Não compareceu",
];

export const openStatuses: AppointmentStatus[] = ["Agendada", "Confirmada", "Remarcada"];

export type Patient = {
  id: string;
  name: string;
  initials: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  insurance: string;
  status: "Ativo" | "Inativo";
};

export type DayAvailability = { active: boolean; start: string; end: string };
export type Availability = Record<number, DayAvailability>;

export type Professional = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  crm: string;
  phone: string;
  email: string;
  color: string;
  active: boolean;
  availability: Availability;
};

export type Specialty = { id: string; name: string; active: boolean };

/** Convênio: lista de especialidades cobertas. Lista vazia = cobre todas. */
export type InsurancePlan = { id: string; name: string; covered: string[]; active: boolean };

/** Bloqueio de horário ou período na agenda de um profissional. */
export type ScheduleBlock = {
  id: string;
  professionalId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason: string;
};

export type AppointmentLog = { at: string; text: string };

export type Appointment = {
  id: string;
  /** Código legível exibido como #1048. */
  code: string;
  date: string;
  time: string;
  patientId: string;
  professionalId: string;
  specialty: string;
  status: AppointmentStatus;
  notes: string;
  channel: "Paciente" | "Recepção";
  reminderSentAt: string | null;
  confirmationReply: "Confirmou" | "Cancelou" | "Sem resposta";
  history: AppointmentLog[];
};

export type WaitlistEntry = {
  id: string;
  patientId: string;
  specialty: string;
  preference: string;
  createdAt: string;
  priority: "Alta" | "Normal";
  status: "Aguardando" | "Convidado";
};

export type AppNotification = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  audience: UserRole[];
  read: boolean;
};

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Ativo" | "Inativo" | "Pendente";
};

export type ClinicSettings = {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  reminderHours: number;
  autoConfirm: boolean;
};

export const weekdays = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 2);
  const source = parts.length ? parts : name.trim().split(/\s+/);
  return `${source[0]?.[0] ?? ""}${source[source.length - 1]?.[0] ?? ""}`.toUpperCase();
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function formatLongDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

export function relativeDay(iso: string) {
  if (iso === isoDate(0)) return "Hoje";
  if (iso === isoDate(1)) return "Amanhã";
  return formatDate(iso);
}

/** Valores usados até as configurações chegarem da API. */
export const defaultSettings: ClinicSettings = {
  name: "Clínica Vita",
  cnpj: "",
  phone: "",
  email: "",
  reminderHours: 24,
  autoConfirm: false,
};

export function minutesOf(value: string) {
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function slotRange(start: string, end: string) {
  const slots: string[] = [];
  const limit = minutesOf(end);
  for (let current = minutesOf(start); current < limit; current += 30) {
    slots.push(`${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`);
  }
  return slots;
}
