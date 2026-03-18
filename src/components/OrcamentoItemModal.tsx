
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { procedimentoService } from '@/services/procedimentoService';
import { Procedimento } from '@/types/procedimento';
import { OrcamentoItem } from '@/types/paciente';

interface OrcamentoItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<OrcamentoItem, 'id'>) => void;
  toothNumber: number | null;
}

export default function OrcamentoItemModal({ isOpen, onClose, onAdd, toothNumber }: OrcamentoItemModalProps) {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [selectedProcedimentoId, setSelectedProcedimentoId] = useState<number | ''>('');
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [observacoes, setObservacoes] = useState('');
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadProcedimentos();
    }
  }, [isOpen]);

  const loadProcedimentos = async () => {
    const response = await procedimentoService.getProcedimentos({});
    setProcedimentos(response.data);
  };

  const handleProcedimentoChange = (id: number) => {
    setSelectedProcedimentoId(id);
    const proc = procedimentos.find(p => p.id === id);
    if (proc) {
      setValor(proc.valor);
    }
  };

  const toggleSurface = (surface: string) => {
    setSelectedSurfaces(prev => 
      prev.includes(surface) ? prev.filter(s => s !== surface) : [...prev, surface]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcedimentoId || !toothNumber) return;

    const proc = procedimentos.find(p => p.id === selectedProcedimentoId);
    if (!proc) return;

    onAdd({
      dente: toothNumber.toString(),
      superficies: selectedSurfaces,
      procedimentoId: proc.id,
      procedimentoNome: proc.nome,
      valor: valor,
      formaPagamento,
      observacoes
    });
    
    // Reset form
    setSelectedProcedimentoId('');
    setSelectedSurfaces([]);
    setFormaPagamento('PIX');
    setObservacoes('');
    setValor(0);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Adicionar Item ao Orçamento</h2>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Valor</label>
              <input 
                type="text" 
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)} 
                readOnly 
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 sm:text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Superfícies</label>
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

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Procedimento</label>
            <select
              required
              value={selectedProcedimentoId}
              onChange={(e) => handleProcedimentoChange(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Selecione um procedimento</option>
              {procedimentos.map(p => (
                <option key={p.id} value={p.id}>{p.nome} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Forma de Pagamento</label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão">Cartão</option>
              <option value="PIX">PIX</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
            <textarea
              rows={3}
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
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
