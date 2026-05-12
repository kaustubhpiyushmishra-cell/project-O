"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Video, Calendar, Star, CheckCircle2 } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { GlassCard } from "@/components/ui/glass-card";
import LampFooter from "@/components/ui/lamp-footer";
import WarpShaderHero from "@/components/ui/wrap-shader";
import { StoriesSection } from "@/components/sections/stories-section";
import { HowItWorks } from "@/components/sections/how-it-works";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 0.61, 0.36, 1]
    }
  })
};

const textReveal: Variants = {
  hidden: { y: "100%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  })
};

export default function LandingPage() {
  return (
    <div className="bg-cream text-forest min-h-[100dvh] font-sans selection:bg-sunshine/30">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sunshine/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-carrot/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-multiply" />
      </div>

      <WarpShaderHero />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-20">
        {/* Features Section */}
        <section id="features" className="py-24 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="flex items-center gap-4 mb-16">
              <span className="w-12 h-[2px] bg-carrot" />
              <h2 className="text-section text-forest">Two connection <span className="text-forest/40">modes</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Card 1 */}
              <GlassCard glowColor="carrot" className="p-8 md:p-12 flex flex-col cursor-crosshair">
                <div className="w-16 h-16 bg-carrot/10 border border-carrot/20 rounded-full flex items-center justify-center mb-12">
                  <Video className="w-8 h-8 text-carrot" />
                </div>
                
                <h3 className="text-card mb-4">Fun 1v1</h3>
                <p className="text-body mb-8 max-w-sm">
                  Random video conversations with students from your college. Explore ideas, share projects, and make connections.
                </p>
                
                <div className="mt-auto">
                  <Link href="/login" className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase hover:text-carrot transition-all duration-300">
                    Enter Zone <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </div>
              </GlassCard>

              {/* Card 2 */}
              <GlassCard glowColor="sunshine" className="p-8 md:p-12 flex flex-col cursor-crosshair">
                <div className="w-16 h-16 bg-sunshine/10 border border-sunshine/20 rounded-full flex items-center justify-center mb-12">
                  <Calendar className="w-8 h-8 text-sunshine" />
                </div>
                
                <h3 className="text-card mb-4">Guided 1v1</h3>
                <p className="text-body mb-8 max-w-sm">
                  Book mentorship sessions with verified seniors and industry interns. Get career guidance, portfolio feedback, and interview tips.
                </p>
                
                <div className="mt-auto">
                  <Link href="/mentors" className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase hover:text-sunshine transition-all duration-300">
                    Browse Mentors <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <HowItWorks />


        {/* Stories Section */}
        <StoriesSection />

      </div>
      
      <LampFooter />
    </div>
  );
}
