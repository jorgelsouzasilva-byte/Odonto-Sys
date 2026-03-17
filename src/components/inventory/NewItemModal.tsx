
import { useState, FormEvent } from "react"
import { X, Barcode } from "lucide-react"
import { InventoryCategory, InventoryUnit } from "@/types/estoque"
import { estoqueService } from "@/services/estoqueService"

interface NewItemModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function NewItemModal({ onClose, onSave }: NewItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    barcode: "",
    nome: "",
    categoria: "Descartáveis" as InventoryCategory,
    unidade: "Unidade" as InventoryUnit,
    minimo: 0,
    observacoes: ""
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await estoqueService.create(formData)
      onSave()
    } catch (error) {
      alert("Erro ao criar item")
    } finally {
      setLoading(false)
    }
  }

  const handleBarcodeScan = () => {
    // Simulate barcode scan
    const mockBarcode = "7891234567890"
    setFormData(prev => ({ 
      ...prev, 
      barcode: mockBarcode,
      nome: "Material Escaneado Exemplo",
      categoria: "Descartáveis"
    }))
    alert("Código de barras escaneado! Campos preenchidos automaticamente.")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Novo Item de Estoque</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Código de Barras</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Barcode className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  placeholder="000000000000"
                />
              </div>
              <button
                type="button"
                onClick={handleBarcodeScan}
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Escanear
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Material *</label>
            <input
              required
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria *</label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as InventoryCategory })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              >
                <option value="Descartáveis">Descartáveis</option>
                <option value="Anestésicos">Anestésicos</option>
                <option value="Cimentos">Cimentos</option>
                <option value="Restauração">Restauração</option>
                <option value="EPI">EPI</option>
                <option value="Instrumentais">Instrumentais</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unidade *</label>
              <select
                required
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value as InventoryUnit })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              >
                <option value="Caixa">Caixa</option>
                <option value="Seringa">Seringa</option>
                <option value="Kit">Kit</option>
                <option value="Unidade">Unidade</option>
                <option value="Pacote">Pacote</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade Mínima *</label>
            <input
              required
              type="number"
              min="0"
              value={formData.minimo}
              onChange={(e) => setFormData({ ...formData, minimo: parseInt(e.target.value) })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
            <textarea
              rows={3}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
            />
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
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
