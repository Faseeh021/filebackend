import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Upload, CheckCircle, FileText, Settings, HelpCircle, User, LogOut } from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ isOpen, currentPath }) => {
  const navItems = [
    { path: '/', label: 'Home', icon: BarChart3 },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/results', label: 'Results', icon: CheckCircle },
    { path: '/requirements', label: 'Requirements', icon: FileText },
  ]

  const utilityItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo">
          <img src="/logo.jpg" alt="Logo" className="logo-icon" />
          <a href="https://li-ionbrcc.com" target="_blank" rel="noopener noreferrer" className="logo-link">
            <span className="logo-text">Li-ionBRCC</span>
          </a>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
            >
              <IconComponent className="nav-icon" size={20} />
              <span className="nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-divider"></div>

      <nav className="sidebar-utility">
        {utilityItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link key={item.path} to={item.path} className="nav-item">
              <IconComponent className="nav-icon" size={20} />
              <span className="nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <User className="user-avatar" size={20} />
          <div className="user-info">
            <div className="user-name">Ivan</div>
            <div className="user-email">2301572@sit.singaporetech.edu.sg</div>
          </div>
          <LogOut className="logout-icon" size={16} />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
