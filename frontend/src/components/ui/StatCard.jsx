import React from 'react'
import { Card } from './Card'

/**
 * Compact, high-density KPI StatCard matching Linear/Stripe aesthetics.
 */
export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  subtitle,
  icon: Icon,
  className = '',
}) {
  const changeColors = {
    positive: 'text-[var(--color-success)] bg-[var(--risk-low-bg)]',
    negative: 'text-[var(--color-danger)] bg-[var(--risk-high-bg)]',
    neutral: 'text-[var(--text-muted)] bg-[var(--bg-surface-subtle)]',
  }

  return (
    <Card className={`flex flex-col justify-between ${className}`} padding="sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
            {title}
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {value}
            </span>
            {change && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${changeColors[changeType]}`}>
                {change}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[var(--text-muted)] mt-1.5 truncate">
          {subtitle}
        </p>
      )}
    </Card>
  )
}

export default StatCard
