"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (data) setName(data.full_name || "");
    };
    load();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, full_name: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2744", marginBottom: 18 }}>Профіль</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Email</div>
          <input value={email} disabled style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#9CA3AF", background: "#F9FAFB" }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Ім&apos;я</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше ім'я" style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
        </div>
        <button onClick={handleSave} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {saved ? "Збережено ✓" : "Зберегти"}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2744", marginBottom: 4 }}>Про застосунок</div>
        <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Сімейний гаманець v1.0</div>
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
          Застосунок для ведення сімейного бюджету. Відстежуйте доходи та витрати, плануйте цілі накопичень, аналізуйте фінансову статистику.
        </div>
      </div>
    </div>
  );
}