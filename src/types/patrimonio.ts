export interface Patrimonio {
  id: number;
  nome: string;
  numero_serie: string;
  filial: string;
  filial_id: number;
  data_aquisicao: string;
  status: string;
  valor: number;
  observacoes: string;
}

export interface PatrimonioDetail extends Patrimonio {
  estado: string; // The API uses 'estado' in some responses and 'status' in others, I'll normalize or handle both
  historico_movimentacoes: Movimentacao[];
}

export interface Movimentacao {
  data: string;
  acao: string;
  detalhe: string;
  usuario: string;
}

export interface CreatePatrimonioDTO {
  nome: string;
  numero_serie: string;
  filial_id: number;
  data_aquisicao: string;
  valor: number;
  estado: string;
  observacoes: string;
}

export interface TransferPatrimonioDTO {
  destino_filial_id: number;
  data_transferencia: string;
  motivo: string;
}
