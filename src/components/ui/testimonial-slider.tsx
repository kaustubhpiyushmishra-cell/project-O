"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    quote: "I spoke with a senior who had already built the type of project I wanted. That 20 minute call completely changed my roadmap.",
    highlight: "completely changed my roadmap",
    name: "Rohan Mehta",
    username: "Computer Science Student",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop"
  },
  {
    id: 2,
    quote: "Instead of guessing which skills mattered, I asked someone who had already landed the internship I wanted.",
    highlight: "landed the internship I wanted",
    name: "Ananya Kapoor",
    username: "Design Student",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop"
  },
  {
    id: 3,
    quote: "I was nervous about hackathons until a senior explained how teams actually form. I joined my first one the same week.",
    highlight: "joined my first one the same week",
    name: "Aditya Sharma",
    username: "Engineering Student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop"
  },
  {
    id: 4,
    quote: "Talking to someone who had already navigated my path made everything feel possible.",
    highlight: "everything feel possible",
    name: "Sneha Iyer",
    username: "Business Student",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&h=256&auto=format&fit=crop"
  }
];

export function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(testimonials.length / (itemsPerPage > 1 ? 1 : itemsPerPage)); 
  // Custom simple navigation logic for 4 items
  
  const next = () => {
    setCurrentIndex((prev) => (prev + 1 >= testimonials.length ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full max-w-[1400px] mx-auto overflow-visible px-4">
      <div className="flex gap-6 overflow-hidden py-12">
        <div className="flex transition-all duration-500 ease-out gap-8" style={{ transform: `translateX(calc(-${currentIndex * (100 / itemsPerPage)}% - ${currentIndex * 1.5}rem))` }}>
          {testimonials.map((t) => (
            <div key={t.id} className={cn(
               "flex-shrink-0 transition-opacity duration-300",
               itemsPerPage === 1 ? "w-full" : itemsPerPage === 2 ? "w-[calc(50%-1rem)]" : "w-[calc(33.333%-1.35rem)]"
            )}>
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-6 mt-4">
        <button
          onClick={prev}
          aria-label="Previous testimonial"
          className="w-14 h-14 rounded-full border border-forest/10 flex items-center justify-center hover:bg-carrot hover:border-carrot hover:text-white transition-all duration-300 shadow-xl bg-white/50 backdrop-blur-md group active:scale-90"
        >
          <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
        </button>
        <button
          onClick={next}
          aria-label="Next testimonial"
          className="w-14 h-14 rounded-full border border-forest/10 flex items-center justify-center hover:bg-carrot hover:border-carrot hover:text-white transition-all duration-300 shadow-xl bg-white/50 backdrop-blur-md group active:scale-90"
        >
          <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: any }) {
  const parts = testimonial.quote.split(testimonial.highlight);

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="relative h-full bg-white/70 backdrop-blur-md border border-white/40 p-10 rounded-3xl shadow-2xl transition-all duration-300 group/card overflow-hidden"
    >
      <Quote className="absolute top-6 left-6 w-20 h-20 text-kiwi/5 -rotate-12 group-hover/card:scale-110 group-hover/card:text-kiwi/10 transition-all duration-700 ease-out" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-1 text-sunshine mb-8">
           {[...Array(5)].map((_, i) => (
             <Star key={i} className="w-4 h-4 fill-current drop-shadow-[0_0_8px_rgba(255,201,38,0.5)]" />
           ))}
        </div>

        <p className="text-xl leading-relaxed font-bold tracking-tight text-forest/90 mb-10">
          &quot;{parts[0]}<span className="text-kiwi underline decoration-kiwi/20 underline-offset-8">{testimonial.highlight}</span>{parts[1]}&quot;
        </p>

        <div className="mt-auto flex items-center gap-5 pt-10 border-t border-forest/5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-kiwi/20 group-hover/card:border-kiwi/50 transition-all duration-500 shadow-lg">
            <Image 
              src={testimonial.avatar} 
              alt={testimonial.name}
              fill
              className="object-cover transition-transform duration-500 group-hover/card:scale-110"
            />
          </div>
          <div className="flex flex-col">
            <h4 className="text-lg font-black tracking-tighter uppercase text-forest">{testimonial.name}</h4>
            <p className="text-caption text-forest/40">{testimonial.username}</p>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-kiwi via-carrot to-tomato opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
