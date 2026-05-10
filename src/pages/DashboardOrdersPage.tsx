import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, 
  Briefcase, 
  Calendar, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EscrowStatusBadge from '@/components/features/EscrowStatusBadge'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  gig: {
    id: string
    title: string
    category: string
    attachments: string[]
  }
  buyer: {
    id: string
    name: string
    avatar?: string
  }
  seller: {
    id: string
    name: string
    avatar?: string
  }
  amount: number
  currency: string
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
  escrowStatus: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
  createdAt: string
  updatedAt: string
  deliveryNotes?: string
}

interface OrdersResponse {
  data: Order[]
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const DashboardOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying')
  const [orders, setOrders] = useState<OrdersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()
  const toast = useToast()

  const fetchOrders = async (page: number = 1) => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/api/orders/me?role=${activeTab}&page=${page}&size=10`)
      setOrders(response.data)
    } catch (error: any) {
      toast.error('Failed to load orders', error.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    fetchOrders(1)
  }, [activeTab])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchOrders(page)
  }

  const handleOrderClick = (orderId: string) => {
    navigate(`/dashboard/orders/${orderId}`)
  }

  const getOtherParty = (order: Order) => {
    return activeTab === 'buying' ? order.seller : order.buyer
  }

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const otherParty = getOtherParty(order)
    const thumbnail = order.gig.attachments[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.gig.title)}&background=random&color=fff`

    return (
      <div 
        className="bg-white rounded-card border border-border p-6 shadow-card hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleOrderClick(order.id)}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
            <img
              src={thumbnail}
              alt={order.gig.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary text-lg mb-1 truncate">
                  {order.gig.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="text-xs">
                    {order.gig.category}
                  </Badge>
                  <Badge 
                    variant="default" 
                    className={cn(
                      'text-xs',
                      order.status === 'completed' ? 'bg-success text-white' :
                      order.status === 'disputed' ? 'bg-danger text-white' :
                      order.status === 'in_progress' ? 'bg-warning text-white' :
                      order.status === 'delivered' ? 'bg-info text-white' :
                      'bg-surface-2 text-text-muted'
                    )}
                  >
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={otherParty.avatar}
                  name={otherParty.name}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {activeTab === 'buying' ? 'Seller' : 'Buyer'}: {otherParty.name}
                  </p>
                  <p className="text-xs text-text-secondary flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-text-primary">
                  {formatCurrency(order.amount)}
                </p>
                <EscrowStatusBadge status={order.escrowStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Orders</h1>
          <p className="text-text-secondary">Track and manage your orders and payments</p>
        </div>

        <div className="bg-white rounded-card border border-border p-1 shadow-card mb-6">
          <div className="flex space-x-1">
            {[
              { key: 'buying', label: 'Buying', icon: <ShoppingCart className="w-4 h-4" /> },
              { key: 'selling', label: 'Selling', icon: <Briefcase className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'buying' | 'selling')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-btn text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-card border border-border p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-surface-2 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-surface-2 rounded w-3/4"></div>
                      <div className="h-4 bg-surface-2 rounded w-1/2"></div>
                      <div className="h-4 bg-surface-2 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : !orders || orders.data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'buying' ? (
                  <ShoppingCart className="w-8 h-8 text-text-muted" />
                ) : (
                  <Briefcase className="w-8 h-8 text-text-muted" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No orders yet</h3>
              <p className="text-text-secondary mb-4">
                {activeTab === 'buying' 
                  ? 'Start by browsing gigs and placing your first order.'
                  : 'Your orders will appear here once clients place them.'
                }
              </p>
              {activeTab === 'buying' && (
                <Button onClick={() => navigate('/explore')}>Browse Gigs</Button>
              )}
            </div>
          ) : (
            <>
              {orders.data.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}

              {orders.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6">
                  <div className="text-sm text-text-secondary">
                    Showing {((orders.pagination.page - 1) * orders.pagination.size) + 1} to{' '}
                    {Math.min(orders.pagination.page * orders.pagination.size, orders.pagination.total)} of{' '}
                    {orders.pagination.total} orders
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(orders.pagination.page - 1)}
                      disabled={!orders.pagination.hasPrev}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <span className="px-3 py-1 text-sm text-text-primary">
                      Page {orders.pagination.page} of {orders.pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(orders.pagination.page + 1)}
                      disabled={!orders.pagination.hasNext}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardOrdersPage
