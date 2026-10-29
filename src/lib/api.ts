import type {
  AppNotification,
  Appointment,
  AppointmentPayment,
  ClinicSettings,
  InsurancePlan,
  Patient,
  Professional,
  ScheduleBlock,
  Specialty,
  StaffUser,
  WaitlistEntry,
} from "@/lib/clinic-data";
import type { UserRole } from "@/lib/role-data";

/** Endereço da API (clinica-backend). Configure em .env com VITE_API_URL. */
export const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:3000/api";

const TOKEN_KEY = "gestao-consultas-token";

export const tokenStore = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null) {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* armazenamento indisponível */
    }
  },
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function api<T>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<T> {
  const token = tokenStore.get();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : null,
    });
  } catch {
    throw new ApiError(`Não foi possível falar com a API em ${API_URL}. Ela está rodando?`, 0);
  }
  const data = (await response.json().catch(() => ({}))) as { mensagem?: string; detalhes?: string[] };
  if (!response.ok) {
    throw new ApiError(data.detalhes?.join(" ") || data.mensagem || `Erro ${response.status}`, response.status);
  }
  return data as T;
}

/* ---------- Conversão entre o formato da API (português) e o do front ---------- */

type ApiRole = "paciente" | "recepcionista" | "profissional" | "administrador";

const roleToApi: Record<UserRole, ApiRole> = {
  patient: "paciente",
  receptionist: "recepcionista",
  professional: "profissional",
  admin: "administrador",
};
const roleFromApi = Object.fromEntries(Object.entries(roleToApi).map(([front, back]) => [back, front])) as Record<ApiRole, UserRole>;

export const toApiRole = (role: UserRole) => roleToApi[role];
export const fromApiRole = (role: string) => roleFromApi[role as ApiRole];

type FieldMap = Record<string, string>;

/** Renomeia as chaves de um objeto parcial (só as que existem no mapa). */
function rename(source: Record<string, unknown>, map: FieldMap) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key in map && value !== undefined) result[map[key]!] = value;
  }
  return result;
}

const invert = (map: FieldMap): FieldMap => Object.fromEntries(Object.entries(map).map(([a, b]) => [b, a]));

const patientFields: FieldMap = { name: "nome", cpf: "cpf", phone: "telefone", email: "email", birthDate: "dataNascimento", insurance: "convenio", status: "status" };
const professionalFields: FieldMap = { name: "nome", specialty: "especialidade", crm: "crm", phone: "telefone", email: "email", color: "cor", active: "ativo" };
const settingsFields: FieldMap = { name: "nome", cnpj: "cnpj", phone: "telefone", email: "email", reminderHours: "antecedenciaLembreteHoras", autoConfirm: "confirmacaoAutomatica", appointmentPrice: "valorConsulta" };
const staffFields: FieldMap = { name: "nome", email: "email", status: "status" };
const blockFields: FieldMap = { professionalId: "profissional", startDate: "dataInicio", endDate: "dataFim", startTime: "horaInicio", endTime: "horaFim", reason: "motivo" };
const waitlistFields: FieldMap = { patientId: "paciente", specialty: "especialidade", preference: "preferencia", priority: "prioridade" };

export const toApi = {
  patient: (input: Partial<Patient>) => rename(input, patientFields),
  professional: (input: Partial<Professional>) => rename(input, professionalFields),
  settings: (input: Partial<ClinicSettings>) => rename(input, settingsFields),
  staff: (input: Partial<StaffUser>) => ({ ...rename(input, staffFields), ...(input.role && { tipo: toApiRole(input.role) }) }),
  block: (input: Omit<ScheduleBlock, "id">) => rename(input, blockFields),
  waitlist: (input: Partial<WaitlistEntry>) => rename(input, waitlistFields),
};

/* Formatos devolvidos pela API */
type DocField =
  | "nome" | "iniciais" | "email" | "tipo" | "status" | "ativo" | "disponibilidade" | "coberturas"
  | "codigo" | "data" | "hora" | "paciente" | "profissional" | "especialidade" | "observacoes" | "canal"
  | "lembreteEnviadoEm" | "respostaConfirmacao" | "historico" | "entradaEm" | "titulo" | "texto" | "createdAt" | "publico" | "lida"
  | "pagamento" | "consulta" | "acao";
