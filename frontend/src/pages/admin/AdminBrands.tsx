import { useEffect, useState } from 'react'
import type { Brand } from '../../lib/types'
import { callApi } from '../../lib/api'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  function load() {
    callApi('adminListBrands').then((res) => setBrands(res.brands ?? []))
  }
  useEffect(load, [])

  async function add() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await callApi('adminUpsertBrand', { brand: { name: name.trim(), sort_order: brands.length } })
      setName('')
      load()
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(b: Brand) {
    await callApi('adminUpsertBrand', { brand: { id: b.id, name: b.name, sort_order: b.sort_order, is_active: !b.is_active } })
    load()
  }

  function startRename(b: Brand) {
    setEditingId(b.id)
    setEditingName(b.name)
  }

  async function saveRename(b: Brand) {
    if (editingName.trim() && editingName.trim() !== b.name) {
      await callApi('adminUpsertBrand', { brand: { id: b.id, name: editingName.trim(), sort_order: b.sort_order, is_active: b.is_active } })
      load()
    }
    setEditingId(null)
  }

  async function remove(id: string) {
    if (!confirm("Brend o'chirilsinmi?")) return
    await callApi('adminDeleteBrand', { brandId: id })
    load()
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Yangi brend nomi (masalan: Lenovo)"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1a1d27] dark:text-white"
        />
        <button onClick={add} disabled={saving} className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-black/5 dark:bg-[#1a1d27] dark:ring-white/10">
            {editingId === b.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveRename(b)}
                className="mr-2 min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-white/10 dark:bg-[#111319] dark:text-white"
              />
            ) : (
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{b.name}</span>
            )}
            <div className="flex flex-shrink-0 items-center gap-2">
              {editingId === b.id ? (
                <>
                  <button onClick={() => saveRename(b)} className="rounded-lg bg-green-50 p-1.5 text-green-600 dark:bg-green-900/30">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg bg-slate-100 p-1.5 text-slate-500 dark:bg-slate-800">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <input type="checkbox" checked={b.is_active} onChange={() => toggleActive(b)} />
                    Faol
                  </label>
                  <button onClick={() => startRename(b)} className="rounded-lg bg-slate-100 p-1.5 dark:bg-slate-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(b.id)} className="rounded-lg bg-red-50 p-1.5 text-red-500 dark:bg-red-900/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {!brands.length && <p className="pt-6 text-center text-sm text-slate-400">Brendlar yo'q</p>}
      </div>
    </div>
  )
}
