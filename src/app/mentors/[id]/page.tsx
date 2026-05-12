"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Star, CheckCircle2, Clock, MapPin, ArrowRight, Video } from "lucide-react";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useState, useEffect } from "react";
import { userApi, ratingApi, User, RatingStats } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

export default function MentorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [mentor, setMentor] = useState<User | null>(null);
  const [ratings, setRatings] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadMentor() {
      try {
        setLoading(true);
        const [profRes, rateRes] = await Promise.all([
          userApi.getPublicProfile(id),
          ratingApi.getUserRatings(id)
        ]);
        
        // Prevent non-mentors from being viewed as mentors
        if (!profRes.data.isMentor || profRes.data.mentorStatus !== 'approved') {
          setError("This user is not an approved mentor.");
          return;
        }

        setMentor(profRes.data);
        setRatings(rateRes.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load mentor profile.");
      } finally {
        setLoading(false);
      }
    }
    loadMentor();
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="p-6 md:p-12 max-w-7xl mx-auto flex justify-center items-center h-[50vh]">
             <div className="w-12 h-12 border-4 border-carrot border-t-transparent rounded-full animate-spin"></div>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  if (error || !mentor) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="p-6 md:p-12 max-w-7xl mx-auto text-center">
            <h2 className="text-2xl font-black text-tomato mb-4 uppercase">{error || "Mentor Not Found"}</h2>
            <PremiumButton variant="secondary" href="/mentors">
               Back to Mentors
            </PremiumButton>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
       <div className="p-6 md:p-12 max-w-7xl mx-auto text-forest">
          <PremiumButton variant="glass" href="/mentors" className="mb-12">
             ← Back to Mentors
          </PremiumButton>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
             
             {/* Left Column: Profile Info */}
             <div className="lg:col-span-2 flex flex-col gap-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col md:flex-row gap-8 items-start">
                   {/* Avatar */}
                   <div className="relative">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-forest/5 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                         <span className="text-4xl font-black text-forest/10">{mentor.name?.charAt(0) ?? '?'}</span>
                      </div>
                      {mentor.isOnline && (
                        <span className="absolute bottom-2 right-2 w-6 h-6 bg-kiwi border-4 border-white rounded-full shadow-lg animate-pulse" />
                      )}
                   </div>

                   <div className="flex-1 flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-4">
                         <h1 className="text-[32px] md:text-[56px] font-black tracking-tighter uppercase leading-none text-forest">
                            {mentor.name}
                         </h1>
                         {mentor.isOnline && (
                           <span className="bg-kiwi/10 text-kiwi text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-kiwi/20 shadow-sm shadow-kiwi/10">Online Now</span>
                         )}
                         <CheckCircle2 className="text-carrot w-8 h-8" />
                      </div>
                      <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest uppercase text-forest/40">
                         <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {mentor.college || 'College'}</span>
                         <span className="flex items-center gap-2"><Star className="w-4 h-4 text-sunshine fill-sunshine" /> {mentor.reputation} Reputation</span>
                      </div>
                      <p className="text-body text-forest font-bold uppercase tracking-tight line-clamp-2">
                        {mentor.mentorBio}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                         {mentor.interests?.map(interest => (
                           <span key={interest} className="bg-forest/5 text-forest/60 border border-forest/5 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase">
                              {interest}
                           </span>
                         ))}
                      </div>
                   </div>
                </motion.div>

                {/* About */}
                <GlassCard glowColor="sunshine" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="p-8 md:p-12 border-forest/10">
                   <h2 className="text-2xl font-black tracking-tighter uppercase mb-6 text-forest">About Me</h2>
                   <p className="text-body max-w-3xl text-forest/80 leading-relaxed font-medium whitespace-pre-wrap">
                      {mentor.mentorBio || "This mentor hasn't written a detailed bio yet."}
                   </p>
                </GlassCard>

                {/* Background Details */}
                <GlassCard glowColor="sunshine" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="p-8 md:p-12 border-forest/10">
                   <h2 className="text-2xl font-black tracking-tighter uppercase mb-6 text-forest">Academic Background</h2>
                   <div className="flex flex-col gap-8 text-forest">
                      <div className="border-l-4 border-carrot/20 pl-6 pb-2 inline-block">
                         <h3 className="text-xl font-black tracking-tight uppercase">{mentor.branch || 'Undecided'}</h3>
                         <p className="text-carrot text-[10px] font-bold tracking-widest uppercase mt-1 mb-3">Year {mentor.year || 'Unknown'}</p>
                         <p className="text-sm text-forest/60 font-medium">Currently studying at {mentor.college}</p>
                      </div>
                   </div>
                </GlassCard>

                {/* Reviews */}
                <GlassCard glowColor="carrot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="p-8 md:p-12 border-forest/10">
                   <div className="flex justify-between items-center mb-10">
                      <h2 className="text-2xl font-black tracking-tighter uppercase text-forest">Recent Reviews</h2>
                      {ratings && ratings.total_ratings > 0 && (
                         <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-carrot">
                               <Star className="w-5 h-5 fill-current" />
                               <span className="text-2xl font-black">{ratings.average_score}</span>
                            </div>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-forest/40">From {ratings.total_ratings} sessions</span>
                         </div>
                      )}
                   </div>

                   {!ratings || ratings.recent_ratings === null || ratings.recent_ratings.length === 0 ? (
                      <p className="text-sm text-forest/40 font-bold tracking-widest uppercase italic">No reviews yet. Be the first to rate!</p>
                   ) : (
                      <div className="flex flex-col gap-8">
                         {ratings.recent_ratings.map((review, i) => (
                            <div key={i} className="flex flex-col gap-3 group">
                               <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-0.5">
                                     {[...Array(5)].map((_, star) => (
                                        <Star key={star} className={`w-3.5 h-3.5 ${star < review.score ? 'text-carrot fill-current' : 'text-forest/10'}`} />
                                     ))}
                                  </div>
                                  <span className="text-[10px] font-bold tracking-widest uppercase text-forest/30">
                                     {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                               </div>
                               <p className="text-sm font-medium text-forest/80 italic leading-relaxed">
                                  "{review.comment || "No written feedback."}"
                               </p>
                            </div>
                         ))}
                      </div>
                   )}
                </GlassCard>
             </div>

             {/* Right Column: Sticky Booking Widget */}
             <div className="relative">
               <div className="sticky top-24">
                  <GlassCard glowColor="carrot" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="p-8 border-forest/10 shadow-2xl">
                     <h3 className="text-2xl font-black tracking-tighter uppercase mb-6 text-forest">Book a Session</h3>
                     
                     <div className="flex justify-between items-center mb-8 pb-8 border-b border-forest/10">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-forest/40">Pricing</span>
                        <span className="text-3xl font-black tracking-tight text-forest">
                          {mentor.mentorRate === 0 ? "Free" : `₹${mentor.mentorRate}`}
                        </span>
                     </div>

                     <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-forest/60">
                           <Clock className="w-5 h-5 text-carrot" /> 30 Minutes
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-forest/60">
                           <Video className="w-5 h-5 text-carrot" /> 1v1 Video Call
                        </div>
                     </div>

                     <PremiumButton variant="primary" onClick={() => router.push(`/booking/${mentor.id}`)} className="w-full">
                        Select Time <ArrowRight className="w-4 h-4 ml-2" />
                     </PremiumButton>

                     <p className="text-center text-[10px] font-bold tracking-widest uppercase text-forest/30 mt-6 md:mt-8">Request requires mentor approval.</p>
                  </GlassCard>
               </div>
             </div>

          </div>
       </div>
    </AppLayout>
  </AuthGuard>
  );
}
