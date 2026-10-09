import { type ReactNode } from "react";
import { CalendarPlus, Download, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ eyebrow, title, description, action, onAction, uppercase = false, aside, actionIcon, mobileDescription }: { eyebrow?: string; title: string; description: string; action?: string; onAction?: () => void; uppercase?: boolean; aside?: ReactNode; actionIcon?: ReactNode; mobileDescription?: string }) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 hidden text-[11px] font-bold uppercase leading-4 tracking-[1.1px] text-muted-foreground md:block">{eyebrow}</p>}
        <div className="flex items-center justify-between gap-3">
          <h1 className={`text-[26px] font-bold leading-8 tracking-[-0.8px] text-foreground md:text-[32px] md:leading-10 ${uppercase ? "md:uppercase" : ""}`}>{title}</h1>
          {action && <Button onClick={onAction} className="h-9 shrink-0 rounded-lg px-3 text-sm font-semibold md:hidden">{actionIcon ?? <Plus />}{action}</Button>}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-5 text-muted-foreground md:mt-0.5">{mobileDescription ? <><span className="md:hidden">{mobileDescription}</span><span className="hidden md:inline">{description}</span></> : description}</p>
      </div>
      {aside}
      {action && <Button onClick={onAction} className="hidden h-10 rounded-lg px-5 text-sm font-semibold shadow-[0_1px_1px_rgb(0_0_0/5%)] md:inline-flex">{actionIcon ?? <Plus />}{action}</Button>}
    </header>
  );
}

export function Toolbar({ placeholder = "Buscar...", value, onChange, exportAction, filter }: { placeholder?: string; value?: string; onChange?: (value: string) => void; exportAction?: () => void; filter?: ReactNode }) {
  return <div className="mb-4 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] md:mb-6"><SearchInput placeholder={placeholder} value={value} onChange={onChange} />{filter}{exportAction && <Button variant="outline" onClick={exportAction}><Download />Exportar</Button>}</div>;
}

export function SearchInput({ placeholder = "Buscar...", value, onChange, className = "" }: { placeholder?: string; value?: string | undefined; onChange?: ((value: string) => void) | undefined; className?: string }) {
  return <label className={`relative min-w-0 ${className}`}><span className="sr-only">Buscar</span><Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" /><input value={value ?? ""} onChange={(event) => onChange?.(event.target.value)} className="h-11 w-full rounded-lg bg-card pl-11 pr-4 text-sm shadow-[0_1px_2px_rgb(0_0_0/6%)] outline-none ring-1 ring-border/50 placeholder:text-muted-foreground focus:ring-ring" placeholder={placeholder} /></label>;
}

export function StatCard({ label, value, detail, icon, tone = "primary" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: "primary" | "info" | "success" | "warning" }) {
  return <article className="metric-card"><div className={`metric-icon ${{ primary: "metric-primary", info: "metric-info", success: "metric-success", warning: "metric-warning" }[tone]}`}>{icon}</div><div className="min-w-0"><p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">{label}</p><p className="mt-0.5 text-[32px] font-bold leading-10 text-foreground">{value}</p><p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{detail}</p></div></article>;
}

export function Section({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`surface min-w-0 p-4 md:p-6 ${className}`}><div className="flex min-w-0 items-center justify-between gap-2 pb-4"><h2 className="truncate text-[11px] font-bold uppercase leading-4 tracking-[0.55px] text-muted-foreground">{title}</h2>{action}</div><div>{children}</div></section>;
}

export function StatusBadge({ status }: { status: string }) {
  const type =
    status === "Confirmada" || status === "Realizada" || status === "Ativo" ? "success"
    : status === "Agendada" || status === "Aguardando" || status === "Pendente" ? "info"
    : status === "Alta" ? "warning"
    : status === "Não compareceu" ? "danger"
    : status === "Cancelada" || status === "Inativo" ? "muted"
    : "info";
  const tone = { success: "status-success", info: "status-info", warning: "status-warning", danger: "status-danger", muted: "status-muted" }[type];
  return <span className={`status ${tone}`}><span className="size-2 shrink-0 rounded-full bg-current" />{status}</span>;
}

export function EmptyHint({ children }: { children: ReactNode }) { return <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground sm:text-sm">{children}</div>; }

const fieldLabel = "grid min-w-0 gap-1.5 text-xs font-medium leading-4 text-muted-foreground md:text-[13px] md:font-semibold md:leading-[18px] md:text-foreground";
const fieldControl = "h-10 min-w-0 rounded-lg bg-card px-3.5 text-sm font-normal text-foreground shadow-[0_1px_2px_rgb(0_0_0/6%)] outline-none ring-1 ring-border/60 focus:ring-ring disabled:bg-muted";

export function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={`${fieldLabel} ${className}`}>{label}<input {...props} className={fieldControl} /></label>;
}

export function SelectField({ label, options, className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { value: string; label: string }[] }) {
  return <label className={`${fieldLabel} ${className}`}>{label}<select {...props} className={fieldControl}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function TextareaField({ label, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className={`${fieldLabel} ${className}`}>{label}<textarea {...props} className={`${fieldControl} h-auto min-h-20 py-2.5`} /></label>;
}

export function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-3"><span><b className="block text-sm">{label}</b><span className="text-xs text-muted-foreground">{description}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-primary" /></label>;
}

export function Modal({ open, title, description, onClose, children }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-overlay p-4">
      <button aria-label="Fechar" className="absolute inset-0" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-card p-5 shadow-[0_20px_50px_-12px_rgb(11_28_48/25%)] md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div><h2 className="text-lg font-bold leading-6">{title}</h2>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar"><X /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export { CalendarPlus };
