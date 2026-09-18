import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../lib/UserContext'
import { callApi } from '../lib/api'
import type { Product } from '../lib/types'
import { formatPrice } from '../lib/format'

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  pending: { text: 'Ko’rib chiqilmoqda', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  approved: { text: 'Faol', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  rejected: { text: 'Rad etildi', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  sold: { text: 'Sotildi', cls: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
}

export default function Profile() {
  const { user, isAdmin, loading } = useUser()
  const [listings, setListings] = useState<Product[]>([])
  const [favorites, setFavorites] = useState<Product[]>([])
  const [tab, setTab] = useState<'listings' | 'favorites'>('listings')

  useEffect(() => {
    if (!user) return
    callApi('myProfile').then((res) => {
      setListings(res.listings ?? [])
      setFavorites(res.favorites ?? [])
    }).catch(() => {})
  }, [user])

  if (loading) return <div className="p-6 text-center text-sm text-slate-400">Yuklanmoqda...</div>

  if (!user) {
    return (
      <div className="px-6 pt-20 text-center text-sm text-slate-500 dark:text-slate-400">
        Profilni ko'rish uchun ilovani Telegram orqali oching.
      </div>
    )
  }

  return (
    <div className="px-4 pb-8 pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xl font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
          {user.photo_url ? <img src={user.photo_url} className="h-full w-full object-cover" /> : (user.first_name?.[0] ?? '👤')}
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            {user.first_name} {user.last_name}
          </h1>
          {user.username && <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>}
        </div>
      </div>

      {isAdmin && (
        <Link to="/admin" className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-blue-600">
          🛠️ Admin panel
          <span>→</span>
        </Link>
      )}

      <div className="mt-6 flex gap-2">
        <TabButton active={tab === 'listings'} onClick={() => setTab('listings')}>Mening e'lonlarim ({listings.length})</TabButton>
        <TabButton active={tab === 'favorites'} onClick={() => setTab('favorites')}>Sevimlilar ({favorites.length})</TabButton>
      </div>

      <div className="mt-3 space-y-2.5">
        {(tab === 'listings' ? listings : favorites).map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-3 rounded-xl bg-white p-2.5 ring-1 ring-black/5 dark:bg-[#1a1d27] dark:ring-white/10">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-slate-800 dark:text-slate-100">{p.title}</p>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{formatPrice(p.price, p.currency)}</p>
            </div>
            {tab === 'listings' && (
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_LABEL[p.status].cls}`}>
                {STATUS_LABEL[p.status].text}
              </span>
            )}
          </Link>
        ))}
        {(tab === 'listings' ? listings : favorites).length === 0 && (
          <p className="pt-6 text-center text-sm text-slate-400">Bo'sh</p>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      }`}
    >
      {children}
    </button>
  )
}
