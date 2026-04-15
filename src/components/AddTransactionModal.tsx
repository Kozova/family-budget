"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

const expenseCategories = [
  { emoji: "🛒", name: "Їжа" },
  { emoji: "🚗", name: "Транспорт" },
  { emoji: "🏠", name: "Комунальні" },
  { emoji: "💊", name: "Здоровя" },
  { emoji: "🎮", name: "Розваги" },
  { emoji: "📚", name: "Освіта" },
  { emoji: "👔", name: "Одяг" },
  { emoji: "📱", name: "Підписки" },
];

const incomeCategories = [
  { emoji: "💼", name: "Зарплата" },
  { emoji: "💻", name: "Фріланс" },
  { emoji: "🏠", name: "Оренда" },
  { emoji: "🎁", name: "Подарунок" },
  { emoji: "💰", name: "Інше" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: Props) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [selectedCat, setSelectedCat] = useState("Їжа");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  if (!isOpen) return null;

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      setError("Введіть коректну суму");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизовано");

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount: Number(amount),
        type,
        description: description || selectedCat,
        date,
        currency: "UAH",
      });
      if (error) throw error;
      setAmount("");
      setDescription("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка збереження");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:20, padding:28, width:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          <div style={{ fontSize:17, fontWeight:700, color:"#1A2744" }}>Нова транзакція</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9CA3AF" }}>×</button>
        </div>

        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <button onClick={() => { setType("expense"); setSelectedCat("Їжа"); }} style={{ flex:1, padding:10, borderRadius:10, border:"1.5px solid", fontSize:13, fontWeight:700, cursor:"pointer", background:type==="expense"?"#FCEBEB":"#F9FAFB", color:type==="expense"?"#A32D2D":"#9CA3AF", borderColor:type==="expense"?"#F09595":"#E8EAF0" }}>
            ↓ Витрата
          </button>
          <button onClick={() => { setType("income"); setSelectedCat("Зарплата"); }} style={{ flex:1, padding:10, borderRadius:10, border:"1.5px solid", fontSize:13, fontWeight:700, cursor:"pointer", background:type==="income"?"#E1F5EE":"#F9FAFB", color:type==="income"?"#0F6E56":"#9CA3AF", borderColor:type==="income"?"#5DCAA5":"#E8EAF0" }}>
            ↑ Дохід
          </button>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Сума (UAH)</div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:10, padding:"10px 14px", fontSize:16, fontWeight:600, outline:"none", color:"#1A2744" }} />
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#6B7280", marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Категорія</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {categories.map(cat => (
              <button key={cat.name} onClick={() => setSelectedCat(cat.name)} style={{ padding:"6px 12px", borderRadius:20, border:"1.5px solid", fontSize:12, cursor:"pointer", fontWeight:500, display:"flex", alignItems:"center", gap:5, background:selectedCat===cat.name?"#E1F5EE":"#F9FAFB", color:selectedCat===cat.name?"#0F6E56":"#6B7280", borderColor:selectedCat===cat.name?"#5DCAA5":"#E8EAF0" }}>
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div>
            <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Дата</div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:10, padding:"10px 14px", fontSize:13, outline:"none", color:"#1A2744" }} />
          </div>
          <div>
            <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Опис</div>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Необовязково" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:10, padding:"10px 14px", fontSize:13, outline:"none", color:"#1A2744" }} />
          </div>
        </div>

        {error && <div style={{ background:"#FCEBEB", color:"#A32D2D", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{error}</div>}

        <button onClick={handleSave} disabled={loading} style={{ width:"100%", background:loading?"#9CA3AF":"#1EB788", color:"#fff", border:"none", borderRadius:12, padding:13, fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", boxShadow:"0 2px 8px rgba(30,183,136,.3)" }}>
          {loading ? "Збереження..." : "Зберегти транзакцію"}
        </button>
      </div>
    </div>
  );
}