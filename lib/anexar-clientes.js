// Junta os dados do cliente (nome/telefone) em cada envio.
// Necessário porque `faturas` e `clientes` NÃO têm foreign key
// (faturas.client_id = clientes.id_voalle, sem FK de propósito), então o
// PostgREST não consegue aninhar clientes via faturas no select. O join é
// feito aqui no código. Recebe o `supabase` (server ou browser) por parâmetro.
export async function anexarClientes(supabase, envios) {
  const ids = [...new Set(
    (envios ?? []).map(e => e.faturas?.client_id).filter(v => v != null)
  )]
  if (ids.length === 0) return envios ?? []

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id_voalle, nome, telefone')
    .in('id_voalle', ids)

  const mapa = new Map(
    (clientes ?? []).map(c => [c.id_voalle, { nome: c.nome, telefone: c.telefone }])
  )

  return (envios ?? []).map(e => ({
    ...e,
    faturas: e.faturas
      ? { ...e.faturas, clientes: mapa.get(e.faturas.client_id) ?? null }
      : null,
  }))
}
