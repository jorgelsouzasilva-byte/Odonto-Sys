import { useState, FormEvent, useEffect } from "react"
import { Plus, Search, Filter, Stethoscope, X, Download, Trash2, Edit2, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Procedimento, 
  ProcedimentoFilters, 
  Especialidade, 
  ESPECIALIDADES_PREFIX 
} from "../types/procedimento"
import { procedimentoService } from "../services/procedimentoService"
import { estoqueService } from "../services/estoqueService"

export default function Procedures() {
  const [procedures, setProcedures] = useState<Procedimento[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState<Procedimento | null>(null)
  const [exporting, setExporting] = useState(false)
  
  const [filters, setFilters] = useState<ProcedimentoFilters>({
    especialidade: 'all',
    search: '',
    min_valor: undefined,
    max_valor: undefined
  })

  const [formData, setFormData] = useState<Omit<Procedimento, 'id' | 'codigo'>>({
    nome: '',
    especialidade: 'Estética',
    valor: 0,
    descricao: ''
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await procedimentoService.getProcedimentos(filters)
      setProcedures(res.data)
    } catch (error) {
      console.error("Error fetching procedures:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (selectedProcedure) {
        await procedimentoService.updateProcedimento(selectedProcedure.id, formData)
      } else {
        await procedimentoService.createProcedimento(formData)
      }
      setIsFormOpen(false)
      fetchData()
    } catch (error) {
      alert("Erro ao salvar procedimento")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este procedimento?")) return
    setLoading(true)
    try {
      await procedimentoService.deleteProcedimento(id)
      fetchData()
    } catch (error) {
      alert("Erro ao excluir procedimento")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'xls') => {
    setExporting(true)
    try {
      const res = await procedimentoService.export({ ...filters, format })
      alert(`${res.mensagem}: ${res.file_name}`)
      window.open(res.file_url, '_blank')
    } catch (error) {
      alert("Erro ao exportar")
    } finally {
      setExporting(false)
    }
  }

  const handlePerform = async (proc: Procedimento) => {
    setLoading(true)
    try {
      // Simulate integrations
      await Promise.all([
        procedimentoService.integracaoFinanceiro({
          procedimento_id: proc.id,
          paciente_id: "mock-patient-id", // Mock patient
          valor: proc.valor,
          forma_pagamento: "Cartão"
        }),
        procedimentoService.integracaoAgenda(proc.id),
        procedimentoService.integracaoOrcamento(proc.id, "mock-budget-id"), // Mock budget
        estoqueService.integracaoProcedimentoConsumo(proc.id, [
          { item_id: 1, quantidade: 1 } // Mock consumption of Resina
        ])
      ])
      alert(`Procedimento "${proc.nome}" realizado com sucesso! Integrações disparadas (ver console).`)
    } catch (error) {
      alert("Erro ao realizar procedimento")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (procedure: Procedimento | null = null) => {
    if (procedure) {
      setSelectedProcedure(procedure)
      setFormData({
        nome: procedure.nome,
        especialidade: procedure.especialidade,
        valor: procedure.valor,
        descricao: procedure.descricao || ''
      })
    } else {
      setSelectedProcedure(null)
      setFormData({
        nome: '',
        especialidade: 'Estética',
        valor: 0,
        descricao: ''
      })
    }
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Procedimentos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie o catálogo de serviços da clínica</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button 
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="inline-flex items-center rounded-l-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              PDF
            </button>
            <button 
              onClick={() => handleExport('xls')}
              disabled={exporting}
              className="inline-flex items-center rounded-r-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 border-l-0 disabled:opacity-50"
            >
              XLS
            </button>
          </div>
          <button 
            onClick={() => handleOpenForm()}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Novo Procedimento
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative rounded-md shadow-sm flex-1 max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                placeholder="Buscar por nome ou código..."
              />
            </div>
            
            <select 
              value={filters.especialidade}
              onChange={(e) => setFilters(prev => ({ ...prev, especialidade: e.target.value as any }))}
              className="rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white shadow-sm focus:ring-indigo-500"
            >
              <option value="all">Todas Especialidades</option>
              {Object.keys(ESPECIALIDADES_PREFIX).map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                placeholder="Valor Min"
                value={filters.min_valor || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, min_valor: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-24 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white shadow-sm focus:ring-indigo-500"
              />
              <span className="text-slate-400">-</span>
              <input 
                type="number" 
                placeholder="Valor Max"
                value={filters.max_valor || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, max_valor: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-24 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white shadow-sm focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6">Código</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Nome</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Especialidade</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-white">Valor</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    Carregando procedimentos...
                  </td>
                </tr>
              ) : procedures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    Nenhum procedimento encontrado.
                  </td>
                </tr>
              ) : (
                procedures.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-slate-500 dark:text-slate-400 sm:pl-6">
                      {proc.codigo}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {proc.nome}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10">
                        {proc.especialidade}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-white text-right">
                      R$ {proc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handlePerform(proc)}
                          title="Realizar Procedimento"
                          className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenForm(proc)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(proc.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulário Procedimento */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {selectedProcedure && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Código</label>
                    <input 
                      type="text" 
                      value={selectedProcedure.codigo}
                      readOnly
                      className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm sm:text-sm cursor-not-allowed" 
                    />
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Procedimento</label>
                  <input 
                    type="text" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Especialidade</label>
                  <select 
                    value={formData.especialidade}
                    onChange={(e) => setFormData({...formData, especialidade: e.target.value as Especialidade})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    {Object.keys(ESPECIALIDADES_PREFIX).map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    required 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                  <textarea 
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  />
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
                  disabled={loading}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
