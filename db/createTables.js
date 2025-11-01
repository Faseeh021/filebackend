import { client } from './config.js'

export async function createTables() {
  try {
    console.log('Creating database tables...')
    
    // Create uploads table
    await client`
      CREATE TABLE IF NOT EXISTS uploads (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        file_type VARCHAR(100),
        uploaded_at TIMESTAMP DEFAULT NOW(),
        user_id VARCHAR(100) DEFAULT 'default_user'
      )
    `
    console.log('✓ uploads table created')
    
    // Create results table
    await client`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        upload_id INTEGER REFERENCES uploads(id) ON DELETE CASCADE,
        configured BOOLEAN DEFAULT false,
        issues_detected INTEGER DEFAULT 0,
        report_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ results table created')
    
    // Create requirements table
    await client`
      CREATE TABLE IF NOT EXISTS requirements (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ requirements table created')
    
    console.log('All database tables created successfully')
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Tables already exist, skipping creation')
    } else {
      throw error
    }
  }
}

