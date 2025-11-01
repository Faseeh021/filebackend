import React, { useState, useEffect } from 'react'
import './Requirements.css'
import { api } from '../utils/api'

const Requirements = () => {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequirements()
  }, [])

  const fetchRequirements = async () => {
    try {
      const response = await api.getRequirements()
      if (response.data.success) {
        setRequirements(response.data.requirements || [])
      }
    } catch (error) {
      console.error('Error fetching requirements:', error)
      // Use default requirements if API fails
      setRequirements([
        {
          id: 1,
          description: 'Maximum file size per upload is 20 MB.',
        },
        {
          id: 2,
          description: 'Supported file formats: txt, pdf, docx, csv, xlsx, html, jpg, jpeg, png, gif.',
        },
        {
          id: 3,
          description: 'Multiple files can be selected and uploaded simultaneously.',
        },
        {
          id: 4,
          description: 'Upload progress is displayed in real-time for each file.',
        },
        {
          id: 5,
          description: 'Image files (jpg, jpeg, png, gif) are automatically embedded in PDF format when downloaded.',
        },
        {
          id: 6,
          description: 'Text files (txt, csv, html) are converted to PDF with preserved content when downloaded.',
        },
        {
          id: 7,
          description: 'PDF files are downloaded as-is without any conversion or modification.',
        },
        {
          id: 8,
          description: 'Downloaded files maintain the original filename with .pdf extension.',
        },
        {
          id: 9,
          description: 'Files can be deleted from the results page using the delete button.',
        },
        {
          id: 10,
          description: 'Uploaded files are stored securely on the server until deleted.',
        },
        {
          id: 11,
          description: 'Image preview is available for image files during upload.',
        },
        {
          id: 12,
          description: 'File information including name, size, and type is displayed in the results table.',
        },
        {
          id: 13,
          description: 'All uploaded files can be downloaded in PDF format from the results page.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="requirements-loading">Loading guidelines...</div>
  }

  return (
    <div className="requirements-page">
      <div className="requirements-header">
        <h1 className="page-title">File Guidelines</h1>
        <p className="page-subtitle">
          Rules and guidelines for file upload and management.
        </p>
      </div>

      <div className="requirements-table-container">
        <table className="requirements-table">
          <thead>
            <tr>
              <th className="col-no">No</th>
              <th className="col-description">Guideline</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req) => (
              <tr key={req.id}>
                <td className="col-no">{req.id}</td>
                <td className="col-description">{req.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Requirements
