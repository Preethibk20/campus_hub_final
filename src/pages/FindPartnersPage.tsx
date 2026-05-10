import React, { useEffect, useState } from 'react';
import { useMatchingStore, HackathonPost } from '@/stores/matchingStore';
import { useAuthStore } from '@/stores/authStore';
import { BadgeCheck, Search, Users, ExternalLink, Calendar, Code, Laptop, ArrowRight, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';

const FindPartnersPage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        posts, suggestions, outgoingRequests, fetchPosts, fetchSuggestions, fetchOutgoingRequests,
        sendRequest, loading 
    } = useMatchingStore();
    const { user, isAuthenticated } = useAuthStore();
    
    const [modeFilter, setModeFilter] = useState('');
    const [techSearch, setTechSearch] = useState('');
    const [requestingId, setRequestingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
        if (isAuthenticated) {
            fetchSuggestions();
            fetchOutgoingRequests();
        }
    }, [isAuthenticated]);

    // Client-side filtering for the grid
    const filteredPosts = posts.filter(p => {
        if (modeFilter && p.mode !== modeFilter) return false;
        if (techSearch) {
            const hasTech = p.techStack.some(t => t.toLowerCase().includes(techSearch.toLowerCase()));
            const hasRole = p.rolesNeeded.some(r => r.toLowerCase().includes(techSearch.toLowerCase()));
            if (!hasTech && !hasRole) return false;
        }
        return true;
    });

    const handleJoin = async (postId: string) => {
        if (!isAuthenticated) {
            alert("Please log in to send a join request.");
            return;
        }
        setRequestingId(postId);
        try {
            await sendRequest(postId, "Hi! I saw your post and I'm interested in joining your team.");
            alert("Request sent successfully!");
        } catch (err: any) {
            alert(err.message || "Failed to send request.");
        } finally {
            setRequestingId(null);
        }
    };

    const PostCard = ({ post, score }: { post: HackathonPost, score?: number }) => (
        <div 
            onClick={() => navigate(`/profile/${post.postedBy}`)}
            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col h-full shadow-sm hover:shadow-2xl hover:border-blue-100/50 hover:-translate-y-1 transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center gap-1">
                    <Laptop size={12} />
                    {post.mode}
                </div>
                {score !== undefined && score > 0 && (
                    <div className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-xs font-bold border border-teal-100 flex items-center gap-1">
                        <BadgeCheck size={12} />
                        {score} skills match
                    </div>
                )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {post.title}
            </h3>
            
            <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                {post.description}
            </p>

            <div className="mt-auto space-y-4">
                <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Looking For</p>
                    <div className="flex flex-wrap gap-2">
                        {post.rolesNeeded.slice(0, 3).map((role, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                        {post.techStack.slice(0, 4).map((tech, i) => (
                            <span key={i} className="text-xs border border-slate-200 text-slate-500 px-2 py-1 rounded-md flex items-center gap-1">
                                <Code size={10} />
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Users size={16} />
                        <span>{post.currentSize} / {post.teamSize} joined</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                        {(() => {
                            const hasRequested = outgoingRequests?.some(r => r.postId === post.postId);
                            const isFull = post.currentSize >= post.teamSize;
                            
                            if (hasRequested) {
                                return (
                                    <span className="text-sm font-bold text-slate-400 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200">
                                        Requested ✓
                                    </span>
                                );
                            }
                            
                            return (
                                <Button 
                                    onClick={() => handleJoin(post.postId)}
                                    disabled={requestingId === post.postId || isFull}
                                    variant={isFull ? "secondary" : "primary"}
                                    size="sm"
                                    className="rounded-xl px-4"
                                >
                                    {requestingId === post.postId ? "Sending..." : isFull ? "Full" : "Join"}
                                </Button>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );

    const SkeletonCard = () => (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col h-[320px] shadow-sm animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-200 h-6 w-20 rounded-full"></div>
                <div className="bg-slate-200 h-6 w-24 rounded-full"></div>
            </div>
            <div className="bg-slate-200 h-6 w-3/4 rounded-md mb-3"></div>
            <div className="bg-slate-200 h-4 w-full rounded-md mb-2"></div>
            <div className="bg-slate-200 h-4 w-5/6 rounded-md mb-6"></div>
            
            <div className="mt-auto space-y-4">
                <div className="flex gap-2">
                    <div className="bg-slate-200 h-6 w-16 rounded-md"></div>
                    <div className="bg-slate-200 h-6 w-20 rounded-md"></div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="bg-slate-200 h-5 w-24 rounded-md"></div>
                    <div className="bg-slate-200 h-8 w-28 rounded-xl"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Header Hero */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                            Find Your Hackathon Dream Team
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Discover open teams looking for your exact skills, or browse the marketplace to find the perfect project to collaborate on.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
                
                {/* Suggestions Section */}
                {isAuthenticated && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-teal-100 p-2 rounded-xl text-teal-600">
                                    <BadgeCheck size={24} />
                                </span>
                                Suggested for You
                            </h2>
                        </div>
                        
                        {loading && suggestions.length === 0 ? (
                            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="min-w-[320px] max-w-[360px] flex-none">
                                        <SkeletonCard />
                                    </div>
                                ))}
                            </div>
                        ) : (!user?.skills || user.skills.length === 0) ? (
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
                                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                    <UserCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Enhance Your Recommendations</h3>
                                <p className="text-slate-500 max-w-md mx-auto mb-6">
                                    Add your technical skills to your profile so our matching engine can suggest the perfect hackathon teams for you!
                                </p>
                                <Button onClick={() => navigate('/dashboard/edit-profile')} className="rounded-xl px-6">
                                    Add Skills to Profile <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x hide-scrollbar">
                                {suggestions.map((sug) => (
                                    <div key={sug.post.postId} className="min-w-[320px] max-w-[360px] snap-start flex-none">
                                        <PostCard post={sug.post} score={sug.score} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
                                Check back later for new suggestions tailored to your skills.
                            </div>
                        )}
                    </section>
                )}

                {/* Browse Section */}
                <section>
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Explore All Teams</h2>
                            <p className="text-slate-500">Find the perfect hackathon project to join.</p>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search tech or roles..."
                                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-full md:w-64"
                                    value={techSearch}
                                    onChange={(e) => setTechSearch(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-700 outline-none focus:border-primary cursor-pointer"
                                value={modeFilter}
                                onChange={(e) => setModeFilter(e.target.value)}
                            >
                                <option value="">All Modes</option>
                                <option value="ONLINE">Online</option>
                                <option value="OFFLINE">Offline</option>
                                <option value="HYBRID">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    {loading && posts.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map(post => (
                                <PostCard key={post.postId} post={post} />
                            ))}
                            
                            {filteredPosts.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                        <Search size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">No teams found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your search filters or check back later for new hackathon posts.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
                
            </div>
        </div>
    );
};

export default FindPartnersPage;
