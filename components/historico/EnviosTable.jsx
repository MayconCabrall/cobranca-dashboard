'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

const STATUS_LABEL = { enviado: '✅ Enviado', falhou: '❌ Falhou', pulado: '⏭️ Pulado' }
const STATUS_COLOR = {
  enviado: 'text-green-700',
  falhou: 'text-red-600',
  pulado: 'text-gray-400',
}

export default function EnviosTable({ envios: initialEnvios, reguas }) {
  const [envios, setEnvios] = useState(initialEnvios.data)
  const [filtros, setFiltros] = useState({ status: '', regua_id: '' })
  const [detalhe, setDetalhe] = useState(null)
  const [page, setPage] = useState(1)
  const [reenvioMsg, setReenvioMsg] = useState({}) // { [envioId]: string }
  const total = initialEnvios.total

  async function buscar(novosFiltros = filtros, novaPagina = page) {
    const params = new URLSearchParams({ page: novaPagina })
    if (novosFiltros.status) params.set('status', novosFiltros.status)
    if (novosFiltros.regua_id) params.set('regua_id', novosFiltros.regua_id)
    const data = await api.get(`/envios?${params}`)
    setEnvios(data.data)
  }

  async function handleReenviar(envioId) {
    try {
      await api.post(`/envios/${envioId}/reenviar`, {})
      await buscar()
      setReenvioMsg(m => ({ ...m, [envioId]: 'Reenvio iniciado!' }))
      setTimeout(() => setReenvioMsg(m => ({ ...m, [envioId]: '' })), 4000)
    } catch (err) {
      setReenvioMsg(m => ({ ...m, [envioId]: `Erro: ${err.message}` }))
      setTimeout(() => setReenvioMsg(m => ({ ...m, [envioId]: '' })), 4000)
    }
  }

  function handleFiltro(campo, valor) {
    const novos = { ...filtros, [campo]: valor }
    setFiltros(novos)
    setPage(1)
    buscar(novos, 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filtros.status}
          onChange={e => handleFiltro('status', e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="enviado">Enviado</option>
          <option value="falhou">Falhou</option>
          <option value="pulado">Pulado</option>
        </select>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filtros.regua_id}
          onChange={e => handleFiltro('regua_id', e.target.value)}
        >
          <option value="">Todas as réguas</option>
          {reguas.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
        </select>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Cliente', 'Telefone', 'Vencimento', 'Valor', 'Régua', 'Status', 'Data/Hora', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {envios.map(e => (
              <tr
                key={e.id}
                className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => setDetalhe(e)}
              >
                <td className="px-4 py-3">{e.faturas?.clientes?.nome ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500">{e.faturas?.clientes?.telefone ?? '-'}</td>
                <td className="px-4 py-3">{e.faturas?.vencimento ?? '-'}</td>
                <td className="px-4 py-3">
                  {e.faturas?.valor
                    ? Number(e.faturas.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : '-'}
                </td>
                <td className="px-4 py-3">{e.reguas?.nome ?? '-'}</td>
                <td className={`px-4 py-3 font-medium ${STATUS_COLOR[e.status]}`}>
                  {STATUS_LABEL[e.status] ?? e.status}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(e.enviado_em).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3" onClick={ev => ev.stopPropagation()}>
                  {e.status === 'falhou' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReenviar(e.id)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Reenviar
                      </button>
                      {reenvioMsg[e.id] && (
                        <span className="text-xs text-gray-500">{reenvioMsg[e.id]}</span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {envios.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Nenhum envio encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação simples */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button
          disabled={page === 1}
          onClick={() => { setPage(p => p - 1); buscar(filtros, page - 1) }}
          className="px-3 py-1 border rounded disabled:opacity-30"
        >
          ←
        </button>
        <span>Página {page} · {total} registros</span>
        <button
          disabled={page * 50 >= total}
          onClick={() => { setPage(p => p + 1); buscar(filtros, page + 1) }}
          className="px-3 py-1 border rounded disabled:opacity-30"
        >
          →
        </button>
      </div>

      {/* Modal detalhe */}
      {detalhe && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setDetalhe(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-4">Detalhe do Envio</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className={`font-medium ${STATUS_COLOR[detalhe.status]}`}>
                  {STATUS_LABEL[detalhe.status]}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Cliente</dt>
                <dd>{detalhe.faturas?.clientes?.nome}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Régua</dt>
                <dd>{detalhe.reguas?.nome}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Enviado em</dt>
                <dd>{new Date(detalhe.enviado_em).toLocaleString('pt-BR')}</dd>
              </div>
              {detalhe.erro && (
                <div>
                  <dt className="text-gray-500">Erro</dt>
                  <dd className="text-red-600">{detalhe.erro}</dd>
                </div>
              )}
            </dl>
            <button
              onClick={() => setDetalhe(null)}
              className="mt-4 w-full border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
