import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Header(){
  const version = process.env.NEXT_PUBLIC_VERSION || 'v0.1'
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)

  async function handleLogout() {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' })
    } catch (e) {
      // ignore
    }
    // redirect to login
    router.push('/login')
  }

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const res = await fetch('/api/me', { method: 'GET', credentials: 'same-origin' })
        if (!mounted) return
        if (res.ok) {
          const json = await res.json()
          setAuthed(Boolean(json?.authenticated))
        } else {
          setAuthed(false)
        }
      } catch (e) {
        if (mounted) setAuthed(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [])

  return (
    <header className="w-full mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">PW</div>
        <div>
          <div className="text-lg font-semibold">PowerESP Control</div>
          <div className="text-xs text-gray-500">Controla dispositivos conectados por WiFi</div>
        </div>
      </div>
      <nav className="text-sm text-gray-600 flex items-center gap-4">
        {authed && <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Cerrar sesión</button>}
      </nav>
    </header>
  )
}
