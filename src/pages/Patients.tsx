import { useState } from "react"
import { Search, Plus, Filter, MoreVertical, FileText, Phone, Mail, Calendar, Stethoscope, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const patients = [
  { id: 1, name: 'Maria Silva', phone: '(11) 98765-4321', email: 'maria.silva@email.com', lastVisit: '10/03/2026', status: 'Ativo' },
  { id: 2, name: 'João Santos', phone: '(11) 91234-5678', email: 'joao.santos@email.com', lastVisit: '15/03/2026', status: 'Ativo' },
  { id: 3, name: 'Pedro Costa', phone: '(11) 99876-5432', email: 'pedro.costa@email.com', lastVisit: '01/02/2026', status: 'Inativo' },
  { id: 4, name: 'Ana Oliveira', phone: '(11) 94567-8901', email: 'ana.oliveira@email.com', lastVisit: '16/03/2026', status: 'Ativo' },
  { id: 5, name: 'Carlos Souza', phone: '(11) 93456-7890', email: 'carlos.souza@email.com', lastVisit: '20/12/2025', status: 'Inativo' },
]

export default function Patients() {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('dados')

  const tabs = [
    { id: 'dados', name: 'Dados Pessoais' },
    { id: 'anamnese', name: 'Anamnese' },
    { id: 'documentos', name: 'Documentos' },
    { id: 'historico', name: 'Histórico' },
    { id: 'orcamentos', name: 'Orçamentos' },
    { id: 'financeiro', name: 'Financeiro' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Pacientes</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Novo Paciente
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de Pacientes */}
        <div className={cn("w-full lg:w-1/3 flex-col space-y-4", selectedPatient ? "hidden lg:flex" : "flex")}>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                placeholder="Buscar pacientes..."
              />
            </div>
            <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Filter className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-800">
              {patients.map((patient) => (
                <li 
                  key={patient.id} 
                  className={cn(
                    "cursor-pointer p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                    selectedPatient === patient.id ? "bg-indigo-50 dark:bg-indigo-500/10" : ""
                  )}
                  onClick={() => setSelectedPatient(patient.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{patient.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{patient.phone}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      patient.status === 'Ativo' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                      "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20"
                    )}>
                      {patient.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Perfil do Paciente */}
        <div className={cn("w-full lg:w-2/3 flex-col space-y-6", !selectedPatient ? "hidden lg:flex" : "flex")}>
          {selectedPatient ? (
            <>
              {/* Header do Perfil */}
              <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <span className="text-xl font-medium text-indigo-700 dark:text-indigo-300">
                          {patients.find(p => p.id === selectedPatient)?.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {patients.find(p => p.id === selectedPatient)?.name}
                        </h2>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center">
                            <Phone className="mr-1.5 h-4 w-4" />
                            {patients.find(p => p.id === selectedPatient)?.phone}
                          </div>
                          <div className="flex items-center">
                            <Mail className="mr-1.5 h-4 w-4" />
                            {patients.find(p => p.id === selectedPatient)?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                        Editar
                      </button>
                      <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        Nova Consulta
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Abas */}
                <div className="border-t border-slate-200 dark:border-slate-800">
                  <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
                          'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                        )}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Conteúdo da Aba */}
              <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6">
                {activeTab === 'dados' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Informações Pessoais</h3>
                      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Nome Completo</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">{patients.find(p => p.id === selectedPatient)?.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">CPF</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">123.456.789-00</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Data de Nascimento</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">15/05/1985 (40 anos)</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Gênero</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">Feminino</dd>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                      <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">Endereço</h3>
                      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Logradouro</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">Rua das Flores, 123 - Apto 45</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Bairro</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">Centro</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Cidade/UF</dt>
                          <dd className="mt-1 text-sm text-slate-900 dark:text-white">São Paulo / SP</dd>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'historico' && (
                  <div className="space-y-6">
                    <div className="flow-root">
                      <ul role="list" className="-mb-8">
                        {[
                          { date: '16 Mar 2026', title: 'Clareamento Dental', doctor: 'Dra. Ana Costa', type: 'Procedimento' },
                          { date: '10 Fev 2026', title: 'Limpeza (Profilaxia)', doctor: 'Dr. Jorge Silva', type: 'Procedimento' },
                          { date: '05 Fev 2026', title: 'Avaliação Inicial', doctor: 'Dr. Jorge Silva', type: 'Consulta' },
                        ].map((event, eventIdx) => (
                          <li key={eventIdx}>
                            <div className="relative pb-8">
                              {eventIdx !== 2 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-900",
                                    event.type === 'Procedimento' ? "bg-indigo-500" : "bg-emerald-500"
                                  )}>
                                    {event.type === 'Procedimento' ? (
                                      <Stethoscope className="h-4 w-4 text-white" aria-hidden="true" />
                                    ) : (
                                      <Calendar className="h-4 w-4 text-white" aria-hidden="true" />
                                    )}
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-slate-900 dark:text-white font-medium">{event.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">com {event.doctor}</p>
                                  </div>
                                  <div className="whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                                    <time dateTime={event.date}>{event.date}</time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {/* Outras abas seriam implementadas aqui */}
                {activeTab !== 'dados' && activeTab !== 'historico' && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Conteúdo em desenvolvimento</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A aba {tabs.find(t => t.id === activeTab)?.name} estará disponível em breve.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
              <div>
                <Users className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Nenhum paciente selecionado</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Selecione um paciente na lista para ver seus detalhes.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
