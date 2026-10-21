import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  defaultSettings,
  initialsOf,
  isoDate,
  minutesOf,
  openStatuses,
  slotRange,
  type AppNotification,
  type Appointment,
  type AppointmentStatus,
  type Availability,
  type ClinicSettings,
  type InsurancePlan,
  type Patient,
  type PaymentMethod,
  type Professional,
  type ScheduleBlock,
  type Specialty,
  type StaffUser,
  type WaitlistEntry,
} from "@/lib/clinic-data";
import { roleProfiles, type RoleProfile, type UserRole } from "@/lib/role-data";
import { api, ApiError, fromApi, fromApiRole, toApi, toApiRole, tokenStore, type ApiUser, type Doc } from "@/lib/api";

type Session = {
  role: UserRole;
  email: string;
  name: string;
  phone: string;
  patientId?: string | undefined;
  professionalId?: string | undefined;
  staffId?: string | undefined;
};

type ClinicState = {
  patients: Patient[];
  professionals: Professional[];
  specialties: Specialty[];
  insurances: InsurancePlan[];
  appointments: Appointment[];
  blocks: ScheduleBlock[];
  waitlist: WaitlistEntry[];
  notifications: AppNotification[];
  staff: StaffUser[];
  settings: ClinicSettings;
  session: Session | null;
};

const emptyState: ClinicState = {
  patients: [],
  professionals: [],
  specialties: [],
  insurances: [],
  appointments: [],
  blocks: [],
  waitlist: [],
  notifications: [],
  staff: [],
  settings: defaultSettings,
  session: null,
};

type NewAppointment = {
  patientId: string;
  professionalId: string;
  date: string;
  time: string;
  notes?: string;
  channel?: Appointment["channel"];
};

export type SignupInput = Omit<Patient, "id" | "initials" | "status"> & { password: string };

export type Eligibility = { ok: boolean; reason: string };

