"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface UseWebRTCOptions {
  sessionId: string | null;
  enabled: boolean;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  toggleMic: () => void;
  toggleCam: () => void;
  micOn: boolean;
  camOn: boolean;
  cleanup: () => void;
}

export function useWebRTC({ sessionId, enabled }: UseWebRTCOptions): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const makingOfferRef = useRef(false);

  const cleanup = useCallback(() => {
    // Stop all local tracks
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    // Close peer connection
    pcRef.current?.close();
    pcRef.current = null;

    // Disconnect signaling socket
    if (socketRef.current && sessionId) {
      socketRef.current.emit("leave_session", { sessionId });
    }
    disconnectSocket("signaling");
    socketRef.current = null;

    setRemoteStream(null);
    setIsConnecting(false);
    setIsConnected(false);
  }, [sessionId]);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    let cancelled = false;

    async function init() {
      try {
        setIsConnecting(true);
        setError(null);

        // 1. Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // 2. Create peer connection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Remote stream setup
        const remote = new MediaStream();
        setRemoteStream(remote);

        pc.ontrack = (event) => {
          event.streams[0]?.getTracks().forEach((track) => {
            remote.addTrack(track);
          });
          setIsConnected(true);
          setIsConnecting(false);
        };

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 3. Connect to signaling socket
        const socket = getSocket("signaling");
        socketRef.current = socket;

        // ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice_candidate", {
              sessionId,
              candidate: event.candidate,
            });
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setIsConnected(true);
            setIsConnecting(false);
          }
          if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
            setIsConnected(false);
          }
        };

        // Socket event handlers
        socket.on("peer_joined", async () => {
          // We are the initiator — create offer
          try {
            makingOfferRef.current = true;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { sessionId, offer: pc.localDescription });
          } catch (err) {
            console.error("[WebRTC] Offer error:", err);
          } finally {
            makingOfferRef.current = false;
          }
        });

        socket.on("offer", async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("answer", { sessionId, answer: pc.localDescription });
          } catch (err) {
            console.error("[WebRTC] Answer error:", err);
          }
        });

        socket.on("answer", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (err) {
            console.error("[WebRTC] Set remote answer error:", err);
          }
        });

        socket.on("ice_candidate", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
          try {
            if (candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          } catch (err) {
            console.error("[WebRTC] ICE candidate error:", err);
          }
        });

        socket.on("peer_left", () => {
          setIsConnected(false);
          setRemoteStream(null);
        });

        // Join the session room
        socket.emit("join_session", { sessionId });
      } catch (err) {
        if (!cancelled) {
          console.error("[WebRTC] Init error:", err);
          setError(
            err instanceof DOMException && err.name === "NotAllowedError"
              ? "Camera/microphone permission denied. Please allow access."
              : "Failed to initialize video call."
          );
          setIsConnecting(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, enabled]);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicOn((prev) => !prev);
  }, []);

  const toggleCam = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCamOn((prev) => !prev);
  }, []);

  return {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    error,
    toggleMic,
    toggleCam,
    micOn,
    camOn,
    cleanup,
  };
}
