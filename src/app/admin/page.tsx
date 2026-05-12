"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { adminApi, type AdminStats, type PendingMentor, type AdminReport } from "@/lib/api";
import { Users, AlertCircle, Calendar, Radio, ShieldCheck, ShieldAlert, Check, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [mentors, setMentors] = useState<PendingMentor[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, mentorsRes, reportsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingMentors(),
        adminApi.getReports(),
      ]);
      setStats(statsRes.data);
      setMentors(mentorsRes.data);
      setReports(reportsRes.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Admin access required. Your account does not have admin privileges.");
      } else {
        setError("Failed to load admin data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMentorAction = async (userId: string, action: "approved" | "rejected") => {
    setActionLoading(userId);
    try {
      await adminApi.mentorAction({ userId, action });
      setMentors((prev) => prev.filter((m) => m.id !== userId));
      setStats((prev) => (prev ? { ...prev, pendingMentors: prev.pendingMentors - 1 } : prev));
    } catch {
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportAction = async (reportId: string, action: "resolved" | "dismissed") => {
    setActionLoading(reportId);
    try {
      await adminApi.reportAction({ reportId, action });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setStats((prev) => (prev ? { ...prev, pendingReports: prev.pendingReports - 1 } : prev));
    } catch {
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-forest/10 border-t-carrot rounded-full animate-spin" />
            <p className="text-xs font-bold tracking-widest uppercase text-forest/40">Loading admin panel...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassCard glowColor="carrot" className="p-12 max-w-md text-center">
            <ShieldAlert className="w-12 h-12 text-tomato mx-auto mb-4" />
            <h2 className="text-xl font-black tracking-tight text-forest mb-2">Access Denied</h2>
            <p className="text-sm text-forest/50">{error}</p>
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-12 text-forest">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase mb-2">Admin Control</h1>
              <p className="text-sm font-bold tracking-widest uppercase text-forest/40 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-kiwi" /> System running smoothly
              </p>
            </motion.div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Pending Mentors", value: stats?.pendingMentors ?? 0, icon: Users, color: "text-carrot", glow: "carrot" as const },
              { title: "Reported Users", value: stats?.pendingReports ?? 0, icon: AlertCircle, color: "text-tomato", glow: "carrot" as const },
              { title: "Active Sessions", value: stats?.activeSessions ?? 0, icon: Radio, color: "text-sunshine", glow: "sunshine" as const },
              { title: "Total Users", value: stats?.totalUsers ?? 0, icon: Calendar, color: "text-forest/40", glow: "forest" as const },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <GlassCard glowColor={stat.glow} key={i} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold tracking-widest uppercase text-forest/40">{stat.title}</p>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter text-forest">{stat.value}</h3>
                </GlassCard>
              );
            })}
          </div>

          {/* Data Tables Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Verify Mentors */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tighter uppercase text-forest">Mentor Approvals</h3>
                <span className="text-xs font-bold tracking-widest uppercase text-forest/30">
                  {mentors.length} pending
                </span>
              </div>

              {mentors.length === 0 ? (
                <GlassCard glowColor="none" className="p-8 text-center border-forest/10">
                  <p className="text-sm text-forest/40 font-medium">No pending applications</p>
                </GlassCard>
              ) : (
                <GlassCard glowColor="none" className="overflow-hidden p-0 border-forest/10">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/50 text-xs uppercase tracking-widest text-forest/40 border-b border-forest/10">
                        <tr>
                          <th className="px-6 py-4 font-bold">Applicant</th>
                          <th className="px-6 py-4 font-bold">College</th>
                          <th className="px-6 py-4 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forest/5 text-forest">
                        {mentors.map((mentor) => (
                          <tr key={mentor.id} className="hover:bg-forest/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold">{mentor.name || "Unknown"}</p>
                              <p className="text-xs text-forest/40 line-clamp-1">{mentor.mentorBio}</p>
                            </td>
                            <td className="px-6 py-4 text-forest/60">{mentor.college || "—"}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  disabled={actionLoading === mentor.id}
                                  onClick={() => handleMentorAction(mentor.id, "approved")}
                                  className="bg-kiwi/10 hover:bg-kiwi/20 text-kiwi p-2 rounded-full text-[10px] font-bold transition-all disabled:opacity-50"
                                  title="Approve"
                                >
                                  {actionLoading === mentor.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  disabled={actionLoading === mentor.id}
                                  onClick={() => handleMentorAction(mentor.id, "rejected")}
                                  className="bg-tomato/10 hover:bg-tomato/20 text-tomato p-2 rounded-full text-[10px] font-bold transition-all disabled:opacity-50"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Reported Users */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tighter uppercase text-forest flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-tomato" /> Pending Reports
                </h3>
                <span className="text-xs font-bold tracking-widest uppercase text-forest/30">
                  {reports.length} pending
                </span>
              </div>

              {reports.length === 0 ? (
                <GlassCard glowColor="none" className="p-8 text-center border-forest/10">
                  <p className="text-sm text-forest/40 font-medium">No pending reports</p>
                </GlassCard>
              ) : (
                <GlassCard glowColor="none" className="overflow-hidden p-0 border-forest/10">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/50 text-xs uppercase tracking-widest text-forest/40 border-b border-forest/10">
                        <tr>
                          <th className="px-6 py-4 font-bold">Reported User</th>
                          <th className="px-6 py-4 font-bold">Reason</th>
                          <th className="px-6 py-4 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forest/5 text-forest">
                        {reports.map((report) => (
                          <tr key={report.id} className="hover:bg-forest/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-forest/80">{report.reportedName || "Unknown"}</p>
                              <p className="text-[10px] text-forest/30">by {report.reporterName}</p>
                            </td>
                            <td className="px-6 py-4 text-forest/40 text-xs max-w-[200px] line-clamp-2">{report.reason}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  disabled={actionLoading === report.id}
                                  onClick={() => handleReportAction(report.id, "resolved")}
                                  className="bg-tomato/10 hover:bg-tomato text-tomato hover:text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                  Resolve
                                </button>
                                <button
                                  disabled={actionLoading === report.id}
                                  onClick={() => handleReportAction(report.id, "dismissed")}
                                  className="bg-forest/5 hover:bg-forest/10 text-forest/40 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
