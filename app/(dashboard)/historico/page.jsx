import { createClient } from '@/lib/supabase/server'
import EnviosTable from '@/components/historico/EnviosTable'

export default async function HistoricoPage() {
  const supabase = await createClient()
  const [enviosRes, reguasRes] = await Promise.all([
    supabase.from('envios')
      .select(`id, status, erro, enviado_em,
        faturas(valor, vencimento, clientes(nome, telefone)),
        reguas(nome)`, { count: 'exact' })
      .order('enviado_em', { ascending: false })
      .range(0, 49),
    supabase.from('reguas').select('id, nome').order('nome'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Histórico de Envios</h1>
      <EnviosTable
        envios={{ data: enviosRes.data ?? [], total: enviosRes.count ?? 0 }}
        reguas={reguasRes.data ?? []}
      />
    </div>
  )
}
