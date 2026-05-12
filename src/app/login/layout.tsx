import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Project O with your college email to start networking with peers and mentors.",
  openGraph: { title: "Login — Project O", description: "Sign in with your college email." },
};
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
