import { ProfileSkeleton } from "@/components/ui/skeleton-loaders";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <ProfileSkeleton />
    </div>
  );
}
