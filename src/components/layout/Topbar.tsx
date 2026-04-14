"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "Дашборд",
  "/transactions": "Транзакції",
  "/goals": "Цілі накопичень",
  "/recurring": "Регулярні платежі",
  "/analytics": "Статистика",
  "/categories": "Управління категоріями",
  "/settings": "Налаштування",
};

export default function Topbar({ onAddClick }: { onAddClick: () => void }) {
  const pathname = usePathname();
  const title = titles[pathname] || "Дашборд";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 230,
        height: 58,
        background: "#fff",
        borderBottom: "1px solid #E8EAF0",
        boxShadow: "0 1px 6px rgba(26,39,68,.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 10,
      }}>
      <h1 style={{ fontSize: 15, fontWeight: 700, color: "#1A2744" }}>
        {title}
      </h1>
      <button
        onClick={onAddClick}
        style={{
          background: "#1EB788",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "0 20px",
          height: 40,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 7,
          boxShadow: "0 2px 8px rgba(30,183,136,.3)",
        }}>
        + Додати запис
      </button>
    </header>
  );
}
