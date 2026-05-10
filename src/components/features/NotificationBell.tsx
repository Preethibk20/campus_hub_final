import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, MessageSquare, ShoppingCart, Star, AlertCircle, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/stores/chatStore'
import apiClient from '@/api/client'
import { formatRelativeTime } from '@/lib/utils'
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

interface NotificationApiResponse {
  id: string
  type: string
  title: string
  body: string
  isRead?: boolean
  createdAt: string
  metadata?: Record<string, unknown>
}

interface NotificationPageResponse {
  content: NotificationApiResponse[]
}

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { notifications: liveNotifications, markNotificationsAsRead } = useChatStore()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    loadUnreadCount()
  }, [])

  useEffect(() => {
    const liveUnread = liveNotifications.filter((notification) => !notification.read).length
    if (liveUnread > 0) {
      setUnreadCount((current) => Math.max(current, liveUnread))
    }
  }, [liveNotifications])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get<NotificationPageResponse>('/api/notifications?page=0&size=10')
      setNotifications(response.data.content.map(normalizeNotification))
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await apiClient.get('/api/notifications/unread')
      setUnreadCount(Number(response.data.count ?? 0))
    } catch (error) {
      console.error('Failed to load unread notification count:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.post('/api/notifications/read-all')
      markNotificationsAsRead()
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const normalizeNotification = (notification: NotificationApiResponse): Notification => {
    const type = notification.type.toLowerCase()
    return {
      id: String(notification.id),
      type: type.includes('message')
        ? 'message'
        : type.includes('order')
        ? 'order'
        : type.includes('gig')
        ? 'gig'
        : type.includes('review')
        ? 'review'
        : 'system',
      title: String(notification.title ?? ''),
      body: String(notification.body ?? ''),
      redirectUrl:
        typeof notification.metadata?.conversationId === 'string' && type.includes('message')
          ? `/dashboard/inbox/${notification.metadata.conversationId}`
          : undefined,
      read: Boolean(notification.isRead),
      createdAt: String(notification.createdAt),
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false)
    
    // Mark as read
    if (!notification.read) {
      apiClient.post(`/api/notifications/${notification.id}/read`).catch(console.error)
      setUnreadCount((current) => Math.max(0, current - 1))
    }

    // Navigate based on type/URL
    if (notification.redirectUrl) {
      navigate(notification.redirectUrl)
    } else {
      // Default navigation based on type
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
          navigate('/dashboard/notifications')
      }
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />
      case 'order':
        return <ShoppingCart className="w-4 h-4" />
      case 'gig':
        return <Star className="w-4 h-4" />
      case 'review':
        return <Star className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
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

  const unreadNotifications = notifications.filter((n) => !n.read)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-surface-2 transition-colors"
      >
        <Bell className="w-5 h-5 text-text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-card border border-border shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-10 h-10 text-text-muted mx-auto mb-2" />
                <p className="text-text-secondary">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'w-full flex items-start gap-3 p-4 text-left hover:bg-surface-2 transition-colors',
                      !notification.read && 'bg-surface-2/50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      getIconColor(notification.type)
                    )}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'font-medium text-sm',
                          !notification.read ? 'text-text-primary' : 'text-text-secondary'
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2 mt-0.5">
                        {notification.body}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/dashboard/notifications')
              }}
              className="w-full flex items-center justify-center gap-1 text-sm text-primary hover:text-primary-dark py-2"
            >
              View all notifications
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
