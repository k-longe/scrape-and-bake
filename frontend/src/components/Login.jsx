import { useState } from "react";
import { signIn } from "../lib/auth";

const DARK = {
  bg: "#1c1111", surface: "#2f1c1c", surfaceAlt: "#392322",
  border: "#6f4d45", text: "#fff7ee", textMid: "#efd9c6",
  textMuted: "#caa88f", navy: "#243249", accent: "#ef476f", accentBg: "#512433", butter: "#ffd166",
};
const LIGHT = {
  bg: "#f7ead8", surface: "#fffaf2", surfaceAlt: "#fff1dd",
  border: "#d9b99c", text: "#2c1810", textMid: "#674636",
  textMuted: "#8d6b5a", navy: "#22324f", accent: "#d64067", accentBg: "#ffe2eb", butter: "#f2b940",
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
    <div style={{ width: "100%", height: "100vh", background: `radial-gradient(circle at top left, ${dark ? "rgba(255,209,102,0.16)" : "rgba(255,209,102,0.24)"} 0%, transparent 28%), linear-gradient(180deg, ${T.bg} 0%, ${dark ? "#251616" : "#fff1df"} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", padding: 18 }}>
      <div style={{ width: 440, maxWidth: "100%", background: `linear-gradient(180deg, ${T.surface} 0%, ${T.surfaceAlt} 100%)`, border: `1px solid ${T.border}`, borderRadius: 24, padding: "34px 32px", boxShadow: dark ? "0 28px 70px rgba(0,0,0,0.44)" : "0 18px 44px rgba(79,48,24,0.15)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy} 0%, ${T.accent} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.butter, boxShadow: "0 0 0 4px rgba(255,255,255,0.16)" }} />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 0.4, color: T.text, fontFamily: "var(--font-display)" }}>Scrape &amp; Bake</div>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 1.2, textTransform: "uppercase" }}>Cookie ingredient supply-chain demo</div>
          </div>
        </div>
        <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
          A playful demo of source collection, ingredient evidence, provenance, and supply-chain networks.
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
            style={{ width: "100%", background: dark ? "rgba(255,255,255,0.04)" : "#fffdf9", border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
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
            style={{ width: "100%", background: dark ? "rgba(255,255,255,0.04)" : "#fffdf9", border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
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
          style={{ width: "100%", background: `linear-gradient(135deg, ${T.accent} 0%, ${T.navy} 100%)`, border: "none", borderRadius: 16, padding: "13px", color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: 1.1, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s, transform 0.15s", boxShadow: "0 12px 24px rgba(0,0,0,0.16)" }}>
          {loading ? "SIGNING IN…" : "ENTER THE DEMO"}
        </button>

        <div style={{ color: T.textMuted, fontSize: 11, textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
          Demo access uses a local mock session.<br />Any email and password will open the synthetic public-demo workspace.
        </div>
      </div>
    </div>
  );
}
