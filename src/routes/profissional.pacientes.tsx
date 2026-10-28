import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalPatientsPage } from "@/components/role-pages";

export const Route = createFileRoute("/profissional/pacientes")({
  head: () => ({ meta: [
    { title: "Meus pacientes — Gestão de Consultas" },
    { name: "description", content: "Consulte pacientes vinculados aos seus atendimentos." },
    { property: "og:title", content: "Meus pacientes — Gestão de Consultas" },
    { property: "og:description", content: "Consulte pacientes vinculados aos seus atendimentos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProfessionalPatientsPage,
});
