import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  CheckCircle2, 
  Star, 
  Shield, 
  Zap, 
  GraduationCap,
  Lock,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import apiClient from '@/api/client'

interface Badge {
  id: string
  type: string
  name: string
  description: string
  earnedAt?: string
  isEarned: boolean
}

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; color: string; description: string }> = {
  first_gig: {
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600 border-blue-200',
    description: 'First Gig Posted',
  },
  first_order_completed: {
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600 border-green-200',
    description: 'First Order Completed',
  },
  top_rated: {
    icon: <Star className="w-6 h-6" />,
    color: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    description: 'Top Rated (4.5+)',
  },
  trusted_seller: {
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-600 border-purple-200',
    description: 'Trusted Seller (10+ orders)',
  },
  power_buyer: {
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-600 border-orange-200',
    description: 'Power Buyer',
  },
  verified_student: {
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    description: 'Verified Student',
  },
}

interface BadgeShelfProps {
  userId: string
  showAll?: boolean
  className?: string
}

const BadgeShelf: React.FC<BadgeShelfProps> = ({ userId, showAll = false, className }) => {
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await apiClient.get(`/api/badges/user/${userId}`)
        // Merge with all possible badges
        const allBadges = Object.keys(BADGE_CONFIG).map((type) => {
          const earned = response.data.find((b: Badge) => b.type === type)
          return {
            id: earned?.id || type,
            type,
            name: BADGE_CONFIG[type].description,
            description: `Earned by completing ${BADGE_CONFIG[type].description}`,
            earnedAt: earned?.earnedAt,
            isEarned: !!earned,
          }
        })
        setBadges(allBadges)
      } catch (error) {
        console.error('Failed to fetch badges:', error)
        // Show all badges as unearned on error
        setBadges(
          Object.keys(BADGE_CONFIG).map((type) => ({
            id: type,
            type,
            name: BADGE_CONFIG[type].description,
            description: `Earned by completing ${BADGE_CONFIG[type].description}`,
            isEarned: false,
          }))
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchBadges()
  }, [userId])

  const earnedBadges = badges.filter((b) => b.isEarned)
  const displayBadges = showAll ? badges : earnedBadges

  if (isLoading) {
    return (
      <div className={cn('flex justify-center py-4', className)}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    )
  }

  if (!showAll && earnedBadges.length === 0) {
    return (
      <div className={cn('text-center py-4 bg-surface-2 rounded-card', className)}>
        <Trophy className="w-8 h-8 text-text-muted mx-auto mb-2" />
        <p className="text-sm text-text-secondary">No badges earned yet</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {!showAll && <h3 className="text-lg font-semibold text-text-primary">Badges</h3>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {displayBadges.map((badge) => {
          const config = BADGE_CONFIG[badge.type]
          return (
            <div
              key={badge.id}
              className={cn(
                'relative group p-4 rounded-card border text-center transition-all',
                badge.isEarned
                  ? config.color
                  : 'bg-gray-100 text-gray-400 border-gray-200 grayscale opacity-60'
              )}
            >
              <div className="flex justify-center mb-2">{config.icon}</div>
              <p className="text-xs font-medium">{badge.name}</p>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-2 text-text-primary text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {badge.description}
                {badge.earnedAt && (
                  <span className="block text-text-muted mt-1">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {!badge.isEarned && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BadgeShelf
