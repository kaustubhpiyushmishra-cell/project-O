"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { User, Building, BookOpen, Tag, Briefcase, Award, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/lib/api";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    year: user?.year?.toString() || "1",
    interests: user?.interests?.join(", ") || "",
  });

  const [formData, setFormData] = useState({
    mentor_bio: user?.mentorBio || "",
    mentor_rate: user?.mentorRate?.toString() || "0",
  });
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset if canceling
      setProfileData({
        name: user?.name || "",
        branch: user?.branch || "",
        year: user?.year?.toString() || "1",
        interests: user?.interests?.join(", ") || "",
      });
    }
    setIsEditing(!isEditing);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMsg("");
    try {
      const interestsArray = profileData.interests
        .split(",")
        .map(i => i.trim())
        .filter(i => i !== "");

      await userApi.completeProfile({
        name: profileData.name,
        branch: profileData.branch,
        year: parseInt(profileData.year) || 1,
        college: user?.college || "",
        interests: interestsArray,
      });

      updateUser({
        name: profileData.name,
        branch: profileData.branch,
        year: parseInt(profileData.year) || 1,
        interests: interestsArray,
      });

      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await userApi.applyForMentor({
        mentor_bio: formData.mentor_bio,
        mentor_rate: parseInt(formData.mentor_rate) || 0,
      });
      setSuccessMsg("Application submitted successfully! Our team will review it soon.");
      updateUser({ mentorStatus: 'pending' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="p-6 md:p-12 max-w-4xl mx-auto flex flex-col gap-8 text-forest">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase mb-2">My Profile</h1>
            <p className="text-sm font-bold tracking-widest uppercase text-forest/40">Manage your persona and applications</p>
          </div>
          <button 
            onClick={handleEditToggle}
            className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border transition-all ${isEditing ? "bg-tomato/10 border-tomato/20 text-tomato hover:bg-tomato/20" : "bg-forest/5 border-forest/10 text-forest/40 hover:bg-forest/10 hover:text-forest"}`}
          >
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        {errorMsg && <div className="text-tomato text-xs font-bold bg-tomato/10 p-3 rounded-lg border border-tomato/20">{errorMsg}</div>}
        {successMsg && <div className="text-forest text-xs font-bold bg-forest/10 p-3 rounded-lg border border-forest/20">{successMsg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard glowColor="carrot" className="p-6 col-span-1 md:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-forest/10 pb-4">
              <h3 className="text-xl font-black tracking-tighter uppercase text-forest">Personal Details</h3>
              {isEditing && (
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-kiwi text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-kiwi/90 disabled:opacity-50 transition-all shadow-md"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-forest/40">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="bg-forest/5 border border-forest/10 rounded-lg px-3 py-2 text-sm font-bold text-forest outline-none focus:border-carrot/50"
                      value={profileData.name}
                      onChange={e => setProfileData({...profileData, name: e.target.value})}
                    />
                  ) : (
                    <p className="font-bold">{user.name}</p>
                  )}
               </div>
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-forest/40">Email</label>
                  <p className="font-bold opacity-60">{user.email}</p>
               </div>
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-forest/40">College</label>
                  <p className="font-bold opacity-60">{user.college}</p>
               </div>
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-forest/40">Branch & Year</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Branch"
                        className="flex-1 bg-forest/5 border border-forest/10 rounded-lg px-3 py-2 text-sm font-bold text-forest outline-none focus:border-carrot/50"
                        value={profileData.branch}
                        onChange={e => setProfileData({...profileData, branch: e.target.value})}
                      />
                      <select 
                        className="bg-forest/5 border border-forest/10 rounded-lg px-3 py-2 text-sm font-bold text-forest outline-none focus:border-carrot/50"
                        value={profileData.year}
                        onChange={e => setProfileData({...profileData, year: e.target.value})}
                      >
                        {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}th Year</option>)}
                      </select>
                    </div>
                  ) : (
                    <p className="font-bold">{user.branch} • {user.year}th Year</p>
                  )}
               </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-forest/40 mb-1 block">Interests</label>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="E.g. Web Dev, AI, DSA (comma separated)"
                    className="w-full bg-forest/5 border border-forest/10 rounded-lg px-3 py-2 text-sm font-bold text-forest outline-none focus:border-carrot/50"
                    value={profileData.interests}
                    onChange={e => setProfileData({...profileData, interests: e.target.value})}
                  />
                  <p className="text-[9px] text-forest/30 font-bold tracking-widest uppercase italic">Separate multiple tags with commas</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                   {user.interests?.map(i => (
                     <span key={i} className="bg-forest/5 text-forest border border-forest/10 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
                       {i}
                     </span>
                   ))}
                </div>
              )}
            </div>
          </GlassCard>

          <div className="flex flex-col gap-6">
             <GlassCard glowColor="sunshine" className="p-6 flex flex-col items-center text-center gap-3">
               <div className="w-16 h-16 rounded-full bg-sunshine/10 text-sunshine flex items-center justify-center mb-2">
                 <Award className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black tracking-tighter uppercase text-forest">Reputation</h3>
               <p className="text-4xl font-black text-carrot">{user.reputation}</p>
               <p className="text-[10px] font-bold tracking-widest uppercase text-forest/40 mt-1">Points Earned</p>
             </GlassCard>
             
             {user.isMentor && (
               <GlassCard glowColor="forest" className="p-6 flex flex-col items-center text-center gap-3 border-carrot/20">
                 <div className="w-16 h-16 rounded-full bg-carrot/10 text-carrot flex items-center justify-center mb-2">
                   <Briefcase className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-black tracking-tighter uppercase text-forest">Mentor Profile</h3>
                 <div className="bg-carrot text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Approved</div>
               </GlassCard>
             )}
          </div>
        </div>

        {/* Mentor Application Section */}
        {!user.isMentor && (
          <GlassCard glowColor="forest" className="p-6 mt-4 border-forest/20">
            <h3 className="text-xl font-black tracking-tighter uppercase text-forest mb-2">Become a Mentor</h3>
            
            {user.mentorStatus === 'pending' ? (
              <div className="bg-sunshine/10 border border-sunshine/20 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                 <CheckCircle2 className="w-8 h-8 text-sunshine" />
                 <p className="font-bold">Your mentor application is under review.</p>
                 <p className="text-xs text-forest/60">We will notify you once our team has reviewed your profile.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="flex flex-col gap-4 mt-6">
                <p className="text-sm text-forest/60 mb-2 font-medium">Earn money and help juniors by sharing your experiences, providing guidance, and taking mock interviews.</p>
                
                {errorMsg && <div className="text-tomato text-xs font-bold bg-tomato/10 p-3 rounded-lg border border-tomato/20">{errorMsg}</div>}
                {successMsg && <div className="text-forest text-xs font-bold bg-forest/10 p-3 rounded-lg border border-forest/20">{successMsg}</div>}
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-forest/40">Bio / Expertise Showcase *</label>
                  <textarea 
                    required
                    minLength={10}
                    placeholder="Highlight your internships, open source contributions, or specific skills you can mentor on."
                    className="w-full bg-white/40 border border-gray-200/50 rounded-2xl p-4 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80 min-h-[100px] resize-y"
                    value={formData.mentor_bio}
                    onChange={e => setFormData({ ...formData, mentor_bio: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-forest/40">Session Rate (INR) *</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    placeholder="e.g. 200 (Use 0 for free sessions)"
                    className="w-full bg-white/40 border border-gray-200/50 rounded-2xl px-4 py-3 text-sm font-medium text-forest placeholder:text-forest/30 outline-none focus:border-[#9ABC05] focus:bg-white/80"
                    value={formData.mentor_rate}
                    onChange={e => setFormData({ ...formData, mentor_rate: e.target.value })}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isApplying}
                  className="mt-4 self-start bg-[#9ABC05] hover:bg-[#88a704] disabled:bg-[#9ABC05]/50 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
                >
                  {isApplying ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
}
