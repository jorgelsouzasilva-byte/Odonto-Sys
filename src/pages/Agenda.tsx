
import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  User, 
  Stethoscope,
  MapPin,
  X,
  Calendar,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { agendaService } from '../services/agendaService';
import { filialService, Filial } from '../services/filialService';
import { equipeService, Funcionario } from '../services/equipeService';
import { procedimentoService } from '../services/procedimentoService';
import { pacienteService } from '../services/pacienteService';
import { Paciente } from '../types/paciente';
import { AgendaItem, AgendaDashboardStats, CalendarMark, AgendaMode } from '../types/agenda';
import { MiniCalendar } from '../components/MiniCalendar';
import { AgendaDashboard } from '../components/AgendaDashboard';

export default function Agenda() {
  const [mode, setMode] = useState<AgendaMode>('dia');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filialId, setFilialId] = useState<string | number | undefined>();
  const [profissionalId, setProfissionalId] = useState<string | number | undefined>();
  
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [stats, setStats] = useState<AgendaDashboardStats>({ pendentes: 0, confirmadas: 0, totalDia: 0 });
  const [marks, setMarks] = useState<CalendarMark[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [profissionais, setProfissionais] = useState<Funcionario[]>([]);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    paciente: '',
    procedimento: '',
    profissional: '',
    hora: '09:00',
    data: format(new Date(), 'yyyy-MM-dd'),
    filial_id: '',
    profissional_id: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAgenda();
  }, [mode, selectedDate, filialId, profissionalId]);

  const loadInitialData = async () => {
    try {
      const [filiaisRes, profissionaisRes, procedimentosRes, pacientesRes] = await Promise.all([
        filialService.getFiliais(),
        equipeService.getFuncionarios(),
        procedimentoService.getProcedimentos({}),
        pacienteService.getPacientes()
      ]);
      setFiliais(filiaisRes.data);
      setProfissionais(profissionaisRes.data.filter(f => f.cargo === 'Dentista'));
      setProcedimentos(procedimentosRes.data);
      setPacientes(pacientesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const loadAgenda = async () => {
    setLoading(true);
    try {
      const dataStr = format(selectedDate, 'yyyy-MM-dd');
      const [agendaItems, dashboardStats, calendarMarks] = await Promise.all([
        agendaService.list({ modo: mode, data_referencia: dataStr, filial_id: filialId, profissional_id: profissionalId }),
        agendaService.getDashboard({ data_referencia: dataStr, filial_id: filialId, profissional_id: profissionalId }),
        agendaService.getCalendarMarks(selectedDate.getMonth(), selectedDate.getFullYear(), filialId, profissionalId)
      ]);
      setItems(agendaItems);
      setStats(dashboardStats);
      setMarks(calendarMarks);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await agendaService.confirm(id);
      loadAgenda();
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await agendaService.create({
        ...formData,
        status: 'pendente'
      });
      setIsModalOpen(false);
      loadAgenda();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }
  };

  const navNext = () => {
    if (mode === 'dia') setSelectedDate(addDays(selectedDate, 1));
    else if (mode === 'semana') setSelectedDate(addDays(selectedDate, 7));
    else setSelectedDate(addMonths(selectedDate, 1));
  };

  const navPrev = () => {
    if (mode === 'dia') setSelectedDate(subDays(selectedDate, 1));
    else if (mode === 'semana') setSelectedDate(subDays(selectedDate, 7));
    else setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setMode('dia');
  };

  const handleMonthChange = (month: number, year: number) => {
    // Marks are already loaded in loadAgenda based on selectedDate, 
    // but if month changes in mini calendar without selecting a date, we might need this.
    // For now, loadAgenda handles it.
  };

  const renderAgendaView = () => {
    if (mode === 'dia') {
      return (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-500">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhum agendamento para este dia.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold text-zinc-900">{item.hora || item.startTime}</p>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase">Horário</p>
                    </div>
                    <div className="h-10 w-[1px] bg-zinc-100" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-zinc-900">{item.paciente || item.patientName}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.status === 'confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.status === 'confirmado' ? 'Confirmado' : 'A Confirmar'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" /> {item.procedimento || item.procedureName}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {item.profissional || item.professionalName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'pendente' && (
                      <button
                        onClick={() => handleConfirm(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-red-200"
                      >
                        Confirmar
                      </button>
                    )}
                    <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (mode === 'semana') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });

      return (
        <div className="grid grid-cols-7 gap-4">
          {days.map((day, i) => {
            const dayItems = items.filter(item => (item.data || item.startTime?.split('T')[0]) === format(day, 'yyyy-MM-dd'));
            const isToday = isSameDay(day, new Date());

            return (
              <div key={i} className="flex flex-col gap-3">
                <div className={`text-center p-2 rounded-2xl ${isToday ? 'bg-zinc-900 text-white' : 'bg-white border border-black/5'}`}>
                  <p className="text-[10px] font-bold uppercase opacity-60">{format(day, 'EEE', { locale: ptBR })}</p>
                  <p className="text-lg font-bold">{format(day, 'd')}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {dayItems.map(item => (
                    <div key={item.id} className={`p-2 rounded-xl border text-[10px] ${
                      item.status === 'confirmado' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                      <p className="font-bold">{item.hora || item.startTime}</p>
                      <p className="truncate">{item.paciente || item.patientName}</p>
                      <p className="opacity-70 truncate">{item.procedimento || item.procedureName}</p>
                    </div>
                  ))}
                  {dayItems.length === 0 && (
                    <div className="h-20 border border-dashed border-zinc-200 rounded-xl flex items-center justify-center">
                      <span className="text-[10px] text-zinc-300">Vazio</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="bg-white p-12 rounded-3xl border border-black/5 flex flex-col items-center justify-center text-zinc-500">
        <Calendar className="w-12 h-12 mb-4 opacity-20" />
        <p>Visualização Mensal em desenvolvimento.</p>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Agenda</h1>
          <p className="text-zinc-500 text-sm">Gerencie os agendamentos da clínica</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
          >
            <Plus className="w-5 h-5" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Dashboard */}
      <AgendaDashboard stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          <MiniCalendar 
            selectedDate={selectedDate} 
            onDateSelect={handleDateSelect} 
            marks={marks}
            onMonthChange={handleMonthChange}
          />

          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 font-bold mb-2">
              <Filter className="w-4 h-4" />
              <h3 className="text-sm">Filtros</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Filial</label>
                <select 
                  value={filialId || ''} 
                  onChange={(e) => setFilialId(e.target.value || undefined)}
                  className="w-full bg-zinc-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="">Todas as Filiais</option>
                  {filiais.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Profissional</label>
                <select 
                  value={profissionalId || ''} 
                  onChange={(e) => setProfissionalId(e.target.value || undefined)}
                  className="w-full bg-zinc-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="">Todos os Profissionais</option>
                  {profissionais.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Agenda Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex bg-zinc-100 p-1 rounded-2xl">
                {(['dia', 'semana', 'mes'] as AgendaMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      mode === m ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="h-8 w-[1px] bg-zinc-100" />
              <div className="flex items-center gap-2">
                <button onClick={navPrev} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                  <ChevronLeft className="w-5 h-5 text-zinc-500" />
                </button>
                <h2 className="text-lg font-bold text-zinc-900 min-w-[150px] text-center capitalize">
                  {mode === 'dia' ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 
                   mode === 'semana' ? `Semana ${format(selectedDate, 'w')}` : 
                   format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <button onClick={navNext} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
            </div>
            <button 
              onClick={() => setSelectedDate(new Date())}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-all"
            >
              Hoje
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${selectedDate.toISOString()}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : renderAgendaView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Appointment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 rounded-xl">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900">Novo Agendamento</h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Paciente</label>
                    <select 
                      required
                      value={formData.paciente}
                      onChange={(e) => setFormData({ ...formData, paciente: e.target.value })}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="">Selecione um paciente</option>
                      {pacientes.map(p => (
                        <option key={p.id} value={p.nome}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Procedimento</label>
                    <select 
                      required
                      value={formData.procedimento}
                      onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="">Selecione um procedimento</option>
                      {procedimentos.map(p => (
                        <option key={p.id} value={p.nome}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Data</label>
                    <input 
                      type="date"
                      required
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Horário</label>
                    <input 
                      type="time"
                      required
                      value={formData.hora}
                      onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Profissional</label>
                    <select 
                      required
                      value={formData.profissional_id}
                      onChange={(e) => {
                        const p = profissionais.find(prof => prof.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          profissional_id: e.target.value,
                          profissional: p?.nome || ''
                        });
                      }}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900"
                    >
                      {profissionais.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">Filial</label>
                    <select 
                      required
                      value={formData.filial_id}
                      onChange={(e) => setFormData({ ...formData, filial_id: e.target.value })}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900"
                    >
                      {filiais.map(f => (
                        <option key={f.id} value={f.id}>{f.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm text-zinc-500 hover:bg-zinc-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function addMonths(date: Date, amount: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + amount);
  return d;
}

function subMonths(date: Date, amount: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - amount);
  return d;
}
