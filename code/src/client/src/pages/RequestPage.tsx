import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { docs, attachments, TeamOuting } from "../api";

const TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  draft:     [{ label: "Submit Request", next: "submitted", color: "#3182ce" }],
  submitted: [
    { label: "✅ Approve",  next: "approved",  color: "#38a169" },
    { label: "❌ Cancel",   next: "cancelled", color: "#e53e3e" },
  ],
  approved:  [{ label: "Close Request", next: "closed", color: "#718096" }],
};

const EMPTY: Partial<TeamOuting> = {
  eventName: "", eventDate: "", location: "",
  estimatedCost: 0, maxAttendees: 0,
  description: "", planningTopics: "",
};

export default function RequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === "new";

  const [doc, setDoc] = useState<Partial<TeamOuting>>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [atts, setAtts] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    docs.get(id!).then(d => { setDoc(d); setLoading(false); }).catch(() => setLoading(false));
    attachments.list(id!).then(r => setAtts(r.items ?? [])).catch(() => {});
  }, [id, isNew]);

  const canEdit = isNew || doc._state === "draft" || user?.isAdmin;
  const transitions = !isNew ? (TRANSITIONS[doc._state ?? ""] ?? []) : [];

  const save = async () => {
    setSaving(true); setError("");
    try {
      if (isNew) {
        const created = await docs.create({ ...doc, owner: { email: user!.email, name: user!.name } });
        navigate(`/request/${created._id}`);
      } else {
        const updated = await docs.update(id!, doc);
        setDoc(updated);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const transition = async (next: string) => {
    setSaving(true); setError("");
    try {
      const updated = await docs.transition(id!, next);
      setDoc(updated);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Transition failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadAtt = async () => {
    if (!uploadFile || !id) return;
    await attachments.upload(id, uploadFile);
    const r = await attachments.list(id);
    setAtts(r.items ?? []);
    setUploadFile(null);
  };

  const deleteAtt = async (attId: string) => {
    await attachments.delete(id!, attId);
    const r = await attachments.list(id!);
    setAtts(r.items ?? []);
  };

  const field = (k: keyof TeamOuting) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDoc(prev => ({ ...prev, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  if (loading) return <p style={{ padding: "3rem", textAlign: "center" }}>Loading…</p>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.back} onClick={() => navigate("/")}>← Dashboard</button>
        <h2 style={styles.title}>{isNew ? "New Team-Outing Request" : doc.eventName || "Request"}</h2>
        {!isNew && (
          <span style={{ ...styles.badge, background: stateColor(doc._state ?? "") }}>
            {doc._state}
          </span>
        )}
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tabs}>
        {["Event Details", "Planning Topics", "Attachments"].map((t, i) => (
          <button key={t} style={{ ...styles.tab, ...(tab === i ? styles.activeTab : {}) }} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      <div style={styles.body}>
        {tab === 0 && (
          <div style={styles.grid}>
            <Field label="Event Name *" value={doc.eventName} onChange={field("eventName")} disabled={!canEdit} />
            <Field label="Event Date *" type="date" value={doc.eventDate} onChange={field("eventDate")} disabled={!canEdit} />
            <Field label="Location *" value={doc.location} onChange={field("location")} disabled={!canEdit} />
            <Field label="Estimated Cost ($) *" type="number" value={String(doc.estimatedCost ?? "")} onChange={field("estimatedCost")} disabled={!canEdit} />
            <Field label="Max Attendees *" type="number" value={String(doc.maxAttendees ?? "")} onChange={field("maxAttendees")} disabled={!canEdit} />
            <div style={{ gridColumn: "1/-1" }}>
              <label style={styles.label}>Description *</label>
              <textarea style={{ ...styles.input, height: "100px", resize: "vertical" }} value={doc.description} onChange={field("description")} disabled={!canEdit} />
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            <label style={styles.label}>Planning Topics *</label>
            <textarea style={{ ...styles.input, height: "200px", resize: "vertical", width: "100%" }}
              value={doc.planningTopics} onChange={field("planningTopics")} disabled={!canEdit}
              placeholder="List agenda items, logistics, activities…" />
          </div>
        )}

        {tab === 2 && (
          <div>
            <h3 style={{ marginTop: 0 }}>Attachments ({atts.length})</h3>
            {atts.map(a => (
              <div key={a.id} style={styles.attRow}>
                <span>📎 {a.name} ({(a.size / 1024).toFixed(1)} KB)</span>
                <button style={styles.delBtn} onClick={() => deleteAtt(a.id)}>Remove</button>
              </div>
            ))}
            {canEdit && !isNew && (
              <div style={styles.uploadRow}>
                <input type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
                <button style={styles.uploadBtn} onClick={uploadAtt} disabled={!uploadFile}>Upload</button>
              </div>
            )}
          </div>
        )}

        <div style={styles.actions}>
          {canEdit && (
            <button style={styles.saveBtn} onClick={save} disabled={saving}>
              {saving ? "Saving…" : isNew ? "Create Draft" : "Save Changes"}
            </button>
          )}
          {transitions.map(t => (
            <button key={t.next} style={{ ...styles.transBtn, background: t.color }} onClick={() => transition(t.next)} disabled={saving}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled }: any) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: ".3rem", fontWeight: 600, fontSize: ".85rem", color: "#4a5568" }}>{label}</label>
      <input style={{ width: "100%", padding: ".6rem .9rem", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: ".95rem", boxSizing: "border-box", background: disabled ? "#f7fafc" : "#fff" }}
        type={type} value={value ?? ""} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function stateColor(s: string) {
  const map: Record<string, string> = { draft: "#d69e2e", submitted: "#3182ce", approved: "#38a169", cancelled: "#e53e3e", closed: "#718096" };
  return map[s] ?? "#718096";
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", background: "#f7fafc", fontFamily: "system-ui, sans-serif" },
  header: { display: "flex", alignItems: "center", gap: "1rem", padding: "1.2rem 2rem", background: "#2d3748", color: "#fff" },
  back: { background: "transparent", border: "1px solid #718096", color: "#e2e8f0", borderRadius: "6px", padding: ".4rem .8rem", cursor: "pointer" },
  title: { margin: 0, flex: 1, fontSize: "1.2rem" },
  badge: { padding: ".25rem .8rem", borderRadius: "9999px", color: "#fff", fontSize: ".78rem", fontWeight: 700 },
  error: { background: "#fff5f5", border: "1px solid #feb2b2", color: "#c53030", padding: "1rem 2rem", fontSize: ".9rem" },
  tabs: { display: "flex", gap: ".5rem", padding: "0 2rem", background: "#fff", borderBottom: "2px solid #e2e8f0" },
  tab: { background: "none", border: "none", padding: ".8rem 1.2rem", cursor: "pointer", color: "#718096", fontWeight: 500, borderBottom: "2px solid transparent", marginBottom: "-2px" },
  activeTab: { color: "#3182ce", borderBottomColor: "#3182ce" },
  body: { maxWidth: "900px", margin: "2rem auto", padding: "0 2rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" },
  label: { display: "block", marginBottom: ".3rem", fontWeight: 600, fontSize: ".85rem", color: "#4a5568" },
  input: { width: "100%", padding: ".6rem .9rem", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: ".95rem", boxSizing: "border-box" } as React.CSSProperties,
  actions: { display: "flex", gap: "1rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0", flexWrap: "wrap" },
  saveBtn: { background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", padding: ".75rem 1.8rem", fontWeight: 700, cursor: "pointer" },
  transBtn: { color: "#fff", border: "none", borderRadius: "6px", padding: ".75rem 1.8rem", fontWeight: 700, cursor: "pointer" },
  attRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".75rem 1rem", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", marginBottom: ".5rem" },
  delBtn: { background: "#e53e3e", color: "#fff", border: "none", borderRadius: "4px", padding: ".3rem .7rem", cursor: "pointer", fontSize: ".82rem" },
  uploadRow: { display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" },
  uploadBtn: { background: "#38a169", color: "#fff", border: "none", borderRadius: "6px", padding: ".5rem 1.2rem", cursor: "pointer", fontWeight: 600 },
};
