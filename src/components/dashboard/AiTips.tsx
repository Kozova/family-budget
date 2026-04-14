
const tips = [
  { ico:"💡", title:"Їжа зросла на 23%", text:"Витратили на 1400 грн більше. Плануйте меню — заощаджуйте до 20%.", warn:false },
  { ico:"🎯", title:"До відпустки 4 місяці", text:"Відкладайте 2050 грн/міс і встигнете вчасно.", warn:false },
  { ico:"⚠️", title:"Слідкуйте за темпом", text:"17 днів до кінця місяця. Тримайте до 838 грн/день.", warn:true },
];
export default function AiTips() {
  return (
    <div style={{ background:"#fff", borderRadius:16, padding:20, border:"1px solid #E8EAF0", boxShadow:"0 2px 8px rgba(26,39,68,.06)" }}>
      <div style={{ fontSize:13, fontWeight:700, color:"#1A2744", marginBottom:14 }}>Поради від ШІ</div>
      {tips.map(tip => (
        <div key={tip.title} style={{ borderRadius:10, padding:"11px 13px", display:"flex", gap:9, marginBottom:8, borderLeft:"3px solid "+(tip.warn?"#EF9F27":"#1EB788"), background:tip.warn?"#FFFBEF":"#F0FBF7" }}>
          <div style={{ fontSize:15, flexShrink:0 }}>{tip.ico}</div>
          <div style={{ fontSize:12, color:tip.warn?"#633806":"#085041", lineHeight:1.55 }}>
            <div style={{ fontWeight:700, marginBottom:2 }}>{tip.title}</div>
            {tip.text}
          </div>
        </div>
      ))}
    </div>
  );
}
