import fs from 'fs/promises'
import path from 'path'
import { getPool, initSchema, getStateFromDB, setStateInDB } from './db'

const dataPath = path.join(process.cwd(), 'data', 'PowerPC.json')

let useInMemory = false
let memoryState: { value: boolean } = { value: false }

async function ensureDataDirWritable(): Promise<boolean> {
  if (useInMemory) return false
  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true })
    try {
      await fs.access(dataPath)
    } catch (e) {
      await fs.writeFile(dataPath, JSON.stringify({ value: false }, null, 2), 'utf8')
    }
    // test write
    const tmp = { value: memoryState.value }
    await fs.writeFile(dataPath, JSON.stringify(tmp, null, 2), 'utf8')
    return true
  } catch (err) {
    console.warn('State store: filesystem not writable, falling back to in-memory storage', String(err))
    useInMemory = true
    return false
  }
}

export async function readState(): Promise<boolean> {
  // Try DB first (MySQL) if configured
  try {
    await initSchema()
    const dbVal = await getStateFromDB()
    memoryState.value = !!dbVal
    return memoryState.value
  } catch (dbErr) {
    // DB not configured or failed; fall through to filesystem
  }

  if (useInMemory) return !!memoryState.value

  try {
    const raw = await fs.readFile(dataPath, 'utf8')
    const obj = JSON.parse(raw || '{}')
    memoryState.value = !!obj.value
    return memoryState.value
  } catch (err) {
    const ok = await ensureDataDirWritable()
    if (!ok) return !!memoryState.value
    try {
      const raw = await fs.readFile(dataPath, 'utf8')
      const obj = JSON.parse(raw || '{}')
      memoryState.value = !!obj.value
      return memoryState.value
    } catch (e) {
      return !!memoryState.value
    }
  }
}

export async function writeState(val: boolean): Promise<boolean> {
  // Try DB first
  try {
    await initSchema()
    await setStateInDB(!!val)
    memoryState.value = !!val
    return true
  } catch (dbErr) {
    // DB not configured or failed; fall through to filesystem
  }

  if (useInMemory) {
    memoryState.value = !!val
    return true
  }

  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true })
    await fs.writeFile(dataPath, JSON.stringify({ value: !!val }, null, 2), 'utf8')
    memoryState.value = !!val
    return true
  } catch (err) {
    console.warn('State store: write failed, switching to in-memory fallback', String(err))
    useInMemory = true
    memoryState.value = !!val
    return true
  }
}

export function isUsingInMemory() {
  return useInMemory
}
