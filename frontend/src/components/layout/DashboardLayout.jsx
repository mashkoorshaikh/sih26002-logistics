import React from 'react'
import Navbar from './Navbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-150">
      {/* Top Sticky Navigation */}
      <Navbar />

      {/* Main Workspace Canvas */}
      <main className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
