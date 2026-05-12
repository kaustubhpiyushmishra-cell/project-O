"use client";

import React from "react";
import { LampContainer } from "./lamp";
import Link from "next/link";
import { motion } from "framer-motion";
import { PremiumButton } from "./premium-button";
import { Twitter, Linkedin, Github, GraduationCap } from "lucide-react";

export default function LampFooter() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Mentors", href: "/mentors" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
        { label: "Careers", href: "#careers" },
        { label: "Blog", href: "#blog" },
      ],
    },
    {
      title: "Social",
      links: [
        { label: "Twitter", href: "#" },
        { label: "LinkedIn", href: "#" },
        { label: "GitHub", href: "#" },
        { label: "Discord", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  return (
    <LampContainer className="bg-forest">
      <div className="flex flex-col items-center w-full max-w-7xl mx-auto">
        {/* CTA Section */}
        <div className="text-center space-y-8 mb-32 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-cream uppercase leading-[0.9]">
              Ready to connect<br />with seniors?
            </h2>
              <p className="text-cream/60 max-w-xl mx-auto font-medium text-lg">
                Start meaningful conversations and accelerate your learning today.
              </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PremiumButton variant="secondary" href="/signup">
              Sign up with your college email
            </PremiumButton>
          </motion.div>
        </div>

        {/* Navigation Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-12 mb-24 border-t border-cream/10 pt-24 px-4 sm:px-0">
          {footerLinks.map((column, idx) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col gap-4"
            >
              <h4 className="text-xs font-bold tracking-widest uppercase text-cream/40">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-cream/60 hover:text-sunshine transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Branding & Socials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-12 pb-8 gap-8 px-4 sm:px-0"
        >
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-cream uppercase">
              Project <span className="text-[#9ABC05]">O</span>
            </div>
            <p className="text-cream/40 text-sm font-medium">
              Connecting students through meaningful 1v1 conversations.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-cream/10 flex items-center justify-center text-cream/40 hover:bg-cream/5 hover:text-sunshine transition-all"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
            <div className="text-cream/20 text-xs font-bold tracking-widest uppercase">
              © 2026. All rights reserved.
            </div>
          </div>
        </motion.div>
      </div>
    </LampContainer>
  );
}
