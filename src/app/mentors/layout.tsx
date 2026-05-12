import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Find Mentors",
  description: "Browse verified mentors across DSA, Web Dev, AI, Cloud, and more. Book 1v1 guided sessions.",
  openGraph: { title: "Find Mentors — Project O", description: "Browse verified mentors and book 1v1 sessions." },
};
export default function MentorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
