import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'
import { formatPrice, CATEGORY_LABELS } from '../lib/format'
import { callApi } from '../lib/api'
import { haptic } from '../lib/telegram'

const SPEC_ROWS: { key: keyof Product; label: string; suffix?: string }[] = [
  { key: 'brand', label: 'Brend' },
  { key: 'cpu', label: 'Protsessor' },
  { key: 'ram_gb', label: 'RAM', suffix: ' GB' },
  { key: 'storage', label: 'Xotira' },
  { key: 'gpu', label: 'Video karta' },
  { key: 'screen_size', label: 'Ekran', suffix: '"' },
  { key: 'condition', label: 'Holati' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImg, setActiveImg] = useState(0)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => setProduct(data as Product))
  }, [id])

  if (!product) return <div className="p-6 text-center text-sm text-slate-400">Yuklanmoqda...</div>

  const contactUrl = product.seller_contact
    ? `https://t.me/${product.seller_contact.replace('@', '')}`
    : 'https://t.me/DIBO_ADM1N'

  return (
    <div className="pb-6">
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
        >
          ←
        </button>
        {product.images?.length ? (
          <img src={product.images[activeImg]} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">💻</div>
        )}
      </div>
      {product.images?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-2">
          {product.images.map((img, i) => (
            <button key={i} onClick={() => setActiveImg(i)} className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-2 ${activeImg === i ? 'ring-blue-500' : 'ring-transparent'}`}>
              <img src={img} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="px-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{product.title}</h1>
          <button
            onClick={async () => {
              haptic()
              try {
                const res = await callApi('toggleFavorite', { productId: product.id })
                setFavorited(res.favorited)
              } catch {
                alert("Sevimlilarga qo'shish uchun Telegram orqali kiring")
              }
            }}
            className="flex-shrink-0 text-2xl"
          >
            {favorited ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {CATEGORY_LABELS[product.category]}
          </span>
          {product.source === 'user_listing' && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              Ikkinchi qo'l e'lon
            </span>
          )}
        </div>
        <p className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">{formatPrice(product.price, product.currency)}</p>

        <div className="mt-4 divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-black/5 dark:divide-white/5 dark:bg-[#1a1d27] dark:ring-white/10">
          {SPEC_ROWS.map((row) => {
            const value = product[row.key]
            if (value == null || value === '') return null
            return (
              <div key={row.key} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {row.key === 'condition' ? (value === 'new' ? 'Yangi' : 'Ishlatilgan') : `${value}${row.suffix ?? ''}`}
                </span>
              </div>
            )
          })}
        </div>

        {product.description && (
          <div className="mt-4">
            <h2 className="mb-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">Tavsif</h2>
            <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
          </div>
        )}

        <a
          href={contactUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
        >
          📩 Sotuvchi bilan bog'lanish
        </a>
      </div>
    </div>
  )
}
