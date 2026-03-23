
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  limit
} from "firebase/firestore";
import { handleFirestoreError, OperationType } from "./firestoreError";
import { InventoryItem, StockEntry, StockExit, InventoryFilters, InventoryStats } from "../types/estoque";

export const estoqueService = {
  list: async (filters: InventoryFilters = {}): Promise<InventoryItem[]> => {
    try {
      let q = query(collection(db, "estoque"), orderBy("nome", "asc"));
      
      const querySnapshot = await getDocs(q);
      let items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as InventoryItem));

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
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "estoque");
      return [];
    }
  },

  getStats: async (): Promise<InventoryStats> => {
    try {
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
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "estoque/stats");
      return { total_itens: 0, baixo_estoque: 0, critico: 0, vencidos: 0, vencendo_30: 0 };
    }
  },

  create: async (item: Omit<InventoryItem, "id" | "status" | "ultima_atualizacao" | "quantidade">): Promise<InventoryItem> => {
    try {
      const newItemData = {
        ...item,
        quantidade: 0,
        status: "Crítico", // Starts with 0
        ultima_atualizacao: new Date().toISOString().split("T")[0],
        createdAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, "estoque"), newItemData);
      return {
        id: docRef.id,
        ...newItemData
      } as any as InventoryItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "estoque");
      throw error;
    }
  },

  registerEntry: async (entry: StockEntry): Promise<void> => {
    try {
      const docRef = doc(db, "estoque", String(entry.item_id));
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Item não encontrado");

      const item = docSnap.data() as InventoryItem;
      const newQuantidade = item.quantidade + entry.quantidade;
      
      let newStatus = "Normal";
      if (newQuantidade <= item.minimo / 2) newStatus = "Crítico";
      else if (newQuantidade <= item.minimo) newStatus = "Baixo";

      const updates: any = {
        quantidade: newQuantidade,
        status: newStatus,
        ultima_atualizacao: new Date().toISOString().split("T")[0]
      };

      if (entry.lote) updates.lote = entry.lote;
      if (entry.validade) updates.validade = entry.validade;

      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `estoque/${entry.item_id}`);
      throw error;
    }
  },

  registerExit: async (exit: StockExit): Promise<void> => {
    try {
      const docRef = doc(db, "estoque", String(exit.item_id));
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Item não encontrado");

      const item = docSnap.data() as InventoryItem;
      const newQuantidade = Math.max(0, item.quantidade - exit.quantidade);

      let newStatus = "Normal";
      if (newQuantidade <= item.minimo / 2) newStatus = "Crítico";
      else if (newQuantidade <= item.minimo) newStatus = "Baixo";

      await updateDoc(docRef, {
        quantidade: newQuantidade,
        status: newStatus,
        ultima_atualizacao: new Date().toISOString().split("T")[0]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `estoque/${exit.item_id}`);
      throw error;
    }
  },

  integracaoProcedimentoConsumo: async (procedimento_id: string, itens: { item_id: string | number, quantidade: number }[]): Promise<void> => {
    try {
      for (const itemConsumo of itens) {
        await estoqueService.registerExit({
          item_id: itemConsumo.item_id as any,
          quantidade: itemConsumo.quantidade,
          motivo: "Uso em Procedimento"
        });
      }
      console.log(`Consumo de estoque registrado para o procedimento ${procedimento_id}`);
    } catch (error) {
      console.error("Erro na integração de consumo de estoque:", error);
    }
  }
};
