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
export function MiniCalendar({ value, onChange, slotsFor, legend = false }: { value: string; onChange: (date: string) => void; slotsFor: (date: string) => number; legend?: boolean }) {
  const [month, setMonth] = useState(() => { const d = new Date(`${value}T12:00:00`); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = isoDate(0);
  const first = month.getDay();
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const prevTotal = new Date(month.getFullYear(), month.getMonth(), 0).getDate();
  const leading = Array.from({ length: first }, (_, i) => prevTotal - first + i + 1);
  const days = Array.from({ length: total }, (_, i) => toIso(new Date(month.getFullYear(), month.getMonth(), i + 1)));

  return (
    <div className="rounded-xl bg-soft p-4 md:bg-soft/50">
      <div className="mb-3 flex items-center justify-between px-1">
        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></Button>
        <b className="text-sm font-bold leading-5 [text-transform:capitalize]">{monthFmt.format(month).replace(" de ", " De ")}</b>
        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold leading-[14px] text-muted-foreground/80">{weekLabels.map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className="mt-3 grid grid-cols-7 justify-items-center gap-1">
        {leading.map((day) => <span key={`p${day}`} className="grid size-8 place-items-center text-[13px] font-semibold text-input/60">{day}</span>)}
        {days.map((date) => {
          const past = date < today;
          const free = past ? 0 : slotsFor(date);
          const selected = date === value;
          return (
            <button type="button" key={date} disabled={past || (!free && !selected)} onClick={() => onChange(date)} title={past ? "" : `${free} horário(s) livre(s)`}
              className={`relative grid size-8 place-items-center rounded-lg text-[13px] leading-[18px] transition-colors md:size-8 ${selected ? "bg-strong font-bold text-strong-foreground shadow-[0_1px_1px_rgb(0_0_0/5%)]" : free ? "bg-success-soft font-semibold text-foreground hover:bg-accent md:bg-transparent" : "font-semibold text-muted-foreground/50"}`}>
              {Number(date.slice(8))}
              {free > 0 && <span className={`absolute bottom-0.5 size-1 rounded-full ${selected ? "bg-strong-foreground" : "bg-success"}`} />}
            </button>
          );
        })}
      </div>
      {legend && <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="size-2 rounded-full bg-success" />Dias com horários disponíveis</p>}
    </div>
  );
}

export function SlotPicker({ slots, value, onChange }: { slots: string[]; value?: string; onChange?: (slot: string) => void }) {
  return <div className="grid grid-cols-4 gap-2 md:flex md:flex-wrap">{slots.map((slot) => <button type="button" key={slot} onClick={() => onChange?.(slot)} className={`rounded-lg px-2 py-2 text-sm font-semibold leading-5 transition-colors md:px-4 ${slot === value ? "bg-strong text-strong-foreground shadow-[0_1px_1px_rgb(0_0_0/5%)]" : "bg-accent/70 text-foreground hover:bg-accent md:bg-soft"}`}>{slot}</button>)}</div>;
}
