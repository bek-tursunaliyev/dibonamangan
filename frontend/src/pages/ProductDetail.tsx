import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'
import { formatPrice, discountPercent } from '../lib/format'
import { CATEGORY_ICONS, CATEGORY_TEXT_LABELS } from '../lib/icons'
import { callApi } from '../lib/api'
import { haptic } from '../lib/telegram'
import { ArrowLeft, Heart, Laptop, MessageCircle } from 'lucide-react'

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

  const CategoryIcon = CATEGORY_ICONS[product.category]
  const pct = discountPercent(product.price, product.discount_price)

  return (
    <div className="pb-6">
      <div className="mx-auto max-w-3xl lg:grid lg:grid-cols-2 lg:gap-8 lg:pt-6">
        <div>
          <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 lg:rounded-2xl">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {pct && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                -{pct}%
              </span>
            )}
            {product.images?.length ? (
              <img src={product.images[activeImg]} className="h-full w-full object-cover lg:rounded-2xl" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Laptop className="h-16 w-16 text-slate-300 dark:text-slate-600" />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-2 lg:px-0">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-2 ${activeImg === i ? 'ring-blue-500' : 'ring-transparent'}`}>
                  <img src={img} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 lg:px-0">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white lg:text-2xl">{product.title}</h1>
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
              className="flex-shrink-0"
            >
              <Heart className={`h-6 w-6 ${favorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <CategoryIcon className="h-3.5 w-3.5" /> {CATEGORY_TEXT_LABELS[product.category]}
            </span>
            {product.source === 'user_listing' && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Ikkinchi qo'l e'lon
              </span>
            )}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 lg:text-3xl">
              {formatPrice(product.discount_price ?? product.price, product.currency)}
            </p>
            {pct && (
              <p className="text-sm text-slate-400 line-through">{formatPrice(product.price, product.currency)}</p>
            )}
          </div>

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
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/20"
          >
            <MessageCircle className="h-4 w-4" /> Sotuvchi bilan bog'lanish
          </a>
        </div>
      </div>
    </div>
  )
}
