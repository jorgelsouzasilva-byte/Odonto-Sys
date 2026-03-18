import { AgendaItem, AgendaDashboardStats, CalendarMark, AgendaStatus } from "../types/agenda";

// Mock data
let mockAgenda: AgendaItem[] = [
  {
    id: '1',
    patientName: 'Maria Silva',
    procedureId: 'proc1',
    procedureName: 'Limpeza',
    startTime: '2026-03-17T09:00:00',
    endTime: '2026-03-17T10:00:00',
    status: 'confirmado',
    professionalId: 'p1',
    professionalName: 'Dr. Jorge Silva',
    branchId: 'b1',
    branchName: 'Matriz',
    duration: 60,
    observations: 'Paciente com sensibilidade.'
  },
  {
    id: '2',
    patientName: 'João Santos',
    procedureId: 'proc2',
    procedureName: 'Extração',
    startTime: '2026-03-17T10:30:00',
    endTime: '2026-03-17T12:00:00',
    status: 'pendente',
    professionalId: 'p2',
    professionalName: 'Dra. Ana Costa',
    branchId: 'b1',
    branchName: 'Matriz',
    duration: 90
  },
  {
    id: '3',
    patientName: 'Pedro Costa',
    procedureId: 'proc3',
    procedureName: 'Avaliação',
    startTime: '2026-03-17T14:00:00',
    endTime: '2026-03-17T14:30:00',
    status: 'pendente',
    professionalId: 'p1',
    professionalName: 'Dr. Jorge Silva',
    branchId: 'b1',
    branchName: 'Matriz',
    duration: 30
  }
];

export const agendaService = {
  getAgenda: async (params: { modo: string; data_referencia: string; filial_id?: string; profissional_id?: string }): Promise<AgendaItem[]> => {
    let filtered = [...mockAgenda];
    
    // In a real app, filtering would be more complex based on mode
    // For mock, we just filter by date and optional filters
    const refDate = params.data_referencia.split('T')[0];
    
    if (params.modo === 'dia') {
      filtered = filtered.filter(item => item.startTime.startsWith(refDate));
    }
    
    if (params.filial_id && params.filial_id !== 'todas') {
      filtered = filtered.filter(item => item.branchId === params.filial_id);
    }
    
    if (params.profissional_id && params.profissional_id !== 'todos') {
      filtered = filtered.filter(item => item.professionalId === params.profissional_id);
    }
    
    return filtered;
  },

  getDashboard: async (_params?: any): Promise<AgendaDashboardStats> => {
    const today = new Date().toISOString().split('T')[0];
    const todayItems = mockAgenda.filter(item => item.startTime.startsWith(today));
    
    return {
      pendentes: todayItems.filter(i => i.status === 'pendente').length,
      confirmadas: todayItems.filter(i => i.status === 'confirmado').length,
      totalDia: todayItems.length
    };
  },

  getCalendarMarks: async (_month?: number, _year?: number, _filialId?: any, _profissionalId?: any): Promise<CalendarMark[]> => {
    const marks: CalendarMark[] = [];
    const dates = new Set(mockAgenda.map(i => i.startTime.split('T')[0]));
    
    dates.forEach(date => {
      const items = mockAgenda.filter(i => i.startTime.startsWith(date));
      if (items.some(i => i.status === 'pendente')) {
        marks.push({ date, status: 'pendente' });
      } else if (items.some(i => i.status === 'confirmado')) {
        marks.push({ date, status: 'confirmado' });
      }
    });
    
    return marks;
  },

  confirmarAgenda: async (id: string): Promise<void> => {
    mockAgenda = mockAgenda.map(item => 
      item.id === id ? { ...item, status: 'confirmado' } : item
    );
  },

  confirm: async (id: string | number): Promise<void> => {
    const idStr = String(id);
    mockAgenda = mockAgenda.map(item => 
      item.id === idStr ? { ...item, status: 'confirmado' } : item
    );
  },

  create: async (data: any): Promise<void> => {
    const newItem: AgendaItem = {
      id: Math.random().toString(36).substr(2, 9),
      patientName: data.paciente,
      procedureId: 'new',
      procedureName: data.procedimento,
      startTime: `${data.data}T${data.hora}:00`,
      endTime: `${data.data}T${data.hora}:30`, // default 30 min
      status: data.status || 'pendente',
      professionalId: String(data.profissional_id),
      professionalName: data.profissional,
      branchId: String(data.filial_id),
      branchName: 'Filial',
      duration: 30
    };
    mockAgenda.push(newItem);
  },

  list: async (params: any): Promise<AgendaItem[]> => {
    return agendaService.getAgenda(params);
  },

  editarAgendamento: async (id: string, data: Partial<AgendaItem>): Promise<void> => {
    mockAgenda = mockAgenda.map(item => 
      item.id === id ? { ...item, ...data } : item
    );
  }
};
