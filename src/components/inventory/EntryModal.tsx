
import { useState, FormEvent, useEffect } from "react"
import { X, ArrowUpRight, Barcode } from "lucide-react"
import { InventoryItem, StockEntry } from "@/types/estoque"
import { estoqueService } from "@/services/estoqueService"

interface EntryModalProps {
  item: InventoryItem | null;
  items: InventoryItem[];
  onClose: () => void;
  onSave: () => void;
}

export default function EntryModal({ item, items, onClose, onSave }: EntryModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<StockEntry>({
    item_id: item?.id || 0,
    quantidade: 1,
    lote: "",
    validade: "",
    fornecedor: "",
    nota_fiscal: "",
    custo_total: undefined,
    custo_unitario: undefined
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

  // Calculation Logic
  useEffect(() => {
    if (formData.quantidade > 0) {
      if (formData.custo_total && !formData.custo_unitario) {
        setFormData(prev => ({ ...prev, custo_unitario: prev.custo_total! / prev.quantidade }))
      } else if (formData.custo_unitario && !formData.custo_total) {
        setFormData(prev => ({ ...prev, custo_total: prev.custo_unitario! * prev.quantidade }))
      }
    }
  }, [formData.quantidade, formData.custo_total, formData.custo_unitario])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (formData.item_id === 0) return alert("Selecione um material")
    
    setLoading(true)
    try {
      await estoqueService.registerEntry(formData)
      onSave()
    } catch (error) {
      alert("Erro ao registrar entrada")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Entrada de Estoque</h2>
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
                onChange={(e) => setFormData({ ...formData, item_id: parseInt(e.target.value) })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              >
                <option value="0">Selecione um material...</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.nome}</option>
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lote</label>
              <input
                type="text"
                value={formData.lote}
                onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Validade</label>
              <input
                type="date"
                value={formData.validade}
                onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nota Fiscal</label>
              <input
                type="text"
                value={formData.nota_fiscal}
                onChange={(e) => setFormData({ ...formData, nota_fiscal: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor</label>
            <input
              type="text"
              value={formData.fornecedor}
              onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custo Total (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.custo_total || ""}
                onChange={(e) => setFormData({ ...formData, custo_total: e.target.value ? parseFloat(e.target.value) : undefined, custo_unitario: undefined })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.custo_unitario || ""}
                onChange={(e) => setFormData({ ...formData, custo_unitario: e.target.value ? parseFloat(e.target.value) : undefined, custo_total: undefined })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              />
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
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar Entrada"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
