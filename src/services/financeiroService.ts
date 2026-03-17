import { 
  Transaction, 
  FinancialSummary, 
  FinancialFilters, 
  FinancialResponse, 
  PeriodNav, 
  ExportResponse 
} from "../types/financeiro";

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 601,
    data: "2026-03-16",
    descricao: "Clareamento Dental - Maria Silva",
    categoria: "Procedimento",
    metodo: "Cartão de Crédito",
    status: "Pago",
    tipo: "receita",
    valor: 850.00,
    filial_id: 1
  },
  {
    id: 602,
    data: "2026-03-15",
    descricao: "Compra de Materiais (Dental Cremer)",
    categoria: "Estoque",
    metodo: "Boleto",
    status: "Pago",
    tipo: "despesa",
    valor: -1240.50,
    filial_id: 1
  },
  {
    id: 603,
    data: "2026-03-15",
    descricao: "Limpeza - João Santos",
    categoria: "Procedimento",
    metodo: "Pix",
    status: "Pendente",
    tipo: "receita",
    valor: 250.00,
    filial_id: 1
  },
  {
    id: 604,
    data: "2026-03-14",
    descricao: "Conta de Luz",
    categoria: "Despesas Fixas",
    metodo: "Débito Automático",
    status: "Pago",
    tipo: "despesa",
    valor: -450.00,
    filial_id: 1
  },
  {
    id: 605,
    data: "2026-03-14",
    descricao: "Manutenção Equipamento",
    categoria: "Patrimônio",
    metodo: "Pix",
    status: "Pago",
    tipo: "despesa",
    valor: -300.00,
    filial_id: 1
  },
  {
    id: 606,
    data: "2026-03-13",
    descricao: "Canal - Pedro Costa (Parcela 1/3)",
    categoria: "Procedimento",
    metodo: "Cartão de Crédito",
    status: "Pago",
    tipo: "receita",
    valor: 400.00,
    filial_id: 1
  }
];

const getStoredTransactions = (): Transaction[] => {
  const stored = localStorage.getItem('odonto_transactions');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('odonto_transactions', JSON.stringify(MOCK_TRANSACTIONS));
  return MOCK_TRANSACTIONS;
};

const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem('odonto_transactions', JSON.stringify(transactions));
};

export const financeiroService = {
  async getTransactions(filters: FinancialFilters): Promise<FinancialResponse> {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    let filtered = getStoredTransactions();
    
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(t => t.tipo === filters.type);
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.filial_id) {
      filtered = filtered.filter(t => t.filial_id === filters.filial_id);
    }

    if (filters.categoria) {
      filtered = filtered.filter(t => t.categoria === filters.categoria);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.descricao.toLowerCase().includes(search) || 
        t.categoria.toLowerCase().includes(search)
      );
    }

    // Sort by date descending by default
    filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const page = filters.page || 1;
    const perPage = filters.per_page || 20;
    const total = filtered.length;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    
    return {
      meta: {
        page,
        per_page: perPage,
        total,
        period: filters.period,
        start_date: filters.start_date || "2026-03-01",
        end_date: filters.end_date || "2026-03-31"
      },
      data: filtered.slice(start, end)
    };
  },

  async getSummary(filters: FinancialFilters): Promise<FinancialSummary> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const transactions = getStoredTransactions();
    
    const receitas = transactions
      .filter(t => t.tipo === 'receita' && t.status === 'Pago')
      .reduce((acc, t) => acc + t.valor, 0);
      
    const despesas = Math.abs(transactions
      .filter(t => t.tipo === 'despesa' && t.status === 'Pago')
      .reduce((acc, t) => acc + t.valor, 0));

    const a_receber = transactions
      .filter(t => t.tipo === 'receita' && t.status === 'Pendente')
      .reduce((acc, t) => acc + t.valor, 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      a_receber_hoje: a_receber
    };
  },

  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const transactions = getStoredTransactions();
    const newTransaction = {
      ...data,
      id: Math.max(0, ...transactions.map(t => t.id)) + 1
    };
    saveTransactions([newTransaction, ...transactions]);
    return newTransaction;
  },

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const transactions = getStoredTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Transação não encontrada");
    
    const updated = { ...transactions[index], ...data };
    transactions[index] = updated;
    saveTransactions(transactions);
    return updated;
  },

  async deleteTransaction(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const transactions = getStoredTransactions();
    saveTransactions(transactions.filter(t => t.id !== id));
  },

  async export(filters: FinancialFilters & { format: 'pdf' | 'xls' }): Promise<ExportResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!filters.format) {
      throw { status: 400, error: "Formato inválido para exportação" };
    }

    return {
      file_url: `https://mockserver.local/exports/financeiro_2026-03_report.${filters.format}`,
      file_name: `financeiro_2026-03_report.${filters.format}`,
      mensagem: "Exportação gerada com sucesso"
    };
  },

  async getPeriodNav(period: string, currentDate: string): Promise<PeriodNav> {
    await new Promise(resolve => setTimeout(resolve, 120));
    // Simplified mock logic
    return {
      current: { start_date: "2026-03-01", end_date: "2026-03-31" },
      prev: { start_date: "2026-02-01", end_date: "2026-02-28" },
      next: { start_date: "2026-04-01", end_date: "2026-04-30" }
    };
  }
};
