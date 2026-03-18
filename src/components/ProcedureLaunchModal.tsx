
import React, { useState } from 'react';
import { X, ClipboardList, Trash2, Calculator, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Odontogram from './Odontogram';
import ProcedureLaunchItemModal from './ProcedureLaunchItemModal';
import { pacienteService } from '@/services/pacienteService';

interface ProcedureLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
  onSave: () => void;
}

export default function ProcedureLaunchModal({ isOpen, onClose, pacienteId, onSave }: ProcedureLaunchModalProps) {
  const [itens, setItens] = useState<any[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [descontoGeral, setDescontoGeral] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('Cartão de Crédito');
  const [parcelas, setParcelas] = useState(1);
  const [statusPagamento, setStatusPagamento] = useState('pago');
  const [observacoes, setObservacoes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const subtotal = itens.reduce((acc, item) => acc + item.valor_final, 0);
  const valorFinal = subtotal - descontoGeral;

  const handleAddItem = (item: any) => {
    setItens(prev => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleRemoveItem = (id: string) => {
    setItens(prev => prev.filter(item => item.id !== id));
  };

  const handleToothClick = (number: number) => {
    setSelectedTooth(number);
    setIsItemModalOpen(true);
  };

  const handleSave = async () => {
    if (itens.length === 0) return;

    setIsSaving(true);
    try {
      const payload = {
        paciente_id: pacienteId,
        data_procedimento: new Date().toISOString().split('T')[0],
        itens: itens.map(({ id, procedimentoNome, profissionalNome, ...rest }) => rest),
        subtotal,
        desconto_geral: descontoGeral,
        valor_final: valorFinal,
        pagamento: {
          forma_pagamento: formaPagamento,
          parcelas,
          status: statusPagamento
        },
        observacoes
      };

      await pacienteService.registrarLancamento(pacienteId, payload);
      
      onSave();
      onClose();
      // Reset state
      setItens([]);
      setDescontoGeral(0);
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao registrar lançamento:', error);
      alert('Erro ao registrar lançamento.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-[1100px] max-h-[95vh] overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lançamento de Procedimento</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Registre procedimentos realizados e gere o financeiro</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Coluna Odontograma */}
            <div className="lg:col-span-7 space-y-6">
              <Odontogram onToothClick={handleToothClick} />
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">Como lançar</h4>
                <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                  1. Clique no dente desejado no odontograma.<br />
                  2. Selecione o procedimento e o profissional dentista.<br />
                  3. Informe superfícies e descontos se necessário.<br />
                  4. Repita para outros dentes ou finalize o lançamento.
                </p>
              </div>
            </div>

            {/* Coluna Resumo e Pagamento */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-indigo-500" />
                    Itens Realizados
                  </h3>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                    {itens.length} itens
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[300px]">
                  {itens.length > 0 ? (
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Dente</th>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Procedimento</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Valor</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {itens.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.dentes[0].numero}</span>
                                <span className="text-[10px] text-slate-400">{item.dentes[0].faces.join(', ') || 'Geral'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{item.procedimentoNome}</span>
                                <span className="text-[10px] text-indigo-500">{item.profissionalNome}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_final)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                      <Calculator className="h-12 w-12 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">Nenhum item lançado ainda.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Forma de Pagamento</label>
                      <select 
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="PIX">PIX</option>
                        <option value="Boleto">Boleto</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</label>
                      <select 
                        value={statusPagamento}
                        onChange={(e) => setStatusPagamento(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="pago">Pago</option>
                        <option value="pendente">Pendente</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Desconto Geral</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">R$</span>
                      <input 
                        type="number" 
                        value={descontoGeral}
                        onChange={(e) => setDescontoGeral(Number(e.target.value))}
                        className="w-24 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Observações</label>
                    <textarea 
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={2}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Observações do procedimento..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Valor Total</span>
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFinal)}
                      </span>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={itens.length === 0 || isSaving}
                      className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? 'Registrando...' : 'Registrar Lançamento'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProcedureLaunchItemModal 
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          onAdd={handleAddItem}
          toothNumber={selectedTooth}
        />
      </div>
    </div>
  );
}
