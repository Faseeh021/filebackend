import React, { useState, useEffect } from 'react'
import { Download, Trash2 } from 'lucide-react'
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

  const handleDownload = async (id, reportFilename) => {
    try {
      const response = await api.downloadResult(id)
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', reportFilename || `vessel_report_${id}.pdf`)
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
          Review automated compliance results, including detected rule violations, references, and recommended corrections.
        </p>
      </div>

      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Vessel Name</th>
              <th>Vessel Image</th>
              <th>Comply?</th>
              <th>Violation(s) Detected</th>
              <th>View Report</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-results">
                  No results found. Upload a file to get started.
                </td>
              </tr>
            ) : (
              results.map((result) => {
                // Use backend values directly (hardcoded for iteration1/iteration2)
                // iteration1.png -> is_compliant: false, issues_detected: 4
                // iteration2.png -> is_compliant: true, issues_detected: 0
                const isCompliant = result.is_compliant === true
                const violationsCount = result.issues_detected || 0
                const vesselName = result.vesselName || result.filename?.replace(/\.[^/.]+$/, '') || 'Unknown'
                const reportFilename = result.report_filename || `${vesselName}.pdf`
                
                return (
                  <tr key={result.id}>
                    <td className="vessel-name-cell">{vesselName}</td>
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
                          <span>No Image</span>
                        </div>
                      </div>
                    </td>
                    <td className="comply-cell">
                      {isCompliant ? (
                        <span className="comply-yes">✅ Yes</span>
                      ) : (
                        <span className="comply-no">❌ No</span>
                      )}
                    </td>
                    <td className="violations-cell">
                      {violationsCount === 0 
                        ? '0 violation(s) detected' 
                        : `${violationsCount} violation${violationsCount !== 1 ? 's' : ''} detected`}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="download-btn"
                          onClick={() => handleDownload(result.id, reportFilename)}
                          title="View Report"
                        >
                          <Download className="download-icon" size={18} />
                          View Report
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
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Results
