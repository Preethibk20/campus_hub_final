import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Github,
  Linkedin,
  Globe,
  Plus,
  X,
  Code2,
  Layers
} from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

const DashboardProfileEditPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { profile, fetchMyProfile, updateProfile, loading, error, updateSuccess, resetStatus } = useProfileStore();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        college: '',
        academicYear: '',
        branch: '',
        bio: '',
        skills: [] as string[],
        domains: [] as string[],
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        availability: 'Open to Both'
    });

    useEffect(() => {
        fetchMyProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                college: profile.college || '',
                academicYear: profile.academicYear || '',
                branch: profile.branch || '',
                bio: profile.bio || '',
                skills: profile.skills || [],
                domains: profile.domains || [],
                githubUrl: profile.githubUrl || '',
                linkedinUrl: profile.linkedinUrl || '',
                portfolioUrl: profile.portfolioUrl || '',
                availability: profile.availability || 'Open to Both'
            });
        }
    }, [profile]);

    useEffect(() => {
        if (updateSuccess) {
            toast.success('Success!', 'Your profile has been updated successfully.');
            resetStatus();
            setTimeout(() => navigate('/dashboard/profile'), 1500);
        }
        if (error) {
            toast.error('Error', error);
            resetStatus();
        }
    }, [updateSuccess, error, toast, navigate, resetStatus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile({
            bio: formData.bio,
            college: formData.college,
            academicYear: formData.academicYear as any,
            branch: formData.branch,
            skills: formData.skills,
            domains: formData.domains,
            githubUrl: formData.githubUrl,
            linkedinUrl: formData.linkedinUrl,
            portfolioUrl: formData.portfolioUrl,
            availability: formData.availability as any
        });
    };

    const addListItem = (field: 'skills' | 'domains', value: string) => {
        if (!value.trim()) return;
        if (formData[field].includes(value.trim())) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], value.trim()]
        }));
    };

    const removeListItem = (field: 'skills' | 'domains', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };


    if (loading && !profile) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
            <div className="max-w-4xl mx-auto px-4 py-12">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/dashboard/profile')}
                            className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary transition-all hover:-translate-x-1"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete Your Profile</h1>
                            <p className="text-slate-500 font-medium">Build your presence on Campus Hub</p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="rounded-2xl px-8 py-3 font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </Button>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Panel: Profile Basics */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm text-center">
                            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-primary/10 to-blue-50 flex items-center justify-center text-primary text-4xl font-black mx-auto mb-6 border-2 border-white shadow-lg">
                                {formData.name.charAt(0)}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{formData.name}</h3>
                            <p className="text-sm text-slate-400 font-medium mb-6 uppercase tracking-widest">{profile?.role || 'Student'}</p>
                            
                            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-center gap-4 text-left">
                                <div className="text-teal-600 font-black text-2xl">{profile?.profileCompletion || 0}%</div>
                                <div className="text-[10px] items-center font-black text-teal-800 tracking-tighter uppercase leading-tight">Profile Score</div>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-3">
                            <ShieldCheck className="text-amber-500 mt-1 shrink-0" size={18} />
                            <p className="text-xs text-amber-800 font-bold leading-relaxed">
                                Locked Fields: Name and Email are synced from your initial verification. 
                                <span className="underline block mt-2 cursor-pointer font-black">Contact support to change them.</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: The Form */}
                    <div className="md:col-span-2 space-y-8">
                        
                        {/* Section 1: Core Identity */}
                        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={16} /> Identity & Academic Info
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.name} 
                                            disabled 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-400 font-bold cursor-not-allowed"
                                        />
                                        <ShieldCheck size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Official Email</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.email} 
                                            disabled 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-400 font-bold cursor-not-allowed outline-none"
                                        />
                                        <Mail size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">College / University</label>
                                <div className="relative group">
                                    <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text" 
                                        name="college"
                                        placeholder="e.g. SRM Institute of Science and Technology"
                                        value={formData.college} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-slate-700 font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                     <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Academic Year</label>
                                     <div className="relative">
                                        <GraduationCap size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select 
                                            name="academicYear"
                                            value={formData.academicYear}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-slate-700 font-black focus:bg-white focus:border-primary outline-none appearance-none"
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                            <option value="Postgrad">Postgrad</option>
                                        </select>
                                     </div>
                                </div>
                                <div className="space-y-4">
                                     <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Branch / Degree</label>
                                     <div className="relative">
                                        <BookOpen size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            name="branch"
                                            value={formData.branch} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-slate-700 font-bold focus:bg-white focus:border-primary transition-all outline-none"
                                        />

                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Bio & Availability */}
                        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
                             <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={16} /> About & Availability
                            </h2>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Availability Status</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Open to Both', 'Open to Gigs', 'Open to Hackathons', 'Not Available'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, availability: opt }))}
                                            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                                                formData.availability === opt 
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Tell the campus about yourself</label>
                                <textarea 
                                    name="bio"
                                    rows={4}
                                    placeholder="I'm a fullstack enthusiast looking for hackathon teams and freelance Gigs..."
                                    value={formData.bio} 
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl px-6 py-5 text-slate-700 font-medium focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none leading-relaxed"
                                />
                                <div className="text-right text-[10px] font-bold text-slate-300 uppercase italic">
                                    Max 300 characters
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Skills & Domains */}
                        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Code2 size={16} /> Skills & Specialties
                            </h2>
                            
                            {/* Skills Tag Input */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Software & Professional Skills</label>
                                <div className="flex flex-wrap gap-2 mb-4 min-h-[48px] p-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    {formData.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-white text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 duration-200">
                                            {skill}
                                            <button onClick={() => removeListItem('skills', i)} className="hover:text-red-500"><X size={14} /></button>
                                        </span>
                                    ))}
                                    {formData.skills.length === 0 && <span className="text-slate-300 text-xs italic p-2">Add skills like React, Figma, Python...</span>}
                                </div>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Type a skill and press enter"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addListItem('skills', e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 font-medium focus:bg-white focus:border-primary transition-all outline-none"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Press Enter</div>
                                </div>
                            </div>

                            {/* Domains tag input */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Work Domains</label>
                                <div className="flex flex-wrap gap-2 mb-4 min-h-[48px] p-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    {formData.domains.map((domain, i) => (
                                        <span key={i} className="px-3 py-1 bg-white text-purple-600 border border-purple-100 rounded-xl text-xs font-bold flex items-center gap-2">
                                            {domain}
                                            <button onClick={() => removeListItem('domains', i)} className="hover:text-red-500"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                                    {['Web Dev', 'ML/AI', 'UI/UX', 'Cybersecurity', 'Data Science', 'Mobile Dev', 'IoT', 'Cloud Computing'].map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => addListItem('domains', d)}
                                            className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                                                formData.domains.includes(d)
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-white text-slate-500 border-slate-100 hover:border-purple-200'
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Social Links */}
                        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={16} /> Links & Presence
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">GitHub Profile URL</label>
                                    <div className="relative">
                                        <Github size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            name="githubUrl"
                                            placeholder="https://github.com/username"
                                            value={formData.githubUrl} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-slate-700 font-medium focus:bg-white focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">LinkedIn Profile URL</label>
                                    <div className="relative">
                                        <Linkedin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            name="linkedinUrl"
                                            placeholder="https://linkedin.com/in/username"
                                            value={formData.linkedinUrl} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-slate-700 font-medium focus:bg-white focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Personal Portfolio / Website</label>
                                    <div className="relative">
                                        <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            name="portfolioUrl"
                                            placeholder="https://yourdetails.com"
                                            value={formData.portfolioUrl} 
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-slate-700 font-medium focus:bg-white focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center gap-4 pt-6">
                            <Button 
                                onClick={handleSave} 
                                loading={loading}
                                className="flex-1 rounded-2xl py-5 h-16 font-black text-lg shadow-xl shadow-primary/20"
                            >
                                <Save size={20} className="mr-2" />
                                Save & Finish
                            </Button>
                            <Button 
                                variant="ghost"
                                onClick={() => navigate('/dashboard/profile')}
                                className="rounded-2xl px-8 h-16 font-bold text-slate-400 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DashboardProfileEditPage;
