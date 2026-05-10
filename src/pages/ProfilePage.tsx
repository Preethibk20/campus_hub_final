import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  Mail, 
  Calendar, 
  Star, 
  MessageCircle, 
  Briefcase,
  Award,
  Grid3X3,
  User
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import StarRating from '@/components/ui/StarRating'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  collegeName?: string
  department?: string
  yearOfStudy?: number
  bio?: string
  skills: string[]
  rating: number
  totalReviews: number
  completedOrders: number
  portfolioUrls: string[]
  createdAt: string
}

interface Review {
  id: string
  orderId: string
  clientId: string
  clientName: string
  clientAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user: currentUser, isAuthenticated } = useAuth()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        
        // Fetch profile
        const profileResponse = await apiClient.get(`/api/profile/${id}`)
        setProfile(profileResponse.data)

        // Fetch reviews
        const reviewsResponse = await apiClient.get(`/api/reviews/user/${id}`)
        setReviews(reviewsResponse.data)
      } catch (error: any) {
        console.error('Failed to fetch profile:', error)
        toast.error('Failed to load profile', error.response?.data?.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [id, toast])

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to send messages')
      navigate('/login')
      return
    }

    if (!profile) return

    try {
      // Create conversation
      const response = await apiClient.post('/api/conversations', {
        participantId: profile.id,
      })

      navigate(`/dashboard/inbox/${response.data.id}`)
    } catch (error: any) {
      toast.error('Failed to start conversation', error.response?.data?.message)
    }
  }

  const handleHire = () => {
    if (!profile) return
    navigate(`/explore?user=${profile.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Profile Not Found
          </h1>
          <p className="text-text-secondary">
            The profile you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={profile.avatar}
                name={profile.name}
                size="xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {profile.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-3">
                    {profile.collegeName && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.collegeName}
                      </div>
                    )}
                    {profile.department && profile.yearOfStudy && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {profile.department} • Year {profile.yearOfStudy}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(profile.createdAt, { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isOwnProfile ? (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/dashboard/profile/edit')}
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleMessage}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                    <Button
                      onClick={handleHire}
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Hire
                    </Button>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-text-secondary mb-4">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-surface-2 rounded-lg">
                  <div className="text-2xl font-bold text-text-primary">
                    {profile.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-text-secondary flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    Rating
                  </div>
                </div>
                <div className="text-center p-3 bg-surface-2 rounded-lg">
                  <div className="text-2xl font-bold text-text-primary">
                    {profile.totalReviews}
                  </div>
                  <div className="text-sm text-text-secondary">Reviews</div>
                </div>
                <div className="text-center p-3 bg-surface-2 rounded-lg">
                  <div className="text-2xl font-bold text-text-primary">
                    {profile.completedOrders}
                  </div>
                  <div className="text-sm text-text-secondary">Completed</div>
                </div>
                <div className="text-center p-3 bg-surface-2 rounded-lg">
                  <div className="text-2xl font-bold text-text-primary">
                    {profile.skills.length}
                  </div>
                  <div className="text-sm text-text-secondary">Skills</div>
                </div>
              </div>

              {/* Skills */}
              {profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio */}
          {profile.portfolioUrls.length > 0 && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-card border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5" />
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.portfolioUrls.map((url, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <img
                        src={url}
                        alt={`Portfolio item ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className={profile.portfolioUrls.length > 0 ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <div className="bg-white rounded-card border border-border p-6 shadow-card">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Reviews ({reviews.length})
              </h2>
              
              {reviews.length === 0 ? (
                <p className="text-text-secondary text-center py-8">
                  No reviews yet
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={review.clientAvatar}
                          name={review.clientName}
                          size="sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-text-primary">
                              {review.clientName}
                            </h4>
                            <span className="text-xs text-text-muted">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <StarRating rating={review.rating} readonly size="sm" />
                          <p className="text-text-secondary text-sm mt-2">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
