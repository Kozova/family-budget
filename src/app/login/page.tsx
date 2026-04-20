"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const reset = () => { setError(""); setMessage(""); };

  const handleSubmit = async () => {
    if (!email) { setError("Введіть email"); return; }
    if (mode !== "forgot" && !password) { setError("Введіть пароль"); return; }
    if (mode === "register" && password.length < 6) { setError("Пароль мінімум 6 символів"); return; }

    setLoading(true); reset();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/"); router.refresh();

      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, full_name: name });
        }
        setMessage("Перевірте пошту для підтвердження реєстрації!");

      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        setMessage("Лист для скидання пароля надіслано на вашу пошту!");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Помилка";
      if (msg.includes("Invalid login")) setError("Невірний email або пароль");
      else if (msg.includes("already registered")) setError("Цей email вже зареєстрований");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    border: "1.5px solid #E8EAF0",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    outline: "none",
    color: "#1A2744",
    background: "#FAFBFC",
    transition: "border-color .2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1A2744 0%, #1E3460 50%, #1EB788 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Лого */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: "#1EB788", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 14px", boxShadow: "0 8px 24px rgba(30,183,136,.4)" }}>
            💰
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Сімейний гаманець</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>Контролюйте бюджет разом з родиною</div>
        </div>

        {/* Картка */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>

          {/* Заголовок */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1A2744", marginBottom: 4 }}>
              {mode === "login" ? "Вхід" : mode === "register" ? "Реєстрація" : "Скидання пароля"}
            </div>
            <div style={{ fontSize: 13, color: "#9CA3AF" }}>
              {mode === "login" ? "Раді бачити вас знову!" : mode === "register" ? "Створіть акаунт для вашої родини" : "Введіть email і ми надішлемо посилання"}
            </div>
          </div>

          {/* Поле імені — тільки при реєстрації */}
          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 6 }}>Ваше імя</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Діана"
                style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#1EB788"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8EAF0"}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); reset(); }}
              placeholder="your@email.com"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#1EB788"}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8EAF0"}
            />
          </div>

          {/* Пароль */}
          {mode !== "forgot" && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Пароль</label>
                {mode === "login" && (
                  <button onClick={() => { setMode("forgot"); reset(); }} style={{ background: "none", border: "none", fontSize: 12, color: "#1EB788", cursor: "pointer", fontWeight: 500 }}>
                    Забули пароль?
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); reset(); }}
                  placeholder={mode === "register" ? "мінімум 6 символів" : "••••••••"}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#1EB788"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E8EAF0"}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          )}

          {/* Помилка */}
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Повідомлення */}
          {message && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#16A34A", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span>✅</span> {message}
            </div>
          )}

          {/* Кнопка */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", background: loading ? "#9CA3AF" : "linear-gradient(135deg, #1EB788, #16A06E)", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: 20, boxShadow: loading ? "none" : "0 4px 12px rgba(30,183,136,.35)", transition: "all .2s" }}>
            {loading ? "Завантаження..." : mode === "login" ? "Увійти" : mode === "register" ? "Створити акаунт" : "Надіслати лист"}
          </button>

          {/* Перемикачі */}
          <div style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}>
            {mode === "login" && (
              <>Немає акаунту?{" "}
                <button onClick={() => { setMode("register"); reset(); }} style={{ background: "none", border: "none", color: "#1EB788", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Зареєструватись</button>
              </>
            )}
            {mode === "register" && (
              <>Вже є акаунт?{" "}
                <button onClick={() => { setMode("login"); reset(); }} style={{ background: "none", border: "none", color: "#1EB788", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Увійти</button>
              </>
            )}
            {mode === "forgot" && (
              <button onClick={() => { setMode("login"); reset(); }} style={{ background: "none", border: "none", color: "#1EB788", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>← Повернутись до входу</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}