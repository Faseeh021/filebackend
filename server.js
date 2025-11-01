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
    // Try to run migrations if they exist, otherwise just initialize data
    console.log('Checking database...')
    try {
      const migrationsFolder = join(__dirname, 'drizzle')
      const fs = await import('fs')
      if (fs.existsSync(migrationsFolder)) {
        console.log('Running database migrations...')
        await migrate(db, { migrationsFolder })
        console.log('Migrations completed successfully')
      } else {
        console.log('No migrations folder found, skipping migrations')
      }
    } catch (migrationError) {
      console.warn('Migration warning:', migrationError.message)
      console.log('Continuing with database initialization...')
    }
    
    // Initialize data
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
