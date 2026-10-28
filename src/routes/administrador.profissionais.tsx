import { createFileRoute } from "@tanstack/react-router";
import { AdminProfessionalsPage } from "@/components/role-pages";

export const Route = createFileRoute("/administrador/profissionais")({
  head: () => ({ meta: [
    { title: "Gestão de profissionais — Gestão de Consultas" },
    { name: "description", content: "Gerencie a equipe clínica e seus acessos." },
    { property: "og:title", content: "Gestão de profissionais — Gestão de Consultas" },
    { property: "og:description", content: "Gerencie a equipe clínica e seus acessos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminProfessionalsPage,
});
