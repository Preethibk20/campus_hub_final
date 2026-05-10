import React, { useState } from 'react';
import { Users, Plus, Calendar, MapPin, Filter, Search, X, UserPlus } from 'lucide-react';
import { TeamFinderPost, TeamMember } from '../types';

interface TeamFinderProps {
  posts: TeamFinderPost[];
  onCreatePost?: (post: Omit<TeamFinderPost, 'id' | 'creatorId' | 'createdAt' | 'currentMembers'>) => void;
  onJoinTeam?: (postId: string) => void;
  currentUserId?: string;
}

const TeamFinder: React.FC<TeamFinderProps> = ({
  posts,
  onCreatePost,
  onJoinTeam,
  currentUserId
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    hackathonName: '',
    hackathonDate: '',
    requiredSkills: '',
    maxMembers: 4
  });

  const commonSkills = [
    'React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX Design',
    'Data Science', 'Mobile Dev', 'Backend', 'Frontend', 'DevOps',
    'Blockchain', 'AR/VR', 'Game Dev', 'IoT', 'Cloud'
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.hackathonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => 
                           post.requiredSkills.some(reqSkill => 
                             reqSkill.toLowerCase().includes(skill.toLowerCase())
                           )
                         );
    
    return matchesSearch && matchesSkills && post.status === 'open';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.description.trim()) return;

    onCreatePost?.({
      title: newPost.title.trim(),
      description: newPost.description.trim(),
      hackathonName: newPost.hackathonName.trim(),
      hackathonDate: newPost.hackathonDate,
      requiredSkills: newPost.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      maxMembers: newPost.maxMembers,
      status: 'open'
    });

    setNewPost({
      title: '',
      description: '',
      hackathonName: '',
      hackathonDate: '',
      requiredSkills: '',
      maxMembers: 4
    });
    setShowCreateForm(false);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">Team Finder</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Create Team
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hackathons or team posts..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Skill Filters */}
        <div className="flex flex-wrap gap-2">
          {commonSkills.map(skill => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedSkills.includes(skill)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Create Team Post</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Code Warriors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hackathon Name *
                </label>
                <input
                  type="text"
                  value={newPost.hackathonName}
                  onChange={(e) => setNewPost({ ...newPost, hackathonName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="HackMIT 2024"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your team idea and what you're building..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hackathon Date
                </label>
                <input
                  type="date"
                  value={newPost.hackathonDate}
                  onChange={(e) => setNewPost({ ...newPost, hackathonDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max Team Size
                </label>
                <select
                  value={newPost.maxMembers}
                  onChange={(e) => setNewPost({ ...newPost, maxMembers: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={2}>2 members</option>
                  <option value={3}>3 members</option>
                  <option value={4}>4 members</option>
                  <option value={5}>5 members</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                value={newPost.requiredSkills}
                onChange={(e) => setNewPost({ ...newPost, requiredSkills: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="React, Node.js, UI/UX Design"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Team Post
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{post.title}</h4>
                <p className="text-sm text-indigo-600 font-medium">{post.hackathonName}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {post.currentMembers.length}/{post.maxMembers} members
              </span>
            </div>

            <p className="text-slate-600 text-sm mb-4 line-clamp-3">
              {post.description}
            </p>

            {post.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              {post.hackathonDate && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(post.hackathonDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users size={12} />
                <span>{post.currentMembers.length} joined</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onJoinTeam?.(post.id)}
                disabled={post.currentMembers.length >= post.maxMembers}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus size={16} />
                {post.currentMembers.length >= post.maxMembers ? 'Team Full' : 'Join Team'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No team posts found</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create the first team post
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamFinder;
