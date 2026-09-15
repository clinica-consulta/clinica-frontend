import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/gestao-consultas-logo-transparent.png";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Login — Gestão de Consultas" }, { name: "description", content: "Acesse a plataforma de gestão de consultas da clínica." }, { property: "og:title", content: "Login — Gestão de Consultas" }, { property: "og:description", content: "Acesse a plataforma de gestão de consultas da clínica." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: LoginPage,
});
function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col bg-background px-5 py-5 sm:px-8 sm:py-7">
      <div className="flex items-center gap-2.5" aria-label="Gestão de Consultas">
        <img src={logo} alt="" className="size-11 object-contain" />
        <span className="font-display text-lg uppercase text-primary">Gestão de Consultas</span>
      </div>

      <section className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-[390px]">
          <div className="mb-9 text-center">
            <img src={logo} alt="Logo Gestão de Consultas" className="mx-auto h-24 w-28 object-contain" />
            <h1 className="mt-3 font-display text-3xl uppercase text-foreground">Gestão de Consultas</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesso ao sistema da clínica</p>
          </div>

          <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); navigate({ to: "/dashboard" }); }}>
            <label className="grid gap-2 text-xs font-semibold uppercase text-foreground">
              E-mail
              <span className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input type="email" autoComplete="email" placeholder="Digite seu e-mail" required className="h-12 w-full rounded-md border border-input bg-background pl-11 pr-4 text-sm font-normal normal-case text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15" />
              </span>
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase text-foreground">
              Senha
              <span className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" required className="h-12 w-full rounded-md border border-input bg-background pl-11 pr-12 text-sm font-normal normal-case text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15" />
                <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </span>
            </label>
            <Button type="submit" size="lg" className="h-12 w-full text-sm font-semibold">Entrar</Button>
          </form>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">© 2026 Gestão de Consultas. Todos os direitos reservados.</p>
    </main>
  );
}
