"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send } from "lucide-react";
import { ratingApi } from "@/lib/api";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  partnerId: string;
  partnerName: string;
}

export function RatingModal({ isOpen, onClose, sessionId, partnerId, partnerName }: RatingModalProps) {
  const [score, setScore] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (score === 0) {
      setError("Please select a rating");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await ratingApi.submit({
        sessionId,
        ratedId: partnerId,
        score,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setScore(0);
        setComment("");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-4 py-8"
              >
                <div className="w-16 h-16 rounded-full bg-[#9ABC05]/10 text-[#9ABC05] flex items-center justify-center">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-[#2D321F]">Thanks for rating!</h3>
                <p className="text-sm text-[#2D321F]/40">Your feedback helps improve the community.</p>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-black tracking-tight text-[#2D321F] mb-2">Rate your session</h3>
                  <p className="text-sm text-[#2D321F]/50 font-medium">
                    How was your experience with <span className="text-[#2D321F] font-bold">{partnerName || "your partner"}</span>?
                  </p>
                </div>

                {/* Stars */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setScore(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 transition-all duration-200 ${
                          star <= (hoveredStar || score)
                            ? "text-[#F5A623] fill-[#F5A623] drop-shadow-sm"
                            : "text-gray-200"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>

                {/* Labels */}
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-[#2D321F]/30 mb-8 px-2">
                  <span>Poor</span>
                  <span>Amazing</span>
                </div>

                {/* Comment */}
                <textarea
                  placeholder="Share your thoughts (optional)..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium text-[#2D321F] placeholder:text-[#2D321F]/25 outline-none focus:border-[#9ABC05] focus:bg-white min-h-[80px] resize-none transition-colors mb-4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                />

                {error && (
                  <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || score === 0}
                  className="w-full bg-[#2D321F] hover:bg-[#3d4330] disabled:bg-[#2D321F]/30 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Rating
                    </>
                  )}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
