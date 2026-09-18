import { createFileRoute } from "@tanstack/react-router";
import { PatientDashboardPage } from "@/components/role-pages";

export const Route = createFileRoute("/paciente/")({
  head: () => ({ meta: [
    { title: "Início do paciente — Gestão de Consultas" },
    { name: "description", content: "Acompanhe consultas, lembretes e próximos passos do atendimento." },
    { property: "og:title", content: "Início do paciente — Gestão de Consultas" },
    { property: "og:description", content: "Acompanhe consultas, lembretes e próximos passos do atendimento." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PatientDashboardPage,
});
