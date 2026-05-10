import React, { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Star, Target } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  timeRange: 'week' | 'month' | 'all-time';
  onTimeRangeChange: (range: 'week' | 'month' | 'all-time') => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  timeRange,
  onTimeRangeChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'points' | 'rating' | 'sessions'>('points');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-slate-500">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    switch (selectedCategory) {
      case 'points':
        return b.points - a.points;
      case 'rating':
        return b.rating - a.rating;
      case 'sessions':
        return b.sessionsCompleted - a.sessionsCompleted;
      default:
        return b.points - a.points;
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'points':
        return <Trophy className="w-4 h-4" />;
      case 'rating':
        return <Star className="w-4 h-4" />;
      case 'sessions':
        return <Target className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'points':
        return 'Campus Points';
      case 'rating':
        return 'Average Rating';
      case 'sessions':
        return 'Sessions Completed';
      default:
        return 'Campus Points';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">Leaderboard</h3>
        </div>
        <div className="flex items-center gap-2">
          {(['week', 'month', 'all-time'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Category Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">Sort by:</span>
          <div className="flex gap-2">
            {(['points', 'rating', 'sessions'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {getCategoryIcon(category)}
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {sortedEntries.slice(0, 3).map((entry, index) => {
          const rank = index + 1;
          return (
            <div
              key={entry.userId}
              className={`${getRankBgColor(rank)} border rounded-xl p-6 text-center relative ${
                rank === 1 ? 'md:transform md:scale-105' : ''
              }`}
            >
              {rank === 1 && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
              )}
              <div className="flex justify-center mb-3">
                {getRankIcon(rank)}
              </div>
              <img
                src={entry.avatar || `https://picsum.photos/seed/${entry.userId}/100`}
                alt={entry.name}
                className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white shadow-md"
              />
              <h4 className="font-bold text-slate-900 mb-1">{entry.name}</h4>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-indigo-600">
                  {selectedCategory === 'points' ? entry.points :
                   selectedCategory === 'rating' ? entry.rating.toFixed(1) :
                   entry.sessionsCompleted}
                </p>
                <p className="text-xs text-slate-600">
                  {getCategoryLabel(selectedCategory)}
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{entry.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{entry.sessionsCompleted}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>{entry.badges}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of the List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {sortedEntries.slice(3).map((entry, index) => {
            const rank = index + 4;
            return (
              <div key={entry.userId} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-center w-8">
                  <span className="text-sm font-bold text-slate-500">#{rank}</span>
                </div>
                <img
                  src={entry.avatar || `https://picsum.photos/seed/${entry.userId}/100`}
                  alt={entry.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{entry.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {entry.rating.toFixed(1)} rating
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {entry.sessionsCompleted} sessions
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {entry.badges} badges
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">
                    {selectedCategory === 'points' ? entry.points :
                     selectedCategory === 'rating' ? entry.rating.toFixed(1) :
                     entry.sessionsCompleted}
                  </p>
                  <p className="text-xs text-slate-600">
                    {getCategoryLabel(selectedCategory)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No leaderboard data available</p>
          <p className="text-sm text-slate-500 mt-1">Start helping others to climb the ranks!</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Helpers</p>
              <p className="text-xl font-bold text-slate-900">{entries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Sessions Completed</p>
              <p className="text-xl font-bold text-slate-900">
                {entries.reduce((sum, entry) => sum + entry.sessionsCompleted, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Badges Earned</p>
              <p className="text-xl font-bold text-slate-900">
                {entries.reduce((sum, entry) => sum + entry.badges, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
