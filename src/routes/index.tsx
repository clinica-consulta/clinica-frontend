import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import logo from "@/assets/gestao-consultas-logo-transparent.png";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Acesso — Gestão de Consultas" }, { name: "description", content: "Entre ou crie seu acesso à plataforma de gestão de consultas da clínica." }, { property: "og:title", content: "Acesso — Gestão de Consultas" }, { property: "og:description", content: "Entre ou crie seu acesso à plataforma de gestão de consultas da clínica." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: LoginPage,
});
function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = mode === "signup";

  function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Cadastro realizado! Agora você já pode entrar.");
    setMode("login");
  }

  return (
    <main className={`relative flex min-h-screen flex-col overflow-hidden px-5 transition-colors duration-700 ${isSignup ? "bg-primary" : "bg-background"}`}>
      <section className="mx-auto flex w-full max-w-[450px] flex-1 flex-col justify-center overflow-hidden py-8">
        <div className="mb-6 flex items-center justify-center gap-2.5" aria-label="Gestão de Consultas">
          <img src={logo} alt="" className="size-12 object-contain sm:size-14" />
          <span className={`font-display text-xl uppercase transition-colors duration-700 sm:text-2xl ${isSignup ? "text-primary-foreground" : "text-primary"}`}>Gestão de Consultas</span>
        </div>

        <div className={`relative grid h-11 grid-cols-2 rounded-xl p-1 transition-colors duration-700 ${isSignup ? "bg-auth-input" : "bg-muted"}`} role="tablist" aria-label="Acesso">
          <span className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-500 ease-out ${isSignup ? "translate-x-full bg-secondary" : "translate-x-0 bg-primary"}`} aria-hidden="true" />
          <Button type="button" variant="ghost" role="tab" aria-selected={!isSignup} onClick={() => setMode("login")} className={`relative z-10 h-full rounded-lg text-sm font-semibold hover:bg-transparent ${isSignup ? "text-primary-foreground" : "text-primary-foreground"}`}>Login</Button>
          <Button type="button" variant="ghost" role="tab" aria-selected={isSignup} onClick={() => setMode("signup")} className={`relative z-10 h-full rounded-lg text-sm font-semibold hover:bg-transparent ${isSignup ? "text-primary" : "text-muted-foreground"}`}>Cadastre-se</Button>
        </div>

        <div className="mt-8 overflow-hidden">
          <div className={`flex w-[200%] items-start transition-transform duration-500 ease-out ${isSignup ? "-translate-x-1/2" : "translate-x-0"}`}>
            <div className="w-1/2 shrink-0 px-1">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">Bem-vindo de volta</h1>
                <p className="mt-3 text-sm text-muted-foreground">Digite suas credenciais para acessar sua conta.</p>
              </div>
              <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); navigate({ to: "/dashboard" }); }}>
                <AuthField label="E-mail" icon={<Mail />} type="email" autoComplete="email" placeholder="voce@exemplo.com" />
                <PasswordField label="Senha" show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="current-password" placeholder="Digite sua senha" />
                <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-sm font-semibold">Entrar <ArrowRight /></Button>
              </form>
            </div>

            <div className="w-1/2 shrink-0 px-1">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary-foreground sm:text-2xl">Crie sua conta</h2>
                <p className="mt-3 text-sm text-accent">Preencha seus dados para criar uma nova conta.</p>
              </div>
              <form className="space-y-5 [&_label]:text-primary-foreground [&_input]:border-auth-input [&_input]:bg-auth-input [&_input]:text-primary-foreground [&_input]:placeholder:text-accent [&_.field-icon]:text-accent" onSubmit={submitSignup}>
                <AuthField label="Nome Completo" icon={<UserRound />} type="text" autoComplete="name" placeholder="Digite seu nome" />
                <AuthField label="E-mail" icon={<Mail />} type="email" autoComplete="email" placeholder="voce@exemplo.com" />
                <PasswordField label="Senha" show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="new-password" placeholder="Crie uma senha" />
                <Button type="submit" size="lg" className="h-12 w-full rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground hover:bg-secondary/90">Criar conta <ArrowRight /></Button>
              </form>
            </div>
          </div>
        </div>

      </section>
      <footer className={`mx-auto w-full py-5 text-center text-xs transition-colors duration-700 ${isSignup ? "text-accent" : "text-muted-foreground"}`}>© 2026 Gestão de Consultas. Todos os direitos reservados.</footer>
    </main>
  );
}

function AuthField({ label, icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-foreground">
      {label}
      <span className="relative">
        <span className="field-icon absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground [&>svg]:size-5" aria-hidden="true">{icon}</span>
        <input {...props} required className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-sm font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20" />
      </span>
    </label>
  );
}

function PasswordField({ label, show, onToggle, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; show: boolean; onToggle: () => void }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-foreground">
      {label}
      <span className="relative">
        <LockKeyhole className="field-icon absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input {...props} type={show ? "text" : "password"} required className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-14 text-sm font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20" />
        <Button type="button" variant="ghost" size="icon" onClick={onToggle} className="field-icon absolute right-2 top-1/2 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-transparent hover:text-inherit" aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
          {show ? <EyeOff /> : <Eye />}
        </Button>
      </span>
    </label>
  );
}
