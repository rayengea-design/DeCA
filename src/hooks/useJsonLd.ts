import { useEffect } from 'react'

/** Injects a JSON-LD <script> into <head> for the current route and removes
 * it on unmount. The landing page ships its schema statically in index.html
 * (read without running JS); this covers the JS-rendered marketing routes
 * like the guides, whose schema Google reads when it renders the page. The
 * data is stringified inside the effect, so callers can pass a fresh object
 * literal each render without needing to memoize it. */
export function useJsonLd(id: string, data: unknown) {
  const serialized = JSON.stringify(data)

  useEffect(() => {
    if (!serialized || serialized === '{}') return

    document.getElementById(id)?.remove()

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    script.textContent = serialized
    document.head.appendChild(script)

    return () => {
      document.getElementById(id)?.remove()
    }
  }, [id, serialized])
}
