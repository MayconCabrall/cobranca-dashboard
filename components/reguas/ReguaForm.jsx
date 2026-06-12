'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function ReguaForm({ regua, onSave, onCancel }) {
  const [form, setForm] = useState({
    nome: regua?.nome ?? '',
    tipo: regua?.tipo ?? 'pre_vencimento',
    dias: regua?.dias ?? 1,
    horario: regua?.horario ?? '08:00',
    template_matrix_id: regua?.template_matrix_id ?? '',
  })
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dispatch/templates')
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setTemplatesLoading(false))
  }, [])

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, dias: Number(form.dias) }
      if (regua) {
        await api.put(`/reguas/${regua.id}`, payload)
      } else {
        await api.post('/reguas', payload)
      }
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <input className={inputClass} value={form.nome} onChange={set('nome')} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <select className={inputClass} value={form.tipo} onChange={set('tipo')}>
          <option value="pre_vencimento">Pré-vencimento</option>
          <option value="pos_vencimento">Pós-vencimento</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Dias antes/depois do vencimento</label>
        <input type="number" min="1" className={inputClass} value={form.dias} onChange={set('dias')} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Horário de disparo</label>
        <input type="time" className={inputClass} value={form.horario} onChange={set('horario')} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Template Matrix Go</label>
        <select
          className={inputClass}
          value={form.template_matrix_id}
          onChange={e => setForm(f => ({ ...f, template_matrix_id: e.target.value }))}
          required
          disabled={templatesLoading}
        >
          {templatesLoading
            ? <option value="">Carregando templates...</option>
            : <>
                <option value="">Selecione um template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
                {templates.length === 0 && (
                  <option disabled>Nenhum template encontrado — verifique as credenciais Matrix Go</option>
                )}
              </>
          }
        </select>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Salvando...' : (regua ? 'Salvar alterações' : 'Criar régua')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
