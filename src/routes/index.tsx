import { SiteSelect } from "@/components/site-select";
import { DatePicker } from "@/components/date-picker";
import { showWelcomeToast } from "@/components/welcome-toast";
import { isoDate } from "@/lib/clinic-data";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CalendarDays, Eye, EyeOff, IdCard, KeyRound, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/page-kit";
import logo from "@/assets/gestao-consultas-logo-transparent.png";
import { useClinic } from "@/lib/clinic-store";
import { isValidCpf, maskCpf, maskPhone } from "@/lib/cpf";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Acesso — Gestão de Consultas" }, { name: "description", content: "Entre ou crie seu acesso à plataforma de gestão de consultas da clínica." }, { property: "og:title", content: "Acesso — Gestão de Consultas" }, { property: "og:description", content: "Entre ou crie seu acesso à plataforma de gestão de consultas da clínica." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: LoginPage,
});
function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, requestPasswordReset, resetPassword, insurances } = useClinic();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [recovery, setRecovery] = useState(false);
  /** Passo 2 da redefinição: e-mail já conferido, falta o código e a nova senha. */
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [testCode, setTestCode] = useState("");
  const closeRecovery = () => { setRecovery(false); setRecoveryEmail(null); setTestCode(""); };
  const [busy, setBusy] = useState(false);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const cpfError = cpf.replace(/\D/g, "").length === 11 && !isValidCpf(cpf) ? "CPF inválido. Confira os números." : "";
  const isSignup = mode === "signup";

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setBusy(true);
    try {
      const profile = await login(email, password);
      navigate({ to: profile.home });
      showWelcomeToast(profile);
    } catch (error) {
      toast.error("Não foi possível entrar", { description: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!isValidCpf(cpf)) {
      toast.error("CPF inválido", { description: "Confira os 11 números do CPF." });
      return;
    }
    setBusy(true);
    try {
      await signup({
        name: String(data.get("name") ?? ""),
        cpf,
        phone,
        email: String(data.get("email") ?? ""),
        birthDate: String(data.get("birthDate") ?? ""),
        insurance: String(data.get("insurance") ?? "Particular"),
        password: String(data.get("password") ?? ""),
      });
      setEmail(String(data.get("email") ?? ""));
      toast.success("Cadastro realizado! Agora você já pode entrar.");
      setCpf("");
      setPhone("");
      setMode("login");
    } catch (error) {
      toast.error("Não foi possível criar a conta", { description: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`relative flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden px-4 transition-colors duration-700 ${isSignup ? "bg-primary" : "bg-background"}`}>
      <section className={`mx-auto flex min-h-0 w-full max-w-[370px] flex-1 flex-col justify-center overflow-hidden font-display ${isSignup ? "py-1" : "py-6"}`}>
        <div className={`${isSignup ? "mb-2" : "mb-4"} flex items-center justify-center gap-2`} aria-label="Gestão de Consultas">
          <img src={logo} alt="" className={`${isSignup ? "size-9 sm:size-10" : "size-10 sm:size-12"} object-contain`} />
          <span className={`font-display text-lg uppercase transition-colors duration-700 sm:text-xl ${isSignup ? "text-primary-foreground" : "text-primary"}`}>Gestão de Consultas</span>
        </div>

        <div className={`border p-2.5 transition-colors duration-700 sm:p-3 ${isSignup ? "rounded-xl border-border/75 bg-auth-panel" : "rounded-2xl border-border bg-muted/55"}`}>
          <div className={`relative grid h-10 grid-cols-2 border-border p-1 transition-colors duration-700 ${isSignup ? "rounded-lg border bg-auth-input" : "rounded-xl border-2 bg-card"}`} role="tablist" aria-label="Acesso">
            <span className={`absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] transition-transform duration-500 ease-out ${isSignup ? "translate-x-full rounded-md bg-primary" : "translate-x-0 rounded-lg bg-primary"}`} aria-hidden="true" />
            <Button type="button" variant="ghost" role="tab" aria-selected={!isSignup} onClick={() => setMode("login")} className={`relative z-10 flex h-full items-center justify-center p-0 text-sm font-semibold leading-none hover:bg-transparent ${isSignup ? "rounded-sm text-accent hover:text-primary-foreground" : "rounded-lg text-primary-foreground hover:text-primary-foreground"}`}>Login</Button>
            <Button type="button" variant="ghost" role="tab" aria-selected={isSignup} onClick={() => setMode("signup")} className={`relative z-10 flex h-full items-center justify-center p-0 text-sm font-semibold leading-none hover:bg-transparent ${isSignup ? "rounded-sm text-primary-foreground hover:text-primary-foreground" : "rounded-lg text-muted-foreground hover:text-muted-foreground"}`}>Cadastre-se</Button>
          </div>

          <div className={`overflow-hidden px-1.5 pb-1.5 ${isSignup ? "mt-2" : "mt-5"}`}>
            {isSignup ? (
              <div key="signup" className="auth-slide-right">
                <div className="mb-2 text-center">
                  <h2 className="text-base font-bold text-primary-foreground sm:text-lg">Crie sua conta</h2>
                  <p className="mt-1 text-xs text-accent">Preencha seus dados para criar uma nova conta.</p>
                </div>
                <form className="space-y-1.5 [&_label]:gap-0.5 [&_label]:text-xs [&_label]:text-primary-foreground [&_input]:h-8 [&_input]:rounded-md [&_input]:border [&_input]:border-border [&_input]:bg-auth-input [&_input]:text-primary-foreground [&_input]:placeholder:text-accent [&_select]:h-8 [&_select]:rounded-md [&_select]:border [&_select]:border-border [&_select]:bg-auth-input [&_select]:text-primary-foreground [&_.field-icon]:text-accent" onSubmit={submitSignup}>
                  <AuthField label="Nome" name="name" icon={<UserRound />} type="text" autoComplete="name" placeholder="Digite seu nome" />
                  <AuthField label="CPF" name="cpf" icon={<IdCard />} type="text" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={cpf} onChange={(event) => setCpf(maskCpf(event.target.value))} maxLength={14} pattern="\d{3}\.\d{3}\.\d{3}-\d{2}" title="Digite os 11 números do CPF" aria-invalid={Boolean(cpfError)} />
                  {cpfError && <p role="alert" className="text-[11px] font-semibold text-red-300">{cpfError}</p>}
                  <AuthField label="Telefone" name="phone" icon={<Phone />} type="tel" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} maxLength={15} />
                  <AuthField label="E-mail" name="email" icon={<Mail />} type="email" autoComplete="email" placeholder="voce@exemplo.com" />
                  <PasswordField label="Senha" name="password" minLength={6} show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="new-password" placeholder="Crie uma senha (mín. 6 caracteres)" />
                  <AuthField label="Data de nascimento" name="birthDate" icon={<CalendarDays />} type="date" autoComplete="bday" dark />
                  <AuthSelect label="Convênio" name="insurance" icon={<ShieldCheck />} options={insurances.filter((item) => item.active).map((item) => item.name)} dark />
                  <Button type="submit" size="lg" disabled={busy || Boolean(cpfError)} className="h-8 w-full rounded-md border border-border/60 bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">{busy ? "Criando..." : "Criar conta"} <ArrowRight /></Button>
                </form>
              </div>
            ) : (
              <div key="login" className="auth-slide-left">
                <div className="mb-4 text-center">
                  <h1 className="text-lg font-bold text-foreground sm:text-xl">Bem-vindo de volta</h1>
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">Digite suas credenciais para acessar sua conta.</p>
                </div>
                <form className="space-y-3.5" onSubmit={submitLogin}>
                  <AuthField label="E-mail" icon={<Mail />} type="email" autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <PasswordField label="Senha" name="password" show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="current-password" placeholder="Digite sua senha" />
                  <div className="text-center"><button type="button" onClick={() => setRecovery(true)} className="text-[11px] font-semibold text-muted-foreground underline underline-offset-2 sm:text-xs">Esqueci minha senha</button></div>
                  <Button type="submit" size="lg" disabled={busy} className="h-10 w-full rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground">{busy ? "Entrando..." : "Entrar"} <ArrowRight /></Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
      <footer className={`mt-auto w-full shrink-0 text-center text-[11px] transition-colors duration-700 ${isSignup ? "py-2 text-accent" : "py-4 text-muted-foreground"}`}>© 2026 Gestão de Consultas. Todos os direitos reservados.</footer>

      <Modal open={recovery} title="Redefinir senha" description={recoveryEmail ? `Digite o código enviado para ${recoveryEmail} e escolha a nova senha.` : "Informe o e-mail da sua conta. Vamos conferir se ele está cadastrado e enviar um código."} onClose={closeRecovery}>
        {recoveryEmail ? (
          <form className="grid gap-4 font-display" onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const password = String(data.get("newPassword") ?? "");
            if (password !== String(data.get("confirmPassword") ?? "")) { toast.error("As senhas não conferem"); return; }
            setBusy(true);
            try {
              await resetPassword(recoveryEmail, String(data.get("code") ?? ""), password);
              toast.success("Senha redefinida", { description: "Agora entre com a nova senha." });
              setEmail(recoveryEmail);
              closeRecovery();
            } catch (error) {
              toast.error("Não foi possível redefinir", { description: (error as Error).message });
            } finally {
              setBusy(false);
            }
          }}>
            {testCode && <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Envio de e-mail não configurado na API. Código de teste: <b className="text-sm tracking-[2px] text-foreground">{testCode}</b></p>}
            <AuthField label="Código de 6 dígitos" name="code" icon={<KeyRound />} type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} pattern="\d{6}" title="Digite os 6 números do código" />
            <PasswordField label="Nova senha" name="newPassword" minLength={6} show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="new-password" placeholder="Mínimo 6 caracteres" />
            <PasswordField label="Repita a nova senha" name="confirmPassword" minLength={6} show={showPassword} onToggle={() => setShowPassword((visible) => !visible)} autoComplete="new-password" placeholder="Digite de novo" />
            <Button type="submit" disabled={busy} className="h-10 w-full rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground">Salvar nova senha</Button>
            <button type="button" onClick={() => { setRecoveryEmail(null); setTestCode(""); }} className="text-xs font-semibold text-muted-foreground underline underline-offset-2">Usar outro e-mail</button>
          </form>
        ) : (
          <form className="grid gap-4 font-display" onSubmit={async (event) => {
            event.preventDefault();
            const value = String(new FormData(event.currentTarget).get("recoveryEmail") ?? "").trim();
            setBusy(true);
            try {
              const result = await requestPasswordReset(value);
              toast.success("E-mail confirmado", { description: result.message });
              setTestCode(result.testCode ?? "");
              setRecoveryEmail(value.toLowerCase());
            } catch (error) {
              toast.error("E-mail não validado", { description: (error as Error).message });
            } finally {
              setBusy(false);
            }
          }}>
            <AuthField label="E-mail" name="recoveryEmail" icon={<Mail />} type="email" autoComplete="email" placeholder="voce@exemplo.com" defaultValue={email} />
            <Button type="submit" disabled={busy} className="h-10 w-full rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground">{busy ? "Conferindo..." : "Validar e-mail e enviar código"}</Button>
          </form>
        )}
      </Modal>
    </main>
  );
}

