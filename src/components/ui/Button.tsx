import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-btn transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-surface-2 text-text-primary border border-border hover:bg-surface-3 focus:ring-primary',
    outline: 'bg-surface-2 text-text-primary border border-border hover:bg-surface-3 focus:ring-primary',
    ghost: 'text-text-primary hover:bg-surface-2 focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const loadingSpinner = (
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
  )

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && loadingSpinner}
      {children}
    </button>
  )
}

export { Button }
export default Button
