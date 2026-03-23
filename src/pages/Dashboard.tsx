import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  DollarSign, 
  Stethoscope, 
  FileText, 
  UserPlus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from "@/lib/utils"
import { dashboardService } from "@/services/dashboardService"

const iconMap: Record<string, any> = {
  'Pacientes a Confirmar': Calendar,
  'Agenda do Dia': Users,
  'Estoque Crítico': AlertTriangle,
  'Faturamento (Mês)': DollarSign,
  'Procedimentos Realizados': Stethoscope,
  'Orçamentos Pendentes': FileText,
  'Novos Pacientes': UserPlus,
}

export default function Dashboard() {
  const [stats, setStats] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, chartData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getChartData()
        ])
        setStats(statsData)
        setData(chartData)
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-3">
          <select className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-800">
            <option>Hoje</option>
            <option>Esta Semana</option>
            <option>Este Mês</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.slice(0, 4).map((item) => {
          const Icon = iconMap[item.name] || Users
          return (
            <Link
              key={item.name}
              to={item.href}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6 hover:ring-indigo-500 dark:hover:ring-indigo-500 transition-all group"
            >
              <dt>
                <div className="absolute rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{item.stat}</p>
                <p
                  className={cn(
                    item.changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                    'ml-2 flex items-baseline text-sm font-semibold'
                  )}
                >
                  {item.changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center text-emerald-500" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center text-red-500" aria-hidden="true" />
                  )}
                  <span className="sr-only"> {item.changeType === 'increase' ? 'Aumentou' : 'Diminuiu'} por </span>
                  {item.change}
                </p>
              </dd>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.slice(4).map((item) => {
          const Icon = iconMap[item.name] || Users
          return (
            <Link
              key={item.name}
              to={item.href}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6 hover:ring-indigo-500 dark:hover:ring-indigo-500 transition-all group"
            >
              <dt>
                <div className="absolute rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{item.stat}</p>
              </dd>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Faturamento</h2>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agenda do Dia (Mock for now) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Agenda do Dia</h2>
            <Link to="/agenda" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Ver toda agenda</Link>
          </div>
          <div className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 text-sm text-slate-500">Nenhum agendamento para hoje.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
