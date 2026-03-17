import { useState, useEffect, FormEvent } from "react"
import { X } from "lucide-react"
import { CreatePatrimonioDTO, Patrimonio } from "../../types/patrimonio"
import { patrimonioService } from "../../services/patrimonioService"

interface AssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  asset?: Patrimonio | null
}

export default function AssetModal({ isOpen, onClose, onSuccess, asset }: AssetModalProps) {
  const [formData, setFormData] = useState<CreatePatrimonioDTO>({
    nome: "",
    numero_serie: "",
    filial_id: 1,
    data_aquisicao: new Date().toISOString().split('T')[0],
    valor: 0,
    estado: "Em uso",
    observacoes: ""
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (asset) {
      setFormData({
        nome: asset.nome,
        numero_serie: asset.numero_serie,
        filial_id: asset.filial_id,
        data_aquisicao: asset.data_aquisicao,
        valor: asset.valor,
        estado: asset.status,
        observacoes: asset.observacoes
      })
    } else {
      setFormData({
        nome: "",
        numero_serie: "",
        filial_id: 1,
        data_aquisicao: new Date().toISOString().split('T')[0],
        valor: 0,
        estado: "Em uso",
        observacoes: ""
      })
    }
    setErrors({})
  }, [asset, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nome) newErrors.nome = "Nome é obrigatório"
    if (!formData.numero_serie) newErrors.numero_serie = "Número de série é obrigatório"
    if (!formData.filial_id) newErrors.filial_id = "Filial é obrigatória"
    if (formData.valor < 0) newErrors.valor = "Valor não pode ser negativo"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      if (asset) {
        await patrimonioService.update(asset.id, formData)
      } else {
        await patrimonioService.create(formData)
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.status === 409) {
        setErrors({ numero_serie: error.error })
      } else {
        alert(error.error || "Erro ao salvar item")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {asset ? "Editar Bem" : "Novo Bem de Patrimônio"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Bem</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Número de Série</label>
              <input
                type="text"
                required
                value={formData.numero_serie}
                onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.numero_serie && <p className="mt-1 text-xs text-red-500">{errors.numero_serie}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filial</label>
              <select
                value={formData.filial_id}
                onChange={(e) => setFormData({ ...formData, filial_id: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value={1}>Matriz</option>
                <option value={2}>Filial Centro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data Aquisição</label>
              <input
                type="date"
                required
                value={formData.data_aquisicao}
                onChange={(e) => setFormData({ ...formData, data_aquisicao: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Em uso">Em uso</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Em estoque">Em estoque</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
              <textarea
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
