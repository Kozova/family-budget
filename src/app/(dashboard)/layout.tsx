"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AddTransactionModal from "@/components/AddTransactionModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F5" }}>
      {/* Сайдбар десктоп */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>

      {/* Мобільний оверлей */}
      {sidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 30 }}>
          <div onClick={e => e.stopPropagation()}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <Topbar
        onAddClick={() => setModalOpen(true)}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="main-content" style={{ marginLeft: 230, paddingTop: 58 }}>
        <div style={{ padding: 24 }}>{children}</div>
      </main>

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
}