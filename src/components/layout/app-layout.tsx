"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Video, Users, Calendar, Wallet, User, LogOut, GraduationCap, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Fun 1v1", href: "/call/random", icon: Video },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Bookings", href: "/booking", icon: Calendar },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Profile", href: "/profile", icon: User }
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-cream text-forest overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full h-16 border-b border-forest/10 bg-cream/80 backdrop-blur z-50 flex items-center justify-between px-4">
         <div className="font-black text-lg tracking-tighter uppercase flex items-center gap-2 text-forest">
            Project <span className="text-kiwi">O</span>
         </div>
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6 text-forest/40" />
         </button>
      </div>

      <AnimatePresence>
         {mobileMenuOpen && (
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -50 }}
               className="md:hidden fixed inset-0 bg-[#0A0A0A] z-40 pt-20 px-4"
            >
               <div className="flex flex-col gap-2">
                  {navItems.map((item) => {
                     const Icon = item.icon;
                     const active = pathname.startsWith(item.href);
                     return (
                     <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${active ? "bg-indigo-500 text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}>
                        <Icon className="w-5 h-5" /> {item.name}
                     </Link>
                     );
                  })}
                  <div className="mt-8 pt-8 border-t border-white/10">
                     <Link href="/" className="flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold tracking-widest uppercase text-red-400 hover:bg-red-400/10 transition-all">
                        <LogOut className="w-5 h-5" /> Logout
                     </Link>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-forest/10 bg-cream">
        <div className="h-24 flex items-center px-8 border-b border-forest/5">
          <div className="font-black text-[22px] tracking-tighter uppercase text-forest">
            Project <span className="text-kiwi">O</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                  active 
                    ? "bg-carrot text-white shadow-[0_8px_20px_rgba(249,96,21,0.2)]" 
                    : "text-forest/40 hover:text-forest hover:bg-forest/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "opacity-100" : "opacity-50"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-forest/5">
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-bold tracking-widest uppercase text-tomato hover:bg-tomato/10 transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-50" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-cream pt-16 md:pt-0 relative">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sunshine/10 blur-[120px] rounded-full pointer-events-none" />
         <div className="relative z-10 w-full h-full">
            {children}
         </div>
      </main>
    </div>
  );
}
