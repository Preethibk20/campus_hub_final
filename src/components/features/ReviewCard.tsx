import React from 'react'
import { Link } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import StarRating from '@/components/ui/StarRating'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  comment: string
  createdAt: string
  gigId?: string
  gigTitle?: string
  orderId?: string
}

interface ReviewCardProps {
  review: Review
  showOrderContext?: boolean
  className?: string
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showOrderContext = true,
  className,
}) => {
  return (
    <div className={cn('bg-white rounded-card border border-border p-4 shadow-card', className)}>
      {/* Reviewer Info */}
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/profile/${review.reviewerId}`}>
          <Avatar
            src={review.reviewerAvatar}
            name={review.reviewerName}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${review.reviewerId}`}
            className="font-medium text-text-primary hover:text-primary transition-colors"
          >
            {review.reviewerName}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={review.rating} readonly size="sm" />
            <span className="text-xs text-text-muted">
              {formatDate(review.createdAt, { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Review Comment */}
      <p className="text-text-secondary text-sm leading-relaxed mb-3">
        "{review.comment}"
      </p>

      {/* Order Context */}
      {showOrderContext && review.gigTitle && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-text-muted">
            for:{' '}
            <Link
              to={review.gigId ? `/gigs/${review.gigId}` : '#'}
              className="text-primary hover:underline"
            >
              {review.gigTitle}
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default ReviewCard
