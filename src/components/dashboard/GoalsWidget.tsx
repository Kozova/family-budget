"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface Goal {
  id: string;
  name: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

export default function GoalsWidget() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("created_at", { ascending: false })
        .limit(3);
      setGoals(data || []);
    };
    load();
  }, []);

  if (goals.length === 0) return null;

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744" }}>Цілі накопичень</div>
        <Link href="/goals" style={{ fontSize: 12, color: "#1EB788", textDecoration: "none" }}>всі →</Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {goals.map(g => {
          const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
          const color = pct < 50 ? "#1EB788" : pct < 75 ? "#EF9F27" : "#E24B4A";
          return (
            <div key={g.id} style={{ background: "#F9FAFB", borderRadius: 12, padding: 14, border: "1px solid #F0F2F5" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{g.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2744", marginBottom: 2 }}>{g.name}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>{g.deadline ? `до ${g.deadline}` : "без дедлайну"}</div>
              <div style={{ height: 6, background: "#E8EAF0", borderRadius: 3, overflow: "hidden", marginBottom: 5 }}>
                <div style={{ height: "100%", width: Math.min(pct, 100) + "%", background: color, borderRadius: 3 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color, fontWeight: 700 }}>{pct}%</span>
                <span style={{ color: "#9CA3AF" }}>ще {(g.target_amount - g.current_amount).toLocaleString("uk-UA")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}