import React from 'react';
import {
  Mail, GraduationCap, Github, Linkedin, ExternalLink, Award,
  Edit3, Camera, Check, Star, MapPin, Plus
} from 'lucide-react';
import { MOCK_USER } from '../constants';

const Profile: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter pb-12">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden card-shadow">
        {/* Cover */}
        <div className="h-44 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #7c3aed 100%)' }}>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)' }}></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-xl text-white backdrop-blur-xl border border-white/20 transition-all">
            <Camera size={18} />
          </button>
        </div>

        <div className="px-7 pb-7">
          <div className="relative -mt-14 mb-5 flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="relative group w-fit">
              <img
                src={MOCK_USER.avatar}
                alt={MOCK_USER.name}
                className="w-28 h-28 rounded-3xl border-4 border-white shadow-xl object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity text-white border-4 border-transparent">
                <Edit3 size={22} />
              </button>
              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 border-3 border-white rounded-full p-1">
                <Check size={10} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="flex gap-2.5 md:ml-auto">
              <button className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm">
                Edit Profile
              </button>
              <button className="px-5 py-2.5 bg-gradient-primary text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:opacity-90 hover:scale-105 active:scale-95 transition-all text-sm">
                Share Profile
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{MOCK_USER.name}</h2>
                {MOCK_USER.verified && (
                  <span className="badge-pill bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <Check size={9} strokeWidth={3} /> Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-500 text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <GraduationCap size={15} className="text-indigo-400" /> {MOCK_USER.course}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="font-medium">{MOCK_USER.year}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin size={13} className="text-slate-400" /> Campus
                </span>
              </div>
              <p className="text-slate-600 mt-3 leading-relaxed text-sm max-w-xl">{MOCK_USER.bio}</p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 md:gap-6 shrink-0">
              {[
                { label: 'Rating', value: `${MOCK_USER.rating}`, icon: '⭐' },
                { label: 'Gigs', value: `${MOCK_USER.reviewsCount}`, icon: '✅' },
                { label: '$/hr', value: `$${MOCK_USER.hourlyRate}`, icon: '💰' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-black text-slate-900">{s.icon} {s.value}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 card-shadow">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {MOCK_USER.skills.map(skill => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-2xl text-xs border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
              <button className="px-4 py-2 text-slate-400 font-bold text-xs hover:text-indigo-600 transition-colors flex items-center gap-1 border border-dashed border-slate-200 rounded-2xl hover:border-indigo-300">
                <Plus size={12} /> Add Skill
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 card-shadow">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Badges & Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_USER.badges.map(badge => (
                <div
                  key={badge.id}
                  className={`${badge.color} p-4 rounded-2xl flex items-center gap-3 hover-lift cursor-default`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-bold text-sm">{badge.name}</p>
                    <p className="text-xs opacity-70 mt-0.5">Earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 card-shadow">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">Portfolio</h3>
              <button className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1.5 text-sm group transition-all">
                View All <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2].map(i => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-video rounded-2xl overflow-hidden mb-3 relative shadow-md">
                    <img
                      src={`https://picsum.photos/seed/portfolio${i}/800/500`}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-indigo-900/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-extrabold bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-2 rounded-xl text-sm scale-90 group-hover:scale-100 transition-transform duration-300">
                        View Project
                      </span>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">E-Commerce UI Redesign</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">Mobile-first design for a campus book store app.</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Stats card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 card-shadow">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Rating', value: `⭐ ${MOCK_USER.rating} / 5.0` },
                { label: 'Completed Gigs', value: `${MOCK_USER.reviewsCount}` },
                { label: 'Hourly Rate', value: `$${MOCK_USER.hourlyRate}/hr` },
                { label: 'Wallet Balance', value: `$${MOCK_USER.walletBalance}` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500 text-sm font-medium">{item.label}</span>
                  <span className="font-bold text-slate-900 text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 card-shadow">
            <h3 className="font-extrabold text-slate-900 mb-4">Connect</h3>
            <div className="space-y-2.5">
              {[
                { icon: Github, label: 'GitHub', color: 'text-slate-900', bg: 'bg-slate-100' },
                { icon: Linkedin, label: 'LinkedIn', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: Mail, label: 'Email', color: 'text-red-500', bg: 'bg-red-50' },
              ].map((link, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all group"
                >
                  <div className={`${link.bg} p-2 rounded-xl`}>
                    <link.icon size={16} className={link.color} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{link.label}</span>
                  <ExternalLink className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors" size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Reviews teaser */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="fill-yellow-300 text-yellow-300" />
              <span className="font-extrabold text-lg">{MOCK_USER.rating}</span>
              <span className="text-indigo-200 text-sm">/ 5.0</span>
            </div>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed">
              Based on {MOCK_USER.reviewsCount} reviews from verified students.
            </p>
            <button className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-2xl text-sm transition-all border border-white/20">
              View All Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
