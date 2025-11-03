import React, { useState, useEffect } from 'react'
import { Menu, Search, Bell, User, ChevronDown } from 'lucide-react'
import './Header.css'
import { api } from '../utils/api'

const Header = ({ onMenuClick }) => {
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)
  const [vesselNames, setVesselNames] = useState([])

  useEffect(() => {
    fetchVesselNames()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownOpen && !event.target.closest('.search-bar-container')) {
        setSearchDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchDropdownOpen])

  const fetchVesselNames = async () => {
    try {
      const response = await api.getResults()
      if (response.data.success) {
        const results = response.data.results || []
        // Extract unique vessel names (vesselName is already formatted by backend)
        const uniqueVessels = [...new Set(
          results.map(r => r.vesselName).filter(name => name && name !== 'Unknown')
        )]
        // Sort to ensure vessel1 comes before vessel1 P1
        const sortedVessels = uniqueVessels.sort((a, b) => {
          if (a === 'vessel1') return -1
          if (b === 'vessel1') return 1
          return a.localeCompare(b)
        })
        setVesselNames(sortedVessels)
      }
    } catch (error) {
      console.error('Error fetching vessel names:', error)
    }
  }

  return (
    <header className="header">
      <button className="menu-toggle" onClick={onMenuClick}>
        <Menu size={20} />
      </button>
      <div className="search-bar-container">
        <div className="search-bar" onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search Data and Reports"
            className="search-input"
            readOnly
          />
          <ChevronDown size={16} style={{ marginLeft: '8px' }} />
        </div>
        {searchDropdownOpen && (
          <div className="search-dropdown">
            {vesselNames.length > 0 ? (
              vesselNames.map((vessel, index) => (
                <div key={index} className="search-dropdown-item">
                  {vessel}
                </div>
              ))
            ) : (
              <div className="search-dropdown-item">No vessels found</div>
            )}
          </div>
        )}
      </div>
      <div className="header-right">
        <div className="header-left-group">
          <button className="notification-btn">
            <Bell size={18} />
          </button>
          <div className="user-menu">
            <div className="header-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <div className="user-name">Ivan</div>
              <div className="user-role">Student</div>
            </div>
            <ChevronDown className="dropdown-arrow" size={16} />
          </div>
        </div>
        <div className="header-lower-group">
          <a href="/settings" className="settings-link">Settings</a>
          <a href="/help" className="help-link">Help & Support</a>
        </div>
      </div>
    </header>
  )
}

export default Header
