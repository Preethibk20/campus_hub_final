import React, { useState, useEffect } from 'react'
import { ThumbsUp, Loader2 } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface Endorsement {
  endorserId: string
  endorserName: string
  endorserAvatar?: string
}

interface Skill {
  name: string
  endorsementCount: number
  endorsements: Endorsement[]
  isEndorsedByMe: boolean
}

interface EndorsementsProps {
  userId: string
  skills: Skill[]
  className?: string
}

const Endorsements: React.FC<EndorsementsProps> = ({ userId, skills: initialSkills, className }) => {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [isLoading, setIsLoading] = useState(false)
  const [endorsingSkill, setEndorsingSkill] = useState<string | null>(null)

  const isOwnProfile = currentUser?.id === userId

  const handleEndorse = async (skillName: string) => {
    if (!currentUser) {
      toast.error('Please log in to endorse')
      return
    }

    try {
      setEndorsingSkill(skillName)
      await apiClient.post('/api/endorsements', {
        targetUserId: userId,
        skill: skillName,
      })

      // Update local state
      setSkills((prev) =>
        prev.map((skill) =>
          skill.name === skillName
            ? {
                ...skill,
                endorsementCount: skill.endorsementCount + 1,
                isEndorsedByMe: true,
                endorsements: [
                  {
                    endorserId: currentUser.id,
                    endorserName: currentUser.name,
                    endorserAvatar: currentUser.avatar,
                  },
                  ...skill.endorsements.slice(0, 4),
                ],
              }
            : skill
        )
      )

      toast.success(`Endorsed ${skillName}!`)
    } catch (error: any) {
      toast.error('Failed to endorse', error.response?.data?.message)
    } finally {
      setEndorsingSkill(null)
    }
  }

  if (!skills || skills.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-text-primary">Skills & Endorsements</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="bg-white rounded-card border border-border p-4 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{skill.name}</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {skill.endorsementCount}
                </span>
              </div>
              
              {!isOwnProfile && !skill.isEndorsedByMe && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEndorse(skill.name)}
                  loading={endorsingSkill === skill.name}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Endorse
                </Button>
              )}
              
              {!isOwnProfile && skill.isEndorsedByMe && (
                <span className="text-sm text-success flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 fill-current" />
                  Endorsed
                </span>
              )}
            </div>

            {/* Endorser Avatars */}
            {skill.endorsements.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {skill.endorsements.slice(0, 5).map((endorsement, index) => (
                    <div
                      key={endorsement.endorserId}
                      className="relative"
                      style={{ zIndex: 5 - index }}
                      title={endorsement.endorserName}
                    >
                      <Avatar
                        src={endorsement.endorserAvatar}
                        name={endorsement.endorserName}
                        size="xs"
                        className="border-2 border-white"
                      />
                    </div>
                  ))}
                </div>
                
                {skill.endorsementCount > 5 && (
                  <span className="text-xs text-text-muted">
                    +{skill.endorsementCount - 5} more
                  </span>
                )}
              </div>
            )}

            {skill.endorsements.length === 0 && (
              <p className="text-sm text-text-muted">
                No endorsements yet. Be the first!
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Endorsements
