"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const { login, verifyOtp } = useAuth();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email);
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
      const newUser = await verifyOtp(email, otpString);
      if (!newUser.name) {
        router.push("/profile/setup");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid OTP");
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
      title={step === 1 ? "Welcome Back" : "Verify Login"}
      subtitle={
        step === 1 ? (
          <>
            Sign in to your <span className="text-[#9ABC05] font-bold">Peer Network</span> and catch up on the shortcuts you've missed.
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
            className="flex flex-col gap-6" 
            onSubmit={handleSendOtp}
          >
            {error && <div className="text-tomato text-xs font-bold bg-tomato/10 p-3 rounded-lg border border-tomato/20">{error}</div>}
            
            {/* Email Address */}
            <div className="flex flex-col gap-2 relative group mt-2">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4 mb-1">
                College Email
              </label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-forest/30 group-focus-within:text-[#9ABC05] transition-colors duration-300">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  required 
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl pl-12 pr-5 py-4 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 focus:ring-4 focus:ring-[#9ABC05]/10 transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
                  placeholder="student@college.edu"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-[#9ABC05] hover:bg-[#88a704] disabled:bg-[#9ABC05]/50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(154,188,5,0.3)] hover:shadow-[0_25px_50px_rgba(154,188,5,0.4)]"
            >
              {isLoading ? "Sending..." : "Send Login Code"} <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-forest/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="bg-white/0 px-4 text-forest/20">or elevate via</span>
              </div>
            </div>

            {/* Third Party Login */}
            <button 
              type="button" 
              className="w-full bg-white/40 hover:bg-white border border-gray-200/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-forest/5 disabled:opacity-50"
              disabled={isLoading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Cloud
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
                {isLoading ? "Verifying..." : "Verify & Enter"} <CheckCircle2 className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                disabled={isLoading}
                className="text-[10px] font-black tracking-widest uppercase text-forest/40 hover:text-forest transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" /> Wait, I entered wrong email
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      
      {/* Page Footer Actions */}
      <div className="mt-10 text-center">
        <p className="text-xs text-forest/40 font-bold uppercase tracking-widest">
          New to the shortcut?{" "}
          <Link href="/signup" className="text-[#18542A] hover:text-[#9ABC05] transition-colors duration-300 ml-1">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

