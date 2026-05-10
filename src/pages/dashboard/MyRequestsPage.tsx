import React, { useEffect, useState } from 'react';
import { useMatchingStore, MatchRequest, HackathonPost } from '@/stores/matchingStore';
import { BadgeCheck, Clock, XCircle, CheckCircle2, User, Building, Code } from 'lucide-react';
import Button from '@/components/ui/Button';
import axios from 'axios';

const MyRequestsPage: React.FC = () => {
    const { 
        incomingRequests, outgoingRequests, posts, 
        fetchIncomingRequests, fetchOutgoingRequests, fetchPosts, respondToRequest,
        loading
    } = useMatchingStore();

    const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');
    const [userDetails, setUserDetails] = useState<Record<string, any>>({});

    // Keep polling incoming requests every 60 seconds
    useEffect(() => {
        fetchIncomingRequests();
        fetchOutgoingRequests();
        fetchPosts();

        const intervalId = setInterval(() => {
            fetchIncomingRequests();
        }, 60000);

        return () => clearInterval(intervalId);
    }, []);

    // Effect to fetch missing user details for incoming requests
    useEffect(() => {
        const fetchMissingUsers = async () => {
            const missingIds = incomingRequests
                .map(r => r.fromUserId)
                .filter(id => !userDetails[id]);

            // Deduplicate
            const uniqueMissing = [...new Set(missingIds)];

            if (uniqueMissing.length === 0) return;

            const newDetails: Record<string, any> = {};
            for (const id of uniqueMissing) {
                try {
                    const res = await axios.get(`/api/users/${id}`);
                    newDetails[id] = res.data;
                } catch (e) {
                    console.error("Failed to fetch user", id);
                }
            }

            if (Object.keys(newDetails).length > 0) {
                setUserDetails(prev => ({ ...prev, ...newDetails }));
            }
        };

        if (incomingRequests.length > 0) {
            fetchMissingUsers();
        }
    }, [incomingRequests]);

    const getPostTitle = (postId: string) => {
        const post = posts.find(p => p.postId === postId);
        return post ? post.title : 'Hackathon Post';
    };

    const handleAction = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
        try {
            await respondToRequest(requestId, action);
            alert(`Request ${action.toLowerCase()} successfully!`);
        } catch (e: any) {
            alert(e.message || "Action failed");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'PENDING') return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200"><Clock size={12}/> Pending</span>;
        if (status === 'ACCEPTED') return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><CheckCircle2 size={12}/> Accepted</span>;
        if (status === 'REJECTED') return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-200"><XCircle size={12}/> Rejected</span>;
        return null;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-[80vh]">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Manage Requests</h1>
                <p className="text-slate-500 mt-2">View incoming team joins and track your sent requests.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-8 space-x-8">
                <button
                    onClick={() => setActiveTab('incoming')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'incoming' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Incoming ({incomingRequests.filter(r => r.status === 'PENDING').length})
                    {activeTab === 'incoming' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'sent' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Sent ({outgoingRequests.length})
                    {activeTab === 'sent' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                    )}
                </button>
            </div>

            {/* Loading State */}
            {loading && incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Incoming Requests View */}
            {activeTab === 'incoming' && (
                <div className="space-y-4">
                    {incomingRequests.filter(r => r.status === 'PENDING').length === 0 && !loading && (
                        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
                            <User className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No requests yet</h3>
                            <p className="text-slate-500 mt-1">You are all caught up!</p>
                        </div>
                    )}

                    {incomingRequests.filter(r => r.status === 'PENDING').map(req => {
                        const user = userDetails[req.fromUserId];
                        return (
                            <div key={req.requestId} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Requested to join:</p>
                                        <h4 className="text-lg font-bold text-slate-800">{getPostTitle(req.postId)}</h4>
                                    </div>
                                    
                                    {user ? (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Building size={12} /> {user.collegeName || "No College Listed"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills?.map((skill: string, i: number) => (
                                                    <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 flex items-center gap-1">
                                                        <Code size={10} /> {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            {req.message && (
                                                <p className="mt-3 text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">"{req.message}"</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 animate-pulse">Loading applicant profile...</div>
                                    )}
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <Button 
                                        onClick={() => handleAction(req.requestId, 'REJECTED')} 
                                        variant="danger" 
                                        className="flex-1 md:flex-none"
                                    >
                                        Reject
                                    </Button>
                                    <Button 
                                        onClick={() => handleAction(req.requestId, 'ACCEPTED')} 
                                        variant="primary" 
                                        className="flex-1 md:flex-none"
                                    >
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Sent Requests View */}
            {activeTab === 'sent' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outgoingRequests.length === 0 && !loading && (
                        <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
                            <Clock className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No requests yet</h3>
                            <p className="text-slate-500 mt-1">Check out the Find Partners page to join a team.</p>
                        </div>
                    )}

                    {outgoingRequests.map(req => (
                        <div key={req.requestId} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs text-slate-400 font-medium">{new Date(req.createdAt).toLocaleDateString()}</span>
                                <StatusBadge status={req.status} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">{getPostTitle(req.postId)}</h4>
                            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                <BadgeCheck size={12} className={req.status === 'ACCEPTED' ? 'text-green-500' : 'text-slate-300'} />
                                {req.status === 'ACCEPTED' 
                                    ? "Details have been shared. Check your email/messages." 
                                    : "Awaiting response from the post owner."}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRequestsPage;
