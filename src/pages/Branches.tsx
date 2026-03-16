import { useState } from "react"
import { Plus, Search, MapPin, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const branches = [
  { id: 1, name: 'Matriz - Centro', address: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP', phone: '(11) 3000-1000', email: 'matriz@odontosys.com.br', cnpj: '12.345.678/0001-90', status: 'Ativa' },
  { id: 2, name: 'Filial Zona Sul', address: 'Av. Santo Amaro, 2500 - Moema, São Paulo/SP', phone: '(11) 3000-2000', email: 'zonasul@odontosys.com.br', cnpj: '12.345.678/0002-71', status: 'Ativa' },
  { id: 3, name: 'Filial Zona Leste', address: 'Rua Tuiuti, 1500 - Tatuapé, São Paulo/SP', phone: '(11) 3000-3000', email: 'zonaleste@odontosys.com.br', cnpj: '12.345.678/0003-52', status: 'Em Reforma' },
]

export default function Branches() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Filiais</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Nova Filial
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <div key={branch.id} className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{branch.name}</h3>
                </div>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                  branch.status === 'Ativa' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                  "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                )}>
                  {branch.status}
                </span>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{branch.address}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{branch.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{branch.email}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">CNPJ: {branch.cnpj}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end">
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
