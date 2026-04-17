"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface FamilyMember {
  id: string;
  full_name: string | null;
  role: string;
}

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [editingFamily, setEditingFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [inviting, setInviting] = useState(false);
  const [savingFamily, setSavingFamily] = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, family_id, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      setName(profile.full_name || "");
      setFamilyId(profile.family_id);

      if (profile.family_id) {
        const { data: family } = await supabase
          .from("families")
          .select("name")
          .eq("id", profile.family_id)
          .single();
        if (family) {
          setFamilyName(family.name);
          setNewFamilyName(family.name);
        }

        const { data: mems } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("family_id", profile.family_id);
        setMembers(mems || []);
      }
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, full_name: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateFamily = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: family } = await supabase
      .from("families")
      .insert({ name: newFamilyName || "Моя сімя", created_by: user.id })
      .select()
      .single();
    if (family) {
      await supabase.from("profiles").upsert({ id: user.id, family_id: family.id, role: "admin" });
      setFamilyId(family.id);
      load();
    }
  };

  const handleSaveFamilyName = async () => {
    if (!familyId || !newFamilyName) return;
    setSavingFamily(true);
    await supabase.from("families").update({ name: newFamilyName }).eq("id", familyId);
    setFamilyName(newFamilyName);
    setEditingFamily(false);
    setSavingFamily(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Видалити цього учасника з сімї?")) return;
    await supabase.from("profiles").update({ family_id: null, role: "member" }).eq("id", memberId);
    load();
  };

  const handleInvite = async () => {
    if (!inviteEmail || !familyId) return;
    setInviting(true);
    const { data } = await supabase
      .from("invitations")
      .insert({ family_id: familyId, email: inviteEmail })
      .select()
      .single();
    if (data) {
      const link = `${window.location.origin}/join?token=${data.token}`;
      setInviteToken(link);
      setInviteEmail("");
    }
    setInviting(false);
  };

  const COLORS = ["#1EB788", "#378ADD", "#EF9F27", "#E24B4A", "#9B59B6"];

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Профіль */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2744", marginBottom: 18 }}>Профіль</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Email</div>
          <input value={email} disabled style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#9CA3AF", background: "#F9FAFB" }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Імя</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше імя" style={{ width: "100%", border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
        </div>
        <button onClick={handleSaveProfile} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {saved ? "Збережено ✓" : "Зберегти"}
        </button>
      </div>

      {/* Сімя */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2744", marginBottom: 18 }}>Сімя</div>

        {!familyId ? (
          <div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>Ви ще не створили сімю. Створіть щоб запросити членів!</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} placeholder="Назва сімї (напр. Іванченки)" style={{ flex: 1, border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
              <button onClick={handleCreateFamily} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Створити</button>
            </div>
          </div>
        ) : (
          <div>
            {/* Назва сімї з редагуванням */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Назва сімї</div>
              {editingFamily ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} style={{ flex: 1, border: "1.5px solid #1EB788", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
                  <button onClick={handleSaveFamilyName} disabled={savingFamily} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {savingFamily ? "..." : "Зберегти"}
                  </button>
                  <button onClick={() => setEditingFamily(false)} style={{ border: "1.5px solid #E8EAF0", background: "#fff", borderRadius: 10, padding: "10px 14px", fontSize: 13, cursor: "pointer", color: "#6B7280" }}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#1A2744", background: "#F9FAFB" }}>{familyName}</div>
                  <button onClick={() => setEditingFamily(true)} style={{ border: "1.5px solid #E8EAF0", background: "#fff", borderRadius: 10, padding: "10px 14px", fontSize: 13, cursor: "pointer", color: "#6B7280" }}>✏️ Редагувати</button>
                </div>
              )}
            </div>

            {/* Члени сімї */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 10, fontWeight: 600, textTransform: "uppercase" }}>Члени сімї ({members.length})</div>
              {members.map((m, i) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F5F5F8" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS[i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    {(m.full_name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#1A2744" }}>{m.full_name || "Без імені"}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.role === "admin" ? "Адміністратор" : "Учасник"}</div>
                  </div>
                  {m.role !== "admin" && (
                    <button onClick={() => handleRemoveMember(m.id)} style={{ background: "none", border: "1.5px solid #E8EAF0", borderRadius: 7, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#E24B4A" }}>
                      Видалити
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Запросити */}
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Запросити члена сімї</div>
            <div style={{ display: "flex", gap: 8, marginBottom: inviteToken ? 12 : 0 }}>
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@example.com" style={{ flex: 1, border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
              <button onClick={handleInvite} disabled={inviting} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {inviting ? "..." : "Запросити"}
              </button>
            </div>
            {inviteToken && (
              <div style={{ background: "#E1F5EE", borderRadius: 10, padding: 12, fontSize: 12, color: "#0F6E56", cursor: "pointer" }} onClick={() => { navigator.clipboard.writeText(inviteToken); }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Посилання для запрошення (натисніть щоб скопіювати):</div>
                <div style={{ wordBreak: "break-all" }}>{inviteToken}</div>
                <div style={{ marginTop: 6, color: "#6B7280" }}>Відправте це посилання члену сімї у Viber/Telegram</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Про застосунок */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2744", marginBottom: 4 }}>Про застосунок</div>
        <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Сімейний гаманець v1.0</div>
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
          Застосунок для ведення сімейного бюджету. Відстежуйте доходи та витрати, плануйте цілі накопичень, аналізуйте фінансову статистику.
        </div>
      </div>
    </div>
  );
}