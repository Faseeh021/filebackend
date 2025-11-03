import express from 'express'
import { getCollection } from '../db/config.js'
import { COLLECTIONS } from '../db/schema.js'
import { ObjectId } from 'mongodb'

const router = express.Router()

// Get all requirements
router.get('/', async (req, res) => {
  try {
    let requirementsCollection
    try {
      requirementsCollection = await getCollection(COLLECTIONS.REQUIREMENTS)
    } catch (dbError) {
      console.error('Database connection error in requirements route:', dbError.message)
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection failed. Please check your MongoDB Atlas connection and try again.',
        error: 'Database unavailable'
      })
    }
    const allRequirements = await requirementsCollection
      .find({})
      .sort({ _id: 1 }) // Sort by MongoDB _id (ascending)
      .toArray()
    
    // Format response to match expected structure
    const formattedRequirements = allRequirements.map((req) => ({
      id: req._id.toString(),
      description: req.description,
      createdAt: req.createdAt,
    }))
    
    res.json({ success: true, requirements: formattedRequirements })
  } catch (error) {
    console.error('Error fetching requirements:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch requirements', error: error.message })
  }
})

// Get single requirement
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid requirement ID' })
    }
    
    const requirementsCollection = await getCollection(COLLECTIONS.REQUIREMENTS)
    const requirement = await requirementsCollection.findOne({ _id: new ObjectId(id) })

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' })
    }

    // Format response
    const formattedRequirement = {
      id: requirement._id.toString(),
      description: requirement.description,
      createdAt: requirement.createdAt,
    }

    res.json({ success: true, requirement: formattedRequirement })
  } catch (error) {
    console.error('Error fetching requirement:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch requirement', error: error.message })
  }
})

// Create new requirement
router.post('/', async (req, res) => {
  try {
    const { description } = req.body

    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required' })
    }

    const requirementsCollection = await getCollection(COLLECTIONS.REQUIREMENTS)
    const result = await requirementsCollection.insertOne({
      description,
      createdAt: new Date(),
    })
    
    // Fetch the created requirement
    const requirement = await requirementsCollection.findOne({ _id: result.insertedId })
    
    // Format response
    const formattedRequirement = {
      id: requirement._id.toString(),
      description: requirement.description,
      createdAt: requirement.createdAt,
    }

    res.json({ success: true, requirement: formattedRequirement })
  } catch (error) {
    console.error('Error creating requirement:', error)
    res.status(500).json({ success: false, message: 'Failed to create requirement', error: error.message })
  }
})

export default router
