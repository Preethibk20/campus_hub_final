import React, { useEffect, useState } from 'react'
import { Plus, Search, MessageSquare } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { useChatStore, type Conversation } from '@/stores/chatStore'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import apiClient from '@/api/client'

interface User {
  id: string
  name: string
  avatar?: string
  email: string
  primaryGigId?: string
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void
  selectedConversationId: string | null
  className?: string
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
  className,
}) => {
  const { conversations, loadConversations } = useChatStore()
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (conversationId: string) => {
    onSelectConversation(conversationId)
  }

  return (
    <div className={cn('flex flex-col h-full bg-white border-r border-border', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNewMessageModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageSquare className="w-12 h-12 text-text-muted mb-3" />
            <p className="text-text-secondary">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsNewMessageModalOpen(true)}
                className="mt-4"
              >
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelect(conversation.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-surface-2',
                  selectedConversationId === conversation.id && 'bg-surface-2'
                )}
              >
                <Avatar
                  src={conversation.participantAvatar}
                  name={conversation.participantName}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn(
                      'font-medium truncate',
                      conversation.unreadCount > 0 ? 'text-text-primary' : 'text-text-secondary'
                    )}>
                      {conversation.participantName}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-text-muted whitespace-nowrap ml-2">
                        {formatRelativeTime(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={cn(
                      'text-sm truncate',
                      conversation.unreadCount > 0 ? 'text-text-primary font-medium' : 'text-text-secondary'
                    )}>
                      {conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.type === 'file' && '📎 '}
                          {conversation.lastMessage.type === 'image' && '🖼️ '}
                          {conversation.lastMessage.content}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </p>

                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {isNewMessageModalOpen && (
        <NewMessageModal
          onClose={() => setIsNewMessageModalOpen(false)}
          onSelectConversation={handleSelect}
        />
      )}
    </div>
  )
}

// New Message Modal Component
interface NewMessageModalProps {
  onClose: () => void
  onSelectConversation: (conversationId: string) => void
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({
  onClose,
  onSelectConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { addConversation } = useChatStore()

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([])
        return
      }

      setIsLoading(true)
      try {
        const response = await apiClient.get(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        setUsers(response.data)
      } catch (error) {
        console.error('Failed to search users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timeout = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleStartConversation = async (user: User) => {
    try {
      const requestBody = user.primaryGigId
        ? { gigId: user.primaryGigId }
        : { participantId: user.id }

      const response = await apiClient.post('/api/conversations', {
        ...requestBody,
      })

      const conversation: Conversation = {
        id: response.data.id,
        participantId: user.id,
        participantName: user.name,
        participantAvatar: user.avatar,
        unreadCount: 0,
        createdAt: String(response.data.createdAt ?? new Date().toISOString()),
        updatedAt: String(response.data.createdAt ?? new Date().toISOString()),
      }

      addConversation(conversation)
      onSelectConversation(conversation.id)
      onClose()
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-card border border-border shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">New Message</h3>
          <p className="text-sm text-text-secondary">Search for a user to start a conversation</p>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartConversation(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors text-left"
                >
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div>
                    <p className="font-medium text-text-primary">{user.name}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <p className="text-center text-text-secondary py-8">No users found</p>
          ) : null}
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConversationList
