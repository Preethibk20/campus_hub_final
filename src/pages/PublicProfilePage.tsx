import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowRight,
  Sparkles,
  AlertCircle,
  UserCircle
} from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';

const PublicProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { publicProfile: profile, fetchPublicProfile, loading, error } = useProfileStore();
    const { user: currentUser } = useAuthStore();

    useEffect(() => {
        if (userId) {
            fetchPublicProfile(userId);
        }
    }, [userId]);

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
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Network Error</h2>
                <p className="text-slate-500 mb-8 max-w-sm">
                    We couldn't reach the campus servers. Please check your connection and try again.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => fetchPublicProfile(userId!)}>Retry Connection</Button>
                    <Button variant="ghost" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-[40px] flex items-center justify-center mb-6 shadow-inner">
                    <UserCircle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Profile doesn't exist yet</h2>
                <p className="text-slate-500 mb-10 max-w-sm font-medium leading-relaxed">
                    This student hasn't set up their public profile yet, or the link may be incorrect.
                </p>
                <Button onClick={() => navigate('/dashboard')} className="rounded-2xl px-10">Return to Dashboard</Button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile.id;

    const handleCollaborate = () => {
        if (profile.availability.includes('Gigs')) {
            navigate(`/explore?user=${profile.id}`);
        } else if (profile.availability.includes('Hackathons')) {
            navigate(`/find-partners?requestTo=${profile.id}`);
        } else {
            // Default to matching page
            navigate('/find-partners');
        }
    };

    const AvailabilityBadge = ({ status }: { status: string }) => {
        const isOpen = status !== 'Not Available';
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                isOpen 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
                <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-slate-400'} animate-pulse`} />
                {status}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
            {/* Premium Header Container */}
            <div className="relative bg-white border-b border-slate-200 pt-16 pb-20 overflow-hidden">
                {/* Decorative background grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>
                
                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10">
                        
                        {/* Profile Info Left */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-1 text-center md:text-left">
                            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white transform hover:rotate-3 transition-transform duration-500">
                                {profile.name.charAt(0)}
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                                        <AvailabilityBadge status={profile.availability} />
                                    </div>
                                    <p className="text-xl text-slate-500 font-medium">{profile.branch || 'Student'} • {profile.academicYear || 'University Explorer'}</p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-sm font-bold">
                                        <MapPin size={16} className="text-slate-400" />
                                        {profile.college || 'Verified Student'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-sm font-bold">
                                        <Sparkles size={16} />
                                        {profile.profileCompletion}% Profile Score
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons Right */}
                        <div className="flex flex-col items-center lg:items-end gap-4 w-full lg:w-auto">
                            {isOwnProfile ? (
                                <Button 
                                    onClick={() => navigate('/dashboard/profile/edit')}
                                    className="w-full lg:w-auto rounded-2xl px-10 py-4 font-black shadow-xl shadow-blue-100 transition-all hover:-translate-y-1"
                                >
                                    <Edit3 size={18} className="mr-2" />
                                    Edit My Profile
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleCollaborate}
                                    className="w-full lg:w-auto rounded-2xl px-10 py-4 font-black bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 border-none"
                                >
                                    Request to Collaborate
                                    <ArrowRight size={18} className="ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio Section */}
                        <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl group">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-6 bg-primary rounded-full"></div>
                                Student Bio
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-xl font-medium tracking-tight whitespace-pre-wrap">
                                {profile.bio ? profile.bio : `${profile.name} is a dedicated student at ${profile.college || 'our Hub'}. No bio has been added yet.`}
                            </p>
                        </section>

                        {/* Skills and Domains Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl">
                                <h2 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3">
                                    <Code2 size={24} className="text-teal-600" />
                                    Tech Stack
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {profile.skills && profile.skills.length > 0 ? (
                                        profile.skills.map((skill, i) => (
                                            <span key={i} className="px-4 py-2 bg-teal-50 text-teal-700 rounded-2xl text-xs font-black border border-teal-100">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-xs font-bold uppercase italic">Skills section empty.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl">
                                <h2 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3">
                                    <Layers size={24} className="text-purple-600" />
                                    Expertise
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {profile.domains && profile.domains.length > 0 ? (
                                        profile.domains.map((domain, i) => (
                                            <span key={i} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-2xl text-xs font-black border border-purple-100">
                                                {domain}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-xs font-bold uppercase italic">No domains defined.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Links */}
                    <div className="space-y-8">
                        <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Professional Links</h2>
                            <div className="space-y-4">
                                <a 
                                    href={profile.githubUrl} target="_blank" rel="noreferrer"
                                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${
                                        profile.githubUrl 
                                        ? 'bg-slate-900 border-slate-900 text-white hover:-translate-y-1 shadow-lg' 
                                        : 'bg-slate-50 border-slate-50 text-slate-300 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Github size={24} />
                                        <span className="font-black">GitHub</span>
                                    </div>
                                    <ExternalLink size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>

                                <a 
                                    href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${
                                        profile.linkedinUrl 
                                        ? 'bg-[#0077b5] border-[#0077b5] text-white hover:-translate-y-1 shadow-lg' 
                                        : 'bg-slate-50 border-slate-50 text-slate-300 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Linkedin size={24} />
                                        <span className="font-black">LinkedIn</span>
                                    </div>
                                    <ExternalLink size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>

                                <a 
                                    href={profile.portfolioUrl} target="_blank" rel="noreferrer"
                                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${
                                        profile.portfolioUrl 
                                        ? 'bg-primary border-primary text-white hover:-translate-y-1 shadow-lg' 
                                        : 'bg-slate-50 border-slate-50 text-slate-300 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Globe size={24} />
                                        <span className="font-black">Portfolio</span>
                                    </div>
                                    <ExternalLink size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </section>

                        {/* Marketplace Banner */}
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[40px] p-10 text-white shadow-2xl shadow-teal-100 group relative overflow-hidden">
                             <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                                <Sparkles size={120} />
                             </div>
                             <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                Team Match
                             </h4>
                             <p className="text-sm font-bold text-teal-50 leading-relaxed opacity-90 mb-8">
                                Looking to work with {profile.name}? Send a direct collaboration request or check out their open project postings.
                             </p>
                             <button 
                                onClick={handleCollaborate}
                                className="w-full bg-white text-teal-600 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-teal-50 transition-colors"
                             >
                                 Start Collaboration
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfilePage;
