
const goals = [
  { emoji: "🏖️", name: "Відпустка", deadline: "до серпня 2026", pct: 67, color: "#1EB788", left: "8 200" },
  { emoji: "🚗", name: "Автомобіль", deadline: "до грудня 2027", pct: 22, color: "#378ADD", left: "156 000" },
  { emoji: "🏠", name: "Ремонт кухні", deadline: "до жовтня 2026", pct: 40, color: "#EF9F27", left: "18 000" },
];
export default function GoalsWidget() {
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)", marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#1A2744" }}>Цілі накопичень</div>
        <a href="/goals" style={{ fontSize:12, color:"#1EB788", textDecoration:"none" }}>всі →</a>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {goals.map(g => (
          <a key={g.name} href="/goals" style={{ textDecoration:"none", background:"#F9FAFB", borderRadius:14, padding:16, border:"1px solid #E8EAF0", display:"block" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{g.emoji}</div>
            <div style={{ fontSize:12, fontWeight:700, color:"#1A2744", marginBottom:2 }}>{g.name}</div>
            <div style={{ fontSize:10, color:"#9CA3AF", marginBottom:9 }}>{g.deadline}</div>
            <div style={{ height:5, background:"#E8EAF0", borderRadius:3, overflow:"hidden", marginBottom:5 }}>
              <div style={{ height:"100%", width:g.pct+"%", background:g.color, borderRadius:3 }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10 }}>
              <span style={{ fontWeight:700, color:g.color }}>{g.pct}%</span>
              <span style={{ color:"#9CA3AF" }}>ще {g.left}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
