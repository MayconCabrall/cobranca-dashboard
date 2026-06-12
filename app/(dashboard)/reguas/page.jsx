import { createClient } from '@/lib/supabase/server'
import ReguasList from '@/components/reguas/ReguasList'

export default async function ReguasPage() {
  try {
    const supabase = await createClient()
    const { data: reguas } = await supabase
      .from('reguas')
      .select('id, nome, tipo, dias, horario, ativo, template_matrix_id, criado_em')
      .order('criado_em', { ascending: false })

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Réguas de Cobrança</h1>
        <ReguasList initialReguas={reguas ?? []} />
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Réguas de Cobrança</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-medium">Erro ao carregar réguas</p>
        </div>
      </div>
    )
  }
}
