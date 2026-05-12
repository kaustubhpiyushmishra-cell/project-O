import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Session History",
  description: "Review your past 1v1 and mentorship sessions. Rate your experience and track your journey.",
  openGraph: { title: "History — Project O", description: "Review past sessions and rate your experience." },
};
export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
