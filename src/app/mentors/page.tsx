"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Search, Star, Filter, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useState, useEffect } from "react";
import { userApi, type User } from "@/lib/api";
import { MentorCardSkeleton } from "@/components/ui/skeleton-loaders";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeDomain, setActiveDomain] = useState("All");

  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      try {
        const queryParams: any = {};
        if (search.trim()) queryParams.search = search.trim();
        if (activeDomain !== "All") queryParams.domain = activeDomain;
        
        const res = await userApi.listMentors(queryParams);
        setMentors(res.data);
      } catch (err) {
        console.error("Failed to fetch mentors", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchMentors, 500); // debounce search
    return () => clearTimeout(timeoutId);
  }, [search, activeDomain]);

  return (
    <AuthGuard>
      <AppLayout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-12 text-forest">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase mb-2">Find Mentors</h1>
            <p className="text-sm font-bold tracking-widest uppercase text-forest/40">Book 1v1 sessions with verified alumni.</p>
          </motion.div>
          
          <div className="flex w-full md:w-auto items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search domains or names..." 
                className="w-full bg-white/50 border border-forest/10 rounded-full px-12 py-3 outline-none focus:border-carrot/50 focus:bg-white/80 transition-all text-sm text-forest placeholder:text-forest/30 shadow-sm" 
              />
            </div>
            <button className="bg-white/50 border border-forest/10 p-3 rounded-full hover:bg-white/80 transition-all shadow-sm">
              <Filter className="w-5 h-5 text-forest/40" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
           {["All", "DSA", "Web Dev", "AI", "Cloud", "Internships", "Open Source", "Product Management"].map((tag, i) => (
             <button 
               key={i} 
               onClick={() => setActiveDomain(tag)}
               className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeDomain === tag ? "bg-carrot text-white shadow-lg shadow-carrot/20" : "bg-white/50 border border-forest/10 text-forest/60 hover:bg-white/80"}`}
             >
               {tag}
             </button>
           ))}
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>{Array.from({ length: 6 }).map((_, i) => <MentorCardSkeleton key={i} />)}</>
          ) : mentors.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-forest/40 font-bold uppercase tracking-widest text-xs">
              No mentors found matching your criteria.
            </div>
          ) : mentors.map((mentor, i) => (
            <GlassCard 
              glowColor="sunshine"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1, duration: 0.6 }} 
              key={mentor.id} 
              className="p-6 flex flex-col gap-6"
            >
              <div className="flex gap-4">
                 <div className="relative">
                   <div className="w-16 h-16 rounded-full bg-forest/5 border-2 border-forest/10 overflow-hidden shadow-inner flex items-center justify-center">
                      <span className="text-xl font-black text-forest/10">{mentor.name?.charAt(0) || 'U'}</span>
                   </div>
                   {mentor.isOnline && (
                     <span className="absolute bottom-0 right-0 w-4 h-4 bg-kiwi border-2 border-white rounded-full shadow-sm animate-pulse" />
                   )}
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <div className="flex flex-col">
                          <h3 className="text-lg font-bold tracking-tight text-forest flex items-center gap-2">
                            {mentor.name}
                            {mentor.isOnline && <span className="text-[8px] font-black uppercase text-kiwi tracking-widest px-1.5 py-0.5 bg-kiwi/10 rounded">Online</span>}
                          </h3>
                       </div>
                       <div className="flex items-center gap-1 bg-sunshine/20 text-forest px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          <Star className="w-3 h-3 fill-carrot text-carrot" /> {mentor.reputation}
                       </div>
                    </div>
                    <p className="text-carrot text-[10px] font-bold tracking-widest uppercase mt-1">{mentor.college}</p>
                    <p className="text-forest/40 text-xs font-bold tracking-widest uppercase mt-1 line-clamp-1">{mentor.mentorBio}</p>
                 </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                 {mentor.interests?.map(d => (
                   <span key={d} className="bg-forest/5 text-forest/60 border border-forest/5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                      {d}
                   </span>
                 ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-forest/10">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-forest/40">Per Session</span>
                    <span className="text-xl font-black tracking-tight text-forest">{mentor.mentorRate === 0 ? "Free" : `₹${mentor.mentorRate}`}</span>
                 </div>
                 <PremiumButton variant="primary" href={`/mentors/${mentor.id}`}>
                    Book <ArrowRight className="w-4 h-4" />
                 </PremiumButton>
              </div>
            </GlassCard>
          ))}
        </div>

      </div>
    </AppLayout>
  </AuthGuard>
  );
}
