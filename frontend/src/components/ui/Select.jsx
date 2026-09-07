import React from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Reusable Select component matching Linear/Vercel styling.
 */
export function Select({
  label,
  id,
  options = [],
  error,
  helperText,
  icon: Icon,
  className = '',
  required = false,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
        >
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <select
          id={selectId}
          required={required}
          className={`
            w-full appearance-none bg-[var(--bg-surface)] text-[var(--text-primary)] border text-sm rounded-lg
            px-3.5 py-2.5 pr-9 transition-all duration-150 outline-none cursor-pointer
            focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/20
            disabled:bg-[var(--bg-surface-subtle)] disabled:cursor-not-allowed disabled:opacity-60
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20' : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'}
            ${className}
          `}
          {...props}
        >
          {children ? (
            children
          ) : (
            options.map((opt) => {
              const val = typeof opt === 'object' ? opt.value : opt
              const lbl = typeof opt === 'object' ? opt.label : opt
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              )
            })
          )}
        </select>
        <div className="absolute right-3 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4.5 h-4.5" />
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[var(--color-danger)] font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[var(--text-muted)]">{helperText}</p>
      ) : null}
    </div>
  )
}

export default Select
