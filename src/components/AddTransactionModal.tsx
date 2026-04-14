"use client";
import { useState } from "react";

const expenseCategories = [
  { emoji: "🛒", name: "Їжа" },
  { emoji: "🚗", name: "Транспорт" },
  { emoji: "🏠", name: "Комунальні" },
  { emoji: "💊", name: "Здоровя" },
  { emoji: "🎮", name: "Розваги" },
  { emoji: "📚", name: "Освіта" },
  { emoji: "👔", name: "Одяг" },
  { emoji: "📱", name: "Підписки" },
];

const incomeCategories = [
  { emoji: "💼", name: "Зарплата" },
  { emoji: "💻", name: "Фріланс" },
  { emoji: "🏠", name: "Оренда" },
  { emoji: "🎁", name: "Подарунок" },
  { emoji: "💰", name: "Інше" },
];

const members = ["Олексій", "Марія", "Аліна"];

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [selectedCat, setSelectedCat] = useState("Їжа");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("UAH");
  const [member, setMember] = useState("Олексій");
  const [comment, setComment] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  if (!isOpen) return null;

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  const handleSave = () => {
    alert("Транзакцію збережено: " + (type === "expense" ? "-" : "+") + amount + " " + currency + " · " + selectedCat);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, padding: 28, width: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1A2744" }}>Нова транзакція</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9CA3AF", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => { setType("expense"); setSelectedCat("Їжа"); }}
            style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .15s",
              background: type === "expense" ? "#FCEBEB" : "#F9FAFB",
              color: type === "expense" ? "#A32D2D" : "#9CA3AF",
              borderColor: type === "expense" ? "#F09595" : "#E8EAF0" }}>
            ↓ Витрата
          </button>
          <button
            onClick={() => { setType("income"); setSelectedCat("Зарплата"); }}
            style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .15s",
              background: type === "income" ? "#E1F5EE" : "#F9FAFB",
              color: type === "income" ? "#0F6E56" : "#9CA3AF",
              borderColor: type === "income" ? "#5DCAA5" : "#E8EAF0" }}>
            ↑ Дохід
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Сума</div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 16, fontWeight: 600, outline: "none", color: "#1A2744" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Валюта</div>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744", background: "#fff" }}>
              <option>UAH ₴</option>
              <option>USD $</option>
              <option>EUR €</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Категорія</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCat(cat.name)}
                style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid", fontSize: 12, cursor: "pointer", fontWeight: 500, transition: "all .12s", display: "flex", alignItems: "center", gap: 5,
                  background: selectedCat === cat.name ? "#E1F5EE" : "#F9FAFB",
                  color: selectedCat === cat.name ? "#0F6E56" : "#6B7280",
                  borderColor: selectedCat === cat.name ? "#5DCAA5" : "#E8EAF0" }}>
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Дата</div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Учасник</div>
            <select
              value={member}
              onChange={e => setMember(e.target.value)}
              style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744", background: "#fff" }}>
              {members.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Коментар</div>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Необовязково"
            style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
        </div>

        <button
          onClick={handleSave}
          style={{ width: "100%", background: "#1EB788", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,183,136,.3)" }}>
          Зберегти транзакцію
        </button>
      </div>
    </div>
  );
}
