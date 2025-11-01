import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} currentPath={location.pathname} />
      <div className={`main-container ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}

export default Layout
