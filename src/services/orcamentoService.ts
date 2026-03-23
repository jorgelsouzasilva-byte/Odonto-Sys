
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { Orcamento, OrcamentoItem } from "../types/paciente";
import { financeiroService } from "./financeiroService";

export const orcamentoService = {
  async getOrcamentos(pacienteId: string): Promise<Orcamento[]> {
    const q = query(
      collection(db, "orcamentos"),
      where("pacienteId", "==", pacienteId),
      orderBy("data", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Orcamento[];
  },

  async createOrcamento(data: Omit<Orcamento, 'id'>): Promise<Orcamento> {
    const docRef = await addDoc(collection(db, "orcamentos"), {
      ...data,
      createdAt: serverTimestamp()
    });
    return {
      ...data,
      id: docRef.id
    } as Orcamento;
  },

  async aprovarOrcamento(id: string): Promise<Orcamento> {
    const docRef = doc(db, "orcamentos", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Orçamento não encontrado");
    
    const currentData = docSnap.data() as Orcamento;
    await updateDoc(docRef, { status: 'Aprovado' });
    
    const updated = { ...currentData, id: docSnap.id, status: 'Aprovado' as const };

    // Create financial entry
    await financeiroService.createLancamento({
      pacienteId: updated.pacienteId,
      data: new Date().toISOString().split('T')[0],
      descricao: `Orçamento #${updated.id} aprovado`,
      valor: updated.total,
      formaPagamento: updated.formaPagamento,
      status: 'Pendente'
    });

    return updated;
  },

  async cancelarOrcamento(id: string): Promise<Orcamento> {
    const docRef = doc(db, "orcamentos", id);
    await updateDoc(docRef, { status: 'Cancelado' });
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as Orcamento;
  }
};
