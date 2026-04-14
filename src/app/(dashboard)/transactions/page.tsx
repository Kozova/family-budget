"use client";

const txs = [
  { id:1, date:"13.04", name:"Сільпо", category:"Їжа", member:"Марія", amount:-840, currency:"UAH" },
  { id:2, date:"12.04", name:"Електроенергія", category:"Комунальні", member:"Олексій", amount:-1230, currency:"UAH" },
  { id:3, date:"10.04", name:"Зарплата", category:"Дохід", member:"Олексій", amount:24000, currency:"UAH" },
  { id:4, date:"09.04", name:"Бензин", category:"Транспорт", member:"Олексій", amount:-650, currency:"UAH" },
  { id:5, date:"08.04", name:"Аптека", category:"Здоровя", member:"Марія", amount:-420, currency:"UAH" },
  { id:6, date:"07.04", name:"Netflix", category:"Підписки", member:"-", amount:-199, currency:"UAH" },
  { id:7, date:"05.04", name:"Фріланс", category:"Дохід", member:"Марія", amount:8000, currency:"UAH" },
  { id:8, date:"04.04", name:"Кафе", category:"Ресторани", member:"Аліна", amount:-380, currency:"UAH" },
];

const catColors: Record<string, { bg: string; color: string }> = {
  "Їжа":       { bg:"#E1F5EE", color:"#0F6E56" },
  "Комунальні": { bg:"#E6F1FB", color:"#185FA5" },
  "Дохід":     { bg:"#E1F5EE", color:"#0F6E56" },
  "Транспорт": { bg:"#FAEEDA", color:"#854F0B" },
  "Здоровя":   { bg:"#FCEBEB", color:"#A32D2D" },
  "Підписки":  { bg:"#EEEDFE", color:"#534AB7" },
  "Ресторани": { bg:"#FAEEDA", color:"#854F0B" },
};

export default function TransactionsPage() {
  return (
    <div>
      <div style={{ display:"flex", gap:9, marginBottom:16, flexWrap:"wrap" }}>
        {["Всі категорії","Всі учасники","Доходи і витрати","Квітень 2026"].map(f => (
          <select key={f} defaultValue={f} style={{ border:"1.5px solid #E8EAF0", borderRadius:8, padding:"8px 12px", fontSize:13, background:"#fff", color:"#1A2744", cursor:"pointer", outline:"none" }}>
            <option>{f}</option>
          </select>
        ))}
      </div>
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #F0F2F5" }}>
              {["Дата","Опис","Категорія","Учасник","Сума",""].map(h => (
                <th key={h} style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, textAlign:"left", padding:"10px 16px", letterSpacing:"0.04em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txs.map(tx => {
              const cat = catColors[tx.category] || { bg:"#F0F2F5", color:"#6B7280" };
              return (
                <tr key={tx.id} style={{ borderBottom:"1px solid #F5F5F8", cursor:"pointer", transition:"background .12s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"#9CA3AF", whiteSpace:"nowrap" }}>{tx.date}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"#1A2744", fontWeight:500 }}>{tx.name}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, background:cat.bg, color:cat.color }}>{tx.category}</span>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"#6B7280" }}>{tx.member}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:tx.amount > 0 ? "#1EB788" : "#E24B4A", whiteSpace:"nowrap" }}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("uk-UA")} {tx.currency}
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:14, color:"#9CA3AF", cursor:"pointer" }}>✏️</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
