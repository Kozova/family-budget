"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Tip {
  icon: string;
  title: string;
  text: string;
  color: string;
}

export default function AiTips() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const now = new Date();
        const from = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-01";
        const { data: txs } = await supabase
          .from("transactions")
          .select("amount,type,description,date")
          .eq("user_id", user.id)
          .gte("date", from);

        const { data: goals } = await supabase
          .from("goals")
          .select("name,target_amount,current_amount,deadline")
          .eq("user_id", user.id)
          .eq("is_completed", false)
          .limit(3);

        const income = txs?.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) || 0;
        const expense = txs?.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0) || 0;
        const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

        const prompt = `Ти фінансовий помічник. Дай 3 короткі поради українською мовою на основі даних:
- Доходи цього місяця: ${income} грн
- Витрати цього місяця: ${expense} грн  
- Залишок: ${income - expense} грн
- Днів до кінця місяця: ${daysLeft}
- Цілі: ${goals?.map(g => g.name + " (" + Math.round(g.current_amount / g.target_amount * 100) + "%)").join(", ") || "немає"}

Відповідь ТІЛЬКИ у форматі JSON масиву без зайвого тексту:
[{"icon":"💡","title":"Назва поради","text":"Текст поради 1-2 речення","color":"#1EB788"},...]
Використовуй різні іконки та кольори: #1EB788 (зелений), #EF9F27 (жовтий), #E24B4A (червоний), #378ADD (синій).`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const data = await response.json();
        const text = data.content?.[0]?.text || "[]";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setTips(parsed);
      } catch (e) {
        setTips([
          { icon: "💡", title: "Відстежуйте витрати", text: "Додавайте транзакції щодня — це допоможе краще планувати бюджет.", color: "#1EB788" },
          { icon: "🎯", title: "Ставте цілі", text: "Визначте конкретну суму і дедлайн для кожної мети накопичень.", color: "#378ADD" },
          { icon: "⚡", title: "Контролюйте витрати", text: "Слідкуйте щоб витрати не перевищували 80% від доходів.", color: "#EF9F27" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2744" }}>Поради від ШІ</div>
        {loading && <div style={{ fontSize: 11, color: "#9CA3AF" }}>Генерую...</div>}
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 60, background: "#F0F2F5", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : (
        tips.map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < tips.length - 1 ? "1px solid #F5F5F8" : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: tip.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              {tip.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: tip.color, marginBottom: 2 }}>{tip.title}</div>
              <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{tip.text}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}