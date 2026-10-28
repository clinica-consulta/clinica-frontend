import { createFileRoute } from "@tanstack/react-router";
import { ReceptionSchedulesPage } from "@/components/role-pages";

export const Route = createFileRoute("/horarios")({
  head: () => ({ meta: [
    { title: "Horários e bloqueios — Gestão de Consultas" },
    { name: "description", content: "Defina horários de atendimento e bloqueie períodos da agenda." },
    { property: "og:title", content: "Horários e bloqueios — Gestão de Consultas" },
    { property: "og:description", content: "Defina horários de atendimento e bloqueie períodos da agenda." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ReceptionSchedulesPage,
});
