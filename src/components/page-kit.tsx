import { type ReactNode } from "react";
import { CalendarPlus, Download, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ eyebrow, title, description, action, onAction }: { eyebrow?: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return <header className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div className="min-w-0">{eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}<h1 className="font-display text-3xl uppercase text-foreground sm:text-4xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{action && <Button onClick={onAction} className="w-full sm:w-auto"><Plus />{action}</Button>}</header>;
}

export function Toolbar({ placeholder = "Buscar...", value, onChange, exportAction, filter }: { placeholder?: string; value?: string; onChange?: (value: string) => void; exportAction?: () => void; filter?: ReactNode }) {
  return <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><label className="relative"><span className="sr-only">Buscar</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={value ?? ""} onChange={(event) => onChange?.(event.target.value)} className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder={placeholder} /></label>{filter}{exportAction && <Button variant="outline" onClick={exportAction}><Download />Exportar</Button>}</div>;
}

export function StatCard({ label, value, detail, icon, tone = "primary" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: "primary" | "info" | "success" | "warning" }) {
  return <article className="metric-card"><div className={`metric-icon metric-${tone}`}>{icon}</div><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></article>;
}

export function Section({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`surface ${className}`}><div className="flex min-w-0 items-center justify-between gap-3 border-b border-border px-5 py-4"><h2 className="truncate font-display text-lg uppercase">{title}</h2>{action}</div><div className="p-5">{children}</div></section>;
}

export function StatusBadge({ status }: { status: string }) {
  const type =
    status === "Confirmada" || status === "Concluída" || status === "Ativo" ? "success"
    : status === "Pendente" || status === "Alta" || status === "Aguardando" || status === "Falta" ? "warning"
    : status === "Cancelada" || status === "Inativo" ? "muted"
    : "info";
  return <span className={`status status-${type}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

export function EmptyHint({ children }: { children: ReactNode }) { return <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">{children}</div>; }

export function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={`grid gap-1.5 text-sm font-medium ${className}`}>{label}<input {...props} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:bg-muted" /></label>;
}

export function SelectField({ label, options, className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { value: string; label: string }[] }) {
  return <label className={`grid gap-1.5 text-sm font-medium ${className}`}>{label}<select {...props} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:bg-muted">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function TextareaField({ label, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className={`grid gap-1.5 text-sm font-medium ${className}`}>{label}<textarea {...props} className="min-h-20 rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" /></label>;
}

export function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-3"><span><b className="block text-sm">{label}</b><span className="text-xs text-muted-foreground">{description}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-primary" /></label>;
}

export function Modal({ open, title, description, onClose, children }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-overlay p-4">
      <button aria-label="Fechar" className="absolute inset-0" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-lg">
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
