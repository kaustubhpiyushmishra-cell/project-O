"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { sessionApi, type SessionHistory } from "@/lib/api";
import { RatingModal } from "@/components/ui/RatingModal";
import { Video, Calendar, Clock, Star, ArrowLeft, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{
    open: boolean;
    sessionId: string;
    partnerId: string;
    partnerName: string;
  }>({ open: false, sessionId: "", partnerId: "", partnerName: "" });

  useEffect(() => {
    sessionApi
      .history({ limit: 50 })
      .then((res) => setSessions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDuration = (sec?: number) => {
    if (!sec) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6 md:p-12 max-w-5xl mx-auto flex flex-col gap-8 text-forest">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full bg-white/50 border border-forest/10 flex items-center justify-center hover:bg-white/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-forest/60" />
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase">Session History</h1>
              <p className="text-sm font-bold tracking-widest uppercase text-forest/40">
                {sessions.length} total session{sessions.length !== 1 ? "s" : ""}
              </p>
            </motion.div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-3 border-forest/10 border-t-carrot rounded-full animate-spin" />
              <p className="text-xs font-bold tracking-widest uppercase text-forest/40">Loading sessions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && sessions.length === 0 && (
            <GlassCard glowColor="sunshine" className="p-12 flex flex-col items-center text-center gap-4">
              <Video className="w-12 h-12 text-forest/20" />
              <h3 className="text-xl font-black tracking-tight">No sessions yet</h3>
              <p className="text-sm text-forest/40 font-medium max-w-md">
                Start a Fun 1v1 or book a Guided Session to see your history here.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 bg-forest text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-forest/90 transition-colors"
              >
                Go to Dashboard
              </Link>
            </GlassCard>
          )}

          {/* Session List */}
          {!loading && sessions.length > 0 && (
            <div className="flex flex-col gap-4">
              {sessions.map((session, i) => {
                const isMentorship = session.type === "mentorship";
                const isActive = session.status === "active";
                const canRate = session.status === "ended" && !session.myRating;

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <GlassCard
                      glowColor="none"
                      className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center border-forest/10 hover:border-forest/20 transition-colors"
                    >
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          isMentorship ? "bg-sunshine/10" : "bg-carrot/10"
                        }`}
                      >
                        {isMentorship ? (
                          <Calendar className="w-5 h-5 text-sunshine" />
                        ) : (
                          <Video className="w-5 h-5 text-carrot" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold tracking-tight text-forest">
                            {isMentorship ? "Guided Session" : "Fun 1v1"} with {session.partnerName || "Unknown"}
                          </h4>
                          <span
                            className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-kiwi/10 text-kiwi border border-kiwi/20"
                                : session.status === "ended"
                                ? "bg-forest/5 text-forest/40 border border-forest/10"
                                : "bg-tomato/10 text-tomato border border-tomato/20"
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-forest/40 font-bold tracking-widest uppercase">
                          {session.partnerCollege && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {session.partnerCollege}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(session.durationSec)}
                          </span>
                        </div>
                      </div>

                      {/* Date + Rating */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-xs text-forest/40 font-bold tracking-widest uppercase">
                          {formatDate(session.startedAt)} • {formatTime(session.startedAt)}
                        </p>
                        <div className="flex items-center gap-3">
                          {session.myRating && (
                            <div className="flex items-center gap-1 text-[#F5A623]">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-xs font-black">{session.myRating}/5</span>
                            </div>
                          )}
                          {canRate && (
                            <button
                              onClick={() =>
                                setRatingModal({
                                  open: true,
                                  sessionId: session.id,
                                  partnerId: session.partnerId,
                                  partnerName: session.partnerName,
                                })
                              }
                              className="bg-[#F5A623]/10 hover:bg-[#F5A623]/20 text-[#F5A623] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" /> Rate
                            </button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <RatingModal
          isOpen={ratingModal.open}
          onClose={() => setRatingModal({ ...ratingModal, open: false })}
          sessionId={ratingModal.sessionId}
          partnerId={ratingModal.partnerId}
          partnerName={ratingModal.partnerName}
        />
      </AppLayout>
    </AuthGuard>
  );
}
