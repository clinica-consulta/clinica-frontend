import { createFileRoute } from "@tanstack/react-router";
import { AdminSchedulesPage } from "@/components/role-pages";

const title = "Agendas e horários — Gestão de Consultas";
const description = "Gerencie horários de atendimento, bloqueios de períodos e a agenda centralizada dos médicos.";

export const Route = createFileRoute("/administrador/agendas")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: AdminSchedulesPage,
});
