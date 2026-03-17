import { Patrimonio, PatrimonioDetail, CreatePatrimonioDTO, TransferPatrimonioDTO } from "../types/patrimonio";

const STORAGE_KEY = "odonto_sys_patrimonio";

const initialData: Patrimonio[] = [
  {
    id: 101,
    nome: "Cadeira Odontológica Gnatus",
    numero_serie: "GN-2023-4589",
    filial: "Matriz",
    filial_id: 1,
    data_aquisicao: "2023-01-10",
    status: "Em uso",
    valor: 15000.00,
    observacoes: ""
  },
  {
    id: 102,
    nome: "Raio-X Panorâmico Dabi",
    numero_serie: "DX-2022-1122",
    filial: "Matriz",
    filial_id: 1,
    data_aquisicao: "2022-05-15",
    status: "Em uso",
    valor: 45000.00,
    observacoes: ""
  },
  {
    id: 103,
    nome: "Autoclave 21L",
    numero_serie: "AC-2024-0056",
    filial: "Filial Centro",
    filial_id: 2,
    data_aquisicao: "2024-02-20",
    status: "Manutenção",
    valor: 3500.00,
    observacoes: "Manutenção preventiva agendada"
  }
];

const getStoredData = (): Patrimonio[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
};

const saveStoredData = (data: Patrimonio[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const patrimonioService = {
  getPatrimonio: async (filial_id?: number, status?: string): Promise<{ data: Patrimonio[] }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    let data = getStoredData();
    if (filial_id) {
      data = data.filter(item => item.filial_id === filial_id);
    }
    if (status) {
      data = data.filter(item => item.status === status);
    }
    return { data };
  },

  getById: async (id: number): Promise<PatrimonioDetail> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const data = getStoredData();
    const item = data.find(i => i.id === id);
    if (!item) throw new Error("Item não encontrado");

    // Mocking details and history
    return {
      ...item,
      estado: item.status,
      historico_movimentacoes: [
        { data: item.data_aquisicao, acao: "Entrada", detalhe: "Compra", usuario: "Roberto Santos" },
        ...(item.status === "Manutenção" ? [{ data: "2024-05-01", acao: "Manutenção", detalhe: "Troca de peça", usuario: "Técnico Externo" }] : [])
      ]
    };
  },

  create: async (payload: CreatePatrimonioDTO): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const data = getStoredData();
    
    // Validation: Duplicate Serial
    if (data.some(i => i.numero_serie === payload.numero_serie)) {
      return Promise.reject({ status: 409, error: "Número de série já cadastrado" });
    }

    const newItem: Patrimonio = {
      id: Math.max(...data.map(i => i.id), 100) + 1,
      ...payload,
      status: payload.estado,
      filial: payload.filial_id === 1 ? "Matriz" : "Filial Centro" // Mocking branch name
    };

    saveStoredData([...data, newItem]);
    return { id: newItem.id, nome: newItem.nome, mensagem: "Item de patrimônio criado com sucesso" };
  },

  update: async (id: number, payload: CreatePatrimonioDTO): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getStoredData();
    const index = data.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Item não encontrado");

    const updatedItem: Patrimonio = {
      ...data[index],
      ...payload,
      status: payload.estado,
      filial: payload.filial_id === 1 ? "Matriz" : "Filial Centro"
    };

    data[index] = updatedItem;
    saveStoredData(data);
    return { id, mensagem: "Item de patrimônio atualizado com sucesso" };
  },

  delete: async (id: number): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const data = getStoredData();
    const item = data.find(i => i.id === id);
    
    if (item?.status === "Manutenção") {
      return Promise.reject({ status: 400, error: "Não é possível remover item em manutenção" });
    }

    const filtered = data.filter(i => i.id !== id);
    saveStoredData(filtered);
    return { mensagem: "Item removido/descartado com sucesso" };
  },

  transfer: async (id: number, payload: TransferPatrimonioDTO): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const data = getStoredData();
    const index = data.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Item não encontrado");

    data[index].filial_id = payload.destino_filial_id;
    data[index].filial = payload.destino_filial_id === 1 ? "Matriz" : "Filial Centro";
    
    saveStoredData(data);
    return { mensagem: "Transferência registrada com sucesso", novo_filial_id: payload.destino_filial_id };
  }
};
