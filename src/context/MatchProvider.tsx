"use client";

import React, { createContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/context/NotificationProvider";
import type { Socket } from "socket.io-client";

export type MatchStatus = "idle" | "connecting" | "queued" | "matched" | "in-call" | "disconnected";

interface MatchContextType {
  status: MatchStatus;
  sessionId: string | null;
  partnerId: string | null;
  notification: string | null;
  joinQueue: () => void;
  leaveQueue: () => void;
  skip: () => void;
  resetMatch: () => void;
  clearNotification: () => void;
}

export const MatchContext = createContext<MatchContextType | null>(null);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Cleanup on unmount or auth change
  useEffect(() => {
    return () => {
      disconnectSocket("match");
      socketRef.current = null;
    };
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const ensureSocket = useCallback((): Socket | null => {
    if (!isAuthenticated) return null;
    try {
      if (!socketRef.current?.connected) {
        const socket = getSocket("match");
        socketRef.current = socket;

        socket.on("queued", () => {
          setStatus("queued");
        });

        socket.on("matched", (data: { sessionId: string; partnerId: string }) => {
          setSessionId(data.sessionId);
          setPartnerId(data.partnerId);
          setStatus("matched");
          setNotification(null);
        });

        socket.on("left_queue", () => {
          setStatus("idle");
          setSessionId(null);
          setPartnerId(null);
        });

        // Backend system notifications
        socket.on("notification", (data: { type: "success" | "error" | "info" | "warning"; message: string }) => {
          showNotification(data.type || "info", data.message);
        });

        // Match timeout — server auto-removed from queue
        socket.on("match_timeout", (data: { message: string }) => {
          setStatus("idle");
          setSessionId(null);
          setPartnerId(null);
          showNotification("warning", data.message);
        });

        // Partner skipped us
        socket.on("partner_skipped", (data: { message: string }) => {
          setStatus("disconnected");
          setSessionId(null);
          setPartnerId(null);
          showNotification("info", data.message);
        });

        // Partner disconnected
        socket.on("partner_disconnected", (data: { message: string }) => {
          setStatus("disconnected");
          setSessionId(null);
          setPartnerId(null);
          showNotification("error", data.message);
        });

        socket.on("error", (err: { message: string }) => {
          console.error("[Match] Error:", err.message);
          showNotification("error", err.message);
        });

        socket.on("disconnect", () => {
          setStatus("disconnected");
        });

        socket.on("connect", () => {
          // If we were disconnected mid-queue, status was set to disconnected
          // Don't auto-rejoin — let the user decide
        });
      }
      return socketRef.current;
    } catch (err) {
      console.error("[Match] Socket init error:", err);
      return null;
    }
  }, [isAuthenticated]);

  const joinQueue = useCallback(() => {
    const socket = ensureSocket();
    if (!socket) return;
    setStatus("connecting");
    setNotification(null);
    socket.emit("join_queue");
  }, [ensureSocket]);

  const leaveQueue = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("leave_queue");
    setStatus("idle");
    setSessionId(null);
    setPartnerId(null);
    setNotification(null);
  }, []);

  const skip = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    setStatus("connecting");
    socket.emit("skip");
    setSessionId(null);
    setPartnerId(null);
  }, []);

  const resetMatch = useCallback(() => {
    leaveQueue();
    disconnectSocket("match");
    socketRef.current = null;
    setStatus("idle");
    setNotification(null);
  }, [leaveQueue]);

  const value = useMemo(
    () => ({ status, sessionId, partnerId, notification, joinQueue, leaveQueue, skip, resetMatch, clearNotification }),
    [status, sessionId, partnerId, notification, joinQueue, leaveQueue, skip, resetMatch, clearNotification]
  );

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
}
