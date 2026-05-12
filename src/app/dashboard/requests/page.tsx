"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Calendar, Clock, MessageSquare, Check, X, ArrowRight, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { mentorshipApi, sessionApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface MentorshipRequest {
  id: string;
  requester_id: string;
  mentor_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  topic: string | null;
  scheduled_at: string | null;
  created_at: string;
  // Dynamic joins
  requester_name?: string;
  requester_college?: string;
  mentor_name?: string;
  mentor_college?: string;
}

export default function RequestsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [sentRequests, setSentRequests] = useState<MentorshipRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        mentorshipApi.list({ role: 'requester' }),
        user?.isMentor ? mentorshipApi.list({ role: 'mentor' }) : Promise.resolve({ data: [] })
      ]);
      setSentRequests(sentRes.data);
      setReceivedRequests(receivedRes.data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleRespond = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      await mentorshipApi.respond({ requestId, action });
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to respond");
    }
  };

  const handleJoinCall = async (requestId: string, partnerId: string) => {
    try {
      // Create session on the fly for this specific mentorship request
      const res = await sessionApi.create({
        userId2: partnerId,
        type: 'mentorship',
        mentorshipId: requestId
      });
      router.push(`/call/room/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to join room");
    }
  };

  const renderStatus = (status: string) => {
    switch(status) {
      case 'pending': return <span className="bg-sunshine/10 text-sunshine border border-sunshine/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Pending</span>;
      case 'accepted': return <span className="bg-forest/10 text-forest border border-forest/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Accepted</span>;
      case 'rejected': return <span className="bg-tomato/10 text-tomato border border-tomato/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Declined</span>;
      default: return null;
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6 md:p-12 max-w-7xl mx-auto text-forest min-h-[calc(100vh-64px)]">
           <PremiumButton variant="glass" href="/dashboard" className="mb-8">
              ← Back to Dashboard
           </PremiumButton>

           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
              <div>
                 <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase">Bookings & Requests</h1>
                 <p className="text-xs font-bold tracking-widest uppercase text-forest/40">Manage your guided 1v1 sessions.</p>
              </div>

              <div className="flex bg-white/40 p-1 rounded-full border border-forest/10 shadow-sm">
                 <button 
                   onClick={() => setActiveTab('sent')}
                   className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'sent' ? 'bg-white text-forest shadow-md' : 'text-forest/40 hover:text-forest'}`}
                 >
                   My Bookings
                 </button>
                 {user?.isMentor && (
                   <button 
                     onClick={() => setActiveTab('received')}
                     className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'received' ? 'bg-white text-forest shadow-md' : 'text-forest/40 hover:text-forest'}`}
                   >
                     Incoming Requests
                   </button>
                 )}
              </div>
           </div>

           {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="w-8 h-8 border-4 border-carrot border-t-transparent rounded-full animate-spin"></div>
             </div>
           ) : (
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4"
                >
                   {activeTab === 'sent' && (
                     sentRequests.length === 0 ? (
                       <div className="text-center py-24 bg-white/30 rounded-3xl border border-forest/10">
                          <Calendar className="w-12 h-12 text-forest/20 mx-auto mb-4" />
                          <p className="text-xs font-bold tracking-widest uppercase text-forest/40">No bookings yet.</p>
                       </div>
                     ) : (
                       sentRequests.map(req => (
                         <GlassCard key={req.id} glowColor="none" className="p-6 md:p-8 border-forest/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                               <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-black tracking-tight uppercase">{req.mentor_name}</h3>
                                  {renderStatus(req.status)}
                               </div>
                               <p className="text-[10px] font-bold tracking-widest uppercase text-forest/60 mb-4">{req.mentor_college}</p>
                               
                               <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                  <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-forest/80">
                                     <MessageSquare className="w-4 h-4 text-carrot" /> {req.topic || "General"}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-forest/80">
                                     <Clock className="w-4 h-4 text-sunshine" /> {req.message || "Date Pending"}
                                  </div>
                               </div>
                            </div>

                            {req.status === 'accepted' && (
                              <PremiumButton variant="primary" onClick={() => handleJoinCall(req.id, req.mentor_id)}>
                                 <Video className="w-4 h-4 mr-2" /> Join Room
                              </PremiumButton>
                            )}
                         </GlassCard>
                       ))
                     )
                   )}

                   {activeTab === 'received' && (
                     receivedRequests.length === 0 ? (
                       <div className="text-center py-24 bg-white/30 rounded-3xl border border-forest/10">
                          <Calendar className="w-12 h-12 text-forest/20 mx-auto mb-4" />
                          <p className="text-xs font-bold tracking-widest uppercase text-forest/40">No incoming requests.</p>
                       </div>
                     ) : (
                       receivedRequests.map(req => (
                         <GlassCard key={req.id} glowColor="sunshine" className="p-6 md:p-8 border-forest/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                               <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-black tracking-tight uppercase">{req.requester_name}</h3>
                                  {renderStatus(req.status)}
                               </div>
                               <p className="text-[10px] font-bold tracking-widest uppercase text-forest/60 mb-4">{req.requester_college}</p>
                               
                               <div className="bg-forest/5 p-4 rounded-xl mb-4 border border-forest/5">
                                 <p className="text-xs font-bold tracking-widest uppercase text-forest/40 mb-1">Topic / Message</p>
                                 <p className="text-sm font-medium text-forest/80">"{req.topic}" - {req.message}</p>
                               </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 min-w-[140px]">
                              {req.status === 'pending' ? (
                                <>
                                  <PremiumButton variant="primary" onClick={() => handleRespond(req.id, 'accepted')} className="w-full">
                                    <Check className="w-4 h-4 mr-2" /> Accept
                                  </PremiumButton>
                                  <button onClick={() => handleRespond(req.id, 'rejected')} className="text-[10px] font-bold tracking-widest uppercase text-tomato/60 hover:text-tomato transition-colors py-2">
                                    Decline Request
                                  </button>
                                </>
                              ) : req.status === 'accepted' ? (
                                <PremiumButton variant="primary" onClick={() => handleJoinCall(req.id, req.requester_id)} className="w-full bg-forest text-white border-forest">
                                  <Video className="w-4 h-4 mr-2" /> Start Call
                                </PremiumButton>
                              ) : null}
                            </div>
                         </GlassCard>
                       ))
                     )
                   )}
                </motion.div>
             </AnimatePresence>
           )}

        </div>
      </AppLayout>
    </AuthGuard>
  );
}
