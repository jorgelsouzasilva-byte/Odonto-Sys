export type Especialidade = 'Estética' | 'Endodontia' | 'Cirurgia' | 'Prevenção' | 'Dentística' | 'Ortodontia' | 'Implantodontia';

export interface Procedimento {
  id: number;
  codigo: string;
  nome: string;
  especialidade: Especialidade;
  valor: number;
  descricao?: string;
}

export interface ProcedimentoFilters {
  especialidade?: Especialidade | 'all';
  search?: string;
  min_valor?: number;
  max_valor?: number;
}

export interface ProcedimentoResponse {
  data: Procedimento[];
}

export interface ExportResponse {
  file_url: string;
  file_name: string;
  mensagem: string;
}

export const ESPECIALIDADES_PREFIX: Record<Especialidade, string> = {
  'Estética': 'EST',
  'Endodontia': 'END',
  'Cirurgia': 'CIR',
  'Prevenção': 'PRE',
  'Dentística': 'DEN',
  'Ortodontia': 'ORT',
  'Implantodontia': 'IMP'
};
