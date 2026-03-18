
import { Financeiro } from "../types/paciente";

const getStoredFinanceiro = (): Financeiro[] => {
  const stored = localStorage.getItem('odonto_financeiro');
  if (stored) return JSON.parse(stored);
  return [];
};

const saveFinanceiro = (financeiro: Financeiro[]) => {
  localStorage.setItem('odonto_financeiro', JSON.stringify(financeiro));
};

const initialTransactions: any[] = [
  { id: 1001, data: '2026-03-15', descricao: 'Consulta Maria Silva', categoria: 'Ortodontia', metodo: 'Pix', status: 'Pago', tipo: 'receita', valor: 250.00, filial_id: 1 },
  { id: 1002, data: '2026-03-16', descricao: 'Aluguel Sala', categoria: 'Infraestrutura', metodo: 'Boleto', status: 'Pago', tipo: 'despesa', valor: -2500.00, filial_id: 1 },
  { id: 1003, data: '2026-03-17', descricao: 'Implante João Santos', categoria: 'Implantodontia', metodo: 'Cartão de Crédito', status: 'Pendente', tipo: 'receita', valor: 1500.00, filial_id: 1 },
];

const getStoredTransactions = (): any[] => {
  const stored = localStorage.getItem('odonto_transactions');
  if (stored) return JSON.parse(stored);
  return initialTransactions;
};

const saveTransactions = (transactions: any[]) => {
  localStorage.setItem('odonto_transactions', JSON.stringify(transactions));
};

export const financeiroService = {
  async getFinanceiro(pacienteId: number): Promise<Financeiro[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const financeiro = getStoredFinanceiro();
    return financeiro.filter(f => f.pacienteId === pacienteId);
  },

  async createLancamento(data: Omit<Financeiro, 'id'>): Promise<Financeiro> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const financeiro = getStoredFinanceiro();
    const newLancamento: Financeiro = {
      ...data,
      id: Math.max(0, ...financeiro.map(f => f.id)) + 1
    };
    saveFinanceiro([newLancamento, ...financeiro]);

    // Sync with general transactions
    const transactions = getStoredTransactions();
    transactions.unshift({
      id: newLancamento.id,
      data: newLancamento.data,
      descricao: newLancamento.descricao,
      categoria: 'Tratamento',
      metodo: newLancamento.formaPagamento || '-',
      status: newLancamento.status,
      tipo: 'receita',
      valor: newLancamento.valor,
      filial_id: 1
    });
    saveTransactions(transactions);

    return newLancamento;
  },

  async registrarPagamento(id: number, formaPagamento: string): Promise<Financeiro> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const financeiro = getStoredFinanceiro();
    const index = financeiro.findIndex(f => f.id === id);
    if (index === -1) throw new Error("Lançamento não encontrado");
    
    const updated = { 
      ...financeiro[index], 
      status: 'Pago' as const,
      formaPagamento 
    };
    financeiro[index] = updated;
    saveFinanceiro(financeiro);

    // Sync with general transactions
    const transactions = getStoredTransactions();
    const gIndex = transactions.findIndex(t => t.id === id);
    if (gIndex !== -1) {
      transactions[gIndex].status = 'Pago';
      transactions[gIndex].metodo = formaPagamento;
      saveTransactions(transactions);
    }

    return updated;
  },

  // General dashboard methods (for Financial.tsx)
  async getTransactions(filters: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    let all = getStoredTransactions();
    
    if (filters.type && filters.type !== 'all') {
      all = all.filter((t: any) => t.tipo === filters.type);
    }
    if (filters.status && filters.status !== 'all') {
      all = all.filter((t: any) => t.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      all = all.filter((t: any) => t.descricao.toLowerCase().includes(search));
    }

    return {
      data: all,
      meta: { total: all.length }
    };
  },

  async getSummary(filters: any) {
    const { data } = await this.getTransactions(filters);
    const receitas = data.filter((t: any) => t.tipo === 'receita').reduce((acc: number, t: any) => acc + t.valor, 0);
    const despesas = data.filter((t: any) => t.tipo === 'despesa').reduce((acc: number, t: any) => acc + Math.abs(t.valor), 0);
    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      a_receber_hoje: data.filter((t: any) => t.status === 'Pendente' && t.tipo === 'receita').reduce((acc: number, t: any) => acc + t.valor, 0)
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

  async updateTransaction(id: number, data: any) {
    const transactions = getStoredTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...data };
      saveTransactions(transactions);
      return transactions[index];
    }
    throw new Error('Transação não encontrada');
  },

  async createTransaction(data: any) {
    const transactions = getStoredTransactions();
    const newTrans = { ...data, id: Date.now() };
    transactions.unshift(newTrans);
    saveTransactions(transactions);
    return newTrans;
  },

  async deleteTransaction(id: number) {
    const transactions = getStoredTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    saveTransactions(filtered);
  }
};
