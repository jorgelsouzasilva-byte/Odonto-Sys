export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'Pago' | 'Pendente';
export type PeriodType = 'day' | 'month' | 'year' | 'custom';

export interface Transaction {
  id: string;
  data: string;
  descricao: string;
  categoria?: string;
  metodo?: string;
  status: TransactionStatus;
  tipo: TransactionType;
  valor: number;
  filial_id?: string | number;
}

export interface FinancialSummary {
  receitas: number;
  despesas: number;
  saldo: number;
  a_receber_hoje: number;
}

export interface FinancialFilters {
  period: PeriodType;
  start_date?: string;
  end_date?: string;
  type?: 'all' | TransactionType;
  status?: 'all' | TransactionStatus;
  filial_id?: string | number;
  categoria?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'date' | 'valor';
  sort_dir?: 'asc' | 'desc';
}

export interface FinancialResponse {
  meta: {
    page: number;
    per_page: number;
    total: number;
    period: PeriodType;
    start_date: string;
    end_date: string;
  };
  data: Transaction[];
}

export interface PeriodNav {
  current: { start_date: string; end_date: string };
  prev: { start_date: string; end_date: string };
  next: { start_date: string; end_date: string };
}

export interface ExportResponse {
  file_url: string;
  file_name: string;
  mensagem: string;
}
