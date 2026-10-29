import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { AppPath, UserRole } from "@/lib/role-data";
import { formatDate } from "@/lib/clinic-data";
import { useClinic } from "@/lib/clinic-store";
import { handOffSearch } from "@/lib/search-handoff";

type Result = { key: string; title: string; detail: string; path: AppPath; text: string };

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Busca do cabeçalho: procura nos dados que o perfil logado pode ver e abre a tela certa já filtrada. */
export function HeaderSearch({ role, placeholder }: { role: UserRole; placeholder: string }) {
  const clinic = useClinic();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo<Result[]>(() => {
    const term = normalize(query.trim());
    if (term.length < 2) return [];
    const has = (...values: (string | undefined)[]) => values.some((value) => normalize(value ?? "").includes(term));
    const list: Result[] = [];
    const specialties = clinic.activeSpecialties.filter((name) => has(name));

    if (role === "receptionist") {
      clinic.patients.filter((item) => has(item.name, item.cpf, item.phone)).forEach((item) => list.push({ key: `p${item.id}`, title: item.name, detail: `Paciente · ${item.cpf}`, path: "/pacientes", text: item.name }));
      clinic.professionals.filter((item) => has(item.name, item.specialty)).forEach((item) => list.push({ key: `m${item.id}`, title: item.name, detail: `Médico · ${item.specialty}`, path: "/medicos", text: item.name }));
      specialties.forEach((name) => list.push({ key: `e${name}`, title: name, detail: "Consultas da especialidade", path: "/consultas", text: name }));
    } else if (role === "admin") {
      clinic.professionals.filter((item) => has(item.name, item.specialty, item.crm)).forEach((item) => list.push({ key: `m${item.id}`, title: item.name, detail: `Médico · ${item.specialty}`, path: "/administrador/profissionais", text: item.name }));
      [...clinic.staff, ...clinic.patients].filter((item) => has(item.name, item.email)).forEach((item) => list.push({ key: `u${item.id}`, title: item.name, detail: `Usuário · ${item.email}`, path: "/administrador/usuarios", text: item.name }));
      specialties.forEach((name) => list.push({ key: `e${name}`, title: name, detail: "Especialidade", path: "/administrador/especialidades", text: name }));
    } else if (role === "professional") {
      const mine = clinic.appointments.filter((item) => item.professionalId === clinic.currentProfessional?.id);
      [...new Set(mine.map((item) => item.patientId))].map(clinic.patientById).filter((item) => item && has(item.name, item.phone, item.email)).forEach((item) => list.push({ key: `p${item!.id}`, title: item!.name, detail: `Paciente · ${item!.insurance}`, path: "/profissional/pacientes", text: item!.name }));
    } else {
      const mine = clinic.appointments.filter((item) => item.patientId === clinic.currentPatient?.id);
      mine.filter((item) => has(item.specialty, clinic.professionalById(item.professionalId)?.name)).forEach((item) => list.push({ key: `c${item.id}`, title: `${item.specialty} · ${formatDate(item.date)} às ${item.time}`, detail: `${clinic.professionalById(item.professionalId)?.name ?? ""} · ${item.status}`, path: "/paciente", text: "" }));
      specialties.forEach((name) => list.push({ key: `e${name}`, title: name, detail: "Agendar nesta especialidade", path: "/paciente/agendar", text: name }));
      clinic.professionals.filter((item) => item.active && has(item.name)).forEach((item) => list.push({ key: `m${item.id}`, title: item.name, detail: `Agendar · ${item.specialty}`, path: "/paciente/agendar", text: item.specialty }));
    }
    return list.slice(0, 8);
  }, [query, role, clinic]);

  const go = (result: Result) => {
    handOffSearch(result.path, result.text);
    setQuery("");
    setOpen(false);
    navigate({ to: result.path });
  };

  return (
    <div className="relative hidden min-w-0 max-w-[448px] flex-1 lg:block">
      <label className="relative block">
        <span className="sr-only">Buscar</span>
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sidebar-muted" />
        <input
          value={query}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) go(results[0]);
            if (event.key === "Escape") setOpen(false);
          }}
          className="h-[38px] w-full rounded-lg bg-sidebar-accent pl-10 pr-4 text-sm text-sidebar-foreground outline-none placeholder:text-sidebar-muted focus:ring-2 focus:ring-sidebar-ring/40"
          placeholder={placeholder}
        />
      </label>
      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-[44px] z-40 overflow-hidden rounded-lg bg-card text-foreground shadow-[0_12px_30px_-8px_rgb(11_28_48/30%)]">
          {results.length ? results.map((result) => (
            <button type="button" key={result.key} onMouseDown={(event) => event.preventDefault()} onClick={() => go(result)} className="block w-full px-4 py-2.5 text-left hover:bg-soft">
              <b className="block truncate text-sm font-semibold">{result.title}</b>
              <span className="block truncate text-xs text-muted-foreground">{result.detail}</span>
            </button>
          )) : <p className="px-4 py-3 text-sm text-muted-foreground">Nada encontrado para “{query.trim()}”.</p>}
        </div>
      )}
    </div>
  );
}
