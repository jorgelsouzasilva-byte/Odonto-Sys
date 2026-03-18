import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Calendar, User, CreditCard, FileText, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Procedimento, Paciente, Profissional, ProcedimentoTipo } from '../types';

export default function Procedimentos() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [tipos, setTipos] = useState<ProcedimentoTipo[]>([]);

  const [formData, setFormData] = useState<Partial<Procedimento>>({
    paciente_id: 0,
    data_procedimento: new Date().toISOString().split('T')[0],
    itens: [],
    subtotal: 0,
    desconto_geral: 0,
    valor_final: 0,
    pagamento: {
      forma_pagamento: 'Dinheiro',
      parcelas: 1,
      status: 'pendente'
    },
    observacoes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [procRes, pacRes, profRes, tiposRes] = await Promise.all([
        fetch('/api/procedimentos'),
        fetch('/api/pacientes'),
        fetch('/api/profissionais'),
        fetch('/api/procedimento-tipos')
      ]);

      const [procData, pacData, profData, tiposData] = await Promise.all([
        procRes.json(),
        pacRes.json(),
        profRes.json(),
        tiposRes.json()
      ]);

      setProcedimentos(procData);
      setPacientes(pacData);
      setProfissionais(profData);
      setTipos(tiposData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      procedimento_id: tipos[0]?.id || 0,
      profissional_id: profissionais[0]?.id || 0,
      dentes: [],
      valor_base: tipos[0]?.valor_base || 0,
      desconto: 0,
      valor_final: tipos[0]?.valor_base || 0
    };

    const newItens = [...(formData.itens || []), newItem];
    updateTotals(newItens, formData.desconto_geral || 0);
  };

  const updateTotals = (itens: any[], descontoGeral: number) => {
    const subtotal = itens.reduce((acc, item) => acc + item.valor_final, 0);
    const valorFinal = subtotal - descontoGeral;
    setFormData({
      ...formData,
      itens,
      subtotal,
      valor_final: valorFinal > 0 ? valorFinal : 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/procedimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const newProc = await res.json();
        setProcedimentos([newProc, ...procedimentos]);
        setShowForm(false);
        // Reset form
        setFormData({
          paciente_id: 0,
          data_procedimento: new Date().toISOString().split('T')[0],
          itens: [],
          subtotal: 0,
          desconto_geral: 0,
          valor_final: 0,
          pagamento: {
            forma_pagamento: 'Dinheiro',
            parcelas: 1,
            status: 'pendente'
          },
          observacoes: ''
        });
      }
    } catch (error) {
      console.error('Erro ao salvar procedimento:', error);
    }
  };

  const filteredProcedimentos = procedimentos.filter(p => 
    p.paciente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Procedimentos</h1>
          <p className="text-slate-500 dark:text-slate-400">Gerencie os tratamentos e procedimentos realizados.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Procedimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por paciente ou ID..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Filter className="w-5 h-5 mr-2" />
          Filtros Avançados
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-bottom border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Paciente</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Data</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Valor</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredProcedimentos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">#{p.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {p.paciente_nome?.charAt(0)}
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-900 dark:text-white">{p.paciente_nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(p.data_procedimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      R$ {p.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        p.pagamento.status === 'pago' 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {p.pagamento.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Procedimento</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Paciente</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.paciente_id}
                    onChange={(e) => setFormData({...formData, paciente_id: Number(e.target.value)})}
                    required
                  >
                    <option value="">Selecione um paciente</option>
                    {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.data_procedimento}
                    onChange={(e) => setFormData({...formData, data_procedimento: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Itens do Procedimento</h3>
                  <button 
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Adicionar Item
                  </button>
                </div>

                {formData.itens?.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Procedimento</label>
                        <select 
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                          value={item.procedimento_id}
                          onChange={(e) => {
                            const tipo = tipos.find(t => t.id === Number(e.target.value));
                            const newItens = [...(formData.itens || [])];
                            newItens[index] = {
                              ...item,
                              procedimento_id: Number(e.target.value),
                              valor_base: tipo?.valor_base || 0,
                              valor_final: (tipo?.valor_base || 0) - item.desconto
                            };
                            updateTotals(newItens, formData.desconto_geral || 0);
                          }}
                        >
                          {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Profissional</label>
                        <select 
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                          value={item.profissional_id}
                          onChange={(e) => {
                            const newItens = [...(formData.itens || [])];
                            newItens[index] = { ...item, profissional_id: Number(e.target.value) };
                            setFormData({...formData, itens: newItens});
                          }}
                        >
                          {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Dentes e Faces</label>
                      <div className="flex flex-wrap gap-2">
                        {[11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              const newItens = [...(formData.itens || [])];
                              const dentes = [...item.dentes];
                              const denteIndex = dentes.findIndex(d => d.numero === num);
                              
                              if (denteIndex > -1) {
                                dentes.splice(denteIndex, 1);
                              } else {
                                dentes.push({ numero: num, faces: ['O'] });
                              }
                              
                              newItens[index] = { ...item, dentes };
                              setFormData({...formData, itens: newItens});
                            }}
                            className={cn(
                              "w-8 h-8 rounded border text-[10px] flex items-center justify-center transition-colors",
                              item.dentes.some(d => d.numero === num)
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Valor: R$ {item.valor_base.toFixed(2)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs font-medium text-slate-500">Desconto:</label>
                          <input 
                            type="number"
                            className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm"
                            value={item.desconto}
                            onChange={(e) => {
                              const newItens = [...(formData.itens || [])];
                              const desc = Number(e.target.value);
                              newItens[index] = {
                                ...item,
                                desconto: desc,
                                valor_final: item.valor_base - desc
                              };
                              updateTotals(newItens, formData.desconto_geral || 0);
                            }}
                          />
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const newItens = (formData.itens || []).filter((_, i) => i !== index);
                          updateTotals(newItens, formData.desconto_geral || 0);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Forma de Pagamento</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.pagamento?.forma_pagamento}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pagamento: { ...formData.pagamento!, forma_pagamento: e.target.value }
                      })}
                    >
                      <option>Dinheiro</option>
                      <option>Cartão de Crédito</option>
                      <option>Cartão de Débito</option>
                      <option>PIX</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.pagamento?.status}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pagamento: { ...formData.pagamento!, status: e.target.value as any }
                      })}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago</option>
                    </select>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                    <span className="font-medium text-slate-900 dark:text-white">R$ {formData.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Desconto Geral:</span>
                    <input 
                      type="number"
                      className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm text-right"
                      value={formData.desconto_geral}
                      onChange={(e) => updateTotals(formData.itens || [], Number(e.target.value))}
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-indigo-100 dark:border-indigo-800 pt-2 mt-2">
                    <span className="text-indigo-900 dark:text-indigo-100">Total Final:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">R$ {formData.valor_final?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
                  <textarea 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                    placeholder="Notas sobre o procedimento..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Salvar Procedimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
