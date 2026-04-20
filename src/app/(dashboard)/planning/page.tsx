"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface PlanItem {
  id: string;
  title: string;
  amount: number | null;
  category_name: string | null;
  emoji: string;
  planned_date: string | null;
  is_done: boolean;
  month: string;
}

const MONTHS_UA = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];

const CATEGORIES = [
  { emoji: "🛒", name: "Їжа" },
  { emoji: "🚗", name: "Транспорт" },
  { emoji: "🏠", name: "Комунальні" },
  { emoji: "💊", name: "Здоровя" },
  { emoji: "🎮", name: "Розваги" },
  { emoji: "📚", name: "Освіта" },
  { emoji: "👔", name: "Одяг" },
  { emoji: "📱", name: "Підписки" },
  { emoji: "💼", name: "Зарплата" },
  { emoji: "💰", name: "Інше" },
];

export default function PlanningPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<PlanItem | null>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [plannedDate, setPlannedDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
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
      .order("planned_date", { ascending: true })
      .order("created_at", { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [monthKey]);

  const openCreate = () => {
    setEditItem(null);
    setTitle(""); setAmount(""); setCategory(CATEGORIES[0]);
    setPlannedDate(`${year}-${String(month + 1).padStart(2, "0")}-01`);
    setShowForm(true);
  };

  const openEdit = (item: PlanItem) => {
    setEditItem(item);
    setTitle(item.title);
    setAmount(item.amount ? String(item.amount) : "");
    setCategory(CATEGORIES.find(c => c.name === item.category_name) || CATEGORIES[0]);
    setPlannedDate(item.planned_date || "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      user_id: user.id,
      title,
      amount: amount ? Number(amount) : null,
      category_name: category.name,
      emoji: category.emoji,
      planned_date: plannedDate || null,
      month: monthKey,
    };
    if (editItem) {
      await supabase.from("budget_plans").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("budget_plans").insert(payload);
    }
    setShowForm(false); setSaving(false); load();
  };

  const handleToggle = async (item: PlanItem) => {
    await supabase.from("budget_plans").update({ is_done: !item.is_done }).eq("id", item.id);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("budget_plans").delete().eq("id", id);
    load();
  };

  const handleAiSuggest = async () => {
    if (!title.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: 0, expense: 0, daysLeft: 30,
          goals: `Визнач категорію і приблизну суму для витрати: "${title}". Відповідь тільки JSON: {"category":"назва категорії","emoji":"емодзі","amount":число}. Категорії: Їжа, Транспорт, Комунальні, Здоровя, Розваги, Освіта, Одяг, Підписки, Інше.`
        }),
      });
      const data = await response.json();
      const text = data.tips?.[0]?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.category) {
          const found = CATEGORIES.find(c => c.name === parsed.category);
          if (found) setCategory(found);
        }
        if (parsed.amount) setAmount(String(parsed.amount));
      }
    } catch {}
    setAiLoading(false);
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const totalPlanned = items.reduce((s, i) => s + (i.amount || 0), 0);
  const totalDone = items.filter(i => i.is_done).reduce((s, i) => s + (i.amount || 0), 0);
  const done = items.filter(i => i.is_done).length;
  const pending = items.filter(i => !i.is_done).length;

  return (
    <div>
      {/* Навігація по місяцях */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={prevMonth} style={{ background:"#fff", border:"1.5px solid #E8EAF0", borderRadius:8, width:36, height:36, cursor:"pointer", fontSize:16 }}>←</button>
        <div style={{ fontSize:16, fontWeight:700, color:"#1A2744" }}>{MONTHS_UA[month]} {year}</div>
        <button onClick={nextMonth} style={{ background:"#fff", border:"1.5px solid #E8EAF0", borderRadius:8, width:36, height:36, cursor:"pointer", fontSize:16 }}>→</button>
      </div>

      {/* Підсумок */}
      {items.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
          <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", border:"1px solid #E8EAF0" }}>
            <div style={{ fontSize:11, color:"#9CA3AF", textTransform:"uppercase", marginBottom:4 }}>Всього планів</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#1A2744" }}>{items.length}</div>
            <div style={{ fontSize:11, color:"#9CA3AF" }}>{done} виконано · {pending} очікує</div>
          </div>
          <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", border:"1px solid #E8EAF0" }}>
            <div style={{ fontSize:11, color:"#9CA3AF", textTransform:"uppercase", marginBottom:4 }}>Заплановано</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#E24B4A" }}>₴ {totalPlanned.toLocaleString("uk-UA")}</div>
          </div>
          <div style={{ background:"#fff", borderRadius:14, padding:"14px 16px", border:"1px solid #E8EAF0" }}>
            <div style={{ fontSize:11, color:"#9CA3AF", textTransform:"uppercase", marginBottom:4 }}>Виконано</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#1EB788" }}>₴ {totalDone.toLocaleString("uk-UA")}</div>
            <div style={{ fontSize:11, color:"#9CA3AF" }}>{totalPlanned > 0 ? Math.round(totalDone / totalPlanned * 100) : 0}% від плану</div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button onClick={openCreate} style={{ background:"#1EB788", color:"#fff", border:"none", borderRadius:12, padding:"0 20px", height:40, fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(30,183,136,.3)" }}>
          + Додати витрату
        </button>
      </div>

      {/* Форма */}
      {showForm && (
        <div style={{ background:"#fff", borderRadius:16, padding:22, border:"1px solid #E8EAF0", marginBottom:16, boxShadow:"0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#1A2744", marginBottom:16 }}>
            {editItem ? "Редагувати" : "Нова витрата"}
          </div>

          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Назва витрати</div>
            <div style={{ display:"flex", gap:8 }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Наприклад: Купити продукти, Оплатити інтернет..."
                style={{ flex:1, border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", color:"#1A2744" }}
              />
              <button
                onClick={handleAiSuggest}
                disabled={aiLoading || !title.trim()}
                title="ШІ визначить категорію і суму"
                style={{ background: aiLoading ? "#F0F2F5" : "#E1F5EE", border:"none", borderRadius:8, padding:"9px 14px", fontSize:12, cursor:"pointer", color:"#0F6E56", fontWeight:600, whiteSpace:"nowrap" }}>
                {aiLoading ? "..." : "✨ ШІ"}
              </button>
            </div>
            <div style={{ fontSize:11, color:"#9CA3AF", marginTop:4 }}>Натисни ✨ ШІ — система визначить категорію і суму автоматично</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Сума (грн)</div>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Необовязково" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", color:"#1A2744" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Дата</div>
              <input type="date" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", color:"#1A2744" }} />
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#6B7280", marginBottom:8, fontWeight:600, textTransform:"uppercase" }}>Категорія</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.name} onClick={() => setCategory(cat)} style={{ padding:"6px 12px", borderRadius:20, border:"1.5px solid", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5, background:category.name===cat.name?"#E1F5EE":"#F9FAFB", color:category.name===cat.name?"#0F6E56":"#6B7280", borderColor:category.name===cat.name?"#5DCAA5":"#E8EAF0", fontWeight:category.name===cat.name?700:400 }}>
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex:1, background:"#1EB788", color:"#fff", border:"none", borderRadius:8, padding:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {saving ? "Збереження..." : "Зберегти"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ border:"1.5px solid #E8EAF0", background:"#fff", borderRadius:8, padding:"10px 16px", fontSize:13, cursor:"pointer", color:"#6B7280" }}>
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Список */}
      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#9CA3AF" }}>Завантаження...</div>
      ) : items.length === 0 ? (
        <div style={{ background:"#fff", borderRadius:16, padding:40, border:"1px solid #E8EAF0", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📝</div>
          <div style={{ fontSize:14, fontWeight:600, color:"#1A2744", marginBottom:6 }}>План на {MONTHS_UA[month]} порожній</div>
          <div style={{ fontSize:13, color:"#9CA3AF" }}>Додайте заплановані витрати — квартплату, продукти, підписки</div>
        </div>
      ) : (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E8EAF0", overflow:"hidden", boxShadow:"0 2px 8px rgba(26,39,68,.06)" }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderBottom:i<items.length-1?"1px solid #F5F5F8":"none", opacity:item.is_done?0.6:1, transition:"opacity .2s" }}>
              {/* Чекбокс */}
              <button onClick={() => handleToggle(item)} style={{ width:22, height:22, borderRadius:6, border:`2px solid ${item.is_done?"#1EB788":"#D1D5DB"}`, background:item.is_done?"#1EB788":"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s" }}>
                {item.is_done && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
              </button>

              {/* Емодзі */}
              <div style={{ width:36, height:36, borderRadius:9, background:"#F0F2F5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                {item.emoji}
              </div>

              {/* Інфо */}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:item.is_done?"#9CA3AF":"#1A2744", textDecoration:item.is_done?"line-through":"none" }}>
                  {item.title}
                </div>
                <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2, display:"flex", gap:8 }}>
                  <span>{item.category_name}</span>
                  {item.planned_date && <span>· {new Date(item.planned_date).toLocaleDateString("uk-UA", { day:"numeric", month:"short" })}</span>}
                </div>
              </div>

              {/* Сума */}
              {item.amount && (
                <div style={{ fontSize:14, fontWeight:700, color:item.is_done?"#9CA3AF":"#E24B4A", whiteSpace:"nowrap" }}>
                  -{item.amount.toLocaleString("uk-UA")} грн
                </div>
              )}

              {/* Кнопки */}
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => openEdit(item)} style={{ background:"#F0F2F5", border:"none", borderRadius:7, width:28, height:28, cursor:"pointer", fontSize:12 }}>✏️</button>
                <button onClick={() => handleDelete(item.id)} style={{ background:"none", border:"1.5px solid #E8EAF0", borderRadius:7, width:28, height:28, cursor:"pointer", fontSize:12, color:"#9CA3AF" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}