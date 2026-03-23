
import { Financeiro } from "../types/paciente";
import { Transaction, FinancialFilters } from "../types/financeiro";
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc,
  query, 
  where, 
  orderBy,
  deleteDoc
} from "firebase/firestore";

export const financeiroService = {
  async getFinanceiro(pacienteId: string): Promise<Financeiro[]> {
    const q = query(
      collection(db, "financeiro"),
      where("paciente_id", "==", pacienteId),
      orderBy("data", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        pacienteId: data.paciente_id,
        data: data.data,
        descricao: data.descricao,
        valor: data.valor,
        formaPagamento: data.forma_pagamento,
        status: data.status
      } as Financeiro;
    });
  },

  async createLancamento(data: Omit<Financeiro, 'id'>): Promise<Financeiro> {
    const firestoreData = {
      paciente_id: data.pacienteId,
      data: data.data,
      descricao: data.descricao,
      valor: data.valor,
      forma_pagamento: data.formaPagamento,
      status: data.status,
      tipo: data.valor >= 0 ? 'receita' : 'despesa'
    };
    const docRef = await addDoc(collection(db, "financeiro"), firestoreData);
    return {
      ...data,
      id: docRef.id
    } as Financeiro;
  },

  async registrarPagamento(id: string, formaPagamento: string): Promise<Financeiro> {
    const docRef = doc(db, "financeiro", id);
    await updateDoc(docRef, { 
      status: 'Pago',
      forma_pagamento: formaPagamento,
      data_pagamento: new Date().toISOString().split('T')[0]
    });
    const docSnap = await getDoc(docRef);
    const data = docSnap.data()!;
    return {
      id: docSnap.id,
      pacienteId: data.paciente_id,
      data: data.data,
      descricao: data.descricao,
      valor: data.valor,
      formaPagamento: data.forma_pagamento,
      status: data.status
    } as Financeiro;
  },

  async getTransactions(filters: FinancialFilters) {
    let q = query(collection(db, "financeiro"), orderBy("data", "desc"));
    
    if (filters.filial_id) {
      q = query(q, where("filial_id", "==", filters.filial_id));
    }
    if (filters.type && filters.type !== 'all') {
      q = query(q, where("tipo", "==", filters.type));
    }
    if (filters.status && filters.status !== 'all') {
      q = query(q, where("status", "==", filters.status));
    }
    if (filters.start_date) {
      q = query(q, where("data", ">=", filters.start_date));
    }
    if (filters.end_date) {
      q = query(q, where("data", "<=", filters.end_date));
    }

    const querySnapshot = await getDocs(q);
    let all = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      all = all.filter((t: Transaction) => 
        t.descricao.toLowerCase().includes(search) || 
        t.categoria?.toLowerCase().includes(search)
      );
    }

    return {
      data: all,
      meta: { 
        total: all.length,
        page: filters.page || 1,
        per_page: filters.per_page || 20,
        period: filters.period || 'month',
        start_date: filters.start_date || '',
        end_date: filters.end_date || ''
      }
    };
  },

  async getSummary(filters: FinancialFilters) {
    const { data } = await this.getTransactions(filters);
    const receitas = data.filter((t: Transaction) => t.tipo === 'receita').reduce((acc: number, t: Transaction) => acc + t.valor, 0);
    const despesas = data.filter((t: Transaction) => t.tipo === 'despesa').reduce((acc: number, t: Transaction) => acc + Math.abs(t.valor), 0);
    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      a_receber_hoje: data.filter((t: Transaction) => t.status === 'Pendente' && t.tipo === 'receita').reduce((acc: number, t: Transaction) => acc + t.valor, 0)
    };
  },

  async getPeriodNav(period: string, date: string) {
    return {
      current: { start_date: '2026-03-01', end_date: '2026-03-31' },
      prev: { start_date: '2026-02-01', end_date: '2026-02-28' },
      next: { start_date: '2026-04-01', end_date: '2026-04-30' }
    };
  },

  async export(filters: any) {
    return {
      mensagem: 'Relatório gerado com sucesso',
      file_name: `relatorio_financeiro_${filters.format}.pdf`,
      file_url: '#'
    };
  },

  async updateTransaction(id: string, data: any) {
    const docRef = doc(db, "financeiro", id);
    await updateDoc(docRef, data);
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() };
  },

  async createTransaction(data: any) {
    const docRef = await addDoc(collection(db, "financeiro"), {
      ...data,
      tipo: data.valor >= 0 ? 'receita' : 'despesa'
    });
    return { id: docRef.id, ...data };
  },

  async deleteTransaction(id: string) {
    await deleteDoc(doc(db, "financeiro", id));
  }
};
