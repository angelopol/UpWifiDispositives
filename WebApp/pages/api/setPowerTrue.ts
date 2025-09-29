import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'
import { verifyToken } from '../../lib/auth'

const dataPath = path.join(process.cwd(), 'data', 'PowerPC.json')

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
    const obj = { value: true }
    await fs.mkdir(path.dirname(dataPath), { recursive: true })
    await fs.writeFile(dataPath, JSON.stringify(obj, null, 2), 'utf8')
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'unable to write file' })
  }
}
