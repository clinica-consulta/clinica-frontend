import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalDashboardPage } from "@/components/role-pages";

export const Route = createFileRoute("/profissional")({
  head: () => ({ meta: [
    { title: "Início profissional — Gestão de Consultas" },
    { name: "description", content: "Acompanhe a agenda e os atendimentos do dia." },
    { property: "og:title", content: "Início profissional — Gestão de Consultas" },
    { property: "og:description", content: "Acompanhe a agenda e os atendimentos do dia." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProfessionalDashboardPage,
});
