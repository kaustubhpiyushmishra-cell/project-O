"use client"

import React from "react";
import { TestimonialSlider } from "../ui/testimonial-slider";
import { motion } from "framer-motion";

export function StoriesSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#F3E8CC]/20" id="stories">
      {/* Decorative Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-kiwi/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-carrot/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Social Proof Header */}
        <div className="flex flex-col items-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-10 px-6 py-2 bg-forest/5 rounded-full border border-forest/10"
          >
             <div className="w-2 h-2 rounded-full bg-kiwi animate-pulse" />
             <div className="text-[10px] font-black tracking-[0.3em] uppercase text-forest/60">
                Trusted by students from 120+ universities
             </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tighter uppercase leading-[0.9] text-forest"
          >
            Stories From <span className="text-kiwi">Students</span>  
            <br />
            Who Took the <span className="text-carrot">Leap</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl text-forest/60 max-w-3xl mx-auto text-center mt-10 font-medium leading-relaxed"
          >
            Real conversations. Real advice. Real outcomes from students who connected with peers and seniors through meaningful one-on-one interactions.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <TestimonialSlider />
        </motion.div>
      </div>

      {/* Floating Quote Elements */}
      <div className="absolute top-40 right-10 opacity-5 pointer-events-none hidden xl:block">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" className="text-forest">
          <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L22.017 3V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM2.01697 21L2.01697 18C2.01697 16.8954 2.9124 16 4.01697 16H7.01697C7.56925 16 8.01697 15.5523 8.01697 15V9C8.01697 8.44772 7.56925 8 7.01697 8H4.01697C2.9124 8 2.01697 7.10457 2.01697 6V3L10.017 3V15C10.017 18.3137 7.3307 21 4.01697 21H2.01697Z" />
        </svg>
      </div>
    </section>
  );
}
