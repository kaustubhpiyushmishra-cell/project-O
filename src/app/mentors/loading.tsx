import { MentorGridSkeleton } from "@/components/ui/skeleton-loaders";

export default function MentorsLoading() {
  return (
    <div className="min-h-screen bg-cream p-6 md:p-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-48 rounded-lg bg-forest/5 animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-forest/5 animate-pulse" />
        </div>
        <MentorGridSkeleton count={6} />
      </div>
    </div>
  );
}
