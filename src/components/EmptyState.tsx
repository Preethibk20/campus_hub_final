import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  ShoppingBag, 
  MessageSquare, 
  Bell, 
  FolderOpen,
  FileText,
  Inbox,
  Briefcase
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  type: 'gigs' | 'orders' | 'messages' | 'notifications' | 'gigs_created' | 'applications' | 'transactions'
  className?: string
}

const emptyStateConfig = {
  gigs: {
    icon: Search,
    title: 'No gigs found',
    description: 'We couldn\'t find any gigs matching your search. Try adjusting your filters or search terms.',
    actionLabel: 'Clear Filters',
    actionHref: '/explore',
  },
  orders: {
    icon: ShoppingBag,
    title: 'No orders yet',
    description: 'You haven\'t placed or received any orders yet. Start browsing gigs to find services you need!',
    actionLabel: 'Browse Gigs',
    actionHref: '/explore',
  },
  messages: {
    icon: MessageSquare,
    title: 'No messages yet',
    description: 'Your inbox is empty. Start a conversation with a seller or buyer to discuss your order.',
    actionLabel: 'Start Conversation',
    actionHref: '/dashboard/inbox',
  },
  notifications: {
    icon: Bell,
    title: 'No notifications',
    description: 'You\'re all caught up! Check back later for updates on your orders and messages.',
    actionLabel: 'Go to Dashboard',
    actionHref: '/dashboard',
  },
  gigs_created: {
    icon: Briefcase,
    title: 'No gigs posted yet',
    description: 'You haven\'t created any gigs yet. Share your skills and start earning!',
    actionLabel: 'Create Your First Gig',
    actionHref: '/dashboard/gigs/create',
  },
  applications: {
    icon: FileText,
    title: 'No applications yet',
    description: 'You haven\'t applied to any gigs yet. Browse available gigs and start applying!',
    actionLabel: 'Browse Gigs',
    actionHref: '/explore',
  },
  transactions: {
    icon: FolderOpen,
    title: 'No transactions yet',
    description: 'Your transaction history is empty. Complete an order to see your transactions here.',
    actionLabel: 'View Orders',
    actionHref: '/dashboard/orders',
  },
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, className }) => {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-text-muted" />
      </div>
      
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {config.title}
      </h3>
      
      <p className="text-text-secondary max-w-md mb-6">
        {config.description}
      </p>
      
      <Link to={config.actionHref}>
        <Button variant="secondary">
          {config.actionLabel}
        </Button>
      </Link>
    </div>
  )
}

export default EmptyState
