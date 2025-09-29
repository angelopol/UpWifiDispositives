import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'PowerPC.json')

async function readValue(): Promise<boolean> {
  try {
    // check existence
    try {
      await fs.access(dataPath)
    } catch (e) {
      return false
    }
    const raw = await fs.readFile(dataPath, 'utf8')
    const obj = JSON.parse(raw)
    return !!obj.value
  } catch (err) {
    console.error('read error', err)
    return false
  }
}

async function writeValue(val: boolean): Promise<boolean> {
  try {
    await fs.writeFile(dataPath, JSON.stringify({ value: !!val }, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('write error', err)
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const val = await readValue()
  if (val === true) {
    await writeValue(false)
    return res.status(200).json({ status: 'ok' })
  }

  return res.status(401).json({ error: 'no permission' })
}
