import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Paperclip, FileText, Download, Check, CheckCheck } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { useSocket } from '@/hooks/useSocket'
import { useChatStore } from '@/stores/chatStore'
import { useAuth } from '@/hooks/useAuth'
import { formatTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import apiClient from '@/api/client'

interface Message {
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

interface ChatWindowProps {
  conversationId: string
  participantName: string
  participantAvatar?: string
  className?: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  participantName,
  participantAvatar,
  className,
}) => {
  const { user } = useAuth()
  const { messages, loadMessages, typingUsers } = useChatStore()
  const { subscribe, sendMessage, sendTyping } = useSocket()
  
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const conversationMessages = messages[conversationId] || []

  // Load messages on mount
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId)
    }
  }, [conversationId, loadMessages])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = subscribe(
      conversationId,
      (message) => {
        // Message already added to store by useSocket
        scrollToBottom()
      },
      (event) => {
        // Typing event handled by store
      }
    )

    return () => {
      unsubscribe()
    }
  }, [conversationId, subscribe])

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversationMessages])

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true)
      sendTyping(conversationId, true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTyping(conversationId, false)
    }, 2000)
  }, [conversationId, isTyping, sendTyping])

  // Send message
  const handleSend = () => {
    if (!inputText.trim()) return

    sendMessage(conversationId, inputText.trim(), 'text')
    setInputText('')
    
    // Stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    setIsTyping(false)
    sendTyping(conversationId, false)
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // File upload with dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!conversationId || acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      await apiClient.post(
        `/api/conversations/${conversationId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      // The upload endpoint already saves and broadcasts the message.
      // Avoid publishing a second copy over STOMP.
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setIsUploading(false)
    }
  }, [conversationId])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
  })

  // Get typing indicator for this conversation
  const typingUser = typingUsers[conversationId]

  // Group messages by date
  const groupedMessages = conversationMessages.reduce<Record<string, Message[]>>((groups, message) => {
    const date = new Date(message.timestamp).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Avatar src={participantAvatar} name={participantName} size="md" />
        <div>
          <h3 className="font-medium text-text-primary">{participantName}</h3>
          <p className="text-xs text-text-secondary">
            {typingUser ? (
              <span className="text-primary animate-pulse">
                {typingUser.userName} is typing...
              </span>
            ) : (
              'Online'
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        {...getRootProps()}
        className={cn(
          'flex-1 overflow-y-auto p-4 space-y-4',
          isDragActive && 'bg-primary/5'
        )}
      >
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10 m-4">
            <p className="text-primary font-medium">Drop file here to send</p>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-surface-2 text-text-muted text-xs rounded-full">
                {formatDate(date)}
              </span>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {msgs.map((message, index) => {
                const isSent = message.senderId === user?.id
                const showAvatar = !isSent && (index === 0 || msgs[index - 1]?.senderId !== message.senderId)

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2',
                      isSent ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* Avatar for received messages */}
                    {!isSent && showAvatar && (
                      <Avatar
                        src={participantAvatar}
                        name={participantName}
                        size="sm"
                        className="self-end"
                      />
                    )}
                    {!isSent && !showAvatar && <div className="w-8" />}

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2',
                        isSent
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-surface-2 text-text-primary rounded-bl-none'
                      )}
                    >
                      {/* File message */}
                      {message.type === 'file' && (
                        <a
                          href={message.fileUrl || message.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg',
                            isSent ? 'bg-white/20' : 'bg-white'
                          )}
                        >
                          <FileText className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm truncate">{message.fileName || 'File'}</span>
                          <Download className="w-4 h-4 flex-shrink-0" />
                        </a>
                      )}

                      {/* Image message */}
                      {message.type === 'image' && (
                        <a
                          href={message.fileUrl || message.content}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={message.fileUrl || message.content}
                            alt="Shared image"
                            className="max-w-full rounded-lg"
                          />
                        </a>
                      )}

                      {/* Text message */}
                      {message.type === 'text' && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}

                      {/* Timestamp and read receipt */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={cn(
                          'text-xs',
                          isSent ? 'text-white/70' : 'text-text-muted'
                        )}>
                          {formatTime(message.timestamp)}
                        </span>
                        
                        {isSent && (
                          <span className="text-white/70">
                            {message.read ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={open}
            disabled={isUploading}
            className="flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                handleTyping()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              rows={1}
              className="w-full px-4 py-2 bg-surface-2 border border-border rounded-2xl resize-none focus:ring-2 focus:ring-primary focus:border-primary max-h-32"
              style={{ minHeight: '40px' }}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isUploading}
            className="flex-shrink-0"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
