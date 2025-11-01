import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import dotenv from 'dotenv'
import * as schema from './schema.js'

dotenv.config()

// Railway automatically provides DATABASE_URL when PostgreSQL service is linked
// In production, DATABASE_URL should always be provided by Railway
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('✗ ERROR: DATABASE_URL environment variable is not set!')
  console.error('Please ensure PostgreSQL service is linked in Railway.')
  throw new Error('DATABASE_URL is required but not provided')
}

console.log('Database connection string:', connectionString.replace(/:[^:@]+@/, ':***@'))

// Create the connection
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Create the database instance with schema
export const db = drizzle(client, { schema })

// Export the raw client for direct SQL queries
export { client }

// Test connection on import
client`SELECT current_database(), current_schema()`.then(([result]) => {
  console.log('✓ Connected to database:', result.current_database, 'schema:', result.current_schema)
  // Test query to requirements table
  client`SELECT COUNT(*) as count FROM requirements`.then(([countResult]) => {
    console.log('✓ Requirements table accessible, count:', countResult.count)
  }).catch(err => {
    console.error('✗ Requirements table query error:', err.message)
  })
}).catch(err => {
  console.error('✗ Database connection error:', err.message)
})

export default db