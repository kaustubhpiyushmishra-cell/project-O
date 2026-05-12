"use client"

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glowColor?: "sunshine" | "carrot" | "forest" | "none";
}

export function GlassCard({ children, className, glowColor = "none", ...props }: GlassCardProps) {
  const glowClasses = {
    sunshine: "hover:border-sunshine/30 hover:shadow-[0_8px_32px_rgba(255,201,38,0.15)]",
    carrot: "hover:border-carrot/30 hover:shadow-[0_8px_32px_rgba(249,96,21,0.15)]",
    forest: "hover:border-forest/20 hover:shadow-[0_8px_32px_rgba(24,84,42,0.05)]",
    none: "",
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "rounded-2xl border border-forest/10 bg-white/40 backdrop-blur-xl overflow-hidden relative group shadow-sm",
        glowClasses[glowColor],
        className
      )}
      {...props}
    >
      {glowColor !== "none" && (
        <div className={cn(
          "absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
          glowColor === "sunshine" && "bg-sunshine/20",
          glowColor === "carrot" && "bg-carrot/10",
          glowColor === "forest" && "bg-forest/5"
        )} />
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
