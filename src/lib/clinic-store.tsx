import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  initialsOf,
  isoDate,
  minutesOf,
  openStatuses,
  seedAppointments,
  seedBlocks,
  seedInsurances,
  seedNotifications,
  seedPatients,
  seedProfessionals,
  seedSettings,
  seedSpecialties,
  seedStaff,
  seedWaitlist,
  slotRange,
  type AppNotification,
  type Appointment,
  type AppointmentStatus,
  type Availability,
  type ClinicSettings,
  type InsurancePlan,
  type Patient,
  type Professional,
  type ScheduleBlock,
  type Specialty,
  type StaffUser,
  type WaitlistEntry,
} from "@/lib/clinic-data";
import { roleFromEmail, type UserRole } from "@/lib/role-data";

type Session = {
  role: UserRole;
  email: string;
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

const STORAGE_KEY = "gestao-consultas-state-v2";

const initialState: ClinicState = {
  patients: seedPatients,
  professionals: seedProfessionals,
  specialties: seedSpecialties,
  insurances: seedInsurances,
  appointments: seedAppointments,
  blocks: seedBlocks,
  waitlist: seedWaitlist,
  notifications: seedNotifications,
  staff: seedStaff,
  settings: seedSettings,
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

export type Eligibility = { ok: boolean; reason: string };

type ClinicContextValue = ClinicState & {
  currentPatient: Patient | null;
  currentProfessional: Professional | null;
  activeSpecialties: string[];
  login: (email: string) => UserRole;
  logout: () => void;
  patientById: (id: string) => Patient | undefined;
  professionalById: (id: string) => Professional | undefined;
  checkEligibility: (patientId: string, specialty: string) => Eligibility;
  availableSlots: (professionalId: string, date: string, ignoreAppointmentId?: string) => string[];
  createAppointment: (input: NewAppointment) => Appointment | null;
  setAppointmentStatus: (id: string, status: AppointmentStatus, note?: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => boolean;
  sendReminder: (id: string) => void;
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

function makeId(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}`;
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ClinicState>(initialState);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setState({ ...initialState, ...(JSON.parse(stored) as ClinicState) });
    } catch {
      /* estado local indisponível */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* estado local indisponível */
    }
  }, [state]);

  const patientById = useCallback((id: string) => state.patients.find((item) => item.id === id), [state.patients]);
  const professionalById = useCallback((id: string) => state.professionals.find((item) => item.id === id), [state.professionals]);

  const pushNotification = useCallback((title: string, text: string, audience: UserRole[]) => {
    setState((current) => ({
      ...current,
      notifications: [{ id: makeId("n"), title, text, createdAt: isoDate(0), audience, read: false }, ...current.notifications].slice(0, 40),
    }));
  }, []);

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

    return {
      ...state,
      currentPatient,
      currentProfessional,
      activeSpecialties: state.specialties.filter((item) => item.active).map((item) => item.name),
      patientById,
      professionalById,
      checkEligibility,
      availableSlots,

      login: (email) => {
        const role = roleFromEmail(email);
        const normalized = email.trim().toLowerCase();
        const patient = state.patients.find((item) => item.email.toLowerCase() === normalized) ?? state.patients[0];
        const professional = state.professionals.find((item) => item.email.toLowerCase() === normalized) ?? state.professionals[0];
        setState((current) => ({
          ...current,
          session: {
            role,
            email: normalized,
            patientId: role === "patient" ? patient?.id : undefined,
            professionalId: role === "professional" ? professional?.id : undefined,
            staffId: current.staff.find((item) => item.email.toLowerCase() === normalized)?.id,
          },
        }));
        return role;
      },

      logout: () => setState((current) => ({ ...current, session: null })),

      createAppointment: ({ patientId, professionalId, date, time, notes, channel }) => {
        const professional = state.professionals.find((item) => item.id === professionalId);
        if (!professional) return null;
        if (!checkEligibility(patientId, professional.specialty).ok) return null;
        const free = availableSlots(professionalId, date);
        if (!free.includes(time)) return null;
        const origin = channel ?? "Recepção";
        const appointment: Appointment = {
          id: makeId("").slice(0, 4).toUpperCase(),
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
        };
        setState((current) => ({ ...current, appointments: [...current.appointments, appointment] }));
        pushNotification(
          "Informações da consulta",
          `${patientById(patientId)?.name ?? "Paciente"} · ${professional.name} · ${date} às ${time}.`,
          ["receptionist", "professional", "patient"],
        );
        return appointment;
      },

      setAppointmentStatus: (id, status, note) => {
        // RN09: após a confirmação o paciente recebe as informações da consulta.
        const target = state.appointments.find((item) => item.id === id);
        if (target && status === "Confirmada") {
          const professional = state.professionals.find((item) => item.id === target.professionalId);
          pushNotification(
            "Consulta confirmada",
            `${target.specialty}${professional ? ` com ${professional.name}` : ""} · ${target.date} às ${target.time}.`,
            ["patient", "receptionist", "professional"],
          );
        }
        if (target && status === "Cancelada") {
          pushNotification("Horário liberado", `${target.date} às ${target.time} voltou a ficar disponível na agenda.`, ["receptionist", "admin"]);
        }
        setState((current) => ({
          ...current,
          appointments: current.appointments.map((item) =>
            item.id === id
              ? withLog(
                  {
                    ...item,
                    status,
                    confirmationReply:
                      status === "Confirmada" ? "Confirmou" : status === "Cancelada" ? "Cancelou" : item.confirmationReply,
                  },
                  note ?? `Status alterado para ${status}`,
                )
              : item,
          ),
        }));
      },

      rescheduleAppointment: (id, date, time) => {
        const appointment = state.appointments.find((item) => item.id === id);
        if (!appointment) return false;
        if (!availableSlots(appointment.professionalId, date, id).includes(time)) return false;
        setState((current) => ({
          ...current,
          appointments: current.appointments.map((item) =>
            item.id === id
              ? withLog(
                  { ...item, date, time, status: "Remarcada", reminderSentAt: null, confirmationReply: "Sem resposta" },
                  `Remarcada de ${appointment.date} ${appointment.time} para ${date} ${time}`,
                )
              : item,
          ),
        }));
        pushNotification("Consulta remarcada", `${patientById(appointment.patientId)?.name ?? "Paciente"} foi movido para ${date} às ${time}.`, ["receptionist", "professional", "patient"]);
        return true;
      },

      sendReminder: (id) => {
        setState((current) => ({
          ...current,
          appointments: current.appointments.map((item) => (item.id === id ? withLog({ ...item, reminderSentAt: isoDate(0) }, "Lembrete de confirmação enviado") : item)),
        }));
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
          pushNotification("Lembretes enviados", `${pending.length} paciente(s) receberam o lembrete de confirmação.`, ["patient", "receptionist"]);
        }
        return pending.length;
      },

      addPatient: (input) => {
        const patient: Patient = { ...input, id: makeId("p"), initials: initialsOf(input.name), status: input.status ?? "Ativo" };
        setState((current) => ({ ...current, patients: [...current.patients, patient] }));
        return patient;
      },

      updatePatient: (id, changes) => {
        setState((current) => ({
          ...current,
          patients: current.patients.map((item) => (item.id === id ? { ...item, ...changes, initials: changes.name ? initialsOf(changes.name) : item.initials } : item)),
        }));
      },

      togglePatientStatus: (id) => {
        setState((current) => ({
          ...current,
          patients: current.patients.map((item) => (item.id === id ? { ...item, status: item.status === "Ativo" ? "Inativo" : "Ativo" } : item)),
        }));
      },

      addProfessional: (input) => {
        const professional: Professional = {
          ...input,
          id: makeId("pro"),
          initials: initialsOf(input.name),
          color: "bg-info",
          active: true,
          availability: {
            1: { active: true, start: "08:00", end: "17:00" },
            2: { active: true, start: "08:00", end: "17:00" },
            3: { active: true, start: "08:00", end: "17:00" },
            4: { active: true, start: "08:00", end: "17:00" },
            5: { active: true, start: "08:00", end: "17:00" },
            6: { active: false, start: "08:00", end: "12:00" },
          },
        };
        setState((current) => ({ ...current, professionals: [...current.professionals, professional] }));
        return professional;
      },

      updateProfessional: (id, changes) => {
        setState((current) => ({
          ...current,
          professionals: current.professionals.map((item) => (item.id === id ? { ...item, ...changes, initials: changes.name ? initialsOf(changes.name) : item.initials } : item)),
        }));
      },

      toggleProfessional: (id) => {
        setState((current) => ({
          ...current,
          professionals: current.professionals.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
        }));
      },

      setAvailability: (id, weekday, day) => {
        setState((current) => ({
          ...current,
          professionals: current.professionals.map((item) => (item.id === id ? { ...item, availability: { ...item.availability, [weekday]: day } } : item)),
        }));
      },

      addSpecialty: (name) => {
        setState((current) => ({ ...current, specialties: [...current.specialties, { id: makeId("s"), name, active: true }] }));
      },

      updateSpecialty: (id, name) => {
        setState((current) => ({ ...current, specialties: current.specialties.map((item) => (item.id === id ? { ...item, name } : item)) }));
      },

      toggleSpecialty: (id) => {
        setState((current) => ({ ...current, specialties: current.specialties.map((item) => (item.id === id ? { ...item, active: !item.active } : item)) }));
      },

      addBlock: (input) => {
        setState((current) => ({ ...current, blocks: [...current.blocks, { ...input, id: makeId("b") }] }));
        pushNotification("Agenda bloqueada", "Um período foi bloqueado na agenda médica.", ["receptionist", "professional", "admin"]);
      },

      removeBlock: (id) => setState((current) => ({ ...current, blocks: current.blocks.filter((item) => item.id !== id) })),

      addToWaitlist: (input) => {
        setState((current) => ({
          ...current,
          waitlist: [...current.waitlist, { ...input, id: makeId("w"), createdAt: isoDate(0), status: "Aguardando" }],
        }));
      },

      inviteFromWaitlist: (id) => {
        setState((current) => ({
          ...current,
          waitlist: current.waitlist.map((item) => (item.id === id ? { ...item, status: "Convidado" } : item)),
        }));
        pushNotification("Horário oferecido", "Um paciente da fila de espera recebeu uma oferta de horário.", ["patient", "receptionist"]);
      },

      removeFromWaitlist: (id) => {
        setState((current) => ({ ...current, waitlist: current.waitlist.filter((item) => item.id !== id) }));
      },

      addStaff: (input) => {
        setState((current) => ({ ...current, staff: [...current.staff, { ...input, id: makeId("u"), status: input.status ?? "Pendente" }] }));
      },

      updateStaff: (id, changes) => {
        setState((current) => ({ ...current, staff: current.staff.map((item) => (item.id === id ? { ...item, ...changes } : item)) }));
      },

      notify: ({ title, text, audience }) => pushNotification(title, text, audience),

      notificationsFor: (role) => state.notifications.filter((item) => item.audience.includes(role)),

      markNotificationRead: (id) => {
        setState((current) => ({ ...current, notifications: current.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)) }));
      },

      markAllNotificationsRead: (role) => {
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((item) => (item.audience.includes(role) ? { ...item, read: true } : item)),
        }));
      },

      updateSettings: (changes) => setState((current) => ({ ...current, settings: { ...current.settings, ...changes } })),
    };
  }, [state, availableSlots, checkEligibility, patientById, professionalById, pushNotification]);

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
