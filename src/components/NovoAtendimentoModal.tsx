
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Calculator, Save } from "lucide-react";
import { pacienteService } from "@/services/pacienteService";
import { Evolucao, EvolucaoItem } from "@/types/paciente";
import { cn } from "@/lib/utils";

interface NovoAtendimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
  onSave: () => void;
}

export default function NovoAtendimentoModal({ isOpen, onClose, pacienteId, onSave }: NovoAtendimentoModalProps) {
  const [loading, setLoading] = useState(false);
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [itens, setItens] = useState<EvolucaoItem[]>([]);
  const [formaPagamento, setFormaPagamento] = useState("Cartão de Crédito");
  const [parcelas, setParcelas] = useState(1);
  const [statusPagamento, setStatusPagamento] = useState("pago");

  const addProcedimento = () => {
    const newItem: EvolucaoItem = {
      procedimentoId: 0,
      profissionalId: 7, // Mocked professional
      dentes: [{ dente: 0, faces: [] }],
      valorBase: 0,
      desconto: 0,
      valorFinal: 0,
      observacoes: ""
    };
    setItens([...itens, newItem]);
  };

  const removeProcedimento = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof EvolucaoItem, value: any) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    
    // Recalculate valorFinal if valorBase or desconto changes
    if (field === 'valorBase' || field === 'desconto') {
      newItens[index].valorFinal = (newItens[index].valorBase || 0) - (newItens[index].desconto || 0);
    }
    
    setItens(newItens);
  };

  const updateDente = (itemIndex: number, denteIndex: number, field: string, value: any) => {
    const newItens = [...itens];
    const newDentes = [...newItens[itemIndex].dentes];
    newDentes[denteIndex] = { ...newDentes[denteIndex], [field]: value };
    newItens[itemIndex].dentes = newDentes;
    setItens(newItens);
  };

  const toggleFace = (itemIndex: number, denteIndex: number, face: string) => {
    const newItens = [...itens];
    const currentFaces = newItens[itemIndex].dentes[denteIndex].faces;
    if (currentFaces.includes(face)) {
      newItens[itemIndex].dentes[denteIndex].faces = currentFaces.filter(f => f !== face);
    } else {
      newItens[itemIndex].dentes[denteIndex].faces = [...currentFaces, face];
    }
    setItens(newItens);
  };

  const subtotal = itens.reduce((acc, item) => acc + (item.valorBase || 0), 0);
  const totalDescontos = itens.reduce((acc, item) => acc + (item.desconto || 0), 0);
  const valorFinal = subtotal - totalDescontos;

  const handleSave = async () => {
    if (itens.length === 0) {
      alert("Adicione pelo menos um procedimento.");
      return;
    }

    setLoading(true);
    try {
      const evolucaoData: Omit<Evolucao, 'id'> = {
        pacienteId,
        data: new Date().toISOString().split('T')[0],
        observacoesGerais,
        itens,
        totais: {
          subtotal,
          descontoGeral: totalDescontos,
          valorFinal
        },
        pagamento: {
          formaPagamento,
          parcelas,
          dataPagamento: new Date().toISOString().split('T')[0],
          status: statusPagamento,
          observacoes: ""
        }
      };

      await pacienteService.salvarEvolucao(evolucaoData);
      onSave();
      onClose();
      // Reset state
      setObservacoesGerais("");
      setItens([]);
    } catch (error) {
      console.error("Erro ao salvar evolução:", error);
      alert("Erro ao salvar evolução.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Atendimento / Evolução</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Observações Gerais */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações Gerais</label>
            <textarea
              value={observacoesGerais}
              onChange={(e) => setObservacoesGerais(e.target.value)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
              placeholder="Relato do paciente, queixas, etc."
            />
          </div>

          {/* Itens de Procedimento */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Procedimentos</h3>
              <button
                onClick={addProcedimento}
                className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Procedimento
              </button>
            </div>

            {itens.map((item, idx) => (
              <div key={idx} className="relative p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                <button
                  onClick={() => removeProcedimento(idx)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Procedimento ID</label>
                    <input
                      type="number"
                      value={item.procedimentoId}
                      onChange={(e) => updateItem(idx, 'procedimentoId', parseInt(e.target.value))}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Profissional ID</label>
                    <input
                      type="number"
                      value={item.profissionalId}
                      onChange={(e) => updateItem(idx, 'profissionalId', parseInt(e.target.value))}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {item.dentes.map((d, dIdx) => (
                    <div key={dIdx} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Dente</label>
                        <input
                          type="number"
                          value={d.dente}
                          onChange={(e) => updateDente(idx, dIdx, 'dente', parseInt(e.target.value))}
                          className="w-16 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {['O', 'M', 'D', 'V', 'L', 'P'].map(face => (
                          <button
                            key={face}
                            onClick={() => toggleFace(idx, dIdx, face)}
                            className={cn(
                              "w-8 h-8 rounded flex items-center justify-center text-xs font-bold border transition-colors",
                              d.faces.includes(face)
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                            )}
                          >
                            {face}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Valor Base</label>
                    <input
                      type="number"
                      value={item.valorBase}
                      onChange={(e) => updateItem(idx, 'valorBase', parseFloat(e.target.value))}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Desconto</label>
                    <input
                      type="number"
                      value={item.desconto}
                      onChange={(e) => updateItem(idx, 'desconto', parseFloat(e.target.value))}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Valor Final</label>
                    <div className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white sm:text-sm font-semibold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorFinal)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Observações do Item</label>
                  <input
                    type="text"
                    value={item.observacoes}
                    onChange={(e) => updateItem(idx, 'observacoes', e.target.value)}
                    className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Ex: Cárie extensa..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Totais e Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pagamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Forma de Pagamento</label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option>Dinheiro</option>
                    <option>Pix</option>
                    <option>Cartão de Crédito</option>
                    <option>Cartão de Débito</option>
                    <option>Boleto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    value={parcelas}
                    onChange={(e) => setParcelas(parseInt(e.target.value))}
                    className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</label>
                  <select
                    value={statusPagamento}
                    onChange={(e) => setStatusPagamento(e.target.value)}
                    className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Descontos</span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDescontos)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-base font-bold text-slate-900 dark:text-white">Valor Final</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFinal)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Salvando..." : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Salvar Atendimento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
