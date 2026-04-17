"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface CategoryLimit {
  id: string;
  category_name: string;
  emoji: string;
  monthly_limit: number;
}

interface CategorySpent {
  name: string;
  spent: number;
}

const DEFAULT_CATEGORIES = [
  { emoji: "🛒", name: "Їжа" },
  { emoji: "🚗", name: "Транспорт" },
  { emoji: "🏠", name: "Комунальні" },
  { emoji: "💊", name: "Здоровя" },
  { emoji: "🎮", name: "Розваги" },
  { emoji: "📚", name: "Освіта" },
  { emoji: "👔", name: "Одяг" },
  { emoji: "📱", name: "Підписки" },
];

export default function CategoriesPage() {
  const [limits, setLimits] = useState<CategoryLimit[]>([]);
  const [spent, setSpent] = useState<CategorySpent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCat, setSelectedCat] = useState(DEFAULT_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: limitsData } = await supabase
      .from("category_limits")
      .select("*")
      .eq("user_id", user.id);
    setLimits(limitsData || []);

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
    setSpent(Object.entries(spentMap).map(([name, spent]) => ({ name, spent })));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!limitAmount) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("category_limits").upsert({
      user_id: user.id,
      category_name: selectedCat.name,
      emoji: selectedCat.emoji,
      monthly_limit: Number(limitAmount),
    }, { onConflict: "user_id,category_name" });
    setLimitAmount("");
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("category_limits").delete().eq("id", id);
    load();
  };

  const getSpent = (name: string) => spent.find(s => s.name === name)?.spent || 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 12, padding: "0 20px", height: 40, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,183,136,.3)" }}>
          + Встановити ліміт
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #E8EAF0", marginBottom: 16, boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A2744", marginBottom: 16 }}>Ліміт витрат по категорії</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Категорія</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DEFAULT_CATEGORIES.map(cat => (
                <button key={cat.name} onClick={() => setSelectedCat(cat)} style={{ padding: "8px 14px", borderRadius: 20, border: "1.5px solid", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: selectedCat.name === cat.name ? "#E1F5EE" : "#F9FAFB", color: selectedCat.name === cat.name ? "#0F6E56" : "#6B7280", borderColor: selectedCat.name === cat.name ? "#5DCAA5" : "#E8EAF0", fontWeight: selectedCat.name === cat.name ? 700 : 400 }}>
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Місячний ліміт (грн)</div>
            <input type="number" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} placeholder="5000" style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", color: "#1A2744" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: "#1EB788", color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Збереження..." : "Зберегти ліміт"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ border: "1.5px solid #E8EAF0", background: "#fff", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer", color: "#6B7280" }}>
              Скасувати
            </button>
          </div>
        </div>
      )}

      {limits.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, border: "1px solid #E8EAF0", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 6 }}>Ще немає лімітів</div>
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>Встановіть місячний ліміт по категорії щоб контролювати витрати</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {limits.map(limit => {
            const spentAmount = getSpent(limit.category_name);
            const pct = limit.monthly_limit > 0 ? Math.round((spentAmount / limit.monthly_limit) * 100) : 0;
            const color = pct < 60 ? "#1EB788" : pct < 85 ? "#EF9F27" : "#E24B4A";
            const isOver = pct >= 100;

            return (
              <div key={limit.id} style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${isOver ? "#F09595" : "#E8EAF0"}`, boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {limit.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2744" }}>{limit.category_name}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                      Витрачено {spentAmount.toLocaleString("uk-UA")} з {limit.monthly_limit.toLocaleString("uk-UA")} грн
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color }}>{pct}%</div>
                    {isOver && <div style={{ fontSize: 11, color: "#E24B4A", fontWeight: 600 }}>Перевищено!</div>}
                  </div>
                  <button onClick={() => handleDelete(limit.id)} style={{ background: "none", border: "1.5px solid #E8EAF0", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: "#9CA3AF", flexShrink: 0 }}>🗑️</button>
                </div>

                <div style={{ height: 10, background: "#F0F2F5", borderRadius: 5, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: Math.min(pct, 100) + "%", background: color, borderRadius: 5, transition: "width .4s" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#9CA3AF" }}>0 грн</span>
                  <span style={{ color: isOver ? "#E24B4A" : "#9CA3AF", fontWeight: isOver ? 700 : 400 }}>
                    {isOver ? `Перевищено на ${(spentAmount - limit.monthly_limit).toLocaleString("uk-UA")} грн` : `Залишилось ${(limit.monthly_limit - spentAmount).toLocaleString("uk-UA")} грн`}
                  </span>
                  <span style={{ color: "#9CA3AF" }}>{limit.monthly_limit.toLocaleString("uk-UA")} грн</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}