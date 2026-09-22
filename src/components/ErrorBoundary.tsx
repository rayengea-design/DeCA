import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// Set right before the one auto-reload below, and cleared once the app has
// been running fine for a bit (see App.tsx) — without that clear, a
// genuinely broken deploy would reload forever instead of showing the
// fallback UI below.
const CHUNK_RELOAD_GUARD_KEY = 'deca-chunk-reload-attempted'

function isChunkLoadError(error: Error): boolean {
  return /dynamically imported module|Loading chunk|Failed to fetch/i.test(error.message)
}

// A user who has the app open in a tab across a deploy will have stale JS
// chunk URLs baked into that page load; navigating to a lazy route then
// fails to fetch a chunk that no longer exists at that hash. React has no
// built-in recovery for an error thrown during render — without this
// boundary, that failure (or any other uncaught render error) blanks the
// entire app with nothing on screen and nothing logged anywhere we'd see it.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error', error, info)
    if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_GUARD_KEY, '1')
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50 px-4 text-center">
          <p className="text-lg font-semibold text-ink-900">Algo ha ido mal</p>
          <p className="max-w-sm text-sm text-ink-400">
            Ha ocurrido un error inesperado. Prueba a recargar la página — si el problema persiste,
            escríbenos por WhatsApp.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export { CHUNK_RELOAD_GUARD_KEY }
