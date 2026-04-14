'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { section: 'Головне', items: [
    { href: '/', icon: '📊', label: 'Дашборд' },
    { href: '/transactions', icon: '📋', label: 'Транзакції' },
  ]},
  { section: 'Планування', items: [
    { href: '/goals', icon: '🎯', label: 'Цілі' },
    { href: '/recurring', icon: '🔁', label: 'Регулярні' },
  ]},
  { section: 'Аналіз', items: [
    { href: '/analytics', icon: '📈', label: 'Статистика' },
  ]},
  { section: 'Налаштування', items: [
    { href: '/categories', icon: '🏷️', label: 'Категорії' },
    { href: '/settings', icon: '⚙️', label: 'Налаштування' },
  ]},
];

const members = [
  { initials: 'ОІ', name: 'Олексій (адмін)', color: '#1EB788' },
  { initials: 'МІ', name: 'Марія', color: '#378ADD' },
  { initials: 'АІ', name: 'Аліна', color: '#EF9F27' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar-scroll" style={{ position:'fixed', top:0, left:0, height:'100vh', width:230, background:'linear-gradient(180deg,#1E2F52 0%,#152035 100%)', boxShadow:'2px 0 16px rgba(0,0,0,.12)', display:'flex', flexDirection:'column', overflowY:'auto', zIndex:20 }}>
      <div style={{ padding:'22px 18px 18px', borderBottom:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34, height:34, background:'#1EB788', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>💰</div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>Гаманець</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginTop:2 }}>сімейний бюджет</div>
        </div>
      </div>
      <nav style={{ flex:1, paddingTop:8 }}>
        {nav.map(({ section, items }) => (
          <div key={section}>
            <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,.3)', padding:'12px 18px 5px' }}>{section}</div>
            {items.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', fontSize:13, borderLeft: active ? '3px solid #1EB788' : '3px solid transparent', background: active ? 'rgba(30,183,136,.13)' : 'transparent', color: active ? '#1EB788' : 'rgba(255,255,255,.6)', fontWeight: active ? 700 : 400, marginRight: active ? 10 : 0, borderRadius: active ? '0 8px 8px 0' : 0, textDecoration:'none', transition:'all .15s' }}>
                  <span style={{ fontSize:15, width:20, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,.08)' }}>
        <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,.28)', marginBottom:8 }}>Сімʼя Іванченко</div>
        {members.map(m => (
          <div key={m.initials} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0' }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#fff', flexShrink:0 }}>{m.initials}</div>
            <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{m.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
