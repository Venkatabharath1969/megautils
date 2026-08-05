import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5433'),
  database: process.env.PGDATABASE || 'megautils',
  user: process.env.PGUSER || 'megautils',
  password: process.env.PGPASSWORD || '',
  max: 5,
  idleTimeoutMillis: 30000,
})

export default pool
