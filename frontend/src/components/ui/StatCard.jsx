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
    positive: 'text-[var(--risk-low)] bg-[var(--risk-low-bg)] border-[var(--risk-low-border)]',
    negative: 'text-[var(--risk-high)] bg-[var(--risk-high-bg)] border-[var(--risk-high-border)]',
    neutral: 'text-[var(--text-secondary)] bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)]',
  }

  return (
    <Card className={`flex flex-col justify-between ${className}`} padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-tight">
            {title}
          </span>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {value}
            </span>
            {change && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${changeColors[changeType]}`}>
                {change}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[var(--text-muted)] mt-2 truncate">
          {subtitle}
        </p>
      )}
    </Card>
  )
}

export default StatCard
