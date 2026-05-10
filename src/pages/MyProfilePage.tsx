import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  Globe, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Mail,
  Edit3,
  ExternalLink,
  Code2,
  Layers,
  AlertCircle,
  UserCircle
} from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import Button from '@/components/ui/Button';

const MyProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { profile, fetchMyProfile, loading, error } = useProfileStore();

    useEffect(() => {
        fetchMyProfile();
    }, []);

    // Auto-redirect to edit form if profile is empty (fresh account)
    useEffect(() => {
        if (profile && profile.profileCompletion === 0) {
            navigate('/dashboard/profile/edit');
        }
    }, [profile, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mb-6">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Network Error</h2>
                <p className="text-slate-500 mb-8 max-w-sm">We couldn't connect to the server. Please check your internet connection.</p>
                <Button onClick={() => fetchMyProfile()} className="rounded-2xl px-8 transition-all hover:scale-105 active:scale-95">Retry Connection</Button>
            </div>
        );
    }

    if (!profile) return null;

    if (profile.profileCompletion === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                <div className="relative mb-12">
                    <div className="w-64 h-64 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                        <UserCircle size={160} className="text-blue-100" />
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/profile/edit')}
                        className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12 border border-slate-100 hover:scale-110 active:scale-95 transition-all group"
                        title="Edit Profile"
                    >
                        <Edit3 className="text-blue-600 group-hover:rotate-12 transition-transform" size={32} />
                    </button>

                </div>
                
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Your profile is empty</h1>
                <p className="text-xl text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
                    Let teammates know what you bring to the table! A complete profile gets <span className="text-blue-600 font-black tracking-tighter">3x more </span> 
                    hackathon requests and gig opportunities.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                        onClick={() => navigate('/dashboard/profile/edit')}
                        className="rounded-2xl px-12 py-4 h-16 font-black text-lg shadow-2xl shadow-blue-100 border-none transition-all hover:scale-105 active:scale-95"
                    >
                        Build My Profile
                    </Button>
                    <Button 
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-2xl px-8 py-4 h-16 font-bold text-slate-400 hover:bg-slate-50 transition-all hover:scale-105"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const CompletionRing = ({ percentage }: { percentage: number }) => {
        const stroke = 8;
        const radius = 60;
        const normalizedRadius = radius - stroke * 2;
        const circumference = normalizedRadius * 2 * Math.PI;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative inline-flex items-center justify-center">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    <circle
                        stroke="#E2E8F0" // slate-200
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="#0D9488" // teal-600
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-teal-700">{percentage}%</span>
                    <span className="text-[10px] items-center font-bold text-slate-400 tracking-tighter uppercase">Profile score</span>
                </div>
            </div>
        );
    };

    const AvailabilityBadge = ({ status }: { status: string }) => {
        const isOpen = status !== 'Not Available';
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isOpen 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
                {isOpen ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {status}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Upper Banner / Header Section */}
            <div className="bg-white border-b border-slate-200 shadow-sm pt-12 pb-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                        
                        {/* Info Column */}
                        <div className="flex-1 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-blue-100 flex items-center justify-center text-primary text-4xl font-black border-4 border-white shadow-xl">
                                    {profile.name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                                        <button 
                                            onClick={() => navigate('/dashboard/profile/edit')}
                                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-blue-600 shadow-sm border border-slate-100"
                                            title="Edit Profile"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <AvailabilityBadge status={profile.availability} />
                                    </div>
                                    <p className="text-lg text-slate-500 flex items-center gap-2 font-medium">
                                        <Mail size={18} className="text-slate-400" /> {profile.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 transform hover:scale-[1.02] transition-transform">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">College</p>
                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{profile.college || 'Not Set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 transform hover:scale-[1.02] transition-transform">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-purple-600">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Year</p>
                                        <p className="text-sm font-bold text-slate-700">{profile.academicYear || 'Not Set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 transform hover:scale-[1.02] transition-transform">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch</p>
                                        <p className="text-sm font-bold text-slate-700">{profile.branch || 'Not Set'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Completion & Actions column */}
                        <div className="flex flex-col items-center md:items-end gap-8">
                            <CompletionRing percentage={profile.profileCompletion} />
                            <Button 
                                onClick={() => navigate('/dashboard/profile/edit')}
                                className="rounded-2xl px-8 py-3 font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                <Edit3 size={18} />
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                About Me
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg italic bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
                                {profile.bio ? `"${profile.bio}"` : "You haven't added a bio yet. Tell the campus about yourself!"}
                            </p>
                        </section>

                        {/* Skills and Domains Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Code2 size={20} className="text-teal-600" />
                                    Tech Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills && profile.skills.length > 0 ? (
                                        profile.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-xl text-sm font-bold border border-teal-100">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 font-bold uppercase italic">No skills added yet.</p>
                                    )}
                                </div>
                            </section>

                            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Layers size={20} className="text-purple-600" />
                                    Domains
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.domains && profile.domains.length > 0 ? (
                                        profile.domains.map((domain, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold border border-purple-100">
                                                {domain}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 font-bold uppercase italic">No domains defined.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Sidebar / Links */}
                    <div className="space-y-8">
                        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider text-[10px]">Links & Socials</h2>
                            <div className="space-y-4">
                                <a 
                                    href={profile.githubUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                        profile.githubUrl 
                                        ? 'bg-slate-900 text-white border-slate-900 hover:scale-[1.02] shadow-lg shadow-slate-200' 
                                        : 'bg-slate-50 text-slate-300 border-slate-100 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Github size={20} />
                                        <span className="font-bold text-sm">GitHub</span>
                                    </div>
                                    <ExternalLink size={16} className="opacity-50" />
                                </a>

                                <a 
                                    href={profile.linkedinUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                        profile.linkedinUrl 
                                        ? 'bg-[#0077b5] text-white border-[#0077b5] hover:scale-[1.02] shadow-lg shadow-blue-100' 
                                        : 'bg-slate-50 text-slate-300 border-slate-100 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Linkedin size={20} />
                                        <span className="font-bold text-sm">LinkedIn</span>
                                    </div>
                                    <ExternalLink size={16} className="opacity-50" />
                                </a>

                                <a 
                                    href={profile.portfolioUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                        profile.portfolioUrl 
                                        ? 'bg-primary text-white border-primary hover:scale-[1.02] shadow-lg shadow-blue-50' 
                                        : 'bg-slate-50 text-slate-300 border-slate-100 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Globe size={20} />
                                        <span className="font-bold text-sm">Portfolio</span>
                                    </div>
                                    <ExternalLink size={16} className="opacity-50" />
                                </a>
                            </div>
                        </section>

                        {/* Quick Tip */}
                        <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100 shadow-sm">
                             <h4 className="font-black text-teal-800 text-xs uppercase tracking-widest mb-3">Pro Tip</h4>
                             <p className="text-teal-700 text-sm font-medium leading-relaxed opacity-90">
                                 Students with <span className="font-black">GitHub</span> and <span className="font-black">LinkedIn</span> connected get 3x more hackathon requests.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
