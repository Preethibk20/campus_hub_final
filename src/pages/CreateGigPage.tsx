import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Briefcase, 
  IndianRupee, 
  GraduationCap, 
  CheckCircle2, 
  Layout, 
  Type, 
  DollarSign, 
  Zap,
  Loader2
} from 'lucide-react';
import { useGigStore } from '@/stores/gigStore';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';

const PostGig: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();
  const createGig = useGigStore(state => state.createGig);
  const loading = useGigStore(state => state.loading);

  const [formData, setFormData] = useState({
    title: '',
    category: 'TECH',
    type: 'COLLAB',
    description: '',
    skillsRequired: [] as string[],
    budget: ''
  });

  const [skillInput, setSkillInput] = useState('');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSkillAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (formData.skillsRequired.length >= 8) {
        toast.error('Maximum 8 skills allowed');
        return;
      }
      if (!formData.skillsRequired.includes(skillInput.trim())) {
        setFormData({
          ...formData,
          skillsRequired: [...formData.skillsRequired, skillInput.trim()]
        });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skillsRequired: formData.skillsRequired.filter(s => s !== skill)
    });
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      budget: formData.type === 'PAID' ? Number(formData.budget) : undefined,
      category: formData.category as any,
      type: formData.type as any
    };

    try {
      await createGig(payload);
      toast.success('Gig posted successfully! 🚀');
      navigate('/explore');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      console.error('Create gig error:', err?.response?.data || err);
      toast.error(`Failed to post gig: ${msg}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
              step >= i ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
            </div>
            {i < 3 && (
              <div className={`w-20 h-1 mx-2 rounded-full transition-colors ${
                step > i ? 'bg-blue-600' : 'bg-slate-100'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">The Basics</h1>
              <p className="text-slate-500 mt-2">What are you looking for?</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Gig Title</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="e.g. Build a Landing Page for Hackathon"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 outline-none appearance-none font-bold text-slate-700"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="TECH">Technology</option>
                    <option value="DESIGN">Design</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="CONTENT">Content</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gig Type</label>
                  <div className="flex p-1 bg-slate-50 rounded-2xl">
                    <button 
                      className={`flex-1 py-3 font-bold rounded-xl transition-all ${formData.type === 'COLLAB' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                      onClick={() => setFormData({...formData, type: 'COLLAB'})}
                    >
                      Collab
                    </button>
                    <button 
                      className={`flex-1 py-3 font-bold rounded-xl transition-all ${formData.type === 'PAID' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                      onClick={() => setFormData({...formData, type: 'PAID'})}
                    >
                      Paid
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button disabled={!formData.title} onClick={nextStep} className="w-full py-4 rounded-2xl group h-14 bg-slate-900 border-none font-bold">
              Next Step
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gig Details</h1>
              <p className="text-slate-500 mt-2">Describe the project and level required.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea 
                  rows={5}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                  placeholder="What is the project about? What are the expectations?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Required Skills (Press Enter)</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl">
                  {formData.skillsRequired.map(skill => (
                    <span key={skill} className="bg-white border border-slate-100 text-blue-600 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">×</button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    className="bg-transparent border-none focus:ring-0 outline-none text-sm p-1 flex-1 min-w-[120px]"
                    placeholder="e.g. React"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillAdd}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={prevStep} className="flex-1 py-4 h-14 rounded-2xl font-bold border border-slate-100">Back</Button>
              <Button 
                disabled={!formData.description || formData.skillsRequired.length === 0} 
                onClick={nextStep} 
                className="flex-[2] py-4 h-14 rounded-2xl bg-slate-900 border-none font-bold"
              >
                Next Step
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Budget & Preview */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Final Step</h1>
              <p className="text-slate-500 mt-2">Almost there! Review your gig.</p>
            </div>

            <div className="space-y-6">
              {formData.type === 'PAID' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-slate-700 mb-2 text-emerald-600">Offered Budget (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5" />
                    <input 
                      type="number" 
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-emerald-50 border-none focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-emerald-700"
                      placeholder="0"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Preview</h4>
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                   <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate-800">{formData.title || 'No Title'}</h3>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${formData.type === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
                        {formData.type}
                      </span>
                   </div>
                   <p className="text-xs text-slate-500 line-clamp-2">{formData.description || 'No Description'}</p>
                   <div className="flex flex-wrap gap-1 mt-4">
                      {formData.skillsRequired.map(s => (
                        <span key={s} className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md">{s}</span>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={prevStep} disabled={loading} className="flex-1 py-4 h-16 rounded-[28px] font-bold border border-slate-100">Back</Button>
              <Button 
                loading={loading}
                disabled={loading}
                onClick={handleSubmit} 
                className="flex-[2] py-4 bg-slate-900 border-none shadow-xl shadow-slate-200 group h-16 font-black text-lg rounded-[28px]"
              >
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" />
                ) : (
                    <div className="flex items-center justify-center gap-3">
                        Post This Gig
                        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500 group-hover:scale-125 transition-transform" />
                    </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostGig;
