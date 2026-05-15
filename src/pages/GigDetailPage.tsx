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
  Users,
  ShieldCheck,
  Flag,
  Share2,
  Mail,
  Send,
  ExternalLink,
  MessageCircle,
  MoreVertical,
  ChevronRight,
  Target,
  Trophy,
  Users2,
  AlertCircle
} from 'lucide-react';
import { useGigStore } from '@/stores/gigStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

// MessageButton Component
const MessageButton: React.FC<{ userId: string; userName: string; gigId: string; className?: string }> = ({ 
  userId, 
  userName, 
  gigId, 
  className 
}) => {
  const navigate = useNavigate();
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/messages?user=${userId}&name=${userName}&gig=${gigId}`);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleMessage}
      className={cn("gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all", className)}
    >
      <MessageCircle className="w-4 h-4" />
      Message
    </Button>
  );
};

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
    if (!id) return;
    setIsApplying(true);
    try {
      await expressInterest(id);
      toast.success('Application submitted successfully! 🚀');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Loading gig details...</p>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">Oops! Gig not found</h2>
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
                <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-4 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    Posted {new Date(gig.createdAt).toLocaleDateString()}
                </span>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-4 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-widest">
                    <Users2 className="w-3 h-3" />
                    {gig.applicationCount} Interested
                </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight tracking-tight">
                {gig.title}
            </h1>

            <div className="prose prose-slate max-w-none mb-10">
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    {gig.description}
                </p>
            </div>

            <div className="pt-8 border-t border-slate-50">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-6">
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

          {isOwner && (
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Manage Applicants</h3>
                    <div className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {applications?.filter((a: any) => a.status === 'pending').length || 0} Pending
                    </div>
                </div>
                
                {applications?.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-[30px] border border-dashed border-slate-200">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No applications yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {applications?.map((app: any) => {
                        const status = app.status?.toString().toLowerCase();
                        const isPending = !status || status === 'pending';
                        const isAccepted = status === 'accepted';
                        const isRejected = status === 'rejected';
                        return (
                        <div 
                            key={app.applicantId || app.id} 
                            onClick={() => navigate(`/profile/${app.applicantId || app.id}`)}
                            className={cn(
                                "flex flex-col md:flex-row items-center justify-between p-6 rounded-[30px] border group transition-all cursor-pointer gap-6",
                                isAccepted ? "bg-emerald-50/50 border-emerald-100" :
                                isRejected ? "bg-red-50/30 border-red-100 opacity-60" :
                                "bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100"
                            )}
                        >
                            <div className="flex items-center gap-5">
                                <Avatar name={app.applicantName || app.name} src={app.applicantAvatar || app.profilePicUrl} className="w-16 h-16 rounded-[20px] ring-4 ring-white shadow-sm" />
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <h4 className="font-extrabold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{app.applicantName || app.name}</h4>
                                        {isAccepted && (
                                            <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest">
                                                Accepted ✅
                                            </span>
                                        )}
                                        {isRejected && (
                                            <span className="bg-red-100 text-red-500 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest">
                                                Rejected
                                            </span>
                                        )}
                                        {isPending && (
                                            <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-500 border-none px-2 py-0">
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-blue-500" />
                                        {app.applicantBranch || app.branch || 'Student'} • {app.applicantAcademicYear || app.academicYear || 'Year 1'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <MessageButton userId={app.applicantId || app._id || app.id} userName={app.applicantName || app.name} gigId={gig.id} className="mr-2" />
                                {isPending && (
                                    <>
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        className="flex-1 md:flex-none py-3 px-6 rounded-2xl border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 text-emerald-500 font-bold transition-all"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await acceptApplicant(gig!.id, app.applicantId || app._id || app.id);
                                                toast.success(`Accepted ${app.applicantName || app.name}! 🚀`);
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
                                                await rejectApplicant(gig!.id, app.applicantId || app._id || app.id);
                                                toast.success(`Rejected ${app.applicantName || app.name}`);
                                                fetchApplicantsList();
                                            } catch (err: any) {
                                                toast.error(err.message);
                                            }
                                        }}
                                    >
                                        Reject ❌
                                    </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        );
                    })}
                    </div>
                )}
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
                            "w-full py-6 rounded-2xl font-black text-lg transition-all shadow-lg",
                            gig.hasApplied 
                                ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed" 
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:-translate-y-1"
                        )}
                    >
                        {isApplying ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Applying...
                            </div>
                        ) : gig.hasApplied ? (
                            "Already Applied"
                        ) : (
                            <div className="flex items-center gap-3">
                                Express Interest
                                <ArrowRight className="w-6 h-6" />
                            </div>
                        )}
                    </Button>
                    <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest mt-4">
                        {gig.hasApplied ? "We'll notify you once reviewed" : "Applying takes only 2 seconds"}
                    </p>
                    </>
                )}
             </div>
          </div>

          {/* Posted By Card */}
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Posted By</h4>
            <div className="flex items-center gap-4 mb-6">
                <Avatar name={gig.posterName || 'User'} src={gig.posterProfilePic} className="w-14 h-14 rounded-2xl ring-4 ring-slate-50" />
                <div>
                    <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        {gig.posterName || 'Verified User'}
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </h4>
                    <p className="text-xs text-slate-500 font-bold">Verified Student</p>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-slate-600">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold">{gig.posterCollege || 'University'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-slate-600">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold">{gig.posterAcademicYear || 'Year 1'} • {gig.posterBranch || 'IS'}</span>
                </div>
            </div>

            <Button variant="ghost" className="w-full py-4 rounded-2xl text-blue-600 hover:bg-blue-50 font-bold border border-blue-50">
                View Full Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;
