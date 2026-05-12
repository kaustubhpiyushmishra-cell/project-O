import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your Project O persona, interests, and mentor applications.",
  openGraph: { title: "My Profile — Project O", description: "Manage your persona and applications." },
};
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
