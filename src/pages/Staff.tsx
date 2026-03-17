import { useState, useEffect } from "react"
import { Plus, Search, Filter, UserCog, Mail, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { equipeService, Funcionario, Filial } from "@/services/equipeService"
import StaffModal from "@/components/StaffModal"

export default function Staff() {
  const [staff, setStaff] = useState<Funcionario[]>([])
  const [filiais, setFiliais] = useState<Filial[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedFilial, setSelectedFilial] = useState<string>("")

  const loadData = async () => {
    setLoading(true)
    try {
      const [staffRes, filiaisRes] = await Promise.all([
        equipeService.getFuncionarios(selectedFilial ? Number(selectedFilial) : undefined),
        equipeService.getFiliais()
      ])
      setStaff(staffRes.data)
      setFiliais(filiaisRes.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedFilial])

  const handleOpenModal = (id?: number) => {
    setSelectedStaffId(id || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStaffId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
    loadData()
    showToast(selectedStaffId ? "Membro atualizado com sucesso" : "Membro criado com sucesso")
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 rounded-md bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Equipe e Dentistas</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Novo Membro
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex space-x-3 w-full sm:w-auto">
            <div className="relative rounded-md shadow-sm flex-1 sm:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                placeholder="Buscar membro da equipe..."
              />
            </div>
            <select
              value={selectedFilial}
              onChange={(e) => setSelectedFilial(e.target.value)}
              className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
            >
              <option value="">Todas as Filiais</option>
              {filiais.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6">Nome</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Cargo / Especialidade</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">CRO/Registro</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Filial</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Carregando equipe...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              ) : (
                staff.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            {person.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{person.nome}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs">{person.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {person.cargo}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                      {person.cro || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">
                        {person.filial}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        person.status === 'Ativo' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                        "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                      )}>
                        {person.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button 
                        onClick={() => handleOpenModal(person.id)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Editar<span className="sr-only">, {person.nome}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StaffModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        staffId={selectedStaffId}
      />
    </div>
  )
}
