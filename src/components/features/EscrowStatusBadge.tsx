import React from 'react'
import { Clock, Lock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EscrowStatusBadgeProps {
  status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
  className?: string
}

const statusConfig = {
  pending: {
    label: 'Awaiting Payment',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  held: {
    label: 'Payment Secured',
    color: 'bg-blue-100 text-blue-800',
    icon: Lock,
  },
  released: {
    label: 'Payment Released',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-orange-100 text-orange-800',
    icon: RefreshCw,
  },
  disputed: {
    label: 'Disputed',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
  },
} as const

const EscrowStatusBadge: React.FC<EscrowStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
      config.color,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  )
}

export default EscrowStatusBadge
