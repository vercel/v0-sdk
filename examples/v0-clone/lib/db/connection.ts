import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Load environment variables
import { config } from 'dotenv'
config()

let db: any = null

// Try different Neon database URL environment variables
const databaseUrl =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED

// Only initialize database if a database URL is available
if (databaseUrl) {
  console.log('Using PostgreSQL database')
  const client = postgres(databaseUrl)
  db = drizzle(client, { schema })
}

export default db
