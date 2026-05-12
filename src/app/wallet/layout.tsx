import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Wallet",
  description: "Manage your Project O balance, add funds, and view transaction history.",
  openGraph: { title: "Wallet — Project O", description: "Manage your balance and transactions." },
};
export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
