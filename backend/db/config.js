import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

// Database connection string
let connectionString = process.env.DATABASE_URL || 'mongodb://localhost:27017/project'

// Ensure database name is included in connection string
if (connectionString.includes('mongodb+srv://')) {
  // For Atlas, ensure database name is in the path
  // Pattern: mongodb+srv://user:pass@host/dbname?options
  // Check if database name exists (should be between the last / and ?)
  const urlParts = connectionString.split('/')
  if (urlParts.length >= 4) {
    // Check if there's a database name part (not empty, not just query params)
    const lastPart = urlParts[urlParts.length - 1]
    // If last part starts with ? or is empty, we need to add database name
    if (!lastPart || lastPart.startsWith('?') || lastPart.trim() === '') {
      const dbName = process.env.DB_NAME || 'project'
      // Insert database name before query string
      if (connectionString.includes('?')) {
        connectionString = connectionString.replace(/\?(.+)$/, `/${dbName}?$1`)
      } else {
        // Remove trailing slash if present, then add db name
        connectionString = connectionString.replace(/\/+$/, '') + `/${dbName}`
      }
      console.log('✓ Added database name to connection string')
    }
  }
}

console.log('Database connection string:', connectionString.replace(/:[^:@]+@/, ':***@'))

// Create MongoDB client with enhanced settings for Atlas
// Note: mongodb+srv:// automatically uses TLS, so we don't need to set tls explicitly
const clientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 30000, // Increased timeout for Atlas
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  // Force IPv4 for Node.js v17+ compatibility
  family: 4,
  // MongoDB Atlas uses TLS automatically with mongodb+srv://
  // Don't set tls explicitly as it can cause conflicts
  // ...(connectionString.includes('mongodb+srv://') ? {} : {
  //   tls: false
  // })
}

// Create MongoDB client
const client = new MongoClient(connectionString, clientOptions)

// Connect to MongoDB
let db = null
let isConnecting = false

export async function connectDB() {
  try {
    if (!db && !isConnecting) {
      isConnecting = true
      // Try to connect with retry logic
      let retries = 3
      let lastError = null
      
      while (retries > 0) {
        try {
          // Close any existing connection first to start fresh
          if (client.topology && client.topology.isConnected()) {
            try {
              await client.close()
            } catch (closeError) {
              // Ignore close errors
            }
          }
          
          // Connect to MongoDB
          await client.connect()
          
          // Extract database name
          const dbName = process.env.DB_NAME || 
            (connectionString.includes('/') 
              ? connectionString.split('/').pop().split('?')[0] 
              : 'project') || 'project'
          
          db = client.db(dbName)
          
          console.log('✓ Connected to MongoDB database:', db.databaseName)
          
          // Test connection with a simple operation
          await db.admin().ping()
          console.log('✓ Database ping successful')
          
          // Verify we can access collections
          const collections = await db.listCollections().toArray()
          console.log(`✓ Found ${collections.length} collections`)
          
          isConnecting = false
          break // Success, exit retry loop
        } catch (connectError) {
          lastError = connectError
          retries--
          if (retries > 0) {
            console.log(`⚠ Connection attempt failed: ${connectError.message}`)
            console.log(`⚠ Retrying... (${retries} attempts left)`)
            await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds before retry
          } else {
            isConnecting = false
          }
        }
      }
      
      if (!db && lastError) {
        isConnecting = false
        throw lastError
      }
    } else if (isConnecting) {
      // Wait for existing connection attempt
      let waitCount = 0
      while (isConnecting && waitCount < 30) {
        await new Promise(resolve => setTimeout(resolve, 100))
        waitCount++
      }
    }
    
    return db
  } catch (error) {
    console.error('✗ Database connection error:', error.message)
    console.error('Error details:', {
      code: error.code,
      name: error.name,
      message: error.message
    })
    
    // Provide helpful error messages
    if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('alert internal error')) {
      console.error('\n💡 MongoDB Atlas Connection Error - Fix Required:')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('This error indicates MongoDB Atlas is blocking your connection.')
      console.error('\n📋 Steps to Fix:')
      console.error('1. Go to: https://cloud.mongodb.com')
      console.error('2. Select your project/cluster')
      console.error('3. Click "Network Access" in the left sidebar')
      console.error('4. Click "Add IP Address" button')
      console.error('5. Click "Allow Access from Anywhere" (adds 0.0.0.0/0)')
      console.error('6. Click "Confirm"')
      console.error('7. Wait 1-2 minutes for changes to take effect')
      console.error('8. Restart your server')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } else if (error.message.includes('authentication') || error.message.includes('credentials')) {
      console.error('\n💡 Authentication Error:')
      console.error('Check your MongoDB Atlas username and password in the connection string.')
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      console.error('\n💡 DNS/Network Error:')
      console.error('Check your internet connection and MongoDB Atlas cluster URL.')
    }
    
    throw error
  }
}

// Get database instance (ensure connection)
export async function getDB() {
  if (!db) {
    try {
      await connectDB()
    } catch (error) {
      // If connection fails, try to reset and reconnect
      console.log('⚠ Database connection failed, attempting to reset...')
      try {
        // Close existing connection if any
        if (client.topology && client.topology.isConnected()) {
          await client.close()
        }
        // Reset connection state
        db = null
        isConnecting = false
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000))
        // Try to reconnect
        await connectDB()
      } catch (retryError) {
        console.error('✗ Reconnection attempt failed:', retryError.message)
        throw retryError
      }
    }
  }
  
  // Verify connection is still valid (only if db exists)
  if (db) {
    try {
      await db.admin().ping()
    } catch (pingError) {
      console.log('⚠ Database ping failed, connection may be lost')
      // Don't throw - let the next operation retry
      db = null
      isConnecting = false
    }
  }
  
  return db
}

// Get MongoDB client for advanced operations
export function getClient() {
  return client
}

// Export collections helper
export async function getCollection(collectionName) {
  try {
    const database = await getDB()
    if (!database) {
      throw new Error('Database connection not available')
    }
    return database.collection(collectionName)
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error.message)
    throw error
  }
}

export default db
