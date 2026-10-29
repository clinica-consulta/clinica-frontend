import { useState } from "react";
import { Modal } from "@/components/page-kit";
import { useClinic } from "@/lib/clinic-store";

type Topic = "privacy" | "terms" | "support";

/** Links do rodapé: Privacidade, Termos de Uso e Suporte abrem uma janela com o conteúdo. */
export function InfoLinks({ topics, separator }: { topics: Topic[]; separator?: React.ReactNode }) {
  const { settings } = useClinic();
  const [open, setOpen] = useState<Topic | null>(null);
  const clinic = settings.name || "a clínica";
  const labels: Record<Topic, string> = { privacy: "Privacidade", terms: "Termos de Uso", support: "Suporte" };
  const content: Record<Topic, React.ReactNode> = {
    privacy: <div className="space-y-3 text-sm text-muted-foreground">
      <p>Seus dados (nome, CPF, contato, convênio e consultas) são usados só para organizar o atendimento em {clinic}.</p>
      <p>Cada perfil vê apenas o que precisa: o paciente vê as próprias consultas, o médico vê os pacientes que atende e a recepção e a administração cuidam da agenda.</p>
      <p>As senhas são guardadas criptografadas e ninguém da equipe consegue vê-las. Para corrigir ou apagar seus dados, fale com o suporte.</p>
    </div>,
    terms: <div className="space-y-3 text-sm text-muted-foreground">
      <p>Ao usar o sistema você se compromete a informar dados verdadeiros e a manter sua senha em segredo.</p>
      <p>Consultas podem ser canceladas ou remarcadas pelo próprio site. Faltas sem aviso ficam registradas no histórico.</p>
      <p>O pagamento de consultas particulares neste site é uma simulação: nenhum valor é cobrado de verdade.</p>
    </div>,
    support: <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">Fale com a equipe de {clinic}:</p>
      <p><b>Telefone:</b> {settings.phone ? <a className="underline" href={`tel:${settings.phone.replace(/\D/g, "")}`}>{settings.phone}</a> : "—"}</p>
      <p><b>E-mail:</b> {settings.email ? <a className="underline" href={`mailto:${settings.email}`}>{settings.email}</a> : "—"}</p>
      <p className="text-muted-foreground">Esqueceu a senha? Saia e use “Esqueci minha senha” na tela de acesso.</p>
    </div>,
  };
  return <>
    {topics.map((topic, index) => <span key={topic} className="contents">
      {index > 0 && separator}
      <button type="button" onClick={() => setOpen(topic)} className="hover:text-foreground">{labels[topic]}</button>
    </span>)}
    <Modal open={Boolean(open)} title={open ? labels[open] : ""} onClose={() => setOpen(null)}>{open && content[open]}</Modal>
  </>;
}
