import React from 'react'

/**
 * Reusable Card component with clean 1px border and subtle elevation.
 */
export function Card({
  children,
  className = '',
  hover = false,
  padding = 'default',
  ...props
}) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5 sm:p-4',
    default: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  }

  return (
    <div
      className={`
        bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl
        shadow-[var(--shadow-xs)] transition-all duration-150
        ${hover ? 'hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]' : ''}
        ${paddingStyles[padding] || paddingStyles.default}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
}) {
  return (
    <div className={`flex items-start sm:items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)] gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          {title && (
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export default Card
