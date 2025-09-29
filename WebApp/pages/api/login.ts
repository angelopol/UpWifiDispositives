import type { NextApiRequest, NextApiResponse } from 'next'
import { signToken, TOKEN_LIFETIME_SECONDS } from '../../lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { user: envUser, password: envPass } = process.env
  const { user, password } = req.body || {}
  if (!user || !password) return res.status(400).json({ error: 'Missing credentials' })
  if (user !== envUser || password !== envPass) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signToken({ user }, TOKEN_LIFETIME_SECONDS)
  // set HttpOnly cookie
  res.setHeader('Set-Cookie', `upw_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_LIFETIME_SECONDS}`)
  return res.status(200).json({ ok: true })
}
