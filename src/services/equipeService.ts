export interface Filial {
  id: number;
  nome: string;
  endereco: string;
}

export interface Modulo {
  id: number;
  nome: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  cargo: string;
  filial_id: number;
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

// Mock Data
let filiais: Filial[] = [
  { id: 1, nome: "Matriz", endereco: "Av. Central, 1000" },
  { id: 2, nome: "Filial Zona Sul", endereco: "Rua Sul, 200" },
  { id: 3, nome: "Filial Zona Norte", endereco: "Av. Norte, 300" }
];

let modulos: Modulo[] = [
  { id: 1, nome: "Pacientes" },
  { id: 2, "nome": "Agenda" },
  { id: 3, "nome": "Financeiro" },
  { id: 4, "nome": "Estoque" },
  { id: 5, "nome": "Procedimentos" },
  { id: 6, "nome": "Orçamentos" },
  { id: 7, "nome": "Patrimônio" },
  { id: 8, "nome": "Filiais" },
  { id: 9, "nome": "Equipe" },
  { id: 10, "nome": "Relatórios" },
  { id: 11, "nome": "Configurações" }
];

let funcionarios: Funcionario[] = [
  {
    id: 42,
    nome: "Mariana Oliveira",
    email: "mariana@odontosys.com",
    cargo: "Auxiliar de Saúde Bucal",
    cro: "ASB-9876",
    filial: "Filial Zona Sul",
    filial_id: 2,
    status: "Férias"
  },
  {
    id: 1,
    nome: "Dr. Jorge Silva",
    email: "jorge@odontosys.com",
    cargo: "Dentista",
    cro: "SP-12345",
    filial: "Matriz",
    filial_id: 1,
    status: "Ativo"
  },
  {
    id: 2,
    nome: "Dra. Ana Costa",
    email: "ana@odontosys.com",
    cargo: "Dentista",
    cro: "SP-54321",
    filial: "Matriz",
    filial_id: 1,
    status: "Ativo"
  }
];

let dentistas: any[] = [];
let usuarios: any[] = [];
let permissoesUsuario: any[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const equipeService = {
  getFiliais: async () => {
    await delay(200);
    return { data: filiais };
  },

  getModulos: async () => {
    await delay(150);
    return { data: modulos };
  },

  getFuncionarios: async (filial_id?: number) => {
    await delay(300);
    let data = funcionarios;
    if (filial_id) {
      data = data.filter(f => f.filial_id === filial_id);
    }
    return { data };
  },

  getFuncionarioById: async (id: number) => {
    await delay(200);
    const func = funcionarios.find(f => f.id === id);
    if (!func) throw new Error("Funcionário não encontrado");
    return func;
  },

  createFuncionario: async (data: any) => {
    await delay(400);
    
    // Validation
    const errors: any = {};
    if (!data.nome || data.nome.length < 2) errors.nome = "Nome é obrigatório e deve ter no mínimo 2 caracteres";
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Email inválido";
    if (!data.filial_id) errors.filial_id = "Filial é obrigatória";
    
    if (data.cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf)) {
      throw { status: 422, body: { errors: { cpf: "CPF inválido" } } };
    }
    
    if (Object.keys(errors).length > 0) {
      throw { status: 400, body: { errors } };
    }

    if (funcionarios.some(f => f.email === data.email)) {
      throw { status: 409, body: { error: "Email já cadastrado" } };
    }

    const newId = Math.max(...funcionarios.map(f => f.id), 0) + 1;
    const filial = filiais.find(f => f.id === Number(data.filial_id))?.nome || "";
    
    const newFunc = {
      ...data,
      id: newId,
      filial,
      filial_id: Number(data.filial_id)
    };
    
    funcionarios = [newFunc, ...funcionarios];
    
    return {
      id: newId,
      nome: newFunc.nome,
      mensagem: "Funcionário criado com sucesso"
    };
  },

  updateFuncionario: async (id: number, data: any) => {
    await delay(300);
    
    const index = funcionarios.findIndex(f => f.id === id);
    if (index === -1) throw new Error("Funcionário não encontrado");

    const errors: any = {};
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Email inválido";
    
    if (data.cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(data.cpf)) {
      throw { status: 422, body: { errors: { cpf: "CPF inválido" } } };
    }

    if (Object.keys(errors).length > 0) {
      throw { status: 400, body: { errors } };
    }

    const filial = filiais.find(f => f.id === Number(data.filial_id))?.nome || funcionarios[index].filial;

    funcionarios[index] = {
      ...funcionarios[index],
      ...data,
      filial,
      filial_id: Number(data.filial_id) || funcionarios[index].filial_id
    };

    return {
      id,
      mensagem: "Funcionário atualizado com sucesso"
    };
  },

  createDentista: async (data: any) => {
    await delay(300);
    
    if (!data.cro) {
      throw { status: 400, body: { errors: { cro: "CRO é obrigatório para dentistas" } } };
    }

    const newId = Math.max(...dentistas.map(d => d.id), 0) + 1;
    const newDentista = { ...data, id: newId };
    dentistas.push(newDentista);

    // Update the func with cro
    const funcIndex = funcionarios.findIndex(f => f.id === data.funcionario_id);
    if (funcIndex !== -1) {
      funcionarios[funcIndex].cro = data.cro;
    }

    return {
      id: newId,
      funcionario_id: data.funcionario_id,
      mensagem: "Registro de dentista criado"
    };
  },

  createUsuario: async (data: any) => {
    await delay(250);

    if (usuarios.some(u => u.login === data.login)) {
      throw { status: 409, body: { error: "Login já existe" } };
    }

    const newId = Math.max(...usuarios.map(u => u.id), 0) + 1;
    const newUsuario = { ...data, id: newId };
    usuarios.push(newUsuario);

    return {
      id: newId,
      login: data.login,
      mensagem: "Usuário criado com sucesso"
    };
  },

  applyPermissoes: async (data: any) => {
    await delay(150);
    permissoesUsuario.push(data);
    return {
      mensagem: "Permissões aplicadas"
    };
  }
};
