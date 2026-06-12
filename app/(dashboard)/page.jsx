import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/dashboard/StatsCards'
import EnviosChart from '@/components/dashboard/EnviosChart'
import DispatchButton from '@/components/dashboard/DispatchButton'

async function getStats(supabase) {
  const hoje = new Date().toISOString().split('T')[0]
  const agora = new Date()
  const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`

  const [enviados, falhas, pendentes] = await Promise.all([
    supabase.from('envios').select('id', { count: 'exact', head: true })
      .eq('status', 'enviado').gte('enviado_em', `${hoje}T00:00:00`),
    supabase.from('envios').select('id', { count: 'exact', head: true })
      .eq('status', 'falhou').gte('enviado_em', `${hoje}T00:00:00`),
    supabase.from('reguas').select('id', { count: 'exact', head: true })
      .eq('ativo', true).gte('horario', horaAtual),
  ])

  return {
    enviados: enviados.count ?? 0,
    falhas: falhas.count ?? 0,
    pendentes: pendentes.count ?? 0,
  }
}

async function getChartData(supabase) {
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const result = []
  for (const dia of dias) {
    const { count } = await supabase
      .from('envios')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'enviado')
      .gte('enviado_em', `${dia}T00:00:00`)
      .lte('enviado_em', `${dia}T23:59:59`)
    result.push({ dia: dia.slice(5), enviados: count ?? 0 })
  }
  return result
}

async function getProximasReguas(supabase) {
  const { data } = await supabase
    .from('reguas')
    .select('id, nome, horario, tipo')
    .eq('ativo', true)
    .order('horario')
  return data ?? []
}

export default async function HomePage() {
  try {
    const supabase = await createClient()
    const [stats, chartData, proximasReguas] = await Promise.all([
      getStats(supabase),
      getChartData(supabase),
      getProximasReguas(supabase),
    ])

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <DispatchButton />
        </div>
        <StatsCards stats={stats} />
        <EnviosChart data={chartData} />
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Próximos disparos</h2>
          <div className="space-y-2">
            {proximasReguas.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <span>{r.nome}</span>
                <span className="text-gray-500">{r.horario}</span>
              </div>
            ))}
            {proximasReguas.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhuma régua ativa cadastrada</p>
            )}
          </div>
        </div>
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-medium">Erro ao carregar dados</p>
          <p className="text-sm mt-1">Verifique a conexão com o Supabase e tente novamente.</p>
        </div>
      </div>
    )
  }
}
