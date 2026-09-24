import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarCheck,
  CalendarCog,
  CalendarDays,
  CalendarPlus,
  ChartNoAxesCombined,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Tags,
  UserRound,
  UsersRound,
} from "lucide-react";

export type UserRole = "receptionist" | "patient" | "professional" | "admin";

export type AppPath =
  | "/dashboard" | "/agenda" | "/consultas" | "/pacientes" | "/fila-espera" | "/profissionais" | "/perfil"
  | "/paciente" | "/paciente/consultas" | "/paciente/agendar" | "/paciente/notificacoes" | "/paciente/perfil"
  | "/profissional" | "/profissional/agenda" | "/profissional/atendimentos" | "/profissional/pacientes" | "/profissional/disponibilidade" | "/profissional/notificacoes" | "/profissional/perfil"
  | "/administrador" | "/administrador/usuarios" | "/administrador/profissionais" | "/administrador/especialidades" | "/administrador/agendas" | "/administrador/relatorios" | "/administrador/configuracoes";

export type AppNavItem = {
  to: AppPath;
  label: string;
  icon: LucideIcon;
  group: "Visão geral" | "Atendimento" | "Gestão" | "Conta";
};

export type RoleProfile = {
  role: UserRole;
  name: string;
  title: string;
  initials: string;
  home: AppPath;
  search: string;
  nav: AppNavItem[];
};

const receptionistNav: AppNavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Visão geral" },
  { to: "/agenda", label: "Agenda", icon: CalendarDays, group: "Atendimento" },
  { to: "/consultas", label: "Consultas", icon: CalendarCheck, group: "Atendimento" },
  { to: "/fila-espera", label: "Fila de espera", icon: ClipboardCheck, group: "Atendimento" },
  { to: "/pacientes", label: "Pacientes", icon: UsersRound, group: "Gestão" },
  { to: "/profissionais", label: "Médicos", icon: Stethoscope, group: "Gestão" },
  { to: "/perfil", label: "Configurações", icon: Settings, group: "Conta" },
];

export const roleProfiles: Record<UserRole, RoleProfile> = {
  receptionist: {
    role: "receptionist",
    name: "Rafaela Costa",
    title: "Recepcionista",
    initials: "RC",
    home: "/dashboard",
    search: "Buscar paciente ou consulta...",
    nav: receptionistNav,
  },
  patient: {
    role: "patient",
    name: "Marina Costa",
    title: "Paciente",
    initials: "MC",
    home: "/paciente",
    search: "Buscar consulta ou especialidade...",
    nav: [
      { to: "/paciente", label: "Início", icon: LayoutDashboard, group: "Visão geral" },
      { to: "/paciente/consultas", label: "Minhas consultas", icon: CalendarCheck, group: "Atendimento" },
      { to: "/paciente/agendar", label: "Agendar consulta", icon: CalendarPlus, group: "Atendimento" },
      { to: "/paciente/notificacoes", label: "Notificações", icon: Bell, group: "Conta" },
      { to: "/paciente/perfil", label: "Meu perfil", icon: UserRound, group: "Conta" },
    ],
  },
  professional: {
    role: "professional",
    name: "Dra. Ana Martins",
    title: "Médica",
    initials: "AM",
    home: "/profissional",
    search: "Buscar paciente ou atendimento...",
    nav: [
      { to: "/profissional", label: "Início", icon: LayoutDashboard, group: "Visão geral" },
      { to: "/profissional/agenda", label: "Minha agenda", icon: CalendarDays, group: "Atendimento" },
      { to: "/profissional/atendimentos", label: "Atendimentos", icon: Stethoscope, group: "Atendimento" },
      { to: "/profissional/pacientes", label: "Meus pacientes", icon: UsersRound, group: "Gestão" },
      { to: "/profissional/disponibilidade", label: "Meus horários", icon: Clock3, group: "Gestão" },
      { to: "/profissional/notificacoes", label: "Notificações", icon: Bell, group: "Conta" },
      { to: "/profissional/perfil", label: "Meu perfil", icon: UserRound, group: "Conta" },
    ],
  },
  admin: {
    role: "admin",
    name: "Marcelo Andrade",
    title: "Administrador",
    initials: "MA",
    home: "/administrador",
    search: "Buscar usuário ou indicador...",
    nav: [
      { to: "/administrador", label: "Visão geral", icon: LayoutDashboard, group: "Visão geral" },
      { to: "/administrador/usuarios", label: "Usuários", icon: UsersRound, group: "Gestão" },
      { to: "/administrador/profissionais", label: "Médicos", icon: Stethoscope, group: "Gestão" },
      { to: "/administrador/especialidades", label: "Especialidades", icon: Tags, group: "Gestão" },
      { to: "/administrador/agendas", label: "Agendas e horários", icon: CalendarCog, group: "Atendimento" },
      { to: "/administrador/relatorios", label: "Relatórios", icon: ChartNoAxesCombined, group: "Visão geral" },
      { to: "/administrador/configuracoes", label: "Configurações", icon: Settings, group: "Conta" },
    ],
  },
};

export function roleFromEmail(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  if (normalized === "paciente@demo.com") return "patient";
  if (normalized === "profissional@demo.com") return "professional";
  if (normalized === "admin@demo.com") return "admin";
  return "receptionist";
}

function inArea(pathname: string, area: string) {
  return pathname === area || pathname.startsWith(`${area}/`);
}

export function roleFromPath(pathname: string): UserRole {
  if (inArea(pathname, "/paciente")) return "patient";
  if (inArea(pathname, "/profissional")) return "professional";
  if (inArea(pathname, "/administrador")) return "admin";
  return "receptionist";
}
