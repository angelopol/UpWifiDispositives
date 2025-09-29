import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('upw_token='))
  const token = match ? match.split('=')[1] : null
  if (!token) return res.status(401).json({ authenticated: false })
  const data = verifyToken(token)
  if (!data) return res.status(401).json({ authenticated: false })
  return res.status(200).json({ authenticated: true, user: data.user })
}
