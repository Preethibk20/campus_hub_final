import React, { useState } from 'react';
import { Award, CheckCircle, AlertCircle, Linkedin, ExternalLink, Shield } from 'lucide-react';

interface SkillBadge {
  id: string;
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verified: boolean;
  verifiedBy?: string;
  projects?: number;
  earnedAt: string;
}

interface SkillBadgesProps {
  badges: SkillBadge[];
  onVerifySkill?: (skill: string) => void;
  onExportToLinkedIn?: () => void;
  isOwnProfile?: boolean;
}

const SkillBadges: React.FC<SkillBadgesProps> = ({
  badges,
  onVerifySkill,
  onExportToLinkedIn,
  isOwnProfile = false
}) => {
  const [showVerification, setShowVerification] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Advanced': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Expert': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Beginner': return '🌱';
      case 'Intermediate': return '🌿';
      case 'Advanced': return '🌳';
      case 'Expert': return '🏆';
      default: return '📚';
    }
  };

  const handleVerifyRequest = (skill: string) => {
    setSelectedSkill(skill);
    setShowVerification(true);
  };

  const submitVerification = () => {
    onVerifySkill?.(selectedSkill);
    setShowVerification(false);
    setSelectedSkill('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">Skill Badges</h3>
        </div>
        {isOwnProfile && (
          <div className="flex gap-2">
            <button
              onClick={() => onExportToLinkedIn?.()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Linkedin size={16} />
              Export to LinkedIn
            </button>
          </div>
        )}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getLevelIcon(badge.level)}</div>
                <div>
                  <h4 className="font-semibold text-slate-900">{badge.skill}</h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(badge.level)}`}>
                    {badge.level}
                  </span>
                </div>
              </div>
              {badge.verified ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-xs font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle size={16} />
                  <span className="text-xs font-medium">Pending</span>
                </div>
              )}
            </div>

            {badge.verified && badge.verifiedBy && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Shield className="w-4 h-4" />
                  <span>Verified by {badge.verifiedBy}</span>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Projects completed:</span>
                <span className="font-medium">{badge.projects || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Earned:</span>
                <span className="font-medium">{new Date(badge.earnedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {!badge.verified && isOwnProfile && (
              <button
                onClick={() => handleVerifyRequest(badge.skill)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Shield size={16} />
                Request Verification
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h4 className="font-semibold text-slate-900 mb-4">Verify Your Skill</h4>
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                To verify your <strong>{selectedSkill}</strong> skills, please provide:
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Links to projects demonstrating this skill</li>
                <li>• Certifications or course completion</li>
                <li>• GitHub repositories or portfolio pieces</li>
              </ul>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Proof Links (comma separated)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="https://github.com/username/project, https://portfolio.com/project"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={submitVerification}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Submit for Verification
              </button>
              <button
                onClick={() => setShowVerification(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {badges.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No skill badges yet</p>
          {isOwnProfile && (
            <p className="text-sm text-slate-500 mt-2">
              Complete projects and get verified to earn badges
            </p>
          )}
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h4 className="font-semibold text-slate-900 mb-4">Why Get Verified?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-medium text-slate-900">Build Trust</h5>
            <p className="text-sm text-slate-600">Verified skills help others trust your expertise</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Linkedin className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-medium text-slate-900">LinkedIn Ready</h5>
            <p className="text-sm text-slate-600">Export verified skills to your LinkedIn profile</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-medium text-slate-900">Stand Out</h5>
            <p className="text-sm text-slate-600">Get priority matching and more help requests</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillBadges;
