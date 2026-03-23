import { useState } from "react"
import { Shield, Key, Users, Save, Settings as SettingsIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const roles = [
  { id: 'admin', name: 'Administrador Mestre', description: 'Acesso total a todos os módulos e configurações do sistema.' },
  { id: 'dentist', name: 'Dentista', description: 'Acesso à agenda, prontuários, procedimentos e relatórios próprios.' },
  { id: 'receptionist', name: 'Recepcionista', description: 'Acesso à agenda, cadastro de pacientes e recebimentos básicos.' },
  { id: 'financial', name: 'Financeiro', description: 'Acesso ao módulo financeiro, relatórios e faturamento.' },
]

const modules = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'patients', name: 'Pacientes' },
  { id: 'schedule', name: 'Agenda' },
  { id: 'financial', name: 'Financeiro' },
  { id: 'inventory', name: 'Estoque' },
  { id: 'procedures', name: 'Procedimentos' },
  { id: 'assets', name: 'Patrimônio' },
  { id: 'branches', name: 'Filiais' },
  { id: 'staff', name: 'Equipe' },
  { id: 'settings', name: 'Configurações' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('permissions')
  const [selectedRole, setSelectedRole] = useState('receptionist')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Configurações e Permissões</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            <Save className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menu Lateral de Configurações */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1" aria-label="Sidebar">
            <button
              onClick={() => setActiveTab('permissions')}
              className={cn(
                activeTab === 'permissions'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              <Shield className={cn(
                activeTab === 'permissions' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300',
                'mr-3 h-5 w-5 flex-shrink-0'
              )} aria-hidden="true" />
              Perfis e Permissões
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                activeTab === 'users'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              <Users className={cn(
                activeTab === 'users' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300',
                'mr-3 h-5 w-5 flex-shrink-0'
              )} aria-hidden="true" />
              Usuários do Sistema
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={cn(
                activeTab === 'security'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              <Key className={cn(
                activeTab === 'security' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300',
                'mr-3 h-5 w-5 flex-shrink-0'
              )} aria-hidden="true" />
              Segurança
            </button>
          </nav>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {activeTab === 'permissions' && (
            <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">Controle de Permissões por Perfil</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Selecione um perfil para configurar os níveis de acesso aos módulos do sistema.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row">
                {/* Lista de Perfis */}
                <div className="w-full sm:w-1/3 border-r border-slate-200 dark:border-slate-800 p-4">
                  <ul className="space-y-2">
                    {roles.map((role) => (
                      <li key={role.id}>
                        <button
                          onClick={() => setSelectedRole(role.id)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-lg text-sm transition-colors",
                            selectedRole === role.id 
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-500/30" 
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          <div className="font-medium">{role.name}</div>
                          <div className={cn(
                            "text-xs mt-1 line-clamp-2",
                            selectedRole === role.id ? "text-indigo-500 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                          )}>
                            {role.description}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                    + Criar Novo Perfil
                  </button>
                </div>

                {/* Matriz de Permissões */}
                <div className="w-full sm:w-2/3 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-medium text-slate-900 dark:text-white">
                      Permissões: {roles.find(r => r.id === selectedRole)?.name}
                    </h3>
                    {selectedRole === 'admin' && (
                      <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20">
                        Acesso Total Inalterável
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Módulo</th>
                          <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visualizar</th>
                          <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Criar/Editar</th>
                          <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Excluir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {modules.map((module) => (
                          <tr key={module.id}>
                            <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">{module.name}</td>
                            <td className="px-3 py-4 text-center">
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                                defaultChecked={selectedRole === 'admin' || selectedRole === 'dentist' || (selectedRole === 'receptionist' && ['dashboard', 'patients', 'schedule'].includes(module.id))}
                                disabled={selectedRole === 'admin'}
                              />
                            </td>
                            <td className="px-3 py-4 text-center">
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                                defaultChecked={selectedRole === 'admin' || (selectedRole === 'dentist' && ['patients', 'schedule', 'procedures'].includes(module.id))}
                                disabled={selectedRole === 'admin'}
                              />
                            </td>
                            <td className="px-3 py-4 text-center">
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                                defaultChecked={selectedRole === 'admin'}
                                disabled={selectedRole === 'admin'}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab !== 'permissions' && (
            <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
              <div>
                <SettingsIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Conteúdo em desenvolvimento</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Esta seção de configurações estará disponível em breve.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
