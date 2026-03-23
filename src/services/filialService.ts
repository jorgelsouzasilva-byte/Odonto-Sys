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

export interface Filial {
  id: string;
  nome: string;
  status: string;
  endereco: string;
  telefone: string;
  email: string;
  cnpj: string;
  observacoes?: string;
  horario_funcionamento?: string;
  responsavel?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface FuncionarioFilial {
  id: string;
  nome: string;
  cargo: string;
  email: string;
}

export const filialService = {
  getFiliais: async (status?: string) => {
    try {
      let q = query(collection(db, "filiais"), orderBy("nome", "asc"));
      if (status) {
        q = query(q, where("status", "==", status));
      }
      const querySnapshot = await getDocs(q);
      return {
        data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Filial))
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "filiais");
      return { data: [] };
    }
  },

  getFilialById: async (id: string) => {
    try {
      const docRef = doc(db, "filiais", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Filial não encontrada");
      return { id: docSnap.id, ...docSnap.data() } as Filial;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `filiais/${id}`);
      throw error;
    }
  },

  createFilial: async (data: any) => {
    try {
      // Validation
      if (!data.nome || data.nome.length < 2) throw new Error("Nome é obrigatório");
      if (!data.cnpj || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj)) {
        throw new Error("CNPJ inválido");
      }
      if (!data.endereco) throw new Error("Endereço é obrigatório");

      const q = query(collection(db, "filiais"), where("cnpj", "==", data.cnpj));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("Filial com mesmo CNPJ já existe");
      }

      const docRef = await addDoc(collection(db, "filiais"), {
        ...data,
        createdAt: Timestamp.now()
      });
      
      return {
        id: docRef.id,
        nome: data.nome,
        mensagem: "Filial criada com sucesso"
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "filiais");
      throw error;
    }
  },

  updateFilial: async (id: string, data: any) => {
    try {
      const docRef = doc(db, "filiais", id);
      await updateDoc(docRef, data);

      return {
        id,
        mensagem: "Filial atualizada com sucesso"
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `filiais/${id}`);
      throw error;
    }
  },

  deleteFilial: async (id: string) => {
    try {
      // Check for active staff in this filial
      const q = query(collection(db, "funcionarios"), where("filial_id", "==", id), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("Não é possível remover filial com funcionários ativos");
      }

      const docRef = doc(db, "filiais", id);
      await deleteDoc(docRef);
      return {
        mensagem: "Filial removida/inaltivada com sucesso"
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `filiais/${id}`);
      throw error;
    }
  },

  getFuncionariosPorFilial: async (id: string) => {
    try {
      const q = query(collection(db, "funcionarios"), where("filial_id", "==", id), orderBy("nome", "asc"));
      const querySnapshot = await getDocs(q);
      return {
        data: querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          nome: doc.data().nome, 
          cargo: doc.data().cargo, 
          email: doc.data().email 
        } as FuncionarioFilial))
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `funcionarios?filial_id=${id}`);
      return { data: [] };
    }
  }
};
