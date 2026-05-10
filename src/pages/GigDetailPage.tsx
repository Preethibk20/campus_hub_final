import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  Briefcase, 
  IndianRupee, 
  GraduationCap, 
  CheckCircle2, 
  Layout, 
  Type, 
  DollarSign, 
  Zap,
  Loader2,
  Clock,
  User,
  ShieldCheck,
  Flag,
  Share2,
  AlertCircle
} from 'lucide-react';
import { useGigStore } from '@/stores/gigStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import MessageButton from '@/components/features/MessageButton';
import { cn } from '@/lib/utils';

const GigDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { 
    selectedGig: gig, 
    loading, 
    error, 
    fetchGigById, 
    deleteGig, 
    expressInterest, 
    fetchApplications,
    acceptApplicant,
    rejectApplicant 
  } = useGigStore();
  const currentUser = useAuthStore(state => state.user);
  const [applications, setApplications] = useState<any[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (id) fetchGigById(id);
  }, [id]);

  const isOwner = React.useMemo(() => {
    if (!currentUser?.id || !gig?.postedBy) return false;
    const currentId = String(currentUser.id).trim().toLowerCase();
    const postedById = String(typeof gig.postedBy === 'object' ? (gig.postedBy as any)?._id : gig.postedBy).trim().toLowerCase();
    return currentId === postedById;
  }, [currentUser, gig]);

  const fetchApplicantsList = async () => {
    if (isOwner && id) {
        try {
            const data = await fetchApplications(id);
            setApplications(data || []);
        } catch (err: any) {
            toast.error(err.message);
        }
    }
  };

  useEffect(() => {
    fetchApplicantsList();
  }, [isOwner, id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await deleteGig(gig!.id);
        toast.success('Gig deleted successfully');
        navigate('/explore');
      } catch (err) {
        toast.error('Failed to delete gig');
      }
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
        toast.error('Please login to express interest');
        navigate('/login');
        return;
    }
    try {
        setIsApplying(true);
        await expressInterest(gig!.id);
        toast.success('Interest expressed successfully! The poster will be notified. 🚀');
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Gig Not Found</h2>
        <p className="text-slate-500 mb-8">{error || "The gig you're looking for doesn't exist or has been removed."}</p>
        <Link to="/explore">
          <Button variant="secondary">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/explore')}
          className="flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Listings
        </button>
        <div className="flex gap-2">
            <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                <Flag className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {gig.category}
                </span>
                <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest ${
                    gig.type === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                }`}>
                    {gig.type}
                </span>
                <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Posted {new Date(gig.createdAt).toLocaleDateString()}
                </span>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {gig.applicationCount || 0} Interested
                </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 tracking-tight leading-tight">
                {gig.title}
            </h1>

            <div className="prose prose-slate max-w-none text-slate-600 mb-10 leading-relaxed whitespace-pre-line">
                {gig.description}
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                   {gig.skillsRequired?.map(skill => (
                       <span key={skill} className="bg-slate-100 text-slate-600 text-sm font-bold px-4 py-2 rounded-2xl hover:bg-blue-600 hover:text-white transition-all cursor-default">
                           {skill}
                       </span>
                   )) || <p className="text-slate-400 text-sm italic">No specific skills listed</p>}
                </div>
            </div>
          </div>

          {isOwner && applications.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Manage Applicants</h3>
                    <div className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {applications.length} New Requests
                    </div>
                </div>
                <div className="space-y-4">
                    {applications?.map((app) => (
                        <div 
                            key={app._id || app.id} 
                            onClick={() => navigate(`/profile/${app._id || app.id}`)}
                            className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-[30px] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer gap-6"
                        >
                            <div className="flex items-center gap-5">
                                <Avatar name={app.name} src={app.profilePicUrl} className="w-16 h-16 rounded-[20px] ring-4 ring-white shadow-sm" />
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{app.name}</h4>
                                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 border-none px-2 py-0">
                                            Applicant
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-blue-500" />
                                        {app.branch || 'Student'} • {app.academicYear || 'Year 1'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <MessageButton userId={app._id || app.id} userName={app.name} gigId={gig.id} className="mr-2" />
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="flex-1 md:flex-none py-3 px-6 rounded-2xl border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 text-emerald-500 font-bold transition-all"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            await acceptApplicant(gig!.id, app._id || app.id);
                                            toast.success(`Accepted ${app.name}! 🚀`);
                                            fetchApplicantsList();
                                        } catch (err: any) {
                                            toast.error(err.message);
                                        }
                                    }}
                                >
                                    Accept ✅
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="flex-1 md:flex-none py-3 px-6 rounded-2xl border-red-100 hover:bg-red-50 hover:text-red-600 text-red-500 font-bold transition-all"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            await rejectApplicant(gig!.id, app._id || app.id);
                                            toast.success(`Rejected ${app.name}`);
                                            fetchApplicantsList();
                                        } catch (err: any) {
                                            toast.error(err.message);
                                        }
                                    }}
                                >
                                    Reject ❌
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Action Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-white shadow-xl shadow-slate-200">
             {gig.type === 'PAID' && (
                 <div className="mb-6 pb-6 border-b border-white/10">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Offered Budget</p>
                    <div className="flex items-baseline gap-2">
                        <IndianRupee className="w-6 h-6 text-emerald-400" />
                        <span className="text-4xl font-black text-white">{gig.budget}</span>
                        <span className="text-slate-500 font-bold">Total</span>
                    </div>
                 </div>
             )}
 
             <div className="space-y-4">
                {isOwner ? (
                    <>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                <span>Total Visibility</span>
                                <span>{gig.applicationCount} Applicants</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (gig.applicationCount / 10) * 100)}%` }}></div>
                            </div>
                        </div>
                        <Button className="w-full py-4 rounded-2xl bg-white text-slate-900 border-none font-bold">
                            Edit Gig Details
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={handleDelete}
                            className="w-full py-4 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold"
                        >
                            Close Listing
                        </Button>
                    </>
                ) : (
                    <>
                    <Button 
                        onClick={handleApply} 
                        disabled={gig.hasApplied || isApplying}
                        className={cn(
                            "w-full py-4 rounded-2xl font-bold shadow-lg group mb-4",
                            gig.hasApplied ? "bg-emerald-500 opacity-90 cursor-default" : "bg-blue-600 border-none shadow-blue-500/20"
                        )}
                    >
                        {isApplying ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : gig.hasApplied ? (
                            <span className="flex items-center gap-2">
                                Interest Sent <CheckCircle2 className="w-5 h-5" />
                            </span>
                        ) : (
                            <span className="flex items-center">
                                Express Interest
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                    {gig.postedBy && (
                         <MessageButton 
                            userId={typeof gig.postedBy === 'object' ? (gig.postedBy as any)?._id : gig.postedBy} 
                            userName={gig.posterName || 'Poster'} 
                            variant="outline"
                            className="w-full py-6 rounded-2xl border-white/20 text-white hover:bg-white/10"
                         />
                    )}
                    </>
                )}
             </div>
          </div>

          {/* Poster Profile */}
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Posted By</p>
             <div className="flex items-center gap-4 mb-6">
                <Avatar name={gig.posterName || 'Student Name'} src={gig.posterProfilePic} className="w-14 h-14 rounded-2xl ring-4 ring-white shadow-sm" />
                <div>
                   <div className="flex items-center gap-1.5">
                       <h4 className="font-extrabold text-slate-800">{gig.posterName || 'Student Name'}</h4>
                       <ShieldCheck className="w-4 h-4 text-blue-500" />
                   </div>
                   <p className="text-xs text-slate-400 font-medium">Verified Student</p>
                </div>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-2xl">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    {gig.posterCollege || 'Campus Hub University'}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-2xl">
                    <Zap className="w-4 h-4 text-slate-400" />
                    {gig.posterAcademicYear || 'Year'} • {gig.posterBranch || 'Student'}
                </div>
             </div>
             
             <button 
                onClick={() => navigate(`/profile/${gig.postedBy}`)}
                className="w-full mt-6 py-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"
             >
                View Full Profile
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;
