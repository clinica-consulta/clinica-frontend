import { createFileRoute } from "@tanstack/react-router";
import { AdminReportsPage } from "@/components/role-pages";

export const Route = createFileRoute("/administrador/relatorios")({
  head: () => ({ meta: [
    { title: "Relatórios administrativos — Gestão de Consultas" },
    { name: "description", content: "Analise consultas, faltas e desempenho da clínica." },
    { property: "og:title", content: "Relatórios administrativos — Gestão de Consultas" },
    { property: "og:description", content: "Analise consultas, faltas e desempenho da clínica." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminReportsPage,
});
