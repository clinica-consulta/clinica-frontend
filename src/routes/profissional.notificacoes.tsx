import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalNotificationsPage } from "@/components/role-pages";

export const Route = createFileRoute("/profissional/notificacoes")({
  head: () => ({ meta: [
    { title: "Notificações profissionais — Gestão de Consultas" },
    { name: "description", content: "Veja chegadas, alterações e confirmações da agenda." },
    { property: "og:title", content: "Notificações profissionais — Gestão de Consultas" },
    { property: "og:description", content: "Veja chegadas, alterações e confirmações da agenda." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProfessionalNotificationsPage,
});
