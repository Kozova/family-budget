"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  emoji: string;
  type: string;
  limit?: number;
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
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [limitAmount, setLimitAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("type").order("name");
    setCategories(cats || []);

    const { data: lims } = await supabase
      .from("category_limits")
      .select("category_name, monthly_limit")
      .eq("user_id", user.id);
    const limMap: Record<string, number> = {};
    lims?.forEach(l => { limMap[l.category_name] = l.monthly_limit; });
    setLimits(limMap);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditCat(null);
    setName(""); setEmoji(""); setType("expense"); setLimitAmount("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setName(cat.name); setEmoji(cat.emoji); setType(cat.type as "expense" | "income");
    setLimitAmount(limits[cat.name] ? String(limits[cat.name]) : "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editCat) {
      await supabase.from("categories").update({ name, emoji: emoji || editCat.emoji, type }).eq("id", editCat.id);
    } else {
      await supabase.from("categories").insert({ user_id: user.id, name, emoji: emoji || (type === "expense" ? "💳" : "💰"), type });
    }

    if (limitAmount && Number(limitAmount) > 0) {
      await supabase.from("category_limits").upsert({
        user_id: user.id,
        category_name: name,
        emoji: emoji || (type === "expense" ? "💳" : "💰"),
        monthly_limit: Number(limitAmount),
      }, { onConflict: "user_id,category_name" });
    } else if (editCat && limits[editCat.name]) {
      await supabase.from("category_limits").delete().eq("user_id", user.id).eq("category_name", editCat.name);
    }

    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm("Видалити категорію?")) return;
    await supabase.from("categories").delete().eq("id", cat.id);
    await supabase.from("category_limits").delete().eq("user_id", (await supabase.auth.getUser()).data.user!.id).eq("category_name", cat.name);
    load();
  };

  const renderCatRow = (name: string, emoji: string, isDefault = false, cat?: Category) => {
    const limit = limits[name];
    return (
      <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F5F5F8" }}>
        <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "#1A2744", fontWeight: 500 }}>{name}</div>
          {limit && (
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              Ліміт: {limit.toLocaleString("uk-UA")} грн/міс
            </div>
          )}
        </div>
        {isDefault ? (
          <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F0F2F5", borderRadius: 6, padding: "2px 8px" }}>стандартна</span>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => cat && openEdit(cat)} style={{ background: "#F0F2F5", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: "#6B7280" }}>✏️</button>
            <button onClick={() => cat && handleDelete(cat)} style={{ background: "none", border: "1.5px solid #E8EAF0", borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: "#9CA3AF" }}>🗑️</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={openCreate} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 12, padding: "0 20px", height: 40, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,183,136,.3)" }}>
          + Нова категорія
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #E8EAF0", marginBottom: 16, boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A2744", marginBottom: 16 }}>
            {editCat ? `Редагувати: ${editCat.name}` : "Нова категорія"}
          </div>

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

          {type === "expense" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>
                Місячний ліміт (грн) — необов&apos;язково
              </div>
              <input
                type="number"
                value={limitAmount}
                onChange={e => setLimitAmount(e.target.value)}
                placeholder="Наприклад: 5000"
                style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", color: "#1A2744" }}
              />
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                Буде відображатись як прогрес-бар на дашборді
              </div>
            </div>
          )}

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744", marginBottom: 4 }}>Витрати</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>Стандартні + власні</div>
          {DEFAULT_EXPENSE.map(c => renderCatRow(c.name, c.emoji, true))}
          {categories.filter(c => c.type === "expense").length > 0 && (
            <>
              <div style={{ fontSize: 11, color: "#9CA3AF", margin: "12px 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Власні</div>
              {categories.filter(c => c.type === "expense").map(c => renderCatRow(c.name, c.emoji, false, c))}
            </>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744", marginBottom: 4 }}>Доходи</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>Стандартні + власні</div>
          {DEFAULT_INCOME.map(c => renderCatRow(c.name, c.emoji, true))}
          {categories.filter(c => c.type === "income").length > 0 && (
            <>
              <div style={{ fontSize: 11, color: "#9CA3AF", margin: "12px 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Власні</div>
              {categories.filter(c => c.type === "income").map(c => renderCatRow(c.name, c.emoji, false, c))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}