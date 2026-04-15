"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Goal {
  id: string;
  name: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  deadline: string;
  is_completed: boolean;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!name || !target) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("goals").insert({
      user_id: user.id,
      name,
      emoji,
      target_amount: Number(target),
      current_amount: 0,
      currency: "UAH",
      deadline: deadline || null,
    });
    setName(""); setEmoji("🎯"); setTarget(""); setDeadline("");
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleAddAmount = async (goalId: string, current: number, add: number) => {
    await supabase.from("goals").update({ current_amount: current + add }).eq("id", goalId);
    load();
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ background:"#1EB788", color:"#fff", border:"none", borderRadius:12, padding:"0 20px", height:40, fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(30,183,136,.3)" }}>
          + Нова ціль
        </button>
      </div>

      {showForm && (
        <div style={{ background:"#fff", borderRadius:16, padding:22, border:"1px solid #E8EAF0", marginBottom:16, boxShadow:"0 2px 8px rgba(26,39,68,.06)" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#1A2744", marginBottom:16 }}>Нова ціль накопичень</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Назва</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Наприклад: Відпустка" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", color:"#1A2744" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Емодзі</div>
              <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🎯" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Сума ціль (₴)</div>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="50000" style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", color:"#1A2744" }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Дедлайн</div>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width:"100%", border:"1.5px solid #E8EAF0", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", color:"#1A2744" }} />
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

      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#9CA3AF", fontSize:13 }}>Завантаження...</div>
      ) : goals.length === 0 ? (
        <div style={{ textAlign:"center", padding:40, color:"#9CA3AF", fontSize:13 }}>Немає цілей. Додайте першу! 🎯</div>
      ) : (
        goals.map(g => {
          const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
          const left = g.target_amount - g.current_amount;
          const color = pct < 50 ? "#1EB788" : pct < 75 ? "#EF9F27" : "#E24B4A";
          return (
            <div key={g.id} style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)", marginBottom:13 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{ width:46, height:46, borderRadius:12, background:color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{g.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:"#1A2744" }}>{g.name}</div>
                  <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>{g.deadline ? `до ${g.deadline}` : "без дедлайну"}</div>
                </div>
                <div style={{ fontSize:22, fontWeight:700, color }}>{pct}%</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#6B7280", marginBottom:9 }}>
                <span>Накопичено: <strong style={{ color:"#1A2744" }}>₴ {g.current_amount.toLocaleString("uk-UA")}</strong></span>
                <span>Ціль: <strong style={{ color:"#1A2744" }}>₴ {g.target_amount.toLocaleString("uk-UA")}</strong></span>
                <span>Залишилось: <strong style={{ color:"#1A2744" }}>₴ {left.toLocaleString("uk-UA")}</strong></span>
              </div>
              <div style={{ height:9, background:"#F0F2F5", borderRadius:5, overflow:"hidden", marginBottom:10 }}>
                <div style={{ height:"100%", width:Math.min(pct,100)+"%", background:color, borderRadius:5, transition:"width .4s" }} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {[1000, 5000, 10000].map(amt => (
                  <button key={amt} onClick={() => handleAddAmount(g.id, g.current_amount, amt)} style={{ border:"1.5px solid #E8EAF0", background:"#F9FAFB", borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer", color:"#1A2744", fontWeight:500 }}>
                    +{amt.toLocaleString("uk-UA")}
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}