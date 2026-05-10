
import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  Activity, 
  Globe, 
  Lock, 
  Eye, 
  Server,
  RefreshCw,
  ChevronRight,
  Search
} from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            <Server size={14} /> System Node: Campus-01
          </div>
          <h2 className="text-4xl font-black text-slate-900">Campus Deployment</h2>
          <p className="text-slate-500 mt-2 text-lg">Central hub for campus monitoring, dispute resolution, and security.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCw size={18} /> Sync Data
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Lock size={18} /> Maintenance Mode
          </button>
        </div>
      </header>

      {/* Real-time Health Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Activity size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Operational</span>
          </div>
          <h4 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Marketplace API</h4>
          <p className="text-3xl font-black text-slate-900 mt-2">99.98%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[99%]"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Globe size={24} />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">Active</span>
          </div>
          <h4 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Campus Nodes</h4>
          <p className="text-3xl font-black text-slate-900 mt-2">12 / 12</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-500 h-full w-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <AlertTriangle size={24} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">Review Required</span>
          </div>
          <h4 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Pending Disputes</h4>
          <p className="text-3xl font-black text-slate-900 mt-2">4 Gigs</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-500 h-full w-1/3"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-xl flex items-center gap-2">
              <UserCheck size={24} className="text-indigo-600" /> Verification Queue
            </h3>
            <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {[
              { name: 'David Smith', email: 'dsmith@campus.edu', date: '2 mins ago', id: 'REQ-402' },
              { name: 'Emily Blunt', email: 'eblunt@campus.edu', date: '1 hour ago', id: 'REQ-401' },
              { name: 'Chris Evans', email: 'cevans@campus.edu', date: '3 hours ago', id: 'REQ-400' },
            ].map((req, i) => (
              <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                    {req.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{req.name}</p>
                    <p className="text-xs text-slate-500">{req.email} • {req.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100">Review</button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600"><ChevronRight size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log / Safety */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-xl flex items-center gap-2">
              <Eye size={24} className="text-indigo-600" /> Platform Audit
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Filter logs..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-slate-900">Config Change: UPI Gateway</p>
                <p className="text-xs text-slate-500 mt-1">Admin updated the escrow release timer from 24h to 48h for High-Value Gigs.</p>
                <p className="text-[10px] text-slate-400 uppercase font-black mt-2">Today, 09:12 AM</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-slate-900">Escrow Dispute Flagged</p>
                <p className="text-xs text-slate-500 mt-1">Gig #G-2849 was flagged by buyer for "Non-delivery of study notes".</p>
                <p className="text-[10px] text-slate-400 uppercase font-black mt-2">Yesterday, 11:45 PM</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-slate-900">Deployment Successful</p>
                <p className="text-xs text-slate-500 mt-1">Version 1.2.0 (Stable) deployed to main campus cluster.</p>
                <p className="text-[10px] text-slate-400 uppercase font-black mt-2">Oct 26, 2023</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-sm font-bold text-slate-600 hover:text-indigo-600">Download Full Audit CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
