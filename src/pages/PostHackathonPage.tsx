import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchingStore } from '@/stores/matchingStore';
import { useAuthStore } from '@/stores/authStore';
import { CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

const ROLE_SUGGESTIONS = [
    'Frontend Dev', 'Backend Dev', 'Fullstack Dev', 'UI Designer', 
    'UX Designer', 'Data Scientist', 'ML Engineer', 'DevOps', 'Mobile Dev', 'Product Manager'
];

const PostHackathonPage: React.FC = () => {
    const navigate = useNavigate();
    const { createPost, loading } = useMatchingStore();
    const { isAuthenticated } = useAuthStore();

    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mode, setMode] = useState<'ONLINE' | 'OFFLINE' | 'HYBRID'>('ONLINE');
    const [deadline, setDeadline] = useState('');
    const [teamSize, setTeamSize] = useState(4);

    // Step 2 State
    const [techStack, setTechStack] = useState<string[]>([]);
    const [currentTech, setCurrentTech] = useState('');
    const [rolesNeeded, setRolesNeeded] = useState<string[]>([]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Login Required</h2>
                <p className="text-slate-500 mb-6">You must be logged in to create a hackathon post.</p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
        );
    }

    const handleAddTech = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (e) e.preventDefault();
        
        const tech = currentTech.trim();
        if (tech && !techStack.includes(tech) && techStack.length < 15) {
            setTechStack([...techStack, tech]);
            setCurrentTech('');
        }
    };

    const handleRemoveTech = (techToRemove: string) => {
        setTechStack(techStack.filter(t => t !== techToRemove));
    };

    const toggleRole = (role: string) => {
        if (rolesNeeded.includes(role)) {
            setRolesNeeded(rolesNeeded.filter(r => r !== role));
        } else if (rolesNeeded.length < 10) {
            setRolesNeeded([...rolesNeeded, role]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !deadline || techStack.length === 0 || rolesNeeded.length === 0) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            await createPost({
                title,
                description,
                mode,
                deadline: new Date(deadline).toISOString(),
                teamSize,
                techStack,
                rolesNeeded
            });
            // Show toast visually (basic implementation for now, assuming standard alert or global toast)
            alert("Hackathon post created successfully! 🎉");
            navigate('/find-partners');
        } catch (err: any) {
            alert(err.message || "Failed to create post.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Post a Hackathon Team</h1>
                    <p className="text-slate-500 mt-2">Find the right people to build something awesome.</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center mb-10">
                    <div className="flex items-center text-primary font-medium">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">1</div>
                        Basics
                    </div>
                    <div className={`flex-1 h-px mx-4 ${step === 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
                    <div className={`flex items-center font-medium ${step === 2 ? 'text-primary' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step === 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                        Requirements
                    </div>
                </div>

                <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-8">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. AI-Powered Study Assistant"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What are you building? What problem does it solve?"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mode *</label>
                                    <select
                                        value={mode}
                                        onChange={(e) => setMode(e.target.value as any)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    >
                                        <option value="ONLINE">Online</option>
                                        <option value="OFFLINE">Offline</option>
                                        <option value="HYBRID">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Team Size *</label>
                                    <input
                                        type="number"
                                        min={2}
                                        max={10}
                                        value={teamSize}
                                        onChange={(e) => setTeamSize(parseInt(e.target.value) || 4)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hackathon Deadline *</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <Button 
                                    onClick={() => setStep(2)} 
                                    disabled={!title || !description || !deadline}
                                    className="rounded-xl px-6"
                                    // Use icon directly in children to avoid Lucide warning
                                >
                                    Next Step <ChevronRight size={18} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Tech Stack Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tech Stack (press enter to add) *</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={currentTech}
                                        onChange={(e) => setCurrentTech(e.target.value)}
                                        onKeyDown={handleAddTech}
                                        placeholder="e.g. React, Node.js, Python"
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                    <Button type="button" onClick={() => handleAddTech()} variant="secondary" className="rounded-xl px-4">
                                        <Plus size={20} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {techStack.map(tech => (
                                        <span key={tech} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 font-medium border border-slate-200">
                                            {tech}
                                            <button onClick={() => handleRemoveTech(tech)} className="text-slate-400 hover:text-red-500 ml-1 outline-none">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {techStack.length === 0 && <span className="text-sm text-slate-400 italic">No technologies added yet.</span>}
                                </div>
                            </div>

                            {/* Roles Needed Selection */}
                            <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Roles Needed *</label>
                                <div className="flex flex-wrap gap-2">
                                    {ROLE_SUGGESTIONS.map(role => {
                                        const isSelected = rolesNeeded.includes(role);
                                        return (
                                            <button
                                                key={role}
                                                onClick={() => toggleRole(role)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all outline-none border ${
                                                    isSelected 
                                                        ? 'bg-primary/10 border-primary/20 text-primary' 
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {role}
                                                {isSelected && <CheckCircle2 size={14} className="inline-block ml-1" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                {rolesNeeded.length === 0 && <p className="text-sm text-red-500 mt-2">Please select at least one role.</p>}
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                <button 
                                    onClick={() => setStep(1)} 
                                    className="text-slate-500 hover:text-slate-800 font-medium flex items-center px-4 py-2 outline-none"
                                >
                                    <ChevronLeft size={18} className="mr-1" /> Back
                                </button>
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={loading || techStack.length === 0 || rolesNeeded.length === 0}
                                    className="rounded-xl px-8"
                                >
                                    {loading ? 'Posting...' : 'Post Team Request'} <CheckCircle2 size={18} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostHackathonPage;
