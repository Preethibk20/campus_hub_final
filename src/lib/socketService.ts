import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  type: 'text' | 'file' | 'image'
  fileUrl?: string
  fileName?: string
  timestamp: string
  read: boolean
}

export interface Notification {
  id: string
  type: 'message' | 'order' | 'gig' | 'review' | 'system'
  title: string
  body: string
  redirectUrl?: string
  read: boolean
  createdAt: string
}

export interface TypingEvent {
  conversationId: string
  userId: string
  userName: string
  isTyping: boolean
}

type MessageCallback = (message: Message) => void
type NotificationCallback = (notification: Notification) => void
type TypingCallback = (event: TypingEvent) => void
type ConnectionCallback = (connected: boolean) => void

interface BackendMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  type: 'text' | 'file' | 'image'
  fileUrl?: string
  isRead?: boolean
  createdAt: string
}

interface BackendNotification {
  id: string
  type: string
  title: string
  body: string
  metadata?: Record<string, unknown>
  isRead?: boolean
  createdAt: string
}

class SocketService {
  private client: Client | null = null
  private messageCallbacks: Map<string, MessageCallback[]> = new Map()
  private typingCallbacks: Map<string, TypingCallback[]> = new Map()
  private notificationCallbacks: NotificationCallback[] = []
  private connectionCallbacks: ConnectionCallback[] = []
  private subscriptions: Map<string, StompSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  private hasActiveConnection(): boolean {
    return this.client?.connected ?? false
  }

  connect(token: string): void {
    if (this.client?.active) {
      console.log('Socket already connected')
      return
    }

    const WS_URL = import.meta.env.VITE_WS_URL || '/ws'
    const sockjs = new SockJS(`${WS_URL}?token=${encodeURIComponent(token)}`)
    
    this.client = new Client({
      webSocketFactory: () => sockjs as WebSocket,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('STOMP connection established')
        this.reconnectAttempts = 0
        this.notifyConnectionStatus(true)
        this.resubscribeAll()
      },
      onDisconnect: () => {
        console.log('STOMP connection disconnected')
        this.notifyConnectionStatus(false)
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
        this.notifyConnectionStatus(false)
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
        this.notifyConnectionStatus(false)
      },
    })

