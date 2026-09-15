import React from 'react'
import Navbar from './Navbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-150 selection:bg-[var(--primary)] selection:text-white">
      {/* Top Sticky Header */}
      <Navbar />

      {/* Main Workspace Canvas (Constrained width, zero horizontal overflow) */}
      <main className="flex-1 w-full overflow-x-hidden pb-12 sm:pb-16">
        {children}
      </main>
    </div>
  )
}
