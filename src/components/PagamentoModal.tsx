
import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Financeiro } from '@/types/paciente';

interface PagamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lancamento: Financeiro | null;
  pacienteNome: string;
  onConfirm: (formaPagamento: string) => void;
}

export default function PagamentoModal({ isOpen, onClose, lancamento, pacienteNome, onConfirm }: PagamentoModalProps) {
  const [formaPagamento, setFormaPagamento] = useState('PIX');

  if (!isOpen || !lancamento) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-[480px] rounded-xl bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registrar Pagamento</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Paciente: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{pacienteNome}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor a Pagar</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lancamento.valor)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{lancamento.descricao}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Forma de Pagamento</label>
            <select 
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão">Cartão</option>
              <option value="PIX">PIX</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(formaPagamento)}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
          >
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
}
