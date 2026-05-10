import React, { useState } from 'react'
import { Star, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import ReviewModal from './ReviewModal'
import { cn } from '@/lib/utils'

interface ReviewPromptProps {
  orderId: string
  targetUserId: string
  targetUserName: string
  gigTitle?: string
  onDismiss: () => void
  onReviewSubmitted: () => void
  className?: string
}

const ReviewPrompt: React.FC<ReviewPromptProps> = ({
  orderId,
  targetUserId,
  targetUserName,
  gigTitle,
  onDismiss,
  onReviewSubmitted,
  className,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <>
      <div className={cn(
        'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-card p-4 mb-6',
        className
      )}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-text-primary mb-1">
              How was your experience with {targetUserName}?
            </h4>
            <p className="text-sm text-text-secondary mb-3">
              Your review helps others make informed decisions and improves the Campus Hub community.
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                Leave a Review
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDismissed(true)
                  onDismiss()
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>

          <button
            onClick={() => {
              setIsDismissed(true)
              onDismiss()
            }}
            className="text-text-muted hover:text-text-primary p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsDismissed(true)
          onReviewSubmitted()
        }}
        orderId={orderId}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        gigTitle={gigTitle}
      />
    </>
  )
}

export default ReviewPrompt
