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
  orderBy 
} from "firebase/firestore";
import { handleFirestoreError, OperationType } from "./firestoreError";

export interface Filial {
  id: string;
  nome: string;
  endereco: string;
}

export interface Modulo {
  id: string;
  nome: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  cargo: string;
  filial_id: string;
  filial?: string;
  status: string;
  observacoes?: string;
  cro?: string;
  dentista?: any;
  usuario?: any;
}

export interface Permissao {
  modulo: string;
  visualizar: boolean;
  editar: boolean;
  excluir: boolean;
}

export const equipeService = {
  getFiliais: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "filiais"));
      return {
        data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Filial))
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "filiais");
      return { data: [] };
    }
  },

  getModulos: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "modulos"));
      return {
        data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Modulo))
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "modulos");
      return { data: [] };
    }
  },

  getFuncionarios: async (filial_id?: string) => {
    try {
      let q = query(collection(db, "funcionarios"), orderBy("nome", "asc"));
      if (filial_id) {
        q = query(q, where("filial_id", "==", filial_id));
      }
      const querySnapshot = await getDocs(q);
      return {
        data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Funcionario))
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "funcionarios");
      return { data: [] };
    }
  },

  getDentistas: async () => {
    try {
      const q = query(collection(db, "funcionarios"), where("cargo", "==", "Dentista"), orderBy("nome", "asc"));
      const querySnapshot = await getDocs(q);
      return {
        data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Funcionario))
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "funcionarios/dentistas");
      return { data: [] };
    }
  },

  getProfissionais: async () => {
    try {
      const q = query(collection(db, "funcionarios"), where("cargo", "==", "Dentista"), orderBy("nome", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Funcionario));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "funcionarios/profissionais");
      return [];
    }
  },

  getFuncionarioById: async (id: string) => {
    try {
      const docRef = doc(db, "funcionarios", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Funcionário não encontrado");
      return { id: docSnap.id, ...docSnap.data() } as Funcionario;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `funcionarios/${id}`);
      throw error;
    }
  },

  createFuncionario: async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, "funcionarios"), data);
      return {
        id: docRef.id,
        nome: data.nome,
        mensagem: "Funcionário criado com sucesso"
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "funcionarios");
      throw error;
    }
  },

  updateFuncionario: async (id: string, data: any) => {
    try {
      const docRef = doc(db, "funcionarios", id);
      await updateDoc(docRef, data);
      return {
        id,
        mensagem: "Funcionário atualizado com sucesso"
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `funcionarios/${id}`);
      throw error;
    }
  },

  createDentista: async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, "dentistas"), data);
      // Update the func with cro if needed
      if (data.funcionario_id) {
        const funcRef = doc(db, "funcionarios", data.funcionario_id);
        await updateDoc(funcRef, { cro: data.cro });
      }
      return {
        id: docRef.id,
        funcionario_id: data.funcionario_id,
        mensagem: "Registro de dentista criado"
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "dentistas");
      throw error;
    }
  },

  createUsuario: async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, "usuarios"), data);
      return {
        id: docRef.id,
        login: data.login,
        mensagem: "Usuário criado com sucesso"
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "usuarios");
      throw error;
    }
  },

  applyPermissoes: async (data: any) => {
    try {
      await addDoc(collection(db, "permissoes"), data);
      return {
        mensagem: "Permissões aplicadas"
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "permissoes");
      throw error;
    }
  }
};
