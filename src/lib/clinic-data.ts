export type AppointmentStatus = "Confirmada" | "Pendente" | "Em atendimento" | "Concluída" | "Cancelada";

export const appointments = [
  { id: "#1048", time: "08:00", patient: "Marina Costa", initials: "MC", professional: "Dra. Ana Martins", specialty: "Cardiologia", status: "Confirmada" as AppointmentStatus },
  { id: "#1049", time: "09:15", patient: "Roberto Lima", initials: "RL", professional: "Dr. Paulo Nunes", specialty: "Clínica geral", status: "Em atendimento" as AppointmentStatus },
  { id: "#1050", time: "10:30", patient: "Camila Duarte", initials: "CD", professional: "Dra. Ana Martins", specialty: "Cardiologia", status: "Pendente" as AppointmentStatus },
  { id: "#1051", time: "13:00", patient: "João Pedro Reis", initials: "JR", professional: "Dra. Lívia Prado", specialty: "Dermatologia", status: "Confirmada" as AppointmentStatus },
  { id: "#1052", time: "14:20", patient: "Beatriz Souza", initials: "BS", professional: "Dr. Paulo Nunes", specialty: "Clínica geral", status: "Pendente" as AppointmentStatus },
];

export const patients = [
  { name: "Marina Costa", initials: "MC", phone: "(11) 99842-1034", email: "marina@email.com", lastVisit: "Hoje", status: "Ativo" },
  { name: "Roberto Lima", initials: "RL", phone: "(11) 97118-5220", email: "roberto@email.com", lastVisit: "Hoje", status: "Ativo" },
  { name: "Camila Duarte", initials: "CD", phone: "(11) 98720-4102", email: "camila@email.com", lastVisit: "12 set.", status: "Ativo" },
  { name: "João Pedro Reis", initials: "JR", phone: "(11) 96544-9091", email: "joao@email.com", lastVisit: "08 set.", status: "Ativo" },
  { name: "Beatriz Souza", initials: "BS", phone: "(11) 99940-2377", email: "beatriz@email.com", lastVisit: "02 set.", status: "Inativo" },
];

export const professionals = [
  { name: "Dra. Ana Martins", initials: "AM", specialty: "Cardiologia", crm: "CRM 18452", today: 6, next: "08:00", color: "bg-primary" },
  { name: "Dr. Paulo Nunes", initials: "PN", specialty: "Clínica geral", crm: "CRM 23018", today: 8, next: "09:15", color: "bg-info" },
  { name: "Dra. Lívia Prado", initials: "LP", specialty: "Dermatologia", crm: "CRM 20114", today: 5, next: "10:00", color: "bg-warning" },
];

export const waitlist = [
  { name: "Sofia Almeida", specialty: "Cardiologia", preference: "Manhã", since: "Há 2 dias", priority: "Alta" },
  { name: "Carlos Mendes", specialty: "Clínica geral", preference: "Qualquer horário", since: "Há 1 dia", priority: "Normal" },
  { name: "Luciana Freire", specialty: "Dermatologia", preference: "Tarde", since: "Hoje", priority: "Normal" },
];
