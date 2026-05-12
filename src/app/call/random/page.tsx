"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Mic, MicOff, Video, VideoOff, SkipForward, AlertTriangle, MonitorPlay, MessageSquare, Clock } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useMatch } from "@/hooks/useMatch";
import { useWebRTC } from "@/hooks/useWebRTC";
import { RatingModal } from "@/components/ui/RatingModal";

export default function RandomCallPage() {
  const { status: matchStatus, sessionId, partnerId, joinQueue, leaveQueue, skip } = useMatch();
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [lastMatch, setLastMatch] = useState<{ id: string; sessionId: string } | null>(null);
  
  const {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
  } = useWebRTC({
    sessionId,
    enabled: matchStatus === "matched",
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Real session timer — resets on each new match
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (matchStatus !== "matched") {
      // If we WERE matched and it lasted more than 10s, show rating modal
      if (seconds >= 10 && lastMatch) {
         setShowRatingModal(true);
      }
      setSeconds(0);
      return;
    }
    
    // Store last match info while in call
    if (sessionId && partnerId) {
       setLastMatch({ id: partnerId, sessionId });
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [matchStatus, sessionId, partnerId]);

  const handleCloseRating = () => {
    setShowRatingModal(false);
    setLastMatch(null);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveQueue();
      setLastMatch(null);
    }
  }, [leaveQueue]);

  const inCall = matchStatus === "matched" || matchStatus === "queued";
  const isActuallyConnected = matchStatus === "matched" && isConnected;

  return (
    <AuthGuard>
      <AppLayout>
       <div className="p-6 md:p-8 h-[calc(100vh-64px)] md:h-full flex flex-col xl:flex-row gap-6 text-forest">
          
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col gap-6 relative min-h-0">
             <div className="flex justify-between items-center mb-2">
                <div>
                   <h1 className="text-[28px] md:text-[32px] font-black tracking-tighter uppercase mb-2">Fun 1v1 Zone</h1>
                   <p className="text-xs font-bold tracking-widest uppercase text-forest/40">
                     {matchStatus === "idle" && "Ready to connect"}
                     {matchStatus === "connecting" && "Connecting to server..."}
                     {matchStatus === "queued" && "Looking for someone..."}
                     {matchStatus === "matched" && (isConnecting ? "Establishing connection..." : "Connected with a peer from your college")}
                     {matchStatus === "disconnected" && "Connection lost — try again"}
                   </p>
                </div>
                {inCall && (
                  <div className={`${matchStatus === "matched" ? "bg-tomato/10 text-tomato border-tomato/20" : "bg-sunshine/10 text-sunshine border-sunshine/20"} border px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2`}>
                     <div className={`w-2 h-2 rounded-full ${matchStatus === "matched" ? "bg-tomato" : "bg-sunshine"} animate-pulse`} />
                     {matchStatus === "matched" ? (
                       <><Clock className="w-3 h-3" /> {formatTime(seconds)}</>
                     ) : (
                       "Searching..."
                     )}
                  </div>
                )}
             </div>

             <div className="flex-1 grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-6 min-h-[400px]">
                {/* Partner Camera */}
                <div className="bg-white/50 rounded-3xl border border-forest/10 relative overflow-hidden group shadow-sm">
                   {matchStatus !== "matched" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
                         {matchStatus === "queued" ? (
                           <>
                             <div className="w-16 h-16 border-4 border-carrot border-t-transparent rounded-full animate-spin mb-6" />
                             <p className="text-forest/40 font-bold uppercase tracking-widest text-[10px]">Looking for someone...</p>
                           </>
                         ) : matchStatus === "disconnected" ? (
                           <p className="text-tomato font-bold uppercase tracking-widest text-[10px]">Partner disconnected</p>
                         ) : (
                           <p className="text-forest/40 font-bold uppercase tracking-widest text-[10px]">Waiting...</p>
                         )}
                      </div>
                   ) : (
                      <div className="absolute inset-0 bg-[#111]">
                        {!isConnected && (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <video 
                          ref={remoteVideoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                   )}
                   
                   <div className="absolute bottom-6 left-6 bg-forest/80 backdrop-blur-md px-4 py-2 rounded-full border border-forest/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      Stranger
                   </div>
                </div>

                {/* Your Camera */}
                <div className="bg-white/50 rounded-3xl border border-forest/10 relative overflow-hidden shadow-sm bg-[#111]">
                   {camOn ? (
                      <video 
                        ref={localVideoRef} 
                        muted 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover [transform:rotateY(180deg)]" 
                      />
                   ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                         <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                            <VideoOff className="w-8 h-8 text-white/50" />
                         </div>
                      </div>
                   )}
                   <div className="absolute bottom-6 left-6 bg-forest/80 backdrop-blur-md px-4 py-2 rounded-full border border-forest/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      You {micOn ? "" : <MicOff className="w-3 h-3 text-tomato" />}
                   </div>
                </div>
             </div>

             {/* Controls */}
             <div className="h-24 bg-white/40 border border-forest/10 rounded-full flex items-center justify-center gap-4 md:gap-8 px-8 backdrop-blur shadow-lg">
                <button onClick={toggleMic} disabled={!localStream} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-forest/5 hover:bg-forest/10 border border-forest/10 text-forest' : 'bg-tomato/10 text-tomato border border-tomato/30'} disabled:opacity-50`}>
                   {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button onClick={toggleCam} disabled={!localStream} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${camOn ? 'bg-forest/5 hover:bg-forest/10 border border-forest/10 text-forest' : 'bg-tomato/10 text-tomato border border-tomato/30'} disabled:opacity-50`}>
                   {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <div className="w-px h-8 bg-forest/10 mx-2" />

                {(matchStatus === "idle" || matchStatus === "disconnected") && (
                  <PremiumButton variant="primary" onClick={joinQueue} className="px-8 h-14 min-w-[140px]">
                     <MonitorPlay className="w-4 h-4" /> Start
                  </PremiumButton>
                )}
                {matchStatus === "queued" && (
                  <PremiumButton variant="primary" onClick={leaveQueue} className="px-8 h-14 min-w-[140px] bg-tomato border-tomato shadow-tomato/20 hover:shadow-tomato/40">
                     <AlertTriangle className="w-4 h-4" /> Stop
                  </PremiumButton>
                )}
                {(matchStatus === "matched" || matchStatus === "connecting") && (
                  <>
                     <PremiumButton variant="secondary" onClick={skip} className="px-8 h-14 min-w-[120px]">
                        <SkipForward className="w-4 h-4" /> Skip
                     </PremiumButton>
                     <button onClick={leaveQueue} className="w-14 h-14 rounded-full flex items-center justify-center transition-all bg-forest/5 hover:bg-tomato/20 hover:text-tomato border border-forest/10 hover:border-tomato/30 text-forest/40">
                        <AlertTriangle className="w-5 h-5" />
                     </button>
                  </>
                )}
             </div>
          </div>

          {/* Icebreaker Panel */}
          <GlassCard glowColor="sunshine" className="xl:w-80 h-full flex flex-col overflow-hidden bg-white/40 p-0 border-forest/10 shadow-lg">
             <div className="p-6 border-b border-forest/10 flex items-center gap-3 bg-white/50">
                <MessageSquare className="w-5 h-5 text-carrot" />
                <h3 className="font-bold tracking-widest uppercase text-sm text-forest">Icebreakers</h3>
             </div>
             
             <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                <p className="text-[10px] font-bold tracking-widest uppercase text-forest/40 leading-relaxed mb-4">Stuck on what to say? Try these conversation starters based on college life.</p>
                
                {[
                  "What clubs or societies are you part of?",
                  "Which domain are you currently exploring?",
                  "Have you done any cool projects lately?",
                  "What's the hardest class you've taken so far?",
                  "Are you preparing for any upcoming internships?",
                  "Tabs or spaces?"
                ].map((prompt, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}
                    key={i} 
                    className="p-4 rounded-2xl bg-cream border border-forest/5 hover:border-carrot/30 transition-all cursor-pointer text-sm text-forest/80 hover:text-forest"
                  >
                     {prompt}
                  </motion.div>
                ))}
             </div>
          </GlassCard>
        </div>
        <RatingModal 
          isOpen={showRatingModal}
          onClose={handleCloseRating}
          sessionId={lastMatch?.sessionId || ""}
          partnerId={lastMatch?.id || ""}
          partnerName="Stranger"
        />
      </AppLayout>
    </AuthGuard>
  );
}
