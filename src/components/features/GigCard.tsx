import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Clock, 
  Star, 
  User, 
  MapPin, 
  Calendar,
  Briefcase,
  HelpCircle
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'
import { formatCurrency, truncateText } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface GigCardProps {
  gig: {
    id: string
    title: string
    description: string
    category: string
    type: 'SERVICE' | 'REQUEST'
    minBudget: number
    maxBudget: number
    timeline: number
    attachments: Array<string | { url: string }>
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
    poster: {
      id: string
      name: string
      avatar?: string
      rating: number
      reviewCount: number
    }
    createdAt: string
  }
  compact?: boolean
  className?: string
}

const categoryColors: Record<string, string> = {
  'Programming': 'bg-blue-100 text-blue-800',
  'Design': 'bg-purple-100 text-purple-800',
  'Writing': 'bg-green-100 text-green-800',
  'Marketing': 'bg-orange-100 text-orange-800',
  'Business': 'bg-yellow-100 text-yellow-800',
  'Data Science': 'bg-indigo-100 text-indigo-800',
  'Engineering': 'bg-red-100 text-red-800',
  'Other': 'bg-gray-100 text-gray-800',
}

const statusColors: Record<string, string> = {
  'OPEN': 'bg-success text-white',
  'IN_PROGRESS': 'bg-warning text-white',
  'COMPLETED': 'bg-info text-white',
}

const typeColors: Record<string, string> = {
  'SERVICE': 'bg-primary text-white',
  'REQUEST': 'bg-accent text-white',
}

const typeIcons: Record<string, React.ReactNode> = {
  'SERVICE': <Briefcase className="w-3 h-3" />,
  'REQUEST': <HelpCircle className="w-3 h-3" />,
}

const GigCard: React.FC<GigCardProps> = ({ 
  gig, 
  compact = false, 
  className 
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/gigs/${gig.id}`)
  }

  const categoryColor = categoryColors[gig.category] || categoryColors['Other']
  const statusColor = statusColors[gig.status] || statusColors['OPEN']
  const typeColor = typeColors[gig.type] || typeColors['SERVICE']
  const typeIcon = typeIcons[gig.type] || typeIcons['SERVICE']

  const rawAtt = gig.attachments[0]
  const thumbnail =
    (typeof rawAtt === 'string' ? rawAtt : rawAtt?.url) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.category)}&background=random&color=fff`

  if (compact) {
    return (
      <div 
        className={cn(
          'bg-white rounded-card border border-border p-4 shadow-card hover:shadow-lg transition-shadow cursor-pointer',
          className
        )}
        onClick={handleClick}
      >
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
            <img
              src={thumbnail}
              alt={gig.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className={cn('text-xs', categoryColor)}>
                    {gig.category}
                  </Badge>
                  <Badge variant="default" className={cn('text-xs flex items-center gap-1', typeColor)}>
                    {typeIcon}
                    {gig.type}
                  </Badge>
                  <Badge variant="default" className={cn('text-xs', statusColor)}>
                    {gig.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h3 className="font-semibold text-text-primary text-sm mb-1">
                  {truncateText(gig.title, 50)}
                </h3>
                <p className="text-text-secondary text-xs mb-2">
                  {truncateText(gig.description, 80)}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="font-medium text-text-primary">
                  {formatCurrency(gig.minBudget)}–{formatCurrency(gig.maxBudget)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {gig.timeline}d
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar
                  src={gig.poster.avatar}
                  name={gig.poster.name}
                  size="sm"
                />
                <span className="text-xs text-text-secondary">
                  {gig.poster.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'bg-white rounded-card border border-border overflow-hidden shadow-card hover:shadow-lg transition-all duration-200 cursor-pointer group',
        className
      )}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={thumbnail}
          alt={gig.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="default" className={categoryColor}>
            {gig.category}
          </Badge>
          <Badge variant="default" className={cn('flex items-center gap-1', typeColor)}>
            {typeIcon}
            {gig.type}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge variant="default" className={statusColor}>
            {gig.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-text-primary text-lg mb-2 line-clamp-2">
          {gig.title}
        </h3>
        
        {/* Description */}
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {truncateText(gig.description, 120)}
        </p>

        {/* Budget and Timeline */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-bold text-text-primary">
              {formatCurrency(gig.minBudget)}–{formatCurrency(gig.maxBudget)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{gig.timeline} days</span>
          </div>
        </div>

        {/* Poster Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar
              src={gig.poster.avatar}
              name={gig.poster.name}
              size="sm"
            />
            <div>
              <p className="font-medium text-text-primary text-sm">
                {gig.poster.name}
              </p>
              <div className="flex items-center gap-2">
                <StarRating rating={gig.poster.rating} readonly size="sm" />
                <span className="text-xs text-text-secondary">
                  ({gig.poster.reviewCount})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GigCard
