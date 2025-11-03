import React, { useState, useEffect } from 'react'
import './Requirements.css'
import { api } from '../utils/api'

const Requirements = () => {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)

  // Default requirements from the specification
  const defaultRequirements = [
    { sn: 'A01', description: 'Battery spaces are not to be located forward of the collision bulkhead of the vessel.', reference: '3/3.1 (1)' },
    { sn: 'A02 (i)', description: 'The battery system is to be located at a minimum distance of 300 mm from the hull outer shell.', reference: '3/3.1 (2)(a)(i)' },
    { sn: 'A02 (ii)', description: 'External protection such as fenders or internal reinforcement shall be provided to the vessel\'s outer shell where the battery space is located.', reference: '3/3.1 (2)(a)(ii)' },
    { sn: 'A03', description: 'Battery spaces shall not contain any equipment not related to the battery system and its safety components.', reference: '3/3.1 (4)' },
    { sn: 'A04', description: 'Battery spaces shall not contain equipment or systems supporting essential services.', reference: '3/3.1 (5)' },
    { sn: 'A05', description: 'Battery system arrangement plan shall clearly indicate clearances between adjacent equipment and structures. [1]', reference: '1/2.2 (MGMT-FR5), 3/3.1 (10)' },
    { sn: 'A06', description: 'Means of escape from the battery space shall comply with SOLAS machinery space requirements.', reference: '3/3.1 (17), SOLAS II-2/Reg.13' },
    { sn: 'HA01', description: 'Vent systems for batteries releasing flammable or toxic gases shall be classified as hazardous area Zone 2.', reference: '3/3.3' },
    { sn: 'HA02', description: 'Open deck areas within 1.5 m of the exhaust outlet are to be classified as hazardous area.', reference: '3/3.3 (iv)' },
    { sn: 'HA03', description: 'Escape routes shall provide a continuous fire shelter to a safe position outside the machinery space. [2]', reference: 'SOLAS II-2/Reg.13, IEC 60079-10-1' },
    { sn: 'MS01', description: 'Two independent battery systems are to be provided in separate spaces.', reference: '4/3.1 (i)' },
    { sn: 'MS02', description: 'The propulsion system shall incorporate at least two independent power sources.', reference: '4/3.1 (iv)' },
  ]

  useEffect(() => {
    fetchRequirements()
  }, [])

  const fetchRequirements = async () => {
    try {
      const response = await api.getRequirements()
      if (response.data.success) {
        // Transform API requirements to match our format if needed
        // For now, use default requirements
        setRequirements(defaultRequirements)
      } else {
        setRequirements(defaultRequirements)
      }
    } catch (error) {
      console.error('Error fetching requirements:', error)
      setRequirements(defaultRequirements)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="requirements-loading">Loading requirements...</div>
  }

  return (
    <div className="requirements-page">
      <div className="requirements-header">
        <h1 className="page-title">Requirements</h1>
        <p className="page-subtitle">
          View all rule requirements referenced in the compliance check, including ABS, SOLAS, and other applicable standards.
        </p>
      </div>

      <div className="requirements-table-container">
        <table className="requirements-table">
          <thead>
            <tr>
              <th className="col-sn">S/N</th>
              <th className="col-description">Requirements</th>
              <th className="col-reference">Reference</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req, index) => (
              <tr key={index}>
                <td className="col-sn">{req.sn}</td>
                <td className="col-description">{req.description}</td>
                <td className="col-reference">{req.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="requirements-footer">
          <p><strong>[1]</strong> Adequate space shall be provided for ventilation, inspection, and maintenance. In the absence of manufacturer guidance, baseline clearance may be applied for consistency.</p>
          <p><strong>[2]</strong> A hazardous area (Zone 1 or Zone 2) is not considered a safe position; therefore, escape routes or hatches from battery spaces shall not open directly into hazardous zones.</p>
        </div>
      </div>
    </div>
  )
}

export default Requirements
