"use client";

import React from "react";
import { Warp } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string | React.ReactNode;
  sidePanelTitle?: string;
  sidePanelSubtitle?: string;
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  sidePanelTitle = "Find Your Peers.", 
  sidePanelSubtitle = "Learn Faster." 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-cream flex overflow-hidden">
      {/* Background Shader Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Warp
          style={{ width: "100%", height: "100%" }}
          speed={0.4}
          scale={1.2}
          colors={["#F3E8CC", "#9ABC05", "#FFFFFF"]}
        />
      </div>

      {/* Subtle Gradient Overlay */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-br from-cream via-white/50 to-cream pointer-events-none" />

      {/* Main Content Split */}
      <div className="relative z-10 w-full flex flex-col md:flex-row">
        
        {/* Left Side: Visual Storytelling Panel (Desktop) */}
        <div className="hidden md:flex md:w-1/2 lg:w-[60%] flex-col items-center justify-center p-12 text-center border-r border-white/20 bg-white/5 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-xl"
          >
            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-forest mb-6">
              {sidePanelTitle}<br />
              <span className="text-[#9ABC05]">{sidePanelSubtitle}</span>
            </h2>
            
            <p className="text-lg text-forest/60 font-medium max-w-sm mx-auto leading-relaxed">
              Join the exclusive circle of students breaking boundaries and finding the shortcuts to success.
            </p>
          </motion.div>
          
          {/* Decorative Elements */}
          <div className="absolute bottom-12 left-12">
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/20 backdrop-blur-md text-xs font-bold tracking-widest uppercase text-forest/60 hover:text-forest transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to home
            </Link>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            
            {/* Mobile Header (Back link only) */}
            <div className="md:hidden flex items-center mb-12">
               <Link href="/" className="p-2 -ml-2 text-forest/40 hover:text-forest transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                 <ArrowLeft className="w-5 h-5" /> Back
               </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-8 md:mb-10 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-forest leading-tight">
                  {title}
                </h1>
                <p className="mt-4 text-base text-forest/60 font-medium px-4 md:px-0">
                  {subtitle}
                </p>
              </div>

              {/* Glass Auth Card */}
              <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(24,84,42,0.1)] p-8 md:p-10 relative overflow-hidden group">
                {/* Glass Reflection Fade */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
