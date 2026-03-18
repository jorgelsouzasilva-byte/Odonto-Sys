
import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Calendar, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pacienteService } from '@/services/pacienteService';
import { agendaService } from '@/services/agendaService';
import { Paciente } from '@/types/paciente';
import { AgendaItem } from '@/types/agenda';
import { cn } from '@/lib/utils';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    patients: Paciente[];
    appointments: AgendaItem[];
  }>({ patients: [], appointments: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults({ patients: [], appointments: [] });
        return;
      }

      setIsLoading(true);
      try {
        const [patientsRes, agendaRes] = await Promise.all([
          pacienteService.getPacientes(),
          agendaService.getAgenda({ modo: 'todos', data_referencia: new Date().toISOString() })
        ]);

        const filteredPatients = patientsRes.data.filter(p => 
          p.nome.toLowerCase().includes(query.toLowerCase()) ||
          p.email.toLowerCase().includes(query.toLowerCase()) ||
          p.telefone.includes(query)
        );

        const filteredAppointments = agendaRes.filter(a => 
          a.patientName.toLowerCase().includes(query.toLowerCase()) ||
          a.procedureName.toLowerCase().includes(query.toLowerCase())
        );

        setResults({
          patients: filteredPatients.slice(0, 5),
          appointments: filteredAppointments.slice(0, 5)
        });
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (type: 'patient' | 'appointment', id: string | number) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'patient') {
      navigate(`/pacientes?id=${id}`);
    } else {
      navigate(`/agenda?id=${id}`);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="relative w-full text-slate-400 focus-within:text-slate-600 dark:focus-within:text-slate-300">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        <input
          id="search-field"
          className="block w-full rounded-lg border-slate-200 dark:border-slate-800 py-2 pl-10 pr-10 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-800/50 transition-all"
          placeholder="Buscar pacientes, agendamentos..."
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute mt-2 w-full rounded-xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden z-[100]">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-slate-500">Buscando...</div>
            ) : results.patients.length === 0 && results.appointments.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">Nenhum resultado encontrado</div>
            ) : (
              <div className="space-y-4">
                {results.patients.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pacientes</h3>
                    <div className="space-y-1">
                      {results.patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelect('patient', patient.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{patient.nome}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{patient.telefone}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.appointments.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Agendamentos</h3>
                    <div className="space-y-1">
                      {results.appointments.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => handleSelect('appointment', app.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{app.patientName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{app.procedureName} • {new Date(app.startTime).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-center text-slate-400">Pressione ESC para fechar</p>
          </div>
        </div>
      )}
    </div>
  );
}
