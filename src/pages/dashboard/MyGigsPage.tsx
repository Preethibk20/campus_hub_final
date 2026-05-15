import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Eye, Filter, User, Briefcase, Clock } from 'lucide-react'
import GigCard from '@/components/features/GigCard'
import EditGigModal from '@/components/features/EditGigModal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface GigAttachment {
  id: string
  filename: string
  url: string
  type: string
}

interface Gig {
  id: string
  title: string
  description: string
  category: string
  type: 'SERVICE' | 'REQUEST'
  minBudget: number
  maxBudget: number
  timeline: number
  attachments: GigAttachment[]
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
  poster: {
    id: string
    name: string
    avatar?: string
    rating: number
    reviewCount: number
  }
  applicationCount: number
  hasApplied: boolean
  createdAt: string
  updatedAt: string
}

interface BackendGig {
  gigId: string
  title: string
  description: string
  category: string
  type: string
  budget: number
  skillsRequired: string[]
  postedBy: string
  status: string
  createdAt: string | number
  posterName: string
  posterCollege: string
  applicationCount: number
  hasApplied: boolean
}

const MyGigsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'POSTED' | 'APPLIED'>('POSTED')
  const [createdGigs, setCreatedGigs] = useState<any[]>([])
  const [appliedGigs, setAppliedGigs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingGig, setEditingGig] = useState<any | null>(null)
  const navigate = useNavigate()
  const toast = useToast()
  
  const uniqueCreatedGigs = React.useMemo(() => 
    Array.from(new Map(createdGigs.map(gig => [gig.id || (gig as any).gigId, gig])).values()),
    [createdGigs]
  )

  const uniqueAppliedGigs = React.useMemo(() => 
    Array.from(new Map(appliedGigs.map(gig => [gig.id || (gig as any).gigId, gig])).values()),
    [appliedGigs]
  )

  useEffect(() => {
    fetchMyGigs()
  }, [])

  const fetchMyGigs = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/api/gigs/my')
      setCreatedGigs(response.data.created || [])
      setAppliedGigs(response.data.applied || [])
    } catch (error: any) {
      toast.error('Failed to load your gigs', error.response?.data?.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditGig = (gig: any) => {
    setEditingGig(gig)
  }

  const handleGigUpdated = () => {
    fetchMyGigs()
    setEditingGig(null)
    toast.success('Gig updated successfully!')
  }

    return (
        <div className="min-h-screen bg-surface">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
                            My Gigs
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Manage your postings and track your applications
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
                            <button 
                                onClick={() => setActiveTab('POSTED')}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                    activeTab === 'POSTED' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Posted Gigs
                            </button>
                            <button 
                                onClick={() => setActiveTab('APPLIED')}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                    activeTab === 'APPLIED' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Applied Gigs
                            </button>
                        </div>
                        
                        <Button
                            onClick={() => navigate('/gigs/new')}
                            className="flex items-center gap-2 py-3 px-6 rounded-2xl shadow-lg shadow-blue-100"
                        >
                            <Plus className="w-5 h-5" />
                            Create New
                        </Button>
                    </div>
                </div>

                <div className="space-y-12">
                    {activeTab === 'POSTED' ? (
                        /* Posted Gigs Section */
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Posted Gigs</h2>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500">{createdGigs.length}</Badge>
                            </div>

                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="h-40 bg-slate-50 animate-pulse rounded-3xl" />
                                ) : createdGigs.length === 0 ? (
                                    <div className="bg-white border border-slate-100 rounded-[40px] p-20 text-center shadow-lg shadow-blue-100/20">
                                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Briefcase className="w-10 h-10 text-blue-200" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Your Gig Board is Empty</h3>
                                        <p className="text-slate-400 font-bold mb-8 max-w-sm mx-auto">Post your first gig to start finding talented students for your projects!</p>
                                        <Button className="rounded-2xl px-12" onClick={() => navigate('/gigs/new')}>
                                            Post Your First Gig 🚀
                                        </Button>
                                    </div>
                                ) : (
                                    uniqueCreatedGigs.map((gig) => (
                                        <div key={gig.id} className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none">{gig.category}</Badge>
                                                        <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none">{gig.status}</Badge>
                                                    </div>
                                                    <h3 className="text-xl font-extrabold text-slate-800 mb-1">{gig.title}</h3>
                                                    <p className="text-slate-500 text-sm line-clamp-1">{gig.description}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        onClick={() => navigate(`/gigs/${gig.id}`)}
                                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl flex items-center gap-2 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                                                    >
                                                        <User className="w-4 h-4" />
                                                        <span className="font-bold text-sm">{gig.applicationCount} Applicants</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/gigs/${gig.id}`)}>
                                                            <Eye className="w-4 h-4 mr-2" /> View
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Applied Gigs Section */
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gigs I Applied To</h2>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500">{appliedGigs.length}</Badge>
                            </div>

                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="h-40 bg-slate-50 animate-pulse rounded-3xl" />
                                ) : appliedGigs.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[30px] p-12 text-center">
                                        <p className="text-slate-400 font-bold mb-4">You haven't applied to any gigs yet</p>
                                        <Button variant="secondary" size="sm" onClick={() => navigate('/explore')}>Explore Gigs</Button>
                                    </div>
                                ) : (
                                    uniqueAppliedGigs.map((gig) => (
                                        <div key={gig.id} className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none">{gig.category}</Badge>
                                                        <span className="text-xs font-bold text-slate-400">By {gig.posterName}</span>
                                                    </div>
                                                    <h3 className="text-xl font-extrabold text-slate-800 mb-1">{gig.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "px-6 py-2 rounded-2xl font-black text-xs tracking-widest uppercase",
                                                        gig.userStatus === 'ACCEPTED' ? "bg-emerald-100 text-emerald-600" :
                                                        gig.userStatus === 'REJECTED' ? "bg-red-100 text-red-600" :
                                                        "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {gig.userStatus === 'ACCEPTED' ? 'Accepted ✅' :
                                                         gig.userStatus === 'REJECTED' ? 'Not Accepted' : 'Pending ⏳'}
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/gigs/${gig.id}`)}>
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Gig Modal */}
                {editingGig && (
                    <EditGigModal
                        gig={editingGig}
                        isOpen={!!editingGig}
                        onClose={() => setEditingGig(null)}
                        onSuccess={handleGigUpdated}
                    />
                )}
            </div>
        </div>
    );
}

export default MyGigsPage
