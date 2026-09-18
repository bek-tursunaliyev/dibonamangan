import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { callApi } from './api'
import { getTelegramUser, initTelegramApp } from './telegram'
import type { TgUserInfo } from './types'

interface UserCtx {
  user: TgUserInfo | null
  isAdmin: boolean
  loading: boolean
  refresh: () => void
}

const Ctx = createContext<UserCtx>({ user: null, isAdmin: false, loading: true, refresh: () => {} })

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TgUserInfo | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    initTelegramApp()
    const localUser = getTelegramUser()
    if (localUser) setUser(localUser)
    callApi('auth')
      .then((res) => {
        setUser(res.user)
        setIsAdmin(!!res.isAdmin)
      })
      .catch(() => {
        // No valid Telegram session (e.g. opened outside Telegram) — browse as guest
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return <Ctx.Provider value={{ user, isAdmin, loading, refresh: load }}>{children}</Ctx.Provider>
}

export function useUser() {
  return useContext(Ctx)
}
