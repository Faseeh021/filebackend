import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon } from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    // Trigger file input dialog
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    
    if (selectedFiles.length > 0) {
      // Navigate to upload page with selected files
      navigate('/upload', { 
        state: { 
          selectedFiles: selectedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
          }))
        } 
      })
    }
    
    // Reset the input so the same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome to File Management System
          </h1>
          <p className="welcome-subtitle">
            Upload, manage, and download your files
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            id="file-input-hidden"
            className="file-input-hidden"
            onChange={handleFileSelect}
            multiple
            accept=".txt,.pdf,.docx,.csv,.xlsx,.html,.jpg,.jpeg,.png,.gif"
          />
          <button className="upload-btn-primary" onClick={handleUploadClick}>
            <UploadIcon className="btn-icon" size={20} />
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
