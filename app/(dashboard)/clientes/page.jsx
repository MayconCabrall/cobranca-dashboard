import { createClient } from '@/lib/supabase/server'

export default async function ClientesPage({ searchParams }) {
  const supabase = await createClient()
  const { status: statusFiltro } = await searchParams

  let query = supabase
    .from('clientes')
    .select('id, nome, telefone, cpf_cnpj, status', { count: 'exact' })
    .order('nome')
    .range(0, 49)

  if (statusFiltro) query = query.eq('status', statusFiltro)

  const { data: clientes, count } = await query

  const STATUS_COLOR = {
    ativo: 'bg-green-100 text-green-700',
    inativo: 'bg-gray-100 text-gray-500',
    bloqueado: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clientes</h1>
      <p className="text-gray-500 text-sm">{count ?? 0} clientes sincronizados do Voalle</p>
      <div className="flex gap-2">
        {['', 'ativo', 'inativo', 'bloqueado'].map(s => (
          <a
            key={s}
            href={s ? `?status=${s}` : '/clientes'}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${statusFiltro === s || (!statusFiltro && !s) ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
          >
            {s || 'Todos'}
          </a>
        ))}
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Nome', 'Telefone', 'CPF/CNPJ', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(clientes ?? []).map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">{c.nome}</td>
                <td className="px-4 py-3 text-gray-500">{c.telefone}</td>
                <td className="px-4 py-3 text-gray-500">{c.cpf_cnpj}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[c.status] ?? ''}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
            {(clientes ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
