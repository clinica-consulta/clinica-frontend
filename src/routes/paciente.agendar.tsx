import { createFileRoute } from "@tanstack/react-router";
import { PatientBookingPage } from "@/components/role-pages";

export const Route = createFileRoute("/paciente/agendar")({
  head: () => ({ meta: [
    { title: "Agendar consulta — Gestão de Consultas" },
    { name: "description", content: "Escolha especialidade, profissional, data e horário para sua consulta." },
    { property: "og:title", content: "Agendar consulta — Gestão de Consultas" },
    { property: "og:description", content: "Escolha especialidade, profissional, data e horário para sua consulta." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PatientBookingPage,
});
