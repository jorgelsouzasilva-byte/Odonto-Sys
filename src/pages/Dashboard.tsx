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

const stats = [
  { name: 'Pacientes a Confirmar', stat: '12', icon: Calendar, change: '12%', changeType: 'increase', href: '/agenda' },
  { name: 'Agenda do Dia', stat: '24', icon: Users, change: '5.4%', changeType: 'increase', href: '/agenda' },
  { name: 'Estoque Crítico', stat: '3', icon: AlertTriangle, change: '2', changeType: 'decrease', href: '/estoque' },
  { name: 'Faturamento (Mês)', stat: 'R$ 45.231', icon: DollarSign, change: '12%', changeType: 'increase', href: '/financeiro' },
  { name: 'Procedimentos Realizados', stat: '156', icon: Stethoscope, change: '3.2%', changeType: 'increase', href: '/procedimentos' },
  { name: 'Orçamentos Pendentes', stat: '18', icon: FileText, change: '4', changeType: 'decrease', href: '/pacientes' },
  { name: 'Novos Pacientes', stat: '42', icon: UserPlus, change: '10%', changeType: 'increase', href: '/pacientes' },
]

const data = [
  { name: 'Jan', total: 32000 },
  { name: 'Fev', total: 38000 },
  { name: 'Mar', total: 45231 },
  { name: 'Abr', total: 0 },
  { name: 'Mai', total: 0 },
  { name: 'Jun', total: 0 },
]

const appointments = [
  { id: 1, patient: 'Maria Silva', procedure: 'Limpeza', time: '09:00', status: 'Confirmado', dentist: 'Dr. Jorge' },
  { id: 2, patient: 'João Santos', procedure: 'Extração', time: '10:30', status: 'A Confirmar', dentist: 'Dra. Ana' },
  { id: 3, patient: 'Pedro Costa', procedure: 'Avaliação', time: '11:00', status: 'Na Sala de Espera', dentist: 'Dr. Jorge' },
  { id: 4, patient: 'Ana Oliveira', procedure: 'Clareamento', time: '14:00', status: 'Confirmado', dentist: 'Dra. Ana' },
]

export default function Dashboard() {
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
        {stats.slice(0, 4).map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6 hover:ring-indigo-500 dark:hover:ring-indigo-500 transition-all group"
          >
            <dt>
              <div className="absolute rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                <item.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
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
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.slice(4).map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pt-5 pb-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 sm:px-6 sm:pt-6 hover:ring-indigo-500 dark:hover:ring-indigo-500 transition-all group"
          >
            <dt>
              <div className="absolute rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                <item.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{item.stat}</p>
            </dd>
          </Link>
        ))}
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

        {/* Agenda do Dia */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Agenda do Dia</h2>
            <Link to="/agenda" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Ver toda agenda</Link>
          </div>
          <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-800">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          {appointment.patient.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{appointment.patient}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{appointment.procedure} • {appointment.dentist}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{appointment.time}</span>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      appointment.status === 'Confirmado' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                      appointment.status === 'A Confirmar' ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20" :
                      "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                    )}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
