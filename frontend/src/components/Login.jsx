import { useState } from "react";
import { signIn } from "../lib/auth";

const DARK = {
  bg: "#070b10", surface: "#0a0e14", surfaceAlt: "#0f1520",
  border: "#1a2233", text: "#cdd6e8", textMid: "#7a90a8",
  textMuted: "#4a6080", navy: "#0f1f35", accent: "#007aff", accentBg: "#0f2040",
};
const LIGHT = {
  bg: "#f2f0eb", surface: "#ffffff", surfaceAlt: "#f8f6f2",
  border: "#e0dbd2", text: "#18150f", textMid: "#52493c",
  textMuted: "#96897a", navy: "#1b2d4f", accent: "#1b56a5", accentBg: "#eaf0fb",
};

export default function Login({ dark, onLogin }) {
  const T = dark ? DARK : LIGHT;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please enter both email and password."); return; }
    setLoading(true);
    setError("");
    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onLogin(result.data?.session || null);
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
      <div style={{ width: 400, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "40px 40px", boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,0,0,0.1)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: dark ? "#ff3b30" : "#ef4444" }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2.5, color: T.text }}>SCRAPE &amp; BAKE</div>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1 }}>COOKIE INGREDIENT SUPPLY CHAIN DEMO</div>
          </div>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 7 }}>EMAIL</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="your@email.com"
            style={{ width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", color: T.text, fontSize: 13, fontFamily: "Georgia,serif", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 7 }}>PASSWORD</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••"
            style={{ width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", color: T.text, fontSize: 13, fontFamily: "Georgia,serif", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {error && (
          <div style={{ background: dark ? "#2a0a08" : "#fef2f2", border: `1px solid ${dark ? "#ff3b30" : "#b91c1c"}`, color: dark ? "#ff3b30" : "#b91c1c", padding: "10px 14px", borderRadius: 6, fontSize: 12, marginBottom: 18 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", background: T.accent, border: "none", borderRadius: 7, padding: "12px", color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, fontFamily: "Georgia,serif", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s" }}>
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>

        <div style={{ color: T.textMuted, fontSize: 10, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          Demo access uses a local mock session.<br />Any email and password will open the workspace.
        </div>
      </div>
    </div>
  );
}
