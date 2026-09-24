import { type ReactNode } from "react";
import { CalendarPlus, Download, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ eyebrow, title, description, action, onAction }: { eyebrow?: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return <header className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div className="min-w-0">{eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}<h1 className="font-display text-2xl uppercase text-foreground sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">{description}</p></div>{action && <Button onClick={onAction} className="w-full sm:w-auto"><Plus />{action}</Button>}</header>;
}

export function Toolbar({ placeholder = "Buscar...", value, onChange, exportAction, filter }: { placeholder?: string; value?: string; onChange?: (value: string) => void; exportAction?: () => void; filter?: ReactNode }) {
  return <div className="mb-4 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><label className="relative min-w-0"><span className="sr-only">Buscar</span><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><input value={value ?? ""} onChange={(event) => onChange?.(event.target.value)} className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 sm:text-sm" placeholder={placeholder} /></label>{filter}{exportAction && <Button variant="outline" onClick={exportAction}><Download />Exportar</Button>}</div>;
}

export function StatCard({ label, value, detail, icon, tone = "primary" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: "primary" | "info" | "success" | "warning" }) {
  return <article className="metric-card"><div className={`metric-icon metric-${tone}`}>{icon}</div><div className="min-w-0"><p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">{label}</p><p className="mt-0.5 font-display text-2xl text-foreground">{value}</p><p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{detail}</p></div></article>;
}

export function Section({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`surface min-w-0 ${className}`}><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3.5 py-3 sm:px-4"><h2 className="truncate font-display text-base uppercase">{title}</h2>{action}</div><div className="p-3.5 sm:p-4">{children}</div></section>;
}

export function StatusBadge({ status }: { status: string }) {
  const type =
    status === "Confirmada" || status === "Realizada" || status === "Ativo" ? "success"
    : status === "Agendada" || status === "Alta" || status === "Aguardando" || status === "Pendente" || status === "Não compareceu" ? "warning"
    : status === "Cancelada" || status === "Inativo" ? "muted"
    : "info";
  return <span className={`status status-${type}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

export function EmptyHint({ children }: { children: ReactNode }) { return <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground sm:text-sm">{children}</div>; }

export function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={`grid min-w-0 gap-1 text-xs font-medium sm:text-sm ${className}`}>{label}<input {...props} className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:bg-muted sm:text-sm" /></label>;
}

export function SelectField({ label, options, className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { value: string; label: string }[] }) {
  return <label className={`grid min-w-0 gap-1 text-xs font-medium sm:text-sm ${className}`}>{label}<select {...props} className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:bg-muted sm:text-sm">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function TextareaField({ label, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className={`grid min-w-0 gap-1 text-xs font-medium sm:text-sm ${className}`}>{label}<textarea {...props} className="min-h-16 min-w-0 rounded-md border border-input bg-background p-2.5 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 sm:text-sm" /></label>;
}

export function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-3"><span><b className="block text-sm">{label}</b><span className="text-xs text-muted-foreground">{description}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-primary" /></label>;
}

export function Modal({ open, title, description, onClose, children }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-overlay p-4">
      <button aria-label="Fechar" className="absolute inset-0" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div><h2 className="font-display text-lg uppercase">{title}</h2>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar"><X /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export { CalendarPlus };
