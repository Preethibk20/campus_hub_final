import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Package, 
  CheckCircle, 
  AlertTriangle,
  MessageCircle,
  Truck,
  User
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import OrderStatusTracker from '@/components/features/OrderStatusTracker'
import EscrowStatusBadge from '@/components/features/EscrowStatusBadge'

import DisputeModal from '@/components/features/DisputeModal'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  gig: {
    id: string
    title: string
    description: string
    category: string
    attachments: string[]
    timeline: number
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
  statusHistory: {
    stage: string
    timestamp: string
  }[]
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        const response = await apiClient.get(`/api/orders/${id}`)
        setOrder(response.data)
      } catch (error: any) {
        console.error('Failed to fetch order:', error)
        toast.error('Failed to load order', error.response?.data?.message)
        navigate('/dashboard/orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id, toast, navigate])

  const handleMarkAsDelivered = async () => {
    if (!order) return

    try {
      setIsActionLoading(true)
      await apiClient.post(`/api/orders/${order.id}/deliver`)
      
      toast.success('Order marked as delivered')
      // Refresh order data
      const response = await apiClient.get(`/api/orders/${order.id}`)
      setOrder(response.data)
    } catch (error: any) {
      toast.error('Failed to mark as delivered', error.response?.data?.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCompleteOrder = async () => {
    if (!order) return

    try {
      setIsActionLoading(true)
      await apiClient.post(`/api/orders/${order.id}/complete`)
      
      toast.success('Order completed successfully')
      // Refresh order data
      const response = await apiClient.get(`/api/orders/${order.id}`)
      setOrder(response.data)
    } catch (error: any) {
      toast.error('Failed to complete order', error.response?.data?.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDisputeSuccess = () => {
    // Refresh order data
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get(`/api/orders/${id}`)
        setOrder(response.data)
      } catch (error) {
        console.error('Failed to refresh order:', error)
      }
    }
    fetchOrder()
  }

  const handleMessage = () => {
    if (!order) return
    
    const otherParty = user?.id === order.buyer.id ? order.seller : order.buyer
    navigate('/dashboard/messages', { 
      state: { participantId: otherParty.id } 
    })
  }

  const getUserRole = () => {
    if (!order || !user) return null
    return user.id === order.buyer.id ? 'buyer' : 'seller'
  }

  const canDispute = () => {
    const role = getUserRole()
    return order && (
      (order.escrowStatus === 'held' && order.status === 'in_progress') ||
      (order.status === 'delivered')
    )
  }

  const getActionButtons = () => {
    const role = getUserRole()
    if (!order || !role) return null

    const buttons = []

    // Buyer actions
    if (role === 'buyer') {

      
      if (order.status === 'delivered') {
        buttons.push(
          <Button
            key="complete"
            onClick={handleCompleteOrder}
            loading={isActionLoading}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve & Release Payment
          </Button>
        )
      }
    }

    // Seller actions
    if (role === 'seller') {
      if (order.escrowStatus === 'held' && order.status === 'in_progress') {
        buttons.push(
          <Button
            key="deliver"
            onClick={handleMarkAsDelivered}
            loading={isActionLoading}
            className="flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            Mark as Delivered
          </Button>
        )
      }
    }

    // Both parties can dispute
    if (canDispute()) {
      buttons.push(
        <Button
          key="dispute"
          variant="secondary"
          onClick={() => setIsDisputeModalOpen(true)}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Raise Dispute
        </Button>
      )
    }

    // Message button for both
    buttons.push(
      <Button
        key="message"
        variant="ghost"
        onClick={handleMessage}
        className="flex items-center gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        Message
      </Button>
    )

    return buttons
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Order Not Found
          </h1>
          <p className="text-text-secondary mb-4">
            The order you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/dashboard/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const role = getUserRole()
  const otherParty = role === 'buyer' ? order.seller : order.buyer
  const thumbnail = order.gig.attachments[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.gig.title)}&background=random&color=fff`

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Order Details (60%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Order Status Tracker */}
            <OrderStatusTracker
              currentStatus={
                order.status === 'pending'
                  ? 'order_placed'
                  : order.status === 'in_progress'
                    ? 'in_progress'
                    : order.status === 'delivered'
                      ? 'delivered'
                      : order.status === 'completed'
                        ? 'completed'
                        : order.status === 'disputed'
                          ? 'disputed'
                          : 'order_placed'
              }
              statusHistory={order.statusHistory}
              isDisputed={
                order.status === 'disputed' || order.escrowStatus === 'disputed'
              }
            />

            {/* Gig Details */}
            <div className="bg-white rounded-card border border-border p-6 shadow-card">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Gig Details
              </h2>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={thumbnail}
                    alt={order.gig.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary text-lg mb-2">
                    {order.gig.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-2 line-clamp-3">
                    {order.gig.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>Category: {order.gig.category}</span>
                    <span>Timeline: {order.gig.timeline} days</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-lg font-bold text-text-primary">
                  {formatCurrency(order.amount)}
                </div>
                <EscrowStatusBadge status={order.escrowStatus} />
              </div>
            </div>

            {/* Delivery Notes */}
            {order.deliveryNotes && (
              <div className="bg-white rounded-card border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-text-primary mb-4">
                  Delivery Notes
                </h2>
                <div className="bg-surface-2 rounded-lg p-4">
                  <p className="text-text-secondary whitespace-pre-wrap">
                    {order.deliveryNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Other Party Info */}
            <div className="bg-white rounded-card border border-border p-6 shadow-card">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {role === 'buyer' ? 'Seller' : 'Buyer'} Information
              </h2>
              
              <div className="flex items-center gap-4">
                <Avatar
                  src={otherParty.avatar}
                  name={otherParty.name}
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary text-lg">
                    {otherParty.name}
                  </h3>
                  <p className="text-text-secondary">
                    {role === 'buyer' ? 'Service Provider' : 'Client'}
                  </p>
                </div>
                
                <Button
                  variant="secondary"
                  onClick={handleMessage}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Action Panel (40%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-card border border-border p-6 shadow-card sticky top-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                Actions
              </h2>
              
              <div className="space-y-3">
                {getActionButtons()?.map((button, index) => (
                  <div key={index}>
                    {button}
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-medium text-text-primary mb-4">
                  Order Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Order ID</span>
                    <span className="font-mono text-text-primary">#{order.id.slice(-8)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Placed on</span>
                    <span className="text-text-primary">{formatDate(order.createdAt)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Amount</span>
                    <span className="font-medium text-text-primary">{formatCurrency(order.amount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Status</span>
                    <span className="font-medium text-text-primary">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {order && (
        <DisputeModal
          orderId={order.id}
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          onSuccess={handleDisputeSuccess}
        />
      )}
    </div>
  )
}

export default OrderDetailPage
