import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')

  async function handleAccionar() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/setPowerTrue', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to set Power to true')
      setMessage('Comando enviado: PowerPC = true')
    } catch (err: any) {
      setMessage('Error: ' + (err?.message ?? String(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold mb-6">Control PowerPC</h1>
      <button
        onClick={handleAccionar}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded shadow disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Accionar'}
      </button>
      {message && <div className="mt-4 text-sm">{message}</div>}
      <div className="mt-6 text-xs text-gray-600">
        Consulta el endpoint <code className="bg-gray-100 px-1 rounded">/PowerPC</code>
      </div>
    </div>
  )
}
