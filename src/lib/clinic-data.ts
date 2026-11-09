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

/** Carteirinha do convênio. Obrigatória para quem não é Particular. */
export type InsuranceCard = { number: string; validUntil: string; plan: string };

export const emptyCard: InsuranceCard = { number: "", validUntil: "", plan: "" };

export type Patient = {
  id: string;
  name: string;
  initials: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  insurance: string;
  card: InsuranceCard;
  status: "Ativo" | "Inativo";
};

/** Particular não tem convênio nem carteirinha. */
export function isPrivateInsurance(insurance: string) {
  return !insurance || insurance === "Particular";
}

/** Lê os campos da carteirinha de um formulário (vazia para Particular). */
export function cardFromForm(data: FormData, insurance: string): InsuranceCard {
  if (isPrivateInsurance(insurance)) return emptyCard;
  return {
    number: String(data.get("cardNumber") ?? "").trim(),
    validUntil: String(data.get("cardValidUntil") ?? ""),
    plan: String(data.get("cardPlan") ?? "").trim(),
  };
}

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
  /** Pagamento simulado; null quando não há cobrança. */
  payment: AppointmentPayment | null;
};

export type PaymentMethod = "Pix" | "Cartão de crédito" | "Cartão de débito";

export type AppointmentPayment = {
  status: "Pendente" | "Pago";
  amount: number;
  method: string;
  code: string;
  paidAt: string | null;
  /** Último lembrete de pagamento enviado ao paciente (no máximo um a cada 24 horas). */
  reminderSentAt: string | null;
  /** "Stripe" quando paga on-line; "Recepção" quando paga no balcão. */
  gateway: string;
  /** Situação no gateway (ex.: "aguardando confirmação" para Pix ou boleto ainda não compensado). */
  gatewayStatus: string;
};

export function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Até quantos pacientes podem esperar o mesmo horário. */
export const WAITLIST_LIMIT = 5;

/**
 * Lista de espera de um horário já marcado (médico + data + hora).
 * "Oferecido": o horário vagou e está reservado para este paciente até `offerExpiresAt`.
 */
export type WaitlistEntry = {
  id: string;
  patientId: string;
  specialty: string;
  professionalId: string;
  date: string;
  time: string;
  /** Consulta que o paciente marcou como alternativa (passa para o horário desejado se ele aceitar). */
  alternativeId: string | null;
  /** 1 = o próximo a receber a vaga. */
  position: number | null;
  offerExpiresAt: string | null;
  createdAt: string;
  priority: "Alta" | "Normal";
  status: "Aguardando" | "Oferecido" | "Convidado";
};

export type AppNotification = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  audience: UserRole[];
  read: boolean;
  /** Consulta ligada ao aviso, quando houver. */
  appointmentId: string | null;
  /** "pagamento": consulta a pagar; "documento": atestado ou receita; "remarcar": o paciente faltou; "fila": o horário da lista de espera vagou. */
  action: "" | "pagamento" | "documento" | "remarcar" | "fila";
  /** Entrada da lista de espera ligada ao aviso (action "fila"). */
  waitlistId: string | null;
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
  appointmentPrice: number;
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

/** Iniciais do nome, ignorando títulos como "Dr." e "Dra." (Dra. Ana Martins -> AM). */
export function initialsOf(name: string) {
  const clean = name.trim().replace(/^dra?\.?\s+/i, "");
  const parts = clean.split(/\s+/).filter((part) => part.length > 2);
  const source = parts.length ? parts : clean.split(/\s+/);
  // Nome único (ex.: "Marco") vira "MA", não "MM".
  if (source.length === 1) return (source[0] ?? "").slice(0, 2).toUpperCase();
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

/** Nome do dia da semana, ex.: "Quinta-feira". */
export function weekdayName(iso: string) {
  const name = new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Hora atual no formato HH:MM. */
export function nowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/** A data e a hora da consulta já passaram? */
export function hasPassed(item: { date: string; time: string }) {
  const today = isoDate(0);
  return item.date < today || (item.date === today && item.time <= nowTime());
}

/** Minutos depois do horário marcado em que a consulta ainda aceita o registro do resultado. */
export const ATTENDANCE_WINDOW_MINUTES = 60;

/** Intervalo mínimo entre dois lembretes de pagamento da mesma consulta. */
export const PAYMENT_REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000;

/**
 * Momento da consulta, contado a partir do horário marcado (mesma regra da API):
 * - "antes": confirmar, enviar lembrete, remarcar ou cancelar;
 * - "atendimento": do horário até 1 hora depois, registrar se foi realizada ou se o paciente faltou;
 * - "encerrada": resultado registrado ou passou 1 hora; nada mais muda, só a cobrança do particular.
 */
export type AppointmentPhase = "antes" | "atendimento" | "encerrada";

export function appointmentPhase(item: { date: string; time: string; status: AppointmentStatus }, now = Date.now()): AppointmentPhase {
  if (!openStatuses.includes(item.status)) return "encerrada";
  const start = new Date(`${item.date}T${item.time}:00`).getTime();
  if (now < start) return "antes";
  if (now < start + ATTENDANCE_WINDOW_MINUTES * 60_000) return "atendimento";
  return "encerrada";
}

/** Horário (HH:MM) em que termina o registro do resultado da consulta. */
export function attendanceDeadline(item: { date: string; time: string }) {
  const end = new Date(new Date(`${item.date}T${item.time}:00`).getTime() + ATTENDANCE_WINDOW_MINUTES * 60_000);
  return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
}

/** Quando o próximo lembrete de pagamento pode ser enviado (null = já pode). */
export function nextPaymentReminderAt(payment: AppointmentPayment | null, now = Date.now()) {
  if (!payment?.reminderSentAt) return null;
  const next = new Date(payment.reminderSentAt).getTime() + PAYMENT_REMINDER_INTERVAL_MS;
  return next > now ? new Date(next) : null;
}

export function relativeDay(iso: string) {
  if (iso === isoDate(0)) return "Hoje";
  if (iso === isoDate(1)) return "Amanhã";
  return formatDate(iso);
}

/** Valores usados até as configurações chegarem da API. */
export const defaultSettings: ClinicSettings = {
  name: "",
  cnpj: "",
  phone: "",
  email: "",
  reminderHours: 24,
  autoConfirm: false,
  appointmentPrice: 150,
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
