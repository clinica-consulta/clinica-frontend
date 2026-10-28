import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-kit";
import { AdminProfessionalsPage, AdminSchedulesPage } from "@/components/admin-pages";
import { relativeDay } from "@/lib/clinic-data";
import { useClinic } from "@/lib/clinic-store";

/** Lista de avisos para recepção e administração (mesmo visual da área do profissional). */
function StaffNotifications({ role }: { role: "receptionist" | "admin" }) {
  const clinic = useClinic();
  const items = clinic.notificationsFor(role);
  const unread = items.filter((item) => !item.read).length;
  return <>
    <PageHeader title="Notificações" description="Acompanhe confirmações, lembretes, pagamentos e alterações da agenda." />
    <section className="surface p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase leading-5 md:text-base md:tracking-[0.3px]"><Bell className="size-[18px] md:size-5" />Recentes ({items.length})</h2>
        {unread > 0 && <button type="button" onClick={() => { clinic.markAllNotificationsRead(role); toast.success("Notificações marcadas como lidas"); }} className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold md:rounded-md md:py-1"><CheckCheck className="size-3.5" />Marcar todas como lidas</button>}
      </div>
      {items.length ? <div className="space-y-1.5">{items.map((item) => (
        <button type="button" key={item.id} onClick={() => !item.read && clinic.markNotificationRead(item.id)} className={`flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left ${item.read ? "bg-soft/60" : "bg-soft"}`}>
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.read ? "bg-card text-subtle-foreground" : "bg-accent"}`}><Bell className="size-4" /></span>
          <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-semibold leading-5">{item.title}{!item.read && <span className="size-1.5 rounded-full bg-success" />}</span><span className="block text-xs leading-4 text-muted-foreground">{item.text}</span></span>
          <span className="shrink-0 text-[11px] text-subtle-foreground">{relativeDay(item.createdAt)}</span>
        </button>
      ))}</div> : <div className="grid place-items-center rounded-xl bg-soft px-6 py-8 text-center"><Bell className="size-6 text-subtle-foreground" /><p className="mt-2 text-sm">Nenhuma notificação por aqui.</p></div>}
    </section>
  </>;
}

export function ReceptionNotificationsPage() {
  return <StaffNotifications role="receptionist" />;
}

export function AdminNotificationsPage() {
  return <StaffNotifications role="admin" />;
}

/** A recepção usa as mesmas telas da administração para médicos, horários e bloqueios. */
export function ReceptionProfessionalsPage() {
  return <AdminProfessionalsPage />;
}

export function ReceptionSchedulesPage() {
  return <AdminSchedulesPage />;
}
