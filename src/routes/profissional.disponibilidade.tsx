import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalAvailabilityPage } from "@/components/role-pages";

export const Route = createFileRoute("/profissional/disponibilidade")({
  head: () => ({ meta: [
    { title: "Disponibilidade — Gestão de Consultas" },
    { name: "description", content: "Gerencie a disponibilidade da agenda profissional." },
    { property: "og:title", content: "Disponibilidade — Gestão de Consultas" },
    { property: "og:description", content: "Gerencie a disponibilidade da agenda profissional." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProfessionalAvailabilityPage,
});
