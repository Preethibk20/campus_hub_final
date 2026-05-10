import React, { useState } from 'react';
import { Users, Calendar, Clock, Repeat, Plus, Check, MessageCircle, Video } from 'lucide-react';

interface StudyBuddyProps {
  onCreateBuddy: (topic: string, schedule: string, maxMembers: number) => void;
  onJoinBuddy: (buddyId: string) => void;
}

const StudyBuddy: React.FC<StudyBuddyProps> = ({ onCreateBuddy, onJoinBuddy }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [topic, setTopic] = useState('');
  const [schedule, setSchedule] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);

  const studyGroups = [
    {
      id: '1',
      topic: 'Calculus II Study Group',
      schedule: 'Mon/Wed 6-8 PM',
      members: 3,
      maxMembers: 5,
      nextSession: 'Today, 6:00 PM',
      isRecurring: true
    },
    {
      id: '2',
      topic: 'Physics Problem Solving',
      schedule: 'Tue/Thu 7-9 PM',
      members: 2,
      maxMembers: 4,
      nextSession: 'Tomorrow, 7:00 PM',
      isRecurring: true
    },
    {
      id: '3',
      topic: 'React Project Help',
      schedule: 'Fri 3-5 PM',
      members: 4,
      maxMembers: 4,
      nextSession: 'Friday, 3:00 PM',
      isRecurring: false
    }
  ];

  const handleCreate = () => {
    if (topic.trim() && schedule.trim()) {
      onCreateBuddy(topic.trim(), schedule.trim(), maxMembers);
      setTopic('');
      setSchedule('');
      setMaxMembers(4);
      setShowCreateForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">Study Buddy</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Create Group
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Create Study Group</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Study Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Organic Chemistry, Data Structures"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Schedule
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="e.g., Mon/Wed 6-8 PM, Daily 5-6 PM"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Max Members
              </label>
              <select
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={2}>2 members</option>
                <option value={3}>3 members</option>
                <option value={4}>4 members</option>
                <option value={5}>5 members</option>
                <option value={6}>6 members</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Group
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studyGroups.map((group) => (
          <div key={group.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{group.topic}</h4>
                {group.isRecurring && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    <Repeat size={10} />
                    Recurring
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">
                  {group.members}/{group.maxMembers}
                </div>
                <div className="text-xs text-slate-600">members</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{group.schedule}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Next: {group.nextSession}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onJoinBuddy(group.id)}
                disabled={group.members >= group.maxMembers}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users size={16} />
                {group.members >= group.maxMembers ? 'Group Full' : 'Join Group'}
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                <MessageCircle size={16} />
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                <Video size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h4 className="font-semibold text-slate-900 mb-4">Why Study Buddies?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-medium text-slate-900">Regular Meetings</h5>
            <p className="text-sm text-slate-600">Build consistent study habits with recurring sessions</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-medium text-slate-900">Flexible Scheduling</h5>
            <p className="text-sm text-slate-600">Set your own schedule that works for everyone</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h5 className="font-medium text-slate-900">Better Results</h5>
            <p className="text-sm text-slate-600">Study together and achieve better grades</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;
