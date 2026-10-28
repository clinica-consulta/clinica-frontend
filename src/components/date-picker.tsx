import { SiteSelect } from "@/components/site-select";
import { useState, type ReactNode } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isoDate } from "@/lib/clinic-data";

const weekLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatIso(value: string) {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

type DatePickerProps = {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  name?: string | undefined;
  min?: string | undefined;
  max?: string | undefined;
  required?: boolean | undefined;
  clearable?: boolean | undefined;
  placeholder?: string | undefined;
  /** Classe do botão padrão (quando não há `children`). */
  className?: string | undefined;
  /** Gatilho personalizado; recebe a data formatada. */
  children?: ((label: string) => ReactNode) | undefined;
  "aria-label"?: string | undefined;
};

/** Seletor de data no estilo do site, no lugar do calendário nativo do navegador. */
export function DatePicker({ value, defaultValue, onChange, name, min, max, required, clearable = !required, placeholder = "dd/mm/aaaa", className, children, "aria-label": ariaLabel }: DatePickerProps) {
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = value ?? inner;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => monthStart(current || isoDate(0)));

  const pick = (next: string) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
    setOpen(false);
  };
  const toggle = (next: boolean) => {
    if (next) setMonth(monthStart(current || isoDate(0)));
    setOpen(next);
  };

  const label = formatIso(current);
  const trigger = children ? children(label) : (
    <span className={className ?? "flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-card px-3.5 text-left text-sm font-normal text-foreground shadow-[0_1px_2px_rgb(0_0_0/6%)] ring-1 ring-border/60"}>
      <span className={label ? "" : "text-subtle-foreground"}>{label || placeholder}</span>
      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
    </span>
  );

  return (
    <Popover open={open} onOpenChange={toggle}>
      <span className="relative block min-w-0">
        <PopoverTrigger asChild>
          <button type="button" aria-label={ariaLabel ?? (label ? `Data: ${label}` : "Escolher data")} className="block w-full min-w-0 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">{trigger}</button>
        </PopoverTrigger>
        {name !== undefined && (
          <input tabIndex={-1} aria-hidden name={name} value={current} required={required} onChange={() => undefined} className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0" />
        )}
      </span>
      <PopoverContent align="start" className="z-[70] w-[300px] rounded-xl border-0 bg-card p-4 shadow-[0_20px_50px_-12px_rgb(11_28_48/30%)] ring-1 ring-border">
        <Calendar month={month} setMonth={setMonth} value={current} min={min} max={max} onPick={pick} />
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          {clearable ? <button type="button" onClick={() => pick("")} className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition hover:bg-soft hover:text-foreground">Limpar</button> : <span />}
          <button type="button" disabled={!inRange(isoDate(0), min, max)} onClick={() => pick(isoDate(0))} className="rounded-lg bg-strong px-3.5 py-1.5 text-[13px] font-semibold text-strong-foreground transition hover:opacity-90 disabled:opacity-40">Hoje</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function monthStart(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function inRange(date: string, min?: string, max?: string) {
  return (!min || date >= min) && (!max || date <= max);
}

function Calendar({ month, setMonth, value, min, max, onPick }: { month: Date; setMonth: (d: Date) => void; value: string; min?: string | undefined; max?: string | undefined; onPick: (iso: string) => void }) {
  const today = isoDate(0);
  const year = month.getFullYear();
  const first = month.getDay();
  const total = new Date(year, month.getMonth() + 1, 0).getDate();
  const prevTotal = new Date(year, month.getMonth(), 0).getDate();
  const cells = [
    ...Array.from({ length: first }, (_, i) => ({ iso: toIso(new Date(year, month.getMonth() - 1, prevTotal - first + i + 1)), outside: true })),
    ...Array.from({ length: total }, (_, i) => ({ iso: toIso(new Date(year, month.getMonth(), i + 1)), outside: false })),
  ];
  while (cells.length % 7) cells.push({ iso: toIso(new Date(year, month.getMonth() + 1, cells.length - first - total + 1)), outside: true });
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 111 }, (_, i) => thisYear + 5 - i);
  const go = (delta: number) => setMonth(new Date(year, month.getMonth() + delta, 1));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-1">
        <button type="button" aria-label="Mês anterior" onClick={() => go(-1)} className="grid size-8 place-items-center rounded-lg transition hover:bg-soft"><ChevronLeft className="size-4" /></button>
        <div className="flex items-center gap-1">
          <SiteSelect aria-label="Mês" value={month.getMonth()} onChange={(event) => setMonth(new Date(year, Number(event.target.value), 1))} className="h-8 cursor-pointer rounded-lg bg-transparent px-1.5 text-sm font-bold outline-none transition hover:bg-soft">
            {monthNames.map((item, index) => <option key={item} value={index}>{item}</option>)}
          </SiteSelect>
          <SiteSelect aria-label="Ano" value={year} onChange={(event) => setMonth(new Date(Number(event.target.value), month.getMonth(), 1))} className="h-8 cursor-pointer rounded-lg bg-transparent px-1.5 text-sm font-bold outline-none transition hover:bg-soft">
            {(years.includes(year) ? years : [year, ...years]).map((item) => <option key={item} value={item}>{item}</option>)}
          </SiteSelect>
        </div>
        <button type="button" aria-label="Próximo mês" onClick={() => go(1)} className="grid size-8 place-items-center rounded-lg transition hover:bg-soft"><ChevronRight className="size-4" /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-bold leading-6 text-subtle-foreground">{weekLabels.map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 justify-items-center gap-y-1">
        {cells.map(({ iso, outside }) => {
          const selected = iso === value;
          const disabled = !inRange(iso, min, max);
          return (
            <button type="button" key={iso} disabled={disabled} onClick={() => onPick(iso)}
              className={`grid size-9 place-items-center rounded-lg text-[13px] font-semibold transition ${selected ? "bg-strong text-strong-foreground shadow-[0_1px_2px_rgb(0_0_0/10%)]" : iso === today ? "bg-success-soft text-success-strong hover:bg-accent" : outside ? "text-input hover:bg-soft" : "text-foreground hover:bg-soft"} disabled:cursor-not-allowed disabled:bg-transparent disabled:text-input/60`}>
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
