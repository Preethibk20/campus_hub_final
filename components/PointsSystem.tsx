import React from 'react';
import { Coins, TrendingUp, Gift, Clock } from 'lucide-react';

interface PointsSystemProps {
  userPoints: number;
  pointsEarned?: number;
  pointsSpent?: number;
  level?: string;
  nextLevelPoints?: number;
}

const PointsSystem: React.FC<PointsSystemProps> = ({
  userPoints,
  pointsEarned = 0,
  pointsSpent = 0,
  level = 'Beginner',
  nextLevelPoints = 100
}) => {
  const progressPercentage = Math.min((userPoints / nextLevelPoints) * 100, 100);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'text-gray-600';
      case 'intermediate': return 'text-blue-600';
      case 'advanced': return 'text-purple-600';
      case 'expert': return 'text-yellow-600';
      case 'master': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-full">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Campus Points</h3>
            <p className={`text-sm font-medium ${getLevelColor(level)}`}>{level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{userPoints}</p>
          <p className="text-xs text-slate-600">points</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Progress to {level === 'Master' ? 'Max Level' : 'Next Level'}</span>
          <span>{userPoints}/{nextLevelPoints}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Points Activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-slate-600">Earned</span>
          </div>
          <p className="text-lg font-semibold text-green-600">+{pointsEarned}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-red-500" />
            <span className="text-xs text-slate-600">Spent</span>
          </div>
          <p className="text-lg font-semibold text-red-600">-{pointsSpent}</p>
        </div>
      </div>

      {/* Ways to Earn Points */}
      <div className="mt-4 p-3 bg-white rounded-lg">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Earn More Points:</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock className="w-3 h-3" />
            <span>Complete a help session (+10 pts)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Gift className="w-3 h-3" />
            <span>Receive a 5-star review (+5 pts)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <TrendingUp className="w-3 h-3" />
            <span>Help 3 students in a week (+15 pts)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsSystem;
