import { useEffect, useState } from 'react'
import { callApi } from '../../lib/api'
import { Bot, Clock, Laptop, Users } from 'lucide-react'

export default function AdminStats() {
  const [stats, setStats] = useState<{ usersCount: number; productsCount: number; pendingCount: number; quizCount: number } | null>(null)

  useEffect(() => {
    callApi('adminStats').then(setStats).catch(() => {})
  }, [])

  if (!stats) return <div className="p-4 text-sm text-slate-400">Yuklanmoqda...</div>

  const cards = [
    { label: 'Foydalanuvchilar', value: stats.usersCount, Icon: Users },
    { label: 'Faol mahsulotlar', value: stats.productsCount, Icon: Laptop },
    { label: "Kutilayotgan e'lonlar", value: stats.pendingCount, Icon: Clock },
    { label: 'AI so’rovlari', value: stats.quizCount, Icon: Bot },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-[#1a1d27] dark:ring-white/10">
          <c.Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{c.value}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
