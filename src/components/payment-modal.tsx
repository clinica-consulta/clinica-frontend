import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, ExternalLink, QrCode, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Modal } from "@/components/page-kit";
import { formatDate, formatMoney, weekdayName, type Appointment, type PaymentMethod } from "@/lib/clinic-data";
import { useClinic } from "@/lib/clinic-store";

const methods: { value: PaymentMethod; icon: typeof QrCode }[] = [
  { value: "Pix", icon: QrCode },
  { value: "Cartão de crédito", icon: CreditCard },
  { value: "Cartão de débito", icon: CreditCard },
];

const maskCard = (value: string) => value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
const maskExpiry = (value: string) => value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");

/**
 * Pagamento da consulta. Com o Mercado Pago ativo na API, o paciente paga com Pix ou cartão no checkout do Mercado Pago.
 * Sem ele, cai no pagamento simulado: nenhum valor é cobrado e os dados do cartão não são enviados nem guardados.
 */
export function PaymentModal({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const { payAppointment, professionalById, settings, onlinePayment, startCheckout } = useClinic();
  // undefined = ainda consultando a API; null = só modo simulado.
  const [gateway, setGateway] = useState<{ name: string; test: boolean } | null | undefined>(undefined);
  const [redirecting, setRedirecting] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("Pix");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Appointment | null>(null);
  const done = receipt ?? (appointment?.payment?.status === "Pago" ? appointment : null);
  const amount = appointment?.payment?.amount ?? settings.appointmentPrice;
  const pixCode = appointment ? `00020126580014BR.GOV.BCB.PIX0136clinica-senai-${appointment.code}5204000053039865406${amount.toFixed(2)}5802BR` : "";

  const close = () => { setReceipt(null); setCard(""); setExpiry(""); setMethod("Pix"); setRedirecting(false); onClose(); };

  const open = Boolean(appointment);
  useEffect(() => {
    if (!open || gateway !== undefined) return;
    onlinePayment()
      .then((config) => setGateway(config.gateway ? { name: config.gateway, test: config.test } : null))
      .catch(() => setGateway(null));
  }, [open, gateway, onlinePayment]);

  async function goToCheckout() {
    if (!appointment) return;
    setRedirecting(true);
    try {
      const { url } = await startCheckout(appointment.id);
      window.location.assign(url);
    } catch (error) {
      setRedirecting(false);
      toast.error("Não foi possível abrir o pagamento", { description: (error as Error).message });
    }
  }

  async function pay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointment) return;
    if (method !== "Pix" && card.replace(/\D/g, "").length < 16) { toast.error("Número do cartão incompleto"); return; }
    setBusy(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900)); // simula o tempo de aprovação
      setReceipt(await payAppointment(appointment.id, method));
      toast.success("Pagamento aprovado");
    } catch (error) {
      toast.error("Pagamento não concluído", { description: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (!appointment) return null;
  const professional = professionalById(appointment.professionalId);
  return (
    <Modal open title={done ? "Pagamento confirmado" : "Pagamento da consulta"} description={gateway ? (gateway.test ? "Pagamento pelo Mercado Pago em modo de teste: nenhum valor é cobrado de verdade." : "Pagamento seguro pelo Mercado Pago.") : gateway === null ? "Simulação de pagamento: nenhum valor é cobrado de verdade." : "Pagamento da consulta particular."} onClose={close}>
      <dl className="mb-4 grid gap-1.5 rounded-lg bg-soft p-4 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Consulta</dt><dd className="text-right font-semibold">#{appointment.code} · {appointment.specialty}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Profissional</dt><dd className="text-right font-semibold">{professional?.name ?? "—"}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Data</dt><dd className="text-right font-semibold">{weekdayName(appointment.date)}, {formatDate(appointment.date)} às {appointment.time}</dd></div>
        <div className="flex justify-between gap-3 border-t border-border pt-2"><dt className="font-semibold">Valor</dt><dd className="text-lg font-bold">{formatMoney(amount)}</dd></div>
      </dl>

      {done ? (
        <div className="grid gap-3 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <p className="font-semibold">Pago via {done.payment?.method}</p>
          <p className="text-sm text-muted-foreground">Comprovante: <b className="text-foreground">{done.payment?.code}</b></p>
          <Button onClick={close}>Fechar</Button>
        </div>
      ) : gateway === undefined ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Carregando formas de pagamento...</p>
      ) : gateway ? (
        <div className="grid gap-4">
          <div className="flex items-start gap-3 rounded-lg border border-border p-4 text-sm">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
            <p>Você será levado ao <b>{gateway.name}</b> para pagar com <b>Pix, cartão de crédito ou débito</b>. Ao terminar, volta para o portal e a confirmação aparece aqui.</p>
          </div>
          <Button onClick={goToCheckout} disabled={redirecting}>{redirecting ? "Abrindo o Mercado Pago..." : <>Pagar {formatMoney(amount)}<ExternalLink /></>}</Button>
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={pay}>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Forma de pagamento">
            {methods.map(({ value, icon: Icon }) => (
              <button type="button" role="radio" aria-checked={method === value} key={value} onClick={() => setMethod(value)} className={`flex flex-col items-center gap-1 rounded-lg p-3 text-xs font-semibold transition ${method === value ? "bg-strong text-strong-foreground" : "bg-soft hover:bg-accent"}`}>
                <Icon className="size-5" />{value}
              </button>
            ))}
          </div>
          {method === "Pix" ? (
            <div className="grid justify-items-center gap-2 rounded-lg border border-border p-4 text-center">
              <QrCode className="size-24" aria-hidden />
              <p className="text-xs text-muted-foreground">Escaneie o QR Code ou use o Pix copia e cola:</p>
              <code className="w-full break-all rounded bg-soft p-2 text-[11px]">{pixCode}</code>
              <button type="button" onClick={() => { void navigator.clipboard?.writeText(pixCode); toast.success("Código Pix copiado"); }} className="text-xs font-semibold underline underline-offset-2">Copiar código</button>
            </div>
          ) : (
            <div className="grid gap-3">
              <Field label="Número do cartão" inputMode="numeric" placeholder="0000 0000 0000 0000" value={card} onChange={(event) => setCard(maskCard(event.target.value))} required autoComplete="off" />
              <Field label="Nome impresso no cartão" placeholder="Como está no cartão" required autoComplete="off" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Validade" inputMode="numeric" placeholder="MM/AA" value={expiry} onChange={(event) => setExpiry(maskExpiry(event.target.value))} required autoComplete="off" pattern="\d{2}/\d{2}" />
                <Field label="CVV" inputMode="numeric" placeholder="000" maxLength={4} required autoComplete="off" pattern="\d{3,4}" />
              </div>
            </div>
          )}
          <Button type="submit" disabled={busy}>{busy ? "Processando..." : method === "Pix" ? `Já paguei ${formatMoney(amount)}` : `Pagar ${formatMoney(amount)}`}</Button>
        </form>
      )}
    </Modal>
  );
}
