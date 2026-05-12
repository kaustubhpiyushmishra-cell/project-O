"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { walletApi, type Transaction } from "@/lib/api";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, Clock, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getTransactions({ limit: 20 }),
      ]);
      setBalance(balRes.data.balance);
      setTransactions(txRes.data.transactions);
    } catch {
      // Wallet may not exist yet — show 0
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const amt = parseInt(addAmount);
    if (!amt || amt <= 0 || amt > 50000) {
      setError("Enter an amount between ₹1 and ₹50,000");
      return;
    }
    setIsAdding(true);
    setError("");
    try {
      const res = await walletApi.addFunds(amt);
      setBalance(res.data.balance);
      setShowAddModal(false);
      setAddAmount("");
      // Reload transactions
      const txRes = await walletApi.getTransactions({ limit: 20 });
      setTransactions(txRes.data.transactions);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add funds");
    } finally {
      setIsAdding(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-forest/10 border-t-carrot rounded-full animate-spin" />
            <p className="text-xs font-bold tracking-widest uppercase text-forest/40">Loading wallet...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto flex flex-col gap-12 text-forest">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter uppercase mb-2">Wallet</h1>
              <p className="text-sm font-bold tracking-widest uppercase text-forest/40">Manage your balances and payments.</p>
            </motion.div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-carrot hover:bg-tomato text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Money
            </button>
          </div>

          {/* Balance Card */}
          <GlassCard glowColor="carrot" className="p-8 md:p-12 bg-gradient-to-br from-carrot/10 to-transparent border-carrot/30 shadow-lg">
            <div className="flex items-center gap-3 text-carrot font-bold uppercase tracking-widest text-sm mb-6">
              <WalletIcon className="w-5 h-5" /> Current Balance
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-forest mb-8">
              ₹{balance.toLocaleString("en-IN")}
              <span className="text-2xl text-forest/40">.00</span>
            </h2>
            {transactions.length > 0 && (
              <div className="flex gap-4">
                <span className="bg-forest/5 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase border border-forest/10 text-forest/60">
                  {transactions.length} recent transaction{transactions.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </GlassCard>

          {/* Transaction History */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tighter uppercase text-forest">Transaction History</h3>
            </div>

            {transactions.length === 0 ? (
              <GlassCard glowColor="none" className="p-12 text-center border-forest/10">
                <WalletIcon className="w-12 h-12 text-forest/15 mx-auto mb-4" />
                <p className="text-sm text-forest/40 font-medium">No transactions yet. Add money to get started.</p>
              </GlassCard>
            ) : (
              <div className="flex flex-col gap-4">
                {transactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="p-6 flex items-center justify-between border-b border-forest/5 last:border-b-0 group hover:bg-forest/[0.02] transition-colors rounded-xl font-sans"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "credit" ? "bg-kiwi/10" : "bg-tomato/10"
                        }`}
                      >
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="w-4 h-4 text-kiwi" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-tomato" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold tracking-tight text-sm text-forest/80 group-hover:text-forest transition-colors">
                          {tx.description}
                        </p>
                        <p className="text-xs text-forest/40 font-bold tracking-widest uppercase mt-1">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-black tracking-tight text-lg ${
                        tx.type === "credit" ? "text-kiwi" : "text-forest/60"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Money Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-xl font-black tracking-tight text-forest mb-6">Add Money</h3>

                {/* Quick amounts */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAddAmount(amt.toString())}
                      className={`py-3 rounded-xl text-[11px] font-black tracking-widest uppercase border transition-all ${
                        addAmount === amt.toString()
                          ? "bg-carrot text-white border-carrot"
                          : "bg-forest/5 text-forest/60 border-forest/10 hover:bg-forest/10"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  placeholder="Or enter custom amount..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-forest placeholder:text-forest/25 outline-none focus:border-carrot focus:bg-white transition-colors mb-4"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min={1}
                  max={50000}
                />

                {error && (
                  <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 mb-4">{error}</div>
                )}

                <button
                  onClick={handleAdd}
                  disabled={isAdding || !addAmount}
                  className="w-full bg-carrot hover:bg-tomato disabled:bg-carrot/40 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add ₹{parseInt(addAmount) > 0 ? parseInt(addAmount).toLocaleString("en-IN") : "..."}
                    </>
                  )}
                </button>

                <p className="text-[10px] text-forest/30 text-center mt-4 font-bold tracking-widest uppercase">
                  Simulated payment (dev mode)
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AppLayout>
    </AuthGuard>
  );
}
