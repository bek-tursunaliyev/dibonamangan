import { useEffect, useState } from 'react'
import type { Product } from '../../lib/types'
import { callApi } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { Check, X } from 'lucide-react'

export default function AdminPending() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    callApi('adminListPending').then((res) => setItems(res.products ?? [])).finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function moderate(id: string, status: 'approved' | 'rejected') {
    await callApi('adminModerateListing', { productId: id, status })
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) return <div className="p-4 text-sm text-slate-400">Yuklanmoqda...</div>
  if (!items.length) return <p className="pt-6 text-center text-sm text-slate-400">Kutilayotgan e'lonlar yo'q</p>

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <div key={p.id} className="rounded-2xl bg-white p-3 ring-1 ring-black/5 dark:bg-[#1a1d27] dark:ring-white/10">
          <div className="flex gap-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{p.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.cpu} • {p.ram_gb}GB</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatPrice(p.price, p.currency)}</p>
              {p.seller_contact && <p className="text-xs text-slate-400">Sotuvchi: {p.seller_contact}</p>}
            </div>
          </div>
          <div className="mt-2.5 flex gap-2">
            <button onClick={() => moderate(p.id, 'approved')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white">
              <Check className="h-3.5 w-3.5" /> Tasdiqlash
            </button>
            <button onClick={() => moderate(p.id, 'rejected')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-xs font-semibold text-white">
              <X className="h-3.5 w-3.5" /> Rad etish
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
