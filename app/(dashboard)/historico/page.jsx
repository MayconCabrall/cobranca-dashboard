import { createClient } from '@/lib/supabase/server'
import EnviosTable from '@/components/historico/EnviosTable'
import { anexarClientes } from '@/lib/anexar-clientes'

export default async function HistoricoPage() {
  const supabase = await createClient()
  const [enviosRes, reguasRes] = await Promise.all([
    supabase.from('envios')
      .select(`id, status, erro, enviado_em,
        faturas(valor, vencimento, client_id),
        reguas(nome)`, { count: 'exact' })
      .order('enviado_em', { ascending: false })
      .range(0, 49),
    supabase.from('reguas').select('id, nome').order('nome'),
  ])

  if (enviosRes.error) console.error('Erro ao buscar envios:', enviosRes.error.message)
  if (reguasRes.error) console.error('Erro ao buscar réguas:', reguasRes.error.message)

  // faturas e clientes não têm FK (faturas.client_id = clientes.id_voalle),
  // então o join é feito aqui no código em vez de embed do PostgREST.
  const envios = await anexarClientes(supabase, enviosRes.data ?? [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Histórico de Envios</h1>
      <EnviosTable
        envios={{ data: envios, total: enviosRes.count ?? 0 }}
        reguas={reguasRes.data ?? []}
      />
    </div>
  )
}
