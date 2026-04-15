"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function BalanceHero({ refresh }: { refresh?: number }) {
  const [spent, setSpent] = useState(0);
  const [income, setIncome] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const now = new Date();
      const from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
      const { data } = await supabase.from("transactions").select("amount,type").eq("user_id", user.id).gte("date", from);
      if (!data) return;
      const inc = data.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const exp = data.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      setIncome(inc);
      setSpent(exp);
    };
    load();
  }, [refresh]);

  const total = income;
  const totalSpent = spent || 0;
  const pct = total > 0 ? Math.round((totalSpent / total) * 100) : 0;
  const left = total - totalSpent;

  const getColor = () => pct < 50 ? "#1EB788" : pct < 75 ? "#EF9F27" : "#E24B4A";
  const getBadge = () => {
    if (pct < 50) return { text: `✅ ${pct}% — все під контролем`, bg: "rgba(30,183,136,.2)", color: "#1EB788" };
    if (pct < 75) return { text: `⚡ ${pct}% — витрачайте обережніше`, bg: "rgba(239,159,39,.2)", color: "#EF9F27" };
    return { text: `🔴 ${pct}% — майже вичерпано!`, bg: "rgba(226,75,74,.2)", color: "#E24B4A" };
  };
  const badge = getBadge();

  return (
    <div style={{ background:"linear-gradient(135deg,#1A2744 0%,#1E3460 100%)", borderRadius:20, padding:"26px 28px 22px", marginBottom:16, position:"relative", overflow:"hidden", boxShadow:"0 4px 20px rgba(26,39,68,.18)" }}>
      <div style={{ position:"absolute", right:-24, top:-24, width:140, height:140, borderRadius:"50%", background:"rgba(30,183,136,.08)" }} />
      <div style={{ position:"relative", zIndex:1 }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.45)", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:6 }}>Залишок на місяць</div>
        <div style={{ fontSize:42, fontWeight:700, color:"#fff", lineHeight:1.05, marginBottom:4 }}>₴ {left.toLocaleString("uk-UA")}</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,.45)", marginBottom:20 }}>Витрачено ₴ {totalSpent.toLocaleString("uk-UA")} з ₴ {total.toLocaleString("uk-UA")} доходів</div>
        <div style={{ background:"rgba(255,255,255,.1)", borderRadius:8, height:11, overflow:"hidden", marginBottom:8 }}>
          <div style={{ height:"100%", width:`${Math.min(pct,100)}%`, background:getColor(), borderRadius:8, transition:"width .4s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,.3)", marginBottom:14 }}>
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:badge.bg, borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:700, color:badge.color }}>{badge.text}</div>
        </div>
      </div>
    </div>
  );
}