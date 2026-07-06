import { useState } from "react";
import { signIn } from "../lib/auth";

const DARK = {
  bg: "#2b170f", surface: "#43251a", surfaceAlt: "#5a3223",
  border: "#a15b41", text: "#fff7ee", textMid: "#f4dcc2",
  textMuted: "#d9b395", navy: "#3856b5", accent: "#ff6f9f", accentBg: "#6a2742", butter: "#ffd166",
};
const LIGHT = {
  bg: "#fff7eb", surface: "#fffdf6", surfaceAlt: "#ffe9b7",
  border: "#f1a45b", text: "#2d1810", textMid: "#684231",
  textMuted: "#8a5c45", navy: "#233d8b", accent: "#e94b7f", accentBg: "#ffd5e3", butter: "#ffd166",
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
    <div style={{ width: "100%", height: "100vh", background: dark ? `radial-gradient(circle at top left, rgba(255,209,102,0.12) 0%, transparent 28%), linear-gradient(180deg, ${T.bg} 0%, #351d13 100%)` : "radial-gradient(circle at top left, rgba(255,209,102,0.34) 0%, transparent 28%), radial-gradient(circle at 82% 18%, rgba(233,75,127,0.18) 0%, transparent 24%), linear-gradient(180deg, #fff7eb 0%, #fff1d8 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", padding: 18 }}>
      <div style={{ width: 460, maxWidth: "100%", background: T.surface, border: `4px solid ${T.border}`, borderRadius: 34, padding: "36px 34px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: -24, right: -18, width: 110, height: 110, borderRadius: "50%", background: dark ? "rgba(255,111,159,0.14)" : "rgba(233,75,127,0.16)" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -30, left: -22, width: 120, height: 120, borderRadius: "50%", background: dark ? "rgba(255,209,102,0.14)" : "rgba(255,209,102,0.18)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, position: "relative" }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, background: `linear-gradient(135deg, ${T.navy} 0%, ${T.accent} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `4px solid ${T.butter}` }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: T.butter, border: `4px solid ${dark ? T.surface : "#fffdf6"}` }} />
          </div>
          <div>
            <div style={{ fontSize: 38, fontWeight: 800, color: T.text, fontFamily: "var(--font-display)", lineHeight: 0.95 }}>Scrape &amp; Bake</div>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 6 }}>Cookie ingredient supply-chain demo</div>
          </div>
        </div>
        <div style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6, marginBottom: 18, position: "relative" }}>
          A playful demo of source collection, ingredient evidence, provenance, and supply-chain networks.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, position: "relative" }}>
          {[
            ["Synthetic data", T.accentBg, T.accent],
            ["Ingredient networks", dark ? "#2f5a37" : "#d8efc8", dark ? "#98dd95" : "#4f8d56"],
            ["Scrape history", dark ? "#6c3720" : "#f6d2bb", dark ? "#ff9b55" : "#7b3f2a"],
          ].map(([label, bg, color]) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", padding: "7px 11px", borderRadius: 999, background: bg, color, border: `3px solid ${color}`, fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {label}
            </span>
          ))}
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 7 }}>EMAIL</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="your@email.com"
            style={{ width: "100%", background: dark ? "rgba(255,255,255,0.04)" : "#fffaf0", border: `3px solid ${T.border}`, borderRadius: 999, padding: "13px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 24, position: "relative" }}>
          <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 7 }}>PASSWORD</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••"
            style={{ width: "100%", background: dark ? "rgba(255,255,255,0.04)" : "#fffaf0", border: `3px solid ${T.border}`, borderRadius: 999, padding: "13px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
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
          style={{ width: "100%", background: `linear-gradient(135deg, ${T.accent} 0%, ${T.navy} 100%)`, border: `4px solid ${T.butter}`, borderRadius: 999, padding: "14px", color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: 1.1, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s, transform 0.15s", position: "relative" }}>
          {loading ? "SIGNING IN…" : "ENTER THE DEMO"}
        </button>

        <div style={{ color: T.textMuted, fontSize: 11, textAlign: "center", marginTop: 18, lineHeight: 1.6, position: "relative" }}>
          Demo access uses a local mock session.<br />Any email and password will open the synthetic public-demo workspace.
        </div>
      </div>
    </div>
  );
}
