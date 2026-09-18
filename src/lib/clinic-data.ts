import type { UserRole } from "@/lib/role-data";

export type AppointmentStatus =
  | "Pendente"
  | "Confirmada"
  | "Aguardando"
  | "Em atendimento"
  | "Concluída"
  | "Cancelada"
  | "Falta";

export type PreForm = { reason: string; medications: string; allergies: string };

export type Patient = {
  id: string;
  name: string;
  initials: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
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

export type Appointment = {
  id: string;
  date: string;
  time: string;
  patientId: string;
  professionalId: string;
  specialty: string;
  status: AppointmentStatus;
  notes: string;
  preForm: PreForm | null;
  reminderSentAt: string | null;
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

export const specialties = ["Cardiologia", "Clínica geral", "Dermatologia"];

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

const fullWeek: Availability = {
  1: { active: true, start: "08:00", end: "17:00" },
  2: { active: true, start: "08:00", end: "17:00" },
  3: { active: true, start: "13:00", end: "18:00" },
  4: { active: true, start: "08:00", end: "17:00" },
  5: { active: true, start: "08:00", end: "16:00" },
  6: { active: false, start: "08:00", end: "12:00" },
};

export const seedPatients: Patient[] = [
  { id: "p1", name: "Marina Costa", initials: "MC", cpf: "123.456.789-00", phone: "(11) 99842-1034", email: "paciente@demo.com", birthDate: "1992-04-12", status: "Ativo" },
  { id: "p2", name: "Roberto Lima", initials: "RL", cpf: "234.567.890-11", phone: "(11) 97118-5220", email: "roberto@email.com", birthDate: "1985-09-03", status: "Ativo" },
  { id: "p3", name: "Camila Duarte", initials: "CD", cpf: "345.678.901-22", phone: "(11) 98720-4102", email: "camila@email.com", birthDate: "1990-01-27", status: "Ativo" },
  { id: "p4", name: "João Pedro Reis", initials: "JR", cpf: "456.789.012-33", phone: "(11) 96544-9091", email: "joao@email.com", birthDate: "1978-06-15", status: "Ativo" },
  { id: "p5", name: "Beatriz Souza", initials: "BS", cpf: "567.890.123-44", phone: "(11) 99940-2377", email: "beatriz@email.com", birthDate: "1999-11-08", status: "Inativo" },
  { id: "p6", name: "Sofia Almeida", initials: "SA", cpf: "678.901.234-55", phone: "(11) 98111-7742", email: "sofia@email.com", birthDate: "1996-02-19", status: "Ativo" },
  { id: "p7", name: "Carlos Mendes", initials: "CM", cpf: "789.012.345-66", phone: "(11) 97402-3388", email: "carlos@email.com", birthDate: "1971-08-30", status: "Ativo" },
];

export const seedProfessionals: Professional[] = [
  { id: "pro1", name: "Dra. Ana Martins", initials: "AM", specialty: "Cardiologia", crm: "CRM 18452", phone: "(11) 99210-1845", email: "profissional@demo.com", color: "bg-primary", active: true, availability: structuredClone(fullWeek) },
  { id: "pro2", name: "Dr. Paulo Nunes", initials: "PN", specialty: "Clínica geral", crm: "CRM 23018", phone: "(11) 99820-2301", email: "paulo@clinicavita.com.br", color: "bg-info", active: true, availability: structuredClone(fullWeek) },
  { id: "pro3", name: "Dra. Lívia Prado", initials: "LP", specialty: "Dermatologia", crm: "CRM 20114", phone: "(11) 99733-2011", email: "livia@clinicavita.com.br", color: "bg-warning", active: true, availability: structuredClone(fullWeek) },
];

export const seedAppointments: Appointment[] = [
  { id: "1048", date: isoDate(0), time: "08:00", patientId: "p1", professionalId: "pro1", specialty: "Cardiologia", status: "Confirmada", notes: "Retorno de exames", preForm: null, reminderSentAt: null },
  { id: "1049", date: isoDate(0), time: "09:00", patientId: "p2", professionalId: "pro2", specialty: "Clínica geral", status: "Em atendimento", notes: "", preForm: { reason: "Dor de cabeça frequente", medications: "Losartana", allergies: "Nenhuma" }, reminderSentAt: isoDate(-1) },
  { id: "1050", date: isoDate(0), time: "10:30", patientId: "p3", professionalId: "pro1", specialty: "Cardiologia", status: "Pendente", notes: "", preForm: null, reminderSentAt: null },
  { id: "1051", date: isoDate(0), time: "13:00", patientId: "p4", professionalId: "pro3", specialty: "Dermatologia", status: "Confirmada", notes: "", preForm: null, reminderSentAt: isoDate(-1) },
  { id: "1052", date: isoDate(1), time: "14:30", patientId: "p5", professionalId: "pro2", specialty: "Clínica geral", status: "Pendente", notes: "", preForm: null, reminderSentAt: null },
  { id: "1053", date: isoDate(2), time: "09:30", patientId: "p1", professionalId: "pro3", specialty: "Dermatologia", status: "Confirmada", notes: "Avaliação de pele", preForm: null, reminderSentAt: null },
  { id: "1040", date: isoDate(-6), time: "08:30", patientId: "p1", professionalId: "pro1", specialty: "Cardiologia", status: "Concluída", notes: "", preForm: null, reminderSentAt: isoDate(-7) },
  { id: "1041", date: isoDate(-6), time: "10:00", patientId: "p3", professionalId: "pro2", specialty: "Clínica geral", status: "Falta", notes: "", preForm: null, reminderSentAt: isoDate(-7) },
  { id: "1042", date: isoDate(-5), time: "11:00", patientId: "p4", professionalId: "pro1", specialty: "Cardiologia", status: "Concluída", notes: "", preForm: null, reminderSentAt: isoDate(-6) },
  { id: "1043", date: isoDate(-4), time: "15:00", patientId: "p2", professionalId: "pro3", specialty: "Dermatologia", status: "Concluída", notes: "", preForm: null, reminderSentAt: isoDate(-5) },
  { id: "1044", date: isoDate(-3), time: "16:00", patientId: "p5", professionalId: "pro2", specialty: "Clínica geral", status: "Cancelada", notes: "", preForm: null, reminderSentAt: null },
  { id: "1045", date: isoDate(-2), time: "08:00", patientId: "p6", professionalId: "pro1", specialty: "Cardiologia", status: "Concluída", notes: "", preForm: null, reminderSentAt: isoDate(-3) },
];

export const seedWaitlist: WaitlistEntry[] = [
  { id: "w1", patientId: "p6", specialty: "Cardiologia", preference: "Manhã", createdAt: isoDate(-2), priority: "Alta", status: "Aguardando" },
  { id: "w2", patientId: "p7", specialty: "Clínica geral", preference: "Qualquer horário", createdAt: isoDate(-1), priority: "Normal", status: "Aguardando" },
  { id: "w3", patientId: "p5", specialty: "Dermatologia", preference: "Tarde", createdAt: isoDate(0), priority: "Normal", status: "Aguardando" },
];

export const seedNotifications: AppNotification[] = [
  { id: "n1", title: "Consulta confirmada", text: "Cardiologia com Dra. Ana Martins às 08:00.", createdAt: isoDate(0), audience: ["patient"], read: false },
  { id: "n2", title: "Formulário de pré-atendimento", text: "Preencha o formulário antes de chegar à clínica.", createdAt: isoDate(0), audience: ["patient"], read: false },
  { id: "n3", title: "Paciente aguardando", text: "Roberto Lima realizou o check-in na recepção.", createdAt: isoDate(0), audience: ["professional", "receptionist"], read: false },
  { id: "n4", title: "Confirmações pendentes", text: "Existem consultas sem confirmação nas próximas 24 horas.", createdAt: isoDate(0), audience: ["receptionist", "admin"], read: false },
  { id: "n5", title: "Ocupação da agenda", text: "Cardiologia está próxima do limite de horários.", createdAt: isoDate(-1), audience: ["admin"], read: true },
];

export const seedStaff: StaffUser[] = [
  { id: "u1", name: "Rafaela Costa", email: "recepcao@demo.com", role: "receptionist", status: "Ativo" },
  { id: "u2", name: "Marcelo Andrade", email: "admin@demo.com", role: "admin", status: "Ativo" },
  { id: "u3", name: "Tiago Barros", email: "tiago@clinicavita.com.br", role: "receptionist", status: "Pendente" },
];

export const seedSettings: ClinicSettings = {
  name: "Clínica Vita",
  cnpj: "12.345.678/0001-90",
  phone: "(11) 3000-2026",
  email: "contato@clinicavita.com.br",
  reminderHours: 24,
  autoConfirm: true,
};

function minutesOf(value: string) {
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
