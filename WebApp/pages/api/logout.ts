import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  // Clear cookie
  res.setHeader('Set-Cookie', `upw_token=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  return res.status(200).json({ ok: true })
}
