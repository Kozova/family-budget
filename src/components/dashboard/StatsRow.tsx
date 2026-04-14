export default function StatsRow() {
  const stats = [
    { label: 'Доходи за квітень', value: '₴ 34 000', badge: '+8%', badgeType: 'up', sub: 'до березня' },
    { label: 'Витрати за квітень', value: '₴ 19 750', badge: '+3%', badgeType: 'dn', sub: 'до березня', red: true },
    { label: 'Накопичення', value: '₴ 8 400', sub: '3 активних цілі' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #E8EAF0', boxShadow: '0 2px 8px rgba(26,39,68,.06)', transition: 'border-color .15s' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: 6 }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: s.red ? '#E24B4A' : '#1A2744' }}>{s.value}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            {s.badge && (
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700, background: s.badgeType === 'up' ? '#E1F5EE' : '#FCEBEB', color: s.badgeType === 'up' ? '#0F6E56' : '#A32D2D' }}>
                {s.badge}
              </span>
            )}
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
