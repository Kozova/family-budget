"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinPage() {
  const [status, setStatus] = useState<"loading"|"ready"|"done"|"error">("loading");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const supabase = createClient();

  useEffect(() => {
    const check = async () => {
      if (!token) { setStatus("error"); return; }
      const { data } = await supabase.from("invitations").select("*").eq("token", token).single();
      if (!data || data.accepted) { setStatus("error"); return; }
      setEmail(data.email);
      setStatus("ready");
    };
    check();
  }, [token]);

  const handleJoin = async () => {
    if (!token) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: inv } = await supabase.from("invitations").select("family_id").eq("token", token).single();
    if (!inv) return;
    await supabase.from("profiles").upsert({ id: user.id, family_id: inv.family_id, role: "member" });
    await supabase.from("invitations").update({ accepted: true }).eq("token", token);
    setStatus("done");
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: 420, boxShadow: "0 4px 24px rgba(26,39,68,.1)", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1A2744", marginBottom: 8 }}>Запрошення до сімї</div>
        {status === "loading" && <div style={{ color: "#9CA3AF" }}>Перевірка запрошення...</div>}
        {status === "error" && <div style={{ color: "#E24B4A" }}>Посилання недійсне або вже використане</div>}
        {status === "ready" && (
          <div>
            <div style={{ color: "#6B7280", marginBottom: 24 }}>Вас запрошено приєднатись до сімейного гаманця</div>
            <button onClick={handleJoin} style={{ width: "100%", background: "#1EB788", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Приєднатись
            </button>
          </div>
        )}
        {status === "done" && <div style={{ color: "#1EB788", fontWeight: 600 }}>Ви успішно приєднались! Перенаправлення...</div>}
      </div>
    </div>
  );
}