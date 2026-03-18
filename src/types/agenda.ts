export type AgendaStatus = 'pendente' | 'confirmado';
export type AgendaMode = 'dia' | 'semana' | 'mes';

export interface AgendaItem {
  id: string;
  patientName: string;
  procedureId: string;
  procedureName: string;
  startTime: string; // ISO string or time string
  endTime: string;
  status: AgendaStatus;
  professionalId: string;
  professionalName: string;
  branchId: string;
  branchName: string;
  duration: number; // in minutes
  observations?: string;
}

export interface AgendaDashboardStats {
  pendentes: number;
  confirmadas: number;
  totalDia: number;
}

export interface CalendarMark {
  date: string; // YYYY-MM-DD
  status: AgendaStatus;
}
