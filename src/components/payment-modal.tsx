import { useEffect, useRef, useState } from "react";
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { CheckCircle2, Clock3, CreditCard, QrCode } from "lucide-react";
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
 * Pagamento da consulta. Com o Stripe ativo na API, o formulário do Stripe (Pix, cartão, boleto...) aparece
 * aqui dentro, sem sair do site. Os dados de pagamento vão direto para o Stripe, nunca para a nossa API.
 * Sem o Stripe, cai no pagamento simulado: nenhum valor é cobrado e os dados do cartão não são enviados nem guardados.
 */
export function PaymentModal({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const { payAppointment, professionalById, settings, onlinePayment, startCheckout, verifyPayment } = useClinic();
  // undefined = ainda consultando a API; null = só modo simulado.
  const [gateway, setGateway] = useState<{ name: string; test: boolean } | null | undefined>(undefined);
  // Situação do formulário do Stripe dentro do modal.
  const [online, setOnline] = useState<"loading" | "ready" | "waiting" | "error">("loading");
  const [onlineError, setOnlineError] = useState("");
  const checkoutBox = useRef<HTMLDivElement>(null);
  const [method, setMethod] = useState<PaymentMethod>("Pix");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Appointment | null>(null);
  const done = receipt ?? (appointment?.payment?.status === "Pago" ? appointment : null);
  const amount = appointment?.payment?.amount ?? settings.appointmentPrice;
  const pixCode = appointment ? `00020126580014BR.GOV.BCB.PIX0136clinica-senai-${appointment.code}5204000053039865406${amount.toFixed(2)}5802BR` : "";

  const close = () => { setReceipt(null); setCard(""); setExpiry(""); setMethod("Pix"); setOnline("loading"); setOnlineError(""); onClose(); };

  const open = Boolean(appointment);
  useEffect(() => {
    if (!open || gateway !== undefined) return;
    onlinePayment()
      .then((config) => setGateway(config.gateway ? { name: config.gateway, test: config.test } : null))
      .catch(() => setGateway(null));
  }, [open, gateway, onlinePayment]);

  // Monta o Checkout do Stripe dentro do modal.
  const appointmentId = appointment?.id;
  const alreadyPaid = appointment?.payment?.status === "Pago";
  useEffect(() => {
    if (!gateway || !appointmentId || alreadyPaid) return;
    let checkout: StripeEmbeddedCheckout | null = null;
    let cancelled = false;

    // Pix e boleto podem levar alguns segundos para compensar: confere algumas vezes.
    async function confirm(id: string) {
      for (let attempt = 0; attempt < 5 && !cancelled; attempt += 1) {
        const updated = await verifyPayment(id).catch(() => null);
        if (updated?.payment?.status === "Pago") {
          checkout?.destroy();
          checkout = null;
          setReceipt(updated);
          toast.success("Pagamento confirmado");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
      if (!cancelled) setOnline("waiting");
    }

    void (async () => {
      try {
        const session = await startCheckout(appointmentId);
        const stripe = await loadStripe(session.publishableKey);
        if (!stripe) throw new Error("Não foi possível carregar o Stripe");
        if (cancelled || !checkoutBox.current) return;
        checkout = await stripe.createEmbeddedCheckoutPage({ clientSecret: session.clientSecret, onComplete: () => void confirm(appointmentId) });
        if (cancelled || !checkoutBox.current) {
          checkout.destroy();
          return;
        }
        checkout.mount(checkoutBox.current);
        setOnline("ready");
      } catch (error) {
        if (cancelled) return;
        const message = (error as Error).message;
        setOnlineError(message);
        setOnline(message.includes("aguardando confirmação") ? "waiting" : "error");
      }
    })();

    return () => {
      cancelled = true;
      checkout?.destroy();
    };
  }, [gateway, appointmentId, alreadyPaid, startCheckout, verifyPayment]);

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
    <Modal open title={done ? "Pagamento confirmado" : "Pagamento da consulta"} description={gateway ? (gateway.test ? "Ambiente de teste do Stripe: nenhum valor é cobrado de verdade." : "Pagamento seguro processado pelo Stripe.") : gateway === null ? "Simulação de pagamento: nenhum valor é cobrado de verdade." : "Pagamento da consulta particular."} onClose={close}>
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
        online === "waiting" ? (
          <div className="grid gap-3 text-center">
            <Clock3 className="mx-auto size-12 text-muted-foreground" />
            <p className="font-semibold">Pagamento aguardando confirmação</p>
            <p className="text-sm text-muted-foreground">Pix e boleto podem levar alguns instantes para compensar. Assim que o pagamento for confirmado, você recebe um aviso nas notificações.</p>
            <Button onClick={close}>Fechar</Button>
          </div>
        ) : online === "error" ? (
          <div className="grid gap-3 text-center">
            <p className="font-semibold">Não foi possível abrir o pagamento</p>
            <p className="text-sm text-muted-foreground">{onlineError}</p>
            <Button onClick={close}>Fechar</Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {online === "loading" && <p className="py-6 text-center text-sm text-muted-foreground">Carregando o pagamento seguro...</p>}
            <div ref={checkoutBox} className="min-h-px overflow-hidden rounded-lg" />
          </div>
        )
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
