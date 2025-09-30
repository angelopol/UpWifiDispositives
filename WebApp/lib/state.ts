import fs from 'fs/promises'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'PowerPC.json')

let useInMemory = false
let memoryState: { value: boolean } = { value: false }

// Optional KV client (Vercel KV). Initialized lazily when environment variable is present.
let kvClient: any = null
const KV_KEY = 'powerpc:value'

async function tryInitKV(): Promise<boolean> {
  if (kvClient) return true
  // Enable via env var USE_VERCEL_KV or VERCEL_KV
  if (!process.env.USE_VERCEL_KV && !process.env.VERCEL_KV) return false
  try {
    // Use runtime require hidden from bundlers so this package is optional.
    const req = eval("typeof require !== 'undefined' ? require : undefined") as any
    if (!req) return false
    const mod = req('@vercel/kv')
    kvClient = mod.kv || mod.default?.kv
    if (!kvClient) {
      console.warn('Vercel KV module loaded but `kv` export not found')
      kvClient = null
      return false
    }
    console.info('State store: using Vercel KV')
    return true
  } catch (err) {
    console.warn('State store: failed to initialize Vercel KV, falling back', String(err))
    kvClient = null
    return false
  }
}

async function ensureDataDirWritable(): Promise<boolean> {
  if (useInMemory) return false
  try {
    // try create dir and touch file
    await fs.mkdir(path.dirname(dataPath), { recursive: true })
    // if file doesn't exist, create it
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
    // fallback to in-memory
    console.warn('State store: filesystem not writable, falling back to in-memory storage', String(err))
    useInMemory = true
    return false
  }
}

export async function readState(): Promise<boolean> {
  // Try KV first if enabled
  if (await tryInitKV()) {
    try {
      const val = await kvClient.get(KV_KEY)
      // kvClient.get may return null or the raw value
      if (val === null || val === undefined) return false
      // stored as JSON string or primitive
      try {
        return Boolean(typeof val === 'string' ? JSON.parse(val) : val)
      } catch (e) {
        return Boolean(val)
      }
    } catch (e) {
      console.warn('State store: KV read failed, falling through to FS', String(e))
    }
  }

  if (useInMemory) return !!memoryState.value

  try {
    const raw = await fs.readFile(dataPath, 'utf8')
    const obj = JSON.parse(raw || '{}')
    memoryState.value = !!obj.value
    return memoryState.value
  } catch (err) {
    // If file missing or unreadable, try to initialize writable store; else fallback
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
  // Try KV first
  if (await tryInitKV()) {
    try {
      // store JSON to be safe
      await kvClient.set(KV_KEY, JSON.stringify(!!val))
      memoryState.value = !!val
      return true
    } catch (e) {
      console.warn('State store: KV write failed, falling through to FS', String(e))
      // continue to try filesystem fallback
    }
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
    // Switch to in-memory fallback and succeed
    console.warn('State store: write failed, switching to in-memory fallback', String(err))
    useInMemory = true
    memoryState.value = !!val
    return true
  }
}

export function isUsingInMemory() {
  return useInMemory
}
