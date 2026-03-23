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
import { Patrimonio, PatrimonioDetail, CreatePatrimonioDTO, TransferPatrimonioDTO } from "../types/patrimonio";

export const patrimonioService = {
  getPatrimonio: async (filial_id?: string, status?: string): Promise<{ data: Patrimonio[] }> => {
    try {
      let q = query(collection(db, "patrimonio"), orderBy("nome", "asc"));
      if (filial_id) {
        q = query(q, where("filial_id", "==", filial_id));
      }
      if (status) {
        q = query(q, where("status", "==", status));
      }
      const querySnapshot = await getDocs(q);
      return {
        data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as Patrimonio))
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "patrimonio");
      return { data: [] };
    }
  },

  getById: async (id: string): Promise<PatrimonioDetail> => {
    try {
      const docRef = doc(db, "patrimonio", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Item não encontrado");

      const item = { id: docSnap.id, ...docSnap.data() } as any as Patrimonio;

      // Fetch history (mocked for now, or could be a subcollection)
      return {
        ...item,
        estado: item.status,
        historico_movimentacoes: [
          { data: item.data_aquisicao, acao: "Entrada", detalhe: "Compra", usuario: "Sistema" }
        ]
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `patrimonio/${id}`);
      throw error;
    }
  },

  create: async (payload: CreatePatrimonioDTO): Promise<any> => {
    try {
      const q = query(collection(db, "patrimonio"), where("numero_serie", "==", payload.numero_serie));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("Número de série já cadastrado");
      }

      const docRef = await addDoc(collection(db, "patrimonio"), {
        ...payload,
        status: payload.estado,
        createdAt: Timestamp.now()
      });

      return { id: docRef.id, nome: payload.nome, mensagem: "Item de patrimônio criado com sucesso" };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "patrimonio");
      throw error;
    }
  },

  update: async (id: string, payload: CreatePatrimonioDTO): Promise<any> => {
    try {
      const docRef = doc(db, "patrimonio", id);
      await updateDoc(docRef, {
        ...payload,
        status: payload.estado
      });
      return { id, mensagem: "Item de patrimônio atualizado com sucesso" };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `patrimonio/${id}`);
      throw error;
    }
  },

  delete: async (id: string): Promise<any> => {
    try {
      const docRef = doc(db, "patrimonio", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().status === "Manutenção") {
        throw new Error("Não é possível remover item em manutenção");
      }

      await deleteDoc(docRef);
      return { mensagem: "Item removido/descartado com sucesso" };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `patrimonio/${id}`);
      throw error;
    }
  },

  transfer: async (id: string, payload: TransferPatrimonioDTO): Promise<any> => {
    try {
      const docRef = doc(db, "patrimonio", id);
      await updateDoc(docRef, {
        filial_id: payload.destino_filial_id,
        filial: payload.observacoes || "Transferido" // In a real app, fetch filial name
      });
      return { mensagem: "Transferência registrada com sucesso", novo_filial_id: payload.destino_filial_id };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `patrimonio/${id}/transfer`);
      throw error;
    }
  }
};
