import { create } from 'zustand'
import socketService, { Message, Notification, TypingEvent } from '@/lib/socketService'

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

interface ConversationApiResponse {
  id: string
  gigId?: string | null
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string | null
  lastMessagePreview?: string | null
  lastMessageAt?: string | null
  unreadCount: number
  createdAt: string
}

interface MessageApiResponse {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  type: 'text' | 'file' | 'image'
  fileUrl?: string | null
  isRead?: boolean
  createdAt: string
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  typingUsers: Record<string, { userId: string; userName: string; timeout?: NodeJS.Timeout }>
  
  // Actions
  setConnected: (connected: boolean) => void
  loadConversations: () => Promise<void>
  loadMessages: (conversationId: string, page?: number) => Promise<void>
  setActiveConversation: (conversationId: string | null) => void
  addMessage: (message: Message) => void
  updateConversation: (conversation: Conversation) => void
  addConversation: (conversation: Conversation) => void
  markConversationAsRead: (conversationId: string) => void
  setTyping: (conversationId: string, userId: string, userName: string, isTyping: boolean) => void
  addNotification: (notification: Notification) => void
  markNotificationsAsRead: () => void
  updateUnreadCount: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  typingUsers: {},

  setConnected: (connected: boolean) => {
    set({ isConnected: connected })
  },

  loadConversations: async () => {
    try {
      const response = await fetch('/api/conversations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data: ConversationApiResponse[] = await response.json()
        const conversations = data.map((conversation) => ({
          id: String(conversation.id),
          participantId: String(conversation.otherUserId),
          participantName: String(conversation.otherUserName ?? 'Unknown user'),
          participantAvatar: conversation.otherUserAvatar ? String(conversation.otherUserAvatar) : undefined,
          lastMessage: conversation.lastMessageAt
            ? {
                id: `preview-${conversation.id}`,
                conversationId: String(conversation.id),
                senderId: '',
                senderName: '',
                content: String(conversation.lastMessagePreview ?? ''),
                type: 'text' as const,
                timestamp: String(conversation.lastMessageAt),
                read: true,
              }
            : undefined,
          unreadCount: Number(conversation.unreadCount ?? 0),
          createdAt: String(conversation.createdAt),
          updatedAt: String(conversation.lastMessageAt ?? conversation.createdAt),
        }))

        conversations.sort((a, b) => {
          const dateA = a.lastMessage?.timestamp || a.updatedAt
          const dateB = b.lastMessage?.timestamp || b.updatedAt
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })
        set({ conversations })
        get().updateUnreadCount()
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  },

  loadMessages: async (conversationId: string, page = 0) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?page=${page}&size=50`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const messages = ((data.content || data || []) as MessageApiResponse[]).map((message) => ({
          id: String(message.id),
          conversationId: String(message.conversationId),
          senderId: String(message.senderId),
          senderName: String(message.senderName ?? ''),
          content: String(message.content ?? ''),
          type: message.type ?? 'text',
          fileUrl: message.fileUrl ? String(message.fileUrl) : undefined,
          read: Boolean(message.isRead),
          timestamp: String(message.createdAt),
        }))
        
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: page === 0 
              ? messages 
              : [...messages, ...(state.messages[conversationId] || [])],
          },
        }))
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  },

  setActiveConversation: (conversationId: string | null) => {
    set({ activeConversationId: conversationId })
    if (conversationId) {
      get().markConversationAsRead(conversationId)
    }
  },

  addMessage: (message: Message) => {
    set((state) => {
      const conversationId = message.conversationId
      const existingMessages = state.messages[conversationId] || []
      
      if (existingMessages.some((m) => m.id === message.id)) {
        return state
      }

      const isActive = state.activeConversationId === conversationId

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message],
        },
        conversations: state.conversations
          .map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: message,
                  updatedAt: message.timestamp,
                  unreadCount: isActive ? 0 : conv.unreadCount + 1,
                }
              : conv
          )
          .sort((a, b) => {
            const dateA = a.lastMessage?.timestamp || a.updatedAt
            const dateB = b.lastMessage?.timestamp || b.updatedAt
            return new Date(dateB).getTime() - new Date(dateA).getTime()
          }),
      }
    })
    
    get().updateUnreadCount()
  },

  updateConversation: (conversation: Conversation) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversation.id ? conversation : conv
      ),
    }))
  },

  addConversation: (conversation: Conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }))
  },

  markConversationAsRead: (conversationId: string) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    }))
    get().updateUnreadCount()
  },

  setTyping: (conversationId: string, userId: string, userName: string, isTyping: boolean) => {
    set((state) => {
      const currentTyping = state.typingUsers[conversationId]
      
      if (currentTyping?.timeout) {
        clearTimeout(currentTyping.timeout)
      }

      if (!isTyping) {
        const { [conversationId]: _, ...rest } = state.typingUsers
        return { typingUsers: rest }
      }

      const timeout = setTimeout(() => {
        get().setTyping(conversationId, userId, userName, false)
      }, 5000)

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: { userId, userName, timeout },
        },
      }
    })
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications.slice(0, 99)],
    }))
  },

  markNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  updateUnreadCount: () => {
    const { conversations } = get()
    const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
    set({ unreadCount: total })
  },
}))
