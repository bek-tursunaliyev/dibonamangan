import { getInitData } from './telegram'

const API_URL = import.meta.env.VITE_API_URL

export async function callApi<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, initData: getInitData(), ...payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi')
  return data
}
