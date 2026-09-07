import React from 'react'

/**
 * Reusable Input component with optional label, prefix icon, and error message.
 */
export function Input({
  label,
  id,
  error,
  helperText,
  icon: Icon,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
        >
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          required={required}
          className={`
            w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border text-sm rounded-lg
            px-3.5 py-2.5 transition-all duration-150 outline-none
            placeholder:text-[var(--text-muted)]
            focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/20
            disabled:bg-[var(--bg-surface-subtle)] disabled:cursor-not-allowed disabled:opacity-60
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20' : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[var(--color-danger)] font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[var(--text-muted)]">{helperText}</p>
      ) : null}
    </div>
  )
}

export default Input
