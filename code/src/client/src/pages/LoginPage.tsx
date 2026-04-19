import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(uid, pwd);
      navigate("/");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏕️ Team Outing Planner</h1>
        <p style={styles.subtitle}>DLMS Polyglot Edition · PostgreSQL + OpenSearch</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input style={styles.input} value={uid} onChange={e => setUid(e.target.value)} autoComplete="username" required />
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={pwd} onChange={e => setPwd(e.target.value)} autoComplete="current-password" required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div style={styles.hint}>
          <strong>Demo accounts</strong><br/>
          admin / pw &nbsp;·&nbsp; requestor / pw &nbsp;·&nbsp; reviewer / pw
        </div>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" },
  card: { background: "#fff", padding: "2.5rem", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,.1)", width: "100%", maxWidth: "400px" },
  title: { margin: "0 0 .25rem", fontSize: "1.6rem", color: "#1a202c" },
  subtitle: { margin: "0 0 2rem", fontSize: ".85rem", color: "#718096" },
  form: { display: "flex", flexDirection: "column", gap: ".75rem" },
  label: { fontSize: ".85rem", fontWeight: 600, color: "#4a5568" },
  input: { padding: ".6rem .9rem", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "1rem" },
  error: { color: "#e53e3e", fontSize: ".85rem", margin: "0" },
  button: { padding: ".75rem", background: "#3182ce", color: "#fff", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginTop: ".5rem" },
  hint: { marginTop: "1.5rem", padding: "1rem", background: "#ebf8ff", borderRadius: "6px", fontSize: ".82rem", color: "#2b6cb0", lineHeight: 1.7 },
};
