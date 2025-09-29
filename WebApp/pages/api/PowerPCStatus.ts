import fs from 'fs/promises'
import path from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'PowerPC.json')
    try {
      await fs.access(filePath)
    } catch (e) {
      return res.status(404).json({ error: 'State file not found' })
    }

    const raw = await fs.readFile(filePath, 'utf8')
    const json = JSON.parse(raw || '{}')

    // Return the current value without changing the file
    return res.status(200).json({ value: Boolean(json?.value) })
  } catch (err) {
    console.error('PowerPCStatus error:', err)
    return res.status(500).json({ error: 'Failed to read PowerPC status' })
  }
}
