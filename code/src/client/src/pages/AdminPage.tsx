import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userGroups, admin, UserGroup } from "../api";

export default function AdminPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [selected, setSelected] = useState<string>("Reviewer");
  const [newEmail, setNewEmail] = useState("");
  const [health, setHealth] = useState<{ pg: boolean; os: boolean } | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const g = await userGroups.list();
    setGroups(g.items);
    const h = await admin.health();
    setHealth(h);
  };

  useEffect(() => { load(); }, []);

  const currentGroup = groups.find(g => g.id === selected);

  const addMember = async () => {
    if (!newEmail.trim()) return;
    const members = [...(currentGroup?.members ?? []), {
      email: newEmail.trim(), name: newEmail.trim(),
      department: "", title: "", employeeNumber: "",
    }];
    await userGroups.update(selected, members);
    setNewEmail("");
    load();
  };

  const removeMember = async (email: string) => {
    const members = (currentGroup?.members ?? []).filter(m => m.email !== email);
    await userGroups.update(selected, members);
    load();
  };

  const reindex = async () => {
    setMsg("Reindexing…");
    try { await admin.reindex(); setMsg("✅ Reindex complete"); }
    catch { setMsg("❌ Reindex failed"); }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.back} onClick={() => navigate("/")}>← Dashboard</button>
        <h2 style={{ margin: 0, color: "#fff" }}>Administrator</h2>
      </header>

      <div style={styles.body}>
        {/* Health panel */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>System Health</h3>
          <div style={styles.healthRow}>
            <Indicator label="PostgreSQL (System of Record)" ok={health?.pg} />
            <Indicator label="OpenSearch (Search Layer)" ok={health?.os} />
          </div>
          <button style={styles.reindexBtn} onClick={reindex}>Rebuild Search Index</button>
          {msg && <p style={{ marginTop: ".75rem", color: "#2b6cb0", fontSize: ".9rem" }}>{msg}</p>}
        </section>

        {/* User group management */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Manage User Groups</h3>
          <div style={styles.groupSelect}>
            <label style={styles.label}>Group Name</label>
            <select style={styles.select} value={selected} onChange={e => setSelected(e.target.value)}>
              {groups.map(g => <option key={g.id} value={g.id}>{g.id}</option>)}
            </select>
          </div>

          <div style={styles.memberList}>
            {(currentGroup?.members ?? []).map(m => (
              <div key={m.email} style={styles.memberRow}>
                <span>👤 {m.email}</span>
                <button style={styles.removeBtn} onClick={() => removeMember(m.email)}>✕ Remove</button>
              </div>
            ))}
            {(currentGroup?.members?.length ?? 0) === 0 && (
              <p style={{ color: "#718096", fontSize: ".9rem" }}>No members in this group.</p>
            )}
          </div>

          <div style={styles.addRow}>
            <input
              style={styles.input}
              placeholder="Email of new member to add to group"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addMember()}
            />
            <button style={styles.addBtn} onClick={addMember}>+ Add</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Indicator({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".5rem" }}>
      <span style={{ fontSize: "1.3rem" }}>{ok ? "🟢" : ok === false ? "🔴" : "⚪"}</span>
      <span style={{ fontSize: ".9rem", color: "#4a5568" }}>{label}</span>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", background: "#f7fafc", fontFamily: "system-ui, sans-serif" },
  header: { display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.2rem 2rem", background: "#2d3748" },
  back: { background: "transparent", border: "1px solid #718096", color: "#e2e8f0", borderRadius: "6px", padding: ".4rem .8rem", cursor: "pointer" },
  body: { maxWidth: "800px", margin: "2rem auto", padding: "0 2rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
  card: { background: "#fff", borderRadius: "10px", padding: "1.8rem", boxShadow: "0 1px 6px rgba(0,0,0,.08)" },
  cardTitle: { marginTop: 0, fontSize: "1.1rem", color: "#2d3748" },
  healthRow: { marginBottom: "1rem" },
  reindexBtn: { background: "#553c9a", color: "#fff", border: "none", borderRadius: "6px", padding: ".6rem 1.4rem", fontWeight: 600, cursor: "pointer" },
  groupSelect: { marginBottom: "1.2rem" },
  label: { display: "block", fontWeight: 600, fontSize: ".85rem", color: "#4a5568", marginBottom: ".4rem" },
  select: { padding: ".6rem .9rem", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: ".95rem", width: "100%" },
  memberList: { marginBottom: "1.2rem", minHeight: "60px" },
  memberRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".6rem .8rem", background: "#f7fafc", borderRadius: "6px", marginBottom: ".4rem" },
  removeBtn: { background: "#e53e3e", color: "#fff", border: "none", borderRadius: "4px", padding: ".3rem .7rem", cursor: "pointer", fontSize: ".82rem" },
  addRow: { display: "flex", gap: ".75rem" },
  input: { flex: 1, padding: ".6rem .9rem", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: ".95rem" },
  addBtn: { background: "#38a169", color: "#fff", border: "none", borderRadius: "6px", padding: ".6rem 1.2rem", fontWeight: 700, cursor: "pointer" },
};
