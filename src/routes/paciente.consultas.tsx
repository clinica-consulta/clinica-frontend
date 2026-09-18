import { createFileRoute } from "@tanstack/react-router";
import { PatientAppointmentsPage } from "@/components/role-pages";

export const Route = createFileRoute("/paciente/consultas")({
  head: () => ({ meta: [
    { title: "Minhas consultas — Gestão de Consultas" },
    { name: "description", content: "Acompanhe seus próximos atendimentos e histórico de consultas." },
    { property: "og:title", content: "Minhas consultas — Gestão de Consultas" },
    { property: "og:description", content: "Acompanhe seus próximos atendimentos e histórico de consultas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PatientAppointmentsPage,
});
