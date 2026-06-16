// Rota server-side que dispara a Edge Function sync-clientes.
// O dashboard chama /api/sync (mesma origem) -> aqui no servidor chamamos a
// Edge Function. Como é servidor-pra-servidor, NÃO há preflight CORS (que o
// gateway do Supabase engole). A Edge Function está com verify_jwt desligado;
// ainda assim mandamos a apikey/Authorization (anon) que o gateway exige.

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // o sync varre ~15 páginas; pode demorar

export async function POST() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!base || !key) {
    return Response.json({ error: 'env_supabase_ausente' }, { status: 500 })
  }

  try {
    const res = await fetch(`${base}/functions/v1/sync-clientes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        'Content-Type': 'application/json',
      },
    })
    // Repassa corpo e status da função, tal e qual.
    const body = await res.text()
    return new Response(body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return Response.json(
      { error: 'falha_ao_chamar_funcao', detail: String(e) },
      { status: 502 },
    )
  }
}
