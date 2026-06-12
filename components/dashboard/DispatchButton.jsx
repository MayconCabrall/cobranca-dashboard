'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

export default function DispatchButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function showMsg(text) {
    setMsg(text)
    setTimeout(() => setMsg(''), 5000)
  }

  async function handleDispatch() {
    setLoading(true)
    setMsg('')
    try {
      await api.post('/dispatch', {})
      showMsg('Disparado com sucesso!')
    } catch (err) {
      showMsg(`Erro: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-sm text-gray-600">{msg}</span>}
      <button
        onClick={handleDispatch}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Disparando...' : 'Disparar todas agora'}
      </button>
    </div>
  )
}
