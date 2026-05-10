import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  Loader2,
  ChevronRight,
  Code,
  Palette,
  BookOpen,
  HelpCircle
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import StarRating from '@/components/ui/StarRating'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  topSkill: string
  averageRating: number
  completedOrders: number
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Trophy },
  { id: 'coding', label: 'Coding', icon: Code },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'writing', label: 'Writing', icon: BookOpen },
  { id: 'tutoring', label: 'Tutoring', icon: HelpCircle },
]

const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get(
          `/api/leaderboard?category=${activeCategory}&limit=20`
        )
        setEntries(response.data)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [activeCategory])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 text-center font-medium text-text-muted">{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200'
      case 2:
        return 'bg-gray-50 border-gray-200'
      case 3:
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-white border-border'
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Leaderboard
          </h1>
          <p className="text-text-secondary">
            Top performers across Campus Hub
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border text-text-secondary hover:bg-surface-2'
                )}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            )
          })}
        </div>

        {/* Top 3 Podium */}
        {entries.length >= 3 && !isLoading && (
          <div className="flex justify-center items-end gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pb-4">
              <Avatar
                src={entries[1].avatar}
                name={entries[1].name}
                size="lg"
                className="mb-2"
              />
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-gray-600">2</span>
              </div>
              <p className="font-medium text-text-primary text-sm">{entries[1].name}</p>
              <p className="text-xs text-text-muted">{entries[1].completedOrders} orders</p>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center pb-4">
              <div className="mb-2">
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
              <Avatar
                src={entries[0].avatar}
                name={entries[0].name}
                size="xl"
                className="mb-2"
              />
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2 border-2 border-yellow-400">
                <span className="text-2xl font-bold text-yellow-600">1</span>
              </div>
              <p className="font-semibold text-text-primary">{entries[0].name}</p>
              <p className="text-sm text-text-muted">{entries[0].completedOrders} orders</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{entries[0].averageRating.toFixed(1)}</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pb-4">
              <Avatar
                src={entries[2].avatar}
                name={entries[2].name}
                size="lg"
                className="mb-2"
              />
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-amber-600">3</span>
              </div>
              <p className="font-medium text-text-primary text-sm">{entries[2].name}</p>
              <p className="text-xs text-text-muted">{entries[2].completedOrders} orders</p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-card border border-border shadow-card">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No entries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <Link
                  key={entry.userId}
                  to={`/profile/${entry.userId}`}
                  className={cn(
                    'flex items-center gap-4 p-4 hover:bg-surface-2 transition-colors',
                    getRankStyle(entry.rank)
                  )}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar
                    src={entry.avatar}
                    name={entry.name}
                    size="md"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {entry.name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {entry.topSkill}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center hidden sm:block">
                      <p className="font-medium text-text-primary">{entry.completedOrders}</p>
                      <p className="text-xs text-text-muted">orders</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <StarRating 
                        rating={entry.averageRating} 
                        readonly 
                        size="sm" 
                      />
                      <span className="font-medium text-text-primary ml-1">
                        {entry.averageRating.toFixed(1)}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
