import React from 'react'

/**
 * Clean Linear-style Tabs component.
 */
export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-lg select-none ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab
        const label = typeof tab === 'object' ? tab.label : tab
        const icon = typeof tab === 'object' ? tab.icon : null
        const badge = typeof tab === 'object' ? tab.badge : null
        const isActive = activeTab === id

        const Icon = icon

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
              ${isActive ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50'}
            `}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]">
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
