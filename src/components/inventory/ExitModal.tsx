
import { useState, FormEvent } from "react"
import { X, ArrowDownRight, Barcode } from "lucide-react"
import { InventoryItem, StockExit, ExitReason } from "@/types/estoque"
import { estoqueService } from "@/services/estoqueService"

interface ExitModalProps {
  item: InventoryItem | null;
  items: InventoryItem[];
  onClose: () => void;
  onSave: () => void;
}

export default function ExitModal({ item, items, onClose, onSave }: ExitModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<StockExit>({
    item_id: item?.id || "",
    quantidade: 1,
    motivo: "Uso em Procedimento" as ExitReason
  })

  const handleBarcodeScan = () => {
    // Simulate finding item by barcode
    const mockBarcode = "7891234567890"
    const found = items.find(i => i.barcode === mockBarcode)
    if (found) {
      setFormData(prev => ({ ...prev, item_id: found.id }))
      alert(`Material "${found.nome}" identificado pelo código de barras!`)
    } else {
      alert("Material não encontrado para este código de barras.")
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.item_id) return alert("Selecione um material")
    
    const selected = items.find(i => i.id === formData.item_id)
    if (selected && formData.quantidade > selected.quantidade) {
      return alert(`Quantidade insuficiente em estoque. Disponível: ${selected.quantidade}`)
    }

    setLoading(true)
    try {
      await estoqueService.registerExit(formData)
      onSave()
    } catch (error) {
      alert("Erro ao registrar saída")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
              <ArrowDownRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saída de Estoque</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Material *</label>
            <div className="flex space-x-2">
              <select
                required
                value={formData.item_id}
                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              >
                <option value="">Selecione um material...</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.nome} (Disp: {i.quantidade} {i.unidade})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBarcodeScan}
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <Barcode className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade *</label>
              <input
                required
                type="number"
                min="1"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Motivo *</label>
              <select
                required
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value as ExitReason })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              >
                <option value="Uso em Procedimento">Uso em Procedimento</option>
                <option value="Perda">Perda</option>
                <option value="Vencimento">Vencimento</option>
                <option value="Transferência">Transferência</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600 transition-all"
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              type="submit"
              className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-all disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar Saída"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
