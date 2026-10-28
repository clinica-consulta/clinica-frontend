import { Children, isValidElement, useRef, useState, type ChangeEvent, type ReactElement, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type OptionItem = { value: string; label: ReactNode; text: string; disabled: boolean };

type SiteSelectProps = {
  value?: string | number | readonly string[] | undefined;
  defaultValue?: string | number | readonly string[] | undefined;
  onChange?: ((event: ChangeEvent<HTMLSelectElement>) => void) | undefined;
  name?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
  id?: string | undefined;
  "aria-label"?: string | undefined;
  /** Mostra a seta; desligue quando o layout já tem um ícone próprio. */
  chevron?: boolean | undefined;
  children?: ReactNode;
};

function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function collect(children: ReactNode, out: OptionItem[] = []) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>;
    if (element.type === "option") {
      const text = textOf(element.props.children);
      out.push({ value: String(element.props.value ?? text), label: element.props.children, text, disabled: Boolean(element.props.disabled) });
    } else if (element.props.children) collect(element.props.children, out);
  });
  return out;
}

/** Substitui o <select> nativo por uma lista no estilo do site. Mesma API do select (value, onChange, name...). */
export function SiteSelect({ value, defaultValue, onChange, name, required, disabled, className = "", id, "aria-label": ariaLabel, chevron = true, children }: SiteSelectProps) {
  const options = collect(children);
  const [inner, setInner] = useState(() => String(defaultValue ?? options[0]?.value ?? ""));
  const current = value !== undefined ? String(value) : inner;
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const selected = options.find((item) => item.value === current);

  const pick = (next: string) => {
    setOpen(false);
    if (next === current) return;
    if (value === undefined) setInner(next);
    onChange?.({ target: { value: next, name }, currentTarget: { value: next, name } } as unknown as ChangeEvent<HTMLSelectElement>);
  };

  const focusItem = (delta: number) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    if (!items.length) return;
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(index + delta + items.length) % items.length]?.focus();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" id={id} disabled={disabled} aria-label={ariaLabel} aria-haspopup="listbox"
          className={`flex min-w-0 cursor-pointer items-center justify-between gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${className}`}>
          <span className="min-w-0 truncate">{selected?.label ?? ""}</span>
          {chevron && <ChevronDown className={`size-4 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} />}
        </button>
      </PopoverTrigger>
      {name !== undefined && <input tabIndex={-1} aria-hidden name={name} value={current} required={required} onChange={() => undefined} className="pointer-events-none absolute h-px w-px opacity-0" />}
      <PopoverContent align="start" sideOffset={6}
        onOpenAutoFocus={(event) => { event.preventDefault(); requestAnimationFrame(() => (listRef.current?.querySelector<HTMLButtonElement>("[data-selected=true]") ?? listRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)"))?.focus()); }}
        className="z-[80] w-auto min-w-[max(var(--radix-popover-trigger-width),160px)] max-w-[calc(100vw-2rem)] rounded-xl border-0 bg-card p-1.5 shadow-[0_20px_50px_-12px_rgb(11_28_48/30%)] ring-1 ring-border">
        <div ref={listRef} role="listbox" aria-label={ariaLabel} className="max-h-72 overflow-y-auto"
          onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); focusItem(1); } if (event.key === "ArrowUp") { event.preventDefault(); focusItem(-1); } }}>
          {options.map((item) => {
            const active = item.value === current;
            return (
              <button type="button" role="option" aria-selected={active} data-selected={active} key={item.value} disabled={item.disabled} onClick={() => pick(item.value)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none transition focus-visible:bg-soft disabled:opacity-40 ${active ? "bg-strong font-semibold text-strong-foreground focus-visible:bg-strong" : "text-foreground hover:bg-soft"}`}>
                <span className="min-w-0 truncate">{item.label}</span>
                {active && <Check className="size-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
