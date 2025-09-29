import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { GetServerSideProps } from 'next'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')

  async function handleAccionar() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/setPowerTrue', { method: 'POST' })
      if (res.status === 401) {
        // session expired or unauthenticated
        setMessage('Sesión expirada. Redirigiendo a login...')
        setLoading(false)
        setTimeout(() => router.push('/login'), 1400)
        return
      }
      if (!res.ok) throw new Error('Failed to set Power to true')
      setMessage('Comando enviado: PowerPC = true')
      // leave feedback in `message`
    } catch (err: any) {
      setMessage('Error: ' + (err?.message ?? String(err)))
      // error shown in `message`
    } finally {
      setLoading(false)
    }
  }

  // (toast removed) feedback is shown via `message`

  // On mount, check /PowerPC; if it returns 200 => show alert "accionando..." (endpoint will toggle to false)
  // Poll remote PowerPC status continuously (reads only, does not mutate)
  const [powerStatus, setPowerStatus] = useState<boolean>(false)
  // (authentication check moved to server-side getServerSideProps)
  useEffect(() => {
    let mounted = true
    let timer: NodeJS.Timeout | number

    async function pollStatus() {
      try {
        const res = await fetch('/PowerPCStatus', { method: 'GET' })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setPowerStatus(Boolean(data?.value))
        }
      } catch (e) {
        // ignore network errors
      }
    }

    // initial poll and then interval
    pollStatus()
    timer = setInterval(pollStatus, 1500)
    return () => { mounted = false; clearInterval(timer as any) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="app-container w-full">
        <Header />

        <main className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Control PowerPC</h2>
              <p className="text-sm text-gray-500 mt-1">Prende dispositivos conectados a la red WiFi</p>
            </div>
            <div className="text-sm text-gray-400">Estado local</div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleAccionar}
                disabled={loading}
                className="btn-primary px-6 py-3 rounded-lg shadow-md disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Accionar'}
              </button>

              {/* Inline secondary status showing current remote value */}
              <div className="text-sm text-gray-500">
                Estado remoto: <span className={powerStatus ? 'text-yellow-700 font-medium' : 'text-gray-400'}>{powerStatus ? 'Accionando' : 'Inactivo'}</span>
              </div>
            </div>
          </div>
        </main>
      </div>

  {/* toast removed; inline feedback is shown via `message` above */}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { verifyToken } = await import('../lib/auth')
  const cookie = ctx.req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('upw_token='))
  const token = match ? match.split('=')[1] : null
  if (!token) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  const data = verifyToken(token)
  if (!data) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
