import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { docs, TeamOuting, DocList } from "../api";

const TABS = ["Needs Action", "All Requests", "My Requests", "Completed"];
const TERMINAL = ["approved", "cancelled", "closed"];
const NEEDS_ACTION_STATES: Record<string, string[]> = {
  admin: ["submitted"],
  reviewer: ["submitted"],
  requestor: ["draft"],
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [all, setAll] = useState<TeamOuting[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result: DocList<TeamOuting> = await docs.list();
      setAll(result.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useCallback(() => {
    let items = all;
    const q = search.toLowerCase();
    if (q) items = items.filter(d =>
      d.eventName?.toLowerCase().includes(q) ||
      d.location?.toLowerCase().includes(q) ||
      d._state?.toLowerCase().includes(q)
    );
    switch (tab) {
      case 0: { // Needs Action
        const actionStates = user?.isAdmin ? ["submitted"] :
          user?.roles.includes("reviewer") ? ["submitted"] : ["draft"];
        return items.filter(d => actionStates.includes(d._state));
      }
      case 1: return items;
      case 2: return items.filter(d => d.owner?.email === user?.email);
      case 3: return items.filter(d => TERMINAL.includes(d._state));
      default: return items;
    }
  }, [all, tab, search, user]);

  const stateColor: Record<string, string> = {
    draft: "#d69e2e", submitted: "#3182ce", approved: "#38a169",
    cancelled: "#e53e3e", closed: "#718096",
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this request permanently?")) return;
    await docs.delete(id);
    load();
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.logo}>🏕️ Team Outing Planner</span>
        <div style={styles.headerRight}>
          {user?.isAdmin && (
            <button style={styles.navBtn} onClick={() => navigate("/admin")}>Administrator</button>
          )}
          <span style={styles.userBadge}>{user?.name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.toolbar}>
          <button style={styles.newBtn} onClick={() => navigate("/request/new")}>
            + NEW TEAM-OUTING REQUEST
          </button>
          <input
            style={styles.search}
            placeholder="Search requests…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.tabs}>
          {TABS.map((t, i) => (
            <button key={t} style={{ ...styles.tab, ...(tab === i ? styles.activeTab : {}) }} onClick={() => setTab(i)}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.empty}>Loading…</p>
        ) : filtered().length === 0 ? (
          <p style={styles.empty}>No requests found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Event Name", "Date", "Location", "Cost", "State", "Actions"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered().map(d => (
                <tr key={d._id} style={styles.tr}>
                  <td style={styles.td}>{d.eventName}</td>
                  <td style={styles.td}>{d.eventDate}</td>
                  <td style={styles.td}>{d.location}</td>
                  <td style={styles.td}>${d.estimatedCost?.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: stateColor[d._state] ?? "#718096" }}>
                      {d._state}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.iconBtn} title="Edit" onClick={() => navigate(`/request/${d._id}`)}>✏️</button>
                    {(user?.isAdmin) && (
                      <button style={styles.iconBtn} title="Delete" onClick={() => handleDelete(d._id)}>🗑️</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", background: "#f7fafc", fontFamily: "system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", background: "#2d3748", color: "#fff" },
  logo: { fontWeight: 700, fontSize: "1.1rem" },
  headerRight: { display: "flex", gap: "1rem", alignItems: "center" },
  navBtn: { background: "transparent", border: "1px solid #90cdf4", color: "#90cdf4", borderRadius: "6px", padding: ".4rem .9rem", cursor: "pointer" },
  userBadge: { fontSize: ".85rem", color: "#e2e8f0" },
  logoutBtn: { background: "#e53e3e", border: "none", color: "#fff", borderRadius: "6px", padding: ".4rem .9rem", cursor: "pointer", fontWeight: 600 },
  main: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem" },
  newBtn: { background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", padding: ".7rem 1.4rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  search: { flex: 1, padding: ".6rem 1rem", border: "1px solid #cbd5e0", borderRadius: "6px", fontSize: ".95rem" },
  tabs: { display: "flex", gap: ".5rem", marginBottom: "1.5rem", borderBottom: "2px solid #e2e8f0" },
  tab: { background: "none", border: "none", padding: ".6rem 1.2rem", cursor: "pointer", color: "#718096", fontWeight: 500, borderBottom: "2px solid transparent", marginBottom: "-2px" },
  activeTab: { color: "#3182ce", borderBottomColor: "#3182ce" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,.08)" },
  th: { padding: ".9rem 1rem", background: "#edf2f7", textAlign: "left", fontSize: ".8rem", fontWeight: 700, color: "#4a5568", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #edf2f7" },
  td: { padding: ".85rem 1rem", fontSize: ".9rem", color: "#2d3748" },
  badge: { display: "inline-block", padding: ".2rem .7rem", borderRadius: "9999px", color: "#fff", fontSize: ".75rem", fontWeight: 700 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", marginRight: ".3rem" },
  empty: { textAlign: "center", color: "#718096", padding: "3rem" },
};
