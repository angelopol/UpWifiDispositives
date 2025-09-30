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
      // File is missing — treat as "false" (safe default) instead of returning 404.
      // In serverless hosts (Vercel) the filesystem may not be writable/persistent;
      // returning false is a safer, idempotent response for clients.
      console.warn('PowerPCStatus: state file not found, returning default false')
      return res.status(200).json({ value: false })
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
