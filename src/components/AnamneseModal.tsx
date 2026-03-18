
import { useState, FormEvent } from "react"
import { X } from "lucide-react"
import { Anamnese } from "@/types/paciente"
import { pacienteService } from "@/services/pacienteService"

interface AnamneseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
  pacienteNome: string;
  onSave: () => void;
}

export default function AnamneseModal({ isOpen, onClose, pacienteId, pacienteNome, onSave }: AnamneseModalProps) {
  const [formData, setFormData] = useState<Partial<Anamnese>>({
    queixa_principal: "",
    tratamento_medico: false,
    medicamentos: "",
    alergias: "",
    hospitalizacoes: "",
    doencas: [],
    sensibilidade: false,
    sangramento: false,
    bruxismo: false,
    ultima_consulta: "",
    reacao_anestesia: "",
    fuma: false,
    alcool: false,
    cafe: false,
    mastiga_objetos: false,
    gestante: false,
    amamentando: false,
    cicatrizacao: false,
    coagulacao: false,
    observacoes: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleDoencaToggle = (doenca: string) => {
    setFormData(prev => ({
      ...prev,
      doencas: prev.doencas?.includes(doenca)
        ? prev.doencas.filter(d => d !== doenca)
        : [...(prev.doencas || []), doenca]
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await pacienteService.salvarAnamnese({
        ...formData as any,
        pacienteId
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const doencasOptions = [
    "Diabetes",
    "Hipertensão",
    "Cardiopatias",
    "Asma",
    "Epilepsia",
    "Distúrbios hemorrágicos",
    "Outros"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl my-8">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Anamnese do Paciente</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
          {/* Identificação */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Identificação</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Paciente</label>
                <input type="text" value={pacienteNome} readOnly className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                <input type="date" value={new Date().toISOString().split('T')[0]} readOnly className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Profissional</label>
                <input type="text" value="Dr. Jorge Silva" readOnly className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 sm:text-sm" />
              </div>
            </div>
          </section>

          {/* Queixa Principal */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Queixa Principal</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
              <textarea 
                rows={3}
                value={formData.queixa_principal}
                onChange={e => setFormData({...formData, queixa_principal: e.target.value})}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Descreva o motivo da consulta..."
              />
            </div>
          </section>

          {/* Histórico Médico */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Histórico Médico</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="tratamento_medico"
                  checked={formData.tratamento_medico}
                  onChange={e => setFormData({...formData, tratamento_medico: e.target.checked})}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" 
                />
                <label htmlFor="tratamento_medico" className="text-sm font-medium text-slate-700 dark:text-slate-300">Em tratamento médico?</label>
              </div>
              <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Medicamentos</label>
                  <textarea 
                    rows={2}
                    value={formData.medicamentos}
                    onChange={e => setFormData({...formData, medicamentos: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Alergias</label>
                  <textarea 
                    rows={2}
                    value={formData.alergias}
                    onChange={e => setFormData({...formData, alergias: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hospitalizações</label>
                  <textarea 
                    rows={2}
                    value={formData.hospitalizacoes}
                    onChange={e => setFormData({...formData, hospitalizacoes: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Doenças Pré-existentes</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {doencasOptions.map(doenca => (
                      <div key={doenca} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`doenca-${doenca}`}
                          checked={formData.doencas?.includes(doenca)}
                          onChange={() => handleDoencaToggle(doenca)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" 
                        />
                        <label htmlFor={`doenca-${doenca}`} className="text-xs text-slate-600 dark:text-slate-400">{doenca}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Histórico Odontológico */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Histórico Odontológico</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="sensibilidade" checked={formData.sensibilidade} onChange={e => setFormData({...formData, sensibilidade: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="sensibilidade" className="text-sm font-medium text-slate-700 dark:text-slate-300">Sensibilidade dentária</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="sangramento" checked={formData.sangramento} onChange={e => setFormData({...formData, sangramento: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="sangramento" className="text-sm font-medium text-slate-700 dark:text-slate-300">Sangramento gengival</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="bruxismo" checked={formData.bruxismo} onChange={e => setFormData({...formData, bruxismo: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="bruxismo" className="text-sm font-medium text-slate-700 dark:text-slate-300">Bruxismo</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Última consulta</label>
                <input type="date" value={formData.ultima_consulta} onChange={e => setFormData({...formData, ultima_consulta: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reação a anestesia</label>
                <input type="text" value={formData.reacao_anestesia} onChange={e => setFormData({...formData, reacao_anestesia: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
            </div>
          </section>

          {/* Hábitos */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Hábitos</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="fuma" checked={formData.fuma} onChange={e => setFormData({...formData, fuma: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="fuma" className="text-sm font-medium text-slate-700 dark:text-slate-300">Fuma?</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="alcool" checked={formData.alcool} onChange={e => setFormData({...formData, alcool: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="alcool" className="text-sm font-medium text-slate-700 dark:text-slate-300">Álcool?</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="cafe" checked={formData.cafe} onChange={e => setFormData({...formData, cafe: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="cafe" className="text-sm font-medium text-slate-700 dark:text-slate-300">Café?</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="mastiga_objetos" checked={formData.mastiga_objetos} onChange={e => setFormData({...formData, mastiga_objetos: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="mastiga_objetos" className="text-sm font-medium text-slate-700 dark:text-slate-300">Mastiga objetos?</label>
              </div>
            </div>
          </section>

          {/* Condições Específicas */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Condições Específicas</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="gestante" checked={formData.gestante} onChange={e => setFormData({...formData, gestante: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="gestante" className="text-sm font-medium text-slate-700 dark:text-slate-300">Gestante</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="amamentando" checked={formData.amamentando} onChange={e => setFormData({...formData, amamentando: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="amamentando" className="text-sm font-medium text-slate-700 dark:text-slate-300">Amamentando</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="cicatrizacao" checked={formData.cicatrizacao} onChange={e => setFormData({...formData, cicatrizacao: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="cicatrizacao" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cicatrizacao</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="coagulacao" checked={formData.coagulacao} onChange={e => setFormData({...formData, coagulacao: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <label htmlFor="coagulacao" className="text-sm font-medium text-slate-700 dark:text-slate-300">Coagulação</label>
              </div>
            </div>
          </section>

          {/* Observações */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Observações</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações gerais</label>
              <textarea 
                rows={3}
                value={formData.observacoes}
                onChange={e => setFormData({...formData, observacoes: e.target.value})}
                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </section>

          <div className="mt-8 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar Anamnese"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
