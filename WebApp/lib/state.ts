import { initSchema, getStateFromDB, setStateInDB } from './db'

// The app now uses the SQL database as the single source of truth for PowerPC state.
// If the database is unavailable, we fall back to an in-memory value for the
// lifetime of the running process. This keeps the behavior consistent in
// environments where a DB is not configured (development) while ensuring
// production uses durable storage.

let useInMemory = false
let memoryState: { value: boolean } = { value: false }

export async function readState(): Promise<boolean> {
  try {
    await initSchema()
    const dbVal = await getStateFromDB()
    memoryState.value = !!dbVal
    useInMemory = false
    return memoryState.value
  } catch (err) {
    // DB not available; switch to in-memory fallback
    useInMemory = true
    return !!memoryState.value
  }
}

export async function writeState(val: boolean): Promise<boolean> {
  try {
    await initSchema()
    await setStateInDB(!!val)
    memoryState.value = !!val
    useInMemory = false
    return true
  } catch (err) {
    // DB not available; write to in-memory fallback
    useInMemory = true
    memoryState.value = !!val
    return true
  }
}

export function isUsingInMemory() {
  return useInMemory
}
