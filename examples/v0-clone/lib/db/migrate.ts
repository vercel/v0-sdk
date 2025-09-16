import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

// Load environment variables
import { config } from 'dotenv'
config()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const runMigrate = async (retries = 5, throttleMs = 3000) => {
  // Try different Neon database URL environment variables in order of preference
  const databaseUrl =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED

  if (!databaseUrl) {
    console.log('No database URL found, skipping migrations')
    console.log(
      'Checked: POSTGRES_URL, DATABASE_URL, POSTGRES_URL_NON_POOLING, DATABASE_URL_UNPOOLED',
    )
    return false
  }

  console.log(
    'Using database URL from:',
    process.env.POSTGRES_URL
      ? 'POSTGRES_URL'
      : process.env.DATABASE_URL
        ? 'DATABASE_URL'
        : process.env.POSTGRES_URL_NON_POOLING
          ? 'POSTGRES_URL_NON_POOLING'
          : 'DATABASE_URL_UNPOOLED',
  )

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Running migrations (attempt ${attempt}/${retries})...`)

      // Use a more conservative connection pool for build-time migrations
      const connection = postgres(databaseUrl, {
        max: 1,
        idle_timeout: 20,
        max_lifetime: 60 * 30, // 30 minutes
      })

      const db = drizzle(connection)
      const start = Date.now()

      // Add throttling between migration operations
      await migrate(db, { migrationsFolder: 'lib/db/migrations' })

      const end = Date.now()
      console.log('Migrations completed in', end - start, 'ms')

      // Clean up connection
      await connection.end()
      return true
    } catch (err: any) {
      console.error(`Migration attempt ${attempt} failed`)

      // Check if it's a quota error
      const isQuotaError =
        err?.cause?.code === 'XX000' ||
        err?.message?.includes('quota') ||
        err?.message?.includes('compute time')

      if (isQuotaError) {
        console.log('Database quota exceeded, waiting before retry...')
        if (attempt < retries) {
          const waitTime = throttleMs * Math.pow(2, attempt - 1) // Exponential backoff: 3s, 6s, 12s, 24s
          console.log(`Waiting ${waitTime}ms before retry...`)
          await sleep(waitTime)
          continue
        } else {
          console.log('All retry attempts exhausted due to quota limits')
          console.log(
            'Consider upgrading your database plan or trying deployment later',
          )
          return false
        }
      } else {
        // For non-quota errors, fail immediately
        console.error(err)
        return false
      }
    }
  }

  return false
}

// Only run if called directly (not imported)
if (require.main === module) {
  runMigrate().then((success) => {
    if (success) {
      console.log('Migration completed successfully')
      process.exit(0)
    } else {
      console.log('Migration failed - build cannot continue')
      process.exit(1)
    }
  })
}
