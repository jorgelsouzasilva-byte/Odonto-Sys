export interface Filial {
  id: number;
  nome: string;
  status: string;
  endereco: string;
  telefone: string;
  email: string;
  cnpj: string;
  observacoes?: string;
  horario_funcionamento?: string;
  responsavel?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface FuncionarioFilial {
  id: number;
  nome: string;
  cargo: string;
  email: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let filiais: Filial[] = [
  {
    id: 1,
    nome: "Matriz - Centro",
    status: "Ativa",
    endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo/SP",
    telefone: "(11) 3000-1000",
    email: "matriz@odontosys.com.br",
    cnpj: "12.345.678/0001-90",
    observacoes: "Unidade principal",
    horario_funcionamento: "Seg-Sex 08:00-20:00",
    responsavel: { id: 10, nome: "Dr. Jorge Silva", email: "jorge@odontosys.com" }
  },
  {
    id: 2,
    nome: "Filial Zona Sul",
    status: "Ativa",
    endereco: "Av. Santo Amaro, 2500 - Moema, São Paulo/SP",
    telefone: "(11) 3000-2000",
    email: "zonasul@odontosys.com.br",
    cnpj: "12.345.678/0002-71",
    observacoes: "Atendimento especializado em ortodontia",
    horario_funcionamento: "Seg-Sex 08:00-18:00",
    responsavel: { id: 5, nome: "Roberto Santos", email: "roberto@odontosys.com" }
  },
  {
    id: 3,
    nome: "Filial Zona Leste",
    status: "Em Reforma",
    endereco: "Rua Tuiuti, 1500 - Tatuapé, São Paulo/SP",
    telefone: "(11) 3000-3000",
    email: "zonaleste@odontosys.com.br",
    cnpj: "12.345.678/0003-52",
    observacoes: "Reforma prevista até 2026-06",
    horario_funcionamento: "Fechado temporariamente",
    responsavel: { id: 9, nome: "Dra. Ana Costa", email: "ana@odontosys.com" }
  }
];

const funcionariosPorFilial: Record<number, FuncionarioFilial[]> = {
  1: [
    { id: 1, nome: "Dr. Jorge Silva", cargo: "Dentista", email: "jorge@odontosys.com" },
    { id: 2, nome: "Dra. Ana Costa", cargo: "Dentista", email: "ana@odontosys.com" }
  ],
  2: [
    { id: 42, nome: "Mariana Oliveira", cargo: "Auxiliar de Saúde Bucal", email: "mariana@odontosys.com" },
    { id: 5, nome: "Roberto Santos", cargo: "Gerente Administrativo", email: "roberto@odontosys.com" }
  ],
  3: [
    { id: 3, nome: "Carlos Mendes", cargo: "Recepcionista", email: "carlos@odontosys.com" }
  ]
};

export const filialService = {
  getFiliais: async (status?: string) => {
    await delay(200);
    let data = filiais;
    if (status) {
      data = data.filter(f => f.status === status);
    }
    return { data };
  },

  getFilialById: async (id: number) => {
    await delay(150);
    const filial = filiais.find(f => f.id === id);
    if (!filial) throw new Error("Filial não encontrada");
    return filial;
  },

  createFilial: async (data: any) => {
    await delay(350);
    
    // Validation
    const errors: any = {};
    if (!data.nome || data.nome.length < 2) errors.nome = "Nome é obrigatório";
    if (!data.cnpj || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj)) {
      throw { status: 422, body: { errors: { cnpj: "CNPJ inválido" } } };
    }
    if (!data.endereco) errors.endereco = "Endereço é obrigatório";
    
    if (Object.keys(errors).length > 0) {
      throw { status: 400, body: { errors } };
    }

    if (filiais.some(f => f.cnpj === data.cnpj)) {
      throw { status: 409, body: { error: "Filial com mesmo CNPJ já existe" } };
    }

    const newId = Math.max(...filiais.map(f => f.id), 0) + 1;
    const newFilial = { ...data, id: newId };
    filiais = [...filiais, newFilial];
    
    return {
      id: newId,
      nome: newFilial.nome,
      mensagem: "Filial criada com sucesso"
    };
  },

  updateFilial: async (id: number, data: any) => {
    await delay(300);
    
    const index = filiais.findIndex(f => f.id === id);
    if (index === -1) throw new Error("Filial não encontrada");

    const errors: any = {};
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Email inválido";
    
    if (Object.keys(errors).length > 0) {
      throw { status: 400, body: { errors } };
    }

    filiais[index] = {
      ...filiais[index],
      ...data
    };

    return {
      id,
      mensagem: "Filial atualizada com sucesso"
    };
  },

  deleteFilial: async (id: number) => {
    await delay(200);
    
    // Simulate check for active staff
    if (id === 1 || id === 2) {
      throw { status: 400, body: { error: "Não é possível remover filial com funcionários ativos" } };
    }

    filiais = filiais.filter(f => f.id !== id);
    return {
      mensagem: "Filial removida/inaltivada com sucesso"
    };
  },

  getFuncionariosPorFilial: async (id: number) => {
    await delay(250);
    return { data: funcionariosPorFilial[id] || [] };
  }
};
