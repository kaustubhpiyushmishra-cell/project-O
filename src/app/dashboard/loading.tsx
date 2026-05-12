import { StatCardSkeleton, ActivitySkeleton } from "@/components/ui/skeleton-loaders";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-cream p-6 md:p-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white/30 backdrop-blur-md border border-forest/5 rounded-2xl p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
