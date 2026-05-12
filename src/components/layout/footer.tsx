import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#060606] text-white">
      <div className="container max-w-[1400px] mx-auto px-6 md:px-20 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="font-bold text-xl tracking-tighter uppercase">
              Project O
            </Link>
            <p className="text-neutral-500 text-sm max-w-xs font-medium">
              Talk to seniors. Learn faster. The premier 1v1 video networking and mentorship platform for college students.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-neutral-400">Platform</h4>
            <ul className="space-y-2 text-sm text-neutral-500 font-medium">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/mentors" className="hover:text-white transition-colors">Mentors</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-neutral-400">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-500 font-medium">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600 font-medium">
            &copy; {new Date().getFullYear()} Project O. All rights reserved.
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer">X</div>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer">in</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
