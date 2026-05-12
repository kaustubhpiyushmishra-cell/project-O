"use client"

import React from "react";
import { motion } from "framer-motion";
import { Search, Video, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Discover Peers",
    description: "Browse students and seniors who have experience in the fields you're interested in.",
    icon: Search,
  },
  {
    id: 2,
    title: "Start a Conversation",
    description: "Book a short one-on-one video conversation and ask the questions that actually matter.",
    icon: Video,
  },
  {
    id: 3,
    title: "Gain Real Insight",
    description: "Learn from real experiences and walk away with clarity about your next steps.",
    icon: Lightbulb,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-transparent">
      {/* Enhanced Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-kiwi/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-carrot/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-sunshine/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-forest"
          >
            How <span className="text-kiwi">It</span> Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-forest/60 max-w-xl mx-auto mt-6 font-medium leading-relaxed"
          >
            Three simple steps to start learning directly from students who have already been where you want to go.
          </motion.p>
        </div>

        <div className="relative">
          {/* Timeline Connector - Desktop (Horizontal) */}
          <div className="hidden md:block absolute top-7 left-0 w-full h-[2px] bg-gradient-to-r from-carrot/30 via-kiwi/30 to-carrot/30 z-0">
             <motion.div 
               className="h-full bg-gradient-to-r from-transparent via-kiwi to-transparent"
               animate={{ 
                 left: ["-100%", "100%"],
                 opacity: [0, 1, 0]
               }}
               transition={{ 
                 duration: 3, 
                 repeat: Infinity, 
                 ease: "linear" 
               }}
               style={{ width: "20%", position: "absolute" }}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 relative z-10">
            {steps.map((step, index) => (
              <StepCard key={step.id} step={step} isLast={index === steps.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, isLast }: { step: any, isLast: boolean }) {
  const Icon = step.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: step.id * 0.1 }}
      className="flex flex-col items-center group"
    >
      {/* Step Number Badge */}
      <div className="relative mb-12">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="w-16 h-16 rounded-full bg-carrot text-white flex items-center justify-center text-2xl font-black shadow-[0_10px_30px_rgba(249,96,21,0.35)] relative z-10"
        >
          {step.id}
        </motion.div>
        
        {/* Mobile Connector (Vertical) */}
        {!isLast && (
          <div className="md:hidden absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-24 bg-gradient-to-b from-carrot/30 to-kiwi/30" />
        )}
      </div>

      {/* Card Content */}
      <motion.div 
        whileHover={{ y: -10 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-white p-8 shadow-xl shadow-forest/5 flex flex-col items-center text-center w-full transition-all duration-300"
      >
        <div className="w-14 h-14 rounded-2xl bg-kiwi/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
           <Icon className="w-7 h-7 text-kiwi" />
        </div>
        
        <h3 className="text-2xl font-black tracking-tighter uppercase text-forest mb-4">
          {step.title}
        </h3>
        
        <p className="text-base text-forest/60 font-medium leading-relaxed">
          {step.description}
        </p>
      </motion.div>
    </motion.div>
  );
}
