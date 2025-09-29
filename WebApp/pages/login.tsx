import { useState } from 'react'
import { useRouter } from 'next/router'
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
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user, password }) })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Login failed')
      }
      // cookie set by server; redirect
      router.push('/')
    } catch (err: any) {
      setError(err?.message ?? String(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Header />
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Login</h3>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input autoFocus value={user} onChange={e => setUser(e.target.value)} placeholder="Usuario" className="input" />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" className="input" />
            <button disabled={!user.trim() || !password} className="btn-primary disabled:opacity-50" type="submit">Entrar</button>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!error && (!user.trim() || !password) && <div className="text-sm text-gray-500">Introduce usuario y contraseña para continuar</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
