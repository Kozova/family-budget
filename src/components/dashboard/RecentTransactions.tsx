
const txs = [
  { ico:"🛒", name:"Сільпо", cat:"Їжа · Марія · 13.04", amt:"-₴ 840", neg:true },
  { ico:"⚡", name:"Електроенергія", cat:"Комунальні · Олексій · 12.04", amt:"-₴ 1 230", neg:true },
  { ico:"💼", name:"Зарплата", cat:"Дохід · Олексій · 10.04", amt:"+₴ 24 000", neg:false },
  { ico:"🚗", name:"Бензин", cat:"Транспорт · Олексій · 09.04", amt:"-₴ 650", neg:true },
  { ico:"💊", name:"Аптека", cat:"Здоров я · Марія · 08.04", amt:"-₴ 420", neg:true },
];
export default function RecentTransactions() {
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#1A2744" }}>Останні транзакції</div>
        <a href="/transactions" style={{ fontSize:12, color:"#1EB788", textDecoration:"none" }}>всі →</a>
      </div>
      {txs.map(tx => (
        <div key={tx.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 6px", borderBottom:"1px solid #F5F5F8", borderRadius:8 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"#F0F2F5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{tx.ico}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:"#1A2744", fontWeight:500 }}>{tx.name}</div>
            <div style={{ fontSize:11, color:"#9CA3AF" }}>{tx.cat}</div>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:tx.neg?"#E24B4A":"#1EB788", whiteSpace:"nowrap" }}>{tx.amt}</div>
        </div>
      ))}
    </div>
  );
}
