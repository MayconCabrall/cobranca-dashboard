'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function ConfiguracoesPage() {
  const [syncLogs, setSyncLogs] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    api.get('/sync/logs?limit=5').then(setSyncLogs).catch(() => {})
  }, [])

  async function handleSync() {
    setSyncing(true)
    setSyncMsg('')
    try {
      const result = await api.post('/sync', {})
      setSyncMsg(`Sync concluído: ${result.clientes_sync} clientes, ${result.faturas_sync} faturas`)
      const logs = await api.get('/sync/logs?limit=5')
      setSyncLogs(logs)
    } catch (err) {
      setSyncMsg(`Erro: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {/* Sync Voalle */}
      <section className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Sincronização Voalle</h2>
        <p className="text-sm text-gray-500">
          A sync automática roda conforme a variável <code className="bg-gray-100 px-1 rounded">SYNC_SCHEDULE</code> configurada na API (padrão: 2x ao dia — 06h e 18h).
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
          </button>
          {syncMsg && <span className="text-sm text-gray-600">{syncMsg}</span>}
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Últimas sincronizações</p>
          <div className="space-y-1">
            {syncLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <span className="text-gray-500">{new Date(log.iniciado_em).toLocaleString('pt-BR')}</span>
                <span>{log.clientes_sync} clientes, {log.faturas_sync} faturas</span>
                <span className={log.status === 'sucesso' ? 'text-green-600' : 'text-red-600'}>
                  {log.status}
                </span>
              </div>
            ))}
            {syncLogs.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum log disponível</p>
            )}
          </div>
        </div>
      </section>

      {/* Matrix Go */}
      <section className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Matrix Go API</h2>
        <p className="text-sm text-gray-500">
          As credenciais são configuradas via variáveis de ambiente na API. Para alterar, edite o arquivo <code className="bg-gray-100 px-1 rounded">.env</code> da <code className="bg-gray-100 px-1 rounded">api-cobranca</code> e reinicie o processo no PM2.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono space-y-1 text-gray-600">
          <p>MATRIX_GO_API_URL=...</p>
          <p>MATRIX_GO_API_KEY=...</p>
        </div>
        <p className="text-xs text-gray-400">
          Os templates são gerenciados diretamente na plataforma Matrix Go e buscados via API ao criar/editar réguas.
        </p>
      </section>
    </div>
  )
}
