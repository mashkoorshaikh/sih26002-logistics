import React from 'react'
import { Loader2, AlertCircle, Inbox, RefreshCw } from 'lucide-react'
import { Button } from './Button'

/**
 * Loading state with spinner or skeleton
 */
export function LoadingState({ message = 'Loading data...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)] mb-3" />
      <p className="text-xs text-[var(--text-muted)] font-medium">{message}</p>
    </div>
  )
}

/**
 * Empty state with icon, message, and optional action
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/30 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-3 shadow-[var(--shadow-xs)]">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h4>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}

/**
 * Error state with retry action
 */
export function ErrorState({
  title = 'Something went wrong',
  error = 'Failed to load content. Please verify network connectivity.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-[var(--color-danger)]/20 bg-[var(--risk-high-bg)]/40 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h4>
      <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-4 leading-relaxed">
        {error}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Try Again
        </Button>
      )}
    </div>
  )
}
