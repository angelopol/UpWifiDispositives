#!/usr/bin/env node
// Simple DB schema initializer for PowerPC app
// Load .env automatically if present
try { require('dotenv').config() } catch (e) { /* dotenv not installed, ignore */ }
const mysql = require('mysql2/promise')

async function main() {
  const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT = '3306'
  } = process.env

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Please set DB_HOST, DB_USER and DB_NAME environment variables before running this script')
    process.exit(2)
  }

  const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
    waitForConnections: true,
    connectionLimit: 2
  })

  try {
    console.log('Initializing schema...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS powerpc_state (
        id INT PRIMARY KEY CHECK (id = 1),
        value TINYINT(1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `)
    await pool.query(`INSERT IGNORE INTO powerpc_state (id, value) VALUES (1, 0)`)
    console.log('Schema initialized successfully')
  } catch (err) {
    console.error('Failed to initialize schema:', err && err.message ? err.message : String(err))
    process.exit(3)
  } finally {
    await pool.end()
  }
}

main()
