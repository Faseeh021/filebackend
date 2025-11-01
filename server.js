import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import uploadRoutes from './routes/upload.js'
import resultsRoutes from './routes/results.js'
import requirementsRoutes from './routes/requirements.js'
import { initDB } from './db/init.js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './db/config.js'
import { createTables } from './db/createTables.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
// CORS configuration - allow Vercel frontend and local development
const corsOptions = {
  origin: [
    'https://filemanagements.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploaded images
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// Routes
app.use('/api/upload', uploadRoutes)
app.use('/api/results', resultsRoutes)
app.use('/api/requirements', requirementsRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Initialize database on startup
async function startServer() {
  try {
    console.log('Checking database...')
    
    // Create tables first (if they don't exist)
    try {
      console.log('Attempting to create database tables...')
      await createTables()
      console.log('✓ Database tables created or verified')
    } catch (createError) {
      console.error('✗ Table creation error:', createError.message)
      console.error('Error details:', createError)
      // Try migrations as fallback
      try {
        const migrationsFolder = join(__dirname, 'drizzle')
        const fs = await import('fs')
        if (fs.existsSync(migrationsFolder)) {
          console.log('Trying database migrations instead...')
          await migrate(db, { migrationsFolder })
          console.log('Migrations completed successfully')
        } else {
          console.error('No migrations folder found and table creation failed')
        }
      } catch (migrationError) {
        console.error('Migration error:', migrationError.message)
      }
    }
    
    // Initialize data (seed requirements, etc.)
    await initDB()
    console.log('Database initialized successfully')
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Run 'npm run db:studio' to open Drizzle Studio`)
    })
  } catch (error) {
    console.error('Failed to initialize database:', error)
    // Try to start server anyway
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (database may not be fully initialized)`)
    })
  }
}

startServer()
