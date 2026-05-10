import React from 'react'
import { 
  ShoppingCart, 
  Lock, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertTriangle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface OrderStatusTrackerProps {
  currentStatus: string
  statusHistory: { stage: string; timestamp: string }[]
  isDisputed?: boolean
  className?: string
}

const stages = [
  {
    key: 'order_placed',
    label: 'Order Placed',
    icon: ShoppingCart,
    description: 'Order has been placed successfully',
  },
  {
    key: 'payment_held',
    label: 'Payment Secured',
    icon: Lock,
    description: 'Payment is held in secure escrow',
  },
  {
    key: 'in_progress',
    label: 'Work in Progress',
    icon: Package,
    description: 'Seller is working on your order',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: Truck,
    description: 'Order has been delivered for review',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle,
    description: 'Order completed successfully',
  },
] as const

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  currentStatus,
  statusHistory,
  isDisputed = false,
  className,
}) => {
  const getCurrentStageIndex = () => {
    if (isDisputed) return -1 // Show all as incomplete if disputed
    return stages.findIndex(stage => stage.key === currentStatus)
  }

  const getStageTimestamp = (stageKey: string) => {
    const history = statusHistory.find(h => h.stage === stageKey)
    return history?.timestamp
  }

  const isStageCompleted = (stageIndex: number) => {
    if (isDisputed) return false
    const currentIndex = getCurrentStageIndex()
    return stageIndex < currentIndex
  }

  const isStageActive = (stageIndex: number) => {
    if (isDisputed) return false
    const currentIndex = getCurrentStageIndex()
    return stageIndex === currentIndex
  }

  const currentStageIndex = getCurrentStageIndex()

  return (
    <div className={cn('bg-white rounded-card border border-border p-6 shadow-card', className)}>
      {/* Disputed Alert */}
      {isDisputed && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800">Order Disputed</h4>
              <p className="text-sm text-red-600">
                This order is currently under dispute review
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Tracker */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border">
          {!isDisputed && currentStageIndex >= 0 && (
            <div 
              className="absolute top-0 left-0 w-full bg-primary transition-all duration-500"
              style={{ 
                height: `${Math.min((currentStageIndex + 1) / (stages.length - 1), 1) * 100}%` 
              }}
            />
          )}
        </div>

        {/* Stages */}
        <div className="space-y-8">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isCompleted = isStageCompleted(index)
            const isActive = isStageActive(index)
            const timestamp = getStageTimestamp(stage.key)

            return (
              <div key={stage.key} className="flex items-start gap-4">
                {/* Stage Icon */}
                <div className={cn(
                  'relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                  isCompleted 
                    ? 'bg-primary text-white' 
                    : isActive 
                    ? 'bg-primary text-white ring-4 ring-primary/20' 
                    : 'bg-surface-2 text-text-muted'
                )}>
                  <Icon className="w-5 h-5" />
                  {isCompleted && (
                    <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 bg-success text-white rounded-full" />
                  )}
                </div>

                {/* Stage Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      'font-medium',
                      isCompleted || isActive ? 'text-text-primary' : 'text-text-muted'
                    )}>
                      {stage.label}
                    </h3>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <p className={cn(
                    'text-sm mb-2',
                    isCompleted || isActive ? 'text-text-secondary' : 'text-text-muted'
                  )}>
                    {stage.description}
                  </p>

                  {timestamp && (
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {formatDate(timestamp, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dispute Stage (if applicable) */}
      {isDisputed && (
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex items-start gap-4">
            <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-800 mb-1">Dispute Raised</h3>
              <p className="text-sm text-red-600 mb-2">
                Order is under review by our dispute resolution team
              </p>
              {statusHistory.find(h => h.stage === 'disputed')?.timestamp && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <Clock className="w-3 h-3" />
                  {formatDate(statusHistory.find(h => h.stage === 'disputed')!.timestamp, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderStatusTracker
