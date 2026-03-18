import React, { useState, useEffect, useCallback } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "motion/react"
import { agendaService } from "@/services/agendaService"
import { filialService } from "@/services/filialService"
import { equipeService } from "@/services/equipeService"
import { procedimentoService } from "@/services/procedimentoService"
import { pacienteService } from "@/services/pacienteService"
import { AgendaItem, AgendaDashboardStats, CalendarMark, AgendaStatus } from "@/types/agenda"

export default function Schedule() {
  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('semana')
  const [items, setItems] = useState<AgendaItem[]>([])
  const [stats, setStats] = useState<AgendaDashboardStats>({ pendentes: 0, confirmadas: 0, totalDia: 0 })
  const [marks, setMarks] = useState<CalendarMark[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Filters (Removed from UI but kept in state for loadData compatibility)
  const [filialId, setFilialId] = useState('todas')
  const [profissionalId, setProfissionalId] = useState('todos')

  // Form Data for Create
  const [filiais, setFiliais] = useState<any[]>([])
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [procedimentos, setProcedimentos] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])

  // Data Fetching
  const loadInitialData = useCallback(async () => {
    try {
      const [filiaisRes, profissionaisRes, procedimentosRes, pacientesRes] = await Promise.all([
        filialService.getFiliais(),
        equipeService.getFuncionarios(),
        procedimentoService.getProcedimentos({}),
        pacienteService.getPacientes()
      ])
      setFiliais(filiaisRes.data || [])
      setProfissionais(profissionaisRes.data?.filter((f: any) => f.cargo === 'Dentista') || [])
      setProcedimentos(procedimentosRes.data || [])
      setPacientes(pacientesRes.data || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [agendaData, dashboardData, marksData] = await Promise.all([
        agendaService.getAgenda({ 
          modo: viewMode, 
          data_referencia: currentDate.toISOString(),
          filial_id: filialId,
          profissional_id: profissionalId
        }),
        agendaService.getDashboard(),
        agendaService.getCalendarMarks()
      ])
      setItems(agendaData)
      setStats(dashboardData)
      setMarks(marksData)
    } catch (error) {
      console.error("Erro ao carregar agenda:", error)
    } finally {
      setLoading(false)
    }
  }, [currentDate, viewMode, filialId, profissionalId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handlers
  const handlePrev = () => {
    if (viewMode === 'dia') setCurrentDate(subDays(currentDate, 1))
    else if (viewMode === 'semana') setCurrentDate(subDays(currentDate, 7))
    else setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNext = () => {
    if (viewMode === 'dia') setCurrentDate(addDays(currentDate, 1))
    else if (viewMode === 'semana') setCurrentDate(addDays(currentDate, 7))
    else setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleConfirm = async (id: string) => {
    try {
      await agendaService.confirmarAgenda(id)
      setIsDetailsModalOpen(false)
      setSelectedItem(null)
      await loadData()
    } catch (error) {
      console.error("Erro ao confirmar:", error)
    }
  }

  const handleDetails = (item: AgendaItem) => {
    setSelectedItem(item)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (item: AgendaItem) => {
    setEditingItem(item)
    setIsDetailsModalOpen(false)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (id: string, data: any) => {
    try {
      await agendaService.editarAgendamento(id, data)
      setIsEditModalOpen(false)
      setEditingItem(null)
      await loadData()
    } catch (error) {
      console.error("Erro ao salvar edição:", error)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      await agendaService.create(data)
      setIsCreateModalOpen(false)
      await loadData()
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agenda</h1>
          <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setViewMode('dia')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                viewMode === 'dia' ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              Dia
            </button>
            <button 
              onClick={() => setViewMode('semana')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                viewMode === 'semana' ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              Semana
            </button>
            <button 
              onClick={() => setViewMode('mes')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                viewMode === 'mes' ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              Mês
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button onClick={handlePrev} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-100 dark:border-slate-800">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <button onClick={handleToday} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-100 dark:border-slate-800">
              Hoje
            </button>
            <button onClick={handleNext} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800">
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Agendar
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-6">
        <DashboardCard 
          id="agendas_pendentes"
          label="Pendentes" 
          value={stats.pendentes} 
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color="border-red-500"
        />
        <DashboardCard 
          id="agendas_confirmadas"
          label="Confirmadas" 
          value={stats.confirmadas} 
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          color="border-emerald-500"
        />
        <DashboardCard 
          id="agendas_total_dia"
          label="Total do Dia" 
          value={stats.totalDia} 
          icon={<CalendarIcon className="h-5 w-5 text-indigo-500" />}
          color="border-indigo-500"
        />
      </div>

      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Timeline View */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${currentDate.toISOString()}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {viewMode === 'dia' && <DayView date={currentDate} items={items} onConfirm={handleConfirm} onDetails={handleDetails} />}
                {viewMode === 'semana' && <WeekView date={currentDate} items={items} onConfirm={handleConfirm} onDetails={handleDetails} />}
                {viewMode === 'mes' && <MonthView date={currentDate} items={items} onConfirm={handleConfirm} onDetails={handleDetails} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Mini Calendar */}
        <div className="w-80 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <MiniCalendar 
              currentDate={currentDate} 
              onDateSelect={setCurrentDate} 
              marks={marks}
            />
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Legenda</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Pendente</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400">Confirmado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedItem && (
          <DetailsModal 
            item={selectedItem} 
            onClose={() => {
              setIsDetailsModalOpen(false)
              setSelectedItem(null)
            }} 
            onConfirm={handleConfirm}
            onEdit={handleEdit}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingItem && (
          <EditModal 
            item={editingItem} 
            onClose={() => {
              setIsEditModalOpen(false)
              setEditingItem(null)
            }} 
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onSave={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function CreateModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [filiais, setFiliais] = useState<any[]>([])
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [procedimentos, setProcedimentos] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    paciente: '',
    procedimento: '',
    profissional: '',
    hora: '09:00',
    data: format(new Date(), 'yyyy-MM-dd'),
    filial_id: 1,
    profissional_id: 1,
    duracao: 30,
    observacoes: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [filiaisRes, profissionaisRes, procedimentosRes, pacientesRes] = await Promise.all([
          filialService.getFiliais(),
          equipeService.getFuncionarios(),
          procedimentoService.getProcedimentos({}),
          pacienteService.getPacientes()
        ])
        setFiliais(filiaisRes.data || [])
        const dents = profissionaisRes.data?.filter((f: any) => f.cargo === 'Dentista') || []
        setProfissionais(dents)
        setProcedimentos(procedimentosRes.data || [])
        setPacientes(pacientesRes.data || [])
        
        if (dents.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            profissional_id: dents[0].id,
            profissional: dents[0].nome
          }))
        }
        if (filiaisRes.data?.length > 0) {
          setFormData(prev => ({ ...prev, filial_id: filiaisRes.data[0].id }))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      status: 'pendente'
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Agendamento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paciente</label>
              <select 
                value={formData.paciente}
                onChange={e => setFormData({...formData, paciente: e.target.value})}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Selecione um paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.nome}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procedimento</label>
                <select 
                  value={formData.procedimento}
                  onChange={e => setFormData({...formData, procedimento: e.target.value})}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Selecione um procedimento</option>
                  {procedimentos.map(p => (
                    <option key={p.id} value={p.nome}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profissional</label>
                <select 
                  value={formData.profissional_id}
                  onChange={e => {
                    const p = profissionais.find(prof => prof.id === Number(e.target.value))
                    setFormData({ 
                      ...formData, 
                      profissional_id: Number(e.target.value),
                      profissional: p?.nome || ''
                    })
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  {profissionais.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data</label>
                <input 
                  type="date" 
                  value={formData.data}
                  onChange={e => setFormData({...formData, data: e.target.value})}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horário</label>
                <input 
                  type="time" 
                  value={formData.hora}
                  onChange={e => setFormData({...formData, hora: e.target.value})}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duração (min)</label>
                <input 
                  type="number" 
                  value={formData.duracao}
                  onChange={e => setFormData({...formData, duracao: parseInt(e.target.value)})}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filial</label>
              <select 
                value={formData.filial_id}
                onChange={e => setFormData({...formData, filial_id: Number(e.target.value)})}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                {filiais.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Observações</label>
              <textarea 
                value={formData.observacoes}
                onChange={e => setFormData({...formData, observacoes: e.target.value})}
                rows={3}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                Agendar
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

function DashboardCard({ label, value, icon, color, id }: { label: string; value: number; icon: React.ReactNode; color: string; id: string }) {
  return (
    <div id={id} className={cn("bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border-l-4 flex items-center justify-between", color)}>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
        {icon}
      </div>
    </div>
  )
}

function MiniCalendar({ currentDate, onDateSelect, marks }: { currentDate: Date; onDateSelect: (d: Date) => void; marks: CalendarMark[] }) {
  const [viewDate, setViewDate] = useState(startOfMonth(currentDate))
  
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate))
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
          {format(viewDate, "MMMM yyyy", { locale: ptBR })}
        </h4>
        <div className="flex gap-1">
          <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </button>
          <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[10px] font-bold text-slate-400">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const mark = marks.find(m => isSameDay(new Date(m.date), day))
          const isSelected = isSameDay(day, currentDate)
          const isCurrentMonth = day.getMonth() === viewDate.getMonth()
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "h-8 w-8 flex flex-col items-center justify-center rounded-lg text-xs transition-all relative",
                isSelected ? "bg-indigo-600 text-white font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800",
                !isCurrentMonth && "opacity-30",
                isToday(day) && !isSelected && "text-indigo-600 dark:text-indigo-400 font-bold"
              )}
            >
              {format(day, "d")}
              {mark && (
                <span className={cn(
                  "absolute bottom-1 h-1 w-1 rounded-full",
                  mark.status === 'pendente' ? "bg-red-500" : "bg-green-500"
                )} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ProfessionalToggle({ name, color }: { name: string; color: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={cn("h-2 w-2 rounded-full", color)} />
        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{name}</span>
      </div>
      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-4 w-4" />
    </label>
  )
}

function DayView({ date, items, onConfirm, onDetails }: { date: Date; items: AgendaItem[]; onConfirm: (id: string) => void; onDetails: (item: AgendaItem) => void }) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 8:00 to 21:00

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-[80px_1fr] border-b border-slate-100 dark:border-slate-800">
        <div className="p-4 text-center border-r border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">{format(date, "EEE", { locale: ptBR })}</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{format(date, "d")}</div>
        </div>
        <div className="p-4 flex items-center">
          <span className="text-sm text-slate-500">Horários do dia</span>
        </div>
      </div>
      
      <div className="relative flex-1">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-[80px_1fr] border-b border-slate-50 dark:border-slate-800/50 min-h-[100px]">
            <div className="p-4 text-right">
              <span className="text-xs font-medium text-slate-400">{hour}:00</span>
            </div>
            <div className="p-2 relative">
              {items
                .filter(item => {
                  const itemHour = new Date(item.startTime).getHours()
                  return itemHour === hour
                })
                .map(item => (
                  <AgendaItemCard key={item.id} item={item} onConfirm={onConfirm} onDetails={onDetails} />
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeekView({ date, items, onConfirm, onDetails }: { date: Date; items: AgendaItem[]; onConfirm: (id: string) => void; onDetails: (item: AgendaItem) => void }) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="grid grid-cols-7 h-full gap-5 p-5 divide-x divide-slate-100 dark:divide-slate-800">
      {weekDays.map(day => (
        <div key={day.toISOString()} className="flex flex-col min-h-[600px]">
          <div className={cn(
            "p-4 text-center border-b border-slate-100 dark:border-slate-800 mb-4",
            isToday(day) && "bg-indigo-50/50 dark:bg-indigo-500/5 rounded-t-xl"
          )}>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{format(day, "EEE", { locale: ptBR })}</span>
            <div className={cn(
              "text-lg font-bold mt-1",
              isToday(day) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"
            )}>
              {format(day, "d")}
            </div>
          </div>
          <div className="flex-1 space-y-3.5 overflow-y-auto">
            {items
              .filter(item => isSameDay(new Date(item.startTime), day))
              .map(item => (
                <AgendaItemCard key={item.id} item={item} onConfirm={onConfirm} onDetails={onDetails} compact />
              ))
            }
          </div>
        </div>
      ))}
    </div>
  )
}

function MonthView({ date, items, onConfirm, onDetails }: { date: Date; items: AgendaItem[]; onConfirm: (id: string) => void; onDetails: (item: AgendaItem) => void }) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  return (
    <div className="grid grid-cols-7 grid-rows-5 h-full border-t border-l border-slate-100 dark:border-slate-800">
      {calendarDays.map(day => {
        const dayItems = items.filter(item => isSameDay(new Date(item.startTime), day))
        const isCurrentMonth = day.getMonth() === date.getMonth()
        
        return (
          <div 
            key={day.toISOString()} 
            className={cn(
              "min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-slate-800 flex flex-col",
              !isCurrentMonth && "bg-slate-50/50 dark:bg-slate-900/50",
              isToday(day) && "bg-indigo-50/30 dark:bg-indigo-500/5"
            )}
          >
            <span className={cn(
              "text-xs font-bold mb-2",
              isToday(day) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400",
              !isCurrentMonth && "opacity-30"
            )}>
              {format(day, "d")}
            </span>
            <div className="space-y-1 overflow-y-auto max-h-[100px]">
              {dayItems.slice(0, 3).map(item => (
                <div 
                  key={item.id} 
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border truncate",
                    item.status === 'pendente' 
                      ? "bg-red-50 border-red-100 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400" 
                      : "bg-green-50 border-green-100 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400"
                  )}
                >
                  {format(new Date(item.startTime), "HH:mm")} {item.patientName}
                </div>
              ))}
              {dayItems.length > 3 && (
                <span className="text-[10px] text-slate-400 font-medium pl-1">+{dayItems.length - 3} mais</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AgendaItemCard({ item, onConfirm, onDetails, compact }: { item: AgendaItem; onConfirm: (id: string) => void; onDetails: (item: AgendaItem) => void; compact?: boolean; key?: string }) {
  const isPendente = item.status === 'pendente'
  
  return (
    <div 
      onClick={() => onDetails(item)}
      className={cn(
        "group relative rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer min-h-[90px] flex flex-col justify-between gap-3",
        isPendente 
          ? "bg-white dark:bg-slate-900 border-red-200 dark:border-red-500/30" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "h-2 w-2 rounded-full",
              isPendente ? "bg-red-500" : "bg-green-500"
            )} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {format(new Date(item.startTime), "HH:mm")} - {format(new Date(item.endTime), "HH:mm")}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.patientName}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.procedureName}</p>
          
          {!compact && (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <User className="h-3 w-3" />
                {item.professionalName}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
          isPendente 
            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" 
            : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
        )}>
          {isPendente ? "A Confirmar" : "Confirmado"}
        </span>
      </div>
    </div>
  )
}

function DetailsModal({ item, onClose, onConfirm, onEdit }: { item: AgendaItem; onClose: () => void; onConfirm: (id: string) => void; onEdit: (item: AgendaItem) => void }) {
  const isPendente = item.status === 'pendente'

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes do Agendamento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <DetailField label="Paciente" value={item.patientName} />
            <DetailField label="Procedimento" value={item.procedureName} />
            <DetailField label="Profissional" value={item.professionalName} />
            <DetailField label="Data" value={format(new Date(item.startTime), "dd/MM/yyyy")} />
            <DetailField label="Horário" value={`${format(new Date(item.startTime), "HH:mm")} - ${format(new Date(item.endTime), "HH:mm")}`} />
            <DetailField label="Duração" value={`${item.duration} minutos`} />
            <DetailField label="Filial" value={item.branchName} />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                  isPendente 
                    ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" 
                    : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                )}>
                  {isPendente ? "A Confirmar" : "Confirmado"}
                </span>
              </div>
            </div>
          </div>
          <DetailField label="Observações" value={item.observations || "Nenhuma observação."} fullWidth />
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-3">
          {isPendente && (
            <button 
              onClick={() => onConfirm(item.id)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Confirmar Agendamento
            </button>
          )}
          <button 
            onClick={() => onEdit(item)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            Alterar Agendamento
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold py-3 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DetailField({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={cn("space-y-1", fullWidth && "col-span-2")}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <p className="text-sm text-slate-900 dark:text-white font-medium">{value}</p>
    </div>
  )
}

function EditModal({ item, onClose, onSave }: { item: AgendaItem; onClose: () => void; onSave: (id: string, data: any) => void }) {
  const [formData, setFormData] = useState({
    procedimento_id: item.procedureId,
    profissional_id: item.professionalId,
    data: format(new Date(item.startTime), "yyyy-MM-dd"),
    hora: format(new Date(item.startTime), "HH:mm"),
    duracao: item.duration,
    observacoes: item.observations || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Construct new start/end times
    const start = new Date(`${formData.data}T${formData.hora}:00`)
    const end = new Date(start.getTime() + formData.duracao * 60000)
    
    onSave(item.id, {
      procedureId: formData.procedimento_id,
      procedureName: formData.procedimento_id === 'proc1' ? 'Limpeza' : formData.procedimento_id === 'proc2' ? 'Extração' : 'Avaliação',
      professionalId: formData.profissional_id,
      professionalName: formData.profissional_id === 'p1' ? 'Dr. Jorge' : 'Dra. Ana',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration: formData.duracao,
      observations: formData.observacoes
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Agendamento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paciente</label>
            <input 
              type="text" 
              value={item.patientName} 
              readOnly 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procedimento</label>
              <select 
                value={formData.procedimento_id}
                onChange={e => setFormData({...formData, procedimento_id: e.target.value})}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="proc1">Limpeza</option>
                <option value="proc2">Extração</option>
                <option value="proc3">Avaliação</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profissional</label>
              <select 
                value={formData.profissional_id}
                onChange={e => setFormData({...formData, profissional_id: e.target.value})}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="p1">Dr. Jorge Silva</option>
                <option value="p2">Dra. Ana Costa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data</label>
              <input 
                type="date" 
                value={formData.data}
                onChange={e => setFormData({...formData, data: e.target.value})}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horário</label>
              <input 
                type="time" 
                value={formData.hora}
                onChange={e => setFormData({...formData, hora: e.target.value})}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duração (min)</label>
              <input 
                type="number" 
                value={formData.duracao}
                onChange={e => setFormData({...formData, duracao: parseInt(e.target.value)})}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Observações</label>
            <textarea 
              value={formData.observacoes}
              onChange={e => setFormData({...formData, observacoes: e.target.value})}
              rows={3}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
