"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Recurring {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  currency: string;
  type: string;
  day_of_month: number;
  is_active: boolean;
}

export default function RecurringPage() {
  const [payments, setPayments] = useState<Recurring[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense"|"income">("expense");
  const [day, setDay] = useState("1");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("recurring_payments")
      .select("*")
      .eq("user_id", user.id)
      .order("day_of_month");
    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!name || !amount) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("recurring_payments").insert({
      user_id: user.id,
      name,
      emoji: emoji || (type === "expense" ? "💳" : "💰"),
      amount: Number(amount),
      currency: "UAH",
      type,
      day_of_month: Number(day),
      is_active: true,
    });
    setName(""); setEmoji(""); setAmount(""); setDay("1"); setType("expense");
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    await supabase.from("recurring_payments").update({ is_active: !is_active }).eq("id", id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити регулярний платіж?")) return;
    await supabase.from("recurring_payments").delete().eq("id", id);
    load();
  };

  const totalExpense = payments.filter(p => p.type === "expense" && p.is_active).reduce((s, p) => s + Number(p.amount), 0);
  const totalIncome = payments.filter(p => p.type === "income" && p.is_active).reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      {/* Підсумок */}
      {payments.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Щомісячні витрати</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#E24B4A" }}>₴ {totalExpense.toLocaleString("uk-UA")}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Щомісячні доходи</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1EB788" }}>₴ {totalIncome.toLocaleString("uk-UA")}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 12, padding: "0 20px", height: 40, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,183,136,.3)" }}>
          + Додати платіж
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #E8EAF0", marginBottom: 16, boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A2744", marginBottom: 16 }}>Новий регулярний платіж</div>
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
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Квартплата, Netflix..." style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", color: "#1A2744" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Емодзі</div>
              <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🏠" style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Сума (грн)</div>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1500" style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", color: "#1A2744" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>День місяця</div>
              <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} placeholder="1" style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", color: "#1A2744" }} />
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

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 13 }}>Завантаження...</div>
      ) : payments.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, border: "1px solid #E8EAF0", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
          Немає регулярних платежів. Додайте перший — квартплату, підписки, зарплату!
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)", overflow: "hidden" }}>
          {payments.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < payments.length - 1 ? "1px solid #F5F5F8" : "none", opacity: p.is_active ? 1 : 0.5 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: p.type === "expense" ? "#FCEBEB" : "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {p.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2744" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Щомісяця {p.day_of_month}-го числа</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: p.type === "expense" ? "#E24B4A" : "#1EB788", marginRight: 8 }}>
                {p.type === "expense" ? "-" : "+"}{Number(p.amount).toLocaleString("uk-UA")} грн
              </div>
              <button onClick={() => handleToggle(p.id, p.is_active)} style={{ border: "1.5px solid #E8EAF0", background: p.is_active ? "#E1F5EE" : "#F9FAFB", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer", color: p.is_active ? "#0F6E56" : "#9CA3AF", fontWeight: 600 }}>
                {p.is_active ? "Активний" : "Вимкнено"}
              </button>
              <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "1.5px solid #E8EAF0", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: "#9CA3AF" }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}