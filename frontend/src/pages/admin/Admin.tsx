import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../../lib/UserContext'
import AdminStats from './AdminStats'
import AdminPending from './AdminPending'
import AdminProducts from './AdminProducts'
import AdminBanners from './AdminBanners'

const TABS = [
  { key: 'stats', label: 'Statistika' },
  { key: 'pending', label: "E'lonlar" },
  { key: 'products', label: 'Mahsulotlar' },
  { key: 'banners', label: 'Bannerlar' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function Admin() {
  const { user, isAdmin, loading } = useUser()
  const [tab, setTab] = useState<TabKey>('stats')

  if (loading) return <div className="p-6 text-center text-sm text-slate-400">Yuklanmoqda...</div>

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 pt-24 text-center">
        <span className="text-4xl">🔒</span>
        <p className="text-sm text-slate-500 dark:text-slate-400">Bu bo'lim faqat administrator uchun</p>
        <Link to="/" className="text-sm font-semibold text-blue-600">Bosh sahifaga qaytish</Link>
      </div>
    )
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <h1 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">🛠️ Admin panel</h1>
      <div className="mb-4 flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && <AdminStats />}
      {tab === 'pending' && <AdminPending />}
      {tab === 'products' && <AdminProducts />}
      {tab === 'banners' && <AdminBanners />}
    </div>
  )
}
