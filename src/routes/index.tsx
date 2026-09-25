import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CalendarDays, Eye, EyeOff, IdCard, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/page-kit";
import logo from "@/assets/gestao-consultas-logo-transparent.png";
import { roleProfiles } from "@/lib/role-data";
import { useClinic } from "@/lib/clinic-store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Acesso — Gestão de Consultas" }, { name: "description", content: "Entre ou crie seu acesso à plataforma de gestão de consultas da clínica." }, { property: "og:title", content: "Acesso — Gestão de Consultas" }, { property: "og:description", content: "Entre ou crie seu acesso à plataforma de gestão de consultas da clínica." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: LoginPage,
});
function LoginPage() {
  const navigate = useNavigate();
  const { login, addPatient, insurances } = useClinic();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [recovery, setRecovery] = useState(false);
  const isSignup = mode === "signup";

  function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addPatient({
      name: String(data.get("name") ?? ""),
      cpf: String(data.get("cpf") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      birthDate: String(data.get("birthDate") ?? ""),
      insurance: String(data.get("insurance") ?? "Particular"),
    });
    setEmail(String(data.get("email") ?? ""));
    toast.success("Cadastro realizado! Agora você já pode entrar.");
    setMode("login");
  }

  return (
    <main className={`relative flex min-h-screen flex-col overflow-hidden px-4 transition-colors duration-700 ${isSignup ? "bg-primary" : "bg-background"}`}>
      <section className={`mx-auto flex w-full max-w-[370px] flex-1 flex-col justify-center overflow-hidden font-display ${isSignup ? "py-2" : "py-6"}`}>
        <div className="mb-4 flex items-center justify-center gap-2" aria-label="Gestão de Consultas">
          <img src={logo} alt="" className="size-10 object-contain sm:size-12" />
          <span className={`font-display text-lg uppercase transition-colors duration-700 sm:text-xl ${isSignup ? "text-primary-foreground" : "text-primary"}`}>Gestão de Consultas</span>
        </div>

        <div className={`border p-2.5 transition-colors duration-700 sm:p-3 ${isSignup ? "rounded-xl border-border/75 bg-auth-panel" : "rounded-2xl border-border bg-muted/55"}`}>
          <div className={`relative grid h-10 grid-cols-2 border-border p-1 transition-colors duration-700 ${isSignup ? "rounded-lg border bg-auth-input" : "rounded-xl border-2 bg-card"}`} role="tablist" aria-label="Acesso">
            <span className={`absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] transition-transform duration-500 ease-out ${isSignup ? "translate-x-full rounded-md bg-secondary" : "translate-x-0 rounded-lg bg-primary"}`} aria-hidden="true" />
            <Button type="button" variant="ghost" role="tab" aria-selected={!isSignup} onClick={() => setMode("login")} className={`relative z-10 h-full pt-[3px] text-sm font-semibold leading-none hover:bg-transparent ${isSignup ? "rounded-sm text-primary hover:text-primary" : "rounded-lg text-primary-foreground hover:text-primary-foreground"}`}>Login</Button>
            <Button type="button" variant="ghost" role="tab" aria-selected={isSignup} onClick={() => setMode("signup")} className={`relative z-10 h-full pt-[3px] text-sm font-semibold leading-none hover:bg-transparent ${isSignup ? "rounded-sm text-primary hover:text-primary" : "rounded-lg text-muted-foreground hover:text-muted-foreground"}`}>Cadastre-se</Button>
          </div>

          <div className={`overflow-hidden px-1.5 pb-1.5 ${isSignup ? "mt-4" : "mt-5"}`}>
            {isSignup ? (
              <div key="signup" className="auth-slide-right">
                <div className="mb-3 text-center">
                  <h2 className="text-lg font-bold text-primary-foreground sm:text-xl">Crie sua conta</h2>
                  <p className="mt-2 text-xs text-accent sm:text-sm">Preencha seus dados para criar uma nova conta.</p>
                </div>
                <form className="space-y-2.5 [&_label]:text-primary-foreground  [&_input]:rounded-md [&_input]:border [&_input]:border-border [&_input]:bg-auth-input [&_input]:text-primary-foreground [&_input]:placeholder:text-accent [&_select]:rounded-md [&_select]:border [&_select]:border-border [&_select]:bg-auth-input [&_select]:text-primary-foreground [&_.field-icon]:text-accent" onSubmit={submitSignup}>
                  <AuthField label="Nome" name="name" icon={<UserRound />} type="text" autoComplete="name" placeholder="Digite seu nome" />
                  <AuthField label="CPF" name="cpf" icon={<IdCard />} type="text" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" />
                  <AuthField label="Telefone" name="phone" icon={<Phone />} type="tel" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" />
                  <AuthField label="E-mail" name="email" icon={<Mail />} type="email" autoComplete="email" placeholder="voce@exemplo.com" />
                  <PasswordField label="Senha" show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="new-password" placeholder="Crie uma senha" />
                  <AuthField label="Data de nascimento" name="birthDate" icon={<CalendarDays />} type="date" autoComplete="bday" />
                  <AuthSelect label="Convênio" name="insurance" icon={<ShieldCheck />} options={insurances.filter((item) => item.active).map((item) => item.name)} />
                  <Button type="submit" size="lg" className="h-10 w-full rounded-md bg-secondary text-sm font-semibold text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground">Criar conta <ArrowRight /></Button>
                </form>
              </div>
            ) : (
              <div key="login" className="auth-slide-left">
                <div className="mb-4 text-center">
                  <h1 className="text-lg font-bold text-foreground sm:text-xl">Bem-vindo de volta</h1>
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">Digite suas credenciais para acessar sua conta.</p>
                </div>
                <form className="space-y-3.5" onSubmit={(event) => { event.preventDefault(); const role = login(email); navigate({ to: roleProfiles[role].home }); }}>
                  <AuthField label="E-mail" icon={<Mail />} type="email" autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <PasswordField label="Senha" show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="current-password" placeholder="Digite sua senha" />
                  <div className="text-center"><button type="button" onClick={() => setRecovery(true)} className="text-[11px] font-semibold text-muted-foreground underline underline-offset-2 sm:text-xs">Esqueci minha senha</button></div>
                  <Button type="submit" size="lg" className="h-10 w-full rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground">Entrar <ArrowRight /></Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
      <footer className={`mt-auto w-full shrink-0 py-4 text-center text-[11px] transition-colors duration-700 ${isSignup ? "text-accent" : "text-muted-foreground"}`}>© 2026 Gestão de Consultas. Todos os direitos reservados.</footer>

      <Modal open={recovery} title="Redefinir senha" description="Informe seu e-mail cadastrado para receber o link de redefinição." onClose={() => setRecovery(false)}>
        <form className="grid gap-4 font-display" onSubmit={(event) => {
          event.preventDefault();
          const value = String(new FormData(event.currentTarget).get("recoveryEmail") ?? "");
          toast.success("Link de redefinição enviado", { description: `Confira a caixa de entrada de ${value}.` });
          setRecovery(false);
        }}>
          <AuthField label="E-mail" name="recoveryEmail" icon={<Mail />} type="email" autoComplete="email" placeholder="voce@exemplo.com" defaultValue={email} />
          <Button type="submit" className="h-10 w-full rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground">Enviar link</Button>
        </form>
      </Modal>
    </main>
  );
}

function AuthField({ label, icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-foreground sm:text-sm">
      {label}
      <span className="relative">
        <span className="field-icon absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground [&>svg]:size-4" aria-hidden="true">{icon}</span>
        <input {...props} required className="h-10 w-full rounded-xl border-2 border-input bg-card pl-10 pr-3 text-xs font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 sm:text-sm" />
      </span>
    </label>
  );
}

function AuthSelect({ label, icon, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; icon: React.ReactNode; options: string[] }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-foreground sm:text-sm">
      {label}
      <span className="relative">
        <span className="field-icon absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground [&>svg]:size-4" aria-hidden="true">{icon}</span>
        <select {...props} required className="h-10 w-full rounded-xl border-2 border-input bg-card pl-10 pr-3 text-xs font-normal text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 sm:text-sm">
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}

function PasswordField({ label, show, onToggle, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; show: boolean; onToggle: () => void }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-foreground sm:text-sm">
      {label}
      <span className="relative">
        <LockKeyhole className="field-icon absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input {...props} type={show ? "text" : "password"} required className="h-10 w-full rounded-xl border-2 border-input bg-card pl-10 pr-12 text-xs font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 sm:text-sm" />
        <Button type="button" variant="ghost" size="icon" onClick={onToggle} className="field-icon absolute right-2 top-1/2 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-transparent hover:text-inherit" aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
          {show ? <EyeOff /> : <Eye />}
        </Button>
      </span>
    </label>
  );
}
