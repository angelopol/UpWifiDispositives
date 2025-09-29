import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, signToken, TOKEN_LIFETIME_SECONDS } from '../../lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('upw_token='))
  const token = match ? match.split('=')[1] : null
  if (!token) return res.status(401).json({ error: 'no token' })
  const data: any = verifyToken(token)
  if (!data) return res.status(401).json({ error: 'invalid token' })

  try {
    // If the token still has a long time remaining, skip issuing a new one.
    // We only refresh when remaining TTL <= 30 days to avoid frequent token churn.
    const now = Math.floor(Date.now() / 1000)
    const exp = typeof data.exp === 'number' ? data.exp : (now + TOKEN_LIFETIME_SECONDS)
    const remaining = exp - now
    const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30
    if (remaining > THIRTY_DAYS_SECONDS) {
      // nothing to do; token has plenty of time left
      return res.status(200).json({ ok: true, refreshed: false })
    }

    // issue new token with fresh expiry
    const newToken = signToken({ user: data.user }, TOKEN_LIFETIME_SECONDS)
    res.setHeader('Set-Cookie', `upw_token=${newToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_LIFETIME_SECONDS}`)
    return res.status(200).json({ ok: true, refreshed: true })
  } catch (err) {
    console.error('refresh error', err)
    return res.status(500).json({ error: 'refresh failed' })
  }
}
