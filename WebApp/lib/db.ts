import mysql from 'mysql2/promise'

const {
  DB_HOST = '',
  DB_USER = '',
  DB_PASSWORD = '',
  DB_NAME = '',
  DB_PORT = '3306'
} = process.env

let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (pool) return pool
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('Database environment variables not set (DB_HOST, DB_USER, DB_NAME)')
  }
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  })
  return pool
}

export async function initSchema() {
  const p = getPool()
  await p.query(`
    CREATE TABLE IF NOT EXISTS powerpc_state (
      id INT PRIMARY KEY CHECK (id = 1),
      value TINYINT(1) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `)
  // ensure a single row exists
  await p.query(`INSERT IGNORE INTO powerpc_state (id, value) VALUES (1, 0)`)
}

export async function getStateFromDB(): Promise<boolean> {
  const p = getPool()
  const [rows] = await p.query('SELECT value FROM powerpc_state WHERE id = 1 LIMIT 1')
  const r: any = Array.isArray(rows) && rows[0] ? rows[0] : null
  return !!(r && r.value)
}

export async function setStateInDB(val: boolean): Promise<void> {
  const p = getPool()
  await p.query('UPDATE powerpc_state SET value = ? WHERE id = 1', [val ? 1 : 0])
}