    this.client.activate()
  }

  disconnect(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.subscriptions.clear()
    
    if (this.client?.active) {
      this.client.deactivate()
    }
    
    this.client = null
    this.notifyConnectionStatus(false)
  }

  isConnected(): boolean {
    return this.hasActiveConnection()
  }

  onConnectionStatus(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback)
    return () => {
      const index = this.connectionCallbacks.indexOf(callback)
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1)
      }
    }
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(connected))
  }

  subscribeToConversation(
    conversationId: string,
    onMessage: MessageCallback,
    onTyping?: TypingCallback,
    lastSeenTimestamp?: string
  ): () => void {
    if (!this.hasActiveConnection() || !this.client) {
      console.warn('Cannot subscribe: not connected')
      return () => {}
    }

    const messageKey = `conv-${conversationId}`
    const typingKey = `typing-${conversationId}`

    // Store callbacks
    if (!this.messageCallbacks.has(messageKey)) {
      this.messageCallbacks.set(messageKey, [])
    }
    this.messageCallbacks.get(messageKey)!.push(onMessage)

    if (onTyping) {
      if (!this.typingCallbacks.has(typingKey)) {
        this.typingCallbacks.set(typingKey, [])
      }
      this.typingCallbacks.get(typingKey)!.push(onTyping)
    }

    // Subscribe to messages
    const messageSub = this.client.subscribe(
      `/topic/conversation.${conversationId}`,
      (message: IMessage) => {
        const body = this.normalizeMessage(JSON.parse(message.body) as BackendMessage)
        this.messageCallbacks.get(messageKey)?.forEach((cb) => cb(body))
      },
      lastSeenTimestamp ? { lastSeenTimestamp } : undefined
    )
    this.subscriptions.set(messageKey, messageSub)

    // Subscribe to typing events
    const typingSub = this.client.subscribe(
      `/topic/conversation.${conversationId}.typing`,
      (message: IMessage) => {
        const raw = JSON.parse(message.body) as Partial<TypingEvent>
        const body: TypingEvent = {
          conversationId,
          userId: String(raw.userId ?? ''),
          userName: String(raw.userName ?? 'Someone'),
          isTyping: Boolean(raw.isTyping),
        }
        this.typingCallbacks.get(typingKey)?.forEach((cb) => cb(body))
      }
    )
    this.subscriptions.set(typingKey, typingSub)

    // Return unsubscribe function
    return () => {
      messageSub.unsubscribe()
      typingSub.unsubscribe()
      this.subscriptions.delete(messageKey)
      this.subscriptions.delete(typingKey)
      
      const msgCallbacks = this.messageCallbacks.get(messageKey)
      if (msgCallbacks) {
        const idx = msgCallbacks.indexOf(onMessage)
        if (idx > -1) msgCallbacks.splice(idx, 1)
      }
      
      if (onTyping) {
        const typeCallbacks = this.typingCallbacks.get(typingKey)
        if (typeCallbacks) {
          const idx = typeCallbacks.indexOf(onTyping)
          if (idx > -1) typeCallbacks.splice(idx, 1)
        }
      }
    }
  }

  subscribeToNotifications(userId: string, onNotification: NotificationCallback): () => void {
    if (!this.hasActiveConnection() || !this.client) {
      console.warn('Cannot subscribe to notifications: not connected')
      return () => {}
    }

    this.notificationCallbacks.push(onNotification)

    const sub = this.client.subscribe(
      '/user/queue/notifications',
      (message: IMessage) => {
        const body = this.normalizeNotification(JSON.parse(message.body) as BackendNotification)
        this.notificationCallbacks.forEach((cb) => cb(body))
      }
    )
    this.subscriptions.set(`notifications-${userId}`, sub)

    return () => {
      sub.unsubscribe()
      this.subscriptions.delete(`notifications-${userId}`)
      const idx = this.notificationCallbacks.indexOf(onNotification)
      if (idx > -1) this.notificationCallbacks.splice(idx, 1)
    }
  }

  sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'file' | 'image' = 'text'
  ): void {
    if (!this.hasActiveConnection() || !this.client) {
      console.warn('Cannot send message: not connected')
      return
    }

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        conversationId,
        content,
        type,
      }),
    })
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.hasActiveConnection() || !this.client) {
      return
    }

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({
        conversationId,
        isTyping,
      }),
    })
  }

  private normalizeMessage(message: BackendMessage): Message {
    return {
      id: String(message.id),
      conversationId: String(message.conversationId),
      senderId: String(message.senderId),
      senderName: String(message.senderName),
      content: String(message.content ?? ''),
      type: message.type ?? 'text',
      fileUrl: message.fileUrl ? String(message.fileUrl) : undefined,
      timestamp: String(message.createdAt),
      read: Boolean(message.isRead),
    }
  }

  private normalizeNotification(notification: BackendNotification): Notification {
    const type = notification.type?.toLowerCase()
    const mappedType: Notification['type'] =
      type?.includes('message') ? 'message'
      : type?.includes('order') ? 'order'
      : type?.includes('gig') ? 'gig'
      : type?.includes('review') ? 'review'
      : 'system'

    return {
      id: String(notification.id),
      type: mappedType,
      title: String(notification.title ?? ''),
      body: String(notification.body ?? ''),
      redirectUrl: this.getNotificationRedirect(notification),
      read: Boolean(notification.isRead),
      createdAt: String(notification.createdAt),
    }
  }

  private getNotificationRedirect(notification: BackendNotification): string | undefined {
    const conversationId = notification.metadata?.conversationId
    if (typeof conversationId === 'string' && notification.type?.toLowerCase().includes('message')) {
      return `/dashboard/inbox/${conversationId}`
    }

    return undefined
  }

  private resubscribeAll(): void {
    // Resubscribe to all previously subscribed channels
    this.subscriptions.forEach((sub, key) => {
      sub.unsubscribe()
    })
    this.subscriptions.clear()
    
    // Clear callbacks but they'll be re-added by components on reconnect
    this.messageCallbacks.clear()
    this.typingCallbacks.clear()
  }
}

export const socketService = new SocketService()
export default socketService
