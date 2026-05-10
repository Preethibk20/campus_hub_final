import React, { useState } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useChatStore } from '@/stores/chatStore'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/api/client'

interface MessageButtonProps {
  userId: string
  userName: string
  gigId?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const MessageButton: React.FC<MessageButtonProps> = ({
  userId,
  userName,
  gigId,
  variant = 'outline',
  size = 'sm',
  className
}) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { setActiveConversation } = useChatStore()

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    try {
      // Find or create conversation
      const response = await apiClient.post('/api/conversations', {
        participantId: userId,
        gigId: gigId
      })
      
      const conversationId = response.data.id || response.data._id
      setActiveConversation(conversationId)
      navigate(`/dashboard/inbox/${conversationId}`)
    } catch (error: any) {
      console.error('Failed to start conversation:', error)
      toast.error('Could not start conversation', error.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleMessageClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <MessageSquare className="w-4 h-4 mr-2" />
          Message {userName}
        </>
      )}
    </Button>
  )
}

export default MessageButton
