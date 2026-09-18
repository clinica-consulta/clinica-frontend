import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalAppointmentsPage } from "@/components/role-pages";

export const Route = createFileRoute("/profissional/atendimentos")({
  head: () => ({ meta: [
    { title: "Atendimentos — Gestão de Consultas" },
    { name: "description", content: "Acompanhe o fluxo dos atendimentos do dia." },
    { property: "og:title", content: "Atendimentos — Gestão de Consultas" },
    { property: "og:description", content: "Acompanhe o fluxo dos atendimentos do dia." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProfessionalAppointmentsPage,
});
