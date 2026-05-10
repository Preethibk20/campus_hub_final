import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  User,
  Wallet,
  Menu,
  X,
  Sparkles,
  LogOut,
  Bell,
  MessageCircle,
  Send,
  ChevronRight,
  Zap,
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard, color: 'text-indigo-500' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag,      color: 'text-violet-500' },
  { id: 'profile',     label: 'Profile',     icon: User,             color: 'text-sky-500'    },
  { id: 'wallet',      label: 'Wallet',      icon: Wallet,           color: 'text-emerald-500'},
];

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showChat, setShowChat] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState('');
  const [messages, setMessages] = React.useState([
    { id: 1, sender: 'Alex', text: 'Hey, are you still available for Python tutoring?', time: '10:30 AM', isMe: false },
    { id: 2, sender: 'Me',   text: 'Yes! I have slots open tomorrow.',                  time: '10:32 AM', isMe: true  },
    { id: 3, sender: 'Alex', text: 'Perfect, let\'s schedule for 3 PM?',                time: '10:33 AM', isMe: false },
  ]);
  const { user, logout } = useAuth();

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'Me', text: chatMessage, time: 'Just now', isMe: true }]);
    setChatMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #fafbff 60%, #f5f0ff 100%)' }}>

      {/* ── Mobile Header ── */}
      <header className="md:hidden glass text-slate-900 px-5 py-3.5 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-white/60">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-primary p-1.5 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Sparkles size={20} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">Campus Hub</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-indigo-50 rounded-xl transition-colors text-slate-600"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        sidebar-bg border-r border-slate-200/50 w-72 z-40 flex flex-col
        shadow-2xl shadow-slate-200/60 md:shadow-none
      `}>
        {/* Logo */}
        <div className="p-7 hidden md:flex items-center gap-3">
          <div className="bg-gradient-primary p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">Campus Hub</h1>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Skill Exchange Platform</p>
          </div>
        </div>

        {/* Quick stats pill */}
        <div className="mx-6 mb-4 hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2.5">
          <Zap size={14} className="text-indigo-500 shrink-0" />
          <span className="text-xs font-bold text-indigo-600">3 active gigs this week</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-5 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative
                  ${isActive
                    ? 'nav-active text-white font-bold'
                    : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'}
                `}
              >
                <Icon size={19} className={isActive ? 'text-white' : `${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[14.5px] font-semibold">{item.label}</span>
                {isActive && <ChevronRight size={15} className="ml-auto text-white/70" />}
              </button>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-5 border-t border-slate-100/80">
          <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="relative shrink-0">
              <img
                src={user?.avatar || 'https://picsum.photos/seed/alex/100'}
                alt="Avatar"
                className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full pulse-dot"></div>
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Guest User'}</p>
              <VerificationBadge />
            </div>
            {user && (
              <button
                onClick={logout}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Desktop topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/60 bg-white/50 backdrop-blur-md">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowChat(false); }}
              className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button
              onClick={() => { setShowChat(!showChat); setShowNotifications(false); }}
              className={`relative p-2.5 rounded-xl transition-all ${showChat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
              <MessageCircle size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
              <img
                src={user?.avatar || 'https://picsum.photos/seed/alex/100'}
                alt=""
                className="w-9 h-9 rounded-xl border-2 border-white shadow-sm object-cover group-hover:scale-105 transition-transform"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'Guest'}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Student</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto pb-20">
            {children}
          </div>
        </div>
      </main>

      {/* ── Chat Panel ── */}
      {showChat && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-slate-100 z-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 flex items-center justify-between bg-gradient-primary text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">Messages</p>
                <p className="text-[11px] text-indigo-200">Alex Johnson</p>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="hover:bg-white/20 p-1.5 rounded-xl transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 font-semibold mb-1 px-1">{msg.sender} · {msg.time}</span>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                  msg.isMe
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-100'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm input-focus"
              />
              <button type="submit" className="bg-gradient-primary text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-indigo-100">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Notifications ── */}
      {showNotifications && (
        <div className="fixed top-[72px] right-6 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-scale-in">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Bell size={16} className="text-indigo-600" /> Notifications
            </h3>
            <span className="badge-pill bg-red-100 text-red-600">2 new</span>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { title: 'Task accepted!', body: 'Alex agreed to tutor you in Python.', time: '2h ago', dot: 'bg-indigo-500' },
              { title: 'Payment received', body: '$45 added to your wallet.', time: '5h ago', dot: 'bg-emerald-500' },
            ].map((n, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3">
                <div className={`w-2 h-2 rounded-full ${n.dot} mt-1.5 shrink-0`}></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1.5 uppercase tracking-wide">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full p-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-slate-100">
            MARK ALL AS READ
          </button>
        </div>
      )}

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
