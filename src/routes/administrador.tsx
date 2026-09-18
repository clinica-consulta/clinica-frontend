import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "@/components/role-pages";

export const Route = createFileRoute("/administrador")({
  head: () => ({ meta: [
    { title: "Administração — Gestão de Consultas" },
    { name: "description", content: "Acompanhe os principais indicadores da clínica." },
    { property: "og:title", content: "Administração — Gestão de Consultas" },
    { property: "og:description", content: "Acompanhe os principais indicadores da clínica." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminDashboardPage,
});
