"use client";

import React from "react";
import { Warp } from "@paper-design/shaders-react";
import { Video, Users } from "lucide-react";
import { motion } from "framer-motion";
import { PremiumButton } from "@/components/ui/premium-button";

export default function WarpShaderHero() {
  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-cream text-forest">
      {/* Background Shader — full viewport, clearly visible */}
      <div className="absolute inset-0 z-0">
        <Warp
          style={{ width: "100%", height: "100%" }}
          speed={0.6}
          scale={1.05}
          proportion={0.7}
          softness={0.8}
          distortion={0.3}
          swirl={0.9}
          swirlIterations={8}
          colors={["#D52518", "#FFC926"]}
        />
      </div>

      {/* Layering fix: overlay blur layer as requested */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10"></div>

      {/* Content — sits above the shader */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-16 sm:pb-24 flex flex-col items-center text-center">
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="mb-6 sm:mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-forest/10 bg-forest/5 backdrop-blur-md text-[10px] sm:text-xs font-bold tracking-widest uppercase text-forest/60">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            College-only • Verified students
          </span>
        </motion.div>

        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase mb-6 leading-[0.9] text-[#F3E8CC]"
        >
          Your <span className="bg-gradient-to-r from-[#D52518] to-[#F96015] bg-clip-text text-transparent">Peers</span><br />
          Know the <span className="text-[#F96015]">Shortcut</span>.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-lg md:text-xl text-[#F3E8CC]/90 max-w-2xl mx-auto mb-8 sm:mb-12 font-medium leading-relaxed px-2"
        >
          Jump into quick 1v1 conversations with seniors and peers to learn what actually works — internships, projects, and real career paths.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0"
        >
          <PremiumButton 
            href="/signup" 
            className="border-2 border-[#D52518] text-white bg-[#D52518]/10 hover:bg-[#F96015] hover:border-[#F96015] px-8 py-3 rounded-full transition-all duration-300 shadow-lg shadow-tomato/5 hover:shadow-carrot/20 backdrop-blur-sm"
          >
            <Video className="w-4 h-4" /> Start Networking
          </PremiumButton>

          <PremiumButton 
            href="/mentors" 
            className="border-2 border-[#F96015] text-white bg-[#F96015]/5 hover:bg-[#D52518] hover:border-[#D52518] px-8 py-3 rounded-full transition-all duration-300 shadow-lg shadow-carrot/5 hover:shadow-tomato/20 backdrop-blur-sm"
          >
            <Users className="w-4 h-4" /> Find a Mentor
          </PremiumButton>
        </motion.div>
      </div>

      {/* Trust Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="relative z-20 w-full pb-8 sm:pb-12 md:pb-16"
      >
        <p className="text-center text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-forest/40 mb-4 sm:mb-6">
          Trusted by students from
        </p>
        <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-16 flex-wrap px-4 sm:px-6 opacity-40">
          {["IIT Delhi", "BITS Pilani", "NIT Surathkal", "VIT", "DTU", "IIIT Hyderabad"].map((uni) => (
            <span key={uni} className="text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase text-forest/40 whitespace-nowrap">
              {uni}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
