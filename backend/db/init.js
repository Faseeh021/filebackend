import { getCollection } from './config.js'
import { connectDB } from './config.js'
import { COLLECTIONS } from './schema.js'

const defaultRequirements = [
  'Maximum file size per upload is 20 MB.',
  'Supported file formats: txt, pdf, docx, csv, xlsx, html, jpg, jpeg, png, gif.',
  'Multiple files can be selected and uploaded simultaneously.',
  'Upload progress is displayed in real-time for each file.',
  'Image files (jpg, jpeg, png, gif) are automatically embedded in PDF format when downloaded.',
  'Text files (txt, csv, html) are converted to PDF with preserved content when downloaded.',
  'PDF files are downloaded as-is without any conversion or modification.',
  'Downloaded files maintain the original filename with .pdf extension.',
  'Files can be deleted from the results page using the delete button.',
  'Uploaded files are stored securely on the server until deleted.',
  'Image preview is available for image files during upload.',
  'File information including name, size, and type is displayed in the results table.',
  'All uploaded files can be downloaded in PDF format from the results page.',
]

export async function initDB() {
  try {
    console.log('Initializing database collections...')
    
    // Connect to database
    await connectDB()
    
    // Get collections
    const requirementsCollection = await getCollection(COLLECTIONS.REQUIREMENTS)
    
    // Check if default requirements exist
    const existingRequirements = await requirementsCollection.countDocuments()
    
    if (existingRequirements === 0) {
      console.log('Seeding default requirements...')
      const requirementsToInsert = defaultRequirements.map((description) => ({
        description,
        createdAt: new Date(),
      }))
      
      await requirementsCollection.insertMany(requirementsToInsert)
      console.log('Default requirements inserted')
    } else {
      console.log('Requirements already exist, skipping seed')
    }

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    // Don't throw - allow server to start even if DB init fails
    console.warn('Continuing with server startup despite database initialization warning')
  }
}
