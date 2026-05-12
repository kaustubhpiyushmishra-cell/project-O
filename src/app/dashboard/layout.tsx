import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Project O command center. View upcoming sessions, recent activity, and manage your mentorship journey.",
  openGraph: { title: "Dashboard — Project O", description: "Your personal command center." },
};
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
