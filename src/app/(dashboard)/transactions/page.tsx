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

const catColors: Record<string, { bg: string; color: string }> = {
  "Їжа":       { bg:"#E1F5EE", color:"#0F6E56" },
  "Комунальні": { bg:"#E6F1FB", color:"#185FA5" },
  "Зарплата":  { bg:"#E1F5EE", color:"#0F6E56" },
  "Транспорт": { bg:"#FAEEDA", color:"#854F0B" },
  "Здоровя":   { bg:"#FCEBEB", color:"#A32D2D" },
  "Підписки":  { bg:"#EEEDFE", color:"#534AB7" },
  "Розваги":   { bg:"#FAEEDA", color:"#854F0B" },
  "Фріланс":   { bg:"#E1F5EE", color:"#0F6E56" },
  "Освіта":    { bg:"#E6F1FB", color:"#185FA5" },
  "Одяг":      { bg:"#FAEEDA", color:"#854F0B" },
  "Оренда":    { bg:"#E1F5EE", color:"#0F6E56" },
  "Подарунок": { bg:"#FAEEDA", color:"#854F0B" },
  "Інше":      { bg:"#F0F2F5", color:"#6B7280" },
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all");
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      let query = supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }).order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("type", filter);
      const { data } = await query;
      setTransactions(data || []);
      setLoading(false);
    };
    load();
  }, [filter]);

  return (
    <div>
      <div style={{ display:"flex", gap:9, marginBottom:16 }}>
        {(["all","expense","income"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ border:"1.5px solid", borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer", fontWeight:filter===f?700:400, background:filter===f?"#1A2744":"#fff", color:filter===f?"#fff":"#6B7280", borderColor:filter===f?"#1A2744":"#E8EAF0" }}>
            {f==="all"?"Всі" : f==="expense"?"Витрати":"Доходи"}
          </button>
        ))}
      </div>
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)", overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:40, textAlign:"center", color:"#9CA3AF", fontSize:13 }}>Завантаження...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"#9CA3AF", fontSize:13 }}>Немає транзакцій. Додайте першу! 👆</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #F0F2F5" }}>
                {["Дата","Опис","Категорія","Сума"].map(h => (
                  <th key={h} style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, textAlign:"left", padding:"10px 16px", textTransform:"uppercase", letterSpacing:"0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => {
                const cat = catColors[tx.description] || { bg:"#F0F2F5", color:"#6B7280" };
                return (
                  <tr key={tx.id} style={{ borderBottom:"1px solid #F5F5F8" }}>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#9CA3AF" }}>{tx.date}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#1A2744", fontWeight:500 }}>{tx.description}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, background:cat.bg, color:cat.color }}>{tx.description}</span>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:tx.type==="expense"?"#E24B4A":"#1EB788", whiteSpace:"nowrap" }}>
                      {tx.type==="expense"?"-":"+"}{tx.amount.toLocaleString("uk-UA")} {tx.currency}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}