import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

const days = [
  { date: '2026-03-16', isCurrentMonth: true, isToday: true },
  { date: '2026-03-17', isCurrentMonth: true },
  { date: '2026-03-18', isCurrentMonth: true },
  { date: '2026-03-19', isCurrentMonth: true },
  { date: '2026-03-20', isCurrentMonth: true },
  { date: '2026-03-21', isCurrentMonth: true },
  { date: '2026-03-22', isCurrentMonth: true },
]

const appointments = [
  { id: 1, patient: 'Maria Silva', procedure: 'Limpeza', time: '09:00', duration: '1h', status: 'Confirmado', dentist: 'Dr. Jorge', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  { id: 2, patient: 'João Santos', procedure: 'Extração', time: '10:30', duration: '1h 30m', status: 'A Confirmar', dentist: 'Dra. Ana', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  { id: 3, patient: 'Pedro Costa', procedure: 'Avaliação', time: '11:00', duration: '30m', status: 'Na Sala de Espera', dentist: 'Dr. Jorge', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  { id: 4, patient: 'Ana Oliveira', procedure: 'Clareamento', time: '14:00', duration: '1h', status: 'Confirmado', dentist: 'Dra. Ana', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  { id: 5, patient: 'Carlos Souza', procedure: 'Canal', time: '15:30', duration: '2h', status: 'Agendado', dentist: 'Dr. Jorge', color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400' },
]

export default function Schedule() {
  const [view, setView] = useState('day')

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-none items-center justify-between border-b border-slate-200 dark:border-slate-800 py-4 px-6">
        <h1 className="text-2xl font-semibold leading-6 text-slate-900 dark:text-white">
          <time dateTime="2026-03-16">16 de Março, 2026</time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white dark:bg-slate-900 shadow-sm md:items-stretch">
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-slate-300 dark:border-slate-700 pr-1 text-slate-400 hover:text-slate-500 focus:relative md:w-9 md:pr-0 md:hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden border-y border-slate-300 dark:border-slate-700 px-3.5 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 focus:relative md:block"
            >
              Hoje
            </button>
            <span className="relative -mx-px h-5 w-px bg-slate-300 dark:bg-slate-700 md:hidden" />
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-slate-300 dark:border-slate-700 pl-1 text-slate-400 hover:text-slate-500 focus:relative md:w-9 md:pl-0 md:hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="sr-only">Próximo</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <div className="relative">
              <select
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                value={view}
                onChange={(e) => setView(e.target.value)}
              >
                <option value="day">Dia</option>
                <option value="week">Semana</option>
                <option value="month">Mês</option>
              </select>
            </div>
            <div className="ml-6 h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <button
              type="button"
              className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Novo Agendamento
            </button>
          </div>
        </div>
      </header>
      
      <div className="isolate flex flex-auto overflow-hidden bg-white dark:bg-slate-900">
        <div className="flex flex-auto flex-col overflow-auto">
          <div className="flex w-full flex-auto">
            <div className="w-14 flex-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-slate-100 dark:divide-slate-800"
                style={{ gridTemplateRows: 'repeat(20, minmax(3.5rem, 1fr))' }}
              >
                <div className="row-end-1 h-7"></div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i}>
                    <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-slate-400">
                      {i + 8}:00
                    </div>
                  </div>
                ))}
              </div>

              {/* Vertical lines */}
              <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-slate-100 dark:divide-slate-800 sm:grid sm:grid-cols-1">
                <div className="col-start-1 row-span-full" />
              </div>

              {/* Events */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-1"
                style={{ gridTemplateRows: '1.75rem repeat(120, minmax(0, 1fr)) auto' }}
              >
                {appointments.map((appointment, idx) => (
                  <li
                    key={appointment.id}
                    className="relative mt-px flex sm:col-start-1"
                    style={{ gridRow: `${(parseInt(appointment.time.split(':')[0]) - 8) * 12 + 2} / span ${appointment.duration.includes('30m') ? 6 : appointment.duration.includes('2h') ? 24 : 12}` }}
                  >
                    <a
                      href="#"
                      className={cn(
                        "group absolute inset-1 flex flex-col overflow-y-auto rounded-lg p-2 text-xs leading-5 hover:bg-opacity-80 transition-opacity",
                        appointment.color
                      )}
                    >
                      <p className="order-1 font-semibold">{appointment.patient}</p>
                      <p className="text-opacity-80 group-hover:text-opacity-100">
                        <time dateTime={appointment.time}>{appointment.time}</time>
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <Stethoscope className="h-3 w-3" />
                        <span>{appointment.procedure}</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>{appointment.dentist}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        
        {/* Sidebar Mini Calendar */}
        <div className="hidden w-1/4 max-w-md flex-none border-l border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-6 px-8 md:block">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Março 2026</h2>
            <div className="flex items-center">
              <button type="button" className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-slate-400 hover:text-slate-500">
                <span className="sr-only">Mês anterior</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-slate-400 hover:text-slate-500">
                <span className="sr-only">Próximo mês</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-7 text-center text-xs leading-6 text-slate-500 dark:text-slate-400">
            <div>D</div>
            <div>S</div>
            <div>T</div>
            <div>Q</div>
            <div>Q</div>
            <div>S</div>
            <div>S</div>
          </div>
          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-slate-200 dark:bg-slate-800 text-sm shadow ring-1 ring-slate-200 dark:ring-slate-800">
            {Array.from({ length: 31 }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "bg-white dark:bg-slate-900 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-10",
                  i === 15 ? "font-semibold text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white",
                  i === 0 ? "rounded-tl-lg" : "",
                  i === 6 ? "rounded-tr-lg" : "",
                  i === 28 ? "rounded-bl-lg" : "",
                  i === 30 ? "rounded-br-lg" : ""
                )}
              >
                <time dateTime={`2026-03-${i + 1}`} className={cn(
                  "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                  i === 15 ? "bg-indigo-600 text-white" : ""
                )}>
                  {i + 1}
                </time>
              </button>
            ))}
          </div>
          
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Profissionais</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center">
                <input id="dr-jorge" name="dr-jorge" type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="dr-jorge" className="ml-3 text-sm text-slate-600 dark:text-slate-300">Dr. Jorge Silva</label>
              </div>
              <div className="flex items-center">
                <input id="dra-ana" name="dra-ana" type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="dra-ana" className="ml-3 text-sm text-slate-600 dark:text-slate-300">Dra. Ana Costa</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
