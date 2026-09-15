import { type ReactNode } from "react";
import { CalendarPlus, Download, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ eyebrow, title, description, action, onAction }: { eyebrow?: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return <header className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div className="min-w-0">{eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}<h1 className="font-display text-3xl uppercase text-foreground sm:text-4xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{action && <Button onClick={onAction} className="w-full sm:w-auto"><Plus />{action}</Button>}</header>;
}

export function Toolbar({ placeholder = "Buscar...", exportAction }: { placeholder?: string; exportAction?: () => void }) {
  return <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><label className="relative"><span className="sr-only">Buscar</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder={placeholder} /></label><Button variant="outline"><Filter />Filtros</Button>{exportAction && <Button variant="outline" onClick={exportAction}><Download />Exportar</Button>}</div>;
}

export function StatCard({ label, value, detail, icon, tone = "primary" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: "primary" | "info" | "success" | "warning" }) {
  return <article className="metric-card"><div className={`metric-icon metric-${tone}`}>{icon}</div><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></article>;
}

export function Section({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`surface ${className}`}><div className="flex min-w-0 items-center justify-between gap-3 border-b border-border px-5 py-4"><h2 className="truncate font-display text-lg uppercase">{title}</h2>{action}</div><div className="p-5">{children}</div></section>;
}

export function StatusBadge({ status }: { status: string }) {
  const type = status === "Confirmada" || status === "Concluída" || status === "Ativo" ? "success" : status === "Pendente" || status === "Alta" ? "warning" : status === "Cancelada" || status === "Inativo" ? "muted" : "info";
  return <span className={`status status-${type}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

export function EmptyHint({ children }: { children: ReactNode }) { return <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">{children}</div>; }
export { CalendarPlus };
