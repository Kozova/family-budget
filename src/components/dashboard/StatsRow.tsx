"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function StatsRow({ refresh }: { refresh?: number }) {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const now = new Date();
      const from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
      const { data } = await supabase.from("transactions").select("amount,type").eq("user_id", user.id).gte("date", from);
      if (!data) return;
      setIncome(data.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0));
      setExpense(data.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0));
    };
    load();
  }, [refresh]);

  const stats = [
    { label: "Доходи за місяць", value: `₴ ${income.toLocaleString("uk-UA")}`, sub: "цього місяця", red: false },
    { label: "Витрати за місяць", value: `₴ ${expense.toLocaleString("uk-UA")}`, sub: "цього місяця", red: true },
    { label: "Накопичення", value: `₴ ${Math.max(0, income - expense).toLocaleString("uk-UA")}`, sub: "залишок", red: false },
  ];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background:"#fff", borderRadius:16, padding:"16px 18px", border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", color:"#9CA3AF", marginBottom:6 }}>{s.label}</div>
          <div style={{ fontSize:22, fontWeight:700, color:s.red?"#E24B4A":"#1A2744" }}>{s.value}</div>
          <div style={{ fontSize:11, color:"#9CA3AF", marginTop:4 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}