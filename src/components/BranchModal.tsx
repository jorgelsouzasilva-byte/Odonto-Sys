import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { X } from "lucide-react"
import { filialService, Filial } from "@/services/filialService"

interface BranchModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  branchId?: string | null
}

export default function BranchModal({ isOpen, onClose, onSuccess, branchId }: BranchModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    nome: "",
    status: "Ativa",
    endereco: "",
    telefone: "",
    email: "",
    cnpj: "",
    observacoes: "",
    horario_funcionamento: "",
    responsavel_id: ""
  })

  useEffect(() => {
    if (isOpen) {
      if (branchId) {
        loadBranchData(branchId)
      } else {
        resetForm()
      }
    }
  }, [isOpen, branchId])

  const resetForm = () => {
    setFormData({
      nome: "",
      status: "Ativa",
      endereco: "",
      telefone: "",
      email: "",
      cnpj: "",
      observacoes: "",
      horario_funcionamento: "",
      responsavel_id: ""
    })
    setError(null)
    setFieldErrors({})
  }

  const loadBranchData = async (id: string) => {
    setLoading(true)
    try {
      const data = await filialService.getFilialById(id)
      setFormData({
        nome: data.nome,
        status: data.status,
        endereco: data.endereco,
        telefone: data.telefone,
        email: data.email,
        cnpj: data.cnpj,
        observacoes: data.observacoes || "",
        horario_funcionamento: data.horario_funcionamento || "",
        responsavel_id: data.responsavel?.id || ""
      })
    } catch (err: any) {
      setError("Erro ao carregar dados da filial.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    let formattedValue = value
    if (name === 'cnpj') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setFieldErrors({})

    try {
      if (branchId) {
        await filialService.updateFilial(branchId, formData)
      } else {
        await filialService.createFilial(formData)
      }
      onSuccess()
    } catch (err: any) {
      if ((err.status === 400 || err.status === 422) && err.body?.errors) {
        setFieldErrors(err.body.errors)
      } else if (err.status === 409) {
        setError(err.body?.error || "Conflito de dados")
      } else {
        setError("Erro interno. Tente novamente mais tarde.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative flex w-full max-w-2xl flex-col rounded-xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {branchId ? "Editar Filial" : "Nova Filial"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Carregando...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20">
                {error}
              </div>
            )}

            <form id="branch-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Nome da Filial *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                  />
                  {fieldErrors.nome && <p className="mt-1 text-xs text-red-500">{fieldErrors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">CNPJ *</label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                  />
                  {fieldErrors.cnpj && <p className="mt-1 text-xs text-red-500">{fieldErrors.cnpj}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Em Reforma">Em Reforma</option>
                    <option value="Inativa">Inativa</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Endereço Completo *</label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                  />
                  {fieldErrors.endereco && <p className="mt-1 text-xs text-red-500">{fieldErrors.endereco}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Horário de Funcionamento</label>
                  <input
                    type="text"
                    name="horario_funcionamento"
                    value={formData.horario_funcionamento}
                    onChange={handleChange}
                    placeholder="Ex: Seg-Sex 08:00-18:00"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Observações</label>
                  <textarea
                    name="observacoes"
                    rows={3}
                    value={formData.observacoes}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="branch-form"
            disabled={saving || loading}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Filial"}
          </button>
        </div>
      </div>
    </div>
  )
}