/** `dark`: campo no tema azul da tela de cadastro. */
const darkField = "h-8 rounded-md border border-border bg-auth-input text-primary-foreground";

function AuthField({ label, icon, dark = false, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode; dark?: boolean }) {
  if (props.type === "date") {
    return (
      <div className={`grid gap-0.5 text-xs font-semibold ${dark ? "text-primary-foreground" : "gap-1 text-foreground sm:text-sm"}`}>
        {label}
        <DatePicker aria-label={label} name={props.name} required max={isoDate(0)}>{(value) => (
          <span className={`relative flex w-full items-center pl-10 pr-3 text-xs font-normal transition sm:text-sm ${dark ? darkField : "h-10 rounded-xl border-2 border-input bg-card text-foreground"}`}>
            <span className={`field-icon absolute left-3.5 top-1/2 size-4 -translate-y-1/2 [&>svg]:size-4 ${dark ? "text-accent" : "text-muted-foreground"}`} aria-hidden="true">{icon}</span>
            {value || <span className={dark ? "text-accent" : "text-muted-foreground"}>dd/mm/aaaa</span>}
          </span>
        )}</DatePicker>
      </div>
    );
  }
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

function AuthSelect({ label, icon, options, dark = false, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; icon: React.ReactNode; options: string[]; dark?: boolean }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-foreground sm:text-sm">
      {label}
      <span className="relative">
        <span className={`field-icon absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 [&>svg]:size-4 ${dark ? "text-accent" : "text-muted-foreground"}`} aria-hidden="true">{icon}</span>
        <SiteSelect {...props} required className={`w-full pl-10 pr-3 text-xs font-normal outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 sm:text-sm ${dark ? `${darkField} [&_svg]:text-accent` : "h-10 rounded-xl border-2 border-input bg-card text-foreground"}`}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </SiteSelect>
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
