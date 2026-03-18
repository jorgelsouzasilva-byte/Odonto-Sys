
import { Paciente, Anamnese } from "../types/paciente";

const initialPatients: Paciente[] = [
  { id: 1, nome: 'Maria Silva', telefone: '(11) 98765-4321', email: 'maria.silva@email.com', status: 'Ativo' },
  { id: 2, nome: 'João Santos', telefone: '(11) 91234-5678', email: 'joao.santos@email.com', status: 'Ativo' },
  { id: 3, nome: 'Pedro Costa', telefone: '(11) 99876-5432', email: 'pedro.costa@email.com', status: 'Inativo' },
  { id: 4, nome: 'Ana Oliveira', telefone: '(11) 94567-8901', email: 'ana.oliveira@email.com', status: 'Ativo' },
  { id: 5, nome: 'Carlos Souza', telefone: '(11) 93456-7890', email: 'carlos.souza@email.com', status: 'Inativo' },
];

const initialAnamneses: Anamnese[] = [
  {
    id: 1,
    pacienteId: 1,
    profissionalId: 1,
    profissional: "Dr. Jorge Silva",
    data: "2026-03-10",
    queixa_principal: "Dor ao mastigar lado direito.",
    tratamento_medico: true,
    medicamentos: "Losartana",
    alergias: "Dipirona",
    hospitalizacoes: "Cirurgia em 2020",
    doencas: ["Hipertensão"],
    sensibilidade: true,
    sangramento: false,
    bruxismo: true,
    ultima_consulta: "2025-12-01",
    reacao_anestesia: "Nenhuma relatada",
    fuma: false,
    alcool: true,
    cafe: true,
    mastiga_objetos: false,
    gestante: false,
    amamentando: false,
    cicatrizacao: false,
    coagulacao: false,
    observacoes: "Paciente ansioso, recomenda-se abordagem tranquila.",
    resumo: "Queixa principal: dor ao mastigar."
  }
];

export const pacienteService = {
  getPacientes: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { data: initialPatients };
  },
  getAnamneses: async (pacienteId: number) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { data: initialAnamneses.filter(a => a.pacienteId === pacienteId) };
  },
  getAnamneseDetalhe: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { data: initialAnamneses.find(a => a.id === id) };
  },
  salvarAnamnese: async (anamnese: Omit<Anamnese, 'id' | 'data' | 'profissional' | 'profissionalId'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAnamnese: Anamnese = {
      ...anamnese,
      id: initialAnamneses.length + 1,
      data: new Date().toISOString().split('T')[0],
      profissional: "Dr. Jorge Silva",
      profissionalId: 1,
      resumo: `Queixa principal: ${anamnese.queixa_principal.substring(0, 50)}...`
    };
    initialAnamneses.push(newAnamnese);
    return { data: newAnamnese };
  }
};
