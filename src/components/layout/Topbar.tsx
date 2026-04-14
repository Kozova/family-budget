'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/': 'Дашборд',
  '/transactions': 'Транзакції',
  '/goals': 'Цілі накопичень',
  '/recurring': 'Регулярні платежі',
  '/analytics': 'Статистика',
  '/categories': 'Управління категоріями',
  '/settings': 'Налаштування',
};

export default function Topbar({ onAddClick }: { onAddClick: () => void }) {
  const pathname = usePathname();
  const title = titles[pathname] || 'Дашборд';

  return (
    <header
      className="fixed top-0 right-0 z-10 flex items-center justify-between px-6 bg-white border-b border-[#E8EAF0]"
      style={{
        left: '230px',
        height: '58px',
        boxShadow: '0 1px 6px rgba(26,39,68,.06)',
      }}>

      <h1 className="text-[15px] font-bold text-[#1A2744] tracking-[0.01em]">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Навігація по місяцях */}
        <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
          <button className="w-[26px] h-[26px] border-[1.5px] border-[#E8EAF0] rounded-[6px] bg-[#F9FAFB] flex items-center justify-center hover:bg-[#F0F2F5] transition-colors">
            ‹
          </button>
          <span className="font-600 text-[#1A2744] font-semibold">Квітень 2026</span>
          <button className="w-[26px] h-[26px] border-[1.5px] border-[#E8EAF0] rounded-[6px] bg-[#F9FAFB] flex items-center justify-center hover:bg-[#F0F2F5] transition-colors">
            ›
          </button>
        </div>

        {/* Кнопка додати */}
        <button
          onClick={onAddClick}
          className="flex items-center gap-[7px] px-5 h-[40px] text-[13px] font-bold text-white rounded-[12px] transition-all duration-150"
          style={{
            background: '#1EB788',
            boxShadow: '0 2px 8px rgba(30,183,136,.3)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#18a87c';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(30,183,136,.4)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1EB788';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(30,183,136,.3)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}>
          ＋ Додати запис
        </button>
      </div>
    </header>
  );
}