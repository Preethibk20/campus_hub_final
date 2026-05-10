import React, { useState } from 'react'
import { X, Star, MessageSquare } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StarRating from '@/components/ui/StarRating'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  orderId: string
  targetUserId: string
  targetUserName: string
  gigTitle?: string
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  targetUserId,
  targetUserName,
  gigTitle,
}) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const toast = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (comment.length < 20) {
      toast.error('Review must be at least 20 characters')
      return
    }

    try {
      setIsSubmitting(true)
      await apiClient.post('/api/reviews', {
        orderId,
        targetUserId,
        rating,
        comment,
      })

      toast.success('Review submitted successfully!')
      onSuccess()
      onClose()
      // Reset form
      setRating(0)
      setComment('')
    } catch (error: any) {
      toast.error('Failed to submit review', error.response?.data?.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDismiss = () => {
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      title="Leave a Review"
      size="md"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-surface-2 rounded-lg p-4">
          <p className="text-text-primary font-medium">
            How was your experience with {targetUserName}?
          </p>
          {gigTitle && (
            <p className="text-text-secondary text-sm mt-1">
              Order: {gigTitle}
            </p>
          )}
        </div>

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Your Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
                type="button"
              >
                <Star
                  className={cn(
                    'w-8 h-8 transition-colors',
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-text-muted mt-1">
            {rating > 0 && (
              <>
                {rating === 5 && 'Excellent! '}
                {rating === 4 && 'Very Good '}
                {rating === 3 && 'Good '}
                {rating === 2 && 'Fair '}
                {rating === 1 && 'Poor '}
                ({rating} out of 5 stars)
              </>
            )}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience working with this person... (minimum 20 characters)"
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
          <div className="flex justify-between mt-1">
            <span className={cn(
              'text-xs',
              comment.length < 20 ? 'text-danger' : 'text-text-muted'
            )}>
              {comment.length}/20 characters minimum
            </span>
            <span className="text-xs text-text-muted">
              {comment.length}/500
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={handleDismiss}
            disabled={isSubmitting}
            className="flex-1"
          >
            Dismiss
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={rating === 0 || comment.length < 20}
            className="flex-1"
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ReviewModal
