"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const MONTHS = ["Січ","Лют","Бер","Кві","Тра","Чер","Лип","Сер","Вер","Жов","Лис","Гру"];
const COLORS = ["#1EB788","#378ADD","#EF9F27","#E24B4A","#9B59B6","#1ABC9C","#E67E22","#E91E63"];

export default function AnalyticsPage() {
  const [barData, setBarData] = useState<{month: string; income: number; expense: number}[]>([]);
  const [pieData, setPieData] = useState<{name: string; value: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split("T")[0];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).gte("date", from);
      if (!data) return;

      // Bar chart — доходи vs витрати по місяцях
      const monthMap: Record<string, { income: number; expense: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        monthMap[key] = { income: 0, expense: 0 };
      }
      data.forEach(tx => {
        const key = tx.date.slice(0,7);
        if (monthMap[key]) {
          if (tx.type === "income") monthMap[key].income += Number(tx.amount);
          else monthMap[key].expense += Number(tx.amount);
        }
      });
      setBarData(Object.entries(monthMap).map(([key, val]) => ({
        month: MONTHS[parseInt(key.split("-")[1]) - 1],
        income: val.income,
        expense: val.expense,
      })));

      // Pie chart — витрати по категоріях
      const catMap: Record<string, number> = {};
      data.filter(tx => tx.type === "expense").forEach(tx => {
        catMap[tx.description] = (catMap[tx.description] || 0) + Number(tx.amount);
      });
      setPieData(Object.entries(catMap).map(([name, value]) => ({ name, value })));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#9CA3AF" }}>Завантаження...</div>;

  return (
    <div>
      <div style={{ background:"#fff", borderRadius:16, padding:24, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)", marginBottom:16 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#1A2744", marginBottom:20 }}>Доходи vs Витрати за 6 місяців</div>
        {barData.every(d => d.income === 0 && d.expense === 0) ? (
          <div style={{ textAlign:"center", padding:40, color:"#9CA3AF", fontSize:13 }}>Ще немає даних для графіку. Додайте транзакції!</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top:5, right:10, left:10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="month" tick={{ fontSize:12, fill:"#9CA3AF" }} />
              <YAxis tick={{ fontSize:12, fill:"#9CA3AF" }} tickFormatter={v => `₴${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `₴ ${value.toLocaleString("uk-UA")}`} />
              <Bar dataKey="income" name="Доходи" fill="#1EB788" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Витрати" fill="#E24B4A" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ background:"#fff", borderRadius:16, padding:24, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#1A2744", marginBottom:20 }}>Витрати по категоріях</div>
        {pieData.length === 0 ? (
          <div style={{ textAlign:"center", padding:40, color:"#9CA3AF", fontSize:13 }}>Ще немає витрат. Додайте транзакції!</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => `₴ ${value.toLocaleString("uk-UA")}`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}