import { useState } from "react"
import { Plus, Search, Filter, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

const procedures = [
  { id: 1, name: 'Limpeza (Profilaxia)', category: 'Prevenção', price: 250.00, duration: '1h', materials: ['Pasta Profilática', 'Escova de Robson'] },
  { id: 2, name: 'Clareamento Dental', category: 'Estética', price: 850.00, duration: '1h 30m', materials: ['Gel Clareador', 'Barreira Gengival'] },
  { id: 3, name: 'Restauração Resina', category: 'Dentística', price: 350.00, duration: '1h', materials: ['Resina Composta', 'Adesivo', 'Ácido'] },
  { id: 4, name: 'Extração Simples', category: 'Cirurgia', price: 400.00, duration: '1h', materials: ['Anestésico', 'Agulha', 'Gaze', 'Fio de Sutura'] },
  { id: 5, name: 'Tratamento de Canal (Incisivo)', category: 'Endodontia', price: 1200.00, duration: '2h', materials: ['Limas', 'Cone de Papel', 'Cimento Endodôntico'] },
]

export default function Procedures() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Procedimentos e Produtos</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Novo Procedimento
          </button>
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
                placeholder="Buscar procedimento..."
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
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6">Procedimento</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Categoria (CRO)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Duração Média</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Materiais Vinculados</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-white">Valor Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {procedures.map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                        <Stethoscope className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{proc.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">
                      {proc.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {proc.duration}
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {proc.materials.join(', ')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-white text-right">
                    R$ {proc.price.toFixed(2).replace('.', ',')}
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
