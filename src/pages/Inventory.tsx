
import { useState, useEffect } from "react"
import { Plus, Search, Filter, Package, AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight, Barcode } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  InventoryItem, 
  InventoryFilters, 
  InventoryStats, 
  InventoryCategory,
  InventoryUnit,
  ExitReason
} from "@/types/estoque"
import { estoqueService } from "@/services/estoqueService"
import NewItemModal from "@/components/inventory/NewItemModal"
import EntryModal from "@/components/inventory/EntryModal"
import ExitModal from "@/components/inventory/ExitModal"

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<InventoryFilters>({})
  
  // Modals state
  const [isNewItemOpen, setIsNewItemOpen] = useState(false)
  const [isEntryOpen, setIsEntryOpen] = useState(false)
  const [isExitOpen, setIsExitOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [data, s] = await Promise.all([
        estoqueService.list(filters),
        estoqueService.getStats()
      ])
      setItems(data)
      setStats(s)
    } catch (error) {
      console.error("Erro ao carregar estoque", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const handleOpenEntry = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsEntryOpen(true)
  }

  const handleOpenExit = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsExitOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Estoque</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerenciamento completo de materiais e insumos.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsEntryOpen(true)}
            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all"
          >
            <ArrowUpRight className="-ml-0.5 mr-1.5 h-4 w-4" />
            Entrada
          </button>
          <button
            onClick={() => setIsExitOpen(true)}
            className="inline-flex items-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-all"
          >
            <ArrowDownRight className="-ml-0.5 mr-1.5 h-4 w-4" />
            Saída
          </button>
          <button
            onClick={() => setIsNewItemOpen(true)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
          >
            <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total de Itens" value={stats?.total_itens || 0} icon={Package} color="blue" />
        <StatCard label="Baixo Estoque" value={stats?.baixo_estoque || 0} icon={AlertTriangle} color="amber" />
        <StatCard label="Crítico" value={stats?.critico || 0} icon={AlertTriangle} color="red" />
        <StatCard label="Vencidos" value={stats?.vencidos || 0} icon={Calendar} color="red" />
        <StatCard label="Vencendo (30d)" value={stats?.vencendo_30 || 0} icon={Calendar} color="orange" />
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar material..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <select
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value || undefined }))}
          >
            <option value="">Todas Categorias</option>
            <option value="Descartáveis">Descartáveis</option>
            <option value="Anestésicos">Anestésicos</option>
            <option value="Cimentos">Cimentos</option>
            <option value="Restauração">Restauração</option>
            <option value="EPI">EPI</option>
            <option value="Instrumentais">Instrumentais</option>
            <option value="Outros">Outros</option>
          </select>
          <select
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
          >
            <option value="">Todos Status</option>
            <option value="Normal">Normal</option>
            <option value="Baixo">Baixo</option>
            <option value="Crítico">Crítico</option>
            <option value="Vencido">Vencido</option>
            <option value="Vencendo">Vencendo</option>
          </select>
          <input
            type="date"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            onChange={(e) => setFilters(prev => ({ ...prev, validade_ate: e.target.value || undefined }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Quantidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Lote/Validade</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Última Atu.</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">Carregando...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">Nenhum item encontrado.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nome}</span>
                      {item.barcode && (
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Barcode className="mr-1 h-3 w-3" /> {item.barcode}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.categoria}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.quantidade} {item.unidade}(s)
                      </span>
                      <span className="text-xs text-gray-500">Mín: {item.minimo}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      item.status === "Normal" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      item.status === "Baixo" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900 dark:text-white">{item.lote || "-"}</span>
                      <span className={cn(
                        "text-xs",
                        item.validade && new Date(item.validade) < new Date() ? "text-red-500 font-medium" : "text-gray-500"
                      )}>
                        {item.validade ? new Date(item.validade).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.ultima_atualizacao}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleOpenEntry(item)} className="text-emerald-600 hover:text-emerald-900">Entrada</button>
                      <button onClick={() => handleOpenExit(item)} className="text-amber-600 hover:text-amber-900">Saída</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isNewItemOpen && (
        <NewItemModal 
          onClose={() => setIsNewItemOpen(false)} 
          onSave={() => { setIsNewItemOpen(false); loadData(); }} 
        />
      )}
      {isEntryOpen && (
        <EntryModal 
          item={selectedItem} 
          items={items}
          onClose={() => { setIsEntryOpen(false); setSelectedItem(null); }} 
          onSave={() => { setIsEntryOpen(false); setSelectedItem(null); loadData(); }} 
        />
      )}
      {isExitOpen && (
        <ExitModal 
          item={selectedItem} 
          items={items}
          onClose={() => { setIsExitOpen(false); setSelectedItem(null); }} 
          onSave={() => { setIsExitOpen(false); setSelectedItem(null); loadData(); }} 
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  }
  
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center">
        <div className={cn("rounded-md p-3", colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}
