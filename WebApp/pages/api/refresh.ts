import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, signToken, TOKEN_LIFETIME_SECONDS } from '../../lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('upw_token='))
  const token = match ? match.split('=')[1] : null
  if (!token) return res.status(401).json({ error: 'no token' })
  const data = verifyToken(token)
  if (!data) return res.status(401).json({ error: 'invalid token' })
  // issue new token with fresh expiry
  const newToken = signToken({ user: data.user }, TOKEN_LIFETIME_SECONDS)
  res.setHeader('Set-Cookie', `upw_token=${newToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_LIFETIME_SECONDS}`)
  return res.status(200).json({ ok: true })
}
