import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Banner, Category, Product } from '../lib/types'
import BannerCarousel from '../components/BannerCarousel'
import ProductCard from '../components/ProductCard'
import { CATEGORY_LABELS } from '../lib/format'
import { useCompare } from '../lib/CompareContext'
import { Link } from 'react-router-dom'

const CATEGORIES: (Category | 'all')[] = ['all', 'gaming', 'business', 'student', 'design', 'office', 'budget']

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [query, setQuery] = useState('')
  const { ids, clear } = useCompare()

  useEffect(() => {
    Promise.all([
      supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
    ]).then(([b, p]) => {
      setBanners((b.data as Banner[]) ?? [])
      setProducts((p.data as Product[]) ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === 'all' || p.category === category
      const matchQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.brand?.toLowerCase().includes(query.toLowerCase())
      return matchCategory && matchQuery
    })
  }, [products, category, query])

  return (
    <div className="pb-6">
      <div className="safe-top px-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">DIBO Computers</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Namangan • Premium noutbuk va PC</p>
          </div>
          <span className="text-2xl">💻</span>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Noutbuk qidirish..."
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 dark:border-white/10 dark:bg-[#1a1d27] dark:text-white"
        />
      </div>

      <BannerCarousel banners={banners} />

      <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              category === c
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-[#1a1d27] dark:text-slate-300 dark:ring-white/10'
            }`}
          >
            {c === 'all' ? "🗂 Barchasi" : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {ids.length > 0 && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <span>{ids.length} ta mahsulot tanlandi</span>
          <div className="flex gap-2">
            <Link to="/compare" className="font-semibold underline">Ko'rish</Link>
            <button onClick={clear} className="text-slate-400">Tozalash</button>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 px-4">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
        {!loading && filtered.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-400">Hech narsa topilmadi</p>
      )}
    </div>
  )
}
