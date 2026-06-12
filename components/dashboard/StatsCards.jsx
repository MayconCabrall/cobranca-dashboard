export default function StatsCards({ stats }) {
  const cards = [
    { label: 'Enviados hoje', value: stats.enviados, color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Falhas hoje', value: stats.falhas, color: 'bg-red-50 border-red-200 text-red-700' },
    { label: 'Pendentes', value: stats.pendentes, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  ]
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ label, value, color }) => (
        <div key={label} className={`border rounded-xl p-6 ${color}`}>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      ))}
    </div>
  )
}
