import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  readonly = false,
  onChange,
  showValue = false,
  className,
  ...props
}) => {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleStarClick = (starRating: number) => {
    if (!readonly && onChange) {
      onChange(starRating)
    }
  }

  const handleMouseEnter = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        !readonly && 'cursor-pointer',
        className
      )}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= displayRating
        const isHalfFilled = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0

        return (
          <Star
            key={index}
            className={cn(
              sizeStyles[size],
              'transition-colors duration-200',
              isFilled
                ? 'fill-accent text-accent'
                : isHalfFilled
                ? 'fill-accent/50 text-accent/50'
                : 'fill-transparent text-border',
              !readonly && 'hover:text-accent hover:fill-accent'
            )}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
          />
        )
      })}
      
      {showValue && (
        <span className="ml-2 text-sm font-medium text-text-primary">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default StarRating
