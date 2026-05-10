import React from 'react';
import { LucideIcon, Sparkles, Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description = "Our developers are working hard to build this feature for the campus community. Stay tuned! ✨", 
  icon: Icon = Construction 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="max-w-xl w-full relative">
        {/* Decorative Background Elements */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50" />

        <div className="relative bg-white/70 backdrop-blur-xl border border-white rounded-[40px] p-10 md:p-16 shadow-2xl shadow-blue-50 text-center overflow-hidden">
          {/* Animated Background Sparkle */}
          <div className="absolute top-0 right-0 p-4 opacity-10 animate-pulse">
            <Sparkles size={120} />
          </div>

          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center text-white mx-auto mb-10 shadow-xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Icon size={48} />
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            {title} <br/>
            <span className="text-blue-600">Coming Soon</span>
          </h1>

          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => navigate(-1)} 
              variant="secondary" 
              className="rounded-2xl px-10 py-4 font-bold border-none bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <ArrowLeft size={18} className="mr-2" />
              Go Back
            </Button>
            <Button 
                onClick={() => navigate('/dashboard')}
                className="rounded-2xl px-10 py-4 font-bold shadow-lg shadow-blue-100"
            >
                Back to Home
            </Button>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100/50">
             <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Work in Progress
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
