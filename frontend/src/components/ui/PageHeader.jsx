import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Responsive PageHeader with mobile-first typography and spacing
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
    <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 mb-5 sm:mb-6 border-b border-[var(--border-subtle)] ${className}`}>
      <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] select-none overflow-x-auto no-scrollbar py-0.5" aria-label="Breadcrumb">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[var(--border-strong)] flex-shrink-0" />}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--text-secondary)] font-medium whitespace-nowrap">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            {title}
          </h1>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 pt-1 sm:pt-0">
          {action}
        </div>
      )}
    </div>
  )
}

export default PageHeader
