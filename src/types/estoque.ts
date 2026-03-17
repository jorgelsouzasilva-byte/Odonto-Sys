
export type InventoryCategory = "Descartáveis" | "Anestésicos" | "Cimentos" | "Restauração" | "EPI" | "Instrumentais" | "Outros";
export type InventoryUnit = "Caixa" | "Seringa" | "Kit" | "Unidade" | "Pacote";
export type InventoryStatus = "Normal" | "Baixo" | "Crítico" | "Vencido" | "Vencendo";
export type ExitReason = "Uso em Procedimento" | "Perda" | "Vencimento" | "Transferência" | "Outros";

export interface InventoryItem {
  id: number;
  barcode?: string;
  nome: string;
  categoria: InventoryCategory;
  unidade: InventoryUnit;
  quantidade: number;
  minimo: number;
  observacoes?: string;
  lote?: string;
  validade?: string;
  ultima_atualizacao: string;
  status: InventoryStatus;
}

export interface StockEntry {
  item_id: number;
  quantidade: number;
  lote?: string;
  validade?: string;
  fornecedor?: string;
  nota_fiscal?: string;
  custo_total?: number;
  custo_unitario?: number;
}

export interface StockExit {
  item_id: number;
  quantidade: number;
  motivo: ExitReason;
}

export interface InventoryFilters {
  search?: string;
  categoria?: string;
  status?: string;
  validade_ate?: string;
}

export interface InventoryStats {
  total_itens: number;
  baixo_estoque: number;
  critico: number;
  vencidos: number;
  vencendo_30: number;
}