type ClinicContextValue = ClinicState & {
  hydrated: boolean;
  currentPatient: Patient | null;
  currentProfessional: Professional | null;
  activeSpecialties: string[];
  /** Perfil do usuário logado, com o nome real vindo da API. */
  profile: RoleProfile | null;
  /** Faz login na API. Lança erro com a mensagem da API se falhar. */
  login: (email: string, password: string) => Promise<RoleProfile>;
  /** Atualiza o nome e o telefone do próprio usuário. */
  updateMyAccount: (changes: { name: string; phone: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  /** Cadastro público de paciente. */
  signup: (input: SignupInput) => Promise<void>;
  /** Confere o e-mail e pede o código. Sem envio de e-mail configurado, a API devolve o código em `testCode`. */
  requestPasswordReset: (email: string) => Promise<{ message: string; testCode?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  payAppointment: (id: string, method: PaymentMethod) => Promise<Appointment>;
  /** Recarrega todos os dados da API. */
  refresh: () => Promise<void>;
  patientById: (id: string) => Patient | undefined;
  professionalById: (id: string) => Professional | undefined;
  checkEligibility: (patientId: string, specialty: string) => Eligibility;
  availableSlots: (professionalId: string, date: string, ignoreAppointmentId?: string) => string[];
  createAppointment: (input: NewAppointment) => Appointment | null;
  setAppointmentStatus: (id: string, status: AppointmentStatus, note?: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => boolean;
  /** Só um lembrete por consulta: devolve false se já foi enviado. */
  sendReminder: (id: string) => boolean;
  sendAllReminders: () => number;
  addPatient: (input: Omit<Patient, "id" | "initials" | "status"> & { status?: Patient["status"] }) => Patient;
  updatePatient: (id: string, changes: Partial<Patient>) => void;
  togglePatientStatus: (id: string) => void;
  addProfessional: (input: Omit<Professional, "id" | "initials" | "color" | "active" | "availability">) => Professional;
  updateProfessional: (id: string, changes: Partial<Professional>) => void;
  toggleProfessional: (id: string) => void;
  setAvailability: (id: string, weekday: number, day: Availability[number]) => void;
  addSpecialty: (name: string) => void;
  updateSpecialty: (id: string, name: string) => void;
  toggleSpecialty: (id: string) => void;
  saveInsurance: (input: { id?: string; name: string; covered: string[] }) => void;
  toggleInsurance: (id: string) => void;
  addBlock: (input: Omit<ScheduleBlock, "id">) => void;
  removeBlock: (id: string) => void;
  addToWaitlist: (input: Omit<WaitlistEntry, "id" | "createdAt" | "status">) => void;
  inviteFromWaitlist: (id: string) => void;
  removeFromWaitlist: (id: string) => void;
  addStaff: (input: Omit<StaffUser, "id" | "status"> & { status?: StaffUser["status"] }) => void;
  updateStaff: (id: string, changes: Partial<StaffUser>) => void;
  notify: (input: { title: string; text: string; audience: UserRole[] }) => void;
  notificationsFor: (role: UserRole) => AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: UserRole) => void;
  updateSettings: (changes: Partial<ClinicSettings>) => void;
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

/** Id provisório enquanto a API não responde; o refresh troca pelo id real. */
function tempId(prefix: string) {
  return `tmp-${prefix}${Math.random().toString(36).slice(2, 8)}`;
}

function sessionFrom(user: ApiUser): Session {
  const role = fromApiRole(user.tipo);
  return {
    role,
    email: user.email,
    name: user.nome,
    phone: user.telefone ?? "",
    patientId: user.paciente ?? undefined,
    professionalId: user.profissional ?? undefined,
    staffId: role === "receptionist" || role === "admin" ? user.id : undefined,
  };
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ClinicState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const roleRef = useRef<UserRole | null>(null);

  /** Convênios são públicos: a tela de cadastro precisa deles mesmo sem login. */
  const loadPublicInsurances = useCallback(() => {
    api<Doc[]>("GET", "/convenios")
      .then((docs) => !roleRef.current && setState((current) => ({ ...current, insurances: docs.map(fromApi.insurance) })))
      .catch(() => undefined);
  }, []);

  const logout = useCallback(() => {
    tokenStore.set(null);
    roleRef.current = null;
    setState(emptyState);
    loadPublicInsurances();
  }, [loadPublicInsurances]);

  /** Busca tudo o que o perfil logado pode ver. Rotas sem permissão ficam vazias. */
  const refresh = useCallback(async () => {
    const role = roleRef.current;
    if (!role) return;
    const staff = role === "receptionist" || role === "admin";
    const list = (path: string, allowed = true) => (allowed ? api<Doc[]>("GET", path) : Promise.resolve([] as Doc[]));
    try {
      const [patients, professionals, specialties, insurances, appointments, blocks, waitlist, notifications, staffUsers, settings] = await Promise.all([
        list("/pacientes"),
        list("/profissionais"),
        list("/especialidades"),
        list("/convenios"),
        list("/consultas"),
        list("/bloqueios"),
        list("/fila-espera", staff),
        list("/notificacoes"),
        list("/usuarios", role === "admin"),
        api<Doc>("GET", "/configuracoes"),
      ]);
      setState((current) => ({
        ...current,
        patients: patients.map(fromApi.patient),
        professionals: professionals.map(fromApi.professional),
        specialties: specialties.map(fromApi.specialty),
        insurances: insurances.map(fromApi.insurance),
        appointments: appointments.map(fromApi.appointment),
        blocks: blocks.map(fromApi.block),
        waitlist: waitlist.map(fromApi.waitlist),
        notifications: notifications.map(fromApi.notification),
        staff: staffUsers.map(fromApi.staff),
        settings: fromApi.settings(settings),
      }));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        toast.error("Sua sessão expirou", { description: "Entre novamente para continuar." });
        return;
      }
      toast.error("Não foi possível carregar os dados", { description: (error as Error).message });
    }
  }, [logout]);

  /** Envia uma alteração para a API; em seguida sincroniza a tela com o banco. */
  const send = useCallback(
    (request: Promise<unknown>, errorTitle = "Não foi possível salvar") => {
      request
        .catch((error: Error) => toast.error(errorTitle, { description: error.message }))
        .finally(() => void refresh());
    },
    [refresh],
  );

  const startSession = useCallback(
    async (user: ApiUser) => {
      const session = sessionFrom(user);
      roleRef.current = session.role;
      setState((current) => ({ ...current, session }));
      await refresh();
      return session.role;
    },
    [refresh],
  );

  const personalize = useCallback((session: Session, professional: Professional | null): RoleProfile => {
    const base = roleProfiles[session.role];
    return {
      ...base,
      name: session.name,
      initials: initialsOf(session.name),
      title: session.role === "professional" ? professional?.specialty ?? base.title : base.title,
    };
  }, []);

  // Ao abrir o app, retoma a sessão salva (se o token ainda for válido).
  useEffect(() => {
    let active = true;
    (async () => {
      if (tokenStore.get()) {
        try {
          const user = await api<ApiUser>("GET", "/auth/me");
          if (active) await startSession(user);
        } catch {
          tokenStore.set(null);
        }
      }
      if (active && !roleRef.current) loadPublicInsurances();
      if (active) setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, [startSession, loadPublicInsurances]);

  const patientById = useCallback((id: string) => state.patients.find((item) => item.id === id), [state.patients]);
  const professionalById = useCallback((id: string) => state.professionals.find((item) => item.id === id), [state.professionals]);

  // Mesmas regras da API, calculadas aqui para a tela responder na hora.
  const checkEligibility = useCallback(
    (patientId: string, specialty: string): Eligibility => {
      const patient = state.patients.find((item) => item.id === patientId);
      if (!patient) return { ok: false, reason: "Paciente sem cadastro na clínica." };
      if (patient.status !== "Ativo") return { ok: false, reason: "Cadastro do paciente está inativo." };
      const list = state.specialties.find((item) => item.name === specialty);
      if (!list || !list.active) return { ok: false, reason: "Especialidade indisponível no momento." };
      const plan = state.insurances.find((item) => item.name === patient.insurance);
      if (!plan || !plan.active) return { ok: true, reason: `Atendimento particular para ${specialty}.` };
      if (plan.covered.length && !plan.covered.includes(specialty)) {
        return { ok: false, reason: `O convênio ${plan.name} não cobre ${specialty}.` };
      }
      return { ok: true, reason: plan.covered.length ? `${plan.name} cobre ${specialty}.` : `Atendimento particular para ${specialty}.` };
    },
    [state.patients, state.specialties, state.insurances],
  );

  const availableSlots = useCallback(
    (professionalId: string, date: string, ignoreAppointmentId?: string) => {
      const professional = state.professionals.find((item) => item.id === professionalId);
      if (!professional || !professional.active) return [];
      const weekday = new Date(`${date}T12:00:00`).getDay();
      const day = professional.availability[weekday];
      if (!day || !day.active) return [];
      const taken = state.appointments
        .filter((item) => item.professionalId === professionalId && item.date === date && item.id !== ignoreAppointmentId)
        .filter((item) => item.status !== "Cancelada")
        .map((item) => item.time);
      const blocks = state.blocks.filter((item) => item.professionalId === professionalId && item.startDate <= date && item.endDate >= date);
      return slotRange(day.start, day.end)
        .filter((slot) => !taken.includes(slot))
        .filter((slot) => !blocks.some((block) => minutesOf(slot) >= minutesOf(block.startTime) && minutesOf(slot) < minutesOf(block.endTime)));
    },
    [state.appointments, state.professionals, state.blocks],
  );

  const value = useMemo<ClinicContextValue>(() => {
    const currentPatient = state.session?.patientId ? state.patients.find((item) => item.id === state.session?.patientId) ?? null : null;
    const currentProfessional = state.session?.professionalId
      ? state.professionals.find((item) => item.id === state.session?.professionalId) ?? null
      : null;

    const withLog = (item: Appointment, text: string): Appointment => ({
      ...item,
      history: [...item.history, { at: isoDate(0), text }],
    });

    const patchList = <K extends "patients" | "professionals" | "specialties" | "insurances" | "staff" | "waitlist" | "notifications" | "appointments">(
      key: K,
      id: string,
      update: (item: ClinicState[K][number]) => ClinicState[K][number],
    ) =>
      setState((current) => ({
        ...current,
        [key]: (current[key] as ClinicState[K][number][]).map((item) => (item.id === id ? update(item) : item)),
      }));

    return {
      ...state,
      hydrated,
      currentPatient,
      currentProfessional,
      activeSpecialties: state.specialties.filter((item) => item.active).map((item) => item.name),
      profile: state.session ? personalize(state.session, currentProfessional) : null,
      patientById,
      professionalById,
      checkEligibility,
      availableSlots,
      refresh,
      logout,

      login: async (email, password) => {
        const { token, usuario } = await api<{ token: string; usuario: ApiUser }>("POST", "/auth/login", { email, senha: password });
        tokenStore.set(token);
        await startSession(usuario);
        return personalize(sessionFrom(usuario), null);
      },

      updateMyAccount: async ({ name, phone }) => {
        const user = await api<ApiUser>("PUT", "/auth/me", { nome: name, telefone: phone });
        setState((current) => (current.session ? { ...current, session: { ...current.session, name: user.nome, phone: user.telefone ?? "" } } : current));
        await refresh();
      },

      changePassword: async (currentPassword, newPassword) => {
        await api("PATCH", "/auth/senha", { senhaAtual: currentPassword, novaSenha: newPassword });
      },

      signup: async ({ name, cpf, phone, email, birthDate, insurance, password }) => {
        await api("POST", "/auth/cadastro", { nome: name, cpf, telefone: phone, email, dataNascimento: birthDate, convenio: insurance, senha: password });
      },

      requestPasswordReset: async (email) => {
        const { mensagem, codigoTeste } = await api<{ mensagem: string; codigoTeste?: string }>("POST", "/auth/recuperar-senha", { email });
        return { message: mensagem, ...(codigoTeste && { testCode: codigoTeste }) };
      },

      resetPassword: async (email, code, newPassword) => {
        await api("POST", "/auth/redefinir-senha", { email, codigo: code, novaSenha: newPassword });
      },

      payAppointment: async (id, method) => {
        const doc = await api<Doc>("POST", `/consultas/${id}/pagamento`, { metodo: method });
        await refresh();
        return fromApi.appointment(doc);
      },

      createAppointment: ({ patientId, professionalId, date, time, notes, channel }) => {
        const professional = state.professionals.find((item) => item.id === professionalId);
        if (!professional) return null;
        if (!checkEligibility(patientId, professional.specialty).ok) return null;
        if (!availableSlots(professionalId, date).includes(time)) return null;
        const origin = channel ?? "Recepção";
        const appointment: Appointment = {
          id: tempId("c"),
          code: "",
          date,
          time,
          patientId,
          professionalId,
          specialty: professional.specialty,
          status: state.settings.autoConfirm ? "Confirmada" : "Agendada",
          notes: notes ?? "",
          channel: origin,
          reminderSentAt: null,
          confirmationReply: state.settings.autoConfirm ? "Confirmou" : "Sem resposta",
          history: [{ at: isoDate(0), text: `Consulta criada (${origin.toLowerCase()})` }],
          payment: origin === "Recepção" ? { status: "Pendente", amount: state.settings.appointmentPrice, method: "", code: "", paidAt: null } : null,
        };
        setState((current) => ({ ...current, appointments: [...current.appointments, appointment] }));
        send(
          api("POST", "/consultas", { paciente: patientId, profissional: professionalId, data: date, hora: time, observacoes: notes ?? "" }),
          "Não foi possível agendar",
        );
        return appointment;
      },

      setAppointmentStatus: (id, status, note) => {
        patchList("appointments", id, (item) =>
          withLog(
            {
              ...item,
              status,
              confirmationReply: status === "Confirmada" ? "Confirmou" : status === "Cancelada" ? "Cancelou" : item.confirmationReply,
            },
            note ?? `Status alterado para ${status}`,
          ),
        );
        send(api("PATCH", `/consultas/${id}/status`, { status, observacao: note }), "Não foi possível atualizar a consulta");
      },

      rescheduleAppointment: (id, date, time) => {
        const appointment = state.appointments.find((item) => item.id === id);
        if (!appointment) return false;
        if (!availableSlots(appointment.professionalId, date, id).includes(time)) return false;
        patchList("appointments", id, (item) =>
          withLog(
            { ...item, date, time, status: "Remarcada", reminderSentAt: null, confirmationReply: "Sem resposta" },
            `Remarcada de ${appointment.date} ${appointment.time} para ${date} ${time}`,
          ),
        );
        send(api("PATCH", `/consultas/${id}/remarcar`, { data: date, hora: time }), "Não foi possível remarcar");
        return true;
      },

      sendReminder: (id) => {
        if (state.appointments.find((item) => item.id === id)?.reminderSentAt) return false;
        patchList("appointments", id, (item) => withLog({ ...item, reminderSentAt: isoDate(0) }, "Lembrete de confirmação enviado"));
        send(api("POST", `/consultas/${id}/lembrete`), "Não foi possível enviar o lembrete");
        return true;
      },

      sendAllReminders: () => {
        const pending = state.appointments.filter(
          (item) => openStatuses.includes(item.status) && item.confirmationReply === "Sem resposta" && item.date >= isoDate(0) && !item.reminderSentAt,
        );
        if (pending.length) {
          setState((current) => ({
            ...current,
            appointments: current.appointments.map((item) =>
              pending.some((p) => p.id === item.id) ? withLog({ ...item, reminderSentAt: isoDate(0) }, "Lembrete de confirmação enviado") : item,
            ),
          }));
          send(api("POST", "/consultas/lembretes"), "Não foi possível enviar os lembretes");
        }
        return pending.length;
      },

      addPatient: (input) => {
        const patient: Patient = { ...input, id: tempId("p"), initials: initialsOf(input.name), status: input.status ?? "Ativo" };
        setState((current) => ({ ...current, patients: [...current.patients, patient] }));
        send(api("POST", "/pacientes", toApi.patient(patient)), "Não foi possível cadastrar o paciente");
        return patient;
      },

      updatePatient: (id, changes) => {
        patchList("patients", id, (item) => ({ ...item, ...changes, initials: changes.name ? initialsOf(changes.name) : item.initials }));
        send(api("PUT", `/pacientes/${id}`, toApi.patient(changes)), "Não foi possível atualizar o paciente");
      },

      togglePatientStatus: (id) => {
        patchList("patients", id, (item) => ({ ...item, status: item.status === "Ativo" ? "Inativo" : "Ativo" }));
        send(api("PATCH", `/pacientes/${id}/status`));
      },

      addProfessional: (input) => {
        const professional: Professional = { ...input, id: tempId("pro"), initials: initialsOf(input.name), color: "bg-info", active: true, availability: {} };
        setState((current) => ({ ...current, professionals: [...current.professionals, professional] }));
        send(api("POST", "/profissionais", toApi.professional(input)), "Não foi possível cadastrar o médico");
        return professional;
      },

      updateProfessional: (id, changes) => {
        patchList("professionals", id, (item) => ({ ...item, ...changes, initials: changes.name ? initialsOf(changes.name) : item.initials }));
        send(api("PUT", `/profissionais/${id}`, toApi.professional(changes)), "Não foi possível atualizar o médico");
      },

      toggleProfessional: (id) => {
        patchList("professionals", id, (item) => ({ ...item, active: !item.active }));
        send(api("PATCH", `/profissionais/${id}/status`));
      },

      setAvailability: (id, weekday, day) => {
        patchList("professionals", id, (item) => ({ ...item, availability: { ...item.availability, [weekday]: day } }));
        send(api("PUT", `/profissionais/${id}/disponibilidade/${weekday}`, { ativo: day.active, inicio: day.start, fim: day.end }), "Não foi possível salvar o horário");
      },

      addSpecialty: (name) => {
        setState((current) => ({ ...current, specialties: [...current.specialties, { id: tempId("s"), name, active: true }] }));
        send(api("POST", "/especialidades", { nome: name }), "Não foi possível cadastrar a especialidade");
      },

      updateSpecialty: (id, name) => {
        patchList("specialties", id, (item) => ({ ...item, name }));
        send(api("PUT", `/especialidades/${id}`, { nome: name }), "Não foi possível renomear a especialidade");
      },

      toggleSpecialty: (id) => {
        patchList("specialties", id, (item) => ({ ...item, active: !item.active }));
        send(api("PATCH", `/especialidades/${id}/status`));
      },

      saveInsurance: ({ id, name, covered }) => {
        if (id) patchList("insurances", id, (item) => ({ ...item, name, covered }));
        else setState((current) => ({ ...current, insurances: [...current.insurances, { id: tempId("c"), name, covered, active: true }] }));
        const body = { nome: name, coberturas: covered };
        send(id ? api("PUT", `/convenios/${id}`, body) : api("POST", "/convenios", body), "Não foi possível salvar o convênio");
      },

      toggleInsurance: (id) => {
        patchList("insurances", id, (item) => ({ ...item, active: !item.active }));
        send(api("PATCH", `/convenios/${id}/status`));
      },

      addBlock: (input) => {
        setState((current) => ({ ...current, blocks: [...current.blocks, { ...input, id: tempId("b") }] }));
        send(api("POST", "/bloqueios", toApi.block(input)), "Não foi possível bloquear a agenda");
      },

      removeBlock: (id) => {
        setState((current) => ({ ...current, blocks: current.blocks.filter((item) => item.id !== id) }));
        send(api("DELETE", `/bloqueios/${id}`));
      },

      addToWaitlist: (input) => {
        setState((current) => ({ ...current, waitlist: [...current.waitlist, { ...input, id: tempId("w"), createdAt: isoDate(0), status: "Aguardando" }] }));
        send(api("POST", "/fila-espera", toApi.waitlist(input)), "Não foi possível adicionar à fila");
      },

      inviteFromWaitlist: (id) => {
        patchList("waitlist", id, (item) => ({ ...item, status: "Convidado" }));
        send(api("PATCH", `/fila-espera/${id}/convidar`));
      },

      removeFromWaitlist: (id) => {
        setState((current) => ({ ...current, waitlist: current.waitlist.filter((item) => item.id !== id) }));
        send(api("DELETE", `/fila-espera/${id}`));
      },

      addStaff: (input) => {
        setState((current) => ({ ...current, staff: [...current.staff, { ...input, id: tempId("u"), status: input.status ?? "Pendente" }] }));
        send(api("POST", "/usuarios", toApi.staff(input)), "Não foi possível cadastrar o usuário");
      },

      updateStaff: (id, changes) => {
        patchList("staff", id, (item) => ({ ...item, ...changes }));
        send(api("PUT", `/usuarios/${id}`, toApi.staff(changes)), "Não foi possível atualizar o usuário");
      },

      notify: ({ title, text, audience }) => {
        send(api("POST", "/notificacoes", { titulo: title, texto: text, publico: audience.map(toApiRole) }), "Não foi possível enviar o aviso");
      },

      notificationsFor: (role) => state.notifications.filter((item) => item.audience.includes(role)),

      markNotificationRead: (id) => {
        patchList("notifications", id, (item) => ({ ...item, read: true }));
        send(api("PATCH", `/notificacoes/${id}/lida`));
      },

      markAllNotificationsRead: (role) => {
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((item) => (item.audience.includes(role) ? { ...item, read: true } : item)),
        }));
        send(api("PATCH", "/notificacoes/lidas"));
      },

      updateSettings: (changes) => {
        setState((current) => ({ ...current, settings: { ...current.settings, ...changes } }));
        send(api("PUT", "/configuracoes", toApi.settings(changes)), "Não foi possível salvar as configurações");
      },
    };
  }, [state, hydrated, availableSlots, checkEligibility, patientById, professionalById, refresh, logout, send, startSession, personalize]);

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error("useClinic deve ser usado dentro de ClinicProvider");
  return context;
}

export function useReports() {
  const { appointments, professionals } = useClinic();
  return useMemo(() => {
    const done = appointments.filter((item) => item.status === "Realizada").length;
    const noShow = appointments.filter((item) => item.status === "Não compareceu").length;
    const canceled = appointments.filter((item) => item.status === "Cancelada").length;
    const total = appointments.length;
    const attendance = done + noShow ? Math.round((done / (done + noShow)) * 100) : 0;
    const bySpecialty = professionals.map((professional) => {
      const items = appointments.filter((item) => item.professionalId === professional.id);
      const capacity = Math.max(items.length, 1);
      return {
        name: professional.specialty,
        professional: professional.name,
        total: items.length,
        occupancy: Math.min(100, Math.round((items.length / (capacity + 2)) * 100) + 40),
      };
    });
    const perDay = Array.from({ length: 7 }, (_, index) => {
      const date = isoDate(index - 6);
      return { date, total: appointments.filter((item) => item.date === date).length };
    });
    return { total, done, noShow, canceled, attendance, bySpecialty, perDay };
  }, [appointments, professionals]);
}
