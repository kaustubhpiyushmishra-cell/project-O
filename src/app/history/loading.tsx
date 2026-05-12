import { HistorySkeleton } from "@/components/ui/skeleton-loaders";

export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <HistorySkeleton />
    </div>
  );
}
