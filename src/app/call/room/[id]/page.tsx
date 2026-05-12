"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useParams, useRouter } from "next/navigation";
import { sessionApi } from "@/lib/api";
import { RatingModal } from "@/components/ui/RatingModal";

export default function RoomCallPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState({ id: "", name: "" });

  const {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    cleanup
  } = useWebRTC({
    sessionId,
    enabled: true, // We want it to start immediately when entering the room
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Call timer
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isConnected]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Fetch session details on mount
  useEffect(() => {
    if (sessionId) {
      sessionApi.get(sessionId).then(res => {
        setSessionDetails(res.data);
        // Identify partner from session details (user1 vs user2)
        // Note: The sessionApi.get returns session with user1_id, user2_id, and names if joined
        // We'll use a best-effort approach or fetch it from session history if needed
        // For now, let's assume sessionDetails has partner name
      }).catch(console.error);
    }
  }, [sessionId]);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = async () => {
    try {
      await sessionApi.end(sessionId);
    } catch (e) {
      console.error(e);
    } finally {
      cleanup();
      // Logic to find partner ID/Name for rating
      // If we don't have it yet, we show "Partner"
      const pId = sessionDetails?.user1_id === sessionDetails?.current_user_id 
        ? sessionDetails?.user2_id 
        : sessionDetails?.user1_id;
      const pName = sessionDetails?.user1_id === sessionDetails?.current_user_id
        ? sessionDetails?.user2_name
        : sessionDetails?.user1_name;

      setPartnerInfo({ id: pId || "", name: pName || "your partner" });
      setShowRatingModal(true);
    }
  };

  const handleCloseRating = () => {
    setShowRatingModal(false);
    router.push("/dashboard");
  };

  return (
    <AuthGuard>
      <AppLayout>
       <div className="p-6 md:p-8 h-[calc(100vh-64px)] md:h-full flex flex-col gap-6 text-forest max-w-[1400px] mx-auto">
          
          <div className="flex justify-between items-center bg-white/40 p-4 px-8 rounded-full border border-forest/10 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-forest/5 rounded-full flex items-center justify-center text-forest/40">
                   <UserIcon className="w-5 h-5" />
                </div>
                <div>
                   <h1 className="font-black tracking-tight uppercase text-forest">Guided Mentorship Call</h1>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-forest/40">
                     {isConnected ? "Connection Established" : isConnecting ? "Waiting for partner to join..." : "Connecting to room..."}
                   </p>
                </div>
             </div>
             
             <div className={`border px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${isConnected ? "bg-tomato/10 text-tomato border-tomato/20" : "bg-sunshine/10 text-sunshine border-sunshine/20"}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? "bg-tomato" : "bg-sunshine"}`} />
                {isConnected ? (
                  <><Clock className="w-3 h-3" /> {formatTime(seconds)}</>
                ) : (
                  "Waiting..."
                )}
             </div>
          </div>

          {/* Main Video Area */}
          <div className="flex-1 flex flex-col gap-6 relative min-h-[500px]">
             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
             
                {/* Partner Camera */}
                <div className="bg-black/5 rounded-3xl border border-forest/10 relative overflow-hidden group shadow-sm md:absolute md:inset-0 md:w-full md:h-full z-0">
                   {isConnected && remoteStream ? (
                      <div className="absolute inset-0 bg-[#111]">
                        <video 
                          ref={remoteVideoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                   ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm z-10">
                         <div className="w-16 h-16 border-4 border-carrot border-t-transparent rounded-full animate-spin mb-6" />
                         <p className="text-forest/40 font-bold uppercase tracking-widest text-[10px] text-center px-4">
                           Waiting for the other participant<br/>to join room <strong>{sessionId.split('-')[0]}</strong>...
                         </p>
                      </div>
                   )}
                   
                   <div className="absolute bottom-6 left-6 bg-forest/80 backdrop-blur-md px-4 py-2 rounded-full border border-forest/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 z-20">
                      Partner
                   </div>
                </div>

                {/* Your Camera (PiP on Desktop) */}
                <div className="bg-black/10 rounded-3xl border border-white/20 relative overflow-hidden shadow-2xl z-20 md:absolute md:top-6 md:right-6 md:w-72 md:h-48 md:rounded-2xl flex-shrink-0">
                   {camOn ? (
                      <video 
                        ref={localVideoRef} 
                        muted 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover [transform:rotateY(180deg)] bg-[#111]" 
                      />
                   ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#222]">
                         <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <VideoOff className="w-6 h-6 text-white/50" />
                         </div>
                      </div>
                   )}
                   <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      You {micOn ? "" : <MicOff className="w-3 h-3 text-tomato" />}
                   </div>
                </div>
             </div>

             {/* Controls */}
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 h-20 bg-forest/90 border border-white/10 rounded-full flex items-center justify-center gap-4 px-8 backdrop-blur-xl shadow-2xl z-30">
                <button onClick={toggleMic} disabled={!localStream} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-tomato/20 text-tomato'} disabled:opacity-50`}>
                   {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button onClick={toggleCam} disabled={!localStream} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${camOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-tomato/20 text-tomato'} disabled:opacity-50`}>
                   {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <div className="w-px h-8 bg-white/10 mx-2" />

                <PremiumButton variant="primary" onClick={handleEndCall} className="px-8 h-12 min-w-[140px] bg-tomato border-tomato shadow-tomato/20 hover:shadow-tomato/40 text-white font-bold">
                   <PhoneOff className="w-4 h-4 mr-2" /> End Call
                </PremiumButton>
             </div>
          </div>

        </div>
        <RatingModal 
          isOpen={showRatingModal} 
          onClose={handleCloseRating} 
          sessionId={sessionId}
          partnerId={partnerInfo.id}
          partnerName={partnerInfo.name}
        />
      </AppLayout>
    </AuthGuard>
  );
}
