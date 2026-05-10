import React, { useState } from 'react';
import { HelpCircle, Clock, DollarSign, Users, BookOpen, Zap, Search, ArrowRight } from 'lucide-react';

interface QuickHelpProps {
  onRequestHelp: (topic: string, major: string, isAcademic: boolean) => void;
}

const QuickHelp: React.FC<QuickHelpProps> = ({ onRequestHelp }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [isAcademic, setIsAcademic] = useState(true);

  const commonTopics = [
    'Calculus Homework', 'Physics Problem', 'Code Debugging', 'Essay Review',
    'Lab Report', 'Statistics Help', 'Chemistry Equations', 'Programming Project',
    'Data Analysis', 'Research Paper', 'Presentation Prep', 'Exam Study'
  ];

  const majors = [
    'Computer Science', 'Engineering', 'Mathematics', 'Physics', 
    'Chemistry', 'Biology', 'Business', 'Economics', 'Literature', 'Psychology'
  ];

  const handleQuickHelp = (topic: string, major: string, academic: boolean = true) => {
    onRequestHelp(topic, major, academic);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-4">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Get instant help from fellow students</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">I Need Help With...</h1>
        <p className="text-slate-600">One click to connect with students who can help</p>
      </div>

      {/* Quick Topic Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-600" />
          What do you need help with?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {commonTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedTopic === topic
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-medium text-sm">{topic}</div>
            </button>
          ))}
        </div>
        
        {/* Custom Topic Input */}
        <div className="mt-4">
          <input
            type="text"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            placeholder="Or type your specific need..."
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Major Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Your Major/Field
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {majors.map((major) => (
            <button
              key={major}
              onClick={() => setSelectedMajor(major)}
              className={`p-3 rounded-lg border text-center transition-all ${
                selectedMajor === major
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-medium text-sm">{major}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Help Type Selection */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Help Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setIsAcademic(true)}
            className={`p-4 rounded-lg border-2 transition-all ${
              isAcademic
                ? 'border-green-600 bg-green-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-green-700">Academic Help</div>
                <div className="text-sm text-green-600">FREE - For coursework and studies</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setIsAcademic(false)}
            className={`p-4 rounded-lg border-2 transition-all ${
              !isAcademic
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-indigo-700">Other Projects</div>
                <div className="text-sm text-indigo-600">Paid - Up to $25/hour max</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={() => selectedTopic && selectedMajor && handleQuickHelp(selectedTopic, selectedMajor, isAcademic)}
          disabled={!selectedTopic || !selectedMajor}
          className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <Users className="w-5 h-5" />
          {isAcademic ? 'Find Free Help Now' : 'Find Paid Help Now'}
          <ArrowRight className="w-5 h-5" />
        </button>
        
        {selectedTopic && selectedMajor && (
          <div className="mt-4 text-sm text-slate-600">
            <Clock className="inline w-4 h-4 mr-1" />
            Average match time: <strong>under 2 minutes</strong>
          </div>
        )}
      </div>

      {/* Recent Help Requests */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Students getting help right now</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Computer Science major needs help with React debugging</span>
            <span className="text-slate-400">• 1 min ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Mathematics major needs calculus homework help</span>
            <span className="text-slate-400">• 3 min ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Engineering major needs physics problem solved</span>
            <span className="text-slate-400">• 5 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickHelp;
