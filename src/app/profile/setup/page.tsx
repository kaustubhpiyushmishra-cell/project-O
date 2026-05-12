"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Mail, User, CheckCircle2, Building, BookOpen, Hash, Tag } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/lib/api";

const PREDEFINED_INTERESTS = [
  "Web Dev", "App Dev", "AI/ML", "DSA", "System Design", 
  "Open Source", "UI/UX", "Blockchain", "Cybersecurity", "Game Dev"
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, updateUser, isAuthenticated, isLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    college: "",
    branch: "",
    year: "1st Year",
    interests: [] as string[]
  });

  const [customInterest, setCustomInterest] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        college: user.college || prev.college,
        branch: user.branch || prev.branch,
        year: user.year ? `${user.year}th Year`.replace("1th", "1st").replace("2th", "2nd").replace("3th", "3rd") : prev.year,
        interests: user.interests || prev.interests
      }));
    }
  }, [user, isLoading]);

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      }
      if (prev.interests.length >= 10) return prev; // max 10
      return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const handleCustomInterest = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customInterest.trim()) {
      e.preventDefault();
      const val = customInterest.trim();
      if (!formData.interests.includes(val) && formData.interests.length < 10) {
        setFormData(prev => ({ ...prev, interests: [...prev.interests, val] }));
      }
      setCustomInterest("");
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name.trim() || !formData.college.trim())) {
      setError("Name and College are required");
      return;
    }
    setError("");
    setStep(s => s + 1);
  };

  const submitProfile = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const yearStr = formData.year.charAt(0);
      const yearNum = parseInt(yearStr) || 1;
      
      const res = await userApi.completeProfile({
        name: formData.name.trim(),
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        year: yearNum,
        interests: formData.interests
      });
      
      updateUser(res.data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) return null; // Let AuthGuard handle redirects

  return (
    <AuthLayout
      title="Complete Your Profile"
      subtitle={
        <>
          Just a few more details to find your perfect <span className="text-[#9ABC05] font-bold">peers and mentors</span>.
        </>
      }
    >
      <div className="mb-6 flex gap-2 justify-center">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step >= i ? "w-8 bg-[#9ABC05]" : "w-4 bg-forest/10"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-5"
          >
            {error && <div className="text-tomato text-xs font-bold bg-tomato/10 p-3 rounded-lg border border-tomato/20">{error}</div>}
            
            <div className="flex flex-col gap-1.5 relative group">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">Full Name *</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-forest/30 group-focus-within:text-[#9ABC05] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 focus:ring-4 focus:ring-[#9ABC05]/10 transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative group">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">College/University *</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-forest/30 group-focus-within:text-[#9ABC05] transition-colors">
                  <Building className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={formData.college}
                  onChange={(e) => setFormData(p => ({ ...p, college: e.target.value }))}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 focus:ring-4 focus:ring-[#9ABC05]/10 transition-all duration-300"
                  placeholder="KIIT University"
                />
              </div>
            </div>

            <button 
              onClick={nextStep}
              className="mt-4 w-full bg-[#9ABC05] hover:bg-[#88a704] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(154,188,5,0.3)]"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5 relative group">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">Branch/Major</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-forest/30 group-focus-within:text-[#9ABC05] transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={formData.branch}
                  onChange={(e) => setFormData(p => ({ ...p, branch: e.target.value }))}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 focus:ring-4 focus:ring-[#9ABC05]/10 transition-all duration-300"
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 group">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">Current Year</label>
              <select 
                value={formData.year}
                onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))}
                className="w-full bg-white/40 border border-gray-200/50 rounded-2xl px-5 py-3.5 text-sm font-medium text-forest outline-none focus:border-[#9ABC05] focus:bg-white/80 transition-all appearance-none cursor-pointer"
              >
                 <option>1st Year</option>
                 <option>2nd Year</option>
                 <option>3rd Year</option>
                 <option>4th Year</option>
                 <option>5th Year</option>
                 <option>Alumni</option>
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button 
                onClick={nextStep}
                className="w-full bg-[#9ABC05] hover:bg-[#88a704] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(154,188,5,0.3)]"
              >
                Continue Setup <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setStep(1)}
                className="w-full bg-transparent hover:bg-forest/5 text-forest/60 hover:text-forest py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" /> Go Back
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-5"
          >
            {error && <div className="text-tomato text-xs font-bold bg-tomato/10 p-3 rounded-lg border border-tomato/20">{error}</div>}
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">What are your interests?</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border
                      ${formData.interests.includes(interest) 
                        ? "bg-[#9ABC05] text-white border-[#9ABC05] shadow-lg shadow-[#9ABC05]/20" 
                        : "bg-white/40 text-forest/60 border-gray-200/50 hover:bg-white/80 hover:text-forest"
                      }
                    `}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative group mt-2">
              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/40 ml-4">Add Custom Tag</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-forest/30 group-focus-within:text-[#9ABC05] transition-colors">
                  <Tag className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={handleCustomInterest}
                  className="w-full bg-white/40 border border-gray-200/50 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 focus:ring-4 focus:ring-[#9ABC05]/10 transition-all duration-300"
                  placeholder="Type & press Enter"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-[-10px]">
              {formData.interests.filter(i => !PREDEFINED_INTERESTS.includes(i)).map(interest => (
                 <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border bg-[#9ABC05] text-white border-[#9ABC05] shadow-lg shadow-[#9ABC05]/20 flex items-center gap-1"
                >
                  {interest} &times;
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button 
                onClick={submitProfile}
                disabled={isSubmitting}
                className="w-full bg-[#9ABC05] hover:bg-[#88a704] disabled:bg-[#9ABC05]/50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(154,188,5,0.3)]"
              >
                {isSubmitting ? "Finishing up..." : "Complete Profile"} <CheckCircle2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="w-full bg-transparent hover:bg-forest/5 text-forest/60 hover:text-forest py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-3 h-3" /> Go Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
