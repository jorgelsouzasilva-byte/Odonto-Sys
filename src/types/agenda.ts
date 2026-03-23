export type AgendaStatus = 'pendente' | 'confirmado';
export type AgendaMode = 'dia' | 'semana' | 'mes';

export interface AgendaItem {
  id: string;
  patientName?: string;
  paciente?: string;
  procedureId: string | number;
  procedureName?: string;
  procedimento?: string;
  procedimento_id?: string | number;
  startTime?: string;
  hora?: string;
  data?: string;
  endTime?: string;
  status: AgendaStatus;
  professionalId: string | number;
  professionalName?: string;
  profissional?: string;
  profissional_id?: string | number;
  branchId: string | number;
  branchName?: string;
  filial_nome?: string;
  filial_id?: string | number;
  duration: number;
  observations?: string;
  observacoes?: string;
}

export interface AgendaDashboardStats {
  pendentes: number;
  confirmadas: number;
  totalDia?: number;
  total_dia?: number;
}

export interface CalendarMark {
  date?: string;
  data?: string;
  status: AgendaStatus;
}
