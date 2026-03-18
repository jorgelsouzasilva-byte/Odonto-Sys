
import { Orcamento, OrcamentoItem } from "../types/paciente";
import { financeiroService } from "./financeiroService";

const MOCK_ORCAMENTOS: Orcamento[] = [];

const getStoredOrcamentos = (): Orcamento[] => {
  const stored = localStorage.getItem('odonto_orcamentos');
  if (stored) return JSON.parse(stored);
  return MOCK_ORCAMENTOS;
};

const saveOrcamentos = (orcamentos: Orcamento[]) => {
  localStorage.setItem('odonto_orcamentos', JSON.stringify(orcamentos));
};

export const orcamentoService = {
  async getOrcamentos(pacienteId: number): Promise<Orcamento[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const orcamentos = getStoredOrcamentos();
    return orcamentos.filter(o => o.pacienteId === pacienteId);
  },

  async createOrcamento(data: Omit<Orcamento, 'id'>): Promise<Orcamento> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const orcamentos = getStoredOrcamentos();
    const newOrcamento: Orcamento = {
      ...data,
      id: Math.max(0, ...orcamentos.map(o => o.id)) + 1
    };
    saveOrcamentos([newOrcamento, ...orcamentos]);
    return newOrcamento;
  },

  async aprovarOrcamento(id: number): Promise<Orcamento> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const orcamentos = getStoredOrcamentos();
    const index = orcamentos.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Orçamento não encontrado");
    
    const updated = { ...orcamentos[index], status: 'Aprovado' as const };
    orcamentos[index] = updated;
    saveOrcamentos(orcamentos);

    // Create financial entry
    await financeiroService.createLancamento({
      pacienteId: updated.pacienteId,
      data: new Date().toLocaleDateString('pt-BR'),
      descricao: `Orçamento #${updated.id} aprovado`,
      valor: updated.total,
      formaPagamento: updated.formaPagamento,
      status: 'Pendente'
    });

    return updated;
  },

  async cancelarOrcamento(id: number): Promise<Orcamento> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const orcamentos = getStoredOrcamentos();
    const index = orcamentos.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Orçamento não encontrado");
    
    const updated = { ...orcamentos[index], status: 'Cancelado' as const };
    orcamentos[index] = updated;
    saveOrcamentos(orcamentos);
    return updated;
  }
};
