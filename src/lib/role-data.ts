import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ChartNoAxesCombined,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  Settings,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";

export type UserRole = "receptionist" | "patient" | "professional" | "admin";

export type AppNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export type RoleProfile = {
  role: UserRole;
  name: string;
  title: string;
  initials: string;
  home: string;
  search: string;
  nav: AppNavItem[];
};

const receptionistNav: AppNavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/consultas", label: "Consultas", icon: CalendarCheck },
  { to: "/pacientes", label: "Pacientes", icon: UsersRound },
  { to: "/fila-espera", label: "Fila de espera", icon: ClipboardCheck },
  { to: "/check-in", label: "Check-in", icon: UserRound },
  { to: "/profissionais", label: "Profissionais", icon: Stethoscope },
  { to: "/relatorios", label: "Relatórios", icon: ChartNoAxesCombined },
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
      { to: "/paciente/consultas", label: "Minhas consultas", icon: CalendarCheck },
      { to: "/paciente/agendar", label: "Agendar consulta", icon: CalendarPlus },
      { to: "/paciente/check-in", label: "Check-in", icon: ClipboardCheck },
      { to: "/paciente/notificacoes", label: "Notificações", icon: Bell },
      { to: "/paciente/perfil", label: "Meu perfil", icon: UserRound },
    ],
  },
  professional: {
    role: "professional",
    name: "Dra. Ana Martins",
    title: "Profissional de Saúde",
    initials: "AM",
    home: "/profissional",
    search: "Buscar paciente ou atendimento...",
    nav: [
      { to: "/profissional", label: "Início", icon: LayoutDashboard },
      { to: "/profissional/agenda", label: "Minha agenda", icon: CalendarDays },
      { to: "/profissional/atendimentos", label: "Atendimentos", icon: Stethoscope },
      { to: "/profissional/pacientes", label: "Meus pacientes", icon: UsersRound },
      { to: "/profissional/disponibilidade", label: "Disponibilidade", icon: Clock3 },
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
      { to: "/administrador/profissionais", label: "Profissionais", icon: Stethoscope },
      { to: "/administrador/relatorios", label: "Relatórios", icon: ChartNoAxesCombined },
      { to: "/administrador/configuracoes", label: "Configurações", icon: Settings },
      { to: "/relatorios", label: "Relatório operacional", icon: FileText },
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

export function roleFromPath(pathname: string): UserRole {
  if (pathname.startsWith("/paciente")) return "patient";
  if (pathname.startsWith("/profissional")) return "professional";
  if (pathname.startsWith("/administrador")) return "admin";
  return "receptionist";
}