import React from 'react'
import { Menu, Search, Bell, User, ChevronDown } from 'lucide-react'
import './Header.css'

const Header = ({ onMenuClick }) => {
  return (
    <header className="header">
      <button className="menu-toggle" onClick={onMenuClick}>
        <Menu size={20} />
      </button>
      <div className="search-bar">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search Data and Reports"
          className="search-input"
        />
      </div>
      <div className="header-right">
        <button className="notification-btn">
          <Bell size={18} />
        </button>
        <div className="user-menu">
          <div className="header-avatar">
            <User size={20} />
          </div>
          <div className="user-details">
            <div className="user-name">John Doe</div>
            <div className="user-role">CEO</div>
          </div>
          <ChevronDown className="dropdown-arrow" size={16} />
        </div>
      </div>
    </header>
  )
}

export default Header
