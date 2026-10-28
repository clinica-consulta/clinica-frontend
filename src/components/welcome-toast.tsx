import { toast } from "sonner";
import { X } from "lucide-react";
import type { RoleProfile } from "@/lib/role-data";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
}

/** Toast de boas-vindas mostrado logo após o login. */
export function showWelcomeToast(profile: RoleProfile) {
  const firstName = profile.name.replace(/^(Dra?\.)\s+/, "$1 ").split(" ").slice(0, profile.name.startsWith("Dr") ? 2 : 1).join(" ");
  window.setTimeout(() => {
    toast.custom((id) => (
      <div className="welcome-toast pointer-events-auto flex w-[356px] max-w-[calc(100vw-2rem)] items-center gap-3 overflow-hidden rounded-xl border-0 bg-sidebar py-3.5 pl-4 pr-3 text-sidebar-foreground shadow-[0_16px_40px_-14px_rgb(11_28_48/50%)]">
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase leading-4 tracking-[0.88px] text-mobile-eyebrow">{profile.area}</span>
          <span className="block truncate text-[15px] font-bold leading-5">Bem-vindo(a), {firstName}!</span>
          <span className="block text-xs leading-4 text-sidebar-muted">{greeting()}! Que bom ter você de volta.</span>
        </span>
        <button type="button" aria-label="Fechar" onClick={() => toast.dismiss(id)} className="grid size-7 shrink-0 place-items-center self-start rounded-lg text-sidebar-muted transition hover:bg-sidebar-accent hover:text-sidebar-foreground"><X className="size-3.5" /></button>
      </div>
    ), { duration: 4500, unstyled: true, className: "!border-0 !bg-transparent !p-0 !shadow-none" });
  }, 650);
}
