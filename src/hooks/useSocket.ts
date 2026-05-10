import { useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import socketService from '@/lib/socketService'
import { useChatStore } from '@/stores/chatStore'

let socketHookConsumers = 0

export const useSocket = () => {
  const { token, isAuthenticated, user } = useAuth()
  const {
    isConnected,
    setConnected,
    addMessage,
    setTyping,
    addNotification,
    markConversationAsRead,
  } = useChatStore()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketHookConsumers = 0
      socketService.disconnect()
      return
    }

    socketHookConsumers += 1

    if (socketHookConsumers === 1) {
      socketService.connect(token)
    }

    // Subscribe to connection status
    const unsubscribeConnection = socketService.onConnectionStatus((connected) => {
      setConnected(connected)
    })

    return () => {
      unsubscribeConnection()
      socketHookConsumers = Math.max(0, socketHookConsumers - 1)
      if (socketHookConsumers === 0) {
        socketService.disconnect()
      }
    }
  }, [isAuthenticated, token, setConnected])

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isConnected) {
      return
    }

    return socketService.subscribeToNotifications(user.id, (notification) => {
      addNotification(notification)
    })
  }, [isAuthenticated, user?.id, isConnected, addNotification])

  const subscribe = useCallback((
    conversationId: string,
    onMessage: (message: any) => void,
    onTyping?: (event: any) => void
  ) => {
    if (!socketService.isConnected()) {
      console.warn('Cannot subscribe: socket not connected')
      return () => {}
    }

    // Get last seen timestamp for missed messages
    const messages = useChatStore.getState().messages[conversationId]
    const lastSeenTimestamp = messages?.length > 0 
      ? messages[messages.length - 1].timestamp 
      : undefined

    return socketService.subscribeToConversation(
      conversationId,
      (message) => {
        addMessage(message)
        onMessage(message)
      },
      onTyping ? (event) => {
        setTyping(event.conversationId, event.userId, event.userName, event.isTyping)
        onTyping(event)
      } : undefined,
      lastSeenTimestamp
    )
  }, [isConnected, addMessage, setTyping])

  const sendMessage = useCallback(
    (
      conversationId: string,
      content: string,
      type: 'text' | 'file' | 'image' = 'text'
    ) => {
    if (!socketService.isConnected()) {
      console.warn('Cannot send message: socket not connected')
      return
    }

    socketService.sendMessage(conversationId, content, type)
  }, [])

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socketService.isConnected()) {
      return
    }

    socketService.sendTyping(conversationId, isTyping)
  }, [])

  const markAsRead = useCallback((conversationId: string) => {
    markConversationAsRead(conversationId)
  }, [markConversationAsRead])

  return {
    isConnected,
    subscribe,
    sendMessage,
    sendTyping,
    markAsRead,
  }
}

export default useSocket
