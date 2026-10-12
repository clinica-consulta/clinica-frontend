import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BellRing,
  CircleUserRound,
  Hourglass,
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
  /** Rótulo curto usado na barra de navegação inferior (mobile). */
  short?: string;
  /** Título exibido no cabeçalho mobile quando difere do rótulo. */
  mobileTitle?: string;
  /** Item aparece só no menu do desktop. */
  desktopOnly?: boolean;
};

/** Nome e iniciais abaixo são só o padrão: na tela aparece o nome real do usuário logado. */
export type RoleProfile = {
  role: UserRole;
  name: string;
  title: string;
  initials: string;
  home: AppPath;
  search: string;
  /** Linha pequena acima de "GESTÃO DE CONSULTAS" no cabeçalho desktop. */
  brand: string;
  /** Linha pequena do cabeçalho mobile. */
  area: string;
  /** Texto do rodapé (desktop). */
  footer: string;
  /** Variante visual do cabeçalho, conforme o protótipo de cada perfil. */
  headerStyle: "tabs" | "pills";
  nav: AppNavItem[];
};

const receptionistNav: AppNavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agenda", label: "Agendar", short: "Agenda", mobileTitle: "Agenda", icon: CalendarDays },
  { to: "/consultas", label: "Consultas", icon: CalendarCheck },
  { to: "/pacientes", label: "Pacientes", icon: UsersRound },
  { to: "/fila-espera", label: "Fila de espera", short: "Fila", mobileTitle: "Espera", icon: Hourglass },
  { to: "/perfil", label: "Configurações", short: "Perfil", mobileTitle: "Perfil", icon: Settings },
];

export const roleProfiles: Record<UserRole, RoleProfile> = {
  receptionist: {
    role: "receptionist",
    name: "Recepção",
    title: "Recepcionista",
    initials: "RE",
    home: "/dashboard",
    search: "Buscar consulta ou especialidade...",
    brand: "Portal de Saúde",
    area: "Área da recepção",
    footer: "© 2026 Gestão de Consultas. Todos os direitos reservados.",
    headerStyle: "tabs",
    nav: receptionistNav,
  },
  patient: {
    role: "patient",
    name: "Paciente",
    title: "Paciente",
    initials: "PA",
    home: "/paciente",
    search: "Buscar consulta ou especialidade...",
    brand: "Portal de Saúde",
    area: "Área do paciente",
    footer: "© 2026 Portal do Paciente. Sistema Integrado de Saúde. Todos os direitos reservados.",
    headerStyle: "tabs",
    nav: [
      { to: "/paciente", label: "Início", icon: LayoutDashboard },
      { to: "/paciente/agendar", label: "Agendar consulta", short: "Agendar", icon: CalendarDays },
      { to: "/paciente/notificacoes", label: "Notificações", icon: BellRing },
      { to: "/paciente/perfil", label: "Meu perfil", short: "Perfil", icon: CircleUserRound },
    ],
  },
  professional: {
    role: "professional",
    name: "Profissional",
    title: "Profissional de saúde",
    initials: "PR",
    home: "/profissional",
    search: "Buscar paciente ou atendimento...",
    brand: "Área médica",
    area: "Área médica",
    footer: "© 2026 Gestão de Consultas. Ambiente Seguro & Criptografado.",
    headerStyle: "pills",
    nav: [
      { to: "/profissional", label: "Início", icon: LayoutDashboard },
      { to: "/profissional/agenda", label: "Minha agenda", short: "Agenda", icon: CalendarDays },
      { to: "/profissional/pacientes", label: "Meus pacientes", short: "Pacientes", icon: UsersRound },
      { to: "/profissional/disponibilidade", label: "Meus horários", short: "Horários", icon: Clock3 },
      { to: "/profissional/notificacoes", label: "Notificações", icon: Bell, desktopOnly: true },
      { to: "/profissional/perfil", label: "Meu perfil", short: "Perfil", icon: CircleUserRound },
    ],
  },
  admin: {
    role: "admin",
    name: "Administrador",
    title: "Administrador",
    initials: "AD",
    home: "/administrador",
    search: "Buscar usuário ou indicador...",
    brand: "Clínica integrada",
    area: "Administração • Clínica",
    footer: "© 2026 Gestão de Consultas. Ambiente Seguro & Criptografado.",
    headerStyle: "tabs",
    nav: [
      { to: "/administrador", label: "Visão geral", short: "Visão Geral", mobileTitle: "Overview", icon: LayoutDashboard },
      { to: "/administrador/usuarios", label: "Usuários", icon: UsersRound },
      { to: "/administrador/profissionais", label: "Médicos", icon: Stethoscope },
      { to: "/administrador/especialidades", label: "Especialidades", icon: Tags, desktopOnly: true },
      { to: "/administrador/agendas", label: "Agendas e horários", short: "Agendas", icon: CalendarDays },
      { to: "/administrador/configuracoes", label: "Configurações", short: "Ajustes", icon: Settings },
    ],
  },
};

function inArea(pathname: string, area: string) {
  return pathname === area || pathname.startsWith(`${area}/`);
}

export function roleFromPath(pathname: string): UserRole {
  if (inArea(pathname, "/paciente")) return "patient";
  if (inArea(pathname, "/profissional")) return "professional";
  if (inArea(pathname, "/administrador")) return "admin";
  return "receptionist";
}
