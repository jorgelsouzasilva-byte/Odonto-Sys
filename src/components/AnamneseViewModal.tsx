
import { X, Check, AlertCircle } from "lucide-react"
import { Anamnese } from "@/types/paciente"

interface AnamneseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  anamnese: Anamnese | null;
  pacienteNome: string;
}

export default function AnamneseViewModal({ isOpen, onClose, anamnese, pacienteNome }: AnamneseViewModalProps) {
  if (!isOpen || !anamnese) return null;

  const BooleanField = ({ label, value }: { label: string, value: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      {value ? (
        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <Check className="mr-1 h-3 w-3" /> Sim
        </span>
      ) : (
        <span className="inline-flex items-center text-slate-400 dark:text-slate-500 text-xs font-medium">
          Não
        </span>
      )}
    </div>
  );

  const TextField = ({ label, value }: { label: string, value?: string | string[] }) => (
    <div className="py-2">
      <span className="block text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</span>
      <p className="text-sm text-slate-900 dark:text-white">
        {Array.isArray(value) ? value.join(", ") : (value || "Não informado")}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl my-8">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-slate-900 z-10 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Anamnese Registrada</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
          {/* Identificação */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <TextField label="Paciente" value={pacienteNome} />
            <TextField label="Data" value={anamnese.data} />
            <TextField label="Profissional" value={anamnese.profissional} />
          </section>

          {/* Queixa Principal */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Queixa Principal</h3>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <p className="text-sm text-slate-900 dark:text-white italic">"{anamnese.queixa_principal}"</p>
            </div>
          </section>

          {/* Histórico Médico */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Histórico Médico</h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <BooleanField label="Em tratamento médico?" value={anamnese.tratamento_medico} />
              <TextField label="Doenças Pré-existentes" value={anamnese.doencas} />
              <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextField label="Medicamentos" value={anamnese.medicamentos} />
                <TextField label="Alergias" value={anamnese.alergias} />
                <TextField label="Hospitalizações" value={anamnese.hospitalizacoes} />
              </div>
            </div>
          </section>

          {/* Histórico Odontológico */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Histórico Odontológico</h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <BooleanField label="Sensibilidade dentária" value={anamnese.sensibilidade} />
              <BooleanField label="Sangramento gengival" value={anamnese.sangramento} />
              <BooleanField label="Bruxismo" value={anamnese.bruxismo} />
              <TextField label="Última consulta" value={anamnese.ultima_consulta} />
              <div className="sm:col-span-2">
                <TextField label="Reação a anestesia" value={anamnese.reacao_anestesia} />
              </div>
            </div>
          </section>

          {/* Hábitos e Condições */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <section>
              <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Hábitos</h3>
              <div className="space-y-1">
                <BooleanField label="Fuma?" value={anamnese.fuma} />
                <BooleanField label="Consome álcool?" value={anamnese.alcool} />
                <BooleanField label="Consome café?" value={anamnese.cafe} />
                <BooleanField label="Mastiga objetos?" value={anamnese.mastiga_objetos} />
              </div>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Condições Específicas</h3>
              <div className="space-y-1">
                <BooleanField label="Gestante" value={anamnese.gestante} />
                <BooleanField label="Amamentando" value={anamnese.amamentando} />
                <BooleanField label="Problemas de cicatrização" value={anamnese.cicatrizacao} />
                <BooleanField label="Problemas de coagulação" value={anamnese.coagulacao} />
              </div>
            </section>
          </div>

          {/* Observações */}
          <section>
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">Observações</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{anamnese.observacoes || "Nenhuma observação adicional."}</p>
            </div>
          </section>

          <div className="mt-8 flex justify-end border-t border-slate-200 dark:border-slate-800 pt-6">
            <button
              onClick={onClose}
              className="rounded-md bg-slate-100 dark:bg-slate-800 px-6 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
