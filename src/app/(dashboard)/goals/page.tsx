"use client";
import { useState } from "react";

const goals = [
  { id:1, emoji:"🏖️", name:"Відпустка в Туреччині", deadline:"Серпень 2026", target:25000, current:16800, color:"#1EB788" },
  { id:2, emoji:"🚗", name:"Новий автомобіль", deadline:"Грудень 2027", target:200000, current:44000, color:"#378ADD" },
  { id:3, emoji:"🏠", name:"Ремонт кухні", deadline:"Жовтень 2026", target:30000, current:12000, color:"#EF9F27" },
];

function GoalCard({ g }: { g: { id: number; emoji: string; name: string; deadline: string; target: number; current: number; color: string } }) {
  const pct = Math.round((g.current / g.target) * 100);
  const left = g.target - g.current;
  const perMonth = Math.round(left / 4);
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)", marginBottom:13 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
        <div style={{ width:46, height:46, borderRadius:12, background:g.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{g.emoji}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#1A2744" }}>{g.name}</div>
          <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>до {g.deadline}</div>
        </div>
        <div style={{ fontSize:22, fontWeight:700, color:g.color }}>{pct}%</div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#6B7280", marginBottom:9 }}>
        <span>Накопичено: <strong style={{ color:"#1A2744" }}>₴ {g.current.toLocaleString("uk-UA")}</strong></span>
        <span>Ціль: <strong style={{ color:"#1A2744" }}>₴ {g.target.toLocaleString("uk-UA")}</strong></span>
        <span>Залишилось: <strong style={{ color:"#1A2744" }}>₴ {left.toLocaleString("uk-UA")}</strong></span>
      </div>
      <div style={{ height:9, background:"#F0F2F5", borderRadius:5, overflow:"hidden", marginBottom:4 }}>
        <div style={{ height:"100%", width:pct+"%", background:g.color, borderRadius:5 }} />
      </div>
      <div style={{ marginTop:10, background:"#F0FBF7", borderRadius:7, padding:"8px 12px", fontSize:12, color:"#085041", borderLeft:"2px solid #1EB788" }}>
        Залишилось 4 місяці — відкладайте ₴ {perMonth.toLocaleString("uk-UA")}/міс і встигнете вчасно
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ background:"#1EB788", color:"#fff", border:"none", borderRadius:12, padding:"0 20px", height:40, fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(30,183,136,.3)" }}>
          + Нова ціль
        </button>
      </div>
      {showForm && (
        <div style={{ background:"#fff", borderRadius:16, padding:22, border:"1px solid #E8EAF0", marginBottom:16 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#1A2744", marginBottom:16 }}>Нова ціль накопичень</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600 }}>Назва</div>
              <input placeholder="Наприклад: Відпустка" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600 }}>Емодзі</div>
              <input placeholder="🎯" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600 }}>Сума ціль (₴)</div>
              <input type="number" placeholder="50000" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600 }}>Дедлайн</div>
              <input type="date" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none" }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ flex:1, background:"#1EB788", color:"#fff", border:"none", borderRadius:8, padding:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>Зберегти</button>
            <button onClick={() => setShowForm(false)} style={{ border:"1.5px solid #E8EAF0", background:"#fff", borderRadius:8, padding:"10px 16px", fontSize:13, cursor:"pointer", color:"#6B7280" }}>Скасувати</button>
          </div>
        </div>
      )}
      {goals.map(g => <GoalCard key={g.id} g={g} />)}
    </div>
  );
}
