import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
}

const Spinner: React.FC<SpinnerProps> = ({
  className,
  size = 'md',
  color = 'primary',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colorStyles = {
    primary: 'text-primary',
    secondary: 'text-text-secondary',
    white: 'text-white',
  }

  return (
    <div
      className={cn(
        'animate-spin',
        sizeStyles[size],
        colorStyles[color],
        className
      )}
      {...props}
    >
      <Loader2 className="w-full h-full" />
    </div>
  )
}

export default Spinner
