
export interface Paciente {
  id: number;
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
  id: number;
  pacienteId: number;
  profissionalId: number;
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
  procedimentoId: number;
  procedimentoNome: string;
  valor: number;
  formaPagamento?: string;
  observacoes?: string;
}

export interface Orcamento {
  id: number;
  pacienteId: number;
  data: string;
  itens: OrcamentoItem[];
  subtotal: number;
  desconto: number;
  total: number;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
}
