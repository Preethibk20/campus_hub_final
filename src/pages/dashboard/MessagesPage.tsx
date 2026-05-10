import React, { useState, useEffect } from 'react'
import { Send, MessageCircle, Search, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/api/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  senderName: string
}

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await apiClient.get('/api/conversations')
        setConversations(response.data || [])
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
        // Mock data for demo
        setConversations([
          {
            id: '1',
            otherUser: { id: '2', name: 'John Doe', avatar: '' },
            lastMessage: { content: 'Hey, can you help me with my project?', createdAt: '2024-01-15T10:30:00Z', senderId: '2' },
            unreadCount: 2,
          },
          {
            id: '2',
            otherUser: { id: '3', name: 'Jane Smith', avatar: '' },
            lastMessage: { content: 'Thanks for your help!', createdAt: '2024-01-14T15:45:00Z', senderId: '3' },
            unreadCount: 0,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await apiClient.get(`/api/conversations/${selectedConversation.id}/messages`)
          setMessages(response.data || [])
        } catch (error) {
          console.error('Failed to fetch messages:', error)
          // Mock messages for demo
          setMessages([
            {
              id: '1',
              content: 'Hey, can you help me with my project?',
              createdAt: '2024-01-15T10:30:00Z',
              senderId: '2',
              senderName: 'John Doe',
            },
            {
              id: '2',
              content: 'Sure! What do you need help with?',
              createdAt: '2024-01-15T10:35:00Z',
              senderId: user?.id || '',
              senderName: user?.name || 'You',
            },
          ])
        }
      }

      fetchMessages()
    }
  }, [selectedConversation, user])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const message = {
        content: newMessage,
        conversationId: selectedConversation.id,
      }

      const response = await apiClient.post('/api/messages', message)
      
      // Add message to local state
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      // Mock sending for demo
      const mockMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        createdAt: new Date().toISOString(),
        senderId: user?.id || '',
        senderName: user?.name || 'You',
      }
      setMessages(prev => [...prev, mockMessage])
      setNewMessage('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Conversations */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No messages yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Browse gigs and reach out to someone!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {conversation.otherUser.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedConversation.otherUser.name}
                  </p>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
