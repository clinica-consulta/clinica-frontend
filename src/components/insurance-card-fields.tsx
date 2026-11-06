import type { ReactNode } from "react";
import { isoDate, isPrivateInsurance, type InsuranceCard } from "@/lib/clinic-data";

/** Propriedades de cada campo; cada formulário desenha o campo no próprio estilo. */
export type CardFieldProps = {
  label: string;
  name: "cardNumber" | "cardPlan" | "cardValidUntil";
  type: "text" | "date";
  required: true;
  defaultValue: string;
  placeholder?: string;
  autoComplete: "off";
  inputMode?: "numeric";
  min?: string;
  /** Data digitada (dd/mm/aaaa), nos formulários que aceitam. */
  typed?: boolean;
};

/**
 * Campos da carteirinha do convênio (número, plano e validade).
 * Só aparecem quando o convênio escolhido não é Particular; aí os três são obrigatórios.
 * Os valores são lidos no envio do formulário com `cardFromForm`.
 */
export function InsuranceCardFields({
  insurance,
  card,
  renderField,
  wrap = (children) => <>{children}</>,
}: {
  insurance: string;
  card?: InsuranceCard | undefined;
  renderField: (props: CardFieldProps) => ReactNode;
  wrap?: (children: ReactNode) => ReactNode;
}) {
  if (isPrivateInsurance(insurance)) return null;
  // Ao trocar de convênio, os dados da carteirinha anterior não servem para o novo.
  const same = card && card.number ? card : undefined;
  return wrap(
    <>
      {renderField({ label: `Número da carteirinha (${insurance})`, name: "cardNumber", type: "text", required: true, defaultValue: same?.number ?? "", placeholder: "Como aparece na carteirinha", autoComplete: "off", inputMode: "numeric" })}
      {renderField({ label: "Plano", name: "cardPlan", type: "text", required: true, defaultValue: same?.plan ?? "", placeholder: "Ex.: Enfermaria, Apartamento", autoComplete: "off" })}
      {renderField({ label: "Validade da carteirinha", name: "cardValidUntil", type: "date", required: true, defaultValue: same?.validUntil ?? "", autoComplete: "off", min: isoDate(-3650), typed: true })}
    </>,
  );
}
