import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalAgendaPage } from "@/components/role-pages";

export const Route = createFileRoute("/profissional/agenda")({
  head: () => ({ meta: [
    { title: "Minha agenda — Gestão de Consultas" },
    { name: "description", content: "Visualize os horários e pacientes agendados." },
    { property: "og:title", content: "Minha agenda — Gestão de Consultas" },
    { property: "og:description", content: "Visualize os horários e pacientes agendados." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProfessionalAgendaPage,
});
