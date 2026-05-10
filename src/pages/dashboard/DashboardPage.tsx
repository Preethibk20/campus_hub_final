import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Code, 
  MessageSquare, 
  UserCircle, 
  ArrowRight,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import Button from '@/components/ui/Button';
import { useEffect } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, path, color }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(path)}
      className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500 ${color}`} />
      
      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${color.replace('bg-', 'bg-opacity-20 text-').replace(' ', '')} text-white`}>
        <Icon className="w-6 h-6 shadow-sm" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      
      <p className="text-slate-500 text-sm leading-relaxed mb-4">
        {description}
      </p>
      
      <div className="flex items-center text-blue-600 font-semibold text-sm">
        Explore Now
        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { profile, fetchMyProfile, loading } = useProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const features = [
    {
      title: 'Find Hackathon Partners',
      description: 'Connect with like-minded students to build amazing projects and win competitions.',
      icon: Users,
      path: '/find-partners',
      color: 'bg-purple-500',
    },
    {
      title: 'Post a Hackathon',
      description: 'Looking for specific skills? Create a post and find the perfect team members.',
      icon: Code,
      path: '/post-hackathon',
      color: 'bg-emerald-500',
    },
    {
      title: 'Explore Gigs',
      description: 'Discover freelance opportunities, projects, and campus-wide tasks to earn and learn.',
      icon: Briefcase,
      path: '/explore',
      color: 'bg-blue-500',
    },
    {
      title: 'Skill Exchange',
      description: 'Learn new technologies or mentor others. Share your expertise with the community.',
      icon: Code,
      path: '/explore?type=skills',
      color: 'bg-emerald-500',
    },
    {
      title: 'Messages',
      description: 'Chat with project partners, clients, and mentors in real-time.',
      icon: MessageSquare,
      path: '/dashboard/messages',
      color: 'bg-orange-500',
    },
    {
      title: 'My Profile',
      description: 'Showcase your skills, experience, and projects to the entire campus.',
      icon: UserCircle,
      path: `/profile/${user?.id}`,
      color: 'bg-slate-700',
    }
  ];

  const isProfileIncomplete = !user?.bio || user?.skills?.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-10 shadow-lg text-white">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <LayoutDashboard size={160} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Student Platform
            </span>
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Welcome to Campus Hub, <span className="text-blue-200">{user?.name || 'Explorer'}</span>!
          </h1>
          
          <p className="text-blue-100 text-lg max-w-2xl mb-8 leading-relaxed">
            Your all-in-one destination for campus collaboration. Find partners for your next big hackathon, discover paid gigs, and swap skills with fellow students.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="secondary" 
              className="bg-white text-blue-700 hover:bg-blue-50 border-none px-6 py-3 font-bold"
              onClick={() => navigate('/explore')}
            >
              Start Exploring
            </Button>
            
            {isProfileIncomplete && (
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 border border-white/30 px-6 py-3 font-bold flex items-center gap-2"
                onClick={() => navigate('/dashboard/profile/edit')}
              >
                Complete Profile
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {!loading && profile && profile.profileCompletion < 80 && (
        <div className="bg-white border border-teal-100 rounded-3xl p-6 mb-10 shadow-sm flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top duration-500">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
            <UserCircle size={32} />
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800">
                Your profile is {profile.profileCompletion}% complete
              </h3>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                Stronger profiles get more matches
              </span>
            </div>
            
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 transition-all duration-1000 ease-out" 
                style={{ width: `${profile.profileCompletion}%` }}
              />
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/dashboard/profile/edit')}
            className="bg-teal-600 hover:bg-teal-700 text-white border-none px-6 rounded-xl flex-shrink-0"
          >
            Complete Profile
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Everything you need</h2>
          <p className="text-slate-500">Select a category to get started with your journey.</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
        
        {/* Placeholder for future features */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center opacity-60">
           <div className="w-12 h-12 rounded-full bg-slate-200 mb-4 flex items-center justify-center text-slate-400">
             <Sparkles className="w-6 h-6" />
           </div>
           <p className="font-semibold text-slate-500">More Coming Soon</p>
           <p className="text-xs text-slate-400 mt-1">We're building new ways for you to collaborate.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
