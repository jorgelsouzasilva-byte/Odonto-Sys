import { useState, useEffect } from "react"
import { Plus, Search, Filter, Building2, MoreVertical, Edit, Trash2, Eye, ArrowRightLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Patrimonio } from "../types/patrimonio"
import { patrimonioService } from "../services/patrimonioService"
import AssetModal from "../components/assets/AssetModal"
import AssetDetailsModal from "../components/assets/AssetDetailsModal"
import TransferModal from "../components/assets/TransferModal"

export default function Assets() {
  const [assets, setAssets] = useState<Patrimonio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterBranch, setFilterBranch] = useState<string | "">("")

  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Patrimonio | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const loadAssets = async () => {
    setLoading(true)
    try {
      const res = await patrimonioService.getPatrimonio(
        filterBranch === "" ? undefined : filterBranch,
        filterStatus === "" ? undefined : filterStatus
      )
      setAssets(res.data)
    } catch (error) {
      console.error("Erro ao carregar patrimônio:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [filterStatus, filterBranch])

  const filteredAssets = assets.filter(asset => 
    asset.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.numero_serie.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (asset: Patrimonio) => {
    setSelectedAsset(asset)
    setIsAssetModalOpen(true)
    setActiveMenu(null)
  }

  const handleViewDetails = (asset: Patrimonio) => {
    setSelectedAsset(asset)
    setIsDetailsModalOpen(true)
    setActiveMenu(null)
  }

  const handleTransfer = (asset: Patrimonio) => {
    setSelectedAsset(asset)
    setIsTransferModalOpen(true)
    setActiveMenu(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este item?")) return
    try {
      await patrimonioService.delete(id)
      loadAssets()
    } catch (error: any) {
      alert(error.error || "Erro ao remover item")
    }
    setActiveMenu(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Patrimônio</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => { setSelectedAsset(null); setIsAssetModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Novo Bem
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex flex-1 space-x-3">
            <div className="relative flex-1 max-w-xs rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                placeholder="Buscar patrimônio..."
              />
            </div>
            
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="rounded-md border-0 py-1.5 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white dark:bg-slate-900"
            >
              <option value="">Todas Filiais</option>
              <option value="1">Matriz</option>
              <option value="2">Filial Centro</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border-0 py-1.5 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white dark:bg-slate-900"
            >
              <option value="">Todos Status</option>
              <option value="Em uso">Em uso</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Em estoque">Em estoque</option>
              <option value="Descartado">Descartado</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6">Bem</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Nº Série</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Filial</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Data Aquisição</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-white">Valor</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">Carregando patrimônio...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">Nenhum item encontrado.</td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                          <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{asset.nome}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                      {asset.numero_serie}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {asset.filial}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(asset.data_aquisicao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        asset.status === 'Em uso' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                        asset.status === 'Manutenção' ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20" :
                        "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20"
                      )}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-white text-right">
                      R$ {asset.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveMenu(activeMenu === asset.id ? null : asset.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {activeMenu === asset.id && (
                          <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <button
                                onClick={() => handleViewDetails(asset)}
                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Eye className="mr-3 h-4 w-4 text-slate-400" />
                                Detalhes
                              </button>
                              <button
                                onClick={() => handleEdit(asset)}
                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Edit className="mr-3 h-4 w-4 text-slate-400" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleTransfer(asset)}
                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <ArrowRightLeft className="mr-3 h-4 w-4 text-slate-400" />
                                Transferir
                              </button>
                              <button
                                onClick={() => handleDelete(asset.id)}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Trash2 className="mr-3 h-4 w-4 text-red-400" />
                                Remover
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssetModal 
        isOpen={isAssetModalOpen} 
        onClose={() => setIsAssetModalOpen(false)} 
        onSuccess={loadAssets}
        asset={selectedAsset}
      />

      <AssetDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        assetId={selectedAsset?.id || null}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={loadAssets}
        asset={selectedAsset}
      />
    </div>
  )
}
