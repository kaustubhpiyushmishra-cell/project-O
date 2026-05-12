import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthProvider";
import { MatchProvider } from "@/context/MatchProvider";
import { NotificationProvider } from "@/context/NotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Project O — Peer Networking & Mentorship",
    template: "%s | Project O",
  },
  description: "Talk to seniors, learn faster. A 1v1 video networking and mentorship platform for college students.",
  keywords: ["peer networking", "mentorship", "college", "1v1 video", "WebRTC", "seniors", "coding help"],
  applicationName: "Project O",
  authors: [{ name: "Project O Team" }],
  metadataBase: new URL("https://projecto.app"),
  openGraph: {
    type: "website",
    siteName: "Project O",
    title: "Project O — Peer Networking & Mentorship",
    description: "Talk to seniors, learn faster. A 1v1 video networking and mentorship platform for college students.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project O — Peer Networking & Mentorship",
    description: "Talk to seniors, learn faster. A 1v1 video networking and mentorship platform for college students.",
  },
  robots: { index: true, follow: true },
};

import { AnimeNavBar } from "@/components/ui/anime-navbar";

const navItems = [
  { name: "Home", url: "/", icon: "Home" },
  { name: "Fun 1v1", url: "/call/random", icon: "Video" },
  { name: "Mentors", url: "/mentors", icon: "Users" },
  { name: "Stories", url: "/#stories", icon: "MessageSquare" },
  { name: "How It Works", url: "/#how-it-works", icon: "Info" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationProvider>
              <MatchProvider>
                <AnimeNavBar items={navItems} defaultActive="Home" />
                {children}
              </MatchProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
