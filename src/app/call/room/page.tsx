"use client";

import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Settings, MoreVertical } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { useState } from "react";
import { motion } from "framer-motion";

export default function RoomPage() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="h-screen w-screen bg-[#0A0A0A] overflow-hidden relative flex flex-col text-white">
      
      {/* Top Bar */}
      <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between px-8">
         <div className="flex gap-4 items-center">
            <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
               Guided Session
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-400 border-l border-white/20 pl-4">Rishabh K. / You</span>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-red-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 bg-red-400/10 px-4 py-2 rounded-full border border-red-400/20 backdrop-blur-md">
               <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
               28:45
            </div>
         </div>
      </div>

      {/* Main Video View */}
      <div className="flex-1 relative p-4 h-full">
         <div className="w-full h-full rounded-[2rem] overflow-hidden relative border border-white/5 bg-[#111]">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1920&h=1080" className="w-full h-full object-cover" alt="Mentor" />
            <div className="absolute bottom-10 left-10 text-xl font-bold tracking-tight bg-black/50 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">
               Rishabh K.
            </div>
         </div>

         {/* Picture in Picture */}
         <motion.div 
            drag dragConstraints={{ left: 0, right: 1000, top: 0, bottom: 500 }}
            className="absolute top-10 right-10 w-64 md:w-80 aspect-video rounded-2xl overflow-hidden border-2 border-white/20 bg-[#111] shadow-2xl cursor-move z-20"
         >
            {camOn ? (
               <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800&h=800" className="w-full h-full object-cover pointer-events-none" alt="You" />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                  <VideoOff className="w-8 h-8 text-neutral-500" />
               </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
               You {micOn ? "" : "(Muted)"}
            </div>
         </motion.div>
      </div>

      {/* Bottom Controls Float */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#111]/80 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/10 z-20 shadow-2xl">
         
         <button onClick={() => setMicOn(!micOn)} className={`w-14 h-14 rounded-full flex items-center justify-center premium-transition ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
         </button>
         
         <button onClick={() => setCamOn(!camOn)} className={`w-14 h-14 rounded-full flex items-center justify-center premium-transition ${camOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
         </button>

         <button className="w-14 h-14 rounded-full flex items-center justify-center premium-transition bg-white/10 hover:bg-white/20">
            <MonitorUp className="w-5 h-5" />
         </button>

         <button className="w-14 h-14 rounded-full flex items-center justify-center premium-transition bg-white/10 hover:bg-white/20 hidden md:flex">
            <Settings className="w-5 h-5" />
         </button>

         <div className="w-px h-8 bg-white/10 mx-2" />

         <PremiumButton variant="danger" className="h-14">
            <PhoneOff className="w-4 h-4" /> End Call
         </PremiumButton>

      </div>
    </div>
  );
}
