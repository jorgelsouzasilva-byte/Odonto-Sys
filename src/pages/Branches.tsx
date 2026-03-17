import { useState, useEffect } from "react"
import { Plus, Search, MapPin, Phone, Mail, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { filialService, Filial } from "@/services/filialService"
import BranchModal from "@/components/BranchModal"
import BranchDetailsModal from "@/components/BranchDetailsModal"

export default function Branches() {
  const [branches, setBranches] = useState<Filial[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("")

  const [searchTerm, setSearchTerm] = useState("")

  const loadBranches = async () => {
    setLoading(true)
    try {
      const res = await filialService.getFiliais(filterStatus || undefined)
      let filtered = res.data
      if (searchTerm) {
        filtered = filtered.filter(b => 
          b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.cnpj.includes(searchTerm) ||
          b.endereco.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      setBranches(filtered)
    } catch (error) {
      console.error("Erro ao carregar filiais:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranches()
  }, [filterStatus, searchTerm])

  const handleOpenModal = (id?: number) => {
    setSelectedBranchId(id || null)
    setIsModalOpen(true)
    setIsDetailsOpen(false)
  }

  const handleOpenDetails = (id: number) => {
    setSelectedBranchId(id)
    setIsDetailsOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBranchId(null)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedBranchId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
    loadBranches()
    showToast(selectedBranchId ? "Filial atualizada com sucesso" : "Filial criada com sucesso")
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover esta filial?")) return

    try {
      await filialService.deleteFilial(id)
      handleCloseDetails()
      loadBranches()
      showToast("Filial removida com sucesso")
    } catch (err: any) {
      showToast(err.body?.error || "Erro ao remover filial", 'error')
    }
  }

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className={cn(
          "fixed bottom-4 right-4 z-50 rounded-md p-4 text-sm shadow-lg transition-all ring-1 ring-inset",
          toastMessage.type === 'success' 
            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
            : "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20"
        )}>
          {toastMessage.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Filiais</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Nova Filial
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
            placeholder="Buscar filial..."
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
          >
            <option value="">Todos os Status</option>
            <option value="Ativa">Ativa</option>
            <option value="Em Reforma">Em Reforma</option>
            <option value="Inativa">Inativa</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Carregando filiais...</div>
      ) : branches.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Nenhuma filial encontrada.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div key={branch.id} className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{branch.nome}</h3>
                  </div>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                    branch.status === 'Ativa' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                  )}>
                    {branch.status}
                  </span>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-start">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{branch.endereco}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{branch.telefone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{branch.email}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">CNPJ: {branch.cnpj}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end">
                <button 
                  onClick={() => handleOpenDetails(branch.id)}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BranchModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        branchId={selectedBranchId}
      />

      <BranchDetailsModal 
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        branchId={selectedBranchId}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />
    </div>
  )
}
