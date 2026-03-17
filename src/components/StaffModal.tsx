import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { X } from "lucide-react"
import { equipeService, Filial, Modulo } from "@/services/equipeService"

interface StaffModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  staffId?: number | null
}

export default function StaffModal({ isOpen, onClose, onSuccess, staffId }: StaffModalProps) {
  const [filiais, setFiliais] = useState<Filial[]>([])
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    cargo: "Auxiliar de Saúde Bucal",
    filial_id: "",
    status: "Ativo",
    observacoes: "",
    cro: "",
    criar_usuario: false,
    login: "",
    senha_temporaria: "",
  })

  const [permissoes, setPermissoes] = useState<Record<string, { visualizar: boolean, editar: boolean, excluir: boolean }>>({})

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    } else {
      resetForm()
    }
  }, [isOpen, staffId])

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      cargo: "Auxiliar de Saúde Bucal",
      filial_id: "",
      status: "Ativo",
      observacoes: "",
      cro: "",
      criar_usuario: false,
      login: "",
      senha_temporaria: "",
    })
    setPermissoes({})
    setError(null)
    setFieldErrors({})
  }

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [filiaisRes, modulosRes] = await Promise.all([
        equipeService.getFiliais(),
        equipeService.getModulos()
      ])
      
      setFiliais(filiaisRes.data)
      setModulos(modulosRes.data)

      const initialPerms: any = {}
      modulosRes.data.forEach(m => {
        initialPerms[m.nome] = { visualizar: false, editar: false, excluir: false }
      })
      setPermissoes(initialPerms)

      if (staffId) {
        const staffData = await equipeService.getFuncionarioById(staffId)
        setFormData({
          ...formData,
          nome: staffData.nome,
          email: staffData.email,
          telefone: staffData.telefone || "",
          cpf: staffData.cpf || "",
          cargo: staffData.cargo,
          filial_id: staffData.filial_id.toString(),
          status: staffData.status,
          observacoes: staffData.observacoes || "",
          cro: staffData.cro || "",
        })
      }
    } catch (err: any) {
      setError("Erro ao carregar dados.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    let formattedValue = value
    if (name === 'cpf') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }))
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handlePermissaoChange = (modulo: string, acao: 'visualizar' | 'editar' | 'excluir', checked: boolean) => {
    setPermissoes(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [acao]: checked
      }
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setFieldErrors({})

    // Client-side validation
    const errors: Record<string, string> = {}
    if (!formData.nome || formData.nome.length < 2) errors.nome = "Nome deve ter no mínimo 2 caracteres"
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Email inválido"
    if (!formData.filial_id) errors.filial_id = "Filial é obrigatória"
    if (formData.cargo === "Dentista" && !formData.cro) errors.cro = "CRO é obrigatório para dentistas"
    if (formData.criar_usuario && !formData.login) errors.login = "Login é obrigatório"

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSaving(false)
      return
    }

    try {
      let funcId = staffId

      if (staffId) {
        await equipeService.updateFuncionario(staffId, formData)
      } else {
        const res = await equipeService.createFuncionario(formData)
        funcId = res.id

        if (formData.cargo === "Dentista") {
          await equipeService.createDentista({
            funcionario_id: funcId,
            cro: formData.cro,
            especialidade: "Geral",
            porcentagem_comissao: 30.0
          })
        }

        if (formData.criar_usuario) {
          const userRes = await equipeService.createUsuario({
            funcionario_id: funcId,
            login: formData.login,
            senha_temporaria: formData.senha_temporaria,
            tipo: "usuario",
            ativo: true
          })

          const permsArray = Object.entries(permissoes).map(([modulo, perms]: [string, any]) => ({
            modulo,
            visualizar: perms.visualizar,
            editar: perms.editar,
            excluir: perms.excluir
          }))

          await equipeService.applyPermissoes({
            usuario_id: userRes.id,
            permissoes: permsArray
          })
        }
      }

      onSuccess()
    } catch (err: any) {
      if ((err.status === 400 || err.status === 422) && err.body?.errors) {
        setFieldErrors(err.body.errors)
      } else if (err.status === 409) {
        setError(err.body?.error || "Conflito de dados")
      } else {
        setError("Erro interno. Tente novamente mais tarde.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative flex w-full max-w-3xl flex-col rounded-xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {staffId ? "Editar Membro" : "Novo Membro da Equipe"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Carregando...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20">
                {error}
              </div>
            )}

            <form id="staff-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-base font-medium text-slate-900 dark:text-white mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Nome Completo *</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                    />
                    {fieldErrors.nome && <p className="mt-1 text-xs text-red-500">{fieldErrors.nome}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                    />
                    {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Telefone</label>
                    <input
                      type="text"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">CPF</label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                    />
                    {fieldErrors.cpf && <p className="mt-1 text-xs text-red-500">{fieldErrors.cpf}</p>}
                  </div>
                </div>
              </div>

              {/* Vínculo Profissional */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-medium text-slate-900 dark:text-white mb-4">Vínculo Profissional</h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Filial *</label>
                    <select
                      name="filial_id"
                      value={formData.filial_id}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                    >
                      <option value="">Selecione...</option>
                      {filiais.map(f => (
                        <option key={f.id} value={f.id}>{f.nome}</option>
                      ))}
                    </select>
                    {fieldErrors.filial_id && <p className="mt-1 text-xs text-red-500">{fieldErrors.filial_id}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Cargo *</label>
                    <select
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                    >
                      <option value="Auxiliar de Saúde Bucal">Auxiliar de Saúde Bucal</option>
                      <option value="Recepcionista">Recepcionista</option>
                      <option value="Dentista">Dentista</option>
                      <option value="Gerente Administrativo">Gerente Administrativo</option>
                    </select>
                  </div>

                  {formData.cargo === "Dentista" && (
                    <div>
                      <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">CRO *</label>
                      <input
                        type="text"
                        name="cro"
                        value={formData.cro}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                      />
                      {fieldErrors.cro && <p className="mt-1 text-xs text-red-500">{fieldErrors.cro}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Férias">Férias</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Acesso ao Sistema */}
              {!staffId && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center mb-4">
                    <input
                      id="criar_usuario"
                      name="criar_usuario"
                      type="checkbox"
                      checked={formData.criar_usuario}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="criar_usuario" className="ml-2 block text-sm font-medium text-slate-900 dark:text-white">
                      Criar acesso ao sistema para este membro
                    </label>
                  </div>

                  {formData.criar_usuario && (
                    <div className="space-y-6 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Login *</label>
                          <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                          />
                          {fieldErrors.login && <p className="mt-1 text-xs text-red-500">{fieldErrors.login}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Senha Temporária</label>
                          <input
                            type="text"
                            name="senha_temporaria"
                            value={formData.senha_temporaria}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white dark:bg-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Permissões de Acesso</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Módulo</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Visualizar</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Editar</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Excluir</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                              {modulos.map(modulo => (
                                <tr key={modulo.id}>
                                  <td className="px-3 py-2 text-sm text-slate-900 dark:text-slate-300">{modulo.nome}</td>
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={permissoes[modulo.nome]?.visualizar || false}
                                      onChange={(e) => handlePermissaoChange(modulo.nome, 'visualizar', e.target.checked)}
                                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={permissoes[modulo.nome]?.editar || false}
                                      onChange={(e) => handlePermissaoChange(modulo.nome, 'editar', e.target.checked)}
                                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={permissoes[modulo.nome]?.excluir || false}
                                      onChange={(e) => handlePermissaoChange(modulo.nome, 'excluir', e.target.checked)}
                                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="staff-form"
            disabled={saving || loading}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Membro"}
          </button>
        </div>
      </div>
    </div>
  )
}
