import { School, Users, CreditCard, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Schools', value: '—', icon: School, color: 'text-blue-brand' },
  { label: 'Active users', value: '—', icon: Users, color: 'text-green-brand' },
  { label: 'Revenue (MTD)', value: '—', icon: CreditCard, color: 'text-amber-brand' },
  { label: 'Growth', value: '—', icon: TrendingUp, color: 'text-orange-brand' },
]

export default function OverviewPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-white/50 text-sm mt-1">Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-navy-800 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/50 text-sm">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-navy-800 rounded-2xl p-6 border border-white/10">
        <h2 className="text-white font-semibold mb-2">Welcome to the console</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Use the sidebar to navigate between Schools, Payments, Plans and Settings.
          Dashboard data will populate once schools are connected.
        </p>
      </div>
    </div>
  )
}
