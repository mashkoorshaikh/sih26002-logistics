import React, { useState } from 'react'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

/**
 * Responsive Dashboard Layout
 * - Top sticky header ([Logo] [Theme] [Menu] on mobile, full nav on desktop)
 * - Zero horizontal overflow container
 * - Dedicated mobile slide-in drawer
 * - Native-style bottom navigation for mobile viewports (< 1024px)
 */
export default function DashboardLayout({ children }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-150 selection:bg-[var(--primary)] selection:text-white w-full max-w-[100vw] overflow-x-hidden">
      {/* Top Header */}
      <Navbar
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
      />

      {/* Main Content Area (With bottom padding for Mobile BottomNav) */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden pb-20 lg:pb-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Hidden on desktop) */}
      <BottomNav
        onOpenDrawer={() => setMobileDrawerOpen(true)}
      />
    </div>
  )
}
