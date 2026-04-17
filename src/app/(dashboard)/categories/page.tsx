"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  emoji: string;
  type: string;
}

const DEFAULT_EXPENSE = [
  { emoji: "🛒", name: "Їжа" },
  { emoji: "🚗", name: "Транспорт" },
  { emoji: "🏠", name: "Комунальні" },
  { emoji: "💊", name: "Здоровя" },
  { emoji: "🎮", name: "Розваги" },
  { emoji: "📚", name: "Освіта" },
  { emoji: "👔", name: "Одяг" },
  { emoji: "📱", name: "Підписки" },
];

const DEFAULT_INCOME = [
  { emoji: "💼", name: "Зарплата" },
  { emoji: "💻", name: "Фріланс" },
  { emoji: "🏠", name: "Оренда" },
  { emoji: "🎁", name: "Подарунок" },
  { emoji: "💰", name: "Інше" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("type")
      .order("name");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("categories").insert({
      user_id: user.id,
      name,
      emoji: emoji || (type === "expense" ? "💳" : "💰"),
      type,
    });
    setName(""); setEmoji(""); setType("expense");
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити категорію?")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  };

  const expenseCats = categories.filter(c => c.type === "expense");
  const incomeCats = categories.filter(c => c.type === "income");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 12, padding: "0 20px", height: 40, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,183,136,.3)" }}>
          + Нова категорія
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #E8EAF0", marginBottom: 16, boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A2744", marginBottom: 16 }}>Нова категорія</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button onClick={() => setType("expense")} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer", background: type === "expense" ? "#FCEBEB" : "#F9FAFB", color: type === "expense" ? "#A32D2D" : "#9CA3AF", borderColor: type === "expense" ? "#F09595" : "#E8EAF0" }}>
              ↓ Витрата
            </button>
            <button onClick={() => setType("income")} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer", background: type === "income" ? "#E1F5EE" : "#F9FAFB", color: type === "income" ? "#0F6E56" : "#9CA3AF", borderColor: type === "income" ? "#5DCAA5" : "#E8EAF0" }}>
              ↑ Дохід
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Назва</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Назва категорії" style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", color: "#1A2744" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Емодзі</div>
              <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🎯" style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: "#1EB788", color: "#fff", border: "none", borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Збереження..." : "Зберегти"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ border: "1.5px solid #E8EAF0", background: "#fff", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer", color: "#6B7280" }}>
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Дефолтні категорії */}
      {!loading && categories.length === 0 && (
        <div style={{ background: "#E1F5EE", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#0F6E56" }}>
          💡 Стандартні категорії вже доступні в модалці додавання транзакцій. Тут можна додати власні!
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Витрати */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744", marginBottom: 14 }}>Витрати — стандартні</div>
          {DEFAULT_EXPENSE.map(c => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F5F5F8" }}>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>
              <span style={{ fontSize: 13, color: "#1A2744", flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F0F2F5", borderRadius: 6, padding: "2px 8px" }}>стандартна</span>
            </div>
          ))}
          {expenseCats.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Власні</div>
              {expenseCats.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F5F5F8" }}>
                  <span style={{ fontSize: 18 }}>{c.emoji}</span>
                  <span style={{ fontSize: 13, color: "#1A2744", flex: 1 }}>{c.name}</span>
                  <button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9CA3AF" }}>🗑️</button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Доходи */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744", marginBottom: 14 }}>Доходи — стандартні</div>
          {DEFAULT_INCOME.map(c => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F5F5F8" }}>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>
              <span style={{ fontSize: 13, color: "#1A2744", flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F0F2F5", borderRadius: 6, padding: "2px 8px" }}>стандартна</span>
            </div>
          ))}
          {incomeCats.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Власні</div>
              {incomeCats.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F5F5F8" }}>
                  <span style={{ fontSize: 18 }}>{c.emoji}</span>
                  <span style={{ fontSize: 13, color: "#1A2744", flex: 1 }}>{c.name}</span>
                  <button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#9CA3AF" }}>🗑️</button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}