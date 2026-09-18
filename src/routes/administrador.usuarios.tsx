import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/components/role-pages";

export const Route = createFileRoute("/administrador/usuarios")({
  head: () => ({ meta: [
    { title: "Gestão de usuários — Gestão de Consultas" },
    { name: "description", content: "Gerencie contas e níveis de acesso da plataforma." },
    { property: "og:title", content: "Gestão de usuários — Gestão de Consultas" },
    { property: "og:description", content: "Gerencie contas e níveis de acesso da plataforma." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminUsersPage,
});
