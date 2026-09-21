import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyHint, Field, SelectField, TextareaField } from "@/components/page-kit";
import { isoDate } from "@/lib/clinic-data";
import { useClinic } from "@/lib/clinic-store";

export function AppointmentForm({ fixedPatientId, channel = "Recepção", onDone }: { fixedPatientId?: string; channel?: "Paciente" | "Recepção"; onDone?: () => void }) {
  const { patients, professionals, activeSpecialties, createAppointment, availableSlots, checkEligibility } = useClinic();
  const selectablePatients = patients.filter((item) => item.status === "Ativo");
  const [patientId, setPatientId] = useState(fixedPatientId ?? selectablePatients[0]?.id ?? "");
  const [specialty, setSpecialty] = useState(activeSpecialties[0] ?? "");
  const activeSpecialty = activeSpecialties.includes(specialty) ? specialty : activeSpecialties[0] ?? "";
  const firstOpenDate = useMemo(() => {
    for (let offset = 1; offset <= 14; offset += 1) {
      const candidate = isoDate(offset);
      const weekday = new Date(`${candidate}T12:00:00`).getDay();
      if (professionals.some((item) => item.active && item.availability[weekday]?.active)) return candidate;
    }
    return isoDate(1);
  }, [professionals]);
  const [date, setDate] = useState(firstOpenDate);
  const [notes, setNotes] = useState("");

  const eligible = useMemo(() => professionals.filter((item) => item.active && item.specialty === activeSpecialty), [professionals, activeSpecialty]);
  const [professionalId, setProfessionalId] = useState(eligible[0]?.id ?? "");
  const activeProfessionalId = eligible.some((item) => item.id === professionalId) ? professionalId : eligible[0]?.id ?? "";
  const slots = activeProfessionalId ? availableSlots(activeProfessionalId, date) : [];
  const [time, setTime] = useState("");
  const activeTime = slots.includes(time) ? time : slots[0] ?? "";
  const eligibility = patientId && activeSpecialty ? checkEligibility(patientId, activeSpecialty) : { ok: false, reason: "Selecione o paciente e a especialidade." };

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eligibility.ok) {
      toast.error("Agendamento bloqueado", { description: eligibility.reason });
      return;
    }
    if (!patientId || !activeProfessionalId || !activeTime) {
      toast.error("Selecione paciente, profissional e horário disponível.");
      return;
    }
    const created = createAppointment({ patientId, professionalId: activeProfessionalId, date, time: activeTime, notes, channel });
    if (!created) {
      toast.error("Esse horário não está mais disponível.");
      return;
    }
    toast.success("Consulta agendada", { description: `${date.split("-").reverse().join("/")} às ${activeTime}.` });
    setNotes("");
    setTime("");
    onDone?.();
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
      {!fixedPatientId && (
        <SelectField label="Paciente" value={patientId} onChange={(event) => setPatientId(event.target.value)} options={selectablePatients.map((item) => ({ value: item.id, label: `${item.name} · ${item.insurance}` }))} />
      )}
      <SelectField label="Especialidade" value={activeSpecialty} onChange={(event) => setSpecialty(event.target.value)} options={activeSpecialties.map((item) => ({ value: item, label: item }))} />
      <SelectField label="Profissional" value={activeProfessionalId} onChange={(event) => setProfessionalId(event.target.value)} options={eligible.map((item) => ({ value: item.id, label: item.name }))} />
      <Field label="Data" type="date" value={date} min={isoDate(0)} onChange={(event) => setDate(event.target.value)} />
      {slots.length ? (
        <SelectField label="Horário" value={activeTime} onChange={(event) => setTime(event.target.value)} options={slots.map((item) => ({ value: item, label: item }))} />
      ) : (
        <div className="sm:col-span-2"><EmptyHint>Nenhum horário disponível nessa data. Escolha outro dia ou profissional.</EmptyHint></div>
      )}
      <div className={`rounded-md border p-3 text-xs sm:col-span-2 sm:text-sm ${eligibility.ok ? "border-success/40 bg-success-soft" : "border-warning/40 bg-warning-soft"}`}>
        <b className="block">{eligibility.ok ? "Elegibilidade confirmada" : "Elegibilidade não confirmada"}</b>
        <span className="text-muted-foreground">{eligibility.reason}</span>
      </div>
      <TextareaField label="Observações" className="sm:col-span-2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Informe algo importante para o atendimento" />
      <div className="sm:col-span-2"><Button type="submit" disabled={!slots.length || !eligibility.ok}>Confirmar agendamento</Button></div>
    </form>
  );
}
