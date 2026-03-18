import { useState, FormEvent, useEffect } from "react"
import { Search, Plus, Filter, MoreVertical, FileText, Phone, Mail, Calendar, Stethoscope, Users, X, Activity, ClipboardList, Trash2, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import { pacienteService } from "@/services/pacienteService"
import { orcamentoService } from "@/services/orcamentoService"
import { Anamnese, OrcamentoItem } from "@/types/paciente"
import AnamneseModal from "@/components/AnamneseModal"
import AnamneseViewModal from "@/components/AnamneseViewModal"
import Odontogram from "@/components/Odontogram"
import OrcamentoItemModal from "@/components/OrcamentoItemModal"

const initialPatients = [
  { id: 1, nome: 'Maria Silva', telefone: '(11) 98765-4321', email: 'maria.silva@email.com', lastVisit: '10/03/2026', status: 'Ativo' },
  { id: 2, nome: 'João Santos', telefone: '(11) 91234-5678', email: 'joao.santos@email.com', lastVisit: '15/03/2026', status: 'Ativo' },
  { id: 3, nome: 'Pedro Costa', telefone: '(11) 99876-5432', email: 'pedro.costa@email.com', lastVisit: '01/02/2026', status: 'Inativo' },
  { id: 4, nome: 'Ana Oliveira', telefone: '(11) 94567-8901', email: 'ana.oliveira@email.com', lastVisit: '16/03/2026', status: 'Ativo' },
  { id: 5, nome: 'Carlos Souza', telefone: '(11) 93456-7890', email: 'carlos.souza@email.com', lastVisit: '20/12/2025', status: 'Inativo' },
]

export default function Patients() {
  const [patients, setPatients] = useState(initialPatients)
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('dados')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<any>(null)
  const [anamneses, setAnamneses] = useState<Anamnese[]>([])
  const [isAnamneseModalOpen, setIsAnamneseModalOpen] = useState(false)
  const [isAnamneseViewModalOpen, setIsAnamneseViewModalOpen] = useState(false)
  const [selectedAnamnese, setSelectedAnamnese] = useState<Anamnese | null>(null)
  const [orcamentoItens, setOrcamentoItens] = useState<OrcamentoItem[]>([])
  const [isOrcamentoModalOpen, setIsOrcamentoModalOpen] = useState(false)
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [desconto, setDesconto] = useState(0)

  const subtotal = orcamentoItens.reduce((acc, item) => acc + item.valor, 0)
  const totalFinal = subtotal - desconto

  const handleAddOrcamentoItem = (item: Omit<OrcamentoItem, 'id'>) => {
    const newItem: OrcamentoItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    }
    setOrcamentoItens(prev => [...prev, newItem])
  }

  const handleRemoveOrcamentoItem = (id: string) => {
    setOrcamentoItens(prev => prev.filter(item => item.id !== id))
  }

  const handleToothClick = (number: number) => {
    setSelectedTooth(number)
    setIsOrcamentoModalOpen(true)
  }

  const handleSaveOrcamento = async () => {
    if (!selectedPatient || orcamentoItens.length === 0) return;

    try {
      await orcamentoService.createOrcamento({
        pacienteId: selectedPatient,
        data: new Date().toLocaleDateString('pt-BR'),
        itens: orcamentoItens,
        subtotal,
        desconto,
        total: totalFinal,
        status: 'Pendente'
      });
      
      alert('Orçamento salvo com sucesso!');
      setOrcamentoItens([]);
      setDesconto(0);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento.');
    }
  }

  useEffect(() => {
    if (selectedPatient) {
      loadAnamneses(selectedPatient)
    }
  }, [selectedPatient])

  const loadAnamneses = async (id: number) => {
    const response = await pacienteService.getAnamneses(id)
    setAnamneses(response.data)
  }

  const tabs = [
    { id: 'dados', name: 'Dados Pessoais' },
    { id: 'anamnese', name: 'Anamnese' },
    { id: 'documentos', name: 'Documentos' },
    { id: 'historico', name: 'Histórico' },
    { id: 'orcamentos', name: 'Orçamentos' },
    { id: 'financeiro', name: 'Financeiro' },
  ]

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    setIsFormOpen(false)
    setEditingPatient(null)
    // Simulação de save
  }

  const openNewForm = () => {
    setEditingPatient(null)
    setIsFormOpen(true)
  }

  const openEditForm = () => {
    setEditingPatient(patients.find(p => p.id === selectedPatient))
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Pacientes</h1>
        <button 
          onClick={openNewForm}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Novo Paciente
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de Pacientes */}
        <div className={cn("w-full lg:w-1/3 flex-col space-y-4", selectedPatient ? "hidden lg:flex" : "flex")}>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                placeholder="Buscar pacientes..."
              />
            </div>
            <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Filter className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-800">
              {patients.map((patient) => (
                <li 
                  key={patient.id} 
                  className={cn(
                    "cursor-pointer p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                    selectedPatient === patient.id ? "bg-indigo-50 dark:bg-indigo-500/10" : ""
                  )}
                  onClick={() => setSelectedPatient(patient.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          {patient.nome.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{patient.nome}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{patient.telefone}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      patient.status === 'Ativo' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                      "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20"
                    )}>
                      {patient.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Perfil do Paciente */}
        <div className={cn("w-full lg:w-2/3 flex-col space-y-6", !selectedPatient ? "hidden lg:flex" : "flex")}>
          {selectedPatient ? (
            <>
              {/* Header do Perfil */}
              <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <span className="text-xl font-medium text-indigo-700 dark:text-indigo-300">
                          {patients.find(p => p.id === selectedPatient)?.nome.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {patients.find(p => p.id === selectedPatient)?.nome}
                        </h2>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center">
                            <Phone className="mr-1.5 h-4 w-4" />
                            {patients.find(p => p.id === selectedPatient)?.telefone}
                          </div>
                          <div className="flex items-center">
                            <Mail className="mr-1.5 h-4 w-4" />
                            {patients.find(p => p.id === selectedPatient)?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={openEditForm}
                        className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => setIsAnamneseModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      >
                        Anamnese
                      </button>
                      <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                        Nova Consulta
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Abas */}
                <div className="border-t border-slate-200 dark:border-slate-800">
                  <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
                          'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                        )}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Conteúdo da Aba */}
              <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
                {activeTab === 'dados' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Informações Pessoais</h3>
                      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Nome Completo</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">{patients.find(p => p.id === selectedPatient)?.nome}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">CPF</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">123.456.789-00</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Data de Nascimento</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">15/05/1985 (40 anos)</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Gênero</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">Feminino</dd>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Endereço</h3>
                      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Logradouro</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">Rua das Flores, 123 - Apto 45</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Bairro</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">Centro</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Cidade/UF</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">São Paulo / SP</dd>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'anamnese' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Histórico de Anamneses</h3>
                      <button 
                        onClick={() => setIsAnamneseModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      >
                        Nova Anamnese
                      </button>
                    </div>
                    
                    {anamneses.length > 0 ? (
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                          <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profissional</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resumo</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                            {anamneses.map((anamnese) => (
                              <tr key={anamnese.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{anamnese.data}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{anamnese.profissional}</td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{anamnese.resumo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button 
                                    onClick={() => {
                                      setSelectedAnamnese(anamnese)
                                      setIsAnamneseViewModalOpen(true)
                                    }}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                  >
                                    Ver Anamnese
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        <ClipboardList className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Nenhuma anamnese registrada</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece registrando a primeira anamnese do paciente.</p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'historico' && (
                  <div className="space-y-6">
                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        {[
                          { date: '16 Mar 2026', title: 'Clareamento Dental', doctor: 'Dra. Ana Costa', type: 'Procedimento' },
                          { date: '10 Fev 2026', title: 'Limpeza (Profilaxia)', doctor: 'Dr. Jorge Silva', type: 'Procedimento' },
                          { date: '05 Fev 2026', title: 'Avaliação Inicial', doctor: 'Dr. Jorge Silva', type: 'Consulta' },
                        ].map((event, eventIdx) => (
                          <li key={eventIdx}>
                            <div className="relative pb-8">
                              {eventIdx !== 2 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-900",
                                    event.type === 'Procedimento' ? "bg-indigo-500" : "bg-emerald-500"
                                  )}>
                                    {event.type === 'Procedimento' ? (
                                      <Stethoscope className="h-4 w-4 text-white" aria-hidden="true" />
                                    ) : (
                                      <Calendar className="h-4 w-4 text-white" aria-hidden="true" />
                                    )}
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-slate-900 dark:text-white font-medium">{event.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">com {event.doctor}</p>
                                  </div>
                                  <div className="whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                                    <time dateTime={event.date}>{event.date}</time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {activeTab === 'orcamentos' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Coluna Odontograma */}
                    <div className="space-y-6">
                      <Odontogram onToothClick={handleToothClick} />
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Instruções</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Clique em um dente no odontograma para adicionar um procedimento ao orçamento atual.</p>
                      </div>
                    </div>

                    {/* Coluna Orçamento */}
                    <div className="flex flex-col space-y-6">
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-indigo-500" />
                            Itens do Orçamento
                          </h3>
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                            {orcamentoItens.length} itens
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[400px]">
                          {orcamentoItens.length > 0 ? (
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                              <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Dente</th>
                                  <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Procedimento</th>
                                  <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Valor</th>
                                  <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {orcamentoItens.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.dente}</span>
                                        <span className="text-[10px] text-slate-400">{item.superficies.join(', ')}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.procedimentoNome}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button 
                                        onClick={() => handleRemoveOrcamentoItem(item.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                              <Calculator className="h-12 w-12 text-slate-300 mb-2" />
                              <p className="text-sm text-slate-500">Nenhum item adicionado ao orçamento.</p>
                            </div>
                          )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-500">Desconto</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">R$</span>
                              <input 
                                type="number" 
                                value={desconto}
                                onChange={(e) => setDesconto(Number(e.target.value))}
                                className="w-20 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-base font-bold text-slate-900 dark:text-white">Total Final</span>
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFinal)}
                            </span>
                          </div>
                          <button 
                            onClick={handleSaveOrcamento}
                            disabled={orcamentoItens.length === 0}
                            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Salvar Orçamento
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Outras abas seriam implementadas aqui */}
                {activeTab !== 'dados' && activeTab !== 'historico' && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Conteúdo em desenvolvimento</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A aba {tabs.find(t => t.id === activeTab)?.name} estará disponível em breve.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
              <div>
                <Users className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Nenhum paciente selecionado</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Selecione um paciente na lista para ver seus detalhes.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                  <input type="text" defaultValue={editingPatient?.nome} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">CPF</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                  <input type="text" defaultValue={editingPatient?.telefone} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input type="email" defaultValue={editingPatient?.email} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modais de Anamnese */}
      {selectedPatient && (
        <>
          <AnamneseModal 
            isOpen={isAnamneseModalOpen}
            onClose={() => setIsAnamneseModalOpen(false)}
            pacienteId={selectedPatient}
            pacienteNome={patients.find(p => p.id === selectedPatient)?.nome || ""}
            onSave={() => loadAnamneses(selectedPatient)}
          />
          <AnamneseViewModal 
            isOpen={isAnamneseViewModalOpen}
            onClose={() => {
              setIsAnamneseViewModalOpen(false)
              setSelectedAnamnese(null)
            }}
            anamnese={selectedAnamnese}
            pacienteNome={patients.find(p => p.id === selectedPatient)?.nome || ""}
          />
          <OrcamentoItemModal 
            isOpen={isOrcamentoModalOpen}
            onClose={() => setIsOrcamentoModalOpen(false)}
            onAdd={handleAddOrcamentoItem}
            toothNumber={selectedTooth}
          />
        </>
      )}
    </div>
  )
}
