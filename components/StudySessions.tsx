import React, { useState } from 'react';
import { Calendar, Clock, Users, Repeat, Plus, X, Check, AlertCircle } from 'lucide-react';
import { Session } from '../types';

interface StudySessionsProps {
  sessions: Session[];
  onCreateSession?: (session: Omit<Session, 'id' | 'createdAt' | 'status'>) => void;
  onJoinSession?: (sessionId: string) => void;
  currentUserId?: string;
}

const StudySessions: React.FC<StudySessionsProps> = ({
  sessions,
  onCreateSession,
  onJoinSession,
  currentUserId
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    subject: '',
    startTime: '',
    endTime: '',
    pointsOffered: 10,
    isRecurring: false,
    recurringDays: [] as string[]
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Engineering', 'Business', 'Economics', 'Literature', 'History',
    'Programming', 'Data Structures', 'Algorithms', 'Web Development',
    'Machine Learning', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title.trim() || !newSession.description.trim()) return;

    onCreateSession?.({
      helperId: currentUserId || '',
      helpeeId: '', // Will be filled when someone joins
      title: newSession.title.trim(),
      description: newSession.description.trim(),
      subject: newSession.subject,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      pointsOffered: newSession.pointsOffered,
      isRecurring: newSession.isRecurring,
      recurringDays: newSession.isRecurring ? newSession.recurringDays : undefined
    });

    setNewSession({
      title: '',
      description: '',
      subject: '',
      startTime: '',
      endTime: '',
      pointsOffered: 10,
      isRecurring: false,
      recurringDays: []
    });
    setShowCreateForm(false);
  };

  const toggleRecurringDay = (day: string) => {
    setNewSession(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const upcomingSessions = sessions.filter(session => 
    session.status === 'pending' || session.status === 'accepted'
  );

  const mySessions = sessions.filter(session => 
    session.helperId === currentUserId || session.helpeeId === currentUserId
  );

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">Study Sessions</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Create Session
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Create Study Session</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Calculus Study Group"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  value={newSession.subject}
                  onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Describe what you'll be studying and what help you need..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={newSession.startTime}
                  onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={newSession.endTime}
                  onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Points Offered
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={newSession.pointsOffered}
                onChange={(e) => setNewSession({ ...newSession, pointsOffered: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">Offer points to attract helpers (5-100 points)</p>
            </div>

            {/* Recurring Options */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newSession.isRecurring}
                  onChange={(e) => setNewSession({ ...newSession, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-slate-700">
                  <Repeat className="inline w-4 h-4 mr-1" />
                  Recurring Session
                </label>
              </div>

              {newSession.isRecurring && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Select Days:</p>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleRecurringDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          newSession.recurringDays.includes(day)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Session
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

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button className="py-2 px-1 border-b-2 border-indigo-600 text-indigo-600 font-medium">
            Upcoming ({upcomingSessions.length})
          </button>
          <button className="py-2 px-1 border-b-2 border-transparent text-slate-600 hover:text-slate-900">
            My Sessions ({mySessions.length})
          </button>
        </nav>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {upcomingSessions.map((session) => (
          <div key={session.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900">{session.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                  {session.isRecurring && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      <Repeat size={10} />
                      Recurring
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-sm mb-2">{session.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
                    {session.subject}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{new Date(session.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {session.isRecurring && session.recurringDays && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                    <Repeat size={12} />
                    <span>Repeats: {session.recurringDays.join(', ')}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {session.pointsOffered}
                </div>
                <div className="text-xs text-slate-600">points</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={16} />
                <span>Looking for helper</span>
              </div>
              <button
                onClick={() => onJoinSession?.(session.id)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Check size={16} />
                Join Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {upcomingSessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No upcoming study sessions</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create the first session
          </button>
        </div>
      )}
    </div>
  );
};

export default StudySessions;
