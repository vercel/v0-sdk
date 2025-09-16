import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

// Load environment variables
import { config } from 'dotenv'
config()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    console.log('POSTGRES_URL is not defined, skipping migrations')
    process.exit(0)
  }

  // Retry logic specifically for quota errors
  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = postgres(process.env.POSTGRES_URL, { max: 1 })
      const db = drizzle(connection)

      console.log(`Running migrations... (attempt ${attempt}/${maxRetries})`)

      const start = Date.now()
      await migrate(db, { migrationsFolder: 'lib/db/migrations' })
      const end = Date.now()

      console.log('Migrations completed in', end - start, 'ms')
      await connection.end()
      process.exit(0)
    } catch (err: any) {
      // Check if it's a quota error
      const isQuotaError =
        err?.cause?.code === 'XX000' ||
        err?.message?.includes('quota') ||
        err?.message?.includes('compute time')

      if (isQuotaError && attempt < maxRetries) {
        const waitTime = 5000 * attempt // 5s, 10s, 15s
        console.log(
          `Database quota exceeded. Waiting ${waitTime}ms before retry...`,
        )
        await sleep(waitTime)
        continue
      } else {
        // Either not a quota error, or we've exhausted retries
        throw err
      }
    }
  }
}

runMigrate().catch((err) => {
  console.error('Migration failed')
  console.error(err)
  process.exit(1)
})
