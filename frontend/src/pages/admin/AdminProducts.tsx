import { useEffect, useState } from 'react'
import type { Brand, Product } from '../../lib/types'
import { callApi } from '../../lib/api'
import { formatPrice, discountPercent } from '../../lib/format'
import { CATEGORY_TEXT_LABELS } from '../../lib/icons'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Camera, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'

const CATEGORY_OPTIONS = Object.keys(CATEGORY_TEXT_LABELS)
const TAG_OPTIONS = ['gaming', 'design', 'programming', 'office', 'student', 'browsing', 'perf-light', 'perf-medium', 'perf-high']

const STATUS_OPTIONS = [
  { value: 'approved', label: 'Faol' },
  { value: 'pending', label: "Ko'rib chiqilmoqda" },
  { value: 'rejected', label: 'Rad etilgan' },
  { value: 'sold', label: 'Sotilgan' },
]

const emptyForm = {
  id: '', title: '', brand: '', cpu: '', ram_gb: '', storage: '', gpu: '', screen_size: '',
  price: '', discount_price: '', currency: 'UZS', category: 'other', condition: 'new', description: '', in_stock: true,
  status: 'approved', images: [] as string[], tags: [] as string[],
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [editing, setEditing] = useState<typeof emptyForm | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function load() {
    callApi('adminListProducts').then((res) => setProducts(res.products ?? []))
    supabase.from('brands').select('*').order('sort_order').then(({ data }) => setBrands((data as Brand[]) ?? []))
  }

  useEffect(load, [])

  function startEdit(p?: Product) {
    if (p) {
      setEditing({
        id: p.id, title: p.title, brand: p.brand ?? '', cpu: p.cpu ?? '', ram_gb: String(p.ram_gb ?? ''),
        storage: p.storage ?? '', gpu: p.gpu ?? '', screen_size: String(p.screen_size ?? ''),
        price: String(p.price), discount_price: p.discount_price != null ? String(p.discount_price) : '',
        currency: p.currency, category: p.category, condition: p.condition, status: p.status,
        description: p.description ?? '', in_stock: p.in_stock, images: p.images ?? [], tags: p.tags ?? [],
      })
    } else {
      setEditing({ ...emptyForm })
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length || !editing) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const dataUrl = await fileToDataUrl(file)
        const res = await callApi('uploadImage', { dataUrl })
        setEditing((prev) => prev && { ...prev, images: [...prev.images, res.url] })
      }
    } finally {
      setUploading(false)
    }
  }

  function toggleTag(tag: string) {
    setEditing((prev) => {
      if (!prev) return prev
      const has = prev.tags.includes(tag)
      return { ...prev, tags: has ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag] }
    })
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    try {
      await callApi('adminUpsertProduct', {
        product: {
          ...editing,
          id: editing.id || undefined,
          ram_gb: editing.ram_gb ? Number(editing.ram_gb) : null,
          screen_size: editing.screen_size ? Number(editing.screen_size) : null,
          price: Number(editing.price),
          discount_price: editing.discount_price ? Number(editing.discount_price) : null,
        },
      })
      setEditing(null)
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Rostdan ham o'chirilsinmi?")) return
    await callApi('adminDeleteProduct', { productId: id })
    load()
  }

  if (editing) {
    const priceNum = Number(editing.price) || 0
    const discountNum = editing.discount_price ? Number(editing.discount_price) : null
    const pct = discountPercent(priceNum, discountNum)
    return (
      <div className="mx-auto max-w-xl">
        <button onClick={() => setEditing(null)} className="mb-3 flex items-center gap-1 text-xs text-slate-400">
          <ArrowLeft className="h-3.5 w-3.5" /> Orqaga
        </button>
        <div className="flex flex-wrap gap-2">
          {editing.images.map((img, i) => (
            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg">
              <img src={img} className="h-full w-full object-cover" />
              <button onClick={() => setEditing((p) => p && { ...p, images: p.images.filter((_, idx) => idx !== i) })} className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/60 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </label>
        </div>

        <div className="mt-3 space-y-2.5">
          <Input label="Nomi" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Brend</label>
              <select value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white">
                <option value="">Tanlang</option>
                {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <Input label="Narx" value={editing.price} onChange={(v) => setEditing({ ...editing, price: v })} type="number" />
          </div>
          <div>
            <Input label="Chegirmali narx (ixtiyoriy)" value={editing.discount_price} onChange={(v) => setEditing({ ...editing, discount_price: v })} type="number" />
            {pct != null && <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">-{pct}% chegirma foydalanuvchiga ko'rinadi</p>}
          </div>
          <Input label="Protsessor" value={editing.cpu} onChange={(v) => setEditing({ ...editing, cpu: v })} />
          <div className="grid grid-cols-2 gap-2.5">
            <Input label="RAM (GB)" value={editing.ram_gb} onChange={(v) => setEditing({ ...editing, ram_gb: v })} type="number" />
            <Input label="Xotira" value={editing.storage} onChange={(v) => setEditing({ ...editing, storage: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Input label="GPU" value={editing.gpu} onChange={(v) => setEditing({ ...editing, gpu: v })} />
            <Input label="Ekran" value={editing.screen_size} onChange={(v) => setEditing({ ...editing, screen_size: v })} type="number" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Kategoriya</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white">
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_TEXT_LABELS[c as keyof typeof CATEGORY_TEXT_LABELS]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Holati</label>
              <select value={editing.condition} onChange={(e) => setEditing({ ...editing, condition: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white">
                <option value="new">Yangi</option>
                <option value="used">Ishlatilgan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Status</label>
            <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white">
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">AI teglari (tavsiya tizimi uchun)</label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`rounded-full px-2.5 py-1 text-[11px] ${editing.tags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Tavsif</label>
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={editing.in_stock} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} />
            Sotuvda mavjud
          </label>
        </div>

        <button onClick={save} disabled={saving} className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => startEdit()} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white">
        <Plus className="h-4 w-4" /> Yangi mahsulot qo'shish
      </button>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-2.5 ring-1 ring-black/5 dark:bg-[#1a1d27] dark:ring-white/10">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium text-slate-800 dark:text-slate-100">{p.title}</p>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{formatPrice(p.discount_price ?? p.price, p.currency)}</p>
              <p className="text-[10px] text-slate-400">{p.source === 'user_listing' ? "Foydalanuvchi e'loni" : "Do'kon"} • {STATUS_OPTIONS.find((s) => s.value === p.status)?.label}</p>
            </div>
            <button onClick={() => startEdit(p)} className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => remove(p.id)} className="rounded-lg bg-red-50 p-2 text-red-500 dark:bg-red-900/30">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white" />
    </div>
  )
}
