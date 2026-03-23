import { useState, useEffect } from "react"
import { X, MapPin, Phone, Mail, Clock, User, Users, Info, Trash2, Edit } from "lucide-react"
import { filialService, Filial, FuncionarioFilial } from "@/services/filialService"
import { cn } from "@/lib/utils"

interface BranchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  branchId: string | null
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function BranchDetailsModal({ isOpen, onClose, branchId, onEdit, onDelete }: BranchDetailsModalProps) {
  const [loading, setLoading] = useState(false)
  const [branch, setBranch] = useState<Filial | null>(null)
  const [staff, setStaff] = useState<FuncionarioFilial[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'staff'>('info')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && branchId) {
      loadData(branchId)
    }
  }, [isOpen, branchId])

  const loadData = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const [branchData, staffData] = await Promise.all([
        filialService.getFilialById(id),
        filialService.getFuncionariosPorFilial(id)
      ])
      setBranch(branchData)
      setStaff(staffData.data)
    } catch (err: any) {
      setError("Erro ao carregar detalhes da filial.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative flex w-full max-w-2xl flex-col rounded-xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Detalhes da Filial
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">Carregando detalhes...</div>
        ) : error || !branch ? (
          <div className="p-12 text-center text-red-500">{error || "Filial não encontrada."}</div>
        ) : (
          <>
            <div className="border-b border-slate-200 dark:border-slate-800 px-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('info')}
                  className={cn(
                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                    activeTab === 'info'
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4" />
                    <span>Informações Gerais</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={cn(
                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                    activeTab === 'staff'
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Equipe da Filial</span>
                    <span className="ml-2 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {staff.length}
                    </span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'info' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{branch.nome}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">CNPJ: {branch.cnpj}</p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                      branch.status === 'Ativa' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                    )}>
                      {branch.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <MapPin className="mt-0.5 h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Endereço</p>
                          <p className="text-sm text-slate-900 dark:text-white">{branch.endereco}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Telefone</p>
                          <p className="text-sm text-slate-900 dark:text-white">{branch.telefone}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Email</p>
                          <p className="text-sm text-slate-900 dark:text-white">{branch.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Horário</p>
                          <p className="text-sm text-slate-900 dark:text-white">{branch.horario_funcionamento || "Não informado"}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Responsável</p>
                          <p className="text-sm text-slate-900 dark:text-white">{branch.responsavel?.nome || "Não atribuído"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {branch.observacoes && (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2">Observações</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{branch.observacoes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {staff.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">Nenhum funcionário vinculado a esta filial.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {staff.map((person) => (
                        <div key={person.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{person.nome}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{person.cargo}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400">{person.email}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => onDelete(branch.id)}
                className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Remover Filial
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Fechar
                </button>
                <button
                  onClick={() => onEdit(branch.id)}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Editar Dados
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
