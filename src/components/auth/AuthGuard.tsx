"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (needsOnboarding && pathname !== "/profile/setup") {
        router.replace("/profile/setup");
      }
    }
  }, [isAuthenticated, isLoading, needsOnboarding, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#9ABC05] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold tracking-widest uppercase text-forest/40">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (needsOnboarding && pathname !== "/profile/setup") return null;

  return <>{children}</>;
}

