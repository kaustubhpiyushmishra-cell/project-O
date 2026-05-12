"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, Video, Calendar, Sparkles, Clock, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { sessionApi, mentorshipApi, type SessionHistory } from "@/lib/api";
import { ActivitySkeleton } from "@/components/ui/skeleton-loaders";

interface UpcomingSession {
  id: string;
  mentorName: string;
  topic: string;
  scheduledAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentSessions, setRecentSessions] = useState<SessionHistory[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [historyRes, mentorshipRes] = await Promise.all([
        sessionApi.history({ limit: 5 }).catch(() => ({ data: [] })),
        mentorshipApi.list({ role: "requester", status: "accepted" }).catch(() => ({ data: [] })),
      ]);

      setRecentSessions(historyRes.data);

      // Map accepted mentorship requests to upcoming sessions
      const upcoming = (mentorshipRes.data as any[])
        .filter((r: any) => r.scheduled_at || r.scheduledAt)
        .map((r: any) => ({
          id: r.id,
          mentorName: r.mentor_name || r.mentorName || "Mentor",
          topic: r.topic || "Guided Session",
          scheduledAt: r.scheduled_at || r.scheduledAt,
        }));
      setUpcomingSessions(upcoming);
    } catch {
      // Silent fail — dashboard should always render
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return "—";
    const m = Math.floor(sec / 60);
    return `${m} min${m !== 1 ? "s" : ""}`;
  };

  const formatRelativeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return `Today, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + `, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const formatUpcomingDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + `, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <AuthGuard>
      <AppLayout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-12 text-forest">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-section mb-2">Dashboard</h1>
            <p className="text-caption">Welcome back, {user?.name || 'Student'}.</p>
          </motion.div>
          <div className="flex items-center gap-4">
             <Link href="/dashboard/requests" className="bg-white/50 px-6 py-3 rounded-full border border-forest/10 flex items-center gap-3 hover:bg-white/80 transition-colors">
                <Calendar className="text-carrot w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase text-forest/60 hover:text-forest">My Bookings</span>
             </Link>
          </div>
        </div>

        {/* 3 Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard glowColor="carrot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="p-8 flex flex-col justify-between aspect-square">
            <div className="w-14 h-14 bg-carrot/10 text-carrot rounded-full flex items-center justify-center mb-6">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-card mb-2 group-hover:text-indigo-400 transition-colors">Enter Fun 1v1</h3>
              <p className="text-body text-sm mb-6">Start random conversations instantly with peers from your college.</p>
            </div>
            <Link href="/call/random" className="mt-auto flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-forest group-hover:text-carrot transition-all duration-300">
               Jump In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </GlassCard>

          <GlassCard glowColor="sunshine" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="p-8 flex flex-col justify-between aspect-square">
            <div className="w-14 h-14 bg-sunshine/10 text-sunshine border border-sunshine/20 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-card mb-2 group-hover:text-cyan-400 transition-colors">Book Guided 1v1</h3>
              <p className="text-body text-sm mb-6">Find verified mentors for career guidance and mock interviews.</p>
            </div>
            <Link href="/mentors" className="mt-auto flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-forest group-hover:text-sunshine transition-all duration-300">
               Browse Mentors <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </GlassCard>

          <GlassCard glowColor="forest" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="p-8 flex flex-col justify-between aspect-square">
            <div className="w-14 h-14 bg-forest/5 border border-forest/10 text-forest/40 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 opacity-50" />
            </div>
            <div>
              <h3 className="text-card mb-2 group-hover:text-forest transition-colors">Become a Mentor</h3>
              <p className="text-body text-sm mb-6">Share your experience, help juniors, and earn money per session.</p>
            </div>
            <Link href="/profile" className="mt-auto flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-forest/40 group-hover:text-forest transition-colors text-left uppercase">
               Apply Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </GlassCard>
        </div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[28px] md:text-[32px] font-black tracking-tighter uppercase text-forest">Upcoming Sessions</h2>
            </div>
            <div className="flex flex-col gap-4">
              {upcomingSessions.map((session, i) => (
                <div key={session.id} className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cyan-400/10">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold tracking-tight mb-1">Guided Session with {session.mentorName}</h4>
                    <p className="text-sm text-neutral-500">{session.topic}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-neutral-600">
                    <Clock className="w-4 h-4" /> {formatUpcomingDate(session.scheduledAt)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="mt-8">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-[28px] md:text-[32px] font-black tracking-tighter uppercase text-forest">Recent Activity</h2>
             <Link href="/history" className="text-caption text-forest/40 hover:text-forest transition-colors">View All</Link>
          </div>
          
          {loading ? (
            <div className="flex flex-col">
              {Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)}
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="glass-panel p-12 flex flex-col items-center text-center gap-4">
              <Video className="w-10 h-10 text-forest/15" />
              <p className="text-sm text-forest/40 font-medium">No sessions yet. Start your first 1v1 to see activity here!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
               {recentSessions.map((session, i) => {
                 const isMentorship = session.type === "mentorship";
                 const Icon = isMentorship ? Calendar : Video;
                 const color = isMentorship ? "text-cyan-400" : "text-indigo-400";
                 const bg = isMentorship ? "bg-cyan-400/10" : "bg-indigo-400/10";

                 return (
                   <div key={session.id} className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
                         <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold tracking-tight mb-1">
                           {isMentorship ? "Guided Session" : "Fun 1v1"} with {session.partnerName || "Unknown"}
                         </h4>
                         <p className="text-sm text-neutral-500">
                           {formatDuration(session.durationSec)}
                           {session.myRating ? ` • Rated ${session.myRating}/5` : ""}
                         </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-neutral-600">
                         <Clock className="w-4 h-4" /> {formatRelativeDate(session.startedAt)}
                      </div>
                   </div>
                 );
               })}
            </div>
          )}
        </motion.div>

      </div>
    </AppLayout>
  </AuthGuard>
  );
}
