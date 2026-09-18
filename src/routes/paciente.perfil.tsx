import { createFileRoute } from "@tanstack/react-router";
import { PatientProfilePage } from "@/components/role-pages";

export const Route = createFileRoute("/paciente/perfil")({
  head: () => ({ meta: [
    { title: "Perfil do paciente — Gestão de Consultas" },
    { name: "description", content: "Atualize seus dados pessoais e preferências." },
    { property: "og:title", content: "Perfil do paciente — Gestão de Consultas" },
    { property: "og:description", content: "Atualize seus dados pessoais e preferências." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PatientProfilePage,
});
