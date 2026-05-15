import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  helper?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, prefix, suffix, ...props }, ref) => {
    const baseStyles = 'w-full px-3 py-2 border rounded-input text-text-primary placeholder-text-muted bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
    
    const inputStyles = cn(
      baseStyles,
      prefix && 'pl-10',
      suffix && 'pr-10',
      error && 'border-danger focus:ring-danger',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={inputStyles}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}
        {!error && helper && (
          <p className="mt-1 text-xs text-text-muted">{helper}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export default Input
