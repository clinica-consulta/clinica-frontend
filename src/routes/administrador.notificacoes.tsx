import { createFileRoute } from "@tanstack/react-router";
import { AdminNotificationsPage } from "@/components/role-pages";

export const Route = createFileRoute("/administrador/notificacoes")({
  head: () => ({ meta: [
    { title: "Notificações — Gestão de Consultas" },
    { name: "description", content: "Acompanhe avisos de consultas, lembretes e pagamentos." },
    { property: "og:title", content: "Notificações — Gestão de Consultas" },
    { property: "og:description", content: "Acompanhe avisos de consultas, lembretes e pagamentos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminNotificationsPage,
});
