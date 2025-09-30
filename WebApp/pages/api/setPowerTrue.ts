import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../lib/auth'
import { writeState } from '../../lib/state'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Authenticate: read JWT from cookie
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('upw_token='))
  const token = match ? match.split('=')[1] : null
  if (!token) return res.status(401).json({ error: 'unauthenticated' })
  const data = verifyToken(token)
  if (!data) return res.status(401).json({ error: 'invalid token' })

  try {
    const ok = await writeState(true)
    if (!ok) {
      // writeState always returns true (it falls back to in-memory) but keep the check for safety
      console.warn('setPowerTrue: writeState reported failure, but continuing')
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'unable to write file' })
  }
}
