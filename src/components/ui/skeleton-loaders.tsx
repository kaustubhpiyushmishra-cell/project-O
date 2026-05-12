"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

/** A single shimmering skeleton block */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-forest/5 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-forest/[0.04] to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** A full mentor card skeleton */
export function MentorCardSkeleton() {
  return (
    <div className="bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex gap-4">
        <Skeleton className="w-16 h-16 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-forest/5">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}

/** Dashboard stat card skeleton */
export function StatCardSkeleton() {
  return (
    <div className="bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-6 flex flex-col gap-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/** Activity feed item skeleton */
export function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-forest/5 last:border-0">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

/** A full-page loading skeleton grid for mentor listing */
export function MentorGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MentorCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Profile page skeleton */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-6 md:p-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-6 flex flex-col gap-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-32" /></div>
            <div className="flex flex-col gap-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-40" /></div>
            <div className="flex flex-col gap-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-36" /></div>
            <div className="flex flex-col gap-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-28" /></div>
          </div>
        </div>
        <div className="bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Wallet page skeleton */
export function WalletSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-6 md:p-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      {/* Balance card */}
      <div className="bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-8 flex items-center justify-between">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-12 w-32" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      {/* Transaction list */}
      <div className="bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-6 flex flex-col gap-1">
        <Skeleton className="h-6 w-36 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-forest/5 last:border-0">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** History page skeleton */
export function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-6 md:p-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-6 flex items-center gap-6">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Admin page skeleton */
export function AdminSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto p-6 md:p-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Pending list */}
      <div className="bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-6 flex flex-col gap-1">
        <Skeleton className="h-6 w-44 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-forest/5 last:border-0">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
