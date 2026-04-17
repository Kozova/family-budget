"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface CatStat { name: string; amount: number; }

export default function AnalyticsPage() {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [cats, setCats] = useState<CatStat[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const now = new Date();
      const from = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0") + "-01";
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).gte("date", from);
      if (!data) return;
      const inc = data.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
      const exp = data.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
      setIncome(inc);
      setExpense(exp);
      const catMap: Record<string,number> = {};
      data.filter(t=>t.type==="expense").forEach(t=>{ catMap[t.description]=(catMap[t.description]||0)+Number(t.amount); });
      setCats(Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([name,amount])=>({name,amount})));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div style={{padding:40,textAlign:"center",color:"#9CA3AF"}}>Завантаження...</div>;

  const total = income + expense || 1;
  const maxCat = cats[0]?.amount || 1;
  const COLORS = ["#1EB788","#378ADD","#EF9F27","#E24B4A","#9B59B6"];

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid #E8EAF0",boxShadow:"0 2px 8px rgba(26,39,68,.06)"}}>
          <div style={{fontSize:11,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Доходи цього місяця</div>
          <div style={{fontSize:28,fontWeight:700,color:"#1EB788"}}>₴ {income.toLocaleString("uk-UA")}</div>
          <div style={{marginTop:10,height:8,background:"#F0F2F5",borderRadius:4}}>
            <div style={{height:"100%",width:(income/total*100)+"%",background:"#1EB788",borderRadius:4}}/>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid #E8EAF0",boxShadow:"0 2px 8px rgba(26,39,68,.06)"}}>
          <div style={{fontSize:11,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Витрати цього місяця</div>
          <div style={{fontSize:28,fontWeight:700,color:"#E24B4A"}}>₴ {expense.toLocaleString("uk-UA")}</div>
          <div style={{marginTop:10,height:8,background:"#F0F2F5",borderRadius:4}}>
            <div style={{height:"100%",width:(expense/total*100)+"%",background:"#E24B4A",borderRadius:4}}/>
          </div>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:16,padding:24,border:"1px solid #E8EAF0",boxShadow:"0 2px 8px rgba(26,39,68,.06)"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#1A2744",marginBottom:20}}>Витрати по категоріях</div>
        {cats.length === 0 ? (
          <div style={{textAlign:"center",padding:30,color:"#9CA3AF",fontSize:13}}>Ще немає витрат цього місяця</div>
        ) : cats.map((cat,i) => (
          <div key={cat.name} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
              <span style={{color:"#1A2744",fontWeight:500}}>{cat.name}</span>
              <span style={{color:"#E24B4A",fontWeight:700}}>₴ {cat.amount.toLocaleString("uk-UA")}</span>
            </div>
            <div style={{height:7,b