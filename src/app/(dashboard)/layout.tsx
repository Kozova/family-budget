'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#F0F2F5' }}>
      <Sidebar />
      <Topbar onAddClick={() => setAddOpen(true)} />
      <main
        className="pt-[58px]"
        style={{ marginLeft: '230px' }}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Модалка "Додати запис" — поки просто заглушка */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setAddOpen(false)}>
          <div
            className="bg-white rounded-[16px] p-6 w-[480px]"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-[16px] font-bold text-[#1A2744] mb-4">
              Нова транзакція
            </div>
            <p className="text-[13px] text-[#9CA3AF]">Форма буде тут — робимо далі!</p>
            <button
              onClick={() => setAddOpen(false)}
              className="mt-4 text-[13px] text-[#6B7280] hover:text-[#1A2744]">
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}