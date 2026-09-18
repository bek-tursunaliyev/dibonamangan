import { useEffect, useState } from 'react'
import type { Banner } from '../../lib/types'
import { callApi } from '../../lib/api'
import { ImagePlus, Trash2 } from 'lucide-react'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [uploading, setUploading] = useState(false)

  function load() {
    callApi('adminListBanners').then((res) => setBanners(res.banners ?? []))
  }
  useEffect(load, [])

  async function addBanner(file: File) {
    setUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      const { url } = await callApi('uploadImage', { dataUrl })
      await callApi('adminUpsertBanner', { banner: { image_url: url, sort_order: banners.length } })
      load()
    } finally {
      setUploading(false)
    }
  }

  async function update(b: Banner, patch: Partial<Banner>) {
    await callApi('adminUpsertBanner', { banner: { ...b, ...patch } })
    load()
  }

  async function remove(id: string) {
    if (!confirm("O'chirilsinmi?")) return
    await callApi('adminDeleteBanner', { bannerId: id })
    load()
  }

  return (
    <div>
      <label className="mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white">
        <ImagePlus className="h-4 w-4" /> {uploading ? 'Yuklanmoqda...' : "Banner qo'shish"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && addBanner(e.target.files[0])} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white p-3 ring-1 ring-black/5 dark:bg-[#1a1d27] dark:ring-white/10">
            <img src={b.image_url} className="mb-2 aspect-[16/7] w-full rounded-lg object-cover" />
            <input
              defaultValue={b.title ?? ''}
              placeholder="Sarlavha"
              onBlur={(e) => update(b, { title: e.target.value })}
              className="mb-1.5 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-white/10 dark:bg-[#111319] dark:text-white"
            />
            <input
              defaultValue={b.subtitle ?? ''}
              placeholder="Tavsif"
              onBlur={(e) => update(b, { subtitle: e.target.value })}
              className="mb-1.5 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-white/10 dark:bg-[#111319] dark:text-white"
            />
            <input
              defaultValue={b.link_url ?? ''}
              placeholder="Havola (ixtiyoriy)"
              onBlur={(e) => update(b, { link_url: e.target.value })}
              className="mb-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-white/10 dark:bg-[#111319] dark:text-white"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <input type="checkbox" checked={b.is_active} onChange={(e) => update(b, { is_active: e.target.checked })} />
                Faol
              </label>
              <button onClick={() => remove(b.id)} className="flex items-center gap-1 text-xs text-red-500">
                <Trash2 className="h-3.5 w-3.5" /> O'chirish
              </button>
            </div>
          </div>
        ))}
        {!banners.length && <p className="pt-6 text-center text-sm text-slate-400">Bannerlar yo'q</p>}
      </div>
    </div>
  )
}
