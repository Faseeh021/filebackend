import React, { useState, useEffect } from 'react'
import { File, Download, Trash2, Ship } from 'lucide-react'
import './Results.css'
import { api, getApiUrlWithFallback } from '../utils/api'

const Results = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiUrl, setApiUrl] = useState(null)

  useEffect(() => {
    const init = async () => {
      const url = await getApiUrlWithFallback()
      setApiUrl(url)
      await fetchResults()
    }
    init()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await api.getResults()
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
      const response = await api.downloadResult(id)
      
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
      const errorMessage = error.userMessage || error.response?.data?.message || error.message || 'Unknown error'
      alert(`Failed to download report: ${errorMessage}. Please try again.`)
    }
  }

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename || 'this file'}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await api.deleteResult(id)
      
      if (response.data.success) {
        // Remove the deleted result from the list
        setResults(results.filter(result => result.id !== id))
        alert('File deleted successfully')
      } else {
        alert('Failed to delete file. Please try again.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      const errorMessage = error.userMessage || error.message || 'Unknown error'
      alert(`Failed to delete file: ${errorMessage}. Please try again.`)
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
                          src={result.image_url.startsWith('http') 
                            ? result.image_url 
                            : apiUrl 
                              ? `${apiUrl}${result.image_url}` 
                              : result.image_url}
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
