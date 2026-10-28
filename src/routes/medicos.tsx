import { createFileRoute } from "@tanstack/react-router";
import { ReceptionProfessionalsPage } from "@/components/role-pages";

export const Route = createFileRoute("/medicos")({
  head: () => ({ meta: [
    { title: "Médicos — Gestão de Consultas" },
    { name: "description", content: "Cadastre médicos e ajuste os dados da equipe clínica." },
    { property: "og:title", content: "Médicos — Gestão de Consultas" },
    { property: "og:description", content: "Cadastre médicos e ajuste os dados da equipe clínica." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ReceptionProfessionalsPage,
});
