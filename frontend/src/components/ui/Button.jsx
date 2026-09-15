import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Reusable Button component matching Linear/Stripe aesthetics.
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes: sm (36px) | md (44px) | lg (48px)
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  ...props
}) {
  const sizeStyles = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg gap-2',
    lg: 'min-h-[48px] px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
  }

  const variantStyles = {
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] border border-transparent shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]',
    secondary: 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-[var(--shadow-xs)]',
    outline: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)] hover:border-[var(--text-secondary)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent',
    danger: 'bg-[var(--color-danger)] text-white hover:opacity-90 border border-transparent shadow-[var(--shadow-xs)]',
  }

  const iconSizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5 h-5',
  }

  const iconClass = `${iconSizeStyles[size] || iconSizeStyles.md} flex-shrink-0`

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]/30 focus-visible:ring-offset-1
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconClass} animate-spin text-current`} />
      ) : Icon ? (
        <Icon className={iconClass} />
      ) : null}
      {children && <span>{children}</span>}
      {!loading && IconRight ? (
        <IconRight className={iconClass} />
      ) : null}
    </button>
  )
}

export default Button
