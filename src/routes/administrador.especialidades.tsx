import { createFileRoute } from "@tanstack/react-router";
import { AdminSpecialtiesPage } from "@/components/role-pages";

const title = "Especialidades — Gestão de Consultas";
const description = "Cadastre, edite e desative as especialidades médicas atendidas pela clínica.";

export const Route = createFileRoute("/administrador/especialidades")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: AdminSpecialtiesPage,
});
