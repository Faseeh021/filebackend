// MongoDB schema definitions
// These are used for reference and validation

export const UploadSchema = {
  filename: String,
  originalFilename: String,
  filePath: String,
  fileSize: Number,
  fileType: String,
  uploadedAt: Date,
  userId: String,
}

export const ResultSchema = {
  uploadId: Object, // MongoDB ObjectId reference
  configured: Boolean,
  issuesDetected: Number,
  reportPath: String,
  createdAt: Date,
  updatedAt: Date,
}

export const RequirementSchema = {
  description: String,
  createdAt: Date,
}

// Collection names
export const COLLECTIONS = {
  UPLOADS: 'uploads',
  RESULTS: 'results',
  REQUIREMENTS: 'requirements',
}