export type Doc = { id: string } & Partial<Record<DocField, unknown>>;
type ApiDay = { ativo: boolean; inicio: string; fim: string };

const str = (value: unknown) => (value == null ? "" : String(value));

/** Converte data/hora ISO da API para AAAA-MM-DD no fuso local. */
function localDate(value: unknown) {
  const date = new Date(str(value));
  if (Number.isNaN(date.getTime())) return str(value).slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type ApiPayment = { status?: string | null; valor?: number; metodo?: string; codigo?: string; pagoEm?: string | null };

function paymentFrom(value: unknown): AppointmentPayment | null {
  const payment = value as ApiPayment | undefined;
  if (!payment?.status) return null;
  return {
    status: payment.status === "Pago" ? "Pago" : "Pendente",
    amount: Number(payment.valor ?? 0),
    method: payment.metodo ?? "",
    code: payment.codigo ?? "",
    paidAt: payment.pagoEm ?? null,
  };
}

export const fromApi = {
  patient: (doc: Doc): Patient => ({
    ...(rename(doc, invert(patientFields)) as Omit<Patient, "id" | "initials">),
    id: doc.id,
    initials: str(doc.iniciais),
  }),
  professional: (doc: Doc): Professional => ({
    ...(rename(doc, invert(professionalFields)) as Omit<Professional, "id" | "initials" | "availability">),
    id: doc.id,
    initials: str(doc.iniciais),
    availability: Object.fromEntries(
      Object.entries((doc.disponibilidade ?? {}) as Record<string, ApiDay>).map(([day, value]) => [Number(day), { active: value.ativo, start: value.inicio, end: value.fim }]),
    ),
  }),
  specialty: (doc: Doc): Specialty => ({ id: doc.id, name: str(doc.nome), active: Boolean(doc.ativo) }),
  insurance: (doc: Doc): InsurancePlan => ({ id: doc.id, name: str(doc.nome), covered: (doc.coberturas as string[]) ?? [], active: Boolean(doc.ativo) }),
  block: (doc: Doc): ScheduleBlock => ({ ...(rename(doc, invert(blockFields)) as Omit<ScheduleBlock, "id">), id: doc.id }),
  appointment: (doc: Doc): Appointment => ({
    id: doc.id,
    code: str(doc.codigo),
    date: str(doc.data),
    time: str(doc.hora),
    patientId: str(doc.paciente),
    professionalId: str(doc.profissional),
    specialty: str(doc.especialidade),
    status: doc.status as Appointment["status"],
    notes: str(doc.observacoes),
    channel: doc.canal as Appointment["channel"],
    reminderSentAt: (doc.lembreteEnviadoEm as string | null) ?? null,
    confirmationReply: doc.respostaConfirmacao as Appointment["confirmationReply"],
    history: ((doc.historico as { em: string; texto: string }[]) ?? []).map((item) => ({ at: item.em, text: item.texto })),
    payment: paymentFrom(doc.pagamento),
  }),
  waitlist: (doc: Doc): WaitlistEntry => ({
    ...(rename(doc, invert(waitlistFields)) as Omit<WaitlistEntry, "id" | "createdAt" | "status">),
    id: doc.id,
    patientId: str(doc.paciente),
    createdAt: str(doc.entradaEm),
    status: doc.status as WaitlistEntry["status"],
  }),
  notification: (doc: Doc): AppNotification => ({
    id: doc.id,
    title: str(doc.titulo),
    text: str(doc.texto),
    createdAt: localDate(doc.createdAt),
    audience: ((doc.publico as string[]) ?? []).map(fromApiRole).filter(Boolean),
    read: Boolean(doc.lida),
    appointmentId: doc.consulta ? str(doc.consulta) : null,
    action: doc.acao === "pagamento" || doc.acao === "documento" ? doc.acao : "",
  }),
  staff: (doc: Doc): StaffUser => ({ id: doc.id, name: str(doc.nome), email: str(doc.email), role: fromApiRole(str(doc.tipo)), status: doc.status as StaffUser["status"] }),
  settings: (doc: Doc): ClinicSettings => rename(doc, invert(settingsFields)) as ClinicSettings,
};

/** Usuário logado, como devolvido por /auth/login e /auth/me. */
export type ApiUser = { id: string; nome: string; email: string; telefone?: string; tipo: ApiRole; paciente: string | null; profissional: string | null };
