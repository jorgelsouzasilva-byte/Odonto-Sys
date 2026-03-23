import { useState, useEffect, FormEvent } from "react"
import { X, ArrowRightLeft } from "lucide-react"
import { Patrimonio, TransferPatrimonioDTO } from "../../types/patrimonio"
import { patrimonioService } from "../../services/patrimonioService"

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  asset: Patrimonio | null
}

export default function TransferModal({ isOpen, onClose, onSuccess, asset }: TransferModalProps) {
  const [formData, setFormData] = useState<TransferPatrimonioDTO>({
    destino_filial_id: "1",
    data_transferencia: new Date().toISOString().split('T')[0],
    motivo: ""
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (asset) {
      // Default destination to the other branch
      setFormData({
        destino_filial_id: asset.filial_id === "1" ? "2" : "1",
        data_transferencia: new Date().toISOString().split('T')[0],
        motivo: ""
      })
    }
  }, [asset, isOpen])

  if (!isOpen || !asset) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await patrimonioService.transfer(asset.id, formData)
      onSuccess()
      onClose()
    } catch (error: any) {
      alert(error.error || "Erro ao transferir item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5 text-indigo-500" />
            <span>Transferir Bem</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Item selecionado</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{asset.nome}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Origem: {asset.filial}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filial de Destino</label>
            <select
              value={formData.destino_filial_id}
              onChange={(e) => setFormData({ ...formData, destino_filial_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="1" disabled={asset.filial_id === "1"}>Matriz</option>
              <option value="2" disabled={asset.filial_id === "2"}>Filial Centro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Transferência</label>
            <input
              type="date"
              required
              value={formData.data_transferencia}
              onChange={(e) => setFormData({ ...formData, data_transferencia: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Motivo</label>
            <textarea
              rows={3}
              required
              placeholder="Ex: Redistribuição de equipamentos entre unidades"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
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
              {loading ? "Processando..." : "Confirmar Transferência"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
