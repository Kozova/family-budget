"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface LimitData {
  id: string;
  category_name: string;
  emoji: string;
  monthly_limit: number;
  spent: number;
}

export default function LimitsWidget() {
  const [limits, setLimits] = useState<LimitData[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: limitsData } = await supabase
        .from("category_limits")
        .select("*")
        .eq("user_id", user.id);

      if (!limitsData || limitsData.length === 0) return;

      const now = new Date();
      const from = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-01";
      const { data: txs } = await supabase
        .from("transactions")
        .select("amount, description, type")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("date", from);

      const spentMap: Record<string, number> = {};
      txs?.forEach(tx => {
        spentMap[tx.description] = (spentMap[tx.description] || 0) + Number(tx.amount);
      });

      setLimits(limitsData.map(l => ({
        ...l,
        spent: spentMap[l.category_name] || 0,
      })));
    };
    load();
  }, []);

  if (limits.length === 0) return null;

  const warnings = limits.filter(l => l.monthly_limit > 0 && (l.spent / l.monthly_limit) >= 0.8);
  const overLimit = limits.filter(l => l.monthly_limit > 0 && l.spent > l.monthly_limit);

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Попередження якщо є перевищення */}
      {overLimit.length > 0 && (
        <div style={{ background: "#FCEBEB", borderRadius: 12, padding: "10px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, border: "1px solid #F09595" }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#A32D2D" }}>
              Перевищено ліміт: {overLimit.map(l => l.category_name).join(", ")}
            </div>
            <div style={{ fontSize: 12, color: "#C0392B" }}>
              Перевищено бюджет по {overLimit.length} категорії
            </div>
          </div>
        </div>
      )}

      {/* Блок лімітів */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744" }}>Ліміти витрат</div>
          <Link href="/categories" style={{ fontSize: 12, color: "#1EB788", textDecoration: "none" }}>
            керувати →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {limits.map(l => {
            const pct = l.monthly_limit > 0 ? Math.round((l.spent / l.monthly_limit) * 100) : 0;
            const isOver = pct >= 100;
            const isWarning = pct >= 80 && !isOver;
            const color = isOver ? "#E24B4A" : isWarning ? "#EF9F27" : "#1EB788";

            return (
              <div key={l.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 16 }}>{l.emoji}</span>
                  <span style={{ fontSize: 13, color: "#1A2744", fontWeight: 500, flex: 1 }}>{l.category_name}</span>
                  <span style={{ fontSize: 12, color, fontWeight: 700 }}>
                    {l.spent.toLocaleString("uk-UA")} / {l.monthly_limit.toLocaleString("uk-UA")} грн
                  </span>
                  <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 35, textAlign: "right" }}>
                    {isOver ? "🔴" : isWarning ? "⚠️" : ""} {pct}%
                  </span>
                </div>
                <div style={{ height: 6, background: "#F0F2F5", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(pct, 100) + "%", background: color, borderRadius: 3, transition: "width .4s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}