"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Mentors", href: "/mentors" },
    { label: "How it works", href: "#how-it-works" },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? "bg-cream/80 backdrop-blur-xl border-b border-forest/10 shadow-sm" 
            : "bg-transparent"
        }`}
      >
        <div className="container max-w-[1400px] mx-auto flex h-16 sm:h-20 md:h-24 items-center justify-between px-4 sm:px-6 md:px-20">
          <Link href="/" className="font-bold text-lg sm:text-xl md:text-2xl tracking-tighter uppercase text-forest flex items-center gap-2 hover:opacity-80 transition-opacity">
            Project O
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-widest uppercase text-forest/60">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-forest transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            <Link href="/login" className="hidden md:block text-xs font-semibold tracking-widest uppercase text-forest/60 hover:text-forest transition-colors">
              Login
            </Link>
            <Link 
              href="/signup" 
              className="bg-carrot hover:bg-tomato text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 text-xs font-semibold tracking-widest uppercase shadow-md"
            >
              Sign Up
            </Link>
            
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-forest/5 border border-forest/10 hover:bg-forest/10 transition-colors text-forest"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-cream/95 backdrop-blur-xl md:hidden"
          >
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-black tracking-tighter uppercase text-forest/40 hover:text-forest transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="w-16 h-[1px] bg-forest/10 my-4" />
              
              <Link 
                href="/login" 
                onClick={() => setMobileOpen(false)}
                className="text-lg font-bold tracking-widest uppercase text-forest/40 hover:text-forest transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setMobileOpen(false)}
                className="bg-carrot hover:bg-tomato text-white px-8 py-4 rounded-full transition-all text-xs font-bold tracking-widest uppercase shadow-lg shadow-carrot/20"
              >
                Sign Up
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
