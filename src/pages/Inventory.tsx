import { useState } from "react"
import { Plus, Search, Filter, AlertTriangle, ArrowDown, ArrowUp, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const inventory = [
  { id: 1, name: 'Resina Composta Z350', category: 'Materiais de Restauração', quantity: 15, minQuantity: 10, unit: 'Seringa', lastUpdate: '10/03/2026', status: 'normal' },
  { id: 2, name: 'Anestésico Lidocaína', category: 'Anestésicos', quantity: 5, minQuantity: 20, unit: 'Caixa', lastUpdate: '15/03/2026', status: 'critical' },
  { id: 3, name: 'Luvas de Procedimento M', category: 'Descartáveis', quantity: 12, minQuantity: 15, unit: 'Caixa', lastUpdate: '14/03/2026', status: 'warning' },
  { id: 4, name: 'Agulha Gengival Curta', category: 'Descartáveis', quantity: 50, minQuantity: 20, unit: 'Caixa', lastUpdate: '01/03/2026', status: 'normal' },
  { id: 5, name: 'Cimento de Ionômero de Vidro', category: 'Cimentos', quantity: 2, minQuantity: 5, unit: 'Kit', lastUpdate: '16/03/2026', status: 'critical' },
]

export default function Inventory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Estoque</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
            <ArrowDown className="-ml-0.5 mr-1.5 h-4 w-4 text-emerald-500" aria-hidden="true" />
            Entrada
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
            <ArrowUp className="-ml-0.5 mr-1.5 h-4 w-4 text-red-500" aria-hidden="true" />
            Saída
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3">
              <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-slate-400">Total de Itens</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">458</p>
          </dd>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-slate-400">Estoque Baixo</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">12</p>
          </dd>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-xl bg-red-50 dark:bg-red-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-slate-400">Estoque Crítico</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">3</p>
          </dd>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex space-x-3">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                placeholder="Buscar material..."
              />
            </div>
            <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
              <Filter className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6">Material</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Categoria</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Quantidade</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Mínimo</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Última Atualização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white sm:pl-6">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900 dark:text-white font-medium">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.minQuantity} {item.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      item.status === 'normal' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                      item.status === 'warning' ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20" :
                      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20"
                    )}>
                      {item.status === 'normal' ? 'Normal' : item.status === 'warning' ? 'Baixo' : 'Crítico'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.lastUpdate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
