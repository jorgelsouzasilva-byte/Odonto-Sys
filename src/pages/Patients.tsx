import { useState, FormEvent, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Plus, Filter, MoreVertical, FileText, Phone, Mail, Calendar, Stethoscope, Users, X, Activity, ClipboardList, Trash2, Calculator, Download, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { pacienteService } from "@/services/pacienteService"
import AnamneseModal from "@/components/AnamneseModal"
import AnamneseViewModal from "@/components/AnamneseViewModal"
import NovoOrcamentoModal from "@/components/NovoOrcamentoModal"
import OrcamentoVisualizarModal from "@/components/OrcamentoVisualizarModal"
import ProcedureLaunchModal from "@/components/ProcedureLaunchModal"
import { orcamentoService } from "@/services/orcamentoService"
import { financeiroService } from "@/services/financeiroService"
import { Anamnese, Orcamento, OrcamentoItem, Financeiro } from "@/types/paciente"
import { CheckCircle2, DollarSign } from "lucide-react"
import PagamentoModal from "@/components/PagamentoModal"
import NovoAtendimentoModal from "@/components/NovoAtendimentoModal"

export default function Patients() {
  const [searchParams] = useSearchParams()
  const [patients, setPatients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    setIsLoading(true)
    try {
      const response = await pacienteService.getPacientes()
      setPatients(response.data)
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPatients = patients.filter(p => 
    p.status !== 'Excluído' && (
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telefone.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cpf && p.cpf.includes(searchTerm))
    )
  )

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setSelectedPatient(id)
    }
  }, [searchParams])
  const [activeTab, setActiveTab] = useState('dados')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<any>(null)
  const [anamneses, setAnamneses] = useState<Anamnese[]>([])
  const [isAnamneseModalOpen, setIsAnamneseModalOpen] = useState(false)
  const [isAnamneseViewModalOpen, setIsAnamneseViewModalOpen] = useState(false)
  const [selectedAnamnese, setSelectedAnamnese] = useState<Anamnese | null>(null)
  const [orcamentosHistory, setOrcamentosHistory] = useState<Orcamento[]>([])
  const [isNovoOrcamentoModalOpen, setIsNovoOrcamentoModalOpen] = useState(false)
  const [isVisualizarOrcamentoModalOpen, setIsVisualizarOrcamentoModalOpen] = useState(false)
  const [selectedOrcamentoForView, setSelectedOrcamentoForView] = useState<Orcamento | null>(null)
  const [financeiroHistory, setFinanceiroHistory] = useState<Financeiro[]>([])
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false)
  const [selectedLancamento, setSelectedLancamento] = useState<Financeiro | null>(null)
  const [isProcedureLaunchModalOpen, setIsProcedureLaunchModalOpen] = useState(false)
  const [historico, setHistorico] = useState<any[]>([])

  const [evolucoes, setEvolucoes] = useState<any[]>([])
  const [isEvolucaoModalOpen, setIsEvolucaoModalOpen] = useState(false)

  const loadEvolucoes = async (id: string) => {
    try {
      const data = await pacienteService.getEvolucoes(id)
      setEvolucoes(data)
    } catch (error) {
      console.error('Erro ao carregar evoluções:', error)
    }
  }

  useEffect(() => {
    if (selectedPatient) {
      loadAnamneses(selectedPatient)
      loadOrcamentos(selectedPatient)
      loadFinanceiro(selectedPatient)
      loadHistorico(selectedPatient)
      loadEvolucoes(selectedPatient)
    }
  }, [selectedPatient])

  const loadAnamneses = async (id: string) => {
    const response = await pacienteService.getAnamneses(id)
    setAnamneses(response.data)
  }

  const loadOrcamentos = async (id: string) => {
    const data = await orcamentoService.getOrcamentos(id)
    setOrcamentosHistory(data)
  }

  const loadFinanceiro = async (id: string) => {
    const data = await financeiroService.getFinanceiro(id)
    setFinanceiroHistory(data)
  }

  const loadHistorico = async (id: string) => {
    const data = await pacienteService.getHistorico(id)
    setHistorico(data)
  }

  const handleAprovarOrcamento = async (id: string) => {
    try {
      await orcamentoService.aprovarOrcamento(id)
      if (selectedPatient) {
        loadOrcamentos(selectedPatient)
        loadFinanceiro(selectedPatient)
      }
      alert('Orçamento aprovado com sucesso! Lançamento financeiro gerado.')
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error)
      alert('Erro ao aprovar orçamento.')
    }
  }

  const handleCancelarOrcamento = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este orçamento?')) return;
    try {
      await orcamentoService.cancelarOrcamento(id)
      if (selectedPatient) loadOrcamentos(selectedPatient)
      alert('Orçamento cancelado com sucesso!')
    } catch (error) {
      console.error('Erro ao cancelar orçamento:', error)
      alert('Erro ao cancelar orçamento.')
    }
  }

  const handleConfirmarPagamento = async (formaPagamento: string) => {
    if (!selectedLancamento) return;
    try {
      await financeiroService.registrarPagamento(selectedLancamento.id, formaPagamento)
      if (selectedPatient) loadFinanceiro(selectedPatient)
      setIsPagamentoModalOpen(false)
      alert('Pagamento registrado com sucesso!')
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error)
      alert('Erro ao registrar pagamento.')
    }
  }

  const tabs = [
    { id: 'dados', name: 'Dados Pessoais' },
    { id: 'anamnese', name: 'Anamnese' },
    { id: 'evolucao', name: 'Evolução' },
    { id: 'documentos', name: 'Documentos' },
    { id: 'historico', name: 'Histórico' },
    { id: 'orcamentos', name: 'Orçamentos' },
    { id: 'financeiro', name: 'Financeiro' },
  ]

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const patientData = {
      nome: formData.get('nome') as string,
      telefone: formData.get('telefone') as string,
      email: formData.get('email') as string,
      cpf: formData.get('cpf') as string,
      dataNascimento: formData.get('dataNascimento') as string,
      genero: formData.get('genero') as string,
      endereco: {
        logradouro: formData.get('logradouro') as string,
        bairro: formData.get('bairro') as string,
        cidade: formData.get('cidade') as string,
        uf: formData.get('uf') as string,
      },
      status: 'Ativo'
    }

    try {
      if (editingPatient) {
        await pacienteService.updatePaciente(editingPatient.id, patientData)
      } else {
        await pacienteService.createPaciente(patientData)
      }
      loadPatients()
      setIsFormOpen(false)
      setEditingPatient(null)
    } catch (error) {
      console.error("Erro ao salvar paciente:", error)
      alert("Erro ao salvar paciente.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente inativar este paciente?")) return
    try {
      await pacienteService.deletePaciente(id)
      loadPatients()
      // If the selected patient was the one deleted, clear selection
      if (selectedPatient === id) {
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error("Erro ao excluir paciente:", error)
      alert("Erro ao excluir paciente.")
    }
  }

  const handleRealDelete = async (id: string) => {
    if (!confirm("Deseja realmente EXCLUIR DEFINITIVAMENTE este paciente? Esta ação não pode ser desfeita.")) return
    try {
      await pacienteService.realDeletePaciente(id)
      loadPatients()
      if (selectedPatient === id) {
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error("Erro ao excluir paciente:", error)
      alert("Erro ao excluir paciente.")
    }
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredPatients.map((patient) => (
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
                        onClick={() => handleRealDelete(selectedPatient)}
                        title="Excluir Definitivamente"
                        className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedPatient)}
                        title="Inativar"
                        className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      >
                        <X className="h-4 w-4" />
                      </button>
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
                      <button 
                        onClick={() => setIsProcedureLaunchModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                      >
                        Lançamento
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
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">{patients.find(p => p.id === selectedPatient)?.cpf || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Data de Nascimento</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">{patients.find(p => p.id === selectedPatient)?.dataNascimento || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Gênero</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">{patients.find(p => p.id === selectedPatient)?.genero || '-'}</dd>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Endereço</h3>
                      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Logradouro</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">{patients.find(p => p.id === selectedPatient)?.endereco?.logradouro || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Bairro</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">{patients.find(p => p.id === selectedPatient)?.endereco?.bairro || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Cidade/UF</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                            {patients.find(p => p.id === selectedPatient)?.endereco?.cidade} / {patients.find(p => p.id === selectedPatient)?.endereco?.uf}
                          </dd>
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
                        {historico.map((event, eventIdx) => (
                          <li key={eventIdx}>
                            <div className="relative pb-8">
                              {eventIdx !== historico.length - 1 ? (
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
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Histórico de Orçamentos</h3>
                      <button 
                        onClick={() => setIsNovoOrcamentoModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      >
                        Novo Orçamento
                      </button>
                    </div>

                    {orcamentosHistory.length > 0 ? (
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                          <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor Total</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Forma Pagto</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Obs</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                            {orcamentosHistory.map((orcamento) => (
                              <tr key={orcamento.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{orcamento.data}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.total)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{orcamento.formaPagamento || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={cn(
                                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                    orcamento.status === 'Aprovado' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : 
                                    orcamento.status === 'Cancelado' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  )}>
                                    {orcamento.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[150px] truncate" title={orcamento.observacoes}>
                                  {orcamento.observacoes || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                  <button 
                                    onClick={() => {
                                      setSelectedOrcamentoForView(orcamento)
                                      setIsVisualizarOrcamentoModalOpen(true)
                                    }}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                  >
                                    Visualizar
                                  </button>
                                  {orcamento.status === 'Pendente' && (
                                    <>
                                      <button 
                                        onClick={() => handleAprovarOrcamento(orcamento.id)}
                                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300"
                                      >
                                        Aprovar
                                      </button>
                                      <button 
                                        onClick={() => handleCancelarOrcamento(orcamento.id)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                      >
                                        Cancelar
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        <Calculator className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Nenhum orçamento registrado</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece criando o primeiro orçamento para este paciente.</p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'financeiro' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Movimentação Financeira</h3>
                    </div>

                    {financeiroHistory.length > 0 ? (
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                          <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Forma</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                            {financeiroHistory.map((lancamento) => (
                              <tr key={lancamento.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{lancamento.data}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{lancamento.descricao}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lancamento.valor)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{lancamento.formaPagamento || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={cn(
                                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                    lancamento.status === 'Pago' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  )}>
                                    {lancamento.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {lancamento.status === 'Pendente' && (
                                    <button 
                                      onClick={() => {
                                        setSelectedLancamento(lancamento)
                                        setIsPagamentoModalOpen(true)
                                      }}
                                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300"
                                    >
                                      Registrar Pagamento
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        <DollarSign className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Nenhuma movimentação financeira</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Lançamentos serão gerados automaticamente ao aprovar orçamentos.</p>
                      </div>
                    )}
                  </div>
                )}
                {/* Outras abas seriam implementadas aqui */}
                {activeTab === 'evolucao' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Evolução Clínica</h3>
                      <button 
                        onClick={() => setIsEvolucaoModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      >
                        Nova Evolução
                      </button>
                    </div>
                    
                    {evolucoes.length > 0 ? (
                      <div className="space-y-4">
                        {evolucoes.map((evolucao) => (
                          <div key={evolucao.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{evolucao.data}</span>
                              <span className="text-xs text-slate-400">Dr. Jorge Silva</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{evolucao.texto}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        <ClipboardList className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Nenhuma evolução registrada</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Registre o acompanhamento clínico do paciente.</p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'documentos' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Documentos e Exames</h3>
                      <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Documento
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Mock documents */}
                      {[
                        { id: 1, name: 'Raio-X Panorâmico', date: '2024-03-10', type: 'Imagem', size: '2.4 MB' },
                        { id: 2, name: 'Contrato de Prestação de Serviços', date: '2024-03-05', type: 'PDF', size: '1.1 MB' },
                        { id: 3, name: 'Receita Médica - Amoxicilina', date: '2024-03-12', type: 'PDF', size: '450 KB' },
                      ].map((doc) => (
                        <div key={doc.id} className="group relative flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-white dark:bg-slate-900">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{doc.date} • {doc.size}</p>
                          </div>
                          <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!['dados', 'anamnese', 'evolucao', 'documentos', 'historico', 'orcamentos', 'financeiro'].includes(activeTab) && (
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
                  <input type="text" name="nome" defaultValue={editingPatient?.nome} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">CPF</label>
                  <input type="text" name="cpf" defaultValue={editingPatient?.cpf} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Nascimento</label>
                  <input type="date" name="dataNascimento" defaultValue={editingPatient?.dataNascimento} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gênero</label>
                  <select name="genero" defaultValue={editingPatient?.genero} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                  <input type="text" name="telefone" defaultValue={editingPatient?.telefone} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input type="email" name="email" defaultValue={editingPatient?.email} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Endereço</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Logradouro</label>
                    <input type="text" name="logradouro" defaultValue={editingPatient?.endereco?.logradouro} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bairro</label>
                    <input type="text" name="bairro" defaultValue={editingPatient?.endereco?.bairro} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cidade</label>
                    <input type="text" name="cidade" defaultValue={editingPatient?.endereco?.cidade} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">UF</label>
                    <input type="text" name="uf" defaultValue={editingPatient?.endereco?.uf} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  </div>
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
          <NovoOrcamentoModal 
            isOpen={isNovoOrcamentoModalOpen}
            onClose={() => setIsNovoOrcamentoModalOpen(false)}
            pacienteId={selectedPatient}
            pacienteNome={patients.find(p => p.id === selectedPatient)?.nome || ""}
            onSave={() => loadOrcamentos(selectedPatient)}
          />
          <OrcamentoVisualizarModal 
            isOpen={isVisualizarOrcamentoModalOpen}
            onClose={() => {
              setIsVisualizarOrcamentoModalOpen(false)
              setSelectedOrcamentoForView(null)
            }}
            orcamento={selectedOrcamentoForView}
            pacienteNome={patients.find(p => p.id === selectedPatient)?.nome}
          />
          <PagamentoModal 
            isOpen={isPagamentoModalOpen}
            onClose={() => {
              setIsPagamentoModalOpen(false)
              setSelectedLancamento(null)
            }}
            lancamento={selectedLancamento}
            pacienteNome={patients.find(p => p.id === selectedPatient)?.nome || ""}
            onConfirm={handleConfirmarPagamento}
          />
          <ProcedureLaunchModal 
            isOpen={isProcedureLaunchModalOpen}
            onClose={() => setIsProcedureLaunchModalOpen(false)}
            pacienteId={selectedPatient}
            pacienteNome={patients.find(p => p.id === selectedPatient)?.nome || ""}
            onSave={() => {
              loadFinanceiro(selectedPatient)
              loadHistorico(selectedPatient)
            }}
          />
          <NovoAtendimentoModal 
            isOpen={isEvolucaoModalOpen}
            onClose={() => setIsEvolucaoModalOpen(false)}
            pacienteId={selectedPatient}
            pacienteNome={patients.find(p => p.id === selectedPatient)?.nome || ""}
            onSave={() => loadEvolucoes(selectedPatient)}
          />
        </>
      )}
    </div>
  )
}


