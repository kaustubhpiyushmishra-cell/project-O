"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Video, Users, Info, MessageSquare, LucideIcon, LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumButton } from "./premium-button";
import { useAuth } from "@/hooks/useAuth";

const IconMap: Record<string, LucideIcon> = {
  Home,
  MessageSquare,
  Video,
  Users,
  Info,
};

interface NavItem {
  name: string;
  url: string;
  icon: string;
}

interface AnimeNavBarProps {
  items: NavItem[];
  defaultActive?: string;
  className?: string;
}

export function AnimeNavBar({ items, defaultActive, className }: AnimeNavBarProps) {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultActive || items[0].name);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    handleResize();
    handleScroll();
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const currentHash = window.location.hash;
      const currentPath = window.location.pathname;
      const currentItem = items.find(
        (item) => item.url === currentPath || (item.url.includes('#') && item.url.split('#')[1] === currentHash.slice(1))
      );
      if (currentItem) {
        setActiveTab(currentItem.name);
      }
    };

    handleLocationChange();
    window.addEventListener("hashchange", handleLocationChange);
    return () => window.removeEventListener("hashchange", handleLocationChange);
  }, [pathname, items]);

  const isAppPath = ["/dashboard", "/mentors", "/booking", "/wallet", "/profile"].some(path => pathname.startsWith(path));
  if (isAppPath) return null;

  return (
    <div className={cn("fixed top-5 left-0 right-0 z-[9999] px-6 md:px-12 pointer-events-none", className)}>
      <div className="flex items-center justify-center max-w-[1400px] mx-auto relative">
        {/* Left Title (Floating Left) */}
        <div className="absolute left-0 pointer-events-auto flex items-center gap-2">
          <span className={cn(
            "font-black tracking-tighter uppercase text-[#F3E8CC] transition-all duration-300",
            scrolled ? "text-base opacity-80" : "text-xl opacity-100"
          )}>
            Project <span className="text-[#9ABC05]">O</span>
          </span>
        </div>

        {/* Center Navbar (Naturally Centered) */}
        <div className="flex justify-center pointer-events-auto">
          <nav className={cn(
            "flex items-center gap-1 p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl relative overflow-hidden transition-all duration-300",
            scrolled ? "scale-95 bg-black/60 px-3" : "scale-100 bg-black/40 px-2"
          )}>
            {/* Shine Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shine" />
            </div>

            {items.map((item) => {
              const Icon = IconMap[item.icon] || Home;
              const isActive = activeTab === item.name;

              return (
                <Link
                  key={item.name}
                  href={item.url}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "relative flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group",
                    isActive ? "text-cream" : "text-cream/50 hover:text-cream hover:bg-carrot/10"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-tomato rounded-full shadow-[0_0_20px_rgba(213,37,24,0.4)]"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon className={cn(
                      "transition-transform duration-300",
                      isActive ? "text-cream" : "group-hover:scale-110",
                      scrolled ? "w-3.5 h-3.5" : "w-4 h-4"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold tracking-widest uppercase hidden lg:block",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-all duration-300"
                    )}>
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Auth Cluster (Floating Right) */}
        <div className="absolute right-0 flex items-center gap-2 sm:gap-4 pointer-events-auto">
          {isAuthenticated ? (
            <>
              <PremiumButton 
                href="/dashboard" 
                className={cn(
                  "hidden sm:flex border-2 border-[#D52518] text-white bg-[#D52518]/5 hover:bg-[#D52518] px-5 py-2 h-auto text-[10px] tracking-[0.2em] shadow-lg shadow-tomato/5 hover:shadow-tomato/20 backdrop-blur-md transition-all duration-300",
                  scrolled && "px-4 py-1.5 opacity-80"
                )}
              >
                <LayoutDashboard className="w-3 h-3 mr-1" /> Dashboard
              </PremiumButton>
              
              <button 
                onClick={logout}
                className={cn(
                  "flex items-center bg-[#D52518] hover:bg-[#F96015] text-white px-6 py-2 rounded-full h-auto text-[10px] font-black tracking-widest shadow-lg shadow-tomato/20 transition-all duration-300",
                  scrolled && "px-5 py-2 scale-90"
                )}
              >
                <LogOut className="w-3 h-3 mr-1" /> Log Out
              </button>
            </>
          ) : (
            <>
              <PremiumButton 
                href="/login" 
                className={cn(
                  "hidden sm:flex border-2 border-[#D52518] text-white bg-[#D52518]/5 hover:bg-[#D52518] px-5 py-2 h-auto text-[10px] tracking-[0.2em] shadow-lg shadow-tomato/5 hover:shadow-tomato/20 backdrop-blur-md transition-all duration-300",
                  scrolled && "px-4 py-1.5 opacity-80"
                )}
              >
                <LogIn className="w-3 h-3 mr-1" /> Log In
              </PremiumButton>
              
              <PremiumButton 
                href="/signup" 
                className={cn(
                  "bg-[#D52518] hover:bg-[#F96015] text-white px-6 py-2 h-auto text-[10px] font-black tracking-widest shadow-lg shadow-tomato/20 border-2 border-transparent transition-all duration-300",
                  scrolled && "px-5 py-2 scale-90"
                )}
              >
                <UserPlus className="w-3 h-3 mr-1" /> Sign Up
              </PremiumButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
