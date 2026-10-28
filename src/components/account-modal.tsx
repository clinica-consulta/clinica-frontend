import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Modal } from "@/components/page-kit";
import { useClinic } from "@/lib/clinic-store";

/** Dados da conta do usuário logado: nome, telefone e troca de senha. */
export function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session, updateMyAccount, changePassword } = useClinic();
  const [saving, setSaving] = useState(false);
  if (!session) return null;

  async function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await updateMyAccount({ name: String(data.get("name") ?? ""), phone: String(data.get("phone") ?? "") });
      toast.success("Dados atualizados");
    } catch (error) {
      toast.error("Não foi possível salvar", { description: (error as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = String(data.get("newPassword") ?? "");
    if (next !== String(data.get("confirmPassword") ?? "")) {
      toast.error("A confirmação não confere com a nova senha");
      return;
    }
    setSaving(true);
    try {
      await changePassword(String(data.get("currentPassword") ?? ""), next);
      toast.success("Senha alterada", { description: "Use a nova senha no próximo acesso." });
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Não foi possível trocar a senha", { description: (error as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Minha conta" description={session.email} onClose={onClose}>
      <form key={session.name} className="grid gap-4 sm:grid-cols-2" onSubmit={saveAccount}>
        <Field label="Nome completo" name="name" defaultValue={session.name} required />
        <Field label="Telefone" name="phone" defaultValue={session.phone} />
        <div className="sm:col-span-2"><Button type="submit" variant="outline" disabled={saving}>Salvar dados</Button></div>
      </form>
      <hr className="my-5 border-border" />
      <form className="grid gap-4" onSubmit={savePassword}>
        <h3 className="text-sm font-bold">Trocar senha</h3>
        <Field label="Senha atual" name="currentPassword" type="password" autoComplete="current-password" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nova senha" name="newPassword" type="password" autoComplete="new-password" minLength={6} required />
          <Field label="Confirmar nova senha" name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required />
        </div>
        <Button type="submit" disabled={saving}>Trocar senha</Button>
      </form>
    </Modal>
  );
}
