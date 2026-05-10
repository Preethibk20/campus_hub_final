import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Briefcase, 
  IndianRupee, 
  GraduationCap, 
  ArrowRight,
  Loader2,
  AlertCircle,
  PlusCircle,
  XCircle
} from 'lucide-react';
import { useGigStore } from '@/stores/gigStore';
import Button from '@/components/ui/Button';
import { debounce } from '@/lib/utils';

const GigSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
        <div className="h-5 w-16 bg-slate-100 rounded-full"></div>
      </div>
      <div className="h-6 w-20 bg-slate-100 rounded"></div>
    </div>
    <div className="h-7 w-3/4 bg-slate-100 rounded mb-3"></div>
    <div className="h-4 w-full bg-slate-100 rounded mb-2"></div>
    <div className="h-4 w-5/6 bg-slate-100 rounded mb-6"></div>
    <div className="flex gap-2 mb-6">
      <div className="h-6 w-12 bg-slate-100 rounded-lg"></div>
      <div className="h-6 w-12 bg-slate-100 rounded-lg"></div>
      <div className="h-6 w-12 bg-slate-100 rounded-lg"></div>
    </div>
    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-100"></div>
        <div className="space-y-1">
          <div className="h-3 w-20 bg-slate-100 rounded"></div>
          <div className="h-2 w-24 bg-slate-100 rounded"></div>
        </div>
      </div>
      <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
    </div>
  </div>
);

const GigMarketplace: React.FC = () => {
  const { gigs, loading, error, fetchGigs } = useGigStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    skillSearch: searchParams.get('skills') || ''
  });

  // Debounced fetch for skill search
  const debouncedFetch = useCallback(
    debounce((filters: any) => {
      fetchGigs(filters);
    }, 400),
    []
  );

  useEffect(() => {
    // Fetch fresh from server every time this page is mounted
    // This ensures newly created gigs appear immediately on return
    const filters = {
      category: searchParams.get('category') || '',
      type: searchParams.get('type') || '',
      skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',') : undefined
    };
    fetchGigs(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateURL = (newFilters: any) => {
    const params: any = {};
    if (newFilters.category) params.category = newFilters.category;
    if (newFilters.type) params.type = newFilters.type;
    if (newFilters.skillSearch) params.skills = newFilters.skillSearch;
    setSearchParams(params);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    updateURL(newFilters);
    fetchGigs({
      category: newFilters.category,
      type: newFilters.type,
      skills: newFilters.skillSearch ? newFilters.skillSearch.split(',').map(s => s.trim()).filter(s => s) : undefined
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newFilters = { ...localFilters, skillSearch: value };
    setLocalFilters(newFilters);
    updateURL(newFilters);
    debouncedFetch({
      category: newFilters.category,
      type: newFilters.type,
      skills: value ? value.split(',').map(s => s.trim()).filter(s => s) : undefined
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[32px] p-4 mb-10 border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[260px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
          <input 
            type="text" 
            placeholder="Filter by skills (e.g. React, UI/UX)"
            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
            value={localFilters.skillSearch}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              name="category"
              className="pl-10 pr-10 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none appearance-none font-bold text-slate-700"
              value={localFilters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="TECH">Technology</option>
              <option value="DESIGN">Design</option>
              <option value="MARKETING">Marketing</option>
              <option value="CONTENT">Content</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <select 
            name="type"
            className="px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none appearance-none font-bold text-slate-700"
            value={localFilters.type}
            onChange={handleFilterChange}
          >
            <option value="">All Gigs</option>
            <option value="PAID">💰 Paid Only</option>
            <option value="COLLAB">🤝 Collab</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Marketplace</h1>
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase shadow-lg shadow-blue-100">Live</span>
          </div>
          <p className="text-slate-500 text-lg">Opportunities posted by your campus community.</p>
        </div>
        <Button onClick={() => navigate('/gigs/new')} className="rounded-2xl px-8 h-14 bg-slate-900 hover:bg-blue-600 text-sm font-bold shadow-xl shadow-slate-200 border-none group">
          <PlusCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          Post a Gig
        </Button>
      </div>

      {error ? (
        <div className="bg-white border-2 border-red-100 p-12 rounded-[40px] text-center shadow-xl shadow-red-50/50 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}. Please try again later or contact support if the issue persists.</p>
          <Button onClick={() => fetchGigs()} variant="secondary" className="px-8">Retry Connection</Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <GigSkeleton key={i} />)}
        </div>
      ) : gigs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-[40px] text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Briefcase className="w-10 h-10 text-slate-200" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">No Gigs Found</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto">We couldn't find any gigs matching your current filters. Why not be the first to post something new?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button onClick={() => navigate('/gigs/new')} className="px-10 py-4 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 border-none shadow-lg shadow-blue-100">
                Post First Gig
             </Button>
             <Button 
                variant="ghost" 
                onClick={() => {
                  setLocalFilters({ category:'', type:'', skillSearch:'' });
                  setSearchParams({});
                  fetchGigs({});
                }} 
                className="px-10 py-4 h-14 rounded-2xl text-slate-500 hover:bg-slate-50"
             >
                Clear All Filters
             </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gigs.map((gig) => (
            <div 
              key={gig.id}
              className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:border-transparent hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full cursor-pointer"
              onClick={() => navigate(`/gigs/${gig.id}`)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-2">
                   <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm shadow-blue-100/50 border border-blue-100/30">
                     {gig.category}
                   </span>
                   <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm border ${
                     gig.type === 'PAID' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100/30 shadow-emerald-100/50' 
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100/30 shadow-indigo-100/50'
                   }`}>
                     {gig.type}
                   </span>
                </div>
                {gig.type === 'PAID' && (
                  <div className="bg-slate-900 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white shadow-lg shadow-slate-100">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-sm font-black">{gig.budget}</span>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-black text-slate-800 mb-3 truncate group-hover:text-blue-600 transition-colors tracking-tight">
                {gig.title}
              </h3>
              
              <p className="text-slate-500 text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                {gig.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {gig.skillsRequired.slice(0, 3).map((skill, i) => (
                  <span key={i} className="text-[11px] font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-100 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100">
                    {skill}
                  </span>
                ))}
                {gig.skillsRequired.length > 3 && (
                  <span className="text-[11px] font-black text-slate-300 self-center">+{gig.skillsRequired.length - 3}</span>
                )}
              </div>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${gig.postedBy}`);
                  }}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 shadow-sm shadow-blue-100/50 border border-white">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{gig.posterName || 'Explorer'}</p>
                    <p className="text-[10px] text-slate-400 font-bold max-w-[120px] truncate">{gig.posterCollege || 'Campus Hub'}</p>
                  </div>
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/gigs/${gig.id}`);
                  }}
                  className="w-12 h-12 bg-slate-900 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center text-white transition-all transform group-hover:rotate-45 shadow-xl shadow-slate-100"
                >
                   <ArrowRight className="w-6 h-6 transform group-hover:-rotate-45 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GigMarketplace;
