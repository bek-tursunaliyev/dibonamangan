import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('App crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Nimadir xato ketdi. Iltimos qayta urinib ko'ring.</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" /> Qayta yuklash
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
