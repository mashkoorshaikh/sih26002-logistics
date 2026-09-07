import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Reusable Button component matching Linear/Vercel styling.
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes: sm | md | lg
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
    sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
    md: 'px-3.5 py-2 text-xs font-semibold rounded-lg gap-2',
    lg: 'px-4 py-2.5 text-sm font-semibold rounded-lg gap-2.5',
  }

  const variantStyles = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] border border-transparent shadow-[var(--shadow-xs)]',
    secondary: 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] shadow-[var(--shadow-xs)]',
    outline: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-strong)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border-transparent',
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
        inline-flex items-center justify-center font-medium transition-all duration-150 select-none
        active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-1
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
      <span>{children}</span>
      {!loading && IconRight ? (
        <IconRight className={iconClass} />
      ) : null}
    </button>
  )
}

export default Button
