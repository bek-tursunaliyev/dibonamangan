import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import { formatPrice } from '../lib/format'
import { useCompare } from '../lib/CompareContext'

export default function ProductCard({ product }: { product: Product }) {
  const { toggle, isSelected, isFull } = useCompare()
  const selected = isSelected(product.id)
  const img = product.images?.[0]

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-[#1a1d27] dark:ring-white/10">
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {img ? (
          <img src={img} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">💻</div>
        )}
        {product.source === 'user_listing' && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            Ikkinchi qo'l
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white">
            Sotilgan
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link to={`/product/${product.id}`} className="line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-100">
          {product.title}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.price, product.currency)}</span>
        </div>
        <button
          onClick={() => toggle(product.id)}
          disabled={!selected && isFull}
          className={`mt-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
            selected
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {selected ? '✓ Taqqoslashda' : '⚖️ Taqqoslash'}
        </button>
      </div>
    </div>
  )
}
