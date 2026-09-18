interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
      photo_url?: string
      language_code?: string
    }
  }
  ready: () => void
  expand: () => void
  close: () => void
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
  }
  MainButton: {
    text: string
    show: () => void
    hide: () => void
    setText: (text: string) => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    enable: () => void
    disable: () => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
  }
  showAlert: (message: string) => void
  showConfirm: (message: string, cb: (ok: boolean) => void) => void
  openTelegramLink: (url: string) => void
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null
}

export function getInitData(): string {
  return getTelegramWebApp()?.initData ?? ''
}

export function getTelegramUser() {
  return getTelegramWebApp()?.initDataUnsafe?.user ?? null
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style)
}

export function initTelegramApp() {
  const tg = getTelegramWebApp()
  if (!tg) return
  tg.ready()
  tg.expand()
  document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark')
}
