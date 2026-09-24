import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import logo from "@/assets/gestao-consultas-logo-transparent.png";
import { roleFromPath, roleProfiles } from "@/lib/role-data";
import { formatDate, formatLongDate, isoDate } from "@/lib/clinic-data";
import { useClinic } from "@/lib/clinic-store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [loading, setLoading] = useState(false);
  const pathRole = roleFromPath(pathname);
  const { logout, notificationsFor, session, hydrated } = useClinic();
  const navigate = useNavigate();
  const ready = hydrated;
  const role = session?.role ?? pathRole;
  const profile = roleProfiles[role];
  const unread = notificationsFor(role).filter((item) => !item.read).length;


  useEffect(() => {
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
    <div className="app-interface min-h-screen bg-background">
      {loading && <LoadingScreen />}
      <header className="sticky top-0 z-30 bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-3 sm:px-5 lg:px-6">
          <Link to={profile.home} className="flex shrink-0 items-center gap-2.5" aria-label="Gestão de Consultas">
            <span className="grid size-9 shrink-0 place-items-center"><img src={logo} alt="" className="size-8 object-contain" /></span>
            <span className="hidden min-w-0 sm:block"><span className="block truncate font-display text-sm font-semibold uppercase">Gestão de</span><span className="block truncate text-[9px] font-semibold uppercase tracking-widest text-sidebar-muted">Consultas</span></span>
          </Link>

          <div className="relative ml-auto hidden w-full max-w-xs lg:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sidebar-muted" /><input className="h-9 w-full rounded-md border border-sidebar-border bg-sidebar-accent pl-9 pr-3 text-xs text-sidebar-foreground placeholder:text-sidebar-muted outline-none focus:border-sidebar-ring focus:ring-2 focus:ring-sidebar-ring/20" placeholder={profile.search} /></div>

          <div className="ml-auto flex min-w-0 items-center gap-1.5 lg:ml-0">
            <span className="hidden text-right xl:block"><span className="block text-[10px] capitalize text-sidebar-muted">{ready ? formatLongDate(isoDate(0)).split(",")[0] : ""}</span><span className="block text-xs font-semibold">{ready ? formatDate(isoDate(0)) : ""}</span></span>
            <Button variant="ghost" size="icon" className="relative text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Notificações"><Bell />{unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-warning ring-2 ring-sidebar" />}</Button>
            <div className="hidden min-w-0 items-center gap-2 border-l border-sidebar-border pl-3 md:flex">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">{profile.initials}</span>
              <span className="hidden min-w-0 xl:block"><span className="block max-w-36 truncate text-xs font-semibold">{profile.name}</span><span className="block max-w-36 truncate text-[10px] text-sidebar-muted">{profile.title}</span></span>
            </div>
            <Button variant="ghost" size="icon" className="text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground" asChild><Link to="/" onClick={logout} aria-label="Sair"><LogOut /></Link></Button>
          </div>
        </div>

        <nav className="border-t border-sidebar-border" aria-label="Navegação principal">
          <div className="horizontal-nav mx-auto flex max-w-[1440px] items-stretch overflow-x-auto px-2 sm:px-4 lg:px-5">
            {profile.nav.map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: true }} activeProps={{ className: "nav-active" }} className="nav-link"><item.icon className="size-4 shrink-0" /><span>{item.label}</span></Link>)}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[1440px] p-3 sm:p-5 lg:p-6">{children}</main>
    </div>
  );
}
