"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  currency: string;
}

const categoryIcons: Record<string, string> = {
  "Їжа": "🛒", "Транспорт": "🚗", "Комунальні": "⚡",
  "Здоровя": "💊", "Розваги": "🎮", "Освіта": "📚",
  "Одяг": "👔", "Підписки": "📱", "Зарплата": "💼",
  "Фріланс": "💻", "Оренда": "🏠", "Подарунок": "🎁", "Інше": "💰",
};

export default function RecentTransactions({ refresh }: { refresh?: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(7);
      setTransactions(data || []);
      setLoading(false);
    };
    load();
  }, [refresh]);

  return (
    <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#1A2744" }}>Останні транзакції</div>
        <a href="/transactions" style={{ fontSize:12, color:"#1EB788", textDecoration:"none" }}>всі →</a>
      </div>
      {loading ? (
        <div style={{ fontSize:13, color:"#9CA3AF", padding:"20px 0", textAlign:"center" }}>Завантаження...</div>
      ) : transactions.length === 0 ? (
        <div style={{ fontSize:13, color:"#9CA3AF", padding:"20px 0", textAlign:"center" }}>Ще немає транзакцій. Додайте першу! 👆</div>
      ) : (
        transactions.map(tx => (
          <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 6px", borderBottom:"1px solid #F5F5F8", borderRadius:8 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:"#F0F2F5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
              {categoryIcons[tx.description] || (tx.type === "income" ? "💰" : "💳")}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"#1A2744", fontWeight:500 }}>{tx.description}</div>
              <div style={{ fontSize:11, color:"#9CA3AF" }}>{tx.date}</div>
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:tx.type==="expense"?"#E24B4A":"#1EB788", whiteSpace:"nowrap" }}>
              {tx.type === "expense" ? "-" : "+"}{tx.amount.toLocaleString("uk-UA")} {tx.currency}
            </div>
          </div>
        ))
      )}
    </div>
  );
}