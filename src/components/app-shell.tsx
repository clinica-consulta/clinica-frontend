import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, CalendarDays, CalendarRange, ChartNoAxesCombined, ChevronLeft, ClipboardCheck, LayoutDashboard, Menu, Search, Settings, Stethoscope, UserRound, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import logo from "@/assets/gestao-consultas-logo-transparent.png";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/consultas", label: "Consultas", icon: CalendarRange },
  { to: "/pacientes", label: "Pacientes", icon: UsersRound },
  { to: "/fila-espera", label: "Fila de espera", icon: ClipboardCheck },
  { to: "/check-in", label: "Check-in", icon: UserRound },
  { to: "/profissionais", label: "Profissionais", icon: Stethoscope },
  { to: "/relatorios", label: "Relatórios", icon: ChartNoAxesCombined },
  { to: "/perfil", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (pathname === "/") return <>{children}{loading && <LoadingScreen />}</>;

  return (
    <div className="min-h-screen bg-background lg:grid" style={{ gridTemplateColumns: collapsed ? "76px minmax(0,1fr)" : "260px minmax(0,1fr)" }}>
      {loading && <LoadingScreen />}
      {mobileOpen && <button aria-label="Fechar menu" className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-sidebar-border px-4">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-3" aria-label="Gestão de Consultas">
             <span className="grid size-11 shrink-0 place-items-center"><img src={logo} alt="" className="size-10 object-contain" /></span>
            {!collapsed && <span className="min-w-0"><span className="block truncate font-display text-lg uppercase">Gestão de</span><span className="block truncate text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">Consultas</span></span>}
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X /></Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navegação principal">
          {!collapsed && <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">Menu principal</p>}
          {nav.map((item) => <Link key={item.to} to={item.to} activeProps={{ className: "nav-active" }} className="nav-link" title={collapsed ? item.label : undefined}><item.icon className="size-5 shrink-0" /><span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span></Link>)}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md bg-sidebar-accent p-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">RC</span>
            {!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Rafaela Costa</p><p className="truncate text-xs text-sidebar-muted">Recepcionista</p></div>}
          </div>
          <Button variant="ghost" size="icon" className="mt-2 hidden w-full lg:inline-flex" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}><ChevronLeft className={`transition-transform ${collapsed ? "rotate-180" : ""}`} /></Button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu /></Button>
          <div className="relative hidden max-w-sm sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="h-10 w-full rounded-md border border-input bg-muted/60 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Buscar paciente ou consulta..." /></div>
          <span className="sm:hidden" />
          <div className="flex items-center justify-end gap-2"><span className="hidden text-right md:block"><span className="block text-xs text-muted-foreground">Terça-feira</span><span className="block text-sm font-semibold">15 de setembro</span></span><Button variant="ghost" size="icon" className="relative" aria-label="Notificações"><Bell /><span className="absolute right-2 top-2 size-2 rounded-full bg-warning ring-2 ring-card" /></Button></div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
