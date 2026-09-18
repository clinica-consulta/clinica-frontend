import { createFileRoute } from "@tanstack/react-router";
import { AdminSettingsPage } from "@/components/role-pages";

export const Route = createFileRoute("/administrador/configuracoes")({
  head: () => ({ meta: [
    { title: "Configurações administrativas — Gestão de Consultas" },
    { name: "description", content: "Atualize dados institucionais e preferências gerais." },
    { property: "og:title", content: "Configurações administrativas — Gestão de Consultas" },
    { property: "og:description", content: "Atualize dados institucionais e preferências gerais." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminSettingsPage,
});
