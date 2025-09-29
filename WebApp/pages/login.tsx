import { useState } from 'react'
import { useRouter } from 'next/router'
import type { GetServerSideProps } from 'next'
import Header from '../components/Header'

export default function LoginPage() {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function submit(e: any) {
    e.preventDefault()
    setError('')
    // simple client-side validation
    if (!user.trim() || !password) {
      setError('Usuario y contraseña son obligatorios')
      return
    }
    try {
      const res = await fetch('/api/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user, password }) })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Login failed')
      }
      // ensure cookie is set and server recognizes session before redirecting
      const me = await fetch('/api/me', { method: 'GET', credentials: 'same-origin' })
      if (!me.ok) throw new Error('No session after login')
      router.replace('/')
    } catch (err: any) {
      setError(err?.message ?? String(err))
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="app-container w-full">
        <Header />

        <div className="flex-1 flex items-center justify-center py-0">
          <div className="w-full">
            <div className="card w-full">
              <h3 className="text-2xl font-semibold mb-4">Acceso</h3>
              <p className="text-sm text-gray-500 mb-6">Introduce tus credenciales para acceder al panel de control</p>

              <form onSubmit={submit} className="flex flex-col gap-4" aria-label="login-form">
                <label className="text-sm text-gray-600">Usuario</label>
                <input autoFocus value={user} onChange={e => setUser(e.target.value)} placeholder="Usuario" className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-300" />

                <label className="text-sm text-gray-600">Contraseña</label>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-300" />

                <button disabled={!user.trim() || !password} className="btn-primary disabled:opacity-50 py-2 rounded-md" type="submit">Entrar</button>

                {error ? (
                  <div className="text-sm text-red-600 mt-1">{error}</div>
                ) : (
                  <div className="text-sm text-gray-500">Introduce usuario y contraseña para continuar</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // If a valid token cookie exists, redirect to index so logged-in users don't see login page
  const cookie = ctx.req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('upw_token='))
  const token = match ? match.split('=')[1] : null
  if (!token) return { props: {} }
  try {
    const { verifyToken } = await import('../lib/auth')
    const data = verifyToken(token)
    if (data) {
      return { redirect: { destination: '/', permanent: false } }
    }
  } catch (err) {
    // ignore and render login
  }
  return { props: {} }
}
