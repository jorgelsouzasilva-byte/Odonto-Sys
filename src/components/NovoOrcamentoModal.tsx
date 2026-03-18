
import React, { useState } from 'react';
import { X, ClipboardList, Trash2, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrcamentoItem } from '@/types/paciente';
import Odontogram from './Odontogram';
import OrcamentoItemModal from './OrcamentoItemModal';
import { orcamentoService } from '@/services/orcamentoService';

interface NovoOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
  onSave: () => void;
}

export default function NovoOrcamentoModal({ isOpen, onClose, pacienteId, onSave }: NovoOrcamentoModalProps) {
  const [orcamentoItens, setOrcamentoItens] = useState<OrcamentoItem[]>([]);
  const [isOrcamentoItemModalOpen, setIsOrcamentoItemModalOpen] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const subtotal = orcamentoItens.reduce((acc, item) => acc + item.valor, 0);
  const totalFinal = subtotal - desconto;

  const handleAddOrcamentoItem = (item: Omit<OrcamentoItem, 'id'>) => {
    const newItem: OrcamentoItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    };
    setOrcamentoItens(prev => [...prev, newItem]);
  };

  const handleRemoveOrcamentoItem = (id: string) => {
    setOrcamentoItens(prev => prev.filter(item => item.id !== id));
  };

  const handleToothClick = (number: number) => {
    setSelectedTooth(number);
    setIsOrcamentoItemModalOpen(true);
  };

  const handleSave = async () => {
    if (orcamentoItens.length === 0) return;

    try {
      await orcamentoService.createOrcamento({
        pacienteId,
        data: new Date().toLocaleDateString('pt-BR'),
        itens: orcamentoItens,
        subtotal,
        desconto,
        total: totalFinal,
        status: 'Pendente',
        formaPagamento,
        observacoes
      });
      
      onSave();
      onClose();
      setOrcamentoItens([]);
      setDesconto(0);
      setFormaPagamento('');
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-[1000px] max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Orçamento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Odontograma */}
            <div className="space-y-6">
              <Odontogram onToothClick={handleToothClick} />
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Instruções</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Clique em um dente no odontograma para adicionar um procedimento ao orçamento.</p>
              </div>
            </div>

            {/* Coluna Orçamento */}
            <div className="flex flex-col space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-indigo-500" />
                    Itens do Orçamento
                  </h3>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                    {orcamentoItens.length} itens
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[400px]">
                  {orcamentoItens.length > 0 ? (
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
                        {orcamentoItens.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.dente}</span>
                                <span className="text-[10px] text-slate-400">{item.superficies.join(', ')}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600 dark:text-slate-400">{item.procedimentoNome}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleRemoveOrcamentoItem(item.id)}
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
                      <p className="text-sm text-slate-500">Nenhum item adicionado ao orçamento.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Desconto</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">R$</span>
                      <input 
                        type="number" 
                        value={desconto}
                        onChange={(e) => setDesconto(Number(e.target.value))}
                        className="w-20 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Forma de Pagamento</label>
                    <select 
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão">Cartão</option>
                      <option value="PIX">PIX</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Observações</label>
                    <textarea 
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={2}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Observações gerais do orçamento..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Total Final</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFinal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={orcamentoItens.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
          >
            Salvar Orçamento
          </button>
        </div>

        <OrcamentoItemModal 
          isOpen={isOrcamentoItemModalOpen}
          onClose={() => setIsOrcamentoItemModalOpen(false)}
          onAdd={handleAddOrcamentoItem}
          toothNumber={selectedTooth}
        />
      </div>
    </div>
  );
}
