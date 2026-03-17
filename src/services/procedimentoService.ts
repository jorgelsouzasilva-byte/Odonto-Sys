import { 
  Procedimento, 
  ProcedimentoFilters, 
  ProcedimentoResponse, 
  ExportResponse,
  ESPECIALIDADES_PREFIX,
  Especialidade
} from "../types/procedimento";

const MOCK_PROCEDIMENTOS: Procedimento[] = [
  {
    id: 501,
    nome: "Clareamento Dental",
    especialidade: "Estética",
    codigo: "EST-0001",
    valor: 850.00,
    descricao: "Clareamento a laser realizado em consultório."
  },
  {
    id: 502,
    nome: "Canal",
    especialidade: "Endodontia",
    codigo: "END-0001",
    valor: 400.00,
    descricao: "Tratamento endodôntico de dente anterior."
  },
  {
    id: 503,
    nome: "Limpeza (Profilaxia)",
    especialidade: "Prevenção",
    codigo: "PRE-0001",
    valor: 250.00,
    descricao: "Remoção de tártaro e polimento coronário."
  }
];

const getStoredProcedimentos = (): Procedimento[] => {
  const stored = localStorage.getItem('odonto_procedimentos');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('odonto_procedimentos', JSON.stringify(MOCK_PROCEDIMENTOS));
  return MOCK_PROCEDIMENTOS;
};

const saveProcedimentos = (procedimentos: Procedimento[]) => {
  localStorage.setItem('odonto_procedimentos', JSON.stringify(procedimentos));
};

const generateNextCodigo = (especialidade: Especialidade, procedimentos: Procedimento[]): string => {
  const prefix = ESPECIALIDADES_PREFIX[especialidade];
  const sameSpec = procedimentos.filter(p => p.especialidade === especialidade);
  const nextNum = sameSpec.length + 1;
  return `${prefix}-${nextNum.toString().padStart(4, '0')}`;
};

export const procedimentoService = {
  async getProcedimentos(filters: ProcedimentoFilters): Promise<ProcedimentoResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = getStoredProcedimentos();

    if (filters.especialidade && filters.especialidade !== 'all') {
      filtered = filtered.filter(p => p.especialidade === filters.especialidade);
    }

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
    await new Promise(resolve => setTimeout(resolve, 500));
    const procedimentos = getStoredProcedimentos();
    
    const newProcedimento: Procedimento = {
      ...data,
      id: Math.max(0, ...procedimentos.map(p => p.id)) + 1,
      codigo: generateNextCodigo(data.especialidade, procedimentos)
    };

    saveProcedimentos([newProcedimento, ...procedimentos]);
    return newProcedimento;
  },

  async updateProcedimento(id: number, data: Partial<Procedimento>): Promise<Procedimento> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const procedimentos = getStoredProcedimentos();
    const index = procedimentos.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Procedimento não encontrado");

    const updated = { ...procedimentos[index], ...data };
    procedimentos[index] = updated;
    saveProcedimentos(procedimentos);
    return updated;
  },

  async deleteProcedimento(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const procedimentos = getStoredProcedimentos();
    saveProcedimentos(procedimentos.filter(p => p.id !== id));
  },

  async export(filters: ProcedimentoFilters & { format: 'pdf' | 'xls' }): Promise<ExportResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      file_url: `https://mock.local/export/procedimentos.${filters.format}`,
      file_name: `procedimentos.${filters.format}`,
      mensagem: "Exportação gerada com sucesso"
    };
  },

  // Integrations
  async integracaoFinanceiro(data: { procedimento_id: number; paciente_id: number; valor: number; forma_pagamento: string }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("Integração Financeiro:", data);
  },

  async integracaoAgenda(procedimento_id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("Integração Agenda: Procedimento marcado como realizado", procedimento_id);
  },

  async integracaoOrcamento(procedimento_id: number, orcamento_id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("Integração Orçamento: Procedimento vinculado", { procedimento_id, orcamento_id });
  }
};
