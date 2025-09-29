import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    let mounted = true
    // refresh session on load and then periodically
    async function refresh() {
      try {
        await fetch('/api/refresh', { method: 'POST' })
      } catch (e) {
        // ignore
      }
    }
    refresh()
    // every 30 days (in ms)
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30
    const id = setInterval(refresh, THIRTY_DAYS)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return <Component {...pageProps} />
}
