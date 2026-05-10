import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Check, 
  MessageSquare, 
  ShoppingCart, 
  Star, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { useChatStore } from '@/stores/chatStore'
import apiClient from '@/api/client'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'message' | 'order' | 'gig' | 'review' | 'system'
  title: string
  body: string
  redirectUrl?: string
  read: boolean
  createdAt: string
}

interface NotificationsResponse {
  content: Notification[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const navigate = useNavigate()
  const { markNotificationsAsRead } = useChatStore()

  const fetchNotifications = async (page: number = 0) => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/api/notifications?page=${page}&size=20`)
      setNotifications(response.data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications(currentPage)
  }, [currentPage])

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.post('/api/notifications/read-all')
      markNotificationsAsRead()
      
      // Update local state
      setNotifications((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((n) => ({ ...n, read: true })),
            }
          : null
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.post(`/api/notifications/${id}/read`)
      
      // Update local state
      setNotifications((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
            }
          : null
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/notifications/${id}`)
      
      // Update local state
      setNotifications((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.filter((n) => n.id !== id),
              totalElements: prev.totalElements - 1,
            }
          : null
      )
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }

    // Navigate
    if (notification.redirectUrl) {
      navigate(notification.redirectUrl)
    } else {
      switch (notification.type) {
        case 'message':
          navigate('/dashboard/inbox')
          break
        case 'order':
          navigate('/dashboard/orders')
          break
        case 'gig':
          navigate('/dashboard/my-gigs')
          break
        case 'review':
          navigate('/dashboard/reviews')
          break
        default:
          // Stay on current page
          break
      }
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5" />
      case 'order':
        return <ShoppingCart className="w-5 h-5" />
      case 'gig':
        return <Star className="w-5 h-5" />
      case 'review':
        return <Star className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-600'
      case 'order':
        return 'bg-green-100 text-green-600'
      case 'gig':
        return 'bg-purple-100 text-purple-600'
      case 'review':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const unreadCount = notifications?.content.filter((n) => !n.read).length || 0

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Notifications
            </h1>
            <p className="text-text-secondary">
              Stay updated with your messages, orders, and activity
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-card border border-border shadow-card">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !notifications || notifications.content.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No notifications
              </h3>
              <p className="text-text-secondary">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {notifications.content.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-4 p-4 hover:bg-surface-2 transition-colors',
                      !notification.read && 'bg-surface-2/30'
                    )}
                  >
                    {/* Icon */}
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        getIconColor(notification.type)
                      )}
                    >
                      {getIcon(notification.type)}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              'font-medium',
                              !notification.read
                                ? 'text-text-primary'
                                : 'text-text-secondary'
                            )}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-muted whitespace-nowrap">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-text-muted mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 hover:bg-surface-2 rounded-lg text-primary"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 hover:bg-danger/10 rounded-lg text-danger"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {notifications.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                  <div className="text-sm text-text-secondary">
                    Showing {currentPage * notifications.size + 1} to{' '}
                    {Math.min(
                      (currentPage + 1) * notifications.size,
                      notifications.totalElements
                    )}{' '}
                    of {notifications.totalElements} notifications
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 0}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <span className="px-3 py-1 text-sm text-text-primary">
                      Page {currentPage + 1} of {notifications.totalPages}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= notifications.totalPages - 1}
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

export default NotificationsPage
