"use client";
import { useState } from "react";
import BalanceHero from "@/components/dashboard/BalanceHero";
import StatsRow from "@/components/dashboard/StatsRow";
import GoalsWidget from "@/components/dashboard/GoalsWidget";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import AiTips from "@/components/dashboard/AiTips";
import AddTransactionModal from "@/components/AddTransactionModal";

export default function DashboardPage() {
  const [refresh, setRefresh] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <BalanceHero refresh={refresh} />
      <StatsRow refresh={refresh} />
      <GoalsWidget />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <RecentTransactions refresh={refresh} />
        <AiTips />
      </div>
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setRefresh(r => r + 1)}
      />
    </div>
  );
}