import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarCheck,
  CalendarCog,
  CalendarDays,
  CalendarPlus,
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
  | "/dashboard" | "/agenda" | "/consultas" | "/pacientes" | "/fila-espera" | "/perfil"
  | "/paciente" | "/paciente/agendar" | "/paciente/notificacoes" | "/paciente/perfil"
  | "/profissional" | "/profissional/agenda" | "/profissional/pacientes" | "/profissional/disponibilidade" | "/profissional/notificacoes" | "/profissional/perfil"
  | "/administrador" | "/administrador/usuarios" | "/administrador/profissionais" | "/administrador/especialidades" | "/administrador/agendas" | "/administrador/configuracoes";

export type AppNavItem = {
  to: AppPath;
  label: string;
  icon: LucideIcon;
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
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/consultas", label: "Consultas", icon: CalendarCheck },
  { to: "/pacientes", label: "Pacientes", icon: UsersRound },
  { to: "/fila-espera", label: "Fila de espera", icon: ClipboardCheck },
  { to: "/perfil", label: "Configurações", icon: Settings },
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
      { to: "/paciente", label: "Início", icon: LayoutDashboard },
      { to: "/paciente/agendar", label: "Agendar consulta", icon: CalendarPlus },
      { to: "/paciente/notificacoes", label: "Notificações", icon: Bell },
      { to: "/paciente/perfil", label: "Meu perfil", icon: UserRound },
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
      { to: "/profissional", label: "Início", icon: LayoutDashboard },
      { to: "/profissional/agenda", label: "Minha agenda", icon: CalendarDays },
      { to: "/profissional/pacientes", label: "Meus pacientes", icon: UsersRound },
      { to: "/profissional/disponibilidade", label: "Meus horários", icon: Clock3 },
      { to: "/profissional/notificacoes", label: "Notificações", icon: Bell },
      { to: "/profissional/perfil", label: "Meu perfil", icon: UserRound },
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
      { to: "/administrador", label: "Visão geral", icon: LayoutDashboard },
      { to: "/administrador/usuarios", label: "Usuários", icon: UsersRound },
      { to: "/administrador/profissionais", label: "Médicos", icon: Stethoscope },
      { to: "/administrador/especialidades", label: "Especialidades", icon: Tags },
      { to: "/administrador/agendas", label: "Agendas e horários", icon: CalendarCog },
      { to: "/administrador/configuracoes", label: "Configurações", icon: Settings },
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
