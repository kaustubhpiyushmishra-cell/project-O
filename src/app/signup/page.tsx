"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { login, verifyOtp } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    year: "1st Year",
    branch: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(formData.email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await verifyOtp(formData.email, otpString);
      
      // Update profile with signup details
      const yearNumber = parseInt(formData.year.charAt(0)) || 1;
      await userApi.updateProfile({
        name: formData.name,
        branch: formData.branch,
        year: yearNumber,
      });

      // Always send to completed profile setup to gather college and interests
      router.push("/profile/setup");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Create Account" : "Verify Identity"}
      subtitle={
        step === 1 ? (
          <>
            Join the exclusive <span className="text-[#9ABC05] font-bold italic">Peer Network</span> of top college students.
          </>
        ) : (
          "We've sent a 6-digit verification code to your college email address."
        )
      }
    >
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form 
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-5"
            onSubmit={handleSendOtp}
          >
            {error && <div className="text-tomato text-xs font-bold bg-tomato/10 p-3 rounded-lg border border-tomato/20">{error}</div>}
            {/* Full Name */}
            <div className="flex flex-col gap-1.5 relative group">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">Full Name</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-forest/30 group-focus-within:text-[#9ABC05] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 focus:ring-4 focus:ring-[#9ABC05]/10 transition-all duration-300 disabled:opacity-50"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5 relative group">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">College Email</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-forest/30 group-focus-within:text-[#9ABC05] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  required 
                  pattern=".*(\.edu|\.ac\.in)$"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 focus:ring-4 focus:ring-[#9ABC05]/10 transition-all duration-300 disabled:opacity-50"
                  placeholder="student@college.edu"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* University Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 group">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">Year</label>
                <select 
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  disabled={isLoading}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl px-5 py-3.5 text-sm font-medium text-forest outline-none focus:border-[#9ABC05] focus:bg-white/80 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                   <option>1st Year</option>
                   <option>2nd Year</option>
                   <option>3rd Year</option>
                   <option>4th Year</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 group">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">Branch</label>
                <input 
                  type="text" 
                  required 
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl px-5 py-3.5 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 transition-all disabled:opacity-50"
                  placeholder="CS, IT..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-4 w-full bg-[#9ABC05] hover:bg-[#88a704] disabled:bg-[#9ABC05]/50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(154,188,5,0.3)]"
            >
              {isLoading ? "Sending..." : "Continue"} <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        ) : (
          <motion.form 
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-8 text-center"
            onSubmit={handleVerify}
          >
            {error && <div className="text-tomato text-xs font-bold bg-tomato/10 p-3 rounded-lg border border-tomato/20">{error}</div>}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#9ABC05]/10 flex items-center justify-center text-[#9ABC05]">
                <Mail className="w-8 h-8" />
              </div>
            </div>

            <div className="flex justify-between gap-3 px-2">
               {otp.map((digit, i) => (
                 <input 
                  key={i} 
                  id={`otp-${i}`}
                  type="text" 
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={isLoading}
                  className="w-11 h-14 bg-white/40 border border-gray-200/50 rounded-xl text-center text-xl font-black text-forest outline-none focus:border-[#9ABC05] focus:bg-white/80 focus:ring-4 focus:ring-[#9ABC05]/10 transition-all disabled:opacity-50" 
                 />
               ))}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#9ABC05] hover:bg-[#88a704] disabled:bg-[#9ABC05]/50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(154,188,5,0.3)]"
              >
                {isLoading ? "Verifying..." : "Verify Identity"} <CheckCircle2 className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                disabled={isLoading}
                className="text-[10px] font-black tracking-widest uppercase text-forest/40 hover:text-forest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" /> Wait, I entered wrong email
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-10 text-center">
        <p className="text-xs text-forest/40 font-bold uppercase tracking-widest">
          Joined before?{" "}
          <Link href="/login" className="text-[#18542A] hover:text-[#9ABC05] transition-colors duration-300 ml-1">
            Log in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

