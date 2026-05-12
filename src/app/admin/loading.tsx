import { AdminSkeleton } from "@/components/ui/skeleton-loaders";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <AdminSkeleton />
    </div>
  );
}
