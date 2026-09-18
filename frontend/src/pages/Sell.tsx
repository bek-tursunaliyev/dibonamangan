import { useEffect, useState } from 'react'
import { callApi } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useUser } from '../lib/UserContext'
import { haptic } from '../lib/telegram'
import { CATEGORY_TEXT_LABELS } from '../lib/icons'
import type { Brand } from '../lib/types'
import { Camera, CheckCircle2, Loader2, X } from 'lucide-react'

const CATEGORY_OPTIONS = Object.keys(CATEGORY_TEXT_LABELS)

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Sell() {
  const { user, loading } = useUser()
  const [brands, setBrands] = useState<Brand[]>([])
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    title: '', brand: '', cpu: '', ram_gb: '', storage: '', gpu: '',
    screen_size: '', price: '', category: 'other', description: '', seller_contact: '',
  })

  useEffect(() => {
    supabase.from('brands').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setBrands((data as Brand[]) ?? []))
  }, [])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files).slice(0, 5 - images.length)) {
        const dataUrl = await fileToDataUrl(file)
        const res = await callApi('uploadImage', { dataUrl })
        setImages((prev) => [...prev, res.url])
      }
    } catch {
      alert('Rasm yuklashda xatolik. Iltimos Telegram ilovasi orqali kiring.')
    } finally {
      setUploading(false)
    }
  }

  async function submit() {
    if (!form.title || !form.price) {
      alert('Nomi va narxini kiriting')
      return
    }
    haptic()
    setSubmitting(true)
    try {
      await callApi('createListing', {
        product: {
          ...form,
          ram_gb: form.ram_gb ? Number(form.ram_gb) : null,
          screen_size: form.screen_size ? Number(form.screen_size) : null,
          price: Number(form.price),
          images,
        },
      })
      setDone(true)
    } catch (e: any) {
      alert(e.message || 'Xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6 text-center text-sm text-slate-400">Yuklanmoqda...</div>

  if (!user) {
    return (
      <div className="px-6 pt-20 text-center text-sm text-slate-500 dark:text-slate-400">
        E'lon joylashtirish uchun ilovani Telegram orqali oching.
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 pt-20 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">E'lon yuborildi!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Admin tekshirib chiqqach, e'loningiz do'konda paydo bo'ladi. Buni Profil bo'limidan kuzatishingiz mumkin.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-8 pt-4">
      <h1 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Noutbukingizni soting</h1>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Ma'lumot va rasmlarni yuklang — admin tasdiqlagach e'lon do'konda chiqadi.
      </p>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">Rasmlar (5 tagacha)</label>
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg">
              <img src={img} className="h-full w-full object-cover" />
              <button onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/60 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Field label="Nomi (masalan: ASUS TUF Gaming F15)" value={form.title} onChange={(v) => set('title', v)} required />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Brend</label>
            <select
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white"
            >
              <option value="">Tanlang</option>
              {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <Field label="Narx (so'm)" value={form.price} onChange={(v) => set('price', v)} type="number" required />
        </div>
        <Field label="Protsessor" value={form.cpu} onChange={(v) => set('cpu', v)} placeholder="Intel Core i5-12500H" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="RAM (GB)" value={form.ram_gb} onChange={(v) => set('ram_gb', v)} type="number" />
          <Field label="Xotira" value={form.storage} onChange={(v) => set('storage', v)} placeholder="512GB SSD" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Video karta" value={form.gpu} onChange={(v) => set('gpu', v)} placeholder="RTX 3050" />
          <Field label="Ekran (dyum)" value={form.screen_size} onChange={(v) => set('screen_size', v)} type="number" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Kategoriya</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{CATEGORY_TEXT_LABELS[c as keyof typeof CATEGORY_TEXT_LABELS]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tavsif</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white"
            placeholder="Holati, ishlatilgan muddati va h.k."
          />
        </div>
        <Field label="Telegram username (bog'lanish uchun)" value={form.seller_contact} onChange={(v) => set('seller_contact', v)} placeholder="@username" />
      </div>

      <button
        onClick={submit}
        disabled={submitting || uploading}
        className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"
      >
        {submitting ? 'Yuborilmoqda...' : "E'lonni joylashtirish"}
      </button>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 dark:border-white/10 dark:bg-[#1a1d27] dark:text-white"
      />
    </div>
  )
}
