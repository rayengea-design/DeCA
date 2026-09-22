import { useEffect } from 'react'

/** Sets the tab title and meta description for the current route. The
 * static tags in index.html cover the landing page (what matters most for
 * ranking and for link-preview cards, since those are read without running
 * JS); this covers every other route for the crawlers and in-app browser
 * chrome that do run it, without pulling in a router-head library for what
 * is, in this app, a handful of routes. Restores the landing page's
 * defaults on unmount so navigating away doesn't leave a stale title. */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    let meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? null
    if (description) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }

    return () => {
      document.title = previousTitle
      if (description && meta && previousDescription !== null) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [title, description])
}
