import { 
  Procedimento, 
  ProcedimentoFilters, 
  ProcedimentoResponse, 
  ExportResponse,
  ESPECIALIDADES_PREFIX,
  Especialidade
} from "../types/procedimento";
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  getDoc
} from "firebase/firestore";

const generateNextCodigo = (especialidade: Especialidade, count: number): string => {
  const prefix = ESPECIALIDADES_PREFIX[especialidade];
  const nextNum = count + 1;
  return `${prefix}-${nextNum.toString().padStart(4, '0')}`;
};

export const procedimentoService = {
  async getProcedimentos(filters: ProcedimentoFilters): Promise<ProcedimentoResponse> {
    let q = query(collection(db, "procedimentos"), orderBy("nome", "asc"));

    if (filters.especialidade && filters.especialidade !== 'all') {
      q = query(q, where("especialidade", "==", filters.especialidade));
    }

    const querySnapshot = await getDocs(q);
    let filtered = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Procedimento));

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.nome.toLowerCase().includes(search) || 
        p.codigo.toLowerCase().includes(search)
      );
    }

    if (filters.min_valor !== undefined) {
      filtered = filtered.filter(p => p.valor >= filters.min_valor!);
    }

    if (filters.max_valor !== undefined) {
      filtered = filtered.filter(p => p.valor <= filters.max_valor!);
    }

    return { data: filtered };
  },

  async createProcedimento(data: Omit<Procedimento, 'id' | 'codigo'>): Promise<Procedimento> {
    const q = query(collection(db, "procedimentos"), where("especialidade", "==", data.especialidade));
    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;

    const newProcedimentoData = {
      ...data,
      codigo: generateNextCodigo(data.especialidade, count)
    };

    const docRef = await addDoc(collection(db, "procedimentos"), newProcedimentoData);
    return {
      id: docRef.id,
      ...newProcedimentoData
    } as Procedimento;
  },

  async updateProcedimento(id: string, data: Partial<Procedimento>): Promise<Procedimento> {
    const docRef = doc(db, "procedimentos", id);
    await updateDoc(docRef, data);
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as Procedimento;
  },

  async deleteProcedimento(id: string): Promise<void> {
    const docRef = doc(db, "procedimentos", id);
    await deleteDoc(docRef);
  },

  async export(filters: ProcedimentoFilters & { format: 'pdf' | 'xls' }): Promise<ExportResponse> {
    return {
      file_url: "#",
      file_name: `procedimentos.${filters.format}`,
      mensagem: "Exportação gerada com sucesso"
    };
  },

  // Integrations (Mocked for now as they are mostly side effects)
  async integracaoFinanceiro(data: { procedimento_id: string; paciente_id: string; valor: number; forma_pagamento: string }): Promise<void> {
    console.log("Integração Financeiro:", data);
  },

  async integracaoAgenda(procedimento_id: string): Promise<void> {
    console.log("Integração Agenda: Procedimento marcado como realizado", procedimento_id);
  },

  async integracaoOrcamento(procedimento_id: string, orcamento_id: string): Promise<void> {
    console.log("Integração Orçamento: Procedimento vinculado", { procedimento_id, orcamento_id });
  }
};
