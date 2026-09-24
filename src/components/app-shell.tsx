import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, ChevronLeft, LogOut, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import logo from "@/assets/gestao-consultas-logo-transparent.png";
import { roleFromPath, roleProfiles } from "@/lib/role-data";
import { formatDate, formatLongDate, isoDate } from "@/lib/clinic-data";
import { useClinic } from "@/lib/clinic-store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathRole = roleFromPath(pathname);
  const { logout, notificationsFor, session, hydrated } = useClinic();
  const navigate = useNavigate();
  const ready = hydrated;
  const role = session?.role ?? pathRole;
  const profile = roleProfiles[role];
  const unread = notificationsFor(role).filter((item) => !item.read).length;


  useEffect(() => {
    setMobileOpen(false);
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // RN01/RN08 + RNF05: cada perfil só acessa a própria área.
  useEffect(() => {
    if (!ready || pathname === "/") return;
    if (!session) {
      navigate({ to: "/" });
      return;
    }
    if (session.role !== pathRole) navigate({ to: roleProfiles[session.role].home });
  }, [ready, pathname, pathRole, session, navigate]);

  if (pathname === "/") return <>{children}{loading && <LoadingScreen />}</>;
  if (ready && (!session || session.role !== pathRole)) return <LoadingScreen />;

  return (
    <div className="app-interface min-h-screen bg-background lg:grid" style={{ gridTemplateColumns: collapsed ? "68px minmax(0,1fr)" : "236px minmax(0,1fr)" }}>
      {loading && <LoadingScreen />}
      {mobileOpen && <button aria-label="Fechar menu" className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-auto ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-sidebar-border px-3">
          <Link to={profile.home} className="flex min-w-0 items-center gap-3" aria-label="Gestão de Consultas">
             <span className="grid size-9 shrink-0 place-items-center"><img src={logo} alt="" className="size-8 object-contain" /></span>
             {!collapsed && <span className="min-w-0"><span className="block truncate font-display text-base uppercase">Gestão de</span><span className="block truncate text-[9px] font-semibold uppercase tracking-widest text-sidebar-muted">Consultas</span></span>}
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X /></Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2.5" aria-label="Navegação principal">
          {!collapsed && <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">Menu principal</p>}
          {profile.nav.map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: true }} activeProps={{ className: "nav-active" }} className="nav-link" title={collapsed ? item.label : undefined}><item.icon className="size-5 shrink-0" /><span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span></Link>)}
        </nav>
        <div className="border-t border-sidebar-border p-2.5">
          <div className="flex items-center gap-3 rounded-md bg-sidebar-accent p-2.5">
             <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">{profile.initials}</span>
             {!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{profile.name}</p><p className="truncate text-xs text-sidebar-muted">{profile.title}</p></div>}
          </div>
           {!collapsed && <Button variant="ghost" className="mt-2 w-full justify-start text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground" asChild><Link to="/" onClick={logout}><LogOut />Sair</Link></Button>}
          <Button variant="ghost" size="icon" className="mt-2 hidden w-full lg:inline-flex" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}><ChevronLeft className={`transition-transform ${collapsed ? "rotate-180" : ""}`} /></Button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur-md sm:px-5">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu /></Button>
          <div className="relative hidden max-w-sm sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="h-10 w-full rounded-md border border-input bg-muted/60 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder={profile.search} /></div>
          <span className="sm:hidden" />
          <div className="flex items-center justify-end gap-2"><span className="hidden text-right md:block"><span className="block text-xs capitalize text-muted-foreground">{ready ? formatLongDate(isoDate(0)).split(",")[0] : ""}</span><span className="block text-sm font-semibold">{ready ? formatDate(isoDate(0)) : ""}</span></span><Button variant="ghost" size="icon" className="relative" aria-label="Notificações"><Bell />{unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-warning ring-2 ring-card" />}</Button></div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-3 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
