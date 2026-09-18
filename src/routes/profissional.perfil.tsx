import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalProfilePage } from "@/components/role-pages";

export const Route = createFileRoute("/profissional/perfil")({
  head: () => ({ meta: [
    { title: "Perfil profissional — Gestão de Consultas" },
    { name: "description", content: "Atualize seus dados profissionais e de contato." },
    { property: "og:title", content: "Perfil profissional — Gestão de Consultas" },
    { property: "og:description", content: "Atualize seus dados profissionais e de contato." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProfessionalProfilePage,
});
