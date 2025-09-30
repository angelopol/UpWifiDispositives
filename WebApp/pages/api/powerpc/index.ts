import { NextApiRequest, NextApiResponse } from 'next'
import { readState, writeState } from '../../../lib/state'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const val = await readState()
    if (val === true) {
      await writeState(false)
      return res.status(200).json({ status: 'ok' })
    }
    return res.status(401).json({ error: 'no permission' })
  } catch (err) {
    console.error('powerpc handler error', String(err))
    return res.status(500).json({ error: 'internal error' })
  }
}
