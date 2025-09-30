import type { NextApiRequest, NextApiResponse } from 'next'
import { readState } from '../../lib/state'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const val = await readState()
    return res.status(200).json({ value: Boolean(val) })
  } catch (err) {
    console.error('PowerPCStatus error:', err)
    return res.status(500).json({ error: 'Failed to read PowerPC status' })
  }
}
