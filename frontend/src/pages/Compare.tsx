import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'
import { formatPrice } from '../lib/format'
import { useCompare } from '../lib/CompareContext'
import { Check, Scale } from 'lucide-react'

const ROWS: { key: keyof Product; label: string; suffix?: string; higherIsBetter?: boolean }[] = [
  { key: 'price', label: 'Narx', higherIsBetter: false },
  { key: 'brand', label: 'Brend' },
  { key: 'cpu', label: 'Protsessor' },
  { key: 'ram_gb', label: 'RAM', suffix: ' GB', higherIsBetter: true },
  { key: 'storage', label: 'Xotira' },
  { key: 'gpu', label: 'Video karta' },
  { key: 'screen_size', label: 'Ekran', suffix: '"' },
  { key: 'condition', label: 'Holati' },
]

export default function Compare() {
  const { ids, toggle, clear } = useCompare()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!ids.length) {
      setProducts([])
      return
    }
    supabase.from('products').select('*').in('id', ids).then(({ data }) => setProducts((data as Product[]) ?? []))
  }, [ids])

  if (!ids.length) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 pt-20 text-center">
        <Scale className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Taqqoslash uchun do'kondan 2-3 ta noutbukni tanlang
        </p>
        <Link to="/" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">
          Do'konga o'tish
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 pb-6 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Taqqoslash</h1>
        <button onClick={clear} className="text-xs text-slate-400">Barchasini tozalash</button>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-black/5 dark:bg-[#1a1d27] dark:ring-white/10">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr>
              <th className="w-28 p-3 text-left text-xs text-slate-400"></th>
              {products.map((p) => (
                <th key={p.id} className="p-3 text-left align-top">
                  <div className="relative mb-2 aspect-square w-20 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover" />}
                  </div>
                  <Link to={`/product/${p.id}`} className="line-clamp-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {p.title}
                  </Link>
                  <button onClick={() => toggle(p.id)} className="mt-1 text-[11px] text-red-500">
                    Olib tashlash
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {ROWS.map((row) => {
              const values = products.map((p) => p[row.key])
              const numeric = values.every((v) => typeof v === 'number') && row.higherIsBetter != null
              let bestIdx = -1
              if (numeric) {
                const nums = values as number[]
                const best = row.higherIsBetter ? Math.max(...nums) : Math.min(...nums)
                bestIdx = nums.indexOf(best)
              }
              return (
                <tr key={row.key}>
                  <td className="p-3 text-xs font-medium text-slate-400">{row.label}</td>
                  {products.map((p, i) => {
                    const raw = p[row.key]
                    if (raw == null || raw === '') return <td key={p.id} className="p-3 text-xs text-slate-300">—</td>
                    const display =
                      row.key === 'price'
                        ? formatPrice(raw as number, p.currency)
                        : row.key === 'condition'
                        ? raw === 'new' ? 'Yangi' : 'Ishlatilgan'
                        : `${raw}${row.suffix ?? ''}`
                    return (
                      <td key={p.id} className={`p-3 text-xs ${i === bestIdx ? 'font-bold text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        <span className="inline-flex items-center gap-1">
                          {display} {i === bestIdx && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
