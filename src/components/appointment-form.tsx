import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, SelectField, TextareaField } from "@/components/page-kit";
import { MiniCalendar, SlotPicker } from "@/components/mini-calendar";
import { isoDate } from "@/lib/clinic-data";
import { useClinic } from "@/lib/clinic-store";

const digits = (value: string) => value.replace(/\D/g, "");

export function AppointmentForm({ fixedPatientId, channel = "Recepção", onDone }: { fixedPatientId?: string; channel?: "Paciente" | "Recepção"; onDone?: () => void }) {
  const { patients, professionals, activeSpecialties, createAppointment, availableSlots, checkEligibility } = useClinic();
  const [cpf, setCpf] = useState("");
  const found = fixedPatientId ? null : digits(cpf).length === 11 ? patients.find((item) => digits(item.cpf) === digits(cpf)) ?? null : null;
  const patientId = fixedPatientId ?? (found && found.status === "Ativo" ? found.id : "");
  const [specialty, setSpecialty] = useState(activeSpecialties[0] ?? "");
  const activeSpecialty = activeSpecialties.includes(specialty) ? specialty : activeSpecialties[0] ?? "";
  const eligible = useMemo(() => professionals.filter((item) => item.active && item.specialty === activeSpecialty), [professionals, activeSpecialty]);
  const [professionalId, setProfessionalId] = useState(eligible[0]?.id ?? "");
  const activeProfessionalId = eligible.some((item) => item.id === professionalId) ? professionalId : eligible[0]?.id ?? "";
  const [date, setDate] = useState(isoDate(1));
  const [notes, setNotes] = useState("");
  const slots = activeProfessionalId ? availableSlots(activeProfessionalId, date) : [];
  const [time, setTime] = useState("");
  const activeTime = slots.includes(time) ? time : slots[0] ?? "";
  const eligibility = patientId && activeSpecialty ? checkEligibility(patientId, activeSpecialty) : { ok: false, reason: fixedPatientId ? "Selecione a especialidade." : "Informe o CPF de um paciente cadastrado e ativo." };

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eligibility.ok) { toast.error("Agendamento bloqueado", { description: eligibility.reason }); return; }
    if (!patientId || !activeProfessionalId || !activeTime) { toast.error("Selecione paciente, profissional e horário disponível."); return; }
    const created = createAppointment({ patientId, professionalId: activeProfessionalId, date, time: activeTime, notes, channel });
    if (!created) { toast.error("Esse horário não está mais disponível."); return; }
    toast.success("Consulta agendada", { description: `${date.split("-").reverse().join("/")} às ${activeTime}.` });
    setNotes("");
    setTime("");
    onDone?.();
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      {!fixedPatientId && (
        <div className="grid gap-1.5 sm:col-span-2">
          <Field label="CPF do paciente" value={cpf} onChange={(event) => setCpf(event.target.value)} placeholder="000.000.000-00" inputMode="numeric" />
          {digits(cpf).length === 11 && <p className={`text-xs ${found && found.status === "Ativo" ? "text-success" : "text-warning-strong"}`}>{found ? (found.status === "Ativo" ? `${found.name} · ${found.insurance}` : `${found.name} está com cadastro inativo.`) : "Nenhum paciente encontrado com esse CPF."}</p>}
        </div>
      )}
      <SelectField label="Especialidade" value={activeSpecialty} onChange={(event) => setSpecialty(event.target.value)} options={activeSpecialties.map((item) => ({ value: item, label: item }))} />
      <SelectField label="Profissional" value={activeProfessionalId} onChange={(event) => setProfessionalId(event.target.value)} options={eligible.map((item) => ({ value: item.id, label: item.name }))} />
      <div className="grid gap-1 sm:col-span-2">
        <span className="text-xs font-medium sm:text-sm">Data e horário</span>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <MiniCalendar value={date} onChange={(next) => { setDate(next); setTime(""); }} slotsFor={(day) => (activeProfessionalId ? availableSlots(activeProfessionalId, day).length : 0)} />
          <div className="grid content-start gap-2">
            <p className="text-xs text-muted-foreground">{date.split("-").reverse().join("/")} · {slots.length} horário(s) livre(s)</p>
            {slots.length ? <SlotPicker slots={slots} value={activeTime} onChange={setTime} /> : <EmptyHint>Nenhum horário disponível nessa data.</EmptyHint>}
          </div>
        </div>
      </div>
      <div className={`rounded-md border p-3 text-xs sm:col-span-2 sm:text-sm ${eligibility.ok ? "border-success/40 bg-success-soft" : "border-warning/40 bg-warning-soft"}`}>
        <b className="block">{eligibility.ok ? "Elegibilidade confirmada" : "Elegibilidade não confirmada"}</b>
        <span className="text-muted-foreground">{eligibility.reason}</span>
      </div>
      <TextareaField label="Observações" className="sm:col-span-2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Informe algo importante para o atendimento" />
      <div className="sm:col-span-2"><Button type="submit" disabled={!slots.length || !eligibility.ok}>Confirmar agendamento</Button></div>
    </form>
  );
}
