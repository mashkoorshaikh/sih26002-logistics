import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Reusable PageHeader with title, subtitle, breadcrumb, and primary actions.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumb = [],
  action,
  badge,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-[var(--border-subtle)] ${className}`}>
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-2 select-none">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[var(--border-strong)] flex-shrink-0" />}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--text-secondary)] font-medium">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

export default PageHeader
