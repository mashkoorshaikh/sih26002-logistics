import React from 'react'

/**
 * Reusable Table components with consistent Vercel/Linear table styles.
 */
export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <table className={`w-full text-left text-xs border-collapse ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children, className = '' }) {
  return (
    <thead className={`bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  )
}

export function TableRow({ children, onClick, active = false, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`
        border-b border-[var(--border-subtle)] last:border-b-0 transition-colors duration-100
        ${onClick ? 'cursor-pointer hover:bg-[var(--bg-surface-hover)]' : ''}
        ${active ? 'bg-[var(--primary-subtle)]/50' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  )
}

export function TableHeader({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 font-semibold text-[var(--text-secondary)] text-[11px] select-none ${className}`}>
      {children}
    </th>
  )
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-[var(--text-primary)] align-middle ${className}`}>
      {children}
    </td>
  )
}

export default Table
