"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AddTransactionModal from "@/components/AddTransactionModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  return (
    <div style={{ minHeight:"100vh", background:"#F0F2F5" }}>
      <Sidebar />
      <Topbar onAddClick={() => setModalOpen(true)} />
      <main style={{ marginLeft:230, paddingTop:58 }}>
        <div style={{ padding:24 }}>
          {children}
        </div>
      </main>
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setRefresh(r => r + 1); setModalOpen(false); }}
      />
    </div>
  );
}