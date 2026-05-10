import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Code2, 
  Layers, 
  Link2, 
  Github, 
  Linkedin, 
  Globe, 
  ArrowLeft,
  X,
  Plus,
  Terminal,
  Trophy,
  Check
} from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';

const SKILL_SUGGESTIONS = [
  // Programming Languages
  'Python', 'JavaScript', 'Java', 'C++', 'C', 'C#', 'Rust', 'Go', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'TypeScript', 'MATLAB', 'R',
  // Web Development
  'React', 'Vue', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'HTML5', 'CSS3', 'Tailwind CSS', 'Next.js', 'GraphQL',
  // Mobile Development
  'Flutter', 'React Native', 'Android Studio', 'Xcode', 'Ionic',
  // Data Science & ML
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'SQL', 'NoSQL', 'Tableau', 'Power BI', 'Data Mining', 'Big Data',
  // Design & Multimedia
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'Canvas', 'UI/UX Design', 'Product Design',
  // DevOps & Tools
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'Git', 'GitHub', 'Jenkins', 'CI/CD', 'Terraform',
  // Specialized & Others
  'LaTeX', 'Blender', 'Unity', 'Unreal Engine', 'Embedded Systems', 'IoT', 'Arduino', 'Raspberry Pi', 'Cybersecurity', 'Ethical Hacking'
];

const DOMAIN_SUGGESTIONS = [
  'Web Dev', 'ML/AI', 'UI/UX', 'Cybersecurity', 'Data Science', 'Mobile Dev', 'IoT', 'Cloud Computing'
];

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile, fetchMyProfile, updateProfile, loading, error, updateSuccess, resetStatus } = useProfileStore();
  
  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'availability' | 'links'>('basic');
  const [formData, setFormData] = useState<any>({
    name: '',
    bio: '',
    college: '',
    branch: '',
    academicYear: '',
    skills: [],
    domains: [],
    availability: 'Open to Both',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [completionScore, setCompletionScore] = useState(0);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        college: profile.college || '',
        branch: profile.branch || '',
        academicYear: profile.academicYear || '',
        skills: profile.skills || [],
        domains: profile.domains || [],
        availability: profile.availability || 'Open to Both',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        portfolioUrl: profile.portfolioUrl || ''
      });
    }
  }, [profile]);

  // Live completion calculation
  useEffect(() => {
    let score = 0;
    if (formData.bio) score += 15;
    if (formData.college) score += 10;
    if (formData.academicYear) score += 10;
    if (formData.branch) score += 10;
    if (formData.skills.length >= 3) score += 20;
    if (formData.domains.length >= 1) score += 10;
    if (formData.githubUrl) score += 10;
    if (formData.linkedinUrl) score += 10;
    if (formData.availability) score += 5;
    setCompletionScore(Math.min(score, 100));
  }, [formData]);

  useEffect(() => {
     if (updateSuccess) {
         toast.success('Profile updated successfully! ✨');
         resetStatus();
         navigate('/dashboard/profile');
     }
     if (error) {
         toast.error('Update Failed', error);
         resetStatus();
     }
  }, [updateSuccess, error, navigate, toast, resetStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed) && formData.skills.length < 50) {
      setFormData((prev: any) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    } else if (formData.skills.length >= 50) {
      toast.error('Skill limit reached (max 50)');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((s: string) => s !== skillToRemove)
    }));
  };

  const handleAddDomain = (domain: string) => {
    if (domain && !formData.domains.includes(domain) && formData.domains.length < 8) {
      setFormData((prev: any) => ({ ...prev, domains: [...prev.domains, domain] }));
      setDomainInput('');
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      domains: prev.domains.filter((d: string) => d !== domainToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
        activeTab === id 
        ? 'bg-primary text-white shadow-lg shadow-blue-100 translate-x-2' 
        : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Top Progress Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-black text-slate-800 uppercase tracking-wider">Live Profile Strength</span>
                <span className="text-xl font-black text-primary">{completionScore}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-50">
                <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${completionScore}%` }}
                />
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/dashboard/profile')}
                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"
            >
                <ArrowLeft size={20} />
            </button>
            <Button 
                onClick={handleSubmit} 
                loading={loading}
                className="px-8 rounded-2xl font-black shadow-lg shadow-blue-100 bg-blue-600 text-white hover:bg-blue-700"
            >
                Save Changes
            </Button>

        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 space-y-2">
           <TabButton id="basic" label="Basic Info" icon={User} />
           <TabButton id="skills" label="Skills & Domains" icon={Terminal} />
           <TabButton id="availability" label="Availability" icon={Trophy} />
           <TabButton id="links" label="Connect Links" icon={Link2} />
        </aside>

        {/* Form Content */}
        <main className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl min-h-[500px]">
             
             {/* SECTION: BASIC INFO */}
             {activeTab === 'basic' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Settings size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identity</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                            <input 
                                type="text" name="name" value={formData.name} onChange={handleInputChange}
                                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all"
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Professional Bio</label>
                            <textarea 
                                name="bio" value={formData.bio} onChange={handleInputChange} maxLength={300}
                                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all h-32"
                                placeholder="Tell us your story..."
                            />
                            <div className="text-right text-[10px] font-bold text-slate-300">{formData.bio.length}/300</div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">College</label>
                             <input 
                                type="text" name="college" value={formData.college} onChange={handleInputChange}
                                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all"
                                placeholder="IIT Bombay / BITS Pilani..."
                            />
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Branch</label>
                             <input 
                                type="text" name="branch" value={formData.branch} onChange={handleInputChange}
                                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all"
                                placeholder="Computer Science..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Academic Year</label>
                            <select 
                                name="academicYear" value={formData.academicYear} onChange={handleInputChange}
                                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all"
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

                    <div className="pt-10 border-t border-slate-50 flex items-center justify-end">
                         <Button 
                            onClick={handleSubmit} 
                            loading={loading}
                            className="px-10 rounded-2xl h-14 font-black bg-blue-600 text-white shadow-xl shadow-blue-100 hover:scale-105 transition-all"
                         >
                            Save Personal Info
                         </Button>
                    </div>
                </div>
             )}

             {/* SECTION: SKILLS & DOMAINS */}
             {activeTab === 'skills' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Code2 size={24} className="text-teal-600" />
                                Software Skills
                            </h3>
                            <span className="text-[10px] font-black bg-teal-50 text-teal-700 px-3 py-1 rounded-lg uppercase">{formData.skills.length}/50</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4 p-4 min-h-[80px] bg-slate-50 rounded-3xl">
                            {formData.skills.map((skill: string) => (
                                <span key={skill} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-2xl text-xs font-black shadow-sm border border-slate-100">
                                    {skill}
                                    <button type="button" onClick={() => handleRemoveSkill(skill)}><X size={14} className="text-slate-400" /></button>
                                </span>
                            ))}
                        </div>

                        <div className="relative">
                            <input 
                                type="text" value={skillInput} 
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (skillInput.trim()) {
                                            handleAddSkill(skillInput);
                                        }
                                    }
                                }}
                                className="w-full p-6 rounded-2xl bg-slate-900 text-white border-none focus:ring-4 focus:ring-blue-100 font-bold placeholder:slate-600 shadow-xl"
                                placeholder="Type skill (e.g. React) and press Enter..."
                            />
                            {skillInput && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 max-h-60 overflow-y-auto">
                                    {SKILL_SUGGESTIONS.filter(s => 
                                        s.toLowerCase().includes(skillInput.toLowerCase()) && 
                                        !formData.skills.includes(s)
                                    ).length > 0 ? (
                                        SKILL_SUGGESTIONS.filter(s => 
                                            s.toLowerCase().includes(skillInput.toLowerCase()) && 
                                            !formData.skills.includes(s)
                                        ).map(s => (
                                            <button 
                                                key={s} type="button" onClick={() => handleAddSkill(s)}
                                                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl font-bold text-slate-700 flex items-center justify-between"
                                            >
                                                {s} <Plus size={14} />
                                            </button>
                                        ))
                                    ) : (
                                        <button 
                                            type="button" onClick={() => handleAddSkill(skillInput)}
                                            className="w-full text-left p-3 hover:bg-slate-50 rounded-xl font-bold text-slate-700 flex items-center justify-between"
                                        >
                                            Add "{skillInput}" <Plus size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Layers size={24} className="text-purple-600" />
                                Project Domains
                            </h3>
                            <span className="text-[10px] font-black bg-purple-50 text-purple-700 px-3 py-1 rounded-lg uppercase">{formData.domains.length}/8</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4 p-4 min-h-[80px] bg-slate-50 rounded-3xl">
                            {formData.domains.map((domain: string) => (
                                <span key={domain} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-2xl text-xs font-black shadow-lg">
                                    {domain}
                                    <button type="button" onClick={() => handleRemoveDomain(domain)}><X size={14} /></button>
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                             {DOMAIN_SUGGESTIONS.map(d => (
                                <button 
                                    key={d} type="button"
                                    onClick={() => formData.domains.includes(d) ? handleRemoveDomain(d) : handleAddDomain(d)}
                                    className={`p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                        formData.domains.includes(d) 
                                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-purple-200'
                                    }`}
                                >
                                    {d}
                                </button>
                             ))}
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-teal-600">
                             <Check size={20} className="bg-teal-50 rounded-full p-1" />
                             <span className="text-xs font-bold uppercase tracking-widest text-[10px]">Changes are staged for saving</span>
                         </div>
                         <Button 
                            onClick={handleSubmit} 
                            loading={loading}
                            className="px-10 rounded-2xl h-14 font-black bg-blue-600 text-white shadow-xl shadow-blue-100 hover:scale-105 transition-all"
                         >
                            Save Your Skills
                         </Button>
                    </div>
                </div>
             )}

             {/* SECTION: AVAILABILITY */}
             {activeTab === 'availability' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Status & Availability</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Open to Gigs', 'Open to Hackathons', 'Open to Both', 'Not Available'].map(opt => (
                            <label 
                                key={opt}
                                className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                                    formData.availability === opt 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <input 
                                    type="radio" name="availability" value={opt} 
                                    checked={formData.availability === opt}
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                                <span className="font-black text-sm">{opt}</span>
                                {formData.availability === opt ? (
                                    <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center">
                                        <Check size={14} />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-200" />
                                )}
                            </label>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex items-center justify-end">
                         <Button 
                            onClick={handleSubmit} 
                            loading={loading}
                            className="px-10 rounded-2xl h-14 font-black bg-blue-600 text-white shadow-xl shadow-blue-100 hover:scale-105 transition-all"
                         >
                            Update Status
                         </Button>
                    </div>
                </div>
             )}

             {/* SECTION: LINKS */}
             {activeTab === 'links' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Connect Your Network
                    </h3>

                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Github size={32} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Github Profile URL</label>
                                <input 
                                    type="url" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange}
                                    className="w-full p-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all"
                                    placeholder="https://github.com/username"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-[#0077b5] text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Linkedin size={32} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">LinkedIn Profile URL</label>
                                <input 
                                    type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange}
                                    className="w-full p-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all"
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Globe size={32} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Portfolio or Personal Website</label>
                                <input 
                                    type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange}
                                    className="w-full p-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-800 transition-all"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex items-center justify-end">
                         <Button 
                            onClick={handleSubmit} 
                            loading={loading}
                            className="px-10 rounded-2xl h-14 font-black bg-blue-600 text-white shadow-xl shadow-blue-100 hover:scale-105 transition-all"
                         >
                            Sync All Profile Changes
                         </Button>
                    </div>
                </div>
             )}
          </form>
        </main>
      </div>
    </div>
  );
};

export default EditProfilePage;
