"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MessageSquare, MoreVertical, Maximize } from "lucide-react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { useWebRTC } from "@/hooks/useWebRTC"
import { sessionApi } from "@/lib/api"

export default function VideoCallRoom({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    cleanup
  } = useWebRTC({
    sessionId: params.id,
    enabled: true
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Proper call end — cleanup WebRTC, call backend, then navigate
  const handleEndCall = useCallback(async () => {
    try {
      cleanup();
      await sessionApi.end(params.id);
    } catch (err) {
      console.error("Failed to end session:", err);
    } finally {
      router.push("/dashboard");
    }
  }, [cleanup, params.id, router]);

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
            <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
            {formatTime(seconds)}
          </Badge>
          <h2 className="text-sm font-medium hidden sm:block">
            {isConnecting && !isConnected ? "Connecting to peer..." : "Session"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white rounded-full">
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
        {/* Remote Video */}
        <div className="absolute inset-0 w-full h-full object-cover flex items-center justify-center bg-zinc-800">
           {!isConnected && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
               <div className="w-12 h-12 border-4 border-carrot border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Waiting for peer...</p>
             </div>
           )}
           <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
           />
           <div className="absolute bottom-24 left-6 bg-black/60 px-3 py-1 rounded-md backdrop-blur-md text-sm">
             Peer
           </div>
        </div>

        {/* Local Video (PIP) */}
        <div className="absolute top-20 right-6 w-[120px] sm:w-[240px] aspect-video bg-zinc-950 rounded-xl overflow-hidden border-2 border-zinc-700 shadow-2xl z-20">
          {!camOn ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-500">
                <VideoOff className="w-6 h-6" />
              </div>
            </div>
          ) : (
             <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100 bg-zinc-800" />
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 rounded-md text-xs flex items-center gap-2">
            You {!micOn && <MicOff className="w-3 h-3 text-red-500" />}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-20 bg-zinc-950 border-t border-zinc-800 flex items-center justify-center px-4 relative z-20">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center w-full max-w-2xl px-2">
          <Button 
            variant="outline" 
            size="icon" 
            className={`w-12 h-12 rounded-full border-0 ${!micOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
            onClick={toggleMic}
            disabled={!localStream}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            className={`w-12 h-12 rounded-full border-0 ${!camOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
            onClick={toggleCam}
            disabled={!localStream}
          >
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 border-0 hidden sm:flex">
             <MonitorUp className="w-5 h-5" />
          </Button>

          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 border-0 relative">
             <MessageSquare className="w-5 h-5" />
             <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </Button>

          <Button 
            variant="destructive" 
            size="icon" 
            className="w-16 sm:w-20 h-12 rounded-full ml-4 shadow-lg hover:shadow-red-500/20"
            onClick={handleEndCall}
          >
            <PhoneOff className="w-5 h-5" />
          </Button>

          <Button variant="outline" size="icon" className="w-10 h-10 rounded-full bg-zinc-900 text-zinc-400 hover:text-white border-0 absolute right-4 hidden md:flex">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  </AuthGuard>
  )
}
