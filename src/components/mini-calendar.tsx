import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isoDate } from "@/lib/clinic-data";

const weekLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Mini calendário: destaca dias com horários livres (slotsFor > 0). */
export function MiniCalendar({ value, onChange, slotsFor }: { value: string; onChange: (date: string) => void; slotsFor: (date: string) => number }) {
  const [month, setMonth] = useState(() => { const d = new Date(`${value}T12:00:00`); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = isoDate(0);
  const first = month.getDay();
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => toIso(new Date(month.getFullYear(), month.getMonth(), i + 1)))];

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></Button>
        <b className="text-xs capitalize sm:text-sm">{monthFmt.format(month)}</b>
        <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">{weekLabels.map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <span key={i} />;
          const past = date < today;
          const free = past ? 0 : slotsFor(date);
          const selected = date === value;
          return (
            <button type="button" key={date} disabled={past} onClick={() => onChange(date)} title={past ? "" : `${free} horário(s) livre(s)`}
              className={`relative grid aspect-square place-items-center rounded-md text-xs transition-colors disabled:opacity-35 ${selected ? "bg-primary font-bold text-primary-foreground" : free ? "bg-success-soft font-semibold text-foreground" : "text-muted-foreground"}`}>
              {Number(date.slice(8))}
              {!selected && free > 0 && <span className="absolute bottom-0.5 size-1 rounded-full bg-success" />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="size-2 rounded-full bg-success" />Dias com horários disponíveis</p>
    </div>
  );
}

export function SlotPicker({ slots, value, onChange }: { slots: string[]; value?: string; onChange?: (slot: string) => void }) {
  return <div className="flex flex-wrap gap-1.5">{slots.map((slot) => <button type="button" key={slot} onClick={() => onChange?.(slot)} className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${slot === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>{slot}</button>)}</div>;
}
