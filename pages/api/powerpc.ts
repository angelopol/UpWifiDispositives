import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'PowerPC.json')

function readValue(): boolean {
  try {
    if (!fs.existsSync(dataPath)) return false
    const raw = fs.readFileSync(dataPath, 'utf8')
    const obj = JSON.parse(raw)
    return !!obj.value
  } catch (err) {
    console.error('read error', err)
    return false
  }
}

function writeValue(val: boolean): boolean {
  try {
    fs.writeFileSync(dataPath, JSON.stringify({ value: !!val }, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('write error', err)
    return false
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const val = readValue()
  if (val === true) {
    writeValue(false)
    return res.status(200).json({ status: 'ok' })
  }

  return res.status(401).json({ error: 'no permission' })
}
