import React, { useState, useEffect } from 'react'
import { Star, BarChart3, Loader2 } from 'lucide-react'
import ReviewCard from './ReviewCard'
import Button from '@/components/ui/Button'
import apiClient from '@/api/client'
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

interface ReviewsResponse {
  reviews: Review[]
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

interface ReviewsSectionProps {
  userId: string
  className?: string
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ userId, className }) => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchReviews = async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (pageNum === 0) setIsLoading(true)
      else setIsLoadingMore(true)

      const response = await apiClient.get(
        `/api/reviews/user/${userId}?page=${pageNum}&size=10`
      )

      const data: ReviewsResponse = response.data

      if (append && reviewsData) {
        setReviewsData({
          ...data,
          reviews: [...reviewsData.reviews, ...data.reviews],
        })
      } else {
        setReviewsData(data)
      }

      setHasMore(data.reviews.length === 10)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchReviews(0)
  }, [userId])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchReviews(nextPage, true)
  }

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!reviewsData || reviewsData.totalReviews === 0) {
    return (
      <div className={cn('text-center py-8 bg-surface-2 rounded-card', className)}>
        <Star className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No reviews yet
        </h3>
        <p className="text-text-secondary">
          This user hasn't received any reviews yet.
        </p>
      </div>
    )
  }

  const { reviews, totalReviews, averageRating, ratingDistribution } = reviewsData

  // Calculate percentages for the distribution bars
  const maxCount = Math.max(...Object.values(ratingDistribution))
  const getPercentage = (count: number) => 
    maxCount > 0 ? (count / maxCount) * 100 : 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Rating */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-text-primary">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-4 h-4',
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-text-muted mt-1">
                {totalReviews} reviews
              </p>
            </div>
            
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary w-3">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${getPercentage(ratingDistribution[rating as keyof typeof ratingDistribution])}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted w-6 text-right">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-text-secondary">
              Based on {totalReviews} verified reviews from completed orders
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Recent Reviews
        </h3>
        
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              loading={isLoadingMore}
            >
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsSection
