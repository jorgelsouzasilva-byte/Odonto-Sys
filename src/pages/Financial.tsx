import { useState, useEffect, FormEvent } from "react"
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  DollarSign, 
  Plus, 
  Download, 
  Filter, 
  Search, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Calendar,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Transaction, 
  FinancialSummary, 
  FinancialFilters, 
  PeriodType,
  TransactionType,
  TransactionStatus
} from "../types/financeiro"
import { financeiroService } from "../services/financeiroService"
import { filialService, Filial } from "../services/filialService"

export default function Financial() {
  const [activeTab, setActiveTab] = useState<'todas' | TransactionType>('todas')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [filters, setFilters] = useState<FinancialFilters>({
    period: 'month',
    start_date: '2026-03-01',
    end_date: '2026-03-31',
    type: 'all',
    status: 'all',
    page: 1,
    per_page: 20
  })
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalItems, setTotalItems] = useState(0)
  const [filiais, setFiliais] = useState<Filial[]>([])

  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria: '',
    metodo: 'Pix',
    status: 'Pendente',
    tipo: 'receita',
    valor: 0,
    filial_id: ''
  })

  useEffect(() => {
    fetchData()
    loadFiliais()
  }, [filters])

  const loadFiliais = async () => {
    try {
      const res = await filialService.getFiliais()
      setFiliais(res.data)
    } catch (error) {
      console.error("Error loading filiais:", error)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [transRes, summaryRes] = await Promise.all([
        financeiroService.getTransactions(filters),
        financeiroService.getSummary(filters)
      ])
      setTransactions(transRes.data)
      setTotalItems(transRes.meta.total)
      setSummary(summaryRes)
    } catch (error) {
      console.error("Error fetching financial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }

  const handlePeriodChange = async (period: PeriodType) => {
    const nav = await financeiroService.getPeriodNav(period, filters.start_date || new Date().toISOString())
    setFilters(prev => ({
      ...prev,
      period,
      start_date: nav.current.start_date,
      end_date: nav.current.end_date,
      page: 1
    }))
  }

  const handleNavPeriod = async (direction: 'prev' | 'next') => {
    const nav = await financeiroService.getPeriodNav(filters.period, filters.start_date || new Date().toISOString())
    const target = direction === 'prev' ? nav.prev : nav.next
    setFilters(prev => ({
      ...prev,
      start_date: target.start_date,
      end_date: target.end_date,
      page: 1
    }))
  }

  const handleExport = async (format: 'pdf' | 'xls') => {
    setExporting(true)
    try {
      const res = await financeiroService.export({ ...filters, format })
      alert(`${res.mensagem}: ${res.file_name}`)
      window.open(res.file_url, '_blank')
    } catch (error: any) {
      alert(error.error || "Erro ao exportar")
    } finally {
      setExporting(false)
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Adjust value for expenses (ensure it's negative)
      const finalData = {
        ...formData,
        valor: formData.tipo === 'despesa' ? -Math.abs(formData.valor) : Math.abs(formData.valor)
      }
      
      if (selectedTransaction) {
        await financeiroService.updateTransaction(selectedTransaction.id, finalData)
      } else {
        await financeiroService.createTransaction(finalData)
      }
      
      setIsFormOpen(false)
      setSelectedTransaction(null)
      fetchData()
    } catch (error) {
      alert("Erro ao salvar transação")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsOpen(true)
  }

  const handleRegisterPayment = async () => {
    if (!selectedTransaction) return
    setLoading(true)
    try {
      await financeiroService.updateTransaction(selectedTransaction.id, { status: 'Pago' })
      setIsDetailsOpen(false)
      fetchData()
    } catch (error) {
      alert("Erro ao registrar pagamento")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTransaction || !confirm("Deseja realmente excluir esta transação?")) return
    setLoading(true)
    try {
      await financeiroService.deleteTransaction(selectedTransaction.id)
      setIsDetailsOpen(false)
      fetchData()
    } catch (error) {
      alert("Erro ao excluir transação")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const stats = summary ? [
    { name: 'Receitas (Mês)', stat: `R$ ${summary.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ArrowUpRight, color: 'emerald' },
    { name: 'Despesas (Mês)', stat: `R$ ${summary.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ArrowDownRight, color: 'red' },
    { name: 'Saldo Atual', stat: `R$ ${summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'indigo' },
    { name: 'A Receber (Hoje)', stat: `R$ ${summary.a_receber_hoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: FileText, color: 'amber' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Financeiro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie o fluxo de caixa da sua clínica</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={filters.filial_id || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, filial_id: e.target.value || undefined, page: 1 }))}
            className="rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white shadow-sm focus:ring-indigo-500"
          >
            <option value="">Todas as Filiais</option>
            {filiais.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
          
          <div className="flex rounded-md shadow-sm">
            <button 
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="inline-flex items-center rounded-l-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Download className="-ml-0.5 mr-1.5 h-5 w-5 text-slate-400" />}
              PDF
            </button>
            <button 
              onClick={() => handleExport('xls')}
              disabled={exporting}
              className="inline-flex items-center rounded-r-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 border-l border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              XLS
            </button>
          </div>
          <button 
            onClick={() => {
              setSelectedTransaction(null)
              setFormData({
                data: new Date().toISOString().split('T')[0],
                descricao: '',
                categoria: '',
                metodo: 'Pix',
                status: 'Pendente',
                tipo: 'receita',
                valor: 0,
                filial_id: ''
              })
              setIsFormOpen(true)
            }}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Período e Filtros Rápidos */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(['day', 'month', 'year', 'custom'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filters.period === p 
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              {p === 'day' ? 'Dia' : p === 'month' ? 'Mês' : p === 'year' ? 'Ano' : 'Personalizado'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleNavPeriod('prev')}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {new Date(filters.start_date || '').toLocaleDateString('pt-BR')} - {new Date(filters.end_date || '').toLocaleDateString('pt-BR')}
            </span>
          </div>
          <button 
            onClick={() => handleNavPeriod('next')}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={cn(
                "absolute rounded-xl p-3",
                item.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-500/10" :
                item.color === 'red' ? "bg-red-50 dark:bg-red-500/10" :
                item.color === 'amber' ? "bg-amber-50 dark:bg-amber-500/10" :
                "bg-indigo-50 dark:bg-indigo-500/10"
              )}>
                <item.icon className={cn(
                  "h-6 w-6",
                  item.color === 'emerald' ? "text-emerald-600 dark:text-emerald-400" :
                  item.color === 'red' ? "text-red-600 dark:text-red-400" :
                  item.color === 'amber' ? "text-amber-600 dark:text-amber-400" :
                  "text-indigo-600 dark:text-indigo-400"
                )} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{item.stat}</p>
            </dd>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:items-center sm:space-x-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {(['todas', 'receita', 'despesa'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setFilters(prev => ({ ...prev, type: tab === 'todas' ? 'all' : tab, page: 1 }))
                  }}
                  className={cn(
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
                    'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize'
                  )}
                >
                  {tab === 'todas' ? 'Todas' : tab === 'receita' ? 'Receitas' : 'Despesas'}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <form onSubmit={handleSearch} className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                placeholder="Buscar transação..."
              />
            </form>
            <select 
              value={filters.status || 'all'}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
              className="rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white shadow-sm focus:ring-indigo-500"
            >
              <option value="all">Todos Status</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
            </select>
            <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
              <Filter className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}
          
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6">Data</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Descrição</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Categoria</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Método</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-white">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {transactions.length > 0 ? transactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  onClick={() => handleOpenDetails(transaction)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 dark:text-slate-400 sm:pl-6">
                    {new Date(transaction.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {transaction.descricao}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">
                      {transaction.categoria}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {transaction.metodo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      transaction.status === 'Pago' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                    )}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className={cn(
                    "whitespace-nowrap px-3 py-4 text-sm font-medium text-right",
                    transaction.tipo === 'receita' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {transaction.tipo === 'receita' ? '+' : ''} R$ {transaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )) : !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    Nenhuma transação encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Mostrando <span className="font-medium">{(filters.page! - 1) * filters.per_page! + 1}</span> a <span className="font-medium">{Math.min(filters.page! * filters.per_page!, totalItems)}</span> de <span className="font-medium">{totalItems}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button 
                  onClick={() => handlePageChange(Math.max(1, filters.page! - 1))}
                  disabled={filters.page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:z-20 focus:outline-offset-0">
                  Página {filters.page}
                </div>
                <button 
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page! * filters.per_page! >= totalItems}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Próximo</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nova Transação */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nova Transação</h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                <select 
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value as TransactionType})}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                <input 
                  type="text" 
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                  <input 
                    type="date" 
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                <input 
                  type="text" 
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Método de Pagamento</label>
                <select 
                  value={formData.metodo}
                  onChange={(e) => setFormData({...formData, metodo: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filial</label>
                <select 
                  value={formData.filial_id}
                  onChange={(e) => setFormData({...formData, filial_id: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Selecione uma filial</option>
                  {filiais.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
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

      {/* Modal Detalhes */}
      {isDetailsOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes da Transação</h2>
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Descrição</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">{selectedTransaction.descricao}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Valor</p>
                  <p className={cn(
                    "text-base font-semibold",
                    selectedTransaction.tipo === 'receita' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {selectedTransaction.tipo === 'receita' ? '+' : ''} R$ {selectedTransaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Data</p>
                  <p className="text-base text-slate-900 dark:text-white">{new Date(selectedTransaction.data).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Categoria</p>
                  <p className="text-base text-slate-900 dark:text-white">{selectedTransaction.categoria}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Método</p>
                  <p className="text-base text-slate-900 dark:text-white">{selectedTransaction.metodo}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</p>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mt-1",
                  selectedTransaction.status === 'Pago' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                  "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                )}>
                  {selectedTransaction.status}
                </span>
              </div>
              
              {selectedTransaction.status === 'Pendente' && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <button
                    onClick={handleRegisterPayment}
                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Registrar Pagamento
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full rounded-md border border-red-300 dark:border-red-900 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Excluir Transação
                  </button>
                </div>
              )}
              {selectedTransaction.status === 'Pago' && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleDelete}
                    className="w-full rounded-md border border-red-300 dark:border-red-900 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Excluir Transação
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
