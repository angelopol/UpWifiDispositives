import fs from 'fs'
import path from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'PowerPC.json')
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'State file not found' })
    }

    const raw = fs.readFileSync(filePath, 'utf8')
    const json = JSON.parse(raw || '{}')

    // Return the current value without changing the file
    return res.status(200).json({ value: Boolean(json?.value) })
  } catch (err) {
    console.error('PowerPCStatus error:', err)
    return res.status(500).json({ error: 'Failed to read PowerPC status' })
  }
}
