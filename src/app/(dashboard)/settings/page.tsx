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
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [inviting, setInviting] = useState(false);
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
        if (family) setFamilyName(family.name);

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
      .insert({ name: familyName || "Моя сімя", created_by: user.id })
      .select()
      .single();
    if (family) {
      await supabase.from("profiles").upsert({ id: user.id, family_id: family.id, role: "admin" });
      setFamilyId(family.id);
      load();
    }
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

  return (
    <div style={{ maxWidth: 560 }}>
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

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #E8EAF0", boxShadow: "0 2px 8px rgba(26,39,68,.06)", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2744", marginBottom: 18 }}>Сімя</div>
        {!familyId ? (
          <div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>Ви ще не створили сімю. Створіть щоб запросити членів!</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="Назва сімї (напр. Іванченки)" style={{ flex: 1, border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
              <button onClick={handleCreateFamily} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Створити
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
              Сімя: <strong style={{ color: "#1A2744" }}>{familyName}</strong> · {members.length} членів
            </div>
            {members.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {members.map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F5F5F8" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1EB788", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      {(m.full_name || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, fontSize: 13, color: "#1A2744" }}>{m.full_name || "Без імені"}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.role === "admin" ? "Адмін" : "Учасник"}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 8, textTransform: "uppercase" }}>Запросити члена сімї</div>
            <div style={{ display: "flex", gap: 8, marginBottom: inviteToken ? 12 : 0 }}>
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@example.com" style={{ flex: 1, border: "1.5px solid #E8EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#1A2744" }} />
              <button onClick={handleInvite} disabled={inviting} style={{ background: "#1EB788", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {inviting ? "..." : "Запросити"}
              </button>
            </div>
            {inviteToken && (
              <div style={{ background: "#E1F5EE", borderRadius: 10, padding: 12, fontSize: 12, color: "#0F6E56" }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Посилання для запрошення:</div>
                <div style={{ wordBreak: "break-all", cursor: "pointer" }} onClick={() => navigator.clipboard.writeText(inviteToken)}>
                  {inviteToken}
                </div>
                <div style={{ marginTop: 6, color: "#6B7280" }}>Натисніть щоб скопіювати · Відправте це посилання члену сімї</div>
              </div>
            )}
          </div>
        )}
      </div>

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