'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import ReguaForm from './ReguaForm'

export default function ReguasList({ initialReguas }) {
  const [reguas, setReguas] = useState(initialReguas)
  const [editando, setEditando] = useState(null) // null | 'nova' | reguaObj
  const [dispatchMsg, setDispatchMsg] = useState({}) // { [reguaId]: string }

  async function handleToggle(regua) {
    try {
      await api.put(`/reguas/${regua.id}`, { ativo: !regua.ativo })
      setReguas(rs => rs.map(r => r.id === regua.id ? { ...r, ativo: !r.ativo } : r))
    } catch (err) {
      alert(`Erro ao alterar status: ${err.message}`)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta régua? Esta ação não pode ser desfeita.')) return
    try {
      await api.delete(`/reguas/${id}`)
      setReguas(rs => rs.filter(r => r.id !== id))
    } catch (err) {
      alert(`Erro ao excluir: ${err.message}`)
    }
  }

  async function handleDispatch(id) {
    try {
      await api.post(`/dispatch/${id}`, {})
      setDispatchMsg(m => ({ ...m, [id]: 'Disparado!' }))
      setTimeout(() => setDispatchMsg(m => ({ ...m, [id]: '' })), 4000)
    } catch (err) {
      setDispatchMsg(m => ({ ...m, [id]: `Erro: ${err.message}` }))
      setTimeout(() => setDispatchMsg(m => ({ ...m, [id]: '' })), 4000)
    }
  }

  async function handleSave() {
    try {
      const data = await api.get('/reguas')
      setReguas(data)
    } catch {
      // Lista atualiza na próxima interação
    }
    setEditando(null)
  }

  if (editando !== null) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">
          {editando === 'nova' ? 'Nova Régua' : 'Editar Régua'}
        </h2>
        <ReguaForm
          regua={editando === 'nova' ? null : editando}
          onSave={handleSave}
          onCancel={() => setEditando(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setEditando('nova')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          + Nova régua
        </button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Nome', 'Tipo', 'Dias', 'Horário', 'Status', 'Ações'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reguas.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.nome}</td>
                <td className="px-4 py-3 text-gray-500">
                  {r.tipo === 'pre_vencimento' ? 'Pré-vencimento' : 'Pós-vencimento'}
                </td>
                <td className="px-4 py-3">{r.dias}d</td>
                <td className="px-4 py-3">{r.horario}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(r)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      r.ativo
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {r.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDispatch(r.id)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Disparar
                    </button>
                    <button
                      onClick={() => setEditando(r)}
                      className="text-gray-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Excluir
                    </button>
                    {dispatchMsg[r.id] && (
                      <span className="text-xs text-gray-500">{dispatchMsg[r.id]}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {reguas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma régua cadastrada. Clique em &quot;+ Nova régua&quot; para começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
