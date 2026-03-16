import { useState } from "react"
import { ArrowDownRight, ArrowUpRight, DollarSign, Plus, Download, Filter, Search, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
  { id: 1, date: '16/03/2026', description: 'Clareamento Dental - Maria Silva', category: 'Procedimento', type: 'income', amount: 850.00, status: 'Pago', method: 'Cartão de Crédito' },
  { id: 2, date: '15/03/2026', description: 'Compra de Materiais (Dental Cremer)', category: 'Estoque', type: 'expense', amount: 1240.50, status: 'Pago', method: 'Boleto' },
  { id: 3, date: '15/03/2026', description: 'Limpeza - João Santos', category: 'Procedimento', type: 'income', amount: 250.00, status: 'Pendente', method: 'Pix' },
  { id: 4, date: '14/03/2026', description: 'Conta de Luz', category: 'Despesas Fixas', type: 'expense', amount: 450.00, status: 'Pago', method: 'Débito Automático' },
  { id: 5, date: '14/03/2026', description: 'Manutenção Equipamento', category: 'Patrimônio', type: 'expense', amount: 300.00, status: 'Pago', method: 'Pix' },
  { id: 6, date: '13/03/2026', description: 'Canal - Pedro Costa (Parcela 1/3)', category: 'Procedimento', type: 'income', amount: 400.00, status: 'Pago', method: 'Cartão de Crédito' },
]

const stats = [
  { name: 'Receitas (Mês)', stat: 'R$ 45.231,00', icon: ArrowUpRight, change: '+12%', changeType: 'increase' },
  { name: 'Despesas (Mês)', stat: 'R$ 12.450,00', icon: ArrowDownRight, change: '-2%', changeType: 'decrease' },
  { name: 'Saldo Atual', stat: 'R$ 32.781,00', icon: DollarSign, change: '+18%', changeType: 'increase' },
  { name: 'A Receber (Hoje)', stat: 'R$ 1.250,00', icon: FileText, change: '5', changeType: 'neutral' },
]

export default function Financial() {
  const [activeTab, setActiveTab] = useState('todas')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Financeiro</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Download className="-ml-0.5 mr-1.5 h-5 w-5 text-slate-400" aria-hidden="true" />
            Exportar
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={cn(
                "absolute rounded-xl p-3",
                item.icon === ArrowUpRight ? "bg-emerald-50 dark:bg-emerald-500/10" :
                item.icon === ArrowDownRight ? "bg-red-50 dark:bg-red-500/10" :
                "bg-indigo-50 dark:bg-indigo-500/10"
              )}>
                <item.icon className={cn(
                  "h-6 w-6",
                  item.icon === ArrowUpRight ? "text-emerald-600 dark:text-emerald-400" :
                  item.icon === ArrowDownRight ? "text-red-600 dark:text-red-400" :
                  "text-indigo-600 dark:text-indigo-400"
                )} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{item.stat}</p>
            </dd>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:items-center sm:space-x-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['todas', 'receitas', 'despesas'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
                    'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize'
                  )}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                placeholder="Buscar transação..."
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
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-white sm:pl-6">Data</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Descrição</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Categoria</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Método</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-white">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 dark:text-slate-400 sm:pl-6">
                    {transaction.date}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-500/10">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {transaction.method}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      transaction.status === 'Pago' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                    )}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className={cn(
                    "whitespace-nowrap px-3 py-4 text-sm font-medium text-right",
                    transaction.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">6</span> de <span className="font-medium">97</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0">
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0">
                  2
                </button>
                <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0">
                  <span className="sr-only">Próximo</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
