"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

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

interface Category { id: string; name: string; emoji: string; type: string; }
interface EditState { name: string; emoji: string; type: string; isDefault: boolean; catId?: string; }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [limitAmount, setLimitAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: cats } = await supabase.from("categories").select("*").eq("user_id", user.id).order("type").order("name");
    setCategories(cats || []);
    const { data: lims } = await supabase.from("category_limits").select("category_name, monthly_limit").eq("user_id", user.id);
    const limMap: Record<string, number> = {};
    lims?.forEach(l => { limMap[l.category_name] = l.monthly_limit; });
    setLimits(limMap);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditState({ name: "", emoji: "", type: "expense", isDefault: false });
    setName(""); setEmoji(""); setType("expense"); setLimitAmount("");
    setShowForm(true);
  };

  const openEdit = (catName: string, catEmoji: string, catType: string, isDefault: boolean, catId?: string) => {
    setEditState({ name: catName, emoji: catEmoji, type: catType, isDefault, catId });
    setName(catName); setEmoji(catEmoji); setType(catType as "expense" | "income");
    setLimitAmount(limits[catName] ? String(limits[catName]) : "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!editState?.isDefault) {
      if (editState?.catId) {
        await supabase.from("categories").update({ name, emoji: emoji || editState.emoji, type }).eq("id", editState.catId);
      } else {
        await supabase.from("categories").insert({ user_id: user.id, name, emoji: emoji || (type === "expense" ? "💳" : "💰"), type });
      }
    }
    if (type === "expense" || editState?.isDefault) {
      if (limitAmount && Number(limitAmount) > 0) {
        await supabase.from("category_limits").upsert({ user_id: user.id, category_name: name, emoji: emoji || editState?.emoji || "💳", monthly_limit: Number(limitAmount) }, { onConflict: "user_id,category_name" });
      } else if (limits[name]) {
        await supabase.from("category_limits").delete().eq("user_id", user.id).eq("category_name", name);
      }
    }
    setShowForm(false); setSaving(false); load();
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm("Видалити?")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("categories").delete().eq("id", cat.id);
    await supabase.from("category_limits").delete().eq("user_id", user.id).eq("category_name", cat.name);
    load();
  };

  const renderRow = (catName: string, catEmoji: string, catType: string, isDefault: boolean, cat?: Category) => {
    const limit = limits[catName];
    return (
      <div key={catName} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid #F5F5F8" }}>
        <span style={{ fontSize:20, width:28, textAlign:"center" }}>{catEmoji}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:"#1A2744", fontWeight:500 }}>{catName}</div>
          {limit ? (
            <div style={{ fontSize:11, color:"#1EB788", marginTop:2, fontWeight:600 }}>Ліміт: {limit.toLocaleString("uk-UA")} грн/міс</div>
          ) : catType === "expense" ? (
            <div style={{ fontSize:11, color:"#C8CDD8", marginTop:2 }}>Ліміт не встановлено</div>
          ) : null}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {isDefault && (
            <button onClick={() => openEdit(catName, catEmoji, catType, true)} style={{ background:"#F0F2F5", border:"none", borderRadius:7, padding:"5px 10px", fontSize:12, cursor:"pointer", color:"#6B7280" }}>
              {limit ? "✏️ Ліміт" : "+ Ліміт"}
            </button>
          )}
          {!isDefault && cat && (
            <>
              <button onClick={() => openEdit(catName, catEmoji, catType, false, cat.id)} style={{ background:"#F0F2F5", border:"none", borderRadius:7, padding:"5px 10px", fontSize:12, cursor:"pointer", color:"#6B7280" }}>✏️</button>
              <button onClick={() => handleDelete(cat)} style={{ background:"none", border:"1.5px solid #E8EAF0", borderRadius:7, padding:"5px 10px", fontSize:12, cursor:"pointer", color:"#9CA3AF" }}>🗑️</button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button onClick={openCreate} style={{ background:"#1EB788", color:"#fff", border:"none", borderRadius:12, padding:"0 20px", height:40, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          + Нова категорія
        </button>
      </div>
      {showForm && (
        <div style={{ background:"#fff", borderRadius:16, padding:24, border:"1px solid #E8EAF0", marginBottom:16 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#1A2744", marginBottom:16 }}>
            {editState?.isDefault ? `Ліміт для: ${editState.name}` : editState?.catId ? `Редагувати: ${editState.name}` : "Нова категорія"}
          </div>
          {!editState?.isDefault && (
            <>
              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                <button onClick={() => setType("expense")} style={{ flex:1, padding:10, borderRadius:10, border:"1.5px solid", fontSize:13, fontWeight:700, cursor:"pointer", background:type==="expense"?"#FCEBEB":"#F9FAFB", color:type==="expense"?"#A32D2D":"#9CA3AF", borderColor:type==="expense"?"#F09595":"#E8EAF0" }}>↓ Витрата</button>
                <button onClick={() => setType("income")} style={{ flex:1, padding:10, borderRadius:10, border:"1.5px solid", fontSize:13, fontWeight:700, cursor:"pointer", background:type==="income"?"#E1F5EE":"#F9FAFB", color:type==="income"?"#0F6E56":"#9CA3AF", borderColor:type==="income"?"#5DCAA5":"#E8EAF0" }}>↑ Дохід</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Назва</div>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Назва" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", color:"#1A2744" }} />
                </div>
                <div>
                  <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Емодзі</div>
                  <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🎯" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none" }} />
                </div>
              </div>
            </>
          )}
          {(type === "expense" || editState?.isDefault) && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Місячний ліміт (грн) — необовязково</div>
              <input type="number" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} placeholder="5000" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", color:"#1A2744" }} />
              <div style={{ fontSize:11, color:"#9CA3AF", marginTop:4 }}>Буде відображатись як прогрес-бар на дашборді</div>
            </div>
          )}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex:1, background:"#1EB788", color:"#fff", border:"none", borderRadius:8, padding:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {saving ? "Збереження..." : "Зберегти"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ border:"1.5px solid #E8EAF0", background:"#fff", borderRadius:8, padding:"10px 16px", fontSize:13, cursor:"pointer", color:"#6B7280" }}>Скасувати</button>
          </div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #E8EAF0" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1A2744", marginBottom:4 }}>Витрати</div>
          <div style={{ fontSize:11, color:"#9CA3AF", marginBottom:12 }}>Натисни + Ліміт щоб контролювати бюджет</div>
          {DEFAULT_EXPENSE.map(c => renderRow(c.name, c.emoji, "expense", true))}
          {categories.filter(c => c.type === "expense").map(c => renderRow(c.name, c.emoji, "expense", false, c))}
        </div>
        <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #E8EAF0" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1A2744", marginBottom:4 }}>Доходи</div>
          <div style={{ fontSize:11, color:"#9CA3AF", marginBottom:12 }}>Стандартні + власні</div>
          {DEFAULT_INCOME.map(c => renderRow(c.name, c.emoji, "income", true))}
          {categories.filter(c => c.type === "income").map(c => renderRow(c.name, c.emoji, "income", false, c))}
        </div>
      </div>
    </div>
  );
}
