import BalanceHero from "@/components/dashboard/BalanceHero";
import StatsRow from "@/components/dashboard/StatsRow";
import LimitsWidget from "@/components/dashboard/LimitsWidget";
import GoalsWidget from "@/components/dashboard/GoalsWidget";
import PlanningWidget from "@/components/dashboard/PlanningWidget";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import AiTips from "@/components/dashboard/AiTips";

export default function DashboardPage() {
  return (
    <div>
      <BalanceHero />
      <StatsRow />
      <LimitsWidget />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <GoalsWidget />
        <PlanningWidget />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <RecentTransactions />
        <AiTips />
      </div>
    </div>
  );
}