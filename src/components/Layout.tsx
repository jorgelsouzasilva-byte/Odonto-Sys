import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  Stethoscope, 
  Building2, 
  MapPin, 
  UserCog, 
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun
} from "lucide-react"
import { useTheme } from "./ThemeProvider"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Procedimentos", href: "/procedimentos", icon: Stethoscope },
  { name: "Patrimônio", href: "/patrimonio", icon: Building2 },
  { name: "Filiais", href: "/filiais", icon: MapPin },
  { name: "Equipe", href: "/equipe", icon: UserCog },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-900 pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center px-4">
              <Stethoscope className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-bold">OdontoSys</span>
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        isActive
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                        "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300",
                          "mr-4 h-6 w-6 flex-shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight">OdontoSys</span>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-3 bg-white dark:bg-slate-900">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300",
                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center w-full">
              <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-medium">
                JS
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dr. Jorge Silva</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            className="border-r border-slate-200 dark:border-slate-800 px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center">
              <div className="flex w-full md:ml-0">
                <label htmlFor="search-field" className="sr-only">
                  Busca global
                </label>
                <div className="relative w-full text-slate-400 focus-within:text-slate-600 dark:focus-within:text-slate-300 max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="search-field"
                    className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-transparent focus:placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm bg-transparent"
                    placeholder="Buscar pacientes, agendamentos..."
                    type="search"
                    name="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <div className="hidden sm:flex items-center space-x-2 mr-2">
                <select className="text-sm border-slate-200 dark:border-slate-700 rounded-md bg-transparent dark:bg-slate-800 py-1.5 pl-3 pr-8 text-slate-700 dark:text-slate-300 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Filial Matriz</option>
                  <option>Filial Centro</option>
                </select>
                <select className="text-sm border-slate-200 dark:border-slate-700 rounded-md bg-transparent dark:bg-slate-800 py-1.5 pl-3 pr-8 text-slate-700 dark:text-slate-300 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Todos os Profissionais</option>
                  <option>Dr. Jorge Silva</option>
                  <option>Dra. Ana Costa</option>
                </select>
              </div>

              <button
                type="button"
                className="rounded-full bg-white dark:bg-slate-900 p-1 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <span className="sr-only">Toggle theme</span>
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                className="relative rounded-full bg-white dark:bg-slate-900 p-1 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
