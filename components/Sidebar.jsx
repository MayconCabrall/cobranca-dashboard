'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/reguas', label: 'Réguas', icon: '⚙️' },
  { href: '/historico', label: 'Histórico', icon: '📋' },
  { href: '/clientes', label: 'Clientes', icon: '👥' },
  { href: '/configuracoes', label: 'Configurações', icon: '🔧' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="font-bold text-lg">Starman Cobrança</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-gray-400 hover:text-white px-4 py-2 transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
