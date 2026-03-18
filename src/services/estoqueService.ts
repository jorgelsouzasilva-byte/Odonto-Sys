
import { InventoryItem, StockEntry, StockExit, InventoryFilters, InventoryStats } from "../types/estoque";

const STORAGE_KEY = "odontosys_estoque";

const getInitialData = (): InventoryItem[] => [
  {
    id: 1,
    nome: "Resina Composta Z350",
    categoria: "Restauração",
    quantidade: 15,
    minimo: 10,
    status: "Normal",
    lote: "L2026A",
    validade: "2027-01-10",
    ultima_atualizacao: "2026-03-10",
    unidade: "Seringa",
    barcode: "7891234567890"
  },
  {
    id: 2,
    nome: "Anestésico Lidocaína 2%",
    categoria: "Anestésicos",
    quantidade: 5,
    minimo: 20,
    status: "Crítico",
    lote: "L2025B",
    validade: "2026-04-15",
    ultima_atualizacao: "2026-03-12",
    unidade: "Caixa",
    barcode: "7890001112223"
  },
  {
    id: 3,
    nome: "Luvas de Procedimento M",
    categoria: "Descartáveis",
    quantidade: 12,
    minimo: 15,
    status: "Baixo",
    lote: "L2026C",
    validade: "2028-05-20",
    ultima_atualizacao: "2026-03-15",
    unidade: "Caixa",
    barcode: "7893334445556"
  },
  {
    id: 4,
    nome: "Máscara Descartável",
    categoria: "EPI",
    quantidade: 0,
    minimo: 10,
    status: "Crítico",
    lote: "L2024D",
    validade: "2026-02-01",
    ultima_atualizacao: "2026-02-28",
    unidade: "Pacote",
    barcode: "7896667778889"
  }
] as any;

export const estoqueService = {
  list: async (filters: InventoryFilters = {}): Promise<InventoryItem[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    let items: InventoryItem[] = data ? JSON.parse(data) : getInitialData();

    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(i => i.nome.toLowerCase().includes(s) || i.barcode?.includes(s));
    }
    if (filters.categoria) {
      items = items.filter(i => i.categoria === filters.categoria);
    }
    if (filters.status) {
      items = items.filter(i => i.status === filters.status);
    }
    if (filters.validade_ate) {
      items = items.filter(i => i.validade && i.validade <= filters.validade_ate!);
    }

    return items;
  },

  getStats: async (): Promise<InventoryStats> => {
    const items = await estoqueService.list();
    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);

    return {
      total_itens: items.length,
      baixo_estoque: items.filter(i => i.quantidade <= i.minimo && i.quantidade > i.minimo / 2).length,
      critico: items.filter(i => i.quantidade <= i.minimo / 2).length,
      vencidos: items.filter(i => i.validade && new Date(i.validade) < hoje).length,
      vencendo_30: items.filter(i => i.validade && new Date(i.validade) >= hoje && new Date(i.validade) <= em30Dias).length,
    };
  },

  create: async (item: Omit<InventoryItem, "id" | "status" | "ultima_atualizacao" | "quantidade">): Promise<InventoryItem> => {
    const items = await estoqueService.list();
    const newItem: InventoryItem = {
      ...item,
      id: Math.max(0, ...items.map(i => i.id)) + 1,
      quantidade: 0,
      status: "Crítico", // Starts with 0
      ultima_atualizacao: new Date().toISOString().split("T")[0]
    };
    const updated = [...items, newItem];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  },

  registerEntry: async (entry: StockEntry): Promise<void> => {
    const items = await estoqueService.list();
    const index = items.findIndex(i => i.id === entry.item_id);
    if (index === -1) throw new Error("Item não encontrado");

    const item = items[index];
    item.quantidade += entry.quantidade;
    if (entry.lote) item.lote = entry.lote;
    if (entry.validade) item.validade = entry.validade;
    item.ultima_atualizacao = new Date().toISOString().split("T")[0];
    
    // Update status
    if (item.quantidade <= item.minimo / 2) item.status = "Crítico";
    else if (item.quantidade <= item.minimo) item.status = "Baixo";
    else item.status = "Normal";

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  registerExit: async (exit: StockExit): Promise<void> => {
    const items = await estoqueService.list();
    const index = items.findIndex(i => i.id === exit.item_id);
    if (index === -1) throw new Error("Item não encontrado");

    const item = items[index];
    item.quantidade = Math.max(0, item.quantidade - exit.quantidade);
    item.ultima_atualizacao = new Date().toISOString().split("T")[0];

    // Update status
    if (item.quantidade <= item.minimo / 2) item.status = "Crítico";
    else if (item.quantidade <= item.minimo) item.status = "Baixo";
    else item.status = "Normal";

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  integracaoProcedimentoConsumo: async (procedimento_id: number, itens: { item_id: number, quantidade: number }[]): Promise<void> => {
    // Simulate automatic stock deduction
    for (const itemConsumo of itens) {
      await estoqueService.registerExit({
        item_id: itemConsumo.item_id,
        quantidade: itemConsumo.quantidade,
        motivo: "Uso em Procedimento"
      });
    }
    console.log(`Consumo de estoque registrado para o procedimento ${procedimento_id}`);
  }
};
