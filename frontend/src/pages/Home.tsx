import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Banner, Brand, Category, Product } from '../lib/types'
import BannerCarousel from '../components/BannerCarousel'
import ProductCard from '../components/ProductCard'
import { CATEGORY_ICONS, CATEGORY_TEXT_LABELS } from '../lib/icons'
import { useCompare } from '../lib/CompareContext'
import { Link } from 'react-router-dom'
import { LayoutGrid, Laptop, Search } from 'lucide-react'

const CATEGORIES: (Category | 'all')[] = ['all', 'gaming', 'business', 'student', 'design', 'office', 'budget']

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [brand, setBrand] = useState<string | 'all'>('all')
  const [query, setQuery] = useState('')
  const { ids, clear } = useCompare()

  useEffect(() => {
    Promise.all([
      supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('brands').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([b, p, br]) => {
      setBanners((b.data as Banner[]) ?? [])
      setProducts((p.data as Product[]) ?? [])
      setBrands((br.data as Brand[]) ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === 'all' || p.category === category
      const matchBrand = brand === 'all' || p.brand?.toLowerCase() === brand.toLowerCase()
      const matchQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.brand?.toLowerCase().includes(query.toLowerCase())
      return matchCategory && matchBrand && matchQuery
    })
  }, [products, category, brand, query])

  return (
    <div className="pb-6">
      <div className="safe-top px-4 pt-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white lg:text-2xl">DIBO Computers</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 lg:text-sm">Namangan • Premium noutbuk va PC</p>
          </div>
          <Laptop className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Noutbuk qidirish..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400 dark:border-white/10 dark:bg-[#1a1d27] dark:text-white"
          />
        </div>
      </div>

      <BannerCarousel banners={banners} />

      <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:px-8">
        <button
          onClick={() => setCategory('all')}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            category === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-[#1a1d27] dark:text-slate-300 dark:ring-white/10'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Barchasi
        </button>
        {CATEGORIES.slice(1).map((c) => {
          const Icon = CATEGORY_ICONS[c as Category]
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-[#1a1d27] dark:text-slate-300 dark:ring-white/10'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {CATEGORY_TEXT_LABELS[c as Category]}
            </button>
          )
        })}
      </div>

      {brands.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto px-4 pb-1 lg:px-8">
          <button
            onClick={() => setBrand('all')}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              brand === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Barcha brendlar
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setBrand(b.name)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                brand.toLowerCase() === b.name.toLowerCase()
                  ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {ids.length > 0 && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 lg:mx-8">
          <span>{ids.length} ta mahsulot tanlandi</span>
          <div className="flex gap-2">
            <Link to="/compare" className="font-semibold underline">Ko'rish</Link>
            <button onClick={clear} className="text-slate-400">Tozalash</button>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:px-8 xl:grid-cols-6">
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
