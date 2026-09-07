import React from 'react'

/**
 * Reusable Badge component for risk levels, statuses, and tags.
 * Variants: low | medium | high | success | warning | danger | brand | neutral
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded',
    md: 'text-xs px-2 py-0.5 rounded-md',
    lg: 'text-xs font-semibold px-2.5 py-1 rounded-md',
  }

  const variantStyles = {
    low: 'bg-[var(--risk-low-bg)] text-[var(--risk-low)] border border-[var(--risk-low-border)]',
    medium: 'bg-[var(--risk-med-bg)] text-[var(--risk-med)] border border-[var(--risk-med-border)]',
    high: 'bg-[var(--risk-high-bg)] text-[var(--risk-high)] border border-[var(--risk-high-border)]',
    success: 'bg-[var(--risk-low-bg)] text-[var(--risk-low)] border border-[var(--risk-low-border)]',
    warning: 'bg-[var(--risk-med-bg)] text-[var(--risk-med)] border border-[var(--risk-med-border)]',
    danger: 'bg-[var(--risk-high-bg)] text-[var(--risk-high)] border border-[var(--risk-high-border)]',
    brand: 'bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20',
    neutral: 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  }

  const dotColors = {
    low: 'bg-[var(--risk-low)]',
    medium: 'bg-[var(--risk-med)]',
    high: 'bg-[var(--risk-high)] animate-pulse',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger)]',
    brand: 'bg-[var(--primary)]',
    neutral: 'bg-[var(--text-muted)]',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium select-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.neutral}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || dotColors.neutral}`}
        />
      )}
      <span>{children}</span>
    </span>
  )
}

export default Badge
