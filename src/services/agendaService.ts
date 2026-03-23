import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  limit
} from "firebase/firestore";
import { handleFirestoreError, OperationType } from "./firestoreError";
import { AgendaItem, AgendaDashboardStats, CalendarMark, AgendaStatus } from "../types/agenda";

export const agendaService = {
  getAgenda: async (params: { modo: string; data_referencia: string; filial_id?: string; profissional_id?: string }): Promise<AgendaItem[]> => {
    try {
      let q = query(collection(db, "agenda"), orderBy("startTime", "asc"));
      
      const refDate = params.data_referencia.split('T')[0];
      const nextDay = new Date(refDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      if (params.modo === 'dia') {
        q = query(q, where("startTime", ">=", refDate), where("startTime", "<", nextDayStr));
      }
      
      if (params.filial_id && params.filial_id !== 'todas') {
        q = query(q, where("branchId", "==", params.filial_id));
      }
      
      if (params.profissional_id && params.profissional_id !== 'todos') {
        q = query(q, where("professionalId", "==", params.profissional_id));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgendaItem));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "agenda");
      return [];
    }
  },

  getDashboard: async (_params?: any): Promise<AgendaDashboardStats> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      const q = query(collection(db, "agenda"), where("startTime", ">=", today), where("startTime", "<", nextDayStr));
      const querySnapshot = await getDocs(q);
      const todayItems = querySnapshot.docs.map(doc => doc.data() as AgendaItem);
      
      return {
        pendentes: todayItems.filter(i => i.status === 'pendente').length,
        confirmadas: todayItems.filter(i => i.status === 'confirmado').length,
        totalDia: todayItems.length
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "agenda/dashboard");
      return { pendentes: 0, confirmadas: 0, totalDia: 0 };
    }
  },

  getCalendarMarks: async (_month?: number, _year?: number, _filialId?: any, _profissionalId?: any): Promise<CalendarMark[]> => {
    try {
      // For simplicity, fetch all and aggregate. In a real app, filter by month/year.
      const querySnapshot = await getDocs(collection(db, "agenda"));
      const items = querySnapshot.docs.map(doc => doc.data() as AgendaItem);
      
      const marks: CalendarMark[] = [];
      const dates = new Set(items.map(i => i.startTime.split('T')[0]));
      
      dates.forEach(date => {
        const dayItems = items.filter(i => i.startTime.startsWith(date));
        if (dayItems.some(i => i.status === 'pendente')) {
          marks.push({ date, status: 'pendente' });
        } else if (dayItems.some(i => i.status === 'confirmado')) {
          marks.push({ date, status: 'confirmado' });
        }
      });
      
      return marks;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "agenda/marks");
      return [];
    }
  },

  confirmarAgenda: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, "agenda", id);
      await updateDoc(docRef, { status: 'confirmado' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `agenda/${id}`);
      throw error;
    }
  },

  confirm: async (id: string | number): Promise<void> => {
    return agendaService.confirmarAgenda(String(id));
  },

  create: async (data: any): Promise<void> => {
    try {
      const newItem = {
        patientName: data.paciente,
        procedureId: data.procedimento_id || 'new',
        procedureName: data.procedimento,
        startTime: `${data.data}T${data.hora}:00`,
        endTime: `${data.data}T${data.hora}:30`, // default 30 min
        status: data.status || 'pendente',
        professionalId: String(data.profissional_id),
        professionalName: data.profissional,
        branchId: String(data.filial_id),
        branchName: data.filial_nome || 'Filial',
        duration: 30,
        createdAt: Timestamp.now()
      };
      await addDoc(collection(db, "agenda"), newItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "agenda");
      throw error;
    }
  },

  list: async (params: any): Promise<AgendaItem[]> => {
    return agendaService.getAgenda(params);
  },

  editarAgendamento: async (id: string, data: Partial<AgendaItem>): Promise<void> => {
    try {
      const docRef = doc(db, "agenda", id);
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `agenda/${id}`);
      throw error;
    }
  }
};
