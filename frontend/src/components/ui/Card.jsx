import React from 'react'

/**
 * Reusable Card component with clean 1px border and subtle hover state.
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
    sm: 'p-3.5',
    default: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-7',
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
    <div className={`flex items-center justify-between pb-3.5 mb-3.5 border-b border-[var(--border-subtle)] ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Icon className="w-5.5 h-5.5" />
          </div>
        )}
        <div>
          {title && (
            <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
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
