import { createContext, useContext, useState, type ReactNode } from 'react'

const MAX_COMPARE = 3

interface CompareCtx {
  ids: string[]
  toggle: (id: string) => void
  clear: () => void
  isSelected: (id: string) => boolean
  isFull: boolean
}

const Ctx = createContext<CompareCtx>({ ids: [], toggle: () => {}, clear: () => {}, isSelected: () => false, isFull: false })

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('compare_ids') || '[]')
    } catch {
      return []
    }
  })

  const persist = (next: string[]) => {
    setIds(next)
    try {
      sessionStorage.setItem('compare_ids', JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const toggle = (id: string) => {
    if (ids.includes(id)) {
      persist(ids.filter((x) => x !== id))
    } else if (ids.length < MAX_COMPARE) {
      persist([...ids, id])
    }
  }

  const clear = () => persist([])

  return (
    <Ctx.Provider value={{ ids, toggle, clear, isSelected: (id) => ids.includes(id), isFull: ids.length >= MAX_COMPARE }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCompare() {
  return useContext(Ctx)
}
