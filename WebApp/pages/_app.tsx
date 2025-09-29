import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useRef } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const didRefreshRef = useRef(false)

  useEffect(() => {
    // Guard to ensure this effect runs only once across mounts (React Strict Mode double-invoke)
    if (didRefreshRef.current) return
    didRefreshRef.current = true

    // refresh session on load and then periodically
    async function refresh() {
      try {
        // client-side cooldown to avoid repeated refreshes across tabs or rapid remounts
        // store last refresh in localStorage (ms)
        const COOLDOWN_MS = 1000 * 60 * 60 * 24 // 24 hours
        try {
          const last = Number(localStorage.getItem('upw_last_refresh') || '0')
          const now = Date.now()
          if (last && (now - last) < COOLDOWN_MS) {
            return // skip refresh, recently done
          }
        } catch (err) {
          // ignore localStorage errors (e.g., SSR or blocked storage)
        }

        const res = await fetch('/api/refresh', { method: 'POST', credentials: 'same-origin' })
        if (res.ok) {
          try { localStorage.setItem('upw_last_refresh', String(Date.now())) } catch (e) {}
        }
      } catch (e) {
        // ignore network errors
      }
    }

    // Run once on mount
    refresh()

    // every 30 days (in ms)
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30
    const id = setInterval(refresh, THIRTY_DAYS)
    return () => { clearInterval(id) }
  }, [])

  return <Component {...pageProps} />
}
