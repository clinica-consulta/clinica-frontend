import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, BriefcaseMedical, CalendarDays, LockKeyhole, LogOut, Search, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";
import logo from "@/assets/gestao-consultas-logo-transparent.png";
import { roleFromPath, roleProfiles, type RoleProfile } from "@/lib/role-data";
import { formatDate, formatLongDate, isoDate } from "@/lib/clinic-data";
import { useClinic } from "@/lib/clinic-store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [loading, setLoading] = useState(false);
  const pathRole = roleFromPath(pathname);
  const { logout, session, hydrated, notificationsFor } = useClinic();
  const navigate = useNavigate();
  const ready = hydrated;
  const role = session?.role ?? pathRole;
  const profile = roleProfiles[role];
  const unread = ready ? notificationsFor(role).some((item) => !item.read) : false;

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

  const current = profile.nav.find((item) => item.to === pathname) ?? profile.nav[0]!;
  const today = ready ? formatLongDate(isoDate(0)).split(",")[0] ?? "" : "";
  const todayLabel = ready ? `${capitalize(today)}, ${formatDate(isoDate(0))}` : "";
  const deep = profile.role === "professional" || profile.role === "admin";
  const notificationsPath = profile.nav.find((item) => item.to.endsWith("notificacoes"))?.to;

  return (
    <div className="app-interface flex min-h-screen flex-col bg-background">
      {loading && <LoadingScreen />}

      {/* Cabeçalho desktop */}
      <header className={`sticky top-0 z-30 hidden text-sidebar-foreground shadow-[0_1px_4px_rgb(0_0_0/4%)] md:block ${profile.role === "admin" ? "bg-header-deep" : "bg-sidebar"}`}>
        <div className={`mx-auto flex max-w-[1280px] flex-col px-8 ${profile.role === "professional" ? "pt-3 pb-3" : "h-28 justify-between pb-1 pt-3"}`}>
          <div className="flex items-center gap-6 lg:gap-11">
            <Link to={profile.home} className="flex shrink-0 items-center gap-5" aria-label="Gestão de Consultas">
              <BrandMark profile={profile} />
              <span className="min-w-0">
                <span className={`block text-[11px] font-bold uppercase leading-4 tracking-[0.55px] ${deep ? "text-mobile-eyebrow" : "text-sidebar-muted"}`}>{profile.brand}</span>
                <span className="block text-base font-bold leading-6 tracking-[-0.4px]">GESTÃO DE CONSULTAS</span>
              </span>
            </Link>

            <label className="relative hidden min-w-0 max-w-[448px] flex-1 lg:block">
              <span className="sr-only">Buscar</span>
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sidebar-muted" />
              <input className="h-[38px] w-full rounded-lg bg-sidebar-accent pl-10 pr-4 text-sm text-sidebar-foreground outline-none placeholder:text-sidebar-muted focus:ring-2 focus:ring-sidebar-ring/40" placeholder={profile.search} />
            </label>

            <div className="ml-auto flex shrink-0 items-center gap-4 lg:gap-6">
              {profile.role === "professional" ? (
                <span className="hidden items-center gap-1.5 rounded-lg bg-sidebar-accent px-3 py-1.5 text-xs font-medium xl:flex"><CalendarDays className="size-3.5" />{todayLabel.replace(",", "")}</span>
              ) : profile.role === "admin" ? (
                <span className="hidden text-[13px] font-medium text-sidebar-muted xl:block">{todayLabel.replace(",", "")}</span>
              ) : (
                <span className="hidden text-right xl:block">
                  <span className="block text-[11px] font-medium leading-[14px] text-sidebar-muted">Data do Sistema</span>
                  <span className="block text-[13px] font-medium leading-[18px]">{todayLabel}</span>
                </span>
              )}
              <NotificationButton to={notificationsPath} unread={unread} boxed={profile.role === "professional"} />
              <UserChip profile={profile} />
              {profile.role === "professional" && <span className="grid size-10 place-items-center rounded-full bg-avatar"><UserRound className="size-4" /></span>}
              <Link to="/" onClick={logout} aria-label="Sair" className="grid size-9 place-items-center rounded-lg text-sidebar-muted transition hover:bg-sidebar-accent hover:text-sidebar-foreground"><LogOut className="size-4" /></Link>
              {profile.role === "admin" && <span className="grid size-10 place-items-center rounded-full bg-avatar"><UserRound className="size-4" /></span>}
            </div>
          </div>

          {profile.role !== "professional" && <DesktopNav profile={profile} />}
        </div>
        {profile.role === "professional" && (
          <div className="bg-header-deep">
            <div className="mx-auto max-w-[1280px] px-8 py-2"><DesktopNav profile={profile} /></div>
          </div>
        )}
      </header>

      {/* Cabeçalho mobile */}
      <header className={`sticky top-0 z-30 flex h-16 items-center gap-3 px-3 text-sidebar-foreground shadow-[0_4px_20px_-2px_rgb(30_46_61/8%)] md:hidden ${deep && profile.role === "admin" ? "bg-header-deep" : "bg-sidebar"}`}>
        {profile.role === "admin" ? (
          <span className="w-1" />
        ) : (
          <Link to={profile.home} aria-label="Gestão de Consultas" className="grid size-11 shrink-0 place-items-center"><img src={logo} alt="" className="size-10 object-contain" /></Link>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[11px] font-bold uppercase leading-4 tracking-[0.88px] text-mobile-eyebrow">
            {profile.role === "admin" && <span className="size-1.5 shrink-0 rounded-full bg-mobile-eyebrow" />}
            {profile.area}
          </p>
          <p className="truncate text-base font-semibold leading-5">{current.mobileTitle ?? current.short ?? current.label}</p>
        </div>
        <NotificationButton to={notificationsPath} unread={false} mobile />
        <Link to="/" onClick={logout} aria-label="Sair" className="grid size-8 shrink-0 place-items-center rounded-full bg-avatar"><UserRound className="size-3.5" /></Link>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-24 pt-5 md:p-8">{children}</main>

      {/* Rodapé desktop */}
      {profile.role === "professional" ? (
        <footer className="hidden border-t border-border bg-card py-6 md:block">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-8 text-[13px] leading-5 text-muted-foreground">
            <span className="flex items-center gap-1.5"><LockKeyhole className="size-3.5" />{profile.footer}</span>
            <div className="flex shrink-0 items-center gap-4">
              <a href="#" className="hover:text-foreground">Privacidade</a>
              <span aria-hidden className="size-1 rounded-full bg-input" />
              <a href="#" className="hover:text-foreground">Termos de Uso</a>
              <span aria-hidden className="size-1 rounded-full bg-input" />
              <a href="#" className="hover:text-foreground">Suporte</a>
            </div>
          </div>
        </footer>
      ) : (
      <footer className="hidden bg-soft py-6 shadow-[0_1px_4px_rgb(0_0_0/4%)] md:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-8 text-[13px] leading-5 text-muted-foreground">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5">{profile.footer}</span>
            {(profile.role === "receptionist") && <span className="flex items-center gap-1.5 font-medium text-success"><LockKeyhole className="size-3.5" />Ambiente Seguro &amp; Criptografado</span>}
          </div>
          <div className="flex shrink-0 items-center gap-6">
            {profile.role === "patient" && <span className="flex items-center gap-1 text-xs font-medium text-success"><ShieldCheck className="size-3.5" />Ambiente Seguro &amp; Criptografado</span>}
            <a href="#" className="hover:text-foreground">Privacidade</a>
            {profile.role !== "patient" && <a href="#" className="hover:text-foreground">Termos de Uso</a>}
            <a href="#" className="hover:text-foreground">Suporte</a>
          </div>
        </div>
      </footer>
      )}

      {/* Navegação inferior mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center bg-card/90 px-1 shadow-[0_-2px_12px_rgb(30_46_61/5%)] backdrop-blur-md md:hidden" aria-label="Navegação principal">
        {profile.nav.filter((item) => !item.desktopOnly).map((item) => (
          <Link key={item.to} to={item.to} activeOptions={{ exact: true }} activeProps={{ className: "bottom-nav-active" }} className="bottom-nav-link">
            <item.icon />
            <span>{item.short ?? item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function DesktopNav({ profile }: { profile: RoleProfile }) {
  const pills = profile.headerStyle === "pills";
  return (
    <nav className="horizontal-nav flex items-center gap-1 overflow-x-auto" aria-label="Navegação principal">
      {profile.nav.map((item) => (
        <Link key={item.to} to={item.to} activeOptions={{ exact: true }} activeProps={{ className: pills ? "nav-pill-active" : "nav-active" }} className={pills ? "nav-link nav-pill" : "nav-link"}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function BrandMark({ profile }: { profile: RoleProfile }) {
  if (profile.role === "professional") return <span className="grid size-10 place-items-center rounded-lg bg-sidebar-accent"><BriefcaseMedical className="size-5" /></span>;
  if (profile.role === "admin") return <span className="grid size-10 place-items-center rounded-lg bg-sidebar-accent"><Stethoscope className="size-5" /></span>;
  return <span className="grid size-10 place-items-center overflow-hidden rounded-lg bg-sidebar-accent"><img src={logo} alt="" className="size-9 object-contain" /></span>;
}

function NotificationButton({ to, unread, boxed, mobile }: { to?: string | undefined; unread: boolean; boxed?: boolean; mobile?: boolean }) {
  const className = `relative grid shrink-0 place-items-center text-sidebar-foreground transition hover:bg-sidebar-accent ${mobile ? "size-11 rounded-full" : boxed ? "size-9 rounded-lg bg-sidebar-accent" : "size-9 rounded-lg"}`;
  const content = <><Bell className="size-[18px]" />{unread && <span className={`absolute right-1.5 top-1.5 size-2 rounded-full ${boxed ? "bg-mobile-eyebrow" : "bg-destructive"}`} />}</>;
  return to ? <Link to={to} aria-label="Notificações" className={className}>{content}</Link> : <button type="button" aria-label="Notificações" className={className}>{content}</button>;
}

function UserChip({ profile }: { profile: RoleProfile }) {
  if (profile.role === "professional" || profile.role === "admin") {
    return (
      <span className={`flex items-center gap-2 ${profile.role === "professional" ? "rounded-full bg-sidebar-accent py-1 pl-1 pr-3" : ""}`}>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success-soft text-xs font-bold text-success-strong">{profile.initials}</span>
        <span className="hidden min-w-0 xl:block">
          <span className="block max-w-40 truncate text-sm font-semibold leading-4">{profile.name}</span>
          <span className="block text-[11px] leading-[14px] text-sidebar-muted">{profile.title}</span>
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 pl-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-avatar"><UserRound className="size-3.5" /></span>
      <span className="hidden min-w-0 xl:block">
        <span className="block max-w-40 truncate text-[13px] font-bold leading-4">{profile.name}</span>
        <span className="block text-[11px] font-medium leading-[14px] text-sidebar-muted">{profile.title}</span>
      </span>
    </span>
  );
}

function capitalize(value: string) {
  return value.replace(/(^|-)(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}
