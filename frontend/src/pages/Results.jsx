import React, { useState, useEffect } from 'react'
import { File, Download, Trash2, Ship } from 'lucide-react'
import './Results.css'
import axios from 'axios'

const Results = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/results`)
      if (response.data.success) {
        setResults(response.data.results || [])
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id, filename) => {
    try {
      const downloadUrl = `${API_URL}/api/results/${id}/download`
      console.log('Downloading from:', downloadUrl)
      console.log('API_URL:', API_URL)
      
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
      })
      
      // Get the original filename and create PDF name (same as backend)
      const baseName = filename ? filename.replace(/\.[^/.]+$/, '') : `file_${id}`
      const pdfFilename = `${baseName}.pdf`
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', pdfFilename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        apiUrl: API_URL
      })
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      alert(`Failed to download report: ${errorMessage}. Please check the console for details.`)
    }
  }

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename || 'this file'}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await axios.delete(`${API_URL}/api/results/${id}`)
      if (response.data.success) {
        // Remove the deleted result from the list
        setResults(results.filter(result => result.id !== id))
        alert('File deleted successfully')
      } else {
        alert('Failed to delete file. Please try again.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete file. Please try again.')
    }
  }

  if (loading) {
    return <div className="results-loading">Loading results...</div>
  }

  return (
    <div className="results-page">
      <div className="results-header">
        <h1 className="page-title">Results</h1>
        <p className="page-subtitle">
          Review your uploaded files and download them.
        </p>
      </div>

      <div className="results-table-container">
        <table className="results-table">
              <thead>
                <tr>
                  <th>Vessel image</th>
                  <th>Voicican Detected</th>
                  <th>View Reports</th>
                </tr>
              </thead>
          <tbody>
                 {results.length === 0 ? (
                   <tr>
                     <td colSpan="3" className="no-results">
                       No results found. Upload a file to get started.
                     </td>
                   </tr>
                 ) : (
              results.map((result) => (
                <tr key={result.id}>
                  <td>
                    <div className="vessel-image">
                      {result.image_url ? (
                        <img
                          src={result.image_url.startsWith('http') ? result.image_url : `${API_URL}${result.image_url}`}
                          alt={result.filename || 'Uploaded file'}
                          className="vessel-image-preview"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="image-placeholder"
                        style={{ display: result.image_url ? 'none' : 'flex' }}
                      >
                        {result.image_url ? <Ship size={32} /> : <File size={32} />}
                      </div>
                    </div>
                         <div className="image-filename">{result.filename || 'Unknown file'}</div>
                       </td>
                       <td>
                    <span className="issues-detected">
                      {result.issues_detected || 0} issue{result.issues_detected !== 1 ? 's' : ''} detected
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="download-btn"
                        onClick={() => handleDownload(result.id, result.filename)}
                      >
                        <Download className="download-icon" size={18} />
                        Download PDF
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(result.id, result.filename)}
                        title="Delete file"
                      >
                        <Trash2 className="delete-icon" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Results
