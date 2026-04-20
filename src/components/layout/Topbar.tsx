"use client";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const titles: Record<string, string> = {
  "/": "Дашборд",
  "/transactions": "Транзакції",
  "/goals": "Цілі",
  "/recurring": "Регулярні",
  "/analytics": "Статистика",
  "/categories": "Категорії",
  "/settings": "Налаштування",
  "/planning": "Планування",
};

export default function Topbar({ onAddClick, onMenuClick }: { onAddClick: () => void; onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = titles[pathname] || "Дашборд";
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className="topbar"
      style={{ position: "fixed", top: 0, right: 0, left: 230, height: 58, background: "#fff", borderBottom: "1px solid #E8EAF0", boxShadow: "0 1px 6px rgba(26,39,68,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Гамбургер кнопка — тільки мобільний */}
        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#1A2744", padding: "4px 8px", borderRadius: 6 }}>
          ☰
        </button>
        <h1 style={{ fontSize: 15, fontWeight: 700, color: "#1A2744" }}>{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onAddClick}
          style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 12, padding: "0 16px", height: 38, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 2px 8px rgba(30,183,136,.3)", whiteSpace: "nowrap" }}>
          + Додати
        </button>
        <button
          onClick={handleLogout}
          style={{ background: "none", border: "1.5px solid #E8EAF0", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#6B7280", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FCEBEB"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E24B4A"; (e.currentTarget as HTMLButtonElement).style.color = "#E24B4A"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8EAF0"; (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}>
          🚪 Вийти
        </button>
      </div>
    </header>
  );
}