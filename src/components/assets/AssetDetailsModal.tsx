import { useState, useEffect, ReactNode, FormEvent } from "react"
import { X, History, Info, Building2, Calendar, Tag, DollarSign, FileText } from "lucide-react"
import { PatrimonioDetail } from "../../types/patrimonio"
import { patrimonioService } from "../../services/patrimonioService"
import { cn } from "@/lib/utils"

interface AssetDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  assetId: number | null
}

export default function AssetDetailsModal({ isOpen, onClose, assetId }: AssetDetailsModalProps) {
  const [asset, setAsset] = useState<PatrimonioDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info')

  useEffect(() => {
    if (isOpen && assetId) {
      loadAsset()
    }
  }, [isOpen, assetId])

  const loadAsset = async () => {
    setLoading(true)
    try {
      const data = await patrimonioService.getById(assetId!)
      setAsset(data)
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {loading ? "Carregando..." : asset?.nome}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">ID: {assetId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                "border-b-2 py-4 px-1 text-sm font-medium",
                activeTab === 'info'
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>Informações</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "border-b-2 py-4 px-1 text-sm font-medium",
                activeTab === 'history'
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              <div className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Histórico</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : asset ? (
            <>
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <DetailItem icon={<Tag className="h-4 w-4" />} label="Número de Série" value={asset.numero_serie} mono />
                    <DetailItem icon={<Building2 className="h-4 w-4" />} label="Filial Atual" value={asset.filial} />
                    <DetailItem icon={<Calendar className="h-4 w-4" />} label="Data de Aquisição" value={new Date(asset.data_aquisicao).toLocaleDateString('pt-BR')} />
                  </div>
                  <div className="space-y-4">
                    <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Valor de Compra" value={`R$ ${asset.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <Info className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</p>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset mt-0.5",
                          asset.status === 'Em uso' ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" :
                          asset.status === 'Manutenção' ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20" :
                          "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20"
                        )}>
                          {asset.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                      <FileText className="h-4 w-4" />
                      <p className="text-xs font-medium uppercase tracking-wider">Observações</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-700 dark:text-slate-300 min-h-[80px]">
                      {asset.observacoes || "Nenhuma observação registrada."}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {asset.historico_movimentacoes.map((event, eventIdx) => (
                      <li key={eventIdx}>
                        <div className="relative pb-8">
                          {eventIdx !== asset.historico_movimentacoes.length - 1 ? (
                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-900",
                                event.acao === 'Entrada' ? "bg-emerald-500" : "bg-blue-500"
                              )}>
                                <History className="h-4 w-4 text-white" aria-hidden="true" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {event.acao} - <span className="font-medium text-slate-900 dark:text-white">{event.detalhe}</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">Por: {event.usuario}</p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                                <time dateTime={event.data}>{new Date(event.data).toLocaleDateString('pt-BR')}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-slate-500 py-12">Item não encontrado.</p>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="rounded-md bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value, mono = false }: { icon: ReactNode, label: string, value: string, mono?: boolean }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={cn("text-sm font-medium text-slate-900 dark:text-white", mono && "font-mono")}>{value}</p>
      </div>
    </div>
  )
}
