"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Перевірте пошту для підтвердження!");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: 420, boxShadow: "0 4px 24px rgba(26,39,68,.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, background: "#1EB788", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            💰
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1A2744" }}>Сімейний гаманець</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>сімейний бюджет</div>
          </div>
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: "#1A2744", marginBottom: 6 }}>
          {isLogin ? "Вхід" : "Реєстрація"}
        </div>
        <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>
          {isLogin ? "Увійдіть у свій акаунт" : "Створіть новий акаунт"}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Email
          </div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", color: "#1A2744" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Пароль
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="min 6 символів"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", color: "#1A2744" }}
          />
        </div>

        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: "#E1F5EE", color: "#0F6E56", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", background: loading ? "#9CA3AF" : "#1EB788", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 14, boxShadow: "0 2px 8px rgba(30,183,136,.3)" }}>
          {loading ? "Завантаження..." : isLogin ? "Увійти" : "Зареєструватись"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}>
          {isLogin ? "Немає акаунту? " : "Вже є акаунт? "}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(""); setMessage(""); }}
            style={{ color: "#1EB788", cursor: "pointer", fontWeight: 600 }}>
            {isLogin ? "Зареєструватись" : "Увійти"}
          </span>
        </div>
      </div>
    </div>
  );
}