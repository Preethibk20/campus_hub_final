import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Menu, X, MessageSquare } from 'lucide-react'
import ConversationList from '@/components/features/ConversationList'
import ChatWindow from '@/components/features/ChatWindow'
import { useChatStore } from '@/stores/chatStore'
import { useSocket } from '@/hooks/useSocket'
import { cn } from '@/lib/utils'

const InboxPage: React.FC = () => {
  const { conversationId: urlConversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const { conversations, loadConversations, setActiveConversation, activeConversationId } = useChatStore()
  const { isConnected } = useSocket()
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showMobileList, setShowMobileList] = useState(true)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)

  // Load conversations on mount
  useEffect(() => {
    let isMounted = true

    const syncConversations = async () => {
      setIsLoadingConversations(true)
      try {
        await loadConversations()
      } finally {
        if (isMounted) {
          setIsLoadingConversations(false)
        }
      }
    }

    syncConversations()

    return () => {
      isMounted = false
    }
  }, [loadConversations])

  // Handle URL param for conversation
  useEffect(() => {
    if (urlConversationId) {
      setSelectedConversationId(urlConversationId)
      setActiveConversation(urlConversationId)
      setShowMobileList(false)
    }
  }, [urlConversationId, setActiveConversation])

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setActiveConversation(id)
    navigate(`/dashboard/inbox/${id}`)
    setShowMobileList(false)
  }

  const handleBackToList = () => {
    setShowMobileList(true)
    navigate('/dashboard/inbox')
  }

  // Get selected conversation details
  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  )
  const hasSelectedConversation = Boolean(selectedConversationId)
  const isResolvingSelectedConversation =
    hasSelectedConversation && isLoadingConversations && !selectedConversation
  const isMissingSelectedConversation =
    hasSelectedConversation && !isLoadingConversations && !selectedConversation

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* Header - Mobile only */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border">
        <h1 className="text-lg font-semibold text-text-primary">Messages</h1>
        <div className="flex items-center gap-2">
          {!showMobileList && selectedConversation && (
            <button
              onClick={handleBackToList}
              className="p-2 hover:bg-surface-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {showMobileList && (
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-surface-2 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List Panel */}
        <div
          className={cn(
            'w-full lg:w-80 xl:w-96 flex-shrink-0',
            showMobileList ? 'block' : 'hidden lg:block'
          )}
        >
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
          />
        </div>

        {/* Chat Window Panel */}
        <div
          className={cn(
            'flex-1 flex flex-col',
            !showMobileList ? 'block' : 'hidden lg:block'
          )}
        >
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation.id}
              participantName={selectedConversation.participantName}
              participantAvatar={selectedConversation.participantAvatar}
            />
          ) : isResolvingSelectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Loading conversation
              </h2>
              <p className="text-text-secondary text-center max-w-md px-4">
                Fetching the participant details for this chat.
              </p>
            </div>
          ) : isMissingSelectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
              <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-text-muted" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Conversation not available
              </h2>
              <p className="text-text-secondary text-center max-w-md px-4">
                This chat link does not match any conversation currently available for your account.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
              <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-text-muted" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Select a conversation
              </h2>
              <p className="text-text-secondary text-center max-w-md px-4">
                Choose a conversation from the list to start messaging, or start a new conversation.
              </p>
              {!isConnected && (
                <div className="mt-4 px-4 py-2 bg-warning/10 text-warning rounded-lg text-sm">
                  Connecting to chat server...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InboxPage
