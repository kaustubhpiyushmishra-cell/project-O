import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Project O account and join the peer networking revolution. Connect with seniors and mentors.",
  openGraph: { title: "Sign Up — Project O", description: "Join the peer networking revolution." },
};
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
