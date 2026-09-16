import React from 'react'
import { Card } from './Card'

/**
 * Mobile-First Responsive KPI StatCard
 * - 2-column mobile optimized geometry (320px–480px)
 * - Proportional padding and scaled typography
 * - High-contrast semantic indicators
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
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/60',
    negative: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800/60',
    neutral: 'text-[var(--text-secondary)] bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)]',
  }

  return (
    <div
      className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between hover:border-[var(--primary)]/40 hover:shadow-xs transition-all duration-200 min-w-0 ${className}`}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] block truncate">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-none">
              {value}
            </span>
            {change && (
              <span className={`text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap ${changeColors[changeType]}`}>
                {change}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[var(--border-subtle)] truncate">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default StatCard
