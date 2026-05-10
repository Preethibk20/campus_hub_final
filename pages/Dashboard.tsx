import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  TrendingUp, Users, DollarSign, Clock, CheckCircle, ArrowRight,
  Sparkles, Star, Zap, ArrowUpRight
} from 'lucide-react';
import { MOCK_USER, MOCK_GIGS } from '../constants';

const stats = [
  {
    label: 'Total Earnings',
    value: '$450',
    icon: DollarSign,
    change: '+12%',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'bg-emerald-500',
    glow: 'shadow-emerald-100',
  },
  {
    label: 'Active Tasks',
    value: '3',
    icon: Clock,
    change: '+2',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    accent: 'bg-blue-500',
    glow: 'shadow-blue-100',
  },
  {
    label: 'Completed',
    value: '12',
    icon: CheckCircle,
    change: '+3',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    accent: 'bg-indigo-500',
    glow: 'shadow-indigo-100',
  },
  {
    label: 'Connections',
    value: '28',
    icon: Users,
    change: '+5',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    accent: 'bg-violet-500',
    glow: 'shadow-violet-100',
  },
];

const data = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 65 },
  { name: 'Thu', value: 45 },
  { name: 'Fri', value: 90 },
  { name: 'Sat', value: 70 },
  { name: 'Sun', value: 20 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-sm font-bold">
        <p className="text-slate-400 text-xs mb-0.5">{label}</p>
        <p className="text-white">{payload[0].value} pts</p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-pill bg-indigo-100 text-indigo-600">
              <Zap size={10} /> Live
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Welcome back, <span className="gradient-text">{MOCK_USER.name.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Here's what's happening in your campus network today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            Download Report
          </button>
          <button className="bg-gradient-primary px-5 py-2.5 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
            <Sparkles size={15} /> Create Listing
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-3xl border ${stat.border} card-shadow hover:card-shadow-hover transition-all duration-300 hover-lift p-6 relative overflow-hidden group`}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 ${stat.accent} rounded-t-3xl`}></div>
            <div className="flex items-center justify-between mb-5">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <TrendingUp size={11} /> {stat.change}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1.5">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-slate-100 card-shadow">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900">Activity Overview</h3>
              <p className="text-slate-400 text-sm mt-0.5">Points earned per day</p>
            </div>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['Week', 'Month', 'Year'].map((period) => (
                <button
                  key={period}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    period === 'Week'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8faff', radius: 8 }} />
                <Bar dataKey="value" radius={[8, 8, 4, 4]} barSize={28}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#4f46e5' : '#e0e7ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-7 rounded-3xl border border-slate-100 card-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-xl text-slate-900">Recent Activity</h3>
            <button className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
              See all <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-3 flex-1">
            {MOCK_GIGS.map((gig) => (
              <div key={gig.id} className="flex gap-3.5 p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="relative shrink-0">
                  <img
                    src={gig.userAvatar}
                    alt=""
                    className="w-11 h-11 rounded-2xl border border-slate-100 shadow-sm object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${gig.type === 'service' ? 'bg-indigo-500' : 'bg-orange-500'}`}>
                    {gig.type === 'service' ? <Sparkles size={9} className="text-white" /> : <DollarSign size={9} className="text-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{gig.title}</p>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{gig.userName}</p>
                </div>
                <ArrowUpRight size={15} className="text-slate-300 group-hover:text-indigo-500 transition-colors self-center shrink-0" />
              </div>
            ))}
          </div>

          {/* Rating summary */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Your Rating</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-xl font-black text-slate-900">{MOCK_USER.rating}</span>
                  <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Reviews</p>
                <p className="text-xl font-black text-slate-900 mt-1">{MOCK_USER.reviewsCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Post a Gig', desc: 'Offer your skills to peers', icon: Sparkles, color: 'from-indigo-500 to-violet-600' },
          { label: 'Find a Tutor', desc: 'Get help with any subject', icon: Users, color: 'from-sky-500 to-blue-600' },
          { label: 'View Leaderboard', desc: 'See top earners this week', icon: Star, color: 'from-amber-400 to-orange-500' },
        ].map((action, i) => (
          <button
            key={i}
            className={`bg-gradient-to-br ${action.color} text-white p-5 rounded-3xl text-left hover:opacity-90 hover:-translate-y-1 transition-all shadow-lg group`}
          >
            <action.icon size={22} className="mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-extrabold text-base">{action.label}</p>
            <p className="text-white/70 text-xs mt-0.5 font-medium">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
