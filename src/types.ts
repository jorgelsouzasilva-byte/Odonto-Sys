export enum UserRole {
  ADMIN_UNIDADE = 'admin_unidade',
  PROFISSIONAL = 'profissional',
}

export interface User {
  id: number;
  nome: string;
  email: string;
  roles: UserRole[];
}

export interface Dente {
  numero: number;
  faces: string[];
}

export interface ItemProcedimento {
  procedimento_id: number;
  profissional_id: number;
  dentes: Dente[];
  valor_base: number;
  desconto: number;
  valor_final: number;
}

export interface Pagamento {
  forma_pagamento: string;
  parcelas: number;
  status: 'pendente' | 'pago' | 'cancelado';
}

export interface Procedimento {
  id: number;
  paciente_id: number;
  paciente_nome?: string; // For UI display
  data_procedimento: string;
  itens: ItemProcedimento[];
  subtotal: number;
  desconto_geral: number;
  valor_final: number;
  pagamento: Pagamento;
  observacoes: string;
}

export interface ProcedimentoTipo {
  id: number;
  nome: string;
  valor_base: number;
}

export interface Profissional {
  id: number;
  nome: string;
}

export interface Paciente {
  id: number;
  nome: string;
}
