import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean
  lines?: number
  showFooter?: boolean
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  showAvatar = true,
  lines = 3,
  showFooter = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-surface rounded-card border border-border p-4 shadow-card',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        {showAvatar && (
          <div className="w-10 h-10 bg-surface-2 rounded-full animate-pulse" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-2 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-surface-2 rounded animate-pulse w-1/2" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-surface-2 rounded animate-pulse" />
        <div className="h-4 bg-surface-2 rounded animate-pulse w-5/6" />
        {lines > 2 && <div className="h-4 bg-surface-2 rounded animate-pulse w-4/6" />}
        {lines > 3 && <div className="h-4 bg-surface-2 rounded animate-pulse w-3/6" />}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-surface-2 rounded-full animate-pulse w-16" />
        <div className="h-6 bg-surface-2 rounded-full animate-pulse w-20" />
        <div className="h-6 bg-surface-2 rounded-full animate-pulse w-14" />
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-surface-2 rounded animate-pulse w-12" />
            <div className="h-4 bg-surface-2 rounded animate-pulse w-16" />
          </div>
          <div className="h-8 bg-surface-2 rounded-btn animate-pulse w-20" />
        </div>
      )}
    </div>
  )
}

export default SkeletonCard
