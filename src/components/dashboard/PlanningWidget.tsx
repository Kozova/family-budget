"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface PlanItem {
  id: string;
  title: string;
  amount: number | null;
  emoji: string;
  planned_date: string | null;
  is_done: boolean;
  category_name: string | null;
}

export default function PlanningWidget() {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("budget_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", monthKey)
      .order("is_done", { ascending: true })
      .order("planned_date", { ascending: true })
      .limit(5);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (item: PlanItem) => {
    await supabase.from("budget_plans").update({ is_done: !item.is_done }).eq("id", item.id);
    load();
  };

  if (!loading && items.length === 0) return null;

  const totalPlanned = items.reduce((s, i) => s + (i.amount || 0), 0);
  const done = items.filter(i => i.is_done).length;
  const pct = items.length > 0 ? Math.round(done / items.length * 100) : 0;

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744" }}>План на місяць</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
            {done} з {items.length} виконано · ₴ {totalPlanned.toLocaleString("uk-UA")} заплановано
          </div>
        </div>
        <Link href="/planning" style={{ fontSize: 12, color: "#1EB788", textDecoration: "none" }}>всі →</Link>
      </div>

      {/* Прогрес */}
      <div style={{ height: 6, background: "#F0F2F5", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "#1EB788" : "#378ADD", borderRadius: 3, transition: "width .4s" }} />
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "10px 0" }}>Завантаження...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #F5F5F8", opacity: item.is_done ? 0.5 : 1 }}>
              <button
                onClick={() => handleToggle(item)}
                style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${item.is_done ? "#1EB788" : "#D1D5DB"}`, background: item.is_done ? "#1EB788" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                {item.is_done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
              </button>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: item.is_done ? "#9CA3AF" : "#1A2744", fontWeight: 500, textDecoration: item.is_done ? "line-through" : "none" }}>
                  {item.title}
                </div>
                {item.planned_date && (
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                    {new Date(item.planned_date).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                  </div>
                )}
              </div>
              {item.amount && (
                <div style={{ fontSize: 12, fontWeight: 700, color: item.is_done ? "#9CA3AF" : "#E24B4A", whiteSpace: "nowrap" }}>
                  -{item.amount.toLocaleString("uk-UA")} грн
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}