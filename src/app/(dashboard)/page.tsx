import BalanceHero from "@/components/dashboard/BalanceHero";
import StatsRow from "@/components/dashboard/StatsRow";
import GoalsWidget from "@/components/dashboard/GoalsWidget";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import AiTips from "@/components/dashboard/AiTips";

export default function DashboardPage() {
  return (
    <div>
      <BalanceHero />
      <StatsRow />
      <GoalsWidget />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <RecentTransactions />
        <AiTips />
      </div>
    </div>
  );
}
