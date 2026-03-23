
export interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  status: string;
  cpf?: string;
  dataNascimento?: string;
  genero?: string;
  endereco?: {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
}

export interface Anamnese {
  id: string;
  pacienteId: string;
  profissionalId: string;
  profissional: string;
  data: string;
  queixa_principal: string;
  tratamento_medico: boolean;
  medicamentos: string;
  alergias: string;
  hospitalizacoes: string;
  doencas: string[];
  sensibilidade: boolean;
  sangramento: boolean;
  bruxismo: boolean;
  ultima_consulta: string;
  reacao_anestesia: string;
  fuma: boolean;
  alcool: boolean;
  cafe: boolean;
  mastiga_objetos: boolean;
  gestante: boolean;
  amamentando: boolean;
  cicatrizacao: boolean;
  coagulacao: boolean;
  observacoes: string;
  resumo?: string;
}

export interface OrcamentoItem {
  id: string;
  dente: string;
  superficies: string[];
  procedimentoId: string;
  procedimentoNome: string;
  valor: number;
  formaPagamento?: string;
  observacoes?: string;
}

export interface Orcamento {
  id: string;
  pacienteId: string;
  data: string;
  itens: OrcamentoItem[];
  subtotal: number;
  desconto: number;
  total: number;
  status: 'Pendente' | 'Aprovado' | 'Cancelado' | 'Recusado';
  formaPagamento?: string;
  observacoes?: string;
}

export interface Financeiro {
  id: string;
  pacienteId: string;
  profissionalId?: string;
  data: string;
  descricao: string;
  valor: number;
  formaPagamento?: string;
  status: 'Pendente' | 'Pago' | 'Cancelado';
}

export interface EvolucaoItem {
  id?: string;
  procedimentoId: string | number;
  profissionalId: string | number;
  dentes: { dente: number; faces: string[] }[];
  valorBase: number;
  desconto: number;
  valorFinal: number;
  observacoes?: string;
}

export interface Evolucao {
  id: string;
  pacienteId: string | number;
  profissionalId?: string | number;
  profissional?: string;
  data: string;
  queixa?: string;
  exame_clinico?: string;
  diagnostico?: string;
  plano_tratamento?: string;
  itens: EvolucaoItem[];
  observacoes?: string;
  observacoesGerais?: string;
  totais?: {
    subtotal: number;
    descontoGeral: number;
    valorFinal: number;
  };
  pagamento?: {
    formaPagamento: string;
    parcelas: number;
    dataPagamento: string;
    status: string;
    observacoes: string;
  };
  texto?: string;
}
