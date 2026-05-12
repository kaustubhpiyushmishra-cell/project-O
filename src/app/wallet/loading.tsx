import { WalletSkeleton } from "@/components/ui/skeleton-loaders";

export default function WalletLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <WalletSkeleton />
    </div>
  );
}
