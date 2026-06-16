import { createClient } from './supabase/client.js'
import { anexarClientes } from './anexar-clientes.js'

function sb() {
  return createClient()
}

// Réguas
export async function listarReguas() {
  const { data, error } = await sb().from('reguas').select('*').order('criado_em', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function salvarRegua(payload, id = null) {
  if (id) {
    const { error } = await sb().from('reguas').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await sb().from('reguas').insert(payload)
    if (error) throw new Error(error.message)
  }
}

export async function excluirRegua(id) {
  const { error } = await sb().from('reguas').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Sync logs
export async function listarSyncLogs(limit = 5) {
  const { data, error } = await sb().from('sync_logs').select('*').order('iniciado_em', { ascending: false }).limit(limit)
  if (error) throw new Error(error.message)
  return data ?? []
}

// Envios
export async function listarEnvios({ status, regua_id, page = 1, limit = 50 } = {}) {
  const client = sb()
  let query = client
    .from('envios')
    .select('id, status, erro, enviado_em, faturas(valor, vencimento, client_id), reguas(nome)', { count: 'exact' })
    .order('enviado_em', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) query = query.eq('status', status)
  if (regua_id) query = query.eq('regua_id', regua_id)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)
  // faturas/clientes não têm FK — join feito no código.
  const dataComClientes = await anexarClientes(client, data ?? [])
  return { data: dataComClientes, total: count ?? 0 }
}

// Edge Functions
export async function triggerSync() {
  // Via rota server-side do Next (/api/sync) para evitar o CORS do gateway do
  // Supabase no preflight de functions.invoke chamado do browser.
  const res = await fetch('/api/sync', { method: 'POST' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Falha no sync (HTTP ${res.status})`)
  }
  return data
}

export async function triggerDispatch(reguaId = null) {
  const body = reguaId ? { regua_id: reguaId } : {}
  const { data, error } = await sb().functions.invoke('dispatch', { body })
  if (error) throw new Error(error.message)
  return data
}

export async function reenviarEnvio(envioId) {
  const { data, error } = await sb().functions.invoke('reenviar', { body: { envio_id: envioId } })
  if (error) throw new Error(error.message)
  return data
}
