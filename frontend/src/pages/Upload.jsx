import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Upload as UploadIcon, File, Paperclip, CheckCircle2, AlertCircle } from 'lucide-react'
import './Upload.css'
import { api } from '../utils/api'

const Upload = () => {
  const [files, setFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [previewUrls, setPreviewUrls] = useState([])
  const [serverStatus, setServerStatus] = useState('checking') // 'checking', 'online', 'offline'
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Check server status on mount
  useEffect(() => {
    const checkServer = async () => {
      setServerStatus('checking')
      try {
        const health = await api.healthCheck()
        if (health.success) {
          setServerStatus('online')
          setErrorMessage('')
        } else {
          setServerStatus('offline')
          setErrorMessage('Server is not available. Please check your connection and try again.')
        }
      } catch (error) {
        setServerStatus('offline')
        setErrorMessage('Cannot connect to server. Please check your connection.')
      }
    }
    
    checkServer()
  }, [])

  // Load files from navigation state if available
  useEffect(() => {
    if (location.state?.selectedFiles) {
      const selectedFiles = location.state.selectedFiles
      const fileObjects = selectedFiles.map(item => item.file)
      setFiles(fileObjects)
      
      // Create preview URLs for images - preserve order
      const urls = fileObjects
        .filter(file => file.type.startsWith('image/'))
        .map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }
    
    // Cleanup preview URLs on unmount
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [location.state])

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles)
      setUploadProgress(0)
      setUploadComplete(false)
      
      // Create preview URLs for images
      const urls = selectedFiles
        .filter(file => file.type.startsWith('image/'))
        .map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles)
      setUploadProgress(0)
      setUploadComplete(false)
      
      // Create preview URLs for images
      const urls = droppedFiles
        .filter(file => file.type.startsWith('image/'))
        .map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) return

    // Check server status before uploading
    if (serverStatus === 'offline') {
      alert('Server is currently unavailable. Please check your connection and try again.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setErrorMessage('')

    try {
      // Upload files one by one (or modify backend to accept multiple files)
      let totalProgress = 0
      const totalFiles = files.length
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])

        const response = await api.upload(formData, (progressEvent) => {
          const fileProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          // Calculate overall progress
          totalProgress = Math.round(
            ((i * 100) + fileProgress) / totalFiles
          )
          setUploadProgress(totalProgress)
        })

        if (!response.data.success) {
          throw new Error(`Failed to upload ${files[i].name}`)
        }
      }

      setUploadComplete(true)
      setUploadProgress(100)
      setTimeout(() => {
        navigate('/results')
      }, 1500)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMsg = error.userMessage || error.message || 'Unknown error occurred'
      setErrorMessage(errorMsg)
      alert(`Upload failed: ${errorMsg}. Please try again.`)
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="upload-page">
      <div className="upload-content">
        <div className="upload-section">
          <h1 className="page-title">Upload Files</h1>
              <p className="page-subtitle">
                Upload your files to manage and download them.
              </p>

          <div className="upload-card">
            {errorMessage && (
              <div className="error-message" style={{ 
                padding: '12px', 
                marginBottom: '16px', 
                backgroundColor: '#fee', 
                border: '1px solid #fcc', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}
            {serverStatus === 'checking' && (
              <div style={{ padding: '12px', marginBottom: '16px', color: '#666' }}>
                Checking server connection...
              </div>
            )}
            <div
              className="upload-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                id="file-input"
                className="file-input"
                onChange={handleFileSelect}
                multiple
                accept=".txt,.pdf,.docx,.csv,.xlsx,.html,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="file-input" className="upload-label">
                <UploadIcon className="upload-icon" size={32} />
                <span className="upload-text">
                  <span className="upload-link">Click to upload</span> or drag
                  and drop
                </span>
                <span className="upload-formats">
                  Select one or more files: txt, pdf, docx, csv, xlsx, html, jpg, jpeg, png, gif (max. 20 MB each)
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="uploaded-files-list">
                <div className="files-count">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </div>
                {files.map((file, index) => (
                  <div key={index} className="uploaded-file">
                    <File className="file-icon" size={24} />
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                ))}
                <div className="upload-progress-container">
                  <div
                    className="upload-progress-bar"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="upload-status">
                  {uploadComplete ? (
                    <span className="status-success">
                      <CheckCircle2 size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                      100% - All files uploaded
                    </span>
                  ) : uploading ? (
                    <span>Uploading... {uploadProgress}%</span>
                  ) : (
                    <span>Ready to upload</span>
                  )}
                </div>
              </div>
            )}

            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading || serverStatus === 'offline'}
            >
              {uploading ? 'Uploading...' : serverStatus === 'offline' ? 'Server Unavailable' : `Upload ${files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Files'}`}
            </button>
          </div>
        </div>

        <div className="preview-section">
          <div className="preview-card">
            <h3 className="preview-title">File Preview</h3>
            <div className="preview-content">
              {files.length > 0 ? (
                <div className="preview-files-list">
                  {files.map((file, index) => {
                    // Check if file is an image
                    const isImage = file.type.startsWith('image/')
                    
                    // Find the correct preview URL for this image file
                    let previewUrl = null
                    if (isImage) {
                      const imageFiles = files.filter(f => f.type.startsWith('image/'))
                      const imageIndex = imageFiles.findIndex(f => f === file)
                      if (imageIndex >= 0 && imageIndex < previewUrls.length) {
                        previewUrl = previewUrls[imageIndex]
                      }
                    }
                    
                    return (
                      <div key={index} className="preview-file-item">
                        {isImage && previewUrl ? (
                          <div className="preview-file-image">
                            <img
                              src={previewUrl}
                              alt={file.name}
                              className="preview-image-small"
                            />
                            <div className="preview-file-info">
                              <div className="preview-file-name">{file.name}</div>
                              <div className="preview-file-size">{formatFileSize(file.size)}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="preview-file-icon">
                            <File className="file-icon-large" size={40} />
                            <div className="preview-file-info">
                              <div className="preview-file-name">{file.name}</div>
                              <div className="preview-file-size">{formatFileSize(file.size)}</div>
                              <div className="preview-file-type">{file.type || 'Unknown type'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="preview-placeholder-small">
                  <Paperclip className="preview-placeholder-icon" size={48} />
                  <div className="preview-placeholder-text">No files selected</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload
