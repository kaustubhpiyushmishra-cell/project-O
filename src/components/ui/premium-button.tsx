"use client"

import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "glass" | "danger";
  className?: string;
  href?: string;
}

export function PremiumButton({ children, variant = "primary", className, href, ...props }: PremiumButtonProps) {
  const variants = {
    primary: "bg-carrot text-white hover:bg-tomato border border-transparent shadow-[0_0_15px_rgba(249,96,21,0.2)]",
    secondary: "bg-sunshine text-forest hover:bg-kiwi border border-transparent shadow-[0_0_15px_rgba(255,201,38,0.2)]",
    glass: "bg-white/10 text-forest border border-forest/10 hover:bg-white/20 backdrop-blur-md",
    danger: "bg-tomato text-white hover:bg-red-700 border border-transparent",
  };

  const baseClasses = cn(
    "px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs inline-flex items-center justify-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black premium-transition active:scale-95",
    variants[variant],
    className
  );

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.3 }
  };

  if (href) {
    return (
      <Link href={href}>
        <motion.div {...motionProps} className={baseClasses}>
          {children}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.button {...motionProps} className={baseClasses} {...(props as any)}>
      {children}
    </motion.button>
  );
}
