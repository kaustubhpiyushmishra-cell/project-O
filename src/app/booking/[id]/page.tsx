"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Clock, Calendar as CalIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { userApi, mentorshipApi, User } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [mentor, setMentor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sessionLength, setSessionLength] = useState(30);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topic, setTopic] = useState("");

  const timeSlots = ["10:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "04:30 PM", "05:00 PM", "08:00 PM"];

  useEffect(() => {
    if (!id) return;
    async function loadMentor() {
      try {
        setLoading(true);
        const res = await userApi.getPublicProfile(id);
        
        if (!res.data.isMentor || res.data.mentorStatus !== 'approved') {
          setError("This user is not an approved mentor.");
          return;
        }

        setMentor(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load mentor profile.");
      } finally {
        setLoading(false);
      }
    }
    loadMentor();
  }, [id]);

  const handleBooking = async () => {
    if (!mentor || !selectedSlot) return;
    
    setIsSubmitting(true);
    try {
      // In a real app we'd construct an ISO string from selected calendar date + slot.
      // For Phase 3, we mock the exact requested time string:
      const scheduledAtStr = `2026-05-14 ${selectedSlot}`;
      
      await mentorshipApi.createRequest({
        mentorId: mentor.id,
        topic: topic || "General Career/Tech Guidance",
        message: `Requested ${sessionLength} min session on ${scheduledAtStr}.`,
      });

      // Redirect to requests dashboard after success
      router.push('/dashboard/requests');
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit booking request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex justify-center items-center h-[50vh]">
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
          <div className="p-6 md:p-12 text-center text-forest">
             <h2 className="text-2xl font-black text-tomato">{error || "Mentor Not Found"}</h2>
          </div>
        </AppLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto text-forest">
        <PremiumButton variant="glass" href={`/mentors/${mentor.id}`} className="mb-12">
           ← Back to Profile
        </PremiumButton>

        <GlassCard glowColor="none" className="mt-8 flex flex-col md:flex-row min-h-[600px] border-forest/10 overflow-hidden bg-white/40 shadow-2xl p-0">
           
           {/* Left Sidebar (Session Details) */}
           <div className="w-full md:w-[35%] bg-forest/5 p-8 md:p-12 border-b md:border-b-0 md:border-r border-forest/10 flex flex-col justify-between">
              <div>
                 <div className="w-16 h-16 rounded-2xl bg-forest/5 border border-forest/10 shadow-inner mb-6 flex items-center justify-center overflow-hidden text-forest/20 uppercase text-2xl font-black">
                    {mentor.name?.charAt(0) || 'M'}
                 </div>
                 <h4 className="text-[10px] font-bold tracking-widest uppercase text-forest/40 mb-2">Guided 1v1 Session</h4>
                 <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase text-forest mb-6">{mentor.name}</h1>
                 
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-forest/60">
                       <Clock className="w-5 h-5 text-carrot" /> {sessionLength} Min Video Call
                    </div>
                    {selectedSlot && (
                      <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-forest">
                         <CalIcon className="w-5 h-5 text-carrot" /> May 14, {selectedSlot}
                      </div>
                    )}
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-forest/10">
                 <p className="text-[10px] font-bold tracking-widest uppercase text-forest/30">
                   {mentor.mentorRate === 0 ? "Free Session" : `₹${mentor.mentorRate} total • Will be deducted from Wallet.`}
                 </p>
                 <div className="mt-6 flex flex-col gap-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-forest/40">Topic / Agenda (Optional)</label>
                    <textarea 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Mock Frontend Interview"
                      className="bg-white/50 border border-forest/10 rounded-xl p-3 text-sm focus:outline-none focus:border-carrot transition-colors resize-none h-20"
                    />
                 </div>
              </div>
           </div>

           {/* Right Content (Calendar UI) */}
           <div className="w-full md:w-[65%] p-8 md:p-12 bg-white/20">
              <h2 className="text-[28px] md:text-[32px] font-black tracking-tighter uppercase text-forest mb-8">Select a Date & Time</h2>
              
              <div className="mb-12">
                 <p className="text-[10px] font-bold tracking-widest uppercase text-forest/40 mb-4">Session Length</p>
                 <div className="flex gap-4">
                    {[15, 30].map(len => (
                      <button 
                        key={len}
                        onClick={() => setSessionLength(len)}
                        className={`px-8 py-3 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all ${sessionLength === len ? "bg-carrot text-white border-carrot shadow-lg shadow-carrot/20" : "bg-white/50 text-forest/40 border-forest/10 hover:border-forest/30 hover:bg-white/80"}`}
                      >
                         {len} Min
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-12">
                {/* Fake Calendar Widget */}
                <div className="w-full xl:w-[350px]">
                   <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold tracking-widest uppercase text-forest">May 2026</span>
                      <div className="flex gap-2">
                         <button className="p-2 bg-forest/5 rounded hover:bg-forest/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                         <button className="p-2 bg-forest/5 rounded hover:bg-forest/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                   </div>
                   <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold tracking-widest uppercase text-forest/30 mb-4">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}
                   </div>
                   <div className="grid grid-cols-7 gap-2 text-center text-sm">
                      {/* Empty cells */}
                      <span/><span/><span/><span/>
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(d => (
                         <button key={d} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${d === 14 ? "bg-carrot text-white font-black scale-110 shadow-lg shadow-carrot/30" : "text-forest/60 hover:bg-forest/10"}`}>
                           {d}
                         </button>
                      ))}
                   </div>
                </div>

                {/* Time Slots */}
                <div className="flex-1 xl:border-l border-forest/10 xl:pl-8 h-[350px] overflow-y-auto scrollbar-hide">
                   <p className="text-[10px] font-bold tracking-widest uppercase text-forest/40 mb-6 text-center">Thursday, May 14</p>
                   <div className="flex flex-col gap-3">
                      {timeSlots.map(time => (
                         <button 
                            key={time}
                            onClick={() => setSelectedSlot(time)}
                            className={`py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-all border ${selectedSlot === time ? "bg-sunshine text-forest border-sunshine shadow-md" : "bg-white/50 border-forest/5 text-forest/60 hover:bg-white/80 hover:border-forest/20"}`}
                         >
                            {time}
                         </button>
                      ))}
                   </div>
                </div>
              </div>

              {/* Confirm Action */}
              <AnimatePresence>
                 {selectedSlot && (
                   <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 flex justify-end">
                     <PremiumButton 
                       variant="primary" 
                       onClick={handleBooking}
                       disabled={isSubmitting}
                     >
                        <Check className="w-5 h-5 mr-2" /> 
                        {isSubmitting ? "Requesting..." : "Confirm Booking"}
                     </PremiumButton>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </GlassCard>

      </div>
    </AppLayout>
  </AuthGuard>
  );
}
