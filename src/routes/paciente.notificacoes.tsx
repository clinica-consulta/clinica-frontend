import { createFileRoute } from "@tanstack/react-router";
import { PatientNotificationsPage } from "@/components/role-pages";

export const Route = createFileRoute("/paciente/notificacoes")({
  head: () => ({ meta: [
    { title: "Notificações do paciente — Gestão de Consultas" },
    { name: "description", content: "Veja lembretes e atualizações sobre seus atendimentos." },
    { property: "og:title", content: "Notificações do paciente — Gestão de Consultas" },
    { property: "og:description", content: "Veja lembretes e atualizações sobre seus atendimentos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PatientNotificationsPage,
});
