import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Fun 1v1 Zone",
  description: "Jump into a random 1v1 video call with a fellow student. Expand your network spontaneously.",
  openGraph: { title: "Fun 1v1 Zone — Project O", description: "Random 1v1 video networking with peers." },
};
export default function CallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
