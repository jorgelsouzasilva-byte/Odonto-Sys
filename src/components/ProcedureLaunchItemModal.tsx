
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { procedimentoService } from '@/services/procedimentoService';
import { equipeService, Funcionario } from '@/services/equipeService';
import { Procedimento } from '@/types/procedimento';

interface ProcedureLaunchItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
  toothNumber: number | null;
}

export default function ProcedureLaunchItemModal({ isOpen, onClose, onAdd, toothNumber }: ProcedureLaunchItemModalProps) {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [dentistas, setDentistas] = useState<Funcionario[]>([]);
  const [selectedProcedimentoId, setSelectedProcedimentoId] = useState<string | ''>('');
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string | ''>('');
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [valorBase, setValorBase] = useState(0);
  const [desconto, setDesconto] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [procRes, staffRes] = await Promise.all([
        procedimentoService.getProcedimentos({}),
        equipeService.getDentistas()
      ]);
      setProcedimentos(procRes.data);
      setDentistas(staffRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados para lançamento:", error);
    }
  };

  const handleProcedimentoChange = (id: string) => {
    setSelectedProcedimentoId(id);
    const proc = procedimentos.find(p => p.id === id);
    if (proc) {
      setValorBase(proc.valor);
    }
  };

  const toggleSurface = (surface: string) => {
    setSelectedSurfaces(prev => 
      prev.includes(surface) ? prev.filter(s => s !== surface) : [...prev, surface]
    );
  };

  const valorFinal = valorBase - desconto;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcedimentoId || !selectedProfissionalId || !toothNumber) return;

    const proc = procedimentos.find(p => p.id === selectedProcedimentoId);
    const prof = dentistas.find(d => d.id === selectedProfissionalId);
    if (!proc || !prof) return;

    onAdd({
      procedimento_id: proc.id,
      procedimentoNome: proc.nome,
      profissional_id: prof.id,
      profissionalNome: prof.nome,
      dentes: [
        {
          numero: toothNumber,
          faces: selectedSurfaces
        }
      ],
      valor_base: valorBase,
      desconto: desconto,
      valor_final: valorFinal,
      observacoes
    });
    
    // Reset form
    setSelectedProcedimentoId('');
    setSelectedProfissionalId('');
    setSelectedSurfaces([]);
    setObservacoes('');
    setValorBase(0);
    setDesconto(0);
    onClose();
  };

  if (!isOpen) return null;

  const surfaces = [
    { id: 'M', label: 'Mesial' },
    { id: 'D', label: 'Distal' },
    { id: 'V', label: 'Vestibular' },
    { id: 'L', label: 'Lingual/Palatina' },
    { id: 'O', label: 'Oclusal/Incisal' }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Procedimento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dente</label>
              <input 
                type="text" 
                value={toothNumber || ''} 
                readOnly 
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor Base</label>
              <input 
                type="text" 
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorBase)} 
                readOnly 
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 sm:text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Superfícies (Faces)</label>
            <div className="flex flex-wrap gap-2">
              {surfaces.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSurface(s.id)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full border transition-all",
                    selectedSurfaces.includes(s.id)
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500"
                  )}
                >
                  {s.id} - {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Procedimento</label>
              <select
                required
                value={selectedProcedimentoId}
                onChange={(e) => handleProcedimentoChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Selecione...</option>
                {procedimentos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dentista</label>
              <select
                required
                value={selectedProfissionalId}
                onChange={(e) => setSelectedProfissionalId(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Selecione...</option>
                {dentistas.map(d => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Desconto (R$)</label>
              <input 
                type="number" 
                value={desconto}
                onChange={(e) => setDesconto(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor Final</label>
              <input 
                type="text" 
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFinal)} 
                readOnly 
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold sm:text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Adicionar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
