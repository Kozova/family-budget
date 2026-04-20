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

const MONTHS_UA = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];

export default function PlanningWidget() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const load = async () => {
    setLoading(true);
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

  useEffect(() => { load(); }, [monthKey]);

  const handleToggle = async (item: PlanItem) => {
    await supabase.from("budget_plans").update({ is_done: !item.is_done }).eq("id", item.id);
    load();
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const totalPlanned = items.reduce((s, i) => s + (i.amount || 0), 0);
  const done = items.filter(i => i.is_done).length;
  const pct = items.length > 0 ? Math.round(done / items.length * 100) : 0;

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)", marginBottom: 14 }}>
      {/* Заголовок з навігацією */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744" }}>План на місяць</div>
        <Link href="/planning" style={{ fontSize: 12, color: "#1EB788", textDecoration: "none" }}>всі →</Link>
      </div>

      {/* Навігація по місяцях */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, background: "#F9FAFB", borderRadius: 10, padding: "6px 10px" }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6B7280", padding: "0 4px" }}>←</button>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2744" }}>{MONTHS_UA[month]} {year}</div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6B7280", padding: "0 4px" }}>→</button>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "16px 0" }}>Завантаження...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 8 }}>План на {MONTHS_UA[month]} порожній</div>
          <Link href="/planning" style={{ fontSize: 12, color: "#1EB788", textDecoration: "none", fontWeight: 600 }}>+ Додати план →</Link>
        </div>
      ) : (
        <>
          {/* Прогрес */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginBottom: 5 }}>
            <span>{done} з {items.length} виконано</span>
            <span>₴ {totalPlanned.toLocaleString("uk-UA")}</span>
          </div>
          <div style={{ height: 6, background: "#F0F2F5", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "#1EB788" : "#378ADD", borderRadius: 3, transition: "width .4s" }} />
          </div>

          {/* Список */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #F5F5F8", opacity: item.is_done ? 0.5 : 1 }}>
                <button onClick={() => handleToggle(item)} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${item.is_done ? "#1EB788" : "#D1D5DB"}`, background: item.is_done ? "#1EB788" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
        </>
      )}
    </div>
  );
}