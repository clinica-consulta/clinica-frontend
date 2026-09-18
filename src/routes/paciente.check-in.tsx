import { createFileRoute } from "@tanstack/react-router";
import { PatientCheckInPage } from "@/components/role-pages";

export const Route = createFileRoute("/paciente/check-in")({
  head: () => ({ meta: [
    { title: "Check-in do paciente — Gestão de Consultas" },
    { name: "description", content: "Confirme sua chegada e preencha o formulário de pré-atendimento." },
    { property: "og:title", content: "Check-in do paciente — Gestão de Consultas" },
    { property: "og:description", content: "Confirme sua chegada e preencha o formulário de pré-atendimento." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PatientCheckInPage,
});
