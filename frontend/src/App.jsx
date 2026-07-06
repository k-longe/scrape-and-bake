import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import { supabase } from "./lib/supabaseClient";
import DEMO_DATA from "./data/demoData";
import Login from "./components/Login";
import { DEFAULT_APP_ROLE, getSession, isAuthVerificationPending, signOut, verifyAppAccess } from "./lib/auth";

// ── Themes ─────────────────────────────────────────────────────────────────
const DISPLAY_FONT = '"Bricolage Grotesque", "Avenir Next", "Trebuchet MS", sans-serif';
const BODY_FONT = '"Nunito", "Inter", system-ui, sans-serif';
const DARK = {
  bg: "#1c120f", surface: "#2a1a15", surfaceAlt: "#38241d",
  border: "#5a3426", borderMid: "#7b4b38",
  text: "#fff4df", textMid: "#f2d9b8", textMuted: "#d9b98d",
  navy: "#233d8b", accent: "#ffd166", accentBg: "#4b2d20",
};
const LIGHT = {
  bg: "#fff7eb", surface: "#fffdf8", surfaceAlt: "#fff1d4",
  border: "#d9b07b", borderMid: "#b77a55",
  text: "#2d1810", textMid: "#5a3426", textMuted: "#8d6447",
  navy: "#233d8b", accent: "#e94b7f", accentBg: "#ffe0d0",
};

const getPriorityCategory = s => (s >= 85 ? "critical" : s >= 65 ? "high" : s >= 45 ? "medium" : "low");
const getPriorityPresentation = (score, dark) => {
  const category = getPriorityCategory(score);
  const palette = dark
    ? {
        critical: { color: "#f472b6", bg: "#30111f", label: "Critical" },
        high: { color: "#f59e0b", bg: "#2d1b05", label: "High" },
        medium: { color: "#38bdf8", bg: "#0b2230", label: "Medium" },
        low: { color: "#94a3b8", bg: "#182230", label: "Low" },
      }
    : {
        critical: { color: "#be185d", bg: "#fdf2f8", label: "Critical" },
        high: { color: "#b45309", bg: "#fffbeb", label: "High" },
        medium: { color: "#0369a1", bg: "#f0f9ff", label: "Medium" },
        low: { color: "#475569", bg: "#f8fafc", label: "Low" },
      };
  return { category, score, ...palette[category] };
};
const riskColor = (s, dark) => getPriorityPresentation(s, dark).color;
const riskBg = (s, dark) => getPriorityPresentation(s, dark).bg;
const linkCol = (m, dark) => {
  const d = { "IP Address": "#007aff", "Email": "#ff9500", "Phone": "#af52de", "Digital": "#007aff", "Financial": "#ff9500", "Personnel": "#af52de" };
  const l = { "IP Address": "#1b56a5", "Email": "#c2410c", "Phone": "#7c3aed", "Digital": "#1b56a5", "Financial": "#c2410c", "Personnel": "#7c3aed" };
  return (dark ? d : l)[m] || (dark ? "#5ac8fa" : "#0e7490");
};
const artifactKindFromMethod = method => {
  const normalized = String(method || "").toLowerCase();
  if (normalized.includes("email")) return "email";
  if (normalized.includes("phone") || normalized.includes("telephone")) return "phone";
  return null;
};
const artifactMethodLabel = kind => kind === "email" ? "Email" : "Phone";
const getSearchResultArtifactSeed = result => {
  const data = result?.data || {};
  if (!["linkage", "association"].includes(result?.type)) return null;
  const kind = artifactKindFromMethod(data.method || data.linkageType || data.valueType);
  const value = String(data.value || result.label || "").trim();
  if (!kind || !value) return null;
  return { kind, method: artifactMethodLabel(kind), value };
};
const evidCol = (t, dark) => {
  const d = { "Catalog listing": "#007aff", "Ingredient spec sheet": "#ff9500", "Bakery menu": "#34c759", "Distributor listing": "#5ac8fa", "Supplier profile": "#af52de" };
  const l = { "Catalog listing": "#1b56a5", "Ingredient spec sheet": "#c2410c", "Bakery menu": "#15803d", "Distributor listing": "#0f766e", "Supplier profile": "#7c3aed" };
  return (dark ? d : l)[t] || "#888";
};

const MEDIA_BUCKETS = { images: "Images", specSheets: "Spec Sheets", sourcePackets: "Source Packets" };
const APP_MODES = {
  investigator: { label: "Operations", hint: "Trace sources" },
  policy: { label: "Overview", hint: "Review patterns" },
};
const MODE_STORAGE_KEY = "scrape-and-bake.workflowMode";
const DOSSIER_STORAGE_KEY_PREFIX = "scrape-and-bake.dossierDraft";
const DOSSIER_META_STORAGE_KEY_PREFIX = "scrape-and-bake.dossierMeta";
const APP_VIEW_STORAGE_KEY = "scrape-and-bake.activeView";
const SCRAPE_RUN_OPTIONS = [
  {
    id: "all_runs",
    label: "All runs",
    platform: "Synthetic timeline",
    date: DEMO_DATA.metadata?.scrapeRuns?.[DEMO_DATA.metadata.scrapeRuns.length - 1]?.date || "",
    sourcePageCount: (DEMO_DATA.metadata?.scrapeRuns || []).reduce((sum, run) => sum + (run.sourcePageCount || 0), 0),
    evidenceRowCount: DEMO_DATA.metadata?.evidenceRowCount || 0,
  },
  ...(DEMO_DATA.metadata?.scrapeRuns || []),
];
const MOVEMENT_SUMMARIES = DEMO_DATA.metadata?.movementSummaries || {};
const SEARCH_FILTERS = [
  { id: "all", label: "All", types: null },
  { id: "companies", label: "Companies", types: ["company"] },
  { id: "contacts", label: "Contact Artifacts", types: ["linkage", "association"] },
  { id: "evidence", label: "Source Evidence", types: ["evidence"] },
  { id: "substances", label: "Ingredients", types: ["substance", "synonym"] },
];
const SEARCH_MODE_COPY = {
  investigator: {
    label: "Search",
    placeholder: "Search",
    empty: "No matching results found",
  },
  policy: {
    label: "Search",
    placeholder: "Search",
    empty: "No matching results found",
  },
};
const SEARCH_MODE_PRIORITY = {
  investigator: ["linkage", "association", "evidence", "company", "substance", "synonym"],
  policy: ["company", "substance", "synonym", "evidence", "association", "linkage"],
};
const SEARCH_PREVIEW_PER_TYPE = 3;
const SEARCH_TYPE_LABELS = {
  company: "Companies",
  substance: "Ingredients",
  linkage: "Contact Artifacts",
  association: "Associations",
  evidence: "Source Evidence",
  synonym: "Ingredient Synonyms",
};
const DOSSIER_TYPE_LABELS = {
  company: "Company",
  association: "Shared Infrastructure Association",
  platform_summary: "Platform Summary",
  linkage_artifact: "Linkage Artifact",
  substance: "Ingredient",
  evidence: "Source Evidence",
  media_image: "Media & Document",
  graph_summary: "Graph Summary",
};
const DOSSIER_SECTIONS = [
  { id: "company", label: "Companies" },
  { id: "association", label: "Shared infrastructure associations" },
  { id: "platform_summary", label: "Platform summaries" },
  { id: "linkage_artifact", label: "Linkage artifacts" },
  { id: "substance", label: "Ingredients" },
  { id: "evidence", label: "Source Evidence" },
  { id: "media_image", label: "Media & Documents" },
  { id: "graph_summary", label: "Graph summaries" },
  { id: "notes", label: "Notes" },
];

const getInitialMode = () => {
  try {
    const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY);
    return storedMode === "policy" ? "policy" : "investigator";
  } catch {
    return "investigator";
  }
};
const DEFAULT_VIEWER_MODE = "investigator";
const SHOW_SCRAPE_ANALYSIS = false;
const ADMIN_ONLY_VIEWS = new Set(["scrape"]);
let APP_DATA_CACHE = null;

const getSearchFilter = filterId => SEARCH_FILTERS.find(filter => filter.id === filterId) || SEARCH_FILTERS[0];
const searchResultMatchesFilter = (result, filterId) => {
  const filter = getSearchFilter(filterId);
  return !filter.types || filter.types.includes(result.type);
};
const modeRankForResult = (mode, result) => {
  const order = SEARCH_MODE_PRIORITY[mode] || SEARCH_MODE_PRIORITY.investigator;
  const rank = order.indexOf(result.type);
  return rank === -1 ? order.length : rank;
};
const prepareSearchResults = (results, mode, filterId) => (
  (() => {
    const counts = {};
    return [...results]
      .filter(result => searchResultMatchesFilter(result, filterId))
      .sort((a, b) => modeRankForResult(mode, a) - modeRankForResult(mode, b))
      .filter(result => {
        const count = counts[result.type] || 0;
        if (count >= SEARCH_PREVIEW_PER_TYPE) return false;
        counts[result.type] = count + 1;
        return true;
      })
      .slice(0, 18);
  })()
);
const countSearchResults = (results, filterId) => (
  results
    .filter(result => searchResultMatchesFilter(result, filterId))
    .reduce((counts, result) => ({ ...counts, [result.type]: (counts[result.type] || 0) + 1 }), {})
);
const getExpandedSearchResults = (results, mode, filterId, type) => (
  [...results]
    .filter(result => result.type === type && searchResultMatchesFilter(result, filterId))
    .sort((a, b) => modeRankForResult(mode, a) - modeRankForResult(mode, b))
);
const searchGroupOrder = mode => SEARCH_MODE_PRIORITY[mode] || SEARCH_MODE_PRIORITY.investigator;
const searchTypeLabel = type => SEARCH_TYPE_LABELS[type] || type;
const normalizeAppRole = value => {
  const role = String(value || "").trim().toLowerCase();
  if (role === "admin" || role === "analyst" || role === "viewer") return role;
  return DEFAULT_APP_ROLE;
};

const getDefaultDrawerHeight = () => Math.round(window.innerHeight * 0.42);
const getExpandedDrawerHeight = () => Math.round(window.innerHeight * 0.88);
const timelineOptionById = runId => SCRAPE_RUN_OPTIONS.find(option => option.id === runId) || SCRAPE_RUN_OPTIONS[0];
const formatTimelineDate = value => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};
const ACTION_COMPANY_GRAPH = "companyGraph";
const ACTION_ARTIFACT_GRAPH = "artifactGraph";
const DEFAULT_GRAPH_NODE_LIMITS = [5, 10, 15, 25];
const GRAPH_ARTIFACT_THRESHOLDS = [2, 3, 4];
const GRAPH_NODE_METRIC_LABEL = "Shared infrastructure links";
const GRAPH_ASSOCIATION_LABEL = "Shared Infrastructure Associations";
const GRAPH_PRIORITY_LABEL = "Supply Signal";
const formatGraphMetricCount = count => {
  const safeCount = Math.max(0, Number(count) || 0);
  return safeCount >= 100 ? "100+" : safeCount.toLocaleString();
};
const graphNodeRadiusFromCount = count => 12 + Math.min(Math.max(0, Number(count) || 0), 12) * 1.2;
const getCompanyVisualMetrics = ({ company = null, canonicalMetrics = null, renderedLinks = null, sharedInfrastructureLinks = null, dark = false }) => {
  const priorityScore = Math.max(0, Math.round(canonicalMetrics?.risk ?? company?.risk ?? 0));
  const priority = getPriorityPresentation(priorityScore, dark);
  const sharedLinks = Math.max(
    0,
    Number(
      sharedInfrastructureLinks
      ?? canonicalMetrics?.sharedInfrastructureLinks
      ?? company?.sharedInfrastructureLinks
      ?? company?.connections
      ?? 0,
    ) || 0,
  );
  const visibleGraphLinks = Math.max(
    0,
    Number(renderedLinks ?? company?.renderedLinks ?? canonicalMetrics?.graphRenderedLinks ?? 0) || 0,
  );
  return {
    priorityScore,
    priorityCategory: priority.category,
    priorityLabel: priority.label,
    priorityColor: priority.color,
    priorityBg: priority.bg,
    sharedInfrastructureLinks: sharedLinks,
    visibleGraphLinks,
    displayedCount: sharedLinks,
    displayedCountText: formatGraphMetricCount(sharedLinks),
    displayedCountLabel: GRAPH_NODE_METRIC_LABEL,
    nodeRadius: graphNodeRadiusFromCount(sharedLinks),
  };
};
const normalizeLinkageMethod = method => String(method || "").trim().toLowerCase();
const normalizeLinkageValue = value => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
const buildAssociationDirectionalKey = row => [
  row?.from ?? row?.COMPANY_ID ?? "",
  row?.to ?? row?.ASSOCIATED_COMPANY_ID ?? "",
  normalizeLinkageMethod(row?.method ?? row?.LINKAGE_METHOD),
  normalizeLinkageValue(row?.value ?? row?.LINKAGE_VALUE),
].join("|");
const buildAssociationUndirectedKey = row => {
  const from = row?.from ?? row?.COMPANY_ID ?? "";
  const to = row?.to ?? row?.ASSOCIATED_COMPANY_ID ?? "";
  const [left, right] = [from, to].sort((a, b) => Number(a) - Number(b));
  return [
    left,
    right,
    normalizeLinkageMethod(row?.method ?? row?.LINKAGE_METHOD),
    normalizeLinkageValue(row?.value ?? row?.LINKAGE_VALUE),
  ].join("|");
};
const summarizeAssociationRows = rows => {
  const directional = new Set();
  const undirected = new Set();
  const infrastructure = new Set();
  const mirrored = new Set();
  const dedupedRows = [];
  (rows || []).forEach(row => {
    const directionalKey = buildAssociationDirectionalKey(row);
    const undirectedKey = buildAssociationUndirectedKey(row);
    const reverseKey = [
      row?.to ?? row?.ASSOCIATED_COMPANY_ID ?? "",
      row?.from ?? row?.COMPANY_ID ?? "",
      normalizeLinkageMethod(row?.method ?? row?.LINKAGE_METHOD),
      normalizeLinkageValue(row?.value ?? row?.LINKAGE_VALUE),
    ].join("|");
    const infrastructureKey = [
      normalizeLinkageMethod(row?.method ?? row?.LINKAGE_METHOD),
      normalizeLinkageValue(row?.value ?? row?.LINKAGE_VALUE),
    ].join("|");
    if (directional.has(reverseKey) && reverseKey !== directionalKey) mirrored.add(undirectedKey);
    directional.add(directionalKey);
    infrastructure.add(infrastructureKey);
    if (!undirected.has(undirectedKey)) {
      undirected.add(undirectedKey);
      dedupedRows.push(row);
    }
  });
  const connectedCompanies = new Set();
  dedupedRows.forEach(row => {
    const from = row?.from ?? row?.COMPANY_ID;
    const to = row?.to ?? row?.ASSOCIATED_COMPANY_ID;
    if (from != null) connectedCompanies.add(from);
    if (to != null) connectedCompanies.add(to);
  });
  return {
    rawRowCount: (rows || []).length,
    uniqueDirectionalCount: directional.size,
    uniqueUndirectedCount: undirected.size,
    distinctInfrastructureCount: infrastructure.size,
    mirroredEdgeCount: mirrored.size,
    duplicateRowCount: Math.max(0, (rows || []).length - undirected.size),
    connectedCompanyCount: connectedCompanies.size,
    dedupedRows,
  };
};
const dedupeArtifactEdges = edges => {
  const seen = new Set();
  return (edges || []).filter(edge => {
    const key = [
      edge?.companyId ?? "",
      String(edge?.kind || "").trim().toLowerCase(),
      normalizeLinkageValue(edge?.value),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const isActivationKey = e => e.key === "Enter" || e.key === " ";
const onKeyboardActivate = action => e => {
  if (!isActivationKey(e)) return;
  e.preventDefault();
  action();
};
const graphToNetworkData = graph => {
  if (!graph) return null;
  const artifactNodes = new Map((graph.nodes || [])
    .filter(node => node.type === "linkage_artifact" && node.data)
    .map(node => [node.id, node.data]));
  return {
    companies: (graph.nodes || [])
      .filter(node => node.type === "company" && node.data)
      .map(node => node.data),
    associations: (graph.edges || [])
      .filter(edge => edge.type === "company_association")
      .map(edge => ({
        id: edge.data?.associationId || edge.id,
        from: edge.data?.fromCompanyId,
        to: edge.data?.toCompanyId,
        method: edge.data?.method || edge.label || "Association",
        value: edge.data?.value || "",
      }))
      .filter(edge => edge.from != null && edge.to != null),
    artifactEdges: (graph.edges || [])
      .filter(edge => edge.type === "company_linkage_artifact")
      .map(edge => {
        const artifact = artifactNodes.get(edge.target) || {};
        return {
          id: edge.id,
          associationId: edge.data?.associationId,
          companyId: edge.data?.companyId,
          kind: edge.data?.kind || artifact.kind,
          method: edge.data?.method || artifact.method || artifactMethodLabel(edge.data?.kind || artifact.kind),
          value: edge.data?.value || artifact.value || "",
          companyCount: artifact.companyCount || 0,
        };
      })
      .filter(edge => edge.companyId != null && ["email", "phone"].includes(edge.kind)),
  };
};

const artifactEdgesFromAssociations = associations => {
  const artifacts = new Map();
  associations.forEach(edge => {
    const kind = artifactKindFromMethod(edge.method);
    const value = String(edge.value || "").trim();
    if (!kind || !value) return;
    const key = `${kind}:${value.toLowerCase()}`;
    const current = artifacts.get(key) || { id: key, kind, value, method: artifactMethodLabel(kind), companyIds: new Set(), associationIds: [] };
    current.companyIds.add(edge.from);
    current.companyIds.add(edge.to);
    if (edge.id) current.associationIds.push(edge.id);
    artifacts.set(key, current);
  });
  return [...artifacts.values()]
    .sort((a, b) => b.companyIds.size - a.companyIds.size)
    .slice(0, 40)
    .flatMap(artifact => [...artifact.companyIds].map(companyId => ({
      id: `${artifact.id}:${companyId}`,
      associationId: artifact.associationIds?.[0],
      companyId,
      kind: artifact.kind,
      method: artifact.method,
      value: artifact.value,
      companyCount: artifact.companyIds.size,
    })));
};
const graphArtifactKey = edge => `${edge.kind}:${String(edge.value || "").toLowerCase()}`;
const effectiveGraphArtifactThreshold = (selectedThreshold, companyCount) => Math.max(
  selectedThreshold,
  companyCount >= 20 ? 4 : companyCount >= 12 ? 3 : 2,
);
const getGraphSeedFromSearchResult = result => {
  if (result?.type === "company" && result.data?.id) {
    return { type: "company", label: result.label || result.data.name || `Company #${result.data.id}`, sublabel: result.sublabel, company: result.data };
  }
  const artifact = getSearchResultArtifactSeed(result);
  if (!artifact) return null;
  return {
    type: "artifact",
    label: artifact.value,
    sublabel: `${artifactMethodLabel(artifact.kind)} artifact`,
    ...artifact,
  };
};
const graphSeedTypeLabel = seed => {
  if (!seed) return "";
  if (seed.type === "company") return "Company";
  return artifactKindLabel(seed.kind);
};
const artifactEntityId = (kind, value) => `artifact:${kind}:${String(value || "").trim().toLowerCase()}`;
const buildArtifactEntity = artifact => {
  const kind = artifact?.kind || artifactKindFromMethod(artifact?.method || artifact?.linkageType || artifact?.valueType);
  const value = String(artifact?.value || "").trim();
  if (!kind || !value) return null;
  return {
    id: artifact?.id || artifactEntityId(kind, value),
    kind,
    method: artifact?.method || artifactMethodLabel(kind),
    value,
    companyIds: Array.isArray(artifact?.companyIds)
      ? [...new Set(artifact.companyIds.filter(id => id != null))]
      : artifact?.companyId != null ? [artifact.companyId] : [],
    associationIds: Array.isArray(artifact?.associationIds)
      ? [...new Set(artifact.associationIds.filter(Boolean))]
      : artifact?.associationId != null ? [artifact.associationId] : artifact?.linkageId != null ? [`linkage:${artifact.linkageId}`] : [],
  };
};
const getArtifactEntityFromSearchResult = result => {
  const seed = getSearchResultArtifactSeed(result);
  if (!seed) return null;
  const data = result?.data || {};
  return buildArtifactEntity({
    ...seed,
    companyId: data.companyId,
    linkageId: data.linkageId,
    associationId: data.associationId || data.id,
  });
};
const getArtifactEntityFromTableRow = (tableKey, row) => {
  if (!row || !["linkage_readable", "association_readable"].includes(tableKey)) return null;
  const method = tableKey === "association_readable" ? row.LINKAGE_METHOD || row.LINKAGE_TYPE : row.LINKAGE_METHOD;
  return buildArtifactEntity({
    method,
    value: row.LINKAGE_VALUE,
    companyIds: [row.COMPANY_ID, row.ASSOCIATED_COMPANY_ID].filter(id => id != null),
    linkageId: row.LINKAGEID,
    associationId: row.ASSOCIATIONID,
  });
};

function GraphLoadingOverlay({ dark }) {
  const T = dark ? DARK : LIGHT;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 4, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "auto", background: dark ? "rgba(7,11,16,0.32)" : "rgba(242,240,235,0.36)", backdropFilter: "blur(2px)" }}>
      <div style={{ background: dark ? "rgba(10,14,20,0.94)" : "rgba(255,255,255,0.96)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "15px 18px", boxShadow: dark ? "0 18px 44px rgba(0,0,0,0.35)" : "0 18px 34px rgba(54,45,31,0.14)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 4 }} aria-hidden="true">
          {[0, 1, 2].map(i => <span key={i} className="graph-pulse-dot" style={{ animationDelay: `${i * 0.14}s`, background: T.accent }} />)}
        </div>
        <div>
          <div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>Building network visual...</div>
          <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>Fetching a bounded graph and redrawing the canvas.</div>
        </div>
      </div>
    </div>
  );
}

async function invokeAuthorizedMedia(body) {
  const { data, error } = await supabase.functions.invoke("authorized-media", { body });
  if (error) throw error;
  return data;
}

async function getAuthorizedMediaUrl(bucket, name) {
  const data = await invokeAuthorizedMedia({ action: "sign", bucket, name });
  return data?.signedUrl || null;
}

async function invokeAuthorizedData(body) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Not authenticated.");

  const { data, error } = await supabase.functions.invoke("authorized-data", {
    body,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  return data;
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner({ T }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: T.textMuted, fontSize: 11, letterSpacing: 1 }}>LOADING INTELLIGENCE DATA...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Bottom Drawer ──────────────────────────────────────────────────────────
function BottomDrawer({ open, onClose, title, subtitle, dark, children, bodyScroll = true }) {
  const T = dark ? DARK : LIGHT;
  const [height, setHeight] = useState(getDefaultDrawerHeight);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef(null);
  const dragRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const expandedHeight = getExpandedDrawerHeight();
  const defaultHeight = getDefaultDrawerHeight();
  const isExpanded = height > (defaultHeight + expandedHeight) / 2;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setHeight(defaultHeight));
    drawerRef.current?.focus();

    const onKeyDown = e => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [defaultHeight, open]);

  const onDragStart = e => {
    e.preventDefault();
    setIsDragging(true);
    const startY = e.clientY, startH = height;
    const onMove = ev => {
      const delta = startY - ev.clientY;
      const newH = Math.min(Math.max(startH + delta, 120), expandedHeight);
      setHeight(newH);
    };
    const onUp = () => { setIsDragging(false); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <>
      {open && <div onClick={onClose} aria-hidden="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 40 }} />}
      <div ref={drawerRef} role="dialog" aria-modal="true" aria-label={title || "Detail drawer"} tabIndex={-1} style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        height, background: T.surface, borderTop: `2px solid ${T.border}`,
        boxShadow: dark ? "0 -8px 40px rgba(0,0,0,0.7)" : "0 -6px 32px rgba(0,0,0,0.13)",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: isDragging ? "none" : "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
        outline: "none",
        display: "flex", flexDirection: "column", fontFamily: "Georgia,serif",
      }}>
        {/* Drag handle */}
        <div ref={dragRef} onMouseDown={onDragStart}
          style={{ height: 6, background: "transparent", cursor: "ns-resize", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 48, height: 4, background: T.borderMid, borderRadius: 2 }} />
        </div>
        <div style={{ padding: "8px 24px 10px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: T.surfaceAlt }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>{title}</div>
              {subtitle && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</div>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setHeight(isExpanded ? defaultHeight : expandedHeight)}
              title={isExpanded ? "Switch to partial drawer height" : "Expand drawer"}
              aria-label={isExpanded ? "Switch to partial drawer height" : "Expand drawer"}
              style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, cursor: "pointer", fontSize: 10, padding: "4px 8px", borderRadius: 4, fontFamily: "Georgia,serif", minWidth: 62 }}
            >
              {isExpanded ? "Partial" : "Expand"}
            </button>
            <button onClick={onClose} aria-label="Close drawer" style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, cursor: "pointer", fontSize: 15, width: 30, height: 30, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: bodyScroll ? "auto" : "hidden", overflowX: "hidden", minHeight: 0 }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ── Drawer Column ──────────────────────────────────────────────────────────
function DrawerCol({ label, T, children, minWidth = 240 }) {
  return (
    <div style={{ minWidth, flex: 1, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "10px 18px 8px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1.2, fontWeight: 700 }}>{label}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px" }}>
        {children}
      </div>
    </div>
  );
}

function EvidenceProvenancePanel({ title, summary, rows, loading, loaded, error, onLoad, T, dark, onAddRow, isRowInDossier }) {
  const field = (label, value) => value !== null && value !== undefined && value !== "" ? (
    <div style={{ minWidth: 110, flex: 1 }}>
      <div style={{ color: T.textMuted, fontSize: 8, letterSpacing: 0.8 }}>{label}</div>
      <div style={{ color: T.textMid, fontSize: 10, marginTop: 2, wordBreak: "break-word" }}>{String(value)}</div>
    </div>
  ) : null;

  return (
    <div style={{ marginTop: 18, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1 }}>{title}</div>
          {summary && <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3, lineHeight: 1.5 }}>{summary}</div>}
        </div>
        <button
          onClick={onLoad}
          disabled={loading}
          style={{ background: T.accentBg, border: `1px solid ${T.accent}44`, color: T.accent, padding: "5px 10px", borderRadius: 4, cursor: loading ? "default" : "pointer", fontSize: 10, fontFamily: "Georgia,serif", flexShrink: 0 }}
        >
          {loading ? "Loading..." : loaded ? "Refresh" : "Load Records"}
        </button>
      </div>
      {error && <div style={{ color: dark ? "#ff3b30" : "#b91c1c", fontSize: 11, marginBottom: 8 }}>{error}</div>}
      {loaded && rows.length === 0 && <div style={{ color: T.textMuted, fontSize: 11 }}>No source evidence records returned for this selection.</div>}
      {rows.map(row => (
        <div key={row.evidence_id || `${row.company_name}-${row.record_id}`} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 12px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>Source Evidence #{row.evidence_id || "unknown"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <div style={{ color: evidCol(row.evidence_type, dark), fontSize: 10, fontWeight: 700 }}>{row.evidence_type || "Source Evidence"}</div>
              {onAddRow && (
                <button
                  type="button"
                  onClick={() => onAddRow(row)}
                  style={{ background: isRowInDossier?.(row) ? T.accentBg : T.surface, color: isRowInDossier?.(row) ? T.accent : T.textMid, border: `1px solid ${isRowInDossier?.(row) ? T.accent : T.border}`, borderRadius: 999, padding: "3px 8px", cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "Georgia,serif" }}
                >
                  {isRowInDossier?.(row) ? "Update dossier" : "Add to dossier"}
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            {field("COMPANY", row.company_name)}
            {field("INGREDIENT", row.canonical_substance_name)}
            {field("OBSERVED TEXT", row.observed_substance_text)}
            {field("SOURCE", row.source_name)}
            {field("PLATFORM", row.source_platform)}
            {field("SOURCE TYPE", row.source_type)}
            {field("OBSERVED", row.observed_at)}
            {field("RECORD ID", row.record_id)}
            {field("SCRAPE RUN", row.scrape_run_id)}
            {field("FIRST SEEN", row.first_seen_at)}
            {field("LAST SEEN", row.last_seen_at)}
            {field("DATE LOGGED", row.date_logged)}
            {field("SCORE WEIGHT", row.score_contribution)}
            {field("REGION", row.region)}
          </div>
          {row.source_url && <div style={{ color: T.textMuted, fontSize: 9, marginBottom: row.source_locator ? 6 : 0, wordBreak: "break-all" }}>URL: {row.source_url}</div>}
          {row.source_locator && <a href={row.source_locator} target="_blank" rel="noreferrer" style={{ color: T.accent, fontSize: 10, wordBreak: "break-all" }}>Open source locator</a>}
        </div>
      ))}
    </div>
  );
}

const linkageCategory = method => {
  const normalized = String(method || "").toLowerCase();
  if (normalized.includes("email")) return "email";
  if (normalized.includes("phone") || normalized.includes("telephone") || normalized.includes("fax")) return "phone";
  if (normalized.includes("website") || normalized.includes("domain") || normalized.includes("url") || normalized.includes("digital")) return "website";
  if (normalized.includes("platform")) return "platform_overlap";
  if (normalized.includes("substance")) return "shared_substance";
  if (normalized.includes("evidence")) return "evidence";
  return "other";
};
const provenanceBadgeLabel = category => ({
  email: "Email",
  phone: "Phone",
  website: "Website",
  platform_overlap: "Platform overlap",
  shared_substance: "Shared substance",
  evidence: "Evidence",
  other: "Infrastructure",
}[category] || "Infrastructure");
const summarizeMonthYear = value => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "long" });
};
const formatObservedDate = value => {
  if (!value) return "Unknown";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};
const maxObservedDate = values => values
  .map(value => new Date(value))
  .filter(date => !Number.isNaN(date.getTime()))
  .sort((a, b) => b.getTime() - a.getTime())[0] || null;

// ── Company Drawer ─────────────────────────────────────────────────────────
function CompanyDrawer({ company, substances, preloadedAssociations, preloadedEvidence, evidenceTypes, dark, timelineRunId, onBuildCompanyGraph, graphLoadingCompanyId, onAddToDossier, isInDossier, onAddEvidenceToDossier, isEvidenceInDossier, onAddMediaToDossier, isMediaInDossier, companyLookup, getCompanyGraphMetrics, onOpenEvidenceExplorer }) {
  const T = dark ? DARK : LIGHT;

  const [liveEvidence, setLiveEvidence] = useState(null);
  const [liveAssociations, setLiveAssociations] = useState(null);
  const [linkedNames, setLinkedNames] = useState({});
  const [images, setImages] = useState([]);
  const [liveWeight, setLiveWeight] = useState(null);
  const [liveRisk, setLiveRisk] = useState(null);
  const [provenanceRows, setProvenanceRows] = useState([]);
  const [provenanceLoading, setProvenanceLoading] = useState(false);
  const [provenanceLoaded, setProvenanceLoaded] = useState(false);
  const [provenanceError, setProvenanceError] = useState("");
  const [selectedInfrastructureKeys, setSelectedInfrastructureKeys] = useState(() => new Set());
  const [expandedInfrastructureKeys, setExpandedInfrastructureKeys] = useState(() => new Set());
  const liveRequestRef = useRef(0);
  const provenanceRequestRef = useRef(0);

  const companyId = company?.id;
  const resolvedCompany = useMemo(() => (companyId != null ? (companyLookup?.get(companyId) || company) : company), [company, companyId, companyLookup]);
  const inPreload = useMemo(() => preloadedEvidence.some(e => e.company_id === companyId), [preloadedEvidence, companyId]);

  const loadCompanyProvenance = useCallback(async () => {
    if (!companyId) return;
    const requestId = ++provenanceRequestRef.current;
    setProvenanceLoading(true);
    setProvenanceError("");
    try {
      const { rows } = await invokeAuthorizedData({ action: "provenance", entityType: "company", companyId, asOfRunId: timelineRunId });
      if (requestId !== provenanceRequestRef.current) return;
      setProvenanceRows(rows || []);
      setProvenanceLoaded(true);
    } catch (e) {
      if (requestId !== provenanceRequestRef.current) return;
      console.error(e);
      setProvenanceError("Unable to load source evidence records.");
    } finally {
      if (requestId === provenanceRequestRef.current) setProvenanceLoading(false);
    }
  }, [companyId, timelineRunId]);

  useEffect(() => {
    if (!companyId) {
      liveRequestRef.current += 1;
      provenanceRequestRef.current += 1;
      return;
    }
    const requestId = ++liveRequestRef.current;
    setLiveEvidence(null);
    setLiveAssociations(null);
    setLinkedNames({});
    setImages([]);
    setLiveWeight(null);
    setLiveRisk(null);
    setProvenanceRows([]);
    setProvenanceLoaded(false);
    setProvenanceError("");
    setSelectedInfrastructureKeys(new Set());
    setExpandedInfrastructureKeys(new Set());

    const fetchLive = async () => {
      try {
        const { data: assocData } = await supabase
          .from("association_readable")
          .select("*")
          .or(`"COMPANY_ID".eq.${companyId},"ASSOCIATED_COMPANY_ID".eq.${companyId}`);
        if (requestId !== liveRequestRef.current) return;
        setLiveAssociations(assocData || []);

        const names = {};
        (assocData || []).forEach(a => {
          if (a.COMPANY_ID === companyId) names[a.ASSOCIATED_COMPANY_ID] = a.associated_company_name;
          else names[a.COMPANY_ID] = a.company_name;
        });
        setLinkedNames(names);

        if (!inPreload) {
          const { data: evData } = await supabase
            .from("evidence_summary")
            .select("*")
            .eq("COMPANY_ID", companyId);
          if (requestId !== liveRequestRef.current) return;
          setLiveEvidence((evData || []).map(r => ({
            company_id: r.COMPANY_ID,
            substance_reference_id: r.SUBSTANCE_REFERENCE_ID,
            evidence_type_id: r.EVIDENCE_TYPE_ID,
            evidence_count: r.evidence_count || 0,
            total_weight: r.total_weight || 0,
          })));

          const { data: v2Row } = await supabase
            .from("company_score_v2")
            .select("evidence_score,substance_score,company_tag_score,total_score_v2,legacy_score")
            .eq('"COMPANY_ID"', companyId)
            .single();
          const { data: v2Max } = await supabase
            .from("company_score_v2")
            .select("total_score_v2")
            .order("total_score_v2", { ascending: false })
            .limit(1);
          if (requestId !== liveRequestRef.current) return;
          const w = v2Row?.total_score_v2 || 0;
          const mx = v2Max?.[0]?.total_score_v2 || 1;
          setLiveWeight(w);
          setLiveRisk(Math.max(Math.round((w / mx) * 100), 1));
        }

        const mediaData = await invokeAuthorizedMedia({ action: "list", companyId });
        if (requestId !== liveRequestRef.current) return;
        setImages(mediaData?.images || []);
      } catch (e) {
        if (requestId !== liveRequestRef.current) return;
        console.error(e);
        setImages([]);
        setLiveAssociations([]);
        if (!inPreload) setLiveEvidence([]);
      }
    };

    fetchLive();
    return () => { liveRequestRef.current += 1; };
  }, [companyId, inPreload, timelineRunId]);

  useEffect(() => {
    if (!companyId || provenanceLoaded || provenanceLoading) return;
    loadCompanyProvenance();
  }, [companyId, loadCompanyProvenance, provenanceLoaded, provenanceLoading]);

  const openCompanyImage = async img => {
    if (!img.storage_name) return;
    try {
      const url = await getAuthorizedMediaUrl(MEDIA_BUCKETS.images, img.storage_name);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
    }
  };

  const rawEvidence = inPreload
    ? preloadedEvidence.filter(e => e.company_id === companyId)
    : (liveEvidence || []);

  const totalEvidenceCount = rawEvidence.reduce((s, e) => s + e.evidence_count, 0);
  const companySubstanceIds = [...new Set(rawEvidence.map(e => e.substance_reference_id))];
  const companySubstances = substances.filter(s => companySubstanceIds.includes(s.id));
  const evidenceByType = evidenceTypes
    .map(et => ({
      ...et,
      count: rawEvidence.filter(e => e.evidence_type_id === et.id).reduce((s, e) => s + e.evidence_count, 0),
    }))
    .filter(et => et.count > 0);

  const assocs = liveAssociations || preloadedAssociations.filter(a => a.from === companyId || a.to === companyId);
  const canonicalMetrics = getCompanyGraphMetrics?.(companyId) || null;
  const weight = liveWeight !== null ? liveWeight : (canonicalMetrics?.weight ?? resolvedCompany?.weight ?? 0);
  const risk = liveRisk !== null ? liveRisk : (canonicalMetrics?.risk ?? resolvedCompany?.risk ?? 0);
  const isLoadingEvidence = !inPreload && liveEvidence === null;
  const isLoadingAssoc = liveAssociations === null;
  const isBuildingGraph = graphLoadingCompanyId === companyId;
  const renderedLinks = company?.renderedLinks != null ? company.renderedLinks : canonicalMetrics?.graphRenderedLinks;
  const visualMetrics = getCompanyVisualMetrics({
    company: { ...resolvedCompany, risk },
    canonicalMetrics: liveRisk !== null ? { ...canonicalMetrics, risk: liveRisk } : canonicalMetrics,
    renderedLinks,
    sharedInfrastructureLinks: canonicalMetrics?.sharedInfrastructureLinks ?? resolvedCompany?.connections ?? assocs.length,
    dark,
  });
  const sharedInfrastructureLinks = visualMetrics.sharedInfrastructureLinks;
  const associationCount = canonicalMetrics?.associationCount ?? assocs.length;
  const artifactEvidenceCount = provenanceRows.length;
  const distinctArtifactEvidenceCount = artifactEvidenceCount + images.length;

  const platformSummaries = useMemo(() => {
    const grouped = new Map();
    provenanceRows.forEach(row => {
      const name = row.source_name || row.source_type || "Unknown platform";
      const key = String(name).toLowerCase();
      const current = grouped.get(key) || { name, count: 0, dates: [], sourceTypes: new Set() };
      current.count += 1;
      if (row.date_logged) current.dates.push(row.date_logged);
      if (row.source_type) current.sourceTypes.add(row.source_type);
      grouped.set(key, current);
    });
    return [...grouped.values()]
      .map(entry => ({
        ...entry,
        lastObservedDate: maxObservedDate(entry.dates),
        sourceTypes: [...entry.sourceTypes],
      }))
      .sort((a, b) => {
        const aDate = a.lastObservedDate?.getTime?.() || 0;
        const bDate = b.lastObservedDate?.getTime?.() || 0;
        if (bDate !== aDate) return bDate - aDate;
        return b.count - a.count;
      });
  }, [provenanceRows]);

  const platformNames = platformSummaries.map(entry => entry.name);
  const overallLastObserved = platformSummaries[0]?.lastObservedDate || maxObservedDate(provenanceRows.map(row => row.date_logged));
  const overallLastObservedLabel = overallLastObserved
    ? formatObservedDate(overallLastObserved)
    : summarizeMonthYear(resolvedCompany?.lastObserved) || "Unknown";

  const groupedAssociations = useMemo(() => {
    const grouped = new Map();
    assocs.forEach((association, index) => {
      const associationId = association.ASSOCIATIONID || association.id || `${companyId}:${index}`;
      const method = association.LINKAGE_METHOD || association.method || "Unknown";
      const value = association.LINKAGE_VALUE || association.value || "Unspecified";
      const category = linkageCategory(method);
      const otherCompanyId = association.COMPANY_ID === companyId
        ? association.ASSOCIATED_COMPANY_ID
        : association.COMPANY_ID || association.to || association.from;
      const otherCompanyName = association.COMPANY_ID === companyId
        ? (association.associated_company_name || linkedNames[otherCompanyId] || `Company #${otherCompanyId}`)
        : (association.company_name || linkedNames[otherCompanyId] || `Company #${otherCompanyId}`);
      const key = `${category}:${String(value).toLowerCase()}`;
      const current = grouped.get(key) || {
        key,
        category,
        value,
        associationCount: 0,
        associationIds: new Set(),
        linkedCompanyIds: new Set(),
        linkedCompanyNames: new Set(),
        methods: new Set(),
        platforms: new Set(),
        evidenceCount: 0,
      };
      current.associationCount += 1;
      current.associationIds.add(associationId);
      if (otherCompanyId != null) current.linkedCompanyIds.add(otherCompanyId);
      if (otherCompanyName) current.linkedCompanyNames.add(otherCompanyName);
      current.methods.add(method);
      grouped.set(key, current);
    });
    return [...grouped.values()]
      .map(group => ({
        ...group,
        linkedCompanyCount: group.linkedCompanyIds.size,
        linkedCompanyNames: [...group.linkedCompanyNames].sort(),
        associationIds: [...group.associationIds],
        methods: [...group.methods],
        platforms: [...group.platforms],
      }))
      .sort((a, b) => {
        if (b.linkedCompanyCount !== a.linkedCompanyCount) return b.linkedCompanyCount - a.linkedCompanyCount;
        if (b.associationCount !== a.associationCount) return b.associationCount - a.associationCount;
        return String(a.value).localeCompare(String(b.value));
      });
  }, [assocs, companyId, linkedNames]);

  const topSharedTypeSummary = useMemo(() => {
    const counts = groupedAssociations.reduce((acc, group) => {
      acc[group.category] = (acc[group.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, count]) => ({
        category,
        count,
        label: provenanceBadgeLabel(category),
      }));
  }, [groupedAssociations]);

  const infrastructureSections = useMemo(() => {
    const sections = [
      ["email", "Shared emails"],
      ["phone", "Shared phones"],
      ["website", "Shared websites / domains"],
      ["platform_overlap", "Shared platform observations"],
      ["shared_substance", "Shared ingredients"],
      ["evidence", "Shared source evidence"],
      ["other", "Other shared infrastructure"],
    ];
    return sections
      .map(([category, label]) => ({
        category,
        label,
        groups: groupedAssociations.filter(group => group.category === category),
      }))
      .filter(section => section.groups.length > 0);
  }, [groupedAssociations]);

  const whyEntityMatters = useMemo(() => {
    const points = [];
    if (platformNames.length) points.push(`observed across ${platformNames.length} staged platform${platformNames.length === 1 ? "" : "s"}`);
    if (sharedInfrastructureLinks) points.push(`${sharedInfrastructureLinks} shared infrastructure link${sharedInfrastructureLinks === 1 ? "" : "s"}`);
    if (associationCount) points.push(`${associationCount} shared infrastructure association${associationCount === 1 ? "" : "s"}`);
    if (canonicalMetrics?.substancesLinked) points.push(`${canonicalMetrics.substancesLinked} linked ingredient record${canonicalMetrics.substancesLinked === 1 ? "" : "s"}`);
    if (artifactEvidenceCount) points.push(`${artifactEvidenceCount} source-bearing evidence row${artifactEvidenceCount === 1 ? "" : "s"} available for review`);
    if (!points.length) return "This entity is present in the current graph context, but staged provenance and shared-infrastructure context are still limited. Review source rows before drawing stronger conclusions.";
    return `This entity is currently ${points.join(", ")}. These are reviewable operational signals, not proof of wrongdoing.`;
  }, [artifactEvidenceCount, associationCount, canonicalMetrics?.substancesLinked, platformNames.length, sharedInfrastructureLinks]);

  if (!company) return null;

  const addCompanyToDossier = () => {
    if (!onAddToDossier) return;
    onAddToDossier(buildCompanyDossierItem({
      company: {
        ...resolvedCompany,
        renderedLinks: sharedInfrastructureLinks,
        risk: visualMetrics.priorityScore,
      },
      risk: visualMetrics.priorityScore,
      associationCount,
      evidenceCount: totalEvidenceCount,
      substanceCount: companySubstances.length,
      provenanceRows,
    }));
  };

  const addPlatformSummaryToDossier = () => {
    if (!onAddToDossier) return;
    onAddToDossier(buildPlatformSummaryDossierItem({
      company: {
        ...resolvedCompany,
        renderedLinks: sharedInfrastructureLinks,
        risk: visualMetrics.priorityScore,
      },
      platformNames,
      lastObserved: overallLastObservedLabel,
      evidenceCount: artifactEvidenceCount,
      artifactCount: images.length,
    }));
  };

  const toggleInfrastructureSelection = key => {
    setSelectedInfrastructureKeys(current => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleInfrastructureExpanded = key => {
    setExpandedInfrastructureKeys(current => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addInfrastructureGroupToDossier = group => {
    if (!onAddToDossier) return;
    onAddToDossier(buildAssociationDossierItem({
      company: {
        ...resolvedCompany,
        risk: visualMetrics.priorityScore,
        renderedLinks: sharedInfrastructureLinks,
        connections: sharedInfrastructureLinks,
      },
      group: {
        ...group,
        lastObserved: overallLastObservedLabel,
      },
    }));
  };

  const addSelectedInfrastructureToDossier = () => {
    groupedAssociations
      .filter(group => selectedInfrastructureKeys.has(group.key))
      .forEach(addInfrastructureGroupToDossier);
  };

  const selectedInfrastructureCount = selectedInfrastructureKeys.size;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <DrawerCol label="ENTITY SUMMARY" T={T} minWidth={280}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            ["STATUS", resolvedCompany?.active || "—"],
            ["TYPE", resolvedCompany?.type || "—"],
            ["REGION", resolvedCompany?.region || "—"],
            ["LAST OBSERVED", overallLastObservedLabel],
            [GRAPH_NODE_METRIC_LABEL.toUpperCase(), sharedInfrastructureLinks.toLocaleString()],
            [GRAPH_ASSOCIATION_LABEL.toUpperCase(), associationCount.toLocaleString()],
            ["DISTINCT ARTIFACTS / SOURCE EVIDENCE", distinctArtifactEvidenceCount.toLocaleString()],
            ["LINKED INGREDIENTS", (canonicalMetrics?.substancesLinked ?? companySubstances.length).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} style={{ background: T.surfaceAlt, padding: "9px 10px", borderRadius: 6, border: `1px solid ${T.border}` }}>
              <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1 }}>{label}</div>
              <div style={{ color: label === "STATUS" && value === "Active" ? (dark ? "#34c759" : "#166534") : T.text, fontSize: 13, marginTop: 4, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: visualMetrics.priorityBg, border: `1px solid ${visualMetrics.priorityColor}44`, borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1 }}>{GRAPH_PRIORITY_LABEL.toUpperCase()}</span>
            <span style={{ background: visualMetrics.priorityBg, color: visualMetrics.priorityColor, border: `1px solid ${visualMetrics.priorityColor}55`, padding: "3px 10px", borderRadius: 999, fontSize: 14, fontWeight: 700 }}>{visualMetrics.priorityLabel} · {visualMetrics.priorityScore}</span>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)", borderRadius: 999, height: 5, marginBottom: 10 }}>
            <div style={{ width: `${Math.min(visualMetrics.priorityScore, 100)}%`, height: "100%", background: visualMetrics.priorityColor, borderRadius: 999 }} />
          </div>
          {canonicalMetrics?.evidenceScore != null && (
            <ScoreBar
              evidenceScore={canonicalMetrics.evidenceScore || 0}
              substanceScore={canonicalMetrics.substanceScore || 0}
              companyTagScore={canonicalMetrics.companyTagScore || 0}
              dark={dark}
              T={T}
            />
          )}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 8, color: T.textMuted, fontSize: 10 }}>
            {weight > 0 && <div>V2 total: {weight.toLocaleString()}</div>}
            {resolvedCompany?.legacyWeight > 0 && <div>Legacy: {resolvedCompany.legacyWeight.toLocaleString()}</div>}
            {renderedLinks != null && <div>Visible graph links: {visualMetrics.visibleGraphLinks}</div>}
          </div>
        </div>

        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 7 }}>WHY THIS ENTITY MATTERS</div>
          <div style={{ color: T.textMid, fontSize: 12, lineHeight: 1.65 }}>{whyEntityMatters}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>PLATFORMS OBSERVED</div>
          {platformSummaries.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {platformSummaries.map(platform => (
                <div key={platform.name} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{platform.name}</div>
                    <div style={{ color: T.textMuted, fontSize: 10, whiteSpace: "nowrap" }}>{platform.count} row{platform.count === 1 ? "" : "s"}</div>
                  </div>
                  <div style={{ color: T.textMuted, fontSize: 10, lineHeight: 1.5, marginTop: 4 }}>
                    Last observed {platform.lastObservedDate ? formatObservedDate(platform.lastObservedDate) : "Unknown"}
                    {platform.sourceTypes.length ? ` · ${platform.sourceTypes.join(", ")}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: T.textMuted, fontSize: 12, lineHeight: 1.55 }}>
              Source-platform observations have not been loaded for this drawer yet. The entity can still be reviewed through the graph and evidence views.
            </div>
          )}
        </div>

        {topSharedTypeSummary.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>TOP SHARED INFRASTRUCTURE TYPES</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {topSharedTypeSummary.map(entry => (
                <span key={entry.category} style={{ background: T.accentBg, border: `1px solid ${T.accent}33`, color: T.accent, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
                  {entry.label} · {entry.count}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          {onBuildCompanyGraph && (
            <button
              type="button"
              onClick={() => onBuildCompanyGraph(resolvedCompany)}
              disabled={isBuildingGraph}
              style={{ width: "100%", background: T.surfaceAlt, color: T.text, border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "10px 12px", cursor: isBuildingGraph ? "wait" : "pointer", textAlign: "left", fontFamily: "Georgia,serif" }}
            >
              <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{isBuildingGraph ? "Building bounded graph..." : "Build bounded graph from entity"}</div>
              <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>Keep the current graph source of truth aligned with this company’s canonical metrics.</div>
            </button>
          )}
          {onAddToDossier && (
            <>
              <button
                type="button"
                onClick={addCompanyToDossier}
                style={{ width: "100%", background: isInDossier ? T.accentBg : T.surface, color: isInDossier ? T.accent : T.text, border: `1px solid ${isInDossier ? T.accent : T.borderMid}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", textAlign: "left", fontFamily: "Georgia,serif" }}
              >
                <div style={{ color: isInDossier ? T.accent : T.text, fontSize: 12, fontWeight: 700 }}>{isInDossier ? "Update entity summary in dossier" : "Add entity summary to dossier"}</div>
                <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>Preserve the operational summary, canonical metrics, and cautious “why this matters” explanation.</div>
              </button>
              <button
                type="button"
                onClick={addPlatformSummaryToDossier}
                style={{ width: "100%", background: T.surface, color: T.text, border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", textAlign: "left", fontFamily: "Georgia,serif" }}
              >
                <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>Add platform summary to dossier</div>
                <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>Keep platform display names, last observed timing, and staged evidence counts together.</div>
              </button>
              <button
                type="button"
                onClick={addSelectedInfrastructureToDossier}
                disabled={!selectedInfrastructureCount}
                style={{ width: "100%", background: selectedInfrastructureCount ? T.surface : T.surfaceAlt, color: selectedInfrastructureCount ? T.text : T.textMuted, border: `1px solid ${selectedInfrastructureCount ? T.borderMid : T.border}`, borderRadius: 8, padding: "10px 12px", cursor: selectedInfrastructureCount ? "pointer" : "not-allowed", textAlign: "left", fontFamily: "Georgia,serif" }}
              >
                <div style={{ color: selectedInfrastructureCount ? T.text : T.textMuted, fontSize: 12, fontWeight: 700 }}>Add selected infrastructure to dossier</div>
                <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>{selectedInfrastructureCount ? `${selectedInfrastructureCount} grouped linkage${selectedInfrastructureCount === 1 ? "" : "s"} selected.` : "Select one or more grouped infrastructure items first."}</div>
              </button>
            </>
          )}
          {onOpenEvidenceExplorer && (
            <button
              type="button"
              onClick={() => onOpenEvidenceExplorer(resolvedCompany)}
              style={{ width: "100%", background: T.surface, color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", textAlign: "left", fontFamily: "Georgia,serif" }}
            >
              <div style={{ color: T.accent, fontSize: 12, fontWeight: 700 }}>Open Source Evidence table view</div>
              <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>Jump to the Source Evidence table if you want row-level citation review instead of the compact drawer summary.</div>
            </button>
          )}
        </div>
      </DrawerCol>

      <DrawerCol label={`SHARED INFRASTRUCTURE (${isLoadingAssoc ? "…" : groupedAssociations.length})`} T={T} minWidth={340}>
        {isLoadingAssoc ? (
          <div style={{ color: T.textMuted, fontSize: 13 }}>Loading shared infrastructure…</div>
        ) : infrastructureSections.length === 0 ? (
          <div style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.6 }}>No shared infrastructure associations are currently recorded for this entity.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {infrastructureSections.map(section => (
              <section key={section.category}>
                <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>{section.label.toUpperCase()}</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {section.groups.map(group => {
                    const expanded = expandedInfrastructureKeys.has(group.key);
                    const selected = selectedInfrastructureKeys.has(group.key);
                    return (
                      <div key={group.key} style={{ border: `1px solid ${selected ? T.accent : T.border}`, background: selected ? T.accentBg : T.surfaceAlt, borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleInfrastructureSelection(group.key)}
                            style={{ marginTop: 2 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 5 }}>
                                  <span style={{ background: `${linkCol(group.methods[0] || provenanceBadgeLabel(group.category), dark)}22`, color: linkCol(group.methods[0] || provenanceBadgeLabel(group.category), dark), border: `1px solid ${linkCol(group.methods[0] || provenanceBadgeLabel(group.category), dark)}44`, borderRadius: 999, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>
                                    {provenanceBadgeLabel(group.category)}
                                  </span>
                                  <span style={{ color: T.text, fontSize: 12, fontWeight: 700, wordBreak: "break-word" }}>{group.value}</span>
                                </div>
                                <div style={{ color: T.textMuted, fontSize: 10, lineHeight: 1.55 }}>
                                  {group.linkedCompanyCount} linked compan{group.linkedCompanyCount === 1 ? "y" : "ies"} · {group.associationCount} {GRAPH_ASSOCIATION_LABEL.toLowerCase()}
                                  {group.evidenceCount ? ` · ${group.evidenceCount} evidence rows` : ""}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  onClick={() => toggleInfrastructureExpanded(group.key)}
                                  style={{ background: T.surface, color: T.textMid, border: `1px solid ${T.border}`, borderRadius: 999, padding: "4px 8px", cursor: "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                                >
                                  {expanded ? "Hide details" : "Expand"}
                                </button>
                                {onAddToDossier && (
                                  <button
                                    type="button"
                                    onClick={() => addInfrastructureGroupToDossier(group)}
                                    style={{ background: T.surface, color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 999, padding: "4px 8px", cursor: "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                                  >
                                    Add linkage to dossier
                                  </button>
                                )}
                              </div>
                            </div>
                            {expanded && (
                              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  {group.linkedCompanyNames.slice(0, 8).map(name => (
                                    <span key={`${group.key}:${name}`} style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textMid, padding: "3px 8px", borderRadius: 999, fontSize: 10 }}>
                                      {name}
                                    </span>
                                  ))}
                                  {!group.linkedCompanyNames.length && <span style={{ color: T.textMuted, fontSize: 10 }}>No linked company names resolved in this view.</span>}
                                </div>
                                <div style={{ color: T.textMuted, fontSize: 10, lineHeight: 1.55 }}>
                                  Methods: {group.methods.join(", ")}
                                  {platformNames.length ? ` · Platforms observed: ${platformNames.join(", ")}` : " · Platform summary still loading or unavailable."}
                                  {overallLastObservedLabel ? ` · Last observed: ${overallLastObservedLabel}` : ""}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </DrawerCol>

      <DrawerCol label="SUPPORTING EVIDENCE" T={T} minWidth={320}>
        {isLoadingEvidence ? (
          <div style={{ color: T.textMuted, fontSize: 13 }}>Loading evidence…</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {evidenceByType.length ? evidenceByType.map(et => (
                <div key={et.id} style={{ background: T.surfaceAlt, border: `1px solid ${evidCol(et.name, dark)}44`, borderRadius: 8, padding: "10px 14px", flex: 1, minWidth: 92 }}>
                  <div style={{ color: evidCol(et.name, dark), fontSize: 10, fontWeight: 700 }}>{et.name.toUpperCase()}</div>
                  <div style={{ color: T.text, fontSize: 22, fontWeight: 700, marginTop: 3 }}>{et.count.toLocaleString()}</div>
                </div>
              )) : (
                <div style={{ color: T.textMuted, fontSize: 12, lineHeight: 1.6 }}>No evidence summary rows are currently available for this company.</div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>DISTINCT SHARED ARTIFACTS / EVIDENCE</div>
              <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", color: T.textMid, fontSize: 12, lineHeight: 1.6 }}>
                {artifactEvidenceCount} source-bearing evidence row{artifactEvidenceCount === 1 ? "" : "s"} and {images.length} artifact image{images.length === 1 ? "" : "s"} are currently available for review.
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>LINKED SUBSTANCES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {companySubstances.length === 0 ? (
                  <span style={{ color: T.textMuted, fontSize: 12 }}>None currently linked in the evidence summary.</span>
                ) : (
                  companySubstances.map(s => (
                    <span key={s.id} style={{ background: T.accentBg, border: `1px solid ${T.accent}33`, color: T.accent, padding: "4px 10px", borderRadius: 999, fontSize: 11 }}>
                      {s.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>ARTIFACTS ({images.length})</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {images.map(img => (
                    <div key={img.image_id} style={{ border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden", width: 96, background: T.surface }}>
                      <div
                        role={img.storage_name ? "button" : undefined}
                        tabIndex={img.storage_name ? 0 : undefined}
                        aria-label={img.storage_name ? `Open image ${img.image_name}` : undefined}
                        onClick={() => openCompanyImage(img)}
                        onKeyDown={img.storage_name ? onKeyboardActivate(() => openCompanyImage(img)) : undefined}
                        style={{ height: 68, background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", cursor: img.storage_name ? "pointer" : "default" }}
                      >
                        <span style={{ color: T.textMuted, fontSize: 9 }}>{img.storage_name ? "OPEN" : "UNAVAILABLE"}</span>
                      </div>
                      <div style={{ padding: "4px 6px", fontSize: 8, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.image_name}</div>
                      {onAddMediaToDossier && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); onAddMediaToDossier(img); }}
                          style={{ width: "100%", background: isMediaInDossier?.(img) ? T.accentBg : T.surface, color: isMediaInDossier?.(img) ? T.accent : T.textMuted, border: 0, borderTop: `1px solid ${isMediaInDossier?.(img) ? T.accent : T.border}`, padding: "5px 4px", cursor: "pointer", fontSize: 8, fontWeight: 700, fontFamily: "Georgia,serif" }}
                        >
                          {isMediaInDossier?.(img) ? "Update dossier" : "Add artifact"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <details style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
              <summary style={{ cursor: "pointer", color: T.text, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                Open source evidence rows
              </summary>
              <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.55, marginBottom: 10 }}>
                Raw source evidence rows remain available for citation review, but they are collapsed here so the drawer can foreground operational summaries first.
              </div>
              <EvidenceProvenancePanel
                title="SOURCE EVIDENCE RECORDS"
                summary="Trace the aggregate counts back to source-bearing evidence rows, then add only the rows you want to preserve in the dossier."
                rows={provenanceRows}
                loading={provenanceLoading}
                loaded={provenanceLoaded}
                error={provenanceError}
                onLoad={loadCompanyProvenance}
                onAddRow={onAddEvidenceToDossier}
                isRowInDossier={isEvidenceInDossier}
                T={T}
                dark={dark}
              />
            </details>
          </>
        )}
      </DrawerCol>
    </div>
  );
}

// ── Ingredient Drawer ──────────────────────────────────────────────────────
function SubstanceDrawer({ substance, evidenceSummary, substanceDataSources, companies, evidenceTypes, dark, timelineRunId, onAddToDossier, isInDossier, onAddEvidenceToDossier, isEvidenceInDossier }) {
  const T = dark ? DARK : LIGHT;
  const [sourcing, setSourcing] = useState([]);
  const [provenanceRows, setProvenanceRows] = useState([]);
  const [provenanceLoading, setProvenanceLoading] = useState(false);
  const [provenanceLoaded, setProvenanceLoaded] = useState(false);
  const [provenanceError, setProvenanceError] = useState("");
  const sourcingRequestRef = useRef(0);
  const provenanceRequestRef = useRef(0);

  useEffect(() => {
    if (!substance?.casId) {
      sourcingRequestRef.current += 1;
      provenanceRequestRef.current += 1;
      return;
    }
    const requestId = ++sourcingRequestRef.current;
    setSourcing([]);
    setProvenanceRows([]); setProvenanceLoaded(false); setProvenanceError("");
    supabase.from("substance_sourcing")
      .select('"SUBSTANCE_ID","SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE","SUBSTANCE_SOURCING_LOCAL_NAME","SUBSTANCE_SOURCING_REFERENCE","SUBSTANCE_SOURCING_TYPE_ID"')
      .eq("SUBSTANCE_ID", substance.casId)
      .then(({ data }) => {
        if (requestId === sourcingRequestRef.current) setSourcing(data || []);
      });
    return () => { sourcingRequestRef.current += 1; };
  }, [substance?.casId, timelineRunId]);

  if (!substance) return null;

  const loadSubstanceProvenance = async () => {
    const requestId = ++provenanceRequestRef.current;
    const selectedSubstanceReferenceId = substance.id;
    const selectedSubstanceId = substance.casId;
    setProvenanceLoading(true);
    setProvenanceError("");
    try {
      const { rows } = await invokeAuthorizedData({ action: "provenance", entityType: "substance", substanceReferenceId: selectedSubstanceReferenceId, substanceId: selectedSubstanceId, asOfRunId: timelineRunId });
      if (requestId !== provenanceRequestRef.current) return;
      setProvenanceRows(rows || []);
      setProvenanceLoaded(true);
    } catch (e) {
      if (requestId !== provenanceRequestRef.current) return;
      console.error(e);
      setProvenanceError("Unable to load source evidence records.");
    } finally {
      if (requestId === provenanceRequestRef.current) setProvenanceLoading(false);
    }
  };

  const subEvidence = evidenceSummary.filter(e => e.substance_reference_id === substance.id);
  const totalMentions = subEvidence.reduce((s, e) => s + e.evidence_count, 0);
  const companyIds = [...new Set(subEvidence.map(e => e.company_id))];
  const linkedCompanies = companies.filter(c => companyIds.includes(c.id)).sort((a, b) => b.risk - a.risk);
  const dataSources = substanceDataSources.filter(ds => ds.substance_reference_id === substance.id).sort((a, b) => b.mention_count - a.mention_count);
  const evidenceBreakdown = evidenceTypes.map(et => ({ ...et, count: subEvidence.filter(e => e.evidence_type_id === et.id).reduce((s, e) => s + e.evidence_count, 0) })).filter(et => et.count > 0);
  const categories = [...new Set(sourcing.map(s => s.SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE).filter(Boolean))];
  const synonyms = sourcing.filter(s => s.SUBSTANCE_SOURCING_TYPE_ID === 3).map(s => s.SUBSTANCE_SOURCING_LOCAL_NAME).filter(Boolean);
  const references = [...new Set(sourcing.map(s => s.SUBSTANCE_SOURCING_REFERENCE).filter(Boolean))];
  const addSubstanceToDossier = () => {
    if (!onAddToDossier) return;
    onAddToDossier(buildSubstanceDossierItem({
      substance,
      totalMentions,
      linkedCompanyCount: linkedCompanies.length,
      sourceCount: dataSources.length,
      provenanceRows,
      sourceReferences: references,
    }));
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* Col 1 — Overview */}
      <DrawerCol label="OVERVIEW" T={T} minWidth={240}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[["MENTIONS", totalMentions.toLocaleString()], ["COMPANIES", linkedCompanies.length], ["SOURCES", dataSources.length]].map(([k, v]) => (
            <div key={k} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 12px" }}>
              <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1 }}>{k}</div>
              <div style={{ color: T.text, fontSize: 22, fontWeight: 700, marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
        {categories.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 7 }}>CATEGORY</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {categories.map(c => <span key={c} style={{ background: T.accentBg, color: T.accent, fontSize: 11, padding: "3px 10px", borderRadius: 3, fontWeight: 700 }}>{c}</span>)}
            </div>
          </div>
        )}
        {substance.description && (
          <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "11px 13px", fontSize: 13, color: T.textMid, lineHeight: 1.7, marginBottom: 14 }}>
            {substance.description}
          </div>
        )}
        {evidenceBreakdown.length > 0 && (
          <div>
            <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>SOURCE EVIDENCE BY TYPE</div>
            <div style={{ display: "flex", gap: 8 }}>
              {evidenceBreakdown.map(et => (
                <div key={et.id} style={{ flex: 1, background: T.surfaceAlt, borderLeft: `3px solid ${evidCol(et.name, dark)}`, borderRadius: 5, padding: "9px 12px" }}>
                  <div style={{ color: evidCol(et.name, dark), fontSize: 10, fontWeight: 700 }}>{et.name}</div>
                  <div style={{ color: T.text, fontSize: 20, fontWeight: 700, marginTop: 3 }}>{et.count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {onAddToDossier && (
          <button
            type="button"
            onClick={addSubstanceToDossier}
            style={{ width: "100%", background: isInDossier ? T.accentBg : T.surface, color: isInDossier ? T.accent : T.text, border: `1px solid ${isInDossier ? T.accent : T.borderMid}`, borderRadius: 6, padding: "10px 12px", marginTop: 16, cursor: "pointer", textAlign: "left", fontFamily: "Georgia, serif" }}
          >
            <div style={{ color: isInDossier ? T.accent : T.text, fontSize: 12, fontWeight: 700 }}>{isInDossier ? "Update dossier item" : "Add to dossier"}</div>
            <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>Keep the reviewed ingredient summary, linked companies, and source context in the in-app packet builder.</div>
          </button>
        )}
      </DrawerCol>

      {/* Col 2 — Aliases + References + Sources */}
      <DrawerCol label="SYNONYMS & REFERENCES" T={T} minWidth={240}>
        {synonyms.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>SYNONYMS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {synonyms.map((s, i) => <span key={i} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textMid, fontSize: 12, padding: "3px 10px", borderRadius: 3 }}>{s}</span>)}
            </div>
          </div>
        )}
        {references.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>INGREDIENT REFERENCES</div>
            {references.map((r, i) => (
              <a key={i} href={r} target="_blank" rel="noreferrer" style={{ display: "block", color: T.accent, fontSize: 12, marginBottom: 6, wordBreak: "break-all" }}>{r}</a>
            ))}
          </div>
        )}
        {dataSources.length > 0 && (
          <div>
            <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>DATA SOURCES</div>
            {dataSources.map((ds, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ color: T.text, fontSize: 13 }}>{ds.data_source_name}</div>
                  <div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>{ds.data_source_type}</div>
                </div>
                <span style={{ color: T.accent, background: T.accentBg, fontSize: 12, padding: "3px 10px", borderRadius: 3, fontWeight: 600, flexShrink: 0, marginLeft: 10 }}>{ds.mention_count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </DrawerCol>

      {/* Col 3 — Linked Companies */}
      <DrawerCol label={`LINKED COMPANIES (${linkedCompanies.length})`} T={T} minWidth={280}>
        {linkedCompanies.length === 0
          ? <div style={{ color: T.textMuted, fontSize: 13 }}>No linked companies found</div>
          : linkedCompanies.map(c => {
            const evCount = subEvidence.filter(e => e.company_id === c.id).reduce((s, e) => s + e.evidence_count, 0);
            return (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ color: T.text, fontSize: 13, fontWeight: 600, flex: 1, paddingRight: 10 }}>{c.name}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{evCount.toLocaleString()}</span>
                  <span style={{ background: riskBg(c.risk, dark), color: riskColor(c.risk, dark), border: `1px solid ${riskColor(c.risk, dark)}55`, padding: "2px 8px", borderRadius: 3, fontSize: 12, fontWeight: 700 }}>{c.risk}</span>
                </div>
              </div>
            );
          })}
        <EvidenceProvenancePanel
          title="SOURCE EVIDENCE RECORDS"
          summary="Trace aggregate mentions and linked companies back to the source rows that support this ingredient."
          rows={provenanceRows}
          loading={provenanceLoading}
          loaded={provenanceLoaded}
          error={provenanceError}
          onLoad={loadSubstanceProvenance}
          onAddRow={onAddEvidenceToDossier}
          isRowInDossier={isEvidenceInDossier}
          T={T}
          dark={dark}
        />
      </DrawerCol>
    </div>
  );
}

// ── Search Bar ─────────────────────────────────────────────────────────────
const SEARCH_TYPE_STYLE = (type, dark) => {
  const styles = {
    company: { bg: dark ? "#2d3e78" : "#dfe7ff", color: dark ? "#fff4df" : "#233d8b" },
    substance: { bg: dark ? "#355a35" : "#dff4d6", color: dark ? "#fff4df" : "#2f6d3d" },
    linkage: { bg: dark ? "#5a2845" : "#ffd9ea", color: dark ? "#fff4df" : "#a0315b" },
    association: { bg: dark ? "#5a2845" : "#ffd9ea", color: dark ? "#fff4df" : "#a0315b" },
    evidence: { bg: dark ? "#6a351f" : "#ffe1d2", color: dark ? "#fff4df" : "#b55326" },
    synonym: { bg: dark ? "#6b5422" : "#ffeab0", color: dark ? "#fff4df" : "#8d5f00" },
  };
  return styles[type] || styles.company;
};

function SearchBar({ query, onChange, T, dark, mode, filter, onFilterChange, results, resultCounts, rawResultCount, searched, onSelectResult, onViewMore, onBuildGraphFromResult, loading, inputRef }) {
  const copy = SEARCH_MODE_COPY[mode] || SEARCH_MODE_COPY.investigator;
  const open = query.length > 1 && (loading || searched || results.length > 0 || rawResultCount > 0);
  const activeFilter = getSearchFilter(filter);
  const handleSelect = result => {
    onSelectResult(result);
    onChange("");
  };

  return (
    <div style={{ position: "relative", flex: "2 1 460px", minWidth: 260, maxWidth: 680 }}>
      <div style={{ background: T.surface, border: `2px solid ${query ? T.accent : T.border}`, borderRadius: 12, padding: "8px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: loading ? T.accent : T.textMuted, fontSize: 13 }}>{loading ? "⟳" : "⌕"}</span>
          <input ref={inputRef} value={query} onChange={e => onChange(e.target.value)} placeholder={copy.placeholder}
            style={{ background: "none", border: "none", outline: "none", color: T.text, fontSize: 12, fontFamily: BODY_FONT, flex: "1 1 220px", minWidth: 140 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 5, color: T.textMuted, fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Filter
            <select
              value={filter}
              onChange={e => onFilterChange(e.target.value)}
              aria-label="Search scope"
              style={{ appearance: "none", WebkitAppearance: "none", background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 10, color: T.text, cursor: "pointer", fontSize: 10, fontFamily: BODY_FONT, padding: "5px 9px", maxWidth: 150 }}
            >
              {SEARCH_FILTERS.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          {query && <button onClick={() => onChange("")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>}
        </div>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: T.surface, border: `2px solid ${T.border}`, borderRadius: 12, marginTop: 6, maxHeight: 400, overflowY: "auto", width: "min(440px, calc(100vw - 32px))" }}>
          {loading && results.length === 0 && (
            <div style={{ padding: "14px", color: T.textMuted, fontSize: 11, textAlign: "center" }}>Searching...</div>
          )}
          {results.length > 0 && (
            <>
              {searchGroupOrder(mode).map(type => {
                const group = results.filter(r => r.type === type);
                if (!group.length) return null;
                const s = SEARCH_TYPE_STYLE(type, dark);
                const total = resultCounts[type] || group.length;
                return (
                  <div key={type}>
                    <div style={{ padding: "6px 14px 3px", fontSize: 9, letterSpacing: 1.2, color: T.textMuted, background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, fontWeight: 700 }}>
                      {searchTypeLabel(type).toUpperCase()} ({group.length < total ? `${group.length} OF ${total}` : total})
                    </div>
                    {group.map((r, i) => {
                      const artifactSeed = getSearchResultArtifactSeed(r);
                      return (
                        <div key={i} role="button" tabIndex={0} onClick={() => handleSelect(r)} onKeyDown={onKeyboardActivate(() => handleSelect(r))}
                          style={{ padding: "9px 14px", cursor: "pointer", borderBottom: `1px solid ${T.border}` }}
                          onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, fontWeight: 700, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{searchTypeLabel(type).toUpperCase()}</span>
                            <span style={{ color: T.text, fontSize: 12, fontWeight: 600 }}>{r.label}</span>
                          </div>
                          {r.sublabel && <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3, marginLeft: 46 }}>{r.sublabel}</div>}
                          {artifactSeed && onBuildGraphFromResult && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                onBuildGraphFromResult(r);
                                onChange("");
                              }}
                              style={{ marginTop: 7, marginLeft: 46, background: T.surfaceAlt, color: T.accent, border: `2px solid ${T.borderMid}`, borderRadius: 8, padding: "4px 9px", cursor: "pointer", fontSize: 10, fontFamily: BODY_FONT }}
                            >
                              Build graph from this
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {total > group.length && (
                      <button
                        type="button"
                        onClick={() => onViewMore(type)}
                        style={{ width: "100%", textAlign: "left", padding: "8px 14px", background: T.surfaceAlt, border: "none", borderBottom: `1px solid ${T.border}`, color: T.accent, cursor: "pointer", fontSize: 11, fontFamily: BODY_FONT }}
                      >
                        View all {total} {searchTypeLabel(type)} results
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {!loading && searched && results.length === 0 && query.length > 1 && (
            <div style={{ padding: "14px", color: T.textMuted, fontSize: 11, textAlign: "center" }}>
              {copy.empty} for "{query}" in {activeFilter.label}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchResultsPanel({ query, type, results, onSelect, onBuildGraphFromResult, dark }) {
  const T = dark ? DARK : LIGHT;
  const s = SEARCH_TYPE_STYLE(type, dark);
  return (
    <div style={{ padding: 18 }}>
      <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.55, marginBottom: 14 }}>
        Showing authorized {searchTypeLabel(type).toLowerCase()} matches returned for "{query}". Select a row to open the same type-aware detail behavior used by quick suggestions.
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {results.map((result, i) => {
          const artifactSeed = getSearchResultArtifactSeed(result);
          return (
            <div
              key={`${result.type}-${result.label}-${i}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(result)}
              onKeyDown={onKeyboardActivate(() => onSelect(result))}
              style={{ textAlign: "left", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, cursor: "pointer", color: T.text, fontFamily: "Georgia,serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, fontWeight: 700, background: s.bg, color: s.color }}>{searchTypeLabel(result.type).toUpperCase()}</span>
                <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{result.label}</span>
              </div>
              {result.sublabel && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 5 }}>{result.sublabel}</div>}
              {artifactSeed && onBuildGraphFromResult && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onBuildGraphFromResult(result);
                  }}
                  style={{ marginTop: 9, background: T.surface, color: T.accent, border: `1px solid ${T.borderMid}`, borderRadius: 999, padding: "5px 10px", cursor: "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                >
                  Build graph from this
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Network Graph ──────────────────────────────────────────────────────────
function NetworkGraph({ companies, associations, artifactEdges = [], onSelectCompany, onSelectArtifact, selectedId, seedId, dark, onViewApiChange = null }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const draggingRef = useRef(null);
  const selectedIdRef = useRef(selectedId);
  const seedIdRef = useRef(seedId);
  const hovRef = useRef(null);
  const darkRef = useRef(dark);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { seedIdRef.current = seedId; }, [seedId]);
  useEffect(() => { darkRef.current = dark; }, [dark]);
  useEffect(() => {
    if (!onViewApiChange) return undefined;
    const api = {
      zoomIn() {
        zoomRef.current = Math.min(zoomRef.current * 1.15, 4);
      },
      zoomOut() {
        zoomRef.current = Math.max(zoomRef.current * 0.87, 0.3);
      },
      reset() {
        zoomRef.current = 1;
        panRef.current = { x: 0, y: 0 };
      },
    };
    onViewApiChange(api);
    return () => {
      onViewApiChange(null);
    };
  }, [onViewApiChange]);

  // Convert screen coords to world coords
  const toWorld = (sx, sy) => ({
    x: (sx - panRef.current.x) / zoomRef.current,
    y: (sy - panRef.current.y) / zoomRef.current,
  });

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cancelAnimationFrame(animRef.current);
    const W = cv.width = cv.offsetWidth, H = cv.height = cv.offsetHeight;
    const cx = W / 2, cy = H / 2;
    panRef.current = { x: 0, y: 0 };
    zoomRef.current = 1;
    const ids = new Set(companies.map(c => c.id));
    const companyEdges = associations.filter(a => ids.has(a.from) && ids.has(a.to)).map(edge => ({ ...edge, edgeType: "company" }));
    const artifactMap = new Map();
    artifactEdges
      .filter(edge => ids.has(edge.companyId) && ["email", "phone"].includes(edge.kind))
      .forEach(edge => {
        const key = `artifact:${edge.kind}:${String(edge.value || "").toLowerCase()}`;
        const artifact = artifactMap.get(key) || { id: key, kind: edge.kind, value: edge.value, method: edge.method, companyCount: edge.companyCount || 0, companyIds: new Set(), associationIds: new Set() };
        artifact.companyIds.add(edge.companyId);
        if (edge.associationId) artifact.associationIds.add(edge.associationId);
        artifactMap.set(key, artifact);
      });
    const artifactNodes = [...artifactMap.values()];
    edgesRef.current = [
      ...companyEdges,
      ...artifactNodes.flatMap(artifact => [...artifact.companyIds].map(companyId => ({
        id: `${artifact.id}:${companyId}`,
        from: companyId,
        to: artifact.id,
        method: artifact.method,
        value: artifact.value,
        edgeType: "artifact",
      }))),
    ];
    const renderedDegree = new Map();
    edgesRef.current.forEach(edge => {
      renderedDegree.set(edge.from, (renderedDegree.get(edge.from) || 0) + 1);
      renderedDegree.set(edge.to, (renderedDegree.get(edge.to) || 0) + 1);
    });
    const anchorCompanyIds = new Set(
      [...renderedDegree.entries()]
        .filter(([id]) => ids.has(id))
        .sort(([, a], [, b]) => b - a)
        .slice(0, Math.min(3, Math.max(0, companies.length - 10)))
        .map(([id]) => id),
    );
    const companyNodes = companies.map((c, i) => {
      const ang = (i / companies.length) * Math.PI * 2;
      const pr = Math.min(W, H) * 0.38;
      const ex = nodesRef.current.find(n => n.id === c.id);
      const visibleSharedLinks = renderedDegree.get(c.id) || 0;
      return {
        id: c.id,
        kind: "company",
        degree: visibleSharedLinks,
        sharedInfrastructureLinks: visibleSharedLinks,
        x: ex ? ex.x : cx + Math.cos(ang) * pr + (Math.random() - 0.5) * 60,
        y: ex ? ex.y : cy + Math.sin(ang) * pr + (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        c,
      };
    });
    const artifactNodeModels = artifactNodes.map((a, i) => {
      const ang = (i / Math.max(artifactNodes.length, 1)) * Math.PI * 2 + Math.PI / 8;
      const pr = Math.min(W, H) * 0.48;
      const ex = nodesRef.current.find(n => n.id === a.id);
      return { id: a.id, kind: "artifact", x: ex ? ex.x : cx + Math.cos(ang) * pr + (Math.random() - 0.5) * 45, y: ex ? ex.y : cy + Math.sin(ang) * pr + (Math.random() - 0.5) * 45, vx: 0, vy: 0, a };
    });
    nodesRef.current = [...companyNodes, ...artifactNodeModels];
    const gn = id => nodesRef.current.find(n => n.id === id);
    const nodeRadius = n => n.kind === "artifact" ? 10 + Math.min(n.a.companyCount || 1, 6) * 1.5 : graphNodeRadiusFromCount(n.sharedInfrastructureLinks || n.degree || 0);
    const sim = () => {
      const ns = nodesRef.current;
      for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[j].x - ns[i].x, dy = ns[j].y - ns[i].y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = 40000 / (d * d);
        ns[i].vx -= (dx / d) * f; ns[i].vy -= (dy / d) * f; ns[j].vx += (dx / d) * f; ns[j].vy += (dy / d) * f;
      }
      edgesRef.current.forEach(e => {
        const s = gn(e.from), t = gn(e.to); if (!s || !t) return;
        const targetDistance = e.edgeType === "artifact" ? 145 : 380;
        const dx = t.x - s.x, dy = t.y - s.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - targetDistance) * 0.008;
        s.vx += (dx / d) * f; s.vy += (dy / d) * f; t.vx -= (dx / d) * f; t.vy -= (dy / d) * f;
      });
      ns.forEach(n => {
        n.vx += (cx - n.x) * 0.0005; n.vy += (cy - n.y) * 0.0005;
        if (draggingRef.current === n.id) return;
        n.vx *= 0.82; n.vy *= 0.82;
        n.x = Math.max(80, Math.min(W - 80, n.x + n.vx)); n.y = Math.max(80, Math.min(H - 80, n.y + n.vy));
      });
    };
    const draw = () => {
      const ctx = cv.getContext("2d"), isDark = darkRef.current, selId = selectedIdRef.current, currentSeedId = seedIdRef.current, Th = isDark ? DARK : LIGHT;
      const z = zoomRef.current, px = panRef.current.x, py = panRef.current.y;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(z, z);
      if (isDark) {
        ctx.strokeStyle = "rgba(255,255,255,0.025)"; ctx.lineWidth = 1 / z;
        for (let x = 0; x < W / z; x += 40) { ctx.beginPath(); ctx.moveTo(x, -py/z); ctx.lineTo(x, (H - py) / z); ctx.stroke(); }
        for (let y = 0; y < H / z; y += 40) { ctx.beginPath(); ctx.moveTo(-px/z, y); ctx.lineTo((W - px) / z, y); ctx.stroke(); }
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.045)";
        for (let x = 0; x < W / z + Math.abs(px/z); x += 24) for (let y = 0; y < H / z + Math.abs(py/z); y += 24) { ctx.beginPath(); ctx.arc(x - (px%24)/z, y - (py%24)/z, 0.8/z, 0, Math.PI * 2); ctx.fill(); }
      }
      edgesRef.current.forEach(e => {
        const s = gn(e.from), t = gn(e.to); if (!s || !t) return;
        const col = linkCol(e.method, isDark);
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = col + (e.edgeType === "artifact" ? "77" : "55"); ctx.lineWidth = (e.edgeType === "artifact" ? 1.1 : 1.5) / z;
        if (!isDark) ctx.setLineDash([5/z, 5/z]); ctx.stroke(); ctx.setLineDash([]);
      });
      nodesRef.current.forEach(n => {
        if (n.kind === "artifact") {
          const r = nodeRadius(n), col = linkCol(n.a.method, isDark);
          const isHov = hovRef.current === n.id;
          const isSelectedArtifact = selId === n.id;
          const isSeed = currentSeedId === n.id;
          const companyCount = n.a.companyIds?.size || n.a.companyCount || 0;
          if (isSeed) {
            ctx.beginPath(); ctx.arc(n.x, n.y, r + 12, 0, Math.PI * 2);
            ctx.strokeStyle = col + "77"; ctx.lineWidth = 3 / z; ctx.stroke();
            ctx.font = `bold ${8}px Georgia,serif`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
            ctx.fillStyle = col; ctx.fillText("SEED", n.x, n.y - r - 10);
          } else if (isSelectedArtifact) {
            ctx.font = `bold ${8}px Georgia,serif`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
            ctx.fillStyle = col; ctx.fillText("SELECTED", n.x, n.y - r - 10);
          }
          ctx.save();
          ctx.translate(n.x, n.y);
          if (n.a.kind === "email") {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath(); ctx.rect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44);
          } else {
            ctx.beginPath(); ctx.roundRect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44, 4);
          }
          ctx.fillStyle = isDark ? "rgba(10,14,20,0.95)" : "rgba(255,255,255,0.96)";
          ctx.strokeStyle = col;
          ctx.lineWidth = (isHov || isSelectedArtifact || isSeed ? 2.7 : 1.6) / z;
          ctx.fill(); ctx.stroke();
          ctx.restore();
          ctx.font = `bold ${Math.max(8, r * 0.55)}px Georgia,serif`; ctx.fillStyle = col;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(n.a.kind === "email" ? "@" : "ph", n.x, n.y);
          if (isHov || isSelectedArtifact || isSeed) {
            ctx.font = `${9}px Georgia,serif`; ctx.textBaseline = "top";
            const valueLabel = n.a.value.length > 28 ? n.a.value.slice(0, 26) + "..." : n.a.value;
            const lbl = `${valueLabel} · ${companyCount} companies`, lw = ctx.measureText(lbl).width;
            ctx.fillStyle = isDark ? "rgba(7,11,16,0.92)" : "rgba(242,240,235,0.96)";
            ctx.fillRect(n.x - lw / 2 - 4, n.y + r + 3, lw + 8, 14);
            ctx.fillStyle = Th.textMid; ctx.fillText(lbl, n.x, n.y + r + 4);
          }
          ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
          return;
        }
        const { c } = n, r = nodeRadius(n);
        const visualMetrics = getCompanyVisualMetrics({
          company: c,
          renderedLinks: n.degree || 0,
          sharedInfrastructureLinks: n.sharedInfrastructureLinks || n.degree || 0,
          dark: isDark,
        });
        const col = visualMetrics.priorityColor;
        const bg = visualMetrics.priorityBg;
        const sel = selId === c.id, isHov = hovRef.current === c.id;
        const isSeed = currentSeedId === c.id;
        const isAnchor = anchorCompanyIds.has(c.id);
        const showLabel = companies.length <= 10 || sel || isHov || isSeed || isAnchor;
        if (sel || isHov || isSeed) { ctx.beginPath(); ctx.arc(n.x, n.y, r + (sel || isSeed ? 10 : 6), 0, Math.PI * 2); ctx.strokeStyle = col + (sel || isSeed ? "66" : "33"); ctx.lineWidth = (sel || isSeed ? 3 : 2) / z; ctx.stroke(); }
        if (isDark && (sel || isHov || isSeed)) { const grd = ctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, r * 3); grd.addColorStop(0, col + "22"); grd.addColorStop(1, "transparent"); ctx.beginPath(); ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill(); }
        if (!isDark) { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fillStyle = sel ? col : bg; ctx.fill();
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = col; ctx.lineWidth = (sel || isSeed ? 2.7 : 1.5) / z; ctx.stroke();
        if (sel || isHov || isSeed) {
          ctx.fillStyle = sel ? "#fff" : col; ctx.font = `bold ${Math.max(8, r * 0.34)}px Georgia,serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(visualMetrics.displayedCountText, n.x, n.y);
        }
        if (sel && !isSeed) {
          ctx.font = `bold ${8}px Georgia,serif`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
          ctx.fillStyle = col; ctx.fillText("SELECTED", n.x, n.y - r - 10);
        }
        if (showLabel) {
          ctx.font = `${10}px Georgia,serif`; ctx.textAlign = "center"; ctx.textBaseline = "top";
          const nameLabel = c.name.length > 26 ? c.name.slice(0, 24) + "..." : c.name;
          const prefix = isSeed ? "SEED · " : sel ? "SELECTED · " : "";
          const lbl = (sel || isHov || isSeed)
            ? `${prefix}${nameLabel} · ${visualMetrics.displayedCountLabel}: ${visualMetrics.sharedInfrastructureLinks} · ${GRAPH_PRIORITY_LABEL}: ${visualMetrics.priorityLabel}`
            : nameLabel;
          const lw = ctx.measureText(lbl).width;
          ctx.fillStyle = isDark ? "rgba(7,11,16,0.88)" : "rgba(242,240,235,0.92)";
          ctx.fillRect(n.x - lw / 2 - 3, n.y + r + 3, lw + 6, 14);
          ctx.fillStyle = Th.textMid; ctx.fillText(lbl, n.x, n.y + r + 4);
          ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        }
      });
      ctx.restore();
      // Zoom indicator
      if (z !== 1) {
        ctx.font = "10px Georgia,serif"; ctx.fillStyle = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)";
        ctx.textAlign = "right"; ctx.fillText(`${Math.round(z * 100)}%`, W - 12, H - 12); ctx.textAlign = "left";
      }
    };
    const loop = () => { sim(); draw(); animRef.current = requestAnimationFrame(loop); };
    animRef.current = requestAnimationFrame(loop);

    // Wheel zoom
    const onWheel = e => {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 1.1 : 0.91;
      const newZ = Math.min(Math.max(zoomRef.current * delta, 0.3), 4);
      panRef.current.x = mx - (mx - panRef.current.x) * (newZ / zoomRef.current);
      panRef.current.y = my - (my - panRef.current.y) * (newZ / zoomRef.current);
      zoomRef.current = newZ;
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => { cancelAnimationFrame(animRef.current); cv.removeEventListener("wheel", onWheel); };
  }, [companies, associations, artifactEdges]);

  const pt = e => { const r = canvasRef.current.getBoundingClientRect(); return { sx: e.clientX - r.left, sy: e.clientY - r.top, ...toWorld(e.clientX - r.left, e.clientY - r.top) }; };
  const hit = (wx, wy) => nodesRef.current.find(n => Math.hypot(n.x - wx, n.y - wy) < (n.kind === "artifact" ? 18 : 12 + Math.min(n.degree || 0, 12) * 1.6 + 8));

  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100%", cursor: "default", borderRadius: 18, background: dark ? "#2a1a15" : "#fff5da" }}
      onMouseMove={e => {
        const p = pt(e), n = hit(p.x, p.y);
        hovRef.current = n?.id || null;
        if (draggingRef.current === "PAN") {
          panRef.current.x += e.movementX; panRef.current.y += e.movementY;
          canvasRef.current.style.cursor = "grabbing";
        } else if (draggingRef.current) {
          const nd = nodesRef.current.find(x => x.id === draggingRef.current);
          if (nd) { nd.x = p.x; nd.y = p.y; nd.vx = 0; nd.vy = 0; }
          canvasRef.current.style.cursor = "grabbing";
        } else {
          canvasRef.current.style.cursor = n ? "pointer" : "grab";
        }
      }}
      onMouseDown={e => {
        const p = pt(e), n = hit(p.x, p.y);
        if (n) draggingRef.current = n.id;
        else draggingRef.current = "PAN";
      }}
      onMouseUp={e => {
        const p = pt(e), n = hit(p.x, p.y);
        if (n?.kind === "company" && draggingRef.current === n.id) onSelectCompany({ ...n.c, renderedLinks: n.degree || 0, sharedInfrastructureLinks: n.sharedInfrastructureLinks || 0 });
        if (n?.kind === "artifact" && draggingRef.current === n.id) {
          onSelectArtifact?.({
            ...n.a,
            companyIds: [...(n.a.companyIds || [])],
            associationIds: [...(n.a.associationIds || [])],
          });
        }
        draggingRef.current = null;
        canvasRef.current.style.cursor = "grab";
      }}
      onDoubleClick={() => { zoomRef.current = 1; panRef.current = { x: 0, y: 0 }; }}
    />
  );
}

// ── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ label, T }) {
  return (
    <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ height: 1, width: 16, background: T.borderMid }} />{label}<div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

// ── Substance Matrix ───────────────────────────────────────────────────────
function SubstanceMatrix({ substances, evidenceSummary, companies, onSelectSubstance, selectedId, dark }) {
  const T = dark ? DARK : LIGHT;
  const substancesWithCounts = useMemo(() => substances.map(s => {
    const cIds = new Set(evidenceSummary.filter(e => e.substance_reference_id === s.id).map(e => e.company_id));
    const totalMentions = evidenceSummary.filter(e => e.substance_reference_id === s.id).reduce((sum, e) => sum + e.evidence_count, 0);
    return { ...s, companyCount: cIds.size, totalMentions };
  }).sort((a, b) => b.companyCount - a.companyCount), [substances, evidenceSummary]);
  const maxCompanies = Math.max(...substancesWithCounts.map(s => s.companyCount), 1);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <SectionHeader label="SUBSTANCE INTELLIGENCE MATRIX — CLICK ANY CARD TO EXPLORE" T={T} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {substancesWithCounts.map(s => {
          const isSel = selectedId === s.id;
          const topCos = companies.filter(c => new Set(evidenceSummary.filter(e => e.substance_reference_id === s.id).map(e => e.company_id)).has(c.id)).sort((a, b) => b.risk - a.risk).slice(0, 3);
          return (
            <div key={s.id} role="button" tabIndex={0} aria-label={`Open ingredient ${s.name}`} onClick={() => onSelectSubstance(s)} onKeyDown={onKeyboardActivate(() => onSelectSubstance(s))}
              style={{ background: isSel ? T.accentBg : T.surface, border: `1px solid ${isSel ? T.accent : T.border}`, borderRadius: 8, padding: "16px 18px", cursor: "pointer", transition: "all 0.18s" }}
              onMouseEnter={e => { if (!isSel) { e.currentTarget.style.border = `1px solid ${T.accent}`; e.currentTarget.style.background = T.accentBg; } }}
              onMouseLeave={e => { if (!isSel) { e.currentTarget.style.border = `1px solid ${T.border}`; e.currentTarget.style.background = T.surface; } }}>
              <div style={{ color: T.text, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
              <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 14 }}>wt: {s.weight} · click to explore</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                {[["COMPANIES", s.companyCount], ["MENTIONS", s.totalMentions.toLocaleString()]].map(([k, v]) => (
                  <div key={k}><div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1 }}>{k}</div><div style={{ color: T.text, fontSize: k === "COMPANIES" ? 22 : 16, fontWeight: 700 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ width: `${(s.companyCount / maxCompanies) * 100}%`, height: "100%", background: T.accent, borderRadius: 2 }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {topCos.map(c => <span key={c.id} style={{ fontSize: 9, color: riskColor(c.risk, dark), background: riskBg(c.risk, dark), padding: "2px 6px", borderRadius: 2, border: `1px solid ${riskColor(c.risk, dark)}33` }}>{c.name.split(" ")[0]}</span>)}
                {s.companyCount > 3 && <span style={{ fontSize: 9, color: T.textMuted }}>+{s.companyCount - 3}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Flags Table ────────────────────────────────────────────────────────────
function ScoreBar({ evidenceScore, substanceScore, companyTagScore, dark, T }) {
  const total = evidenceScore + substanceScore + companyTagScore || 1;
  const pct = v => Math.max(2, Math.round((v / total) * 100));
  const bars = [
    { label: "Source Evidence", value: evidenceScore, color: dark ? "#5ac8fa" : "#007aff", pct: pct(evidenceScore) },
    { label: "Ingredient", value: substanceScore, color: dark ? "#34c759" : "#248a3d", pct: pct(substanceScore) },
    { label: "Company Tags", value: companyTagScore, color: dark ? "#ff9500" : "#c93400", pct: pct(companyTagScore) },
  ];
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1, marginBottom: 6 }}>
        {bars.map(b => (
          <div key={b.label} style={{ width: `${b.pct}%`, background: b.color, transition: "width 0.4s" }} title={`${b.label}: ${b.value.toLocaleString()}`} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {bars.map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: b.color, flexShrink: 0 }} />
            <span style={{ color: T.textMuted, fontSize: 9 }}>{b.label}</span>
            <span style={{ color: T.textMid, fontSize: 9, fontWeight: 600 }}>{b.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlagsTable({ companies, onSelect, selectedId, dark, getCompanyGraphMetrics }) {
  const T = dark ? DARK : LIGHT;
  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SectionHeader label="TOP COMPANY SIGNALS — RANKED BY V2 SCORE" T={T} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: T.accentBg, border: `1px solid ${T.accent}33`, borderRadius: 5, padding: "4px 12px", fontSize: 10, color: T.accent, fontWeight: 600 }}>● LIVE SCORE v2</div>
          <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 5, padding: "4px 12px", fontSize: 10, color: T.textMuted }}>○ LEGACY (reference only)</div>
        </div>
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Georgia,serif", fontSize: 12 }}>
          <thead>
            <tr style={{ background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>
              {["RANK", "COMPANY", "TYPE", "SCORE BREAKDOWN", "V2 SCORE", "LEGACY", "SHARED LINKS", "PRIORITY"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: T.textMuted, fontSize: 9, letterSpacing: 1.2, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((c, i) => {
              const isSel = selectedId === c.id;
              const legacyRisk = c.legacyWeight > 0 ? Math.max(Math.round((c.legacyWeight / (companies[0]?.legacyWeight || 1)) * 100), 1) : 0;
              const visualMetrics = getCompanyVisualMetrics({ company: c, canonicalMetrics: getCompanyGraphMetrics?.(c.id), dark });
              return (
                <tr key={c.id} tabIndex={0} onClick={() => onSelect(c)} onKeyDown={onKeyboardActivate(() => onSelect(c))}
                  aria-label={`Open company ${c.name}`}
                  style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: isSel ? T.accentBg : "transparent" }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.surfaceAlt; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "10px 14px", color: T.textMuted, fontSize: 11, fontWeight: 700, width: 40 }}>#{i + 1}</td>
                  <td style={{ padding: "10px 14px", minWidth: 200 }}>
                    <div style={{ color: T.text, fontWeight: 600 }}>{c.name}</div>
                    {c.chineseName && <div style={{ color: T.textMuted, fontSize: 10 }}>{c.chineseName}</div>}
                    <div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>{c.evidenceCount.toLocaleString()} records · {c.substancesLinked} ingredients</div>
                  </td>
                  <td style={{ padding: "10px 14px", color: T.textMid, fontSize: 11, whiteSpace: "nowrap" }}>{c.type || "—"}</td>
                  <td style={{ padding: "10px 14px", minWidth: 220 }}>
                    <ScoreBar evidenceScore={c.evidenceScore} substanceScore={c.substanceScore} companyTagScore={c.companyTagScore} dark={dark} T={T} />
                  </td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ color: T.accent, fontWeight: 700, fontSize: 13 }}>{c.weight.toLocaleString()}</div>
                  </td>
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ color: T.textMuted, fontSize: 11 }}>{c.legacyWeight ? c.legacyWeight.toLocaleString() : "—"}</div>
                    {c.legacyWeight > 0 && (
                      <div style={{ fontSize: 9, color: legacyRisk > c.risk ? "#ff3b30" : legacyRisk < c.risk ? "#34c759" : T.textMuted, marginTop: 2 }}>
                        {legacyRisk > c.risk ? `▼ was ${legacyRisk}` : legacyRisk < c.risk ? `▲ was ${legacyRisk}` : `= ${legacyRisk}`}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span title={`${visualMetrics.sharedInfrastructureLinks.toLocaleString()} ${GRAPH_NODE_METRIC_LABEL.toLowerCase()}`} style={{ color: T.accent, background: T.accentBg, padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 600 }}>{visualMetrics.displayedCountText}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span title={`${GRAPH_PRIORITY_LABEL}: ${visualMetrics.priorityLabel}`} style={{ background: visualMetrics.priorityBg, color: visualMetrics.priorityColor, border: `1px solid ${visualMetrics.priorityColor}55`, padding: "2px 9px", borderRadius: 3, fontSize: 12, fontWeight: 700 }}>{visualMetrics.priorityLabel} · {visualMetrics.priorityScore}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, padding: "10px 14px", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
        <span style={{ color: T.accent, fontWeight: 600 }}>Score v2 methodology: </span>
        Source Evidence Score (sum of evidence record weights) + Ingredient Score (ingredient reference weights across linked rows) + Company Tag Score (benign analyst-assigned tags). Legacy score is preserved only for compatibility reference.
      </div>
    </div>
  );
}

// ── Media Tab ──────────────────────────────────────────────────────────────
function MediaTab({ dark, onAddToDossier, isInDossier, previewRequest, onHandledPreviewRequest }) {
  const T = dark ? DARK : LIGHT;
  const [subTab, setSubTab] = useState("images");
  const [images, setImages] = useState([]);
  const [pdfs, setPdfs] = useState({ specSheets: [], sourcePackets: [] });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const loadRequestRef = useRef(0);
  const imageModalRef = useRef(null);

  useEffect(() => {
    const requestId = ++loadRequestRef.current;
    const load = async () => {
      setLoading(true);
      try {
        const mediaData = await invokeAuthorizedMedia({ action: "list" });
        if (requestId !== loadRequestRef.current) return;
        const imgs = mediaData?.images || [];
        const specSheets = mediaData?.specSheets || [];
        const sourcePackets = mediaData?.sourcePackets || [];
        setImages(imgs);
        setPdfs({
          specSheets: (specSheets || []).filter(f => f.name !== ".emptyFolderPlaceholder"),
          sourcePackets: (sourcePackets || []).filter(f => f.name !== ".emptyFolderPlaceholder"),
        });
      } catch (e) {
        if (requestId !== loadRequestRef.current) return;
        console.error(e);
        setImages([]);
        setPdfs({ specSheets: [], sourcePackets: [] });
      } finally {
        if (requestId === loadRequestRef.current) setLoading(false);
      }
    };
    load();
    return () => { loadRequestRef.current += 1; };
  }, []);

  useEffect(() => {
    if (!selectedImage) return;
    imageModalRef.current?.focus();
    const onKeyDown = e => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage]);

  useEffect(() => {
    if (!previewRequest) return;
    const requestedMedia = previewRequest.media;
    if (!requestedMedia) return;
    setSubTab("images");
    setSearch(requestedMedia.image_name || requestedMedia.company_name_raw || "");
    const match = images.find(img => (
      (requestedMedia.image_id && img.image_id === requestedMedia.image_id)
      || (requestedMedia.storage_name && img.storage_name === requestedMedia.storage_name)
    ));
    const nextImage = match || requestedMedia;
    if (requestedMedia.previewUrl) {
      setImageError("");
      setSelectedImage({ ...nextImage, url: requestedMedia.previewUrl });
      onHandledPreviewRequest?.();
      return;
    }
    if (!nextImage?.storage_name) {
      onHandledPreviewRequest?.();
      return;
    }
    openImage(nextImage).finally(() => onHandledPreviewRequest?.());
  }, [images, onHandledPreviewRequest, previewRequest]);

  const openPdf = async (bucket, name) => {
    const url = await getAuthorizedMediaUrl(bucket, name);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const openImage = async img => {
    if (!img.storage_name) return;
    setImageError("");
    try {
      const url = await getAuthorizedMediaUrl(MEDIA_BUCKETS.images, img.storage_name);
      if (url) setSelectedImage({ ...img, url });
      else {
        setSelectedImage({ ...img, url: null });
        setImageError("This image could not be signed for viewing. The storage object may be missing or unavailable.");
      }
    } catch (e) {
      console.error(e);
      setSelectedImage({ ...img, url: null });
      setImageError("This image could not be loaded from the authorized media service.");
    }
  };

  const filteredImages = images.filter(img => !search || img.image_name.toLowerCase().includes(search.toLowerCase()) || (img.company_name_raw && img.company_name_raw.toLowerCase().includes(search.toLowerCase())));
  const filterPdfs = list => list.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "Georgia,serif", minWidth: 0 }}>
      <div style={{ padding: "14px 24px 8px", borderBottom: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {[["images", `Images (${images.length})`], ["specSheets", `Spec Sheets (${pdfs.specSheets.length})`], ["sourcePackets", `Source Packets (${pdfs.sourcePackets.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setSubTab(id)} style={{ padding: "7px 16px", borderRadius: "6px 6px 0 0", border: `1px solid ${subTab === id ? T.border : "transparent"}`, borderBottom: subTab === id ? `2px solid ${T.accent}` : "1px solid transparent", background: subTab === id ? T.bg : "transparent", color: subTab === id ? T.accent : T.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "Georgia,serif", fontWeight: subTab === id ? 700 : 400 }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surfaceAlt, border: `1px solid ${search ? T.accent : T.border}`, borderRadius: 6, padding: "5px 12px", marginBottom: 4, flex: "1 1 220px", maxWidth: 320 }}>
          <span style={{ color: T.textMuted, fontSize: 12 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: "none", border: "none", outline: "none", color: T.text, fontSize: 11, fontFamily: "Georgia,serif", width: "100%", minWidth: 0 }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 11 }}>✕</button>}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {loading ? <Spinner T={T} /> : (
          <>
            {subTab === "images" && (
              <>
                <SectionHeader label={`${filteredImages.length} IMAGES · CLICK TO VIEW FULL SIZE`} T={T} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(180px, 100%), 1fr))", gap: 12 }}>
                    {filteredImages.map(img => (
                      <div key={img.image_id}
                        role={img.storage_name ? "button" : undefined}
                        tabIndex={img.storage_name ? 0 : undefined}
                        aria-label={img.storage_name ? `Open image ${img.image_name}` : undefined}
                        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", cursor: img.storage_name ? "pointer" : "default", transition: "all 0.15s" }}
                        onMouseEnter={e => { if (img.storage_name) { e.currentTarget.style.border = `1px solid ${T.accent}`; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                        onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${T.border}`; e.currentTarget.style.transform = "none"; }}
                        onClick={() => openImage(img)}
                        onKeyDown={img.storage_name ? onKeyboardActivate(() => openImage(img)) : undefined}>
                      <div style={{ height: 130, background: T.surfaceAlt, position: "relative", overflow: "hidden" }}>
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 10 }}>{img.storage_name ? "Click to load" : "Unavailable"}</div>
                        <div style={{ position: "absolute", top: 6, right: 6 }}>
                          <span style={{ background: img.company_id ? T.accentBg : T.surfaceAlt, color: img.company_id ? T.accent : T.textMuted, fontSize: 8, padding: "2px 6px", borderRadius: 2, fontWeight: 700, border: img.company_id ? "none" : `1px solid ${T.border}` }}>{img.company_id ? "LINKED" : "UNLINKED"}</span>
                        </div>
                      </div>
                      <div style={{ padding: "8px 10px" }}>
                        <div style={{ color: T.text, fontSize: 10, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.image_name}</div>
                        {img.company_name_raw && <div style={{ color: T.textMuted, fontSize: 9, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.company_name_raw}</div>}
                        {img.company_match_score && <div style={{ color: T.textMuted, fontSize: 8, marginTop: 3 }}>Match: {(img.company_match_score * 100).toFixed(0)}%</div>}
                        {onAddToDossier && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onAddToDossier(img, selectedImage?.image_id === img.image_id ? selectedImage.url : "");
                            }}
                            style={{ marginTop: 7, width: "100%", background: isInDossier?.(img) ? T.accentBg : T.surfaceAlt, color: isInDossier?.(img) ? T.accent : T.textMid, border: `1px solid ${isInDossier?.(img) ? T.accent : T.border}`, borderRadius: 999, padding: "5px 8px", cursor: "pointer", fontSize: 9, fontWeight: 700, fontFamily: "Georgia,serif" }}
                          >
                            {isInDossier?.(img) ? "Update dossier" : "Add to dossier"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {(subTab === "specSheets" || subTab === "sourcePackets") && (() => {
              const bucket = subTab === "specSheets" ? "Spec Sheets" : "Source Packets";
              const list = filterPdfs(subTab === "specSheets" ? pdfs.specSheets : pdfs.sourcePackets);
              return (
                <>
                  <SectionHeader label={`${list.length} ${(subTab === "specSheets" ? "SPEC SHEETS" : "SOURCE PACKETS")} · CLICK TO OPEN`} T={T} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {list.map(f => (
                        <div key={f.name} role="button" tabIndex={0} onClick={() => openPdf(bucket, f.name)} onKeyDown={onKeyboardActivate(() => openPdf(bucket, f.name))}
                          aria-label={`Open ${f.name}`}
                          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                        onMouseLeave={e => e.currentTarget.style.background = T.surface}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 36, height: 36, background: subTab === "specSheets" ? (dark ? "#2a0a08" : "#fef2f2") : (dark ? "#1a1500" : "#fffbeb"), border: `1px solid ${subTab === "specSheets" ? (dark ? "#ff3b30" : "#b91c1c") : (dark ? "#ff9500" : "#92400e")}44`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 16 }}>📄</span>
                          </div>
                          <div>
                            <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{f.name.replace(/\.[^.]+$/, "").replace(/_/g, " ")}</div>
                            <div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>{f.name.split(".").pop()?.toUpperCase()}</div>
                          </div>
                        </div>
                        <span style={{ color: T.accent, fontSize: 12 }}>Open ↗</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>
      {selectedImage && (
        <div role="dialog" aria-modal="true" aria-label={selectedImage.image_name || "Image preview"} tabIndex={-1} ref={imageModalRef} style={{ position: "fixed", inset: 0, background: dark ? "rgba(7,11,16,0.82)" : "rgba(24,21,15,0.42)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(14px, 3vw, 36px)", backdropFilter: "blur(16px) saturate(1.1)", outline: "none" }} onClick={() => setSelectedImage(null)}>
          {selectedImage.url && (
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: `url(${selectedImage.url})`, backgroundPosition: "center", backgroundSize: "cover", filter: "blur(34px)", transform: "scale(1.08)", opacity: dark ? 0.18 : 0.24 }} />
          )}
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "min(92vw, 1200px)", maxHeight: "92vh", background: dark ? "rgba(10,14,20,0.94)" : "rgba(255,255,255,0.94)", border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", boxShadow: dark ? "0 24px 80px rgba(0,0,0,0.65)" : "0 24px 80px rgba(24,21,15,0.28)" }}>
            <div style={{ height: "min(76vh, 760px)", minHeight: "min(58vh, 560px)", background: dark ? "rgba(15,21,32,0.72)" : "rgba(248,246,242,0.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(10px, 2vw, 20px)" }}>
              {selectedImage.url && !imageError ? (
                <img src={selectedImage.url} alt={selectedImage.image_name} onError={() => setImageError("This signed image URL opened, but the browser could not render the file. Check whether the storage object exists and is a supported image type.")} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              ) : (
                <div style={{ color: T.textMuted, fontSize: 12, textAlign: "center", lineHeight: 1.6, maxWidth: 420 }}>
                  {imageError || "This image is unavailable."}
                </div>
              )}
            </div>
            <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{selectedImage.image_name}</div>
                {selectedImage.company_name_raw && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>{selectedImage.company_name_raw}</div>}
                {imageError && <div style={{ color: T.textMuted, fontSize: 10, marginTop: 4 }}>{imageError}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {onAddToDossier && (
                  <button
                    type="button"
                    onClick={() => onAddToDossier(selectedImage, selectedImage.url || "")}
                    style={{ background: isInDossier?.(selectedImage) ? T.accentBg : T.surfaceAlt, color: isInDossier?.(selectedImage) ? T.accent : T.textMid, border: `1px solid ${isInDossier?.(selectedImage) ? T.accent : T.border}`, cursor: "pointer", fontSize: 11, padding: "5px 11px", borderRadius: 999, fontFamily: "Georgia,serif", fontWeight: 700 }}
                  >
                    {isInDossier?.(selectedImage) ? "Update dossier" : "Add to dossier"}
                  </button>
                )}
                <button onClick={() => setSelectedImage(null)} aria-label="Close image preview" style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 12px", borderRadius: 4, fontFamily: "Georgia,serif" }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Schema & About Tab Data ────────────────────────────────────────────────

const SCHEMA_GROUPS = [
  {
    label: "Company", color: "#007aff", tables: [
      { name: "COMPANY", pk: "COMPANY_ID", fks: [], cols: ["COMPANY_NAME","CHINESE_NAME","ACTIVE_INACTIVE","BUSINESS_TYPE","PRC_HOME_BASE","GOV_COMPLICITY"] },
      { name: "CONSOLIDATED_COMPANY", pk: "CONSOLIDATED_NAME_ID", fks: [], cols: ["CONSOLIDATED_NAME"] },
      { name: "COMPANY_EVALUATION", pk: "COMPANY_ID", fks: ["COMPANY_ID→COMPANY"], cols: ["COMPANY_NAME","EVIDENCE_COMPANY_WEIGHT","TOTAL_WEIGHT"] },
    ]
  },
  {
    label: "Evidence", color: "#ff6b35", tables: [
      { name: "EVIDENCE", pk: "EVIDENCE_ID", fks: ["COMPANY_ID→COMPANY","SUBSTANCE_REFERENCE_ID→SUBSTANCE_REFERENCE","EVIDENCE_TYPE_ID→EVIDENCE_TYPE","DATA_SOURCE_ID→DATA_SOURCE"], cols: ["LISTED_NAME_SUBSTANCE","REGION","EVIDENCE_WEIGHT","URL","RECORD_ID"] },
      { name: "EVIDENCE_TYPE", pk: "EVIDENCE_TYPE_ID", fks: [], cols: ["EVIDENCE_TYPE_NAME"] },
    ]
  },
  {
    label: "Ingredient", color: "#34c759", tables: [
      { name: "SUBSTANCE_REFERENCE", pk: "SUBSTANCE_REFERENCE_ID", fks: ["SUBSTANCE_TYPE_ID→SUBSTANCE_TYPE"], cols: ["SUBSTANCE_NAME","SUBSTANCE_ID","SUBSTANCE_WEIGHT","SUBSTANCE_DESCRIPTION"] },
      { name: "SUBSTANCE_TYPE", pk: "SUBSTANCE_TYPE_ID", fks: [], cols: ["SUBSTANCE_TYPE_TITLE","SUBSTANCE_TYPE_DESCRIPTION"] },
      { name: "SUBSTANCE_SOURCING", pk: "SUBSTANCE_SOURCING_ID", fks: ["SUBSTANCE_ID→SUBSTANCE_REFERENCE","DATA_SOURCE_ID→DATA_SOURCE"], cols: ["SUBSTANCE_SOURCING_LOCAL_NAME","SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE"] },
      { name: "SUBSTANCE_SOURCING_TYPE", pk: "SUBSTANCE_SOURCING_TYPE_ID", fks: [], cols: ["SUBSTANCE_SOURCING_TYPE_TITLE"] },
    ]
  },
  {
    label: "Linkage & Association", color: "#af52de", tables: [
      { name: "LINKAGE", pk: "LINKAGEID", fks: ["COMPANY_ID→COMPANY","DATA_SOURCE_ID→DATA_SOURCE"], cols: ["LINKAGE_METHOD","LINKAGE_VALUE"] },
      { name: "ASSOCIATION", pk: "ASSOCIATIONID", fks: ["COMPANY_ID→COMPANY","ASSOCIATED_COMPANY_ID→COMPANY"], cols: ["LINKAGE_METHOD","LINKAGE_VALUE","LINKAGE_TYPE"] },
    ]
  },
  {
    label: "Weighting", color: "#ff9500", tables: [
      { name: "WEIGHTING_TAG", pk: "WEIGHTING_TAG_ID", fks: ["WEIGHTING_TAG_CATEGORY_ID→WEIGHTING_TAG_CATEGORY"], cols: ["WEIGHTING_TAG_TITLE","WEIGHTING_TAG_WEIGHT","WEIGHTING_TAG_DESCRIPTION"] },
      { name: "WEIGHTING_TAG_CATEGORY", pk: "WEIGHTING_TAG_CATEGORY_ID", fks: ["WEIGHTING_TAG_TYPE_ID→WEIGHTING_TAG_TYPE"], cols: ["WEIGHTING_TAG_CATEGORY_TITLE"] },
      { name: "WEIGHTING_TAG_TYPE", pk: "WEIGHTING_TAG_TYPE_ID", fks: [], cols: ["WEIGHTING_TAG_TYPE_TITLE"] },
      { name: "COMPANY_WEIGHTING_TAG", pk: "COMPANY_WEIGHTING_TAG_ID", fks: ["COMPANY_ID→COMPANY","WEIGHTING_TAG_ID→WEIGHTING_TAG"], cols: [] },
      { name: "EVIDENCE_WEIGHTING_TAG", pk: "EVIDENCE_WEIGHTING_TAG_ID", fks: ["EVIDENCE_ID→EVIDENCE","WEIGHTING_TAG_ID→WEIGHTING_TAG"], cols: [] },
      { name: "SUBSTANCE_WEIGHTING_TAG", pk: "SUBSTANCE_WEIGHTING_TAG_ID", fks: ["SUBSTANCE_REFERENCE_ID→SUBSTANCE_REFERENCE","WEIGHTING_TAG_ID→WEIGHTING_TAG"], cols: [] },
    ]
  },
  {
    label: "Data Source", color: "#5ac8fa", tables: [
      { name: "DATA_SOURCE", pk: "DATA_SOURCE_ID", fks: ["PARENT_DATA_SOURCE_ID→DATA_SOURCE"], cols: ["DATA_SOURCE_NAME","DATA_SOURCE_TYPE","URL","DATE_LOGGED"] },
    ]
  },
];

const ALL_TABLES_FLAT = SCHEMA_GROUPS.flatMap(g => g.tables.map(t => ({ ...t, groupColor: g.color, groupLabel: g.label })));

function Accordion({ title, icon, defaultOpen = false, T, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
      <div role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpen(o => !o)} onKeyDown={onKeyboardActivate(() => setOpen(o => !o))}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", cursor: "pointer", background: open ? T.accentBg : T.surface, borderBottom: open ? `1px solid ${T.border}` : "none" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = T.surfaceAlt; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = T.surface; }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ color: open ? T.accent : T.text, fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>{title}</span>
        </div>
        <span style={{ color: T.textMuted, fontSize: 13, display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
      </div>
      {open && <div style={{ padding: "20px 24px", background: T.surface }}>{children}</div>}
    </div>
  );
}

function SchemaERD({ dark, T }) {
  const canvasRef = useRef(null);
  const zoomRef = useRef(0.85);
  const panRef = useRef({ x: 20, y: 20 });
  const panningRef = useRef(null);

  const BOX_W = 188, BOX_H = 34;
  const positions = useMemo(() => ({
    COMPANY:                { x:320, y:50  },
    CONSOLIDATED_COMPANY:   { x:60,  y:50  },
    COMPANY_EVALUATION:     { x:320, y:190 },
    EVIDENCE:               { x:560, y:120 },
    EVIDENCE_TYPE:          { x:800, y:50  },
    SUBSTANCE_REFERENCE:    { x:560, y:300 },
    SUBSTANCE_TYPE:         { x:800, y:300 },
    SUBSTANCE_SOURCING:     { x:560, y:430 },
    SUBSTANCE_SOURCING_TYPE:{ x:800, y:430 },
    LINKAGE:                { x:60,  y:240 },
    ASSOCIATION:            { x:60,  y:360 },
    WEIGHTING_TAG:          { x:320, y:420 },
    WEIGHTING_TAG_CATEGORY: { x:320, y:540 },
    WEIGHTING_TAG_TYPE:     { x:60,  y:540 },
    COMPANY_WEIGHTING_TAG:  { x:560, y:560 },
    EVIDENCE_WEIGHTING_TAG: { x:560, y:640 },
    SUBSTANCE_WEIGHTING_TAG:{ x:560, y:720 },
    DATA_SOURCE:            { x:800, y:190 },
  }), []);

  const colorMap = useMemo(() => {
    const map = {};
    SCHEMA_GROUPS.forEach(g => g.tables.forEach(t => { map[t.name] = g.color; }));
    return map;
  }, []);

  const drawAll = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d");
    const z = zoomRef.current, px = panRef.current.x, py = panRef.current.y;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(z, z);

    // Grid
    ctx.strokeStyle = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"; ctx.lineWidth = 1/z;
    for (let x = -px/z; x < W/z; x += 32) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,1000); ctx.stroke(); }
    for (let y = -py/z; y < H/z; y += 32) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(1200,y); ctx.stroke(); }

    // FK lines
    ALL_TABLES_FLAT.forEach(t => {
      const from = positions[t.name]; if (!from) return;
      t.fks.forEach(fk => {
        const toName = fk.split("→")[1], to = positions[toName]; if (!to) return;
        const x1 = from.x + BOX_W/2, y1 = from.y + BOX_H/2;
        const x2 = to.x + BOX_W/2, y2 = to.y + BOX_H/2;
        ctx.beginPath(); ctx.moveTo(x1,y1);
        ctx.bezierCurveTo(x1,(y1+y2)/2,x2,(y1+y2)/2,x2,y2);
        ctx.strokeStyle = (colorMap[t.name]||"#888")+"55"; ctx.lineWidth = 1.5/z;
        ctx.setLineDash([4/z,3/z]); ctx.stroke(); ctx.setLineDash([]);
        const ang = Math.atan2(y2-(y1+y2)/2, x2-x1);
        ctx.beginPath(); ctx.moveTo(x2,y2);
        ctx.lineTo(x2-8*Math.cos(ang-0.4),y2-8*Math.sin(ang-0.4));
        ctx.lineTo(x2-8*Math.cos(ang+0.4),y2-8*Math.sin(ang+0.4));
        ctx.closePath(); ctx.fillStyle=(colorMap[t.name]||"#888")+"88"; ctx.fill();
      });
    });

    // Boxes
    ALL_TABLES_FLAT.forEach(t => {
      const p = positions[t.name]; if (!p) return;
      const col = colorMap[t.name]||"#888";
      if (!dark) { ctx.shadowColor="rgba(0,0,0,0.08)"; ctx.shadowBlur=5; ctx.shadowOffsetY=2; }
      ctx.beginPath(); ctx.roundRect(p.x,p.y,BOX_W,BOX_H,5);
      ctx.fillStyle = dark?"#0f1520":"#fff"; ctx.fill();
      ctx.shadowColor="transparent"; ctx.shadowBlur=0; ctx.shadowOffsetY=0;
      ctx.strokeStyle=col+"aa"; ctx.lineWidth=1.5/z; ctx.stroke();
      ctx.beginPath(); ctx.roundRect(p.x,p.y,4,BOX_H,[5,0,0,5]);
      ctx.fillStyle=col; ctx.fill();
      ctx.font=`bold 10px Georgia,serif`; ctx.fillStyle=dark?"#cdd6e8":"#18150f";
      ctx.textAlign="left"; ctx.textBaseline="middle";
      ctx.fillText(t.name, p.x+12, p.y+BOX_H/2);
      ctx.font=`8px Georgia,serif`; ctx.fillStyle=col;
      ctx.textAlign="right"; ctx.fillText("PK", p.x+BOX_W-8, p.y+BOX_H/2);
      ctx.textAlign="left";
    });

    ctx.restore();

    // HUD
    ctx.font="10px Georgia,serif"; ctx.fillStyle=dark?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.3)";
    ctx.textAlign="right"; ctx.fillText(`${Math.round(z*100)}% · scroll to zoom · drag to pan`, W-12, H-12);
    ctx.textAlign="left";
  }, [dark, colorMap, positions]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;
    drawAll();

    const onWheel = e => {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 1.1 : 0.91;
      const newZ = Math.min(Math.max(zoomRef.current * delta, 0.2), 3);
      panRef.current.x = mx - (mx - panRef.current.x) * (newZ / zoomRef.current);
      panRef.current.y = my - (my - panRef.current.y) * (newZ / zoomRef.current);
      zoomRef.current = newZ;
      drawAll();
    };

    const onDown = e => { panningRef.current = { x: e.clientX, y: e.clientY }; cv.style.cursor = "grabbing"; };
    const onMove = e => {
      if (!panningRef.current) return;
      panRef.current.x += e.clientX - panningRef.current.x;
      panRef.current.y += e.clientY - panningRef.current.y;
      panningRef.current = { x: e.clientX, y: e.clientY };
      drawAll();
    };
    const onUp = () => { panningRef.current = null; cv.style.cursor = "grab"; };
    const onDbl = () => { zoomRef.current = 0.85; panRef.current = { x: 20, y: 20 }; drawAll(); };

    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.addEventListener("mousedown", onDown);
    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("mouseup", onUp);
    cv.addEventListener("mouseleave", onUp);
    cv.addEventListener("dblclick", onDbl);
    return () => {
      cv.removeEventListener("wheel", onWheel);
      cv.removeEventListener("mousedown", onDown);
      cv.removeEventListener("mousemove", onMove);
      cv.removeEventListener("mouseup", onUp);
      cv.removeEventListener("mouseleave", onUp);
      cv.removeEventListener("dblclick", onDbl);
    };
  }, [drawAll]);

  return <canvas ref={canvasRef} style={{ width:"100%", height:520, display:"block", borderRadius:8, border:`1px solid ${T.border}`, cursor:"grab" }} />;
}

function AboutTab({ dark, substances, evidenceTotal, companyTotal, associationTotal, sourcePageTotal, linkageTotal, graphAssociationTotal }) {
  const T = dark ? DARK : LIGHT;
  return (
    <div style={{ height:"100%", overflowY:"auto", fontFamily:"Georgia,serif" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 32px 64px" }}>

        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
            <div style={{ width:40, height:40, borderRadius:8, background:T.navy, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:dark?"#ff3b30":"#ef4444" }} />
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:700, letterSpacing:2, color:T.text }}>SCRAPE &amp; BAKE</div>
              <div style={{ fontSize:11, color:T.textMuted, letterSpacing:1 }}>COOKIE INGREDIENT SUPPLY CHAIN DEMO</div>
            </div>
          </div>
          <div style={{ height:1, background:T.border, marginTop:16 }} />
        </div>

        <Accordion title="App Overview" icon="◈" defaultOpen={true} T={T}>
          <p style={{ color:T.textMid, fontSize:14, lineHeight:1.8, marginBottom:20 }}>
            Scrape &amp; Bake is a benign ingredient-supply-chain walkthrough built to demonstrate the existing company-network, scoring, and provenance workflows with synthetic company, ingredient, and source evidence records.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
            {[
              ["◈ Network Graph",`Force-directed graph of the most-connected companies or selected bounded graph seed. Company node size and node numbers reflect ${GRAPH_NODE_METRIC_LABEL.toLowerCase()}; color reflects ${GRAPH_PRIORITY_LABEL.toLowerCase()}. Click any node to open detail.`],
              ["⬡ Ingredient Matrix","Grid of all tracked ingredients with evidence counts and linked company indicators. Click any card to explore ingredient-level intelligence."],
              ["⚑ Company Signals","Top companies ranked by cumulative source evidence weight. Designed for rapid triage of the strongest supply-chain signals in the demo dataset."],
              ["⊞ Data Explorer","Paginated, searchable, sortable access to all underlying database tables. Includes column-level documentation and CSV export."],
              ["⊟ Images & Docs","Optional gallery surface for demo images, spec sheets, and source packets."],
              ["◎ About","This page — platform documentation, data dictionary, schema diagram, and signal score methodology."],
            ].map(([title,desc]) => (
              <div key={title} style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:7, padding:"14px 16px" }}>
                <div style={{ color:T.accent, fontWeight:700, fontSize:12, marginBottom:6 }}>{title}</div>
                <div style={{ color:T.textMid, fontSize:12, lineHeight:1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12 }}>
            {[
              ["Companies", companyTotal.toLocaleString()],
              ["Ingredients", substances.length],
              ["Network links", associationTotal.toLocaleString()],
              ["Source pages", sourcePageTotal > 0 ? sourcePageTotal.toLocaleString() : "…"],
              ["Linkage rows", linkageTotal > 0 ? linkageTotal.toLocaleString() : "…"],
              ["Source Evidence Records", evidenceTotal.toLocaleString()],
            ].map(([k,v]) => (
              <div key={k} style={{ flex:1, background:T.accentBg, border:`1px solid ${T.accent}33`, borderRadius:7, padding:"12px 16px" }}>
                <div style={{ color:T.textMuted, fontSize:9, letterSpacing:1.2 }}>{k.toUpperCase()}</div>
                <div style={{ color:T.accent, fontSize:24, fontWeight:700, marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 7, padding: "10px 14px", color: T.textMid, fontSize: 11, lineHeight: 1.65 }}>
            These are raw database rows and may include duplicate or repeated infrastructure observations. Deduplicated metrics are planned after schema cleanup. The current graph separately shows {graphAssociationTotal.toLocaleString()} visible graph associations, which is a smaller rendered subset.
          </div>
        </Accordion>

        <Accordion title="Signal Score Methodology" icon="⚑" T={T}>
          <p style={{ color:T.textMid, fontSize:14, lineHeight:1.8, marginBottom:18 }}>
            Each company is assigned a signal score between 1 and 100 based on its cumulative source-evidence weight relative to the highest-weighted company in the demo dataset. The score is not absolute. It reflects relative standing within the current demo and will shift as new source rows are added.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {[
              ["Step 1","Each source evidence record carries an EVIDENCE_WEIGHT assigned at ingestion, reflecting how directly a page supports a supply-chain observation. This is the primary signal."],
              ["Step 2","Each ingredient linked to an evidence record contributes its ingredient reference weight, which helps distinguish foundational inputs from lighter seasonal additions."],
              ["Step 3","Analyst-friendly company tags such as Signature Cookie Line, Cold-chain Handling, or Private-label Partner add a flat bonus. These are benign demo tags used to show how the scoring model can incorporate qualitative context."],
              ["Step 4","Score v2 = Evidence Score + Ingredient Score + Company Tag Score. Signal % = round((company_score / max_score) × 100). The legacy score is preserved for compatibility but is not used as the primary ranking surface."],
            ].map(([step,desc]) => (
              <div key={step} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ flexShrink:0, background:T.accentBg, color:T.accent, fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:4, letterSpacing:0.5, marginTop:2 }}>{step}</div>
                <div style={{ color:T.textMid, fontSize:13, lineHeight:1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {[[90,"≥ 85 — Critical"],[70,"65–84 — High"],[50,"45–64 — Medium"],[20,"< 45 — Low"]].map(([sc,label]) => (
              <div key={label} style={{ flex:1, background:riskBg(sc,dark), border:`1px solid ${riskColor(sc,dark)}44`, borderRadius:6, padding:"10px 14px" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:riskBg(sc,dark), border:`2px solid ${riskColor(sc,dark)}`, marginBottom:6 }} />
                <div style={{ color:riskColor(sc,dark), fontSize:12, fontWeight:700 }}>{label}</div>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="Data Dictionary" icon="⊞" T={T}>
          <p style={{ color:T.textMid, fontSize:13, lineHeight:1.7, marginBottom:20 }}>All tables and columns in the demo database, organized by domain. PK = Primary Key, FK = Foreign Key.</p>
          {SCHEMA_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <div style={{ width:12, height:12, borderRadius:2, background:group.color }} />
                <span style={{ color:T.text, fontWeight:700, fontSize:13 }}>{group.label}</span>
                <div style={{ flex:1, height:1, background:T.border }} />
              </div>
              {group.tables.map(tbl => (
                <div key={tbl.name} style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:7, marginBottom:10, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background:T.surface }}>
                    <div style={{ width:4, height:20, background:group.color, borderRadius:2 }} />
                    <span style={{ color:T.text, fontWeight:700, fontSize:13 }}>{tbl.name}</span>
                  </div>
                  <div style={{ padding:"10px 14px", display:"flex", flexWrap:"wrap", gap:6 }}>
                    <span style={{ background:group.color+"22", border:`1px solid ${group.color}55`, color:group.color, fontSize:10, padding:"3px 10px", borderRadius:3, fontWeight:700 }}>PK: {tbl.pk}</span>
                    {tbl.fks.map(fk => (
                      <span key={fk} style={{ background:T.accentBg, border:`1px solid ${T.accent}33`, color:T.accent, fontSize:10, padding:"3px 10px", borderRadius:3 }}>FK: {fk}</span>
                    ))}
                    {tbl.cols.map(col => {
                      const tip = COLUMN_TOOLTIPS[col];
                      return (
                        <span key={col} title={tip||""} style={{ background:T.surface, border:`1px solid ${T.border}`, color:T.textMid, fontSize:10, padding:"3px 10px", borderRadius:3, cursor:tip?"help":"default" }}>
                          {col}{tip?" ⓘ":""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </Accordion>

        <Accordion title="Schema Diagram" icon="⬡" T={T}>
          <p style={{ color:T.textMid, fontSize:13, lineHeight:1.7, marginBottom:16 }}>Entity-relationship diagram showing all tables and foreign key references. Colors correspond to domain groups. Dashed lines indicate FK relationships.</p>
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{ flex:1, minWidth:0 }}><SchemaERD dark={dark} T={T} /></div>
            <div style={{ width:190, flexShrink:0 }}>
              <div style={{ color:T.textMuted, fontSize:10, letterSpacing:1, marginBottom:10 }}>DOMAIN GROUPS</div>
              {SCHEMA_GROUPS.map(g => (
                <div key={g.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:12, height:12, borderRadius:2, background:g.color, flexShrink:0 }} />
                  <span style={{ color:T.textMid, fontSize:12 }}>{g.label}</span>
                </div>
              ))}
              <div style={{ marginTop:16, color:T.textMuted, fontSize:10, letterSpacing:1, marginBottom:10 }}>LEGEND</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:24, height:0, border:`1px dashed ${T.textMuted}`, flexShrink:0 }} />
                <span style={{ color:T.textMid, fontSize:11 }}>Foreign key ref</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:12, height:12, borderRadius:2, border:`2px solid ${T.accent}`, flexShrink:0 }} />
                <span style={{ color:T.textMid, fontSize:11 }}>Table entity</span>
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title="Contact & Attribution" icon="◎" T={T}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div>
              <div style={{ color:T.textMuted, fontSize:10, letterSpacing:1, marginBottom:8 }}>ABOUT THIS DEMO</div>
              <p style={{ color:T.textMid, fontSize:13, lineHeight:1.8 }}>This demo preserves the current interaction patterns while swapping the domain to a benign cookie ingredient supply chain. The packaged data is synthetic, reproducible, and intended for local demos, onboarding, and safe deployment tests.</p>
            </div>
            <div>
              <div style={{ color:T.textMuted, fontSize:10, letterSpacing:1, marginBottom:8 }}>PLATFORM</div>
              {[["Platform","Scrape & Bake"],["Database","Optional Supabase / PostgreSQL seed"],["Frontend","React + Vite"],["Deployment","Render"],["Data Sources","Synthetic seed data plus optional benign public bakery and supplier pages"]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ color:T.textMuted, fontSize:12 }}>{k}</span>
                  <span style={{ color:T.text, fontSize:12, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Accordion>

      </div>
    </div>
  );
}

// ── Tooltip Data ───────────────────────────────────────────────────────────
const TABLE_DESCRIPTIONS = {
  company: "Represents bakeries, ingredient suppliers, packers, and distributors in the benign demo dataset.",
  evidence_readable: "Records of ingredient or supplier observations captured from demo source pages.",
  substance_reference: "Canonical list of ingredient references. Links source evidence to standardized ingredient identifiers.",
  association_readable: "Groups companies through shared linkages, extending beyond individual artifacts to map multi-company networks.",
  data_source: "Source datasets from which evidence records were extracted.",
  evidence_type: "Categorization of source evidence such as catalogs, ingredient sheets, menus, or supplier profiles.",
  company_evaluation: "Summarized evidence and cumulative weights used to generate company signals.",
  weighting_tag: "Subtypes of categories, each carrying a specific weight used in signal scoring.",
  substance_type: "Deduplicated list of ingredient types that connect evidence observations to standardized ingredient lists.",
  consolidated_company_readable: "Standardized reference for company name variations (e.g., 'ABC Corp. LTD' vs. 'ABC Corporation, LTD').",
};

const COLUMN_TOOLTIPS = {
  // COMPANY
  COMPANY_ID: "Unique identifier for this COMPANY record.",
  COMPANY_NAME: "Company Name.",
  CHINESE_NAME: "Chinese Name.",
  ACTIVE_INACTIVE: "Company activity as of 2024.",
  BUSINESS_TYPE: "Business Type.",
  PRC_HOME_BASE: "Home region or operating base.",
  GOV_COMPLICITY: "Benign supply-chain role recorded for the company.",
  // EVIDENCE (readable)
  EVIDENCE_ID: "Unique identifier for this EVIDENCE record.",
  company_name: "Company associated with this record.",
  substance_name: "Canonical ingredient name linked to this source evidence.",
  evidence_type: "Categorization of source evidence (for example catalog listing or ingredient sheet).",
  data_source: "Source dataset from which this evidence was extracted.",
  LISTED_NAME_SUBSTANCE: "Ingredient name as captured in the original source.",
  REGION: "State/Province/Region name or code.",
  EVIDENCE_WEIGHT: "Assigned weight for signal scoring.",
  URL: "Web link of extracted data.",
  RECORD_ID: "Provenance-level identifier.",
  // SUBSTANCE_REFERENCE
  SUBSTANCE_REFERENCE_ID: "Unique identifier for this SUBSTANCE_REFERENCE record.",
  SUBSTANCE_NAME: "Canonical ingredient name used in this database (primary label; aliases stored separately).",
  SUBSTANCE_ID: "Unified ingredient reference code used across supplier aliases and menu phrasing.",
  SUBSTANCE_WEIGHT: "Assigned ingredient weight used in signal scoring.",
  SUBSTANCE_DESCRIPTION: "Concise summary of the ingredient, including key properties and typical uses.",
  // ASSOCIATION
  ASSOCIATIONID: "Unique record id.",
  associated_company_name: "The other company linked through this association.",
  LINKAGE_METHOD: "Category of common identifier connecting records (email, phone, IP).",
  LINKAGE_TYPE: "Type classification of the linkage.",
  LINKAGE_VALUE: "Observed value of the shared identifier forming this link (phone/email/IP).",
  // DATA SOURCE
  DATA_SOURCE_ID: "Unique identifier for this DATA_SOURCE record.",
  DATA_SOURCE_NAME: "Data source name or type.",
  DATA_SOURCE_TYPE: "Data source name or type.",
  // EVIDENCE TYPE
  EVIDENCE_TYPE_ID: "Unique identifier for this EVIDENCE_TYPE record.",
  EVIDENCE_TYPE_NAME: "Source evidence category.",
  // COMPANY EVALUATION
  EVIDENCE_COMPANY_WEIGHT: "Aggregated company and source-evidence weights used for signal scoring.",
  TOTAL_WEIGHT: "Total of ingredient, company, and source-evidence weights used for signal scoring.",
  // WEIGHTING TAG
  WEIGHTING_TAG_ID: "Unique identifier for this WEIGHTING_TAG record.",
  WEIGHTING_TAG_NAME: "Operational importance label.",
  WEIGHTING_TAG_CATEGORY_ID: "Reference to the related WEIGHTING_TAG_CATEGORY record.",
  // SUBSTANCE TYPE
  substance_type_id: "Unique identifier for this SUBSTANCE_TYPE record.",
  substance_type_name: "Functional classification.",
  // CONSOLIDATED
  CONSOLIDATED_COMPANY_ID: "Unique identifier for this CONSOLIDATED_COMPANY record.",
  CONSOLIDATED_NAME: "Name used to consolidate multiple company name variations.",
};

// ── Data Explorer ──────────────────────────────────────────────────────────
const EXPLORER_TABLES = [
  { key: "company", label: "Companies", from: "company", searchCol: "COMPANY_NAME", columns: ["COMPANY_ID", "COMPANY_NAME", "CHINESE_NAME", "ACTIVE_INACTIVE", "BUSINESS_TYPE", "PRC_HOME_BASE", "GOV_COMPLICITY"] },
  { key: "evidence_readable", label: "Source Evidence", from: "evidence_readable", searchCol: "company_name", columns: ["EVIDENCE_ID", "company_name", "substance_name", "evidence_type", "data_source", "LISTED_NAME_SUBSTANCE", "REGION", "EVIDENCE_WEIGHT", "URL"], defaultSort: "EVIDENCE_ID", defaultDir: "asc" },
  { key: "company_score_v2", label: "Scores (v2)", from: "company_score_v2", searchCol: "COMPANY_NAME", columns: ["COMPANY_ID", "COMPANY_NAME", "total_score_v2", "evidence_score", "substance_score", "company_tag_score", "legacy_score", "evidence_count", "substances_linked"] },
  { key: "substance_reference", label: "Ingredients", from: "substance_reference", searchCol: "SUBSTANCE_NAME", columns: ["SUBSTANCE_REFERENCE_ID", "SUBSTANCE_NAME", "SUBSTANCE_ID", "SUBSTANCE_WEIGHT", "SUBSTANCE_DESCRIPTION"] },
  { key: "substance_sourcing", label: "Ingredient Aliases", from: "substance_sourcing", searchCol: "SUBSTANCE_SOURCING_LOCAL_NAME", columns: ["SUBSTANCE_SOURCING_ID", "SUBSTANCE_ID", "SUBSTANCE_SOURCING_LOCAL_NAME", "SUBSTANCE_SOURCING_TYPE_ID", "DATA_SOURCE_ID", "SUBSTANCE_SOURCING_PRIMARY"] },
  { key: "substance_sourcing_type", label: "Sourcing Types", from: "substance_sourcing_type", searchCol: "SUBSTANCE_SOURCING_TYPE_TITLE", columns: ["SUBSTANCE_SOURCING_TYPE_ID", "SUBSTANCE_SOURCING_TYPE_TITLE", "SUBSTANCE_SOURCING_TYPE_DESCRIPTION"] },
  { key: "substance_type", label: "Ingredient Types", from: "substance_type", searchCol: "SUBSTANCE_TYPE_TITLE", columns: ["SUBSTANCE_TYPE_ID", "SUBSTANCE_TYPE_TITLE", "SUBSTANCE_TYPE_DESCRIPTION"] },
  { key: "linkage_readable", label: "Linkage", from: "linkage", searchCol: "LINKAGE_VALUE", columns: ["LINKAGEID", "COMPANY_ID", "LINKAGE_METHOD", "Linkage_Value_Type", "LINKAGE_VALUE", "DATA_SOURCE_ID"], renderCompanyName: true },
  { key: "association_readable", label: "Associations", from: "association_readable", searchCol: "company_name", columns: ["ASSOCIATIONID", "company_name", "associated_company_name", "LINKAGE_METHOD", "LINKAGE_TYPE", "LINKAGE_VALUE"] },
  { key: "consolidated_company_readable", label: "Consolidated", from: "consolidated_company_readable", searchCol: "CONSOLIDATED_NAME", columns: ["CONSOLIDATED_COMPANY_ID", "CONSOLIDATED_NAME", "COMPANY_NAME", "COMPANY_ID"] },
  { key: "weighting_tag", label: "Weighting Tags", from: "weighting_tag", searchCol: "WEIGHTING_TAG_TITLE", columns: ["WEIGHTING_TAG_ID", "WEIGHTING_TAG_TITLE", "WEIGHTING_TAG_WEIGHT", "WEIGHTING_TAG_CATEGORY_ID"] },
  { key: "data_source", label: "Data Sources", from: "data_source", searchCol: "DATA_SOURCE_NAME", columns: ["DATA_SOURCE_ID", "DATA_SOURCE_NAME", "DATA_SOURCE_TYPE", "URL", "DATE_LOGGED"] },
  { key: "evidence_type", label: "Evidence Types", from: "evidence_type", searchCol: "EVIDENCE_TYPE_NAME", columns: ["EVIDENCE_TYPE_ID", "EVIDENCE_TYPE_NAME"] },
  { key: "company_evaluation", label: "Company Signals", from: "company_evaluation", searchCol: "COMPANY_NAME", columns: ["COMPANY_ID", "COMPANY_NAME", "EVIDENCE_COMPANY_WEIGHT", "TOTAL_WEIGHT"] },
];

// ── Scrape Analysis Tab ────────────────────────────────────────────────────
function LegacyScrapeAnalysis({ dark }) {
  const T = dark ? DARK : LIGHT;
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [dbMatches, setDbMatches] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const fileRef = useRef(null);
  const resultsFileRef2 = useRef(null);

  // parseCSV removed — using parseCommaSV (RFC 4180) for all files

  const [contactData, setContactData] = useState({}); // company_id -> contact row
  const [resultsFile, setResultsFile] = useState("");

  // RFC 4180 compliant CSV parser — handles quoted fields with commas, newlines, escaped quotes
  const parseCommaSV = text => {
    const rows = [];
    let i = 0;
    const len = text.length;

    const parseField = () => {
      if (i >= len) return "";
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = "";
        while (i < len) {
          if (text[i] === '"') {
            if (i + 1 < len && text[i + 1] === '"') {
              field += '"'; i += 2; // escaped quote
            } else {
              i++; break; // closing quote
            }
          } else {
            field += text[i++];
          }
        }
        return field;
      } else {
        // Unquoted field — read until comma or newline
        let field = "";
        while (i < len && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
          field += text[i++];
        }
        return field.trim();
      }
    };

    const parseRow = () => {
      const fields = [];
      while (i < len && text[i] !== "\n" && text[i] !== "\r") {
        fields.push(parseField());
        if (i < len && text[i] === ",") i++; // skip comma
        else break;
      }
      // skip \r\n or \n
      if (i < len && text[i] === "\r") i++;
      if (i < len && text[i] === "\n") i++;
      return fields;
    };

    // Parse header row
    const headers = parseRow().map(h => h.trim().replace(/^"|"$/g, ""));
    if (!headers.length) return [];

    // Parse data rows
    while (i < len) {
      // Skip blank lines
      if (text[i] === "\n" || text[i] === "\r") { i++; continue; }
      const fields = parseRow();
      if (fields.length === 0 || (fields.length === 1 && !fields[0])) continue;
      const row = {};
      headers.forEach((h, idx) => { row[h] = fields[idx] || ""; });
      // Only include rows that have at least a company_id or company_name
      if (row.company_id || row.company_name || row.seed_company_name) rows.push(row);
    }
    return rows;
  };

  const loadFile = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const allRows = parseCommaSV(text);
    // Filter to only rows that have actual substance data (candidate_evidence format)
    const rows = allRows.filter(r => r.substance_id && r.substance_name && r.match_type);
    console.log(`Parsed ${allRows.length} total rows, ${rows.length} valid evidence rows`);
    setCsvData(rows);
    const contactMap = {};
    Object.values(contactData).forEach(r => {
      if (r.company_name) contactMap[r.company_name] = r;
    });
    await enrichWithDB(rows, contactMap);
  };

  const loadResultsFile = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setResultsFile(file.name);
    const text = await file.text();
    const rows = parseCommaSV(text);
    // Build map: company_name -> contact row, also company_id -> contact row
    const map = {};
    const byId = {};
    rows.forEach(r => {
      if (r.company_name) map[r.company_name] = r;
      if (r.company_id) byId[r.company_id] = r;
    });
    setContactData(byId);
    // Re-enrich if we already have CSV data
    if (csvData.length) {
      await enrichWithDB(csvData, map);
    }
  };

  const enrichWithDB = async (rows, contactMap) => {
    setLoading(true);
    try {
      const casNums = [...new Set(rows.map(r => r.substance_id).filter(Boolean))];
      const compNames = [...new Set(rows.map(r => r.company_name).filter(Boolean))];

      // Check which CAS numbers have existing evidence
      const { data: evData } = await supabase
        .from("evidence")
        .select('"SUBSTANCE_ID","COMPANY_ID"')
        .in('"SUBSTANCE_ID"', casNums.slice(0, 200));

      // Match companies using multiple strategies:
      // 1. Exact name match
      // 2. First ~20 chars fragment match (handles long name variants)
      // 3. Email match via linkage table
      const compChecks = {};
      const emailsToCheck = [];
      compNames.forEach(name => {
        const contact = contactMap[name] || {};
        if (contact.emails) emailsToCheck.push(...contact.emails.split(";").map(e => e.trim()).filter(Boolean));
      });

      // Batch email lookup via linkage
      const emailMap = {};
      if (emailsToCheck.length) {
        const { data: linkData } = await supabase
          .from("linkage")
          .select('"COMPANY_ID","LINKAGE_VALUE"')
          .eq('"LINKAGE_METHOD"', "Email")
          .in('"LINKAGE_VALUE"', emailsToCheck.slice(0, 100));
        (linkData || []).forEach(r => { emailMap[r.LINKAGE_VALUE.toLowerCase()] = r.COMPANY_ID; });
      }

      for (const name of compNames.slice(0, 60)) {
        // Try email match first (most reliable)
        const contact = contactMap[name] || {};
        let found = null;
        if (contact.emails) {
          for (const email of contact.emails.split(";").map(e => e.trim())) {
            const cid = emailMap[email.toLowerCase()];
            if (cid) { found = { COMPANY_ID: cid, COMPANY_NAME: name, _matchMethod: "email" }; break; }
          }
        }
        // Fall back to name fragment match using first meaningful words
        if (!found) {
          const fragment = name.replace(/co\.,?\s*ltd\.?|limited|inc\.?|corp\.?/gi, "").trim().slice(0, 25);
          if (fragment.length > 5) {
            const { data } = await supabase
              .from("company")
              .select('"COMPANY_ID","COMPANY_NAME","ACTIVE_INACTIVE"')
              .ilike('"COMPANY_NAME"', `%${fragment}%`)
              .limit(1);
            if (data && data.length) found = { ...data[0], _matchMethod: "name" };
          }
        }
        if (found) compChecks[name] = found;
      }

      // Also check substances against substance_reference
      const { data: subData } = await supabase
        .from("substance_reference")
        .select('"SUBSTANCE_ID","SUBSTANCE_NAME","SUBSTANCE_WEIGHT"')
        .in('"SUBSTANCE_ID"', casNums.slice(0, 200));
      const subMap = {};
      (subData || []).forEach(r => { subMap[r.SUBSTANCE_ID] = r; });

      // Build evidence map: cas -> set of company_ids
      const evMap = {};
      (evData || []).forEach(r => {
        if (!evMap[r.SUBSTANCE_ID]) evMap[r.SUBSTANCE_ID] = new Set();
        evMap[r.SUBSTANCE_ID].add(r.COMPANY_ID);
      });

      setDbMatches({ evMap, compChecks, subMap });
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const getRowStatus = row => {
    const { evMap = {}, compChecks = {}, subMap = {} } = dbMatches;
    const casInDb = evMap[row.substance_id];
    const compInDb = compChecks[row.company_name];
    const subInDb = subMap[row.substance_id];
    if (!compInDb) return "new_company";
    if (compInDb && casInDb && casInDb.has(compInDb.COMPANY_ID)) return "exists";
    if (compInDb && casInDb) return "new_link";
    if (compInDb && subInDb) return "new_substance";
    if (compInDb) return "new_substance";
    return "new_company";
  };

  const STATUS_CONFIG = {
    exists:       { label: "Already in DB",     color: dark ? "#34c759" : "#166534",  bg: dark ? "#0a2010" : "#f0fdf4" },
    new_link:     { label: "New Link",           color: dark ? "#ff9500" : "#c2410c",  bg: dark ? "#2a1800" : "#fff7ed" },
    new_substance:{ label: "New Ingredient",     color: dark ? "#ffcc00" : "#92400e",  bg: dark ? "#2a2000" : "#fffbeb" },
    new_company:  { label: "New Company",        color: dark ? "#ff3b30" : "#b91c1c",  bg: dark ? "#2a0a08" : "#fef2f2" },
  };

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "new_company", label: "New Companies" },
    { key: "new_substance", label: "New Ingredients" },
    { key: "new_link", label: "New Links" },
    { key: "exists", label: "Already in DB" },
  ];

  const filtered = csvData.filter(row => {
    if (activeFilter !== "all" && getRowStatus(row) !== activeFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (row.company_name || "").toLowerCase().includes(q) ||
             (row.substance_name || "").toLowerCase().includes(q) ||
             (row.substance_id || "").toLowerCase().includes(q) ||
             (row.matched_value || "").toLowerCase().includes(q);
    }
    return true;
  });

  const counts = { all: csvData.length };
  csvData.forEach(r => {
    const s = getRowStatus(r);
    counts[s] = (counts[s] || 0) + 1;
  });

  if (!csvData.length) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 32 }}>📊</div>
        <div style={{ color: T.text, fontSize: 16, fontWeight: 700 }}>Scrape Analysis</div>
        <div style={{ color: T.textMuted, fontSize: 12, textAlign: "center", maxWidth: 480, lineHeight: 1.8 }}>
          Upload two files from a scrape run to compare against the demo database.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 24px", textAlign: "center", maxWidth: 200 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>🔬</div>
            <div style={{ color: T.text, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>candidate_evidence_*.csv</div>
            <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 14, lineHeight: 1.6 }}>From cas_synonym_matcher.py — substance matches</div>
            <button onClick={() => fileRef.current?.click()}
              style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 5, padding: "7px 16px", cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif", fontWeight: 700 }}>
              Upload (required)
            </button>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={loadFile} />
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 24px", textAlign: "center", maxWidth: 200 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>📋</div>
            <div style={{ color: T.text, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>results.csv</div>
            <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 14, lineHeight: 1.6 }}>From scraper output — contact info (phones, emails, addresses)</div>
            <button onClick={() => resultsFileRef2.current?.click()}
              style={{ background: resultsFile ? (dark ? "#0a2010" : "#f0fdf4") : "none", color: resultsFile ? (dark ? "#34c759" : "#166534") : T.textMuted, border: `1px solid ${resultsFile ? (dark ? "#34c759" : "#166534") : T.border}`, borderRadius: 5, padding: "7px 16px", cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif" }}>
              {resultsFile ? "✓ Loaded" : "Upload (optional)"}
            </button>
            <input ref={resultsFileRef2} type="file" accept=".csv" style={{ display: "none" }} onChange={loadResultsFile} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 24px", background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{fileName}</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>{csvData.length} candidate records · {loading ? "Enriching with database..." : "DB enrichment complete"}</div>
        </div>
        {/* Status counts */}
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: cfg.color }}>{counts[key] || 0}</div>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5 }}>{cfg.label.toUpperCase()}</div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          {resultsFile && <span style={{ fontSize: 10, color: dark ? "#34c759" : "#166534", alignSelf: "center" }}>+ {resultsFile}</span>}
          {!resultsFile && (
            <button onClick={() => resultsFileRef2.current?.click()}
              style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 5, padding: "5px 12px", cursor: "pointer", color: T.accent, fontSize: 10, fontFamily: "Georgia,serif" }}>
              + results.csv
            </button>
          )}
          <button onClick={() => { setCsvData([]); setContactData({}); setResultsFile(""); setFileName(""); }}
            style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 5, padding: "5px 12px", cursor: "pointer", color: T.textMuted, fontSize: 10, fontFamily: "Georgia,serif" }}>
            New Files
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={loadFile} />
        <input ref={resultsFileRef2} type="file" accept=".csv" style={{ display: "none" }} onChange={loadResultsFile} />
      </div>

      {/* Filters + search */}
      <div style={{ padding: "10px 24px", background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              style={{ padding: "4px 12px", borderRadius: 4, border: `1px solid ${activeFilter === f.key ? T.accent : T.border}`, background: activeFilter === f.key ? T.accentBg : "transparent", color: activeFilter === f.key ? T.accent : T.textMuted, fontSize: 10, cursor: "pointer", fontFamily: "Georgia,serif" }}>
              {f.label} {counts[f.key] !== undefined ? `(${counts[f.key]})` : ""}
            </button>
          ))}
        </div>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Filter by company, substance, CAS..."
          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 5, padding: "5px 10px", color: T.text, fontSize: 11, fontFamily: "Georgia,serif", flex: 1, maxWidth: 300, outline: "none" }} />
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12, color: T.textMuted, fontSize: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.8s linear infinite" }} />
            Enriching with database...
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "Georgia,serif" }}>
            <thead>
              <tr style={{ background: T.surfaceAlt, position: "sticky", top: 0, zIndex: 2 }}>
                {["Status","Company","Contact Info","Ingredient","ID / Match","Match Type","Confidence","Context"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: T.textMuted, fontSize: 10, letterSpacing: 0.5, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const status = getRowStatus(row);
                const cfg = STATUS_CONFIG[status];
                const conf = parseFloat(row.confidence || 0);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </td>
                    <td style={{ padding: "8px 12px", color: T.text, maxWidth: 200 }}>
                      <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.company_name || row.seed_company_name || "—"}</div>
                      <div style={{ color: T.textMuted, fontSize: 9 }}>{row.company_id}</div>
                      {dbMatches.compChecks?.[row.company_name] && <div style={{ color: dark ? "#34c759" : "#166534", fontSize: 9 }}>DB: {dbMatches.compChecks[row.company_name]._matchMethod || "matched"}</div>}
                    </td>
                    <td style={{ padding: "8px 12px", color: T.textMuted, maxWidth: 180, fontSize: 10 }}>
                      {(() => { const c = contactData[row.company_id] || {}; return (
                        <div>
                          {c.emails && <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✉ {c.emails}</div>}
                          {c.phones && <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📞 {c.phones}</div>}
                          {c.address && <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {c.address.slice(0,40)}{c.address.length > 40 ? "..." : ""}</div>}
                          {!c.emails && !c.phones && !c.address && <span style={{ color: T.border }}>—</span>}
                        </div>
                      ); })()}
                    </td>
                    <td style={{ padding: "8px 12px", color: T.text, maxWidth: 180 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.substance_name || dbMatches.subMap?.[row.substance_id]?.SUBSTANCE_NAME || "—"}</div>
                      {dbMatches.subMap?.[row.substance_id]?.SUBSTANCE_WEIGHT && <div style={{ color: T.textMuted, fontSize: 9 }}>Weight: {dbMatches.subMap[row.substance_id].SUBSTANCE_WEIGHT}</div>}
                    </td>
                    <td style={{ padding: "8px 12px", color: T.textMuted, fontFamily: "monospace", fontSize: 10, whiteSpace: "nowrap" }}>
                      <div>{row.substance_id}</div>
                      {row.matched_value && row.matched_value !== row.substance_id && <div style={{ color: T.textMuted, opacity: 0.7 }}>{row.matched_value}</div>}
                    </td>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, background: row.match_type === "cas_exact" ? (dark ? "#0f2040" : "#eaf0fb") : (dark ? "#0a2010" : "#f0fdf4"), color: row.match_type === "cas_exact" ? T.accent : (dark ? "#34c759" : "#166534") }}>{row.match_type || "—"}</span>
                    </td>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 50, height: 4, borderRadius: 2, background: T.border, overflow: "hidden" }}>
                          <div style={{ width: `${conf * 100}%`, height: "100%", background: conf >= 0.9 ? (dark ? "#34c759" : "#166534") : conf >= 0.75 ? (dark ? "#ff9500" : "#c2410c") : (dark ? "#ff3b30" : "#b91c1c") }} />
                        </div>
                        <span style={{ color: T.textMuted, fontSize: 10 }}>{conf.toFixed(2)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", color: T.textMuted, maxWidth: 300 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 10 }} title={row.evidence_context || row.snippet || ""}>{(row.evidence_context || row.snippet || "").slice(0, 120)}{(row.evidence_context || row.snippet || "").length > 120 ? "..." : ""}</div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 12 }}>No records match current filter</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ScrapeAnalysis({ dark }) {
  const T = dark ? DARK : LIGHT;
  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18, color: T.textMid, lineHeight: 1.6 }}>
        Scrape Analysis is intentionally omitted from this benign demo bundle so the fork does not carry source-review payloads from the original environment.
      </div>
    </div>
  );
}

const PAGE_SIZE = 50;
const DETAIL_TABLE_KEYS = new Set(["evidence_readable", "substance_reference", "substance_sourcing", "linkage_readable", "association_readable"]);

function downloadCSV(data, filename) {
  if (!data.length) return;
  const cols = Object.keys(data[0]);
  const rows = data.map(r => cols.map(c => { const v = r[c] == null ? "" : String(r[c]); return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v; }).join(","));
  const url = URL.createObjectURL(new Blob([[cols.join(","), ...rows].join("\n")], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const hasValue = value => value != null && value !== "";
const displayValue = value => hasValue(value) ? String(value) : "—";
const dossierStorageKey = userId => `${DOSSIER_STORAGE_KEY_PREFIX}:${userId || "anonymous"}`;
const dossierMetaStorageKey = userId => `${DOSSIER_META_STORAGE_KEY_PREFIX}:${userId || "anonymous"}`;
const readStoredDossierItems = userId => {
  if (!userId) return [];
  try {
    const raw = window.localStorage.getItem(dossierStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const buildDefaultDossierTitle = mode => `${mode === "policy" ? "Policy" : "Investigator"} Packet ${new Date().toISOString().slice(0, 10)}`;
const normalizedDossierSectionOrder = sectionOrder => {
  const defaultOrder = DOSSIER_SECTIONS.map(section => section.id);
  const knownSections = Array.isArray(sectionOrder)
    ? sectionOrder.filter(id => DOSSIER_SECTIONS.some(section => section.id === id))
    : [];
  const missingSections = defaultOrder.filter(id => !knownSections.includes(id));
  return [...knownSections, ...missingSections];
};
const readStoredDossierMeta = (userId, mode) => {
  if (!userId) {
    return { title: buildDefaultDossierTitle(mode), globalNote: "", sectionOrder: DOSSIER_SECTIONS.map(section => section.id) };
  }
  try {
    const raw = window.localStorage.getItem(dossierMetaStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      title: parsed?.title || buildDefaultDossierTitle(mode),
      globalNote: parsed?.globalNote || "",
      sectionOrder: Array.isArray(parsed?.sectionOrder) && parsed.sectionOrder.length
        ? normalizedDossierSectionOrder(parsed.sectionOrder)
        : DOSSIER_SECTIONS.map(section => section.id),
    };
  } catch {
    return { title: buildDefaultDossierTitle(mode), globalNote: "", sectionOrder: DOSSIER_SECTIONS.map(section => section.id) };
  }
};
const createDossierRef = (label, value, options = {}) => {
  if (!hasValue(value)) return null;
  return {
    label,
    value: String(value),
    mono: Boolean(options.mono),
    href: options.href || "",
  };
};
const normalizeDossierRefs = refs => refs.filter(Boolean);
const formatDossierTimestamp = value => {
  if (!value) return "Unknown";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};
const summarizeDossierNames = (values, limit = 3) => {
  const list = [...new Set((values || []).filter(Boolean))];
  if (!list.length) return "";
  if (list.length <= limit) return list.join(", ");
  return `${list.slice(0, limit).join(", ")} +${list.length - limit} more`;
};
const dossierTypeLabel = type => DOSSIER_TYPE_LABELS[type] || "Packet Item";
const createDossierMetric = (label, value) => hasValue(value) ? { label, value: String(value) } : null;
const mediaDossierId = media => `media:${media?.image_id || media?.storage_name || media?.image_name || "item"}`;
const dossierSourceIdsEmptyCopy = type => `No citation-ready entity or record identifiers are stored for this ${dossierTypeLabel(type).toLowerCase()} yet. Use Open source view to verify it in context.`;
const dossierProvenanceEmptyCopy = type => {
  if (type === "graph_summary") return "No direct source citation is stored for this graph summary yet. Reopen the graph to review the bounded context and connected entities.";
  if (type === "media_image") return "No direct provenance reference is stored for this media item yet. This does not mean the item lacks a source path or linked entity context.";
  return "No direct provenance reference is stored for this item yet. This does not confirm that no supporting source exists.";
};
const buildDossierExport = ({ title, mode, globalNote, sectionOrder, items }) => {
  const exportedAt = new Date().toISOString();
  const orderedSections = normalizedDossierSectionOrder(sectionOrder)
    .map((sectionId, sectionIndex) => {
      const section = DOSSIER_SECTIONS.find(entry => entry.id === sectionId);
      if (!section || sectionId === "notes") return null;
      const sectionItems = items
        .filter(item => item.type === sectionId)
        .map((item, itemIndex) => ({
          order: itemIndex + 1,
          id: item.id,
          type: item.type,
          typeLabel: dossierTypeLabel(item.type),
          title: item.title || "",
          summary: item.summary || "",
          addedAt: item.addedAt || "",
          note: item.note || "",
          metrics: (item.metrics || []).map(metric => ({ label: metric.label, value: metric.value })),
          referenceIds: (item.sourceIds || []).map(reference => ({
            label: reference.label,
            value: reference.value,
            mono: Boolean(reference.mono),
            href: reference.href || "",
          })),
          provenanceReferences: (item.provenanceRefs || []).map(reference => ({
            label: reference.label,
            value: reference.value,
            mono: Boolean(reference.mono),
            href: reference.href || "",
          })),
          sourceViewType: item.sourceView?.type || "",
        }));
      return {
        id: section.id,
        label: section.label,
        order: sectionIndex + 1,
        itemCount: sectionItems.length,
        items: sectionItems,
      };
    })
    .filter(Boolean);
  const addedTimestamps = items.map(item => item.addedAt).filter(Boolean).sort();
  return {
    exportVersion: 1,
    exportFormat: "scrape-and-bake.dossier.json",
    metadata: {
      title,
      mode,
      modeLabel: APP_MODES[mode]?.label || mode,
      exportedAt,
      itemCount: items.length,
      sectionOrder: orderedSections.map(section => section.id),
      firstItemAddedAt: addedTimestamps[0] || "",
      lastItemAddedAt: addedTimestamps[addedTimestamps.length - 1] || "",
      notes: globalNote || "",
    },
    sections: orderedSections,
  };
};
const upsertDossierItem = (items, item) => {
  const normalized = {
    ...item,
    sourceIds: normalizeDossierRefs(item.sourceIds || []),
    provenanceRefs: normalizeDossierRefs(item.provenanceRefs || []),
    metrics: (item.metrics || []).filter(Boolean),
    note: item.note || "",
  };
  const existingIndex = items.findIndex(current => current.id === normalized.id);
  if (existingIndex === -1) return [normalized, ...items];
  const next = [...items];
  next[existingIndex] = {
    ...next[existingIndex],
    ...normalized,
    addedAt: next[existingIndex].addedAt || normalized.addedAt,
    note: normalized.note || next[existingIndex].note || "",
  };
  return next;
};
const buildCompanyDossierItem = ({ company, risk, associationCount, evidenceCount, substanceCount, provenanceRows = [] }) => ({
  id: `company:${company.id}`,
  type: "company",
  title: company.name || `Company #${company.id}`,
  summary: `${GRAPH_PRIORITY_LABEL} ${displayValue(risk)} · ${associationCount} ${GRAPH_ASSOCIATION_LABEL.toLowerCase()} · ${evidenceCount} source evidence records · ${substanceCount} linked ingredients`,
  metrics: [
    createDossierMetric(GRAPH_PRIORITY_LABEL, risk),
    createDossierMetric(GRAPH_ASSOCIATION_LABEL, associationCount),
    createDossierMetric("Evidence", evidenceCount),
    createDossierMetric("Ingredients", substanceCount),
  ],
  sourceIds: [
    createDossierRef("Primary entity ID", company.id, { mono: true }),
    createDossierRef("Chinese Name", company.chineseName),
    createDossierRef("Region", company.region),
    createDossierRef("Type", company.type),
  ],
  provenanceRefs: provenanceRows.length ? [
    createDossierRef("Loaded evidence rows", provenanceRows.length, { mono: true }),
    createDossierRef("Example source name", provenanceRows[0]?.source_name),
    createDossierRef("Example source record ID", provenanceRows[0]?.record_id, { mono: true }),
  ] : [],
  sourceView: {
    type: "company",
    company: {
      id: company.id,
      name: company.name,
      chineseName: company.chineseName,
      active: company.active,
      type: company.type,
      region: company.region,
      gov: company.gov,
      weight: company.weight,
      risk,
      renderedLinks: company.renderedLinks,
    },
  },
  addedAt: new Date().toISOString(),
});
const buildAssociationDossierItem = ({ company, group }) => ({
  id: `association:${company.id}:${group.category}:${String(group.value || "").toLowerCase()}`,
  type: "association",
  title: `${provenanceBadgeLabel(group.category)} · ${group.value}`,
  summary: `Shared across ${group.linkedCompanyCount} companies · ${group.associationCount} ${GRAPH_ASSOCIATION_LABEL.toLowerCase()} · ${group.evidenceCount || 0} evidence records`,
  metrics: [
    createDossierMetric("Linked companies", group.linkedCompanyCount),
    createDossierMetric(GRAPH_ASSOCIATION_LABEL, group.associationCount),
    createDossierMetric("Evidence", group.evidenceCount || 0),
  ],
  sourceIds: [
    createDossierRef("Company entity", company.name || company.id),
    createDossierRef("Company ID", company.id, { mono: true }),
    createDossierRef("Association type", provenanceBadgeLabel(group.category)),
    createDossierRef("Linkage value", group.value, { mono: true }),
  ],
  provenanceRefs: [
    createDossierRef("Platforms observed", summarizeDossierNames(group.platforms || [])),
    createDossierRef("Last observed", group.lastObserved),
    createDossierRef("Linked companies", summarizeDossierNames(group.linkedCompanyNames || [])),
  ],
  sourceView: {
    type: "company",
    company: {
      id: company.id,
      name: company.name,
      chineseName: company.chineseName,
      active: company.active,
      type: company.type,
      region: company.region,
      gov: company.gov,
      weight: company.weight,
      risk: company.risk,
      renderedLinks: company.renderedLinks,
      connections: company.connections,
    },
  },
  addedAt: new Date().toISOString(),
});
const buildPlatformSummaryDossierItem = ({ company, platformNames = [], lastObserved = "", evidenceCount = 0, artifactCount = 0 }) => ({
  id: `platform_summary:${company.id}`,
  type: "platform_summary",
  title: `${company.name || company.id} · Platform summary`,
  summary: `${platformNames.length} platforms observed · ${evidenceCount} evidence records · ${artifactCount} artifacts`,
  metrics: [
    createDossierMetric("Platforms", platformNames.length),
    createDossierMetric("Evidence", evidenceCount),
    createDossierMetric("Artifacts", artifactCount),
  ],
  sourceIds: [
    createDossierRef("Company entity", company.name || company.id),
    createDossierRef("Company ID", company.id, { mono: true }),
  ],
  provenanceRefs: [
    createDossierRef("Platforms observed", summarizeDossierNames(platformNames, 5)),
    createDossierRef("Last observed", lastObserved),
  ],
  sourceView: {
    type: "company",
    company: {
      id: company.id,
      name: company.name,
      chineseName: company.chineseName,
      active: company.active,
      type: company.type,
      region: company.region,
      gov: company.gov,
      weight: company.weight,
      risk: company.risk,
      renderedLinks: company.renderedLinks,
      connections: company.connections,
    },
  },
  addedAt: new Date().toISOString(),
});
const buildSubstanceDossierItem = ({ substance, totalMentions, linkedCompanyCount, sourceCount, provenanceRows = [], sourceReferences = [] }) => ({
  id: `substance:${substance.id}`,
  type: "substance",
  title: substance.name || `Ingredient #${substance.id}`,
  summary: `${totalMentions} mentions · ${linkedCompanyCount} linked companies · ${sourceCount} source families`,
  metrics: [
    createDossierMetric("Mentions", totalMentions),
    createDossierMetric("Companies", linkedCompanyCount),
    createDossierMetric("Sources", sourceCount),
  ],
  sourceIds: [
    createDossierRef("Ingredient reference ID", substance.id, { mono: true }),
    createDossierRef("Registry / substance ID", substance.casId, { mono: true }),
    createDossierRef("Weight", substance.weight, { mono: true }),
  ],
  provenanceRefs: [
    createDossierRef("Loaded evidence rows", provenanceRows.length || "", { mono: true }),
    ...sourceReferences.slice(0, 2).map(reference => createDossierRef("Sourcing citation", reference, { href: reference })),
  ],
  sourceView: {
    type: "substance",
    substance: {
      id: substance.id,
      name: substance.name,
      casId: substance.casId,
      weight: substance.weight,
      description: substance.description,
    },
  },
  addedAt: new Date().toISOString(),
});
const buildArtifactDossierItem = ({ artifact, intelligence, associatedCompanies = [] }) => {
  const linkageRows = intelligence?.linkageRows || [];
  const associationRows = intelligence?.associationRows || [];
  const sourceReferences = intelligence?.sourceReferences || [];
  return {
    id: `artifact:${artifact.kind}:${String(artifact.value || "").toLowerCase()}`,
    type: "linkage_artifact",
    title: artifact.value,
    summary: `${artifactKindLabel(artifact.kind)} artifact · ${associatedCompanies.length} connected companies · ${linkageRows.length} source linkage rows`,
    metrics: [
      createDossierMetric("Companies", associatedCompanies.length),
      createDossierMetric("Association rows", associationRows.length),
      createDossierMetric("Linkage rows", linkageRows.length),
      createDossierMetric("Source refs", sourceReferences.length),
    ],
    sourceIds: [
      createDossierRef("Artifact type", artifact.method || artifactKindLabel(artifact.kind)),
      createDossierRef("Artifact value", artifact.value, { mono: true }),
      createDossierRef("Association record count", associationRows.length, { mono: true }),
      createDossierRef("Source linkage record count", linkageRows.length, { mono: true }),
    ],
    provenanceRefs: [
      createDossierRef("Connected companies", summarizeDossierNames(associatedCompanies.map(company => company.name))),
      ...sourceReferences.slice(0, 2).flatMap(source => ([
        createDossierRef("Source name", source.sourceName || source.dataSourceId),
        createDossierRef("Source citation URL", source.sourceUrl, { href: source.sourceUrl }),
      ])),
    ],
    sourceView: {
      type: "artifact",
      artifact: {
        id: artifact.id,
        kind: artifact.kind,
        method: artifact.method,
        value: artifact.value,
        companyIds: artifact.companyIds,
        associationIds: artifact.associationIds,
      },
    },
    addedAt: new Date().toISOString(),
  };
};
const buildGraphSummaryDossierItem = ({ graph, connectedCompanies = [], connectedArtifacts = [], groupedCounts = [] }) => ({
  id: `graph:${graph?.seed?.type || "graph"}:${graph?.seed?.nodeId || graph?.seed?.id || String(graph?.seed?.label || "").toLowerCase()}`,
  type: "graph_summary",
  title: graph?.seed?.label || "Bounded graph summary",
  summary: `${graph?.seed?.type === "linkage_artifact" ? "Linkage-seeded" : "Company-seeded"} graph · ${connectedCompanies.length} connected companies · ${connectedArtifacts.length} connected artifacts`,
  metrics: [
    createDossierMetric("Companies", connectedCompanies.length),
    createDossierMetric("Artifacts", connectedArtifacts.length),
    createDossierMetric("Edges", graph?.limits?.returnedEdges),
  ],
  sourceIds: [
    createDossierRef("Seed type", graph?.seed?.type === "linkage_artifact" ? artifactKindLabel(graph?.seed?.kind) : "Company"),
    createDossierRef("Seed node value", graph?.seed?.label || graph?.seed?.id),
    createDossierRef("Rendered company nodes", graph?.limits?.returnedCompanyNodes || connectedCompanies.length, { mono: true }),
    createDossierRef("Rendered edges", graph?.limits?.returnedEdges, { mono: true }),
  ],
  provenanceRefs: groupedCounts.map(([label, count]) => createDossierRef(`Graph scope: ${label}`, count, { mono: true })),
  sourceView: {
    type: "graph_summary",
    seed: graph?.seed,
  },
  addedAt: new Date().toISOString(),
});
const explorerEvidenceRowToDossierRow = row => ({
  evidence_id: row.EVIDENCE_ID,
  evidence_type: row.evidence_type,
  company_name: row.company_name,
  canonical_substance_name: row.substance_name,
  observed_substance_text: row.LISTED_NAME_SUBSTANCE,
  source_name: row.data_source,
  source_type: "",
  record_id: row.EVIDENCE_ID,
  date_logged: "",
  score_contribution: row.EVIDENCE_WEIGHT,
  region: row.REGION,
  source_locator: row.URL,
});
const buildEvidenceDossierItem = (row, contextLabel = "Evidence provenance") => ({
  id: `evidence:${row.evidence_id || row.record_id || row.company_name || "row"}:${row.source_name || "source"}`,
  type: "evidence",
  title: `Evidence #${row.evidence_id || "unknown"}`,
  summary: [row.company_name, row.canonical_substance_name || row.observed_substance_text, row.evidence_type || contextLabel].filter(Boolean).join(" · "),
  metrics: [
    createDossierMetric("Score", row.score_contribution),
    createDossierMetric("Region", row.region),
  ],
  sourceIds: [
    createDossierRef("Evidence ID", row.evidence_id, { mono: true }),
    createDossierRef("Source record ID", row.record_id, { mono: true }),
    createDossierRef("Company entity", row.company_name),
    createDossierRef("Ingredient context", row.canonical_substance_name || row.observed_substance_text),
  ],
  provenanceRefs: [
    createDossierRef("Source name", row.source_name),
    createDossierRef("Source type", row.source_type),
    createDossierRef("Date logged", row.date_logged),
    createDossierRef("Source citation locator", row.source_locator, { href: row.source_locator }),
  ],
  sourceView: {
    type: "evidence",
    row: {
      EVIDENCE_ID: row.evidence_id,
      company_name: row.company_name,
      substance_name: row.canonical_substance_name,
      evidence_type: row.evidence_type || contextLabel,
      data_source: row.source_name,
      LISTED_NAME_SUBSTANCE: row.observed_substance_text,
      REGION: row.region,
      EVIDENCE_WEIGHT: row.score_contribution,
      URL: row.source_locator,
    },
  },
  addedAt: new Date().toISOString(),
});
const buildMediaDossierItem = ({ media, previewUrl = "" }) => ({
  id: mediaDossierId(media),
  type: "media_image",
  title: media.image_name || media.storage_name || `Media #${media.image_id || "unknown"}`,
  summary: [
    media.company_name_raw ? `Linked to ${media.company_name_raw}` : media.company_id ? `Linked company ID ${media.company_id}` : "No linked company in the current view",
    media.storage_name ? "Authorized media reference" : "Unsigned media reference",
  ].join(" · "),
  metrics: [
    createDossierMetric("Linked company", media.company_name_raw || media.company_id),
    createDossierMetric("Bucket", MEDIA_BUCKETS.images),
  ],
  sourceIds: [
    createDossierRef("Media ID", media.image_id, { mono: true }),
    createDossierRef("Display name", media.image_name),
    createDossierRef("Storage object path", media.storage_name, { mono: true }),
    createDossierRef("Linked entity", media.company_name_raw || media.company_id),
  ],
  provenanceRefs: [
    createDossierRef("Bucket", MEDIA_BUCKETS.images),
    createDossierRef("Reference path", media.storage_name, { mono: true }),
    createDossierRef("Company match score", media.company_match_score != null ? `${(media.company_match_score * 100).toFixed(0)}%` : ""),
  ],
  previewUrl: previewUrl || "",
  sourceView: {
    type: "media_image",
    media: {
      image_id: media.image_id,
      image_name: media.image_name,
      storage_name: media.storage_name,
      company_id: media.company_id,
      company_name_raw: media.company_name_raw,
      company_match_score: media.company_match_score,
      previewUrl: previewUrl || "",
    },
  },
  addedAt: new Date().toISOString(),
});
const moveListItem = (items, fromIndex, toIndex) => {
  if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};
const reorderSectionIds = (sectionOrder, sectionId, direction) => {
  const index = sectionOrder.indexOf(sectionId);
  if (index === -1) return sectionOrder;
  return moveListItem(sectionOrder, index, direction === "up" ? index - 1 : index + 1);
};

function DetailField({ label, value, T, mono = false, wide = false }) {
  return (
    <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 11px", gridColumn: wide ? "1 / -1" : "auto" }}>
      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ color: T.text, fontSize: 12, lineHeight: 1.5, fontFamily: mono ? "monospace" : "Georgia,serif", wordBreak: "break-word" }}>{displayValue(value)}</div>
    </div>
  );
}

function DetailSection({ title, children, T }) {
  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
        {children}
      </div>
    </section>
  );
}

function ExplorerDetailContent({ tableKey, row, dark, onBuildGraphFromLinkage, onAddEvidenceToDossier, isEvidenceInDossier }) {
  const T = dark ? DARK : LIGHT;
  if (!row) return null;

  if (tableKey === "evidence_readable") {
    const dossierRow = explorerEvidenceRowToDossierRow(row);
    const inDossier = isEvidenceInDossier?.(dossierRow);
    return (
      <div style={{ padding: 18 }}>
        {onAddEvidenceToDossier && (
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => onAddEvidenceToDossier(dossierRow, "Explorer evidence detail")}
              style={{ background: inDossier ? T.accentBg : T.surface, color: inDossier ? T.accent : T.text, border: `1px solid ${inDossier ? T.accent : T.borderMid}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "Georgia,serif" }}
            >
              {inDossier ? "Update dossier item" : "Add to dossier"}
            </button>
          </div>
        )}
        <DetailSection title="Source Evidence Summary" T={T}>
          <DetailField label="Source Evidence ID" value={row.EVIDENCE_ID} T={T} mono />
          <DetailField label="Evidence Type" value={row.evidence_type} T={T} />
          <DetailField label="Evidence Weight" value={row.EVIDENCE_WEIGHT} T={T} mono />
          <DetailField label="Region" value={row.REGION} T={T} />
        </DetailSection>
        <DetailSection title="Entity Context" T={T}>
          <DetailField label="Company" value={row.company_name} T={T} />
          <DetailField label="Canonical Ingredient" value={row.substance_name} T={T} />
          <DetailField label="Observed Ingredient Text" value={row.LISTED_NAME_SUBSTANCE} T={T} wide />
        </DetailSection>
        <DetailSection title="Source Context" T={T}>
          <DetailField label="Data Source" value={row.data_source} T={T} />
          {hasValue(row.URL) ? (
            <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 11px", gridColumn: "1 / -1" }}>
              <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Source URL</div>
              <a href={row.URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontSize: 12, wordBreak: "break-all" }}>{row.URL}</a>
            </div>
          ) : <DetailField label="Source URL" value={row.URL} T={T} wide />}
        </DetailSection>
      </div>
    );
  }

  if (tableKey === "substance_reference") {
    return (
      <div style={{ padding: 18 }}>
        <DetailSection title="Ingredient Profile" T={T}>
          <DetailField label="Reference ID" value={row.SUBSTANCE_REFERENCE_ID} T={T} mono />
          <DetailField label="Canonical Name" value={row.SUBSTANCE_NAME} T={T} />
          <DetailField label="Ingredient ID" value={row.SUBSTANCE_ID} T={T} mono />
          <DetailField label="Weight" value={row.SUBSTANCE_WEIGHT} T={T} mono />
        </DetailSection>
        <DetailSection title="Ingredient Context" T={T}>
          <DetailField label="Description" value={row.SUBSTANCE_DESCRIPTION} T={T} wide />
        </DetailSection>
      </div>
    );
  }

  if (tableKey === "substance_sourcing") {
    return (
      <div style={{ padding: 18 }}>
        <DetailSection title="Ingredient Alias Record" T={T}>
          <DetailField label="Sourcing ID" value={row.SUBSTANCE_SOURCING_ID} T={T} mono />
          <DetailField label="Ingredient ID" value={row.SUBSTANCE_ID} T={T} mono />
          <DetailField label="Local / Listed Name" value={row.SUBSTANCE_SOURCING_LOCAL_NAME} T={T} />
          <DetailField label="Primary Source Flag" value={row.SUBSTANCE_SOURCING_PRIMARY} T={T} />
        </DetailSection>
        <DetailSection title="Source Classification" T={T}>
          <DetailField label="Sourcing Type ID" value={row.SUBSTANCE_SOURCING_TYPE_ID} T={T} mono />
          <DetailField label="Data Source ID" value={row.DATA_SOURCE_ID} T={T} mono />
        </DetailSection>
      </div>
    );
  }

  if (tableKey === "linkage_readable") {
    const artifactKind = artifactKindFromMethod(row.LINKAGE_METHOD);
    const canBuildGraph = artifactKind && row.LINKAGE_VALUE && onBuildGraphFromLinkage;
    return (
      <div style={{ padding: 18 }}>
        <DetailSection title="Linkage Summary" T={T}>
          <DetailField label="Linkage ID" value={row.LINKAGEID} T={T} mono />
          <DetailField label="Company" value={row.COMPANY_NAME || row.COMPANY_ID} T={T} />
          <DetailField label="Method" value={row.LINKAGE_METHOD} T={T} />
          <DetailField label="Value Type" value={row.Linkage_Value_Type} T={T} />
        </DetailSection>
        <DetailSection title="Observed Identifier" T={T}>
          <DetailField label="Linkage Value" value={row.LINKAGE_VALUE} T={T} mono wide />
          <DetailField label="Data Source ID" value={row.DATA_SOURCE_ID} T={T} mono />
        </DetailSection>
        {canBuildGraph && (
          <button
            type="button"
            onClick={() => onBuildGraphFromLinkage({ kind: artifactKind, method: artifactMethodLabel(artifactKind), value: row.LINKAGE_VALUE })}
            style={{ background: T.accent, color: dark ? "#06110d" : "#fff", border: `1px solid ${T.accent}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "Georgia,serif" }}
          >
            Build graph from this linkage
          </button>
        )}
      </div>
    );
  }

  if (tableKey === "association_readable") {
    const artifactKind = artifactKindFromMethod(row.LINKAGE_METHOD || row.LINKAGE_TYPE);
    const canBuildGraph = artifactKind && row.LINKAGE_VALUE && onBuildGraphFromLinkage;
    return (
      <div style={{ padding: 18 }}>
        <DetailSection title="Association Summary" T={T}>
          <DetailField label="Association ID" value={row.ASSOCIATIONID} T={T} mono />
          <DetailField label="Company" value={row.company_name} T={T} />
          <DetailField label="Associated Company" value={row.associated_company_name} T={T} />
          <DetailField label="Linkage Type" value={row.LINKAGE_TYPE} T={T} />
        </DetailSection>
        <DetailSection title="Shared Identifier" T={T}>
          <DetailField label="Method" value={row.LINKAGE_METHOD} T={T} />
          <DetailField label="Value" value={row.LINKAGE_VALUE} T={T} mono wide />
        </DetailSection>
        {canBuildGraph && (
          <button
            type="button"
            onClick={() => onBuildGraphFromLinkage({ kind: artifactKind, method: artifactMethodLabel(artifactKind), value: row.LINKAGE_VALUE })}
            style={{ background: T.accent, color: dark ? "#06110d" : "#fff", border: `1px solid ${T.accent}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "Georgia,serif" }}
          >
            Build graph from this linkage
          </button>
        )}
      </div>
    );
  }

  return null;
}

function LinkageArtifactIntelligenceView({ artifact, intelligence, companies, loading = false, error = "", onBuildArtifactGraph, building = false, dark, onAddToDossier, isInDossier }) {
  const T = dark ? DARK : LIGHT;
  const companyMap = new Map((companies || []).map(company => [company.id, company]));
  const associatedCompanies = (intelligence?.associatedCompanies?.length
    ? intelligence.associatedCompanies
    : (artifact?.companyIds || []).map(companyId => companyMap.get(companyId) || { id: companyId, name: `Company #${companyId}` }))
    .filter(Boolean);
  const associationRows = intelligence?.associationRows || [];
  const linkageRows = intelligence?.linkageRows || [];
  const sourceReferences = intelligence?.sourceReferences || [];
  const summary = intelligence || {};
  const hasLocalFallback = associatedCompanies.length > 0 || (artifact?.associationIds || []).length > 0;
  const showServerBackedSections = !loading;
  const addArtifactToDossier = () => {
    if (!onAddToDossier) return;
    onAddToDossier(buildArtifactDossierItem({
      artifact,
      intelligence,
      associatedCompanies,
    }));
  };
  if (!artifact) return null;

  return (
    <div style={{ padding: 18 }}>
      <DetailSection title="Artifact Summary" T={T}>
        <DetailField label="Linkage Type" value={summary.method || artifact.method || artifactKindLabel(artifact.kind)} T={T} />
        <DetailField label="Associated Companies" value={summary.companyCount ?? associatedCompanies.length} T={T} mono />
        <DetailField label="Association Rows" value={summary.associationCount ?? associationRows.length} T={T} mono />
        <DetailField label="Linkage Rows" value={summary.linkageCount ?? linkageRows.length} T={T} mono />
        <DetailField label="Source References" value={summary.sourceCount ?? sourceReferences.length} T={T} mono />
        <DetailField label="Linkage Value" value={artifact.value} T={T} mono wide />
      </DetailSection>

      <DetailSection title="Graph Actions" T={T}>
        <DetailField label="Graph Entry" value="Build a bounded linkage-seeded network from this artifact" T={T} wide />
        {onBuildArtifactGraph && (
          <div style={{ gridColumn: "1 / -1" }}>
            <button
              type="button"
              onClick={() => onBuildArtifactGraph({ kind: artifact.kind, method: artifact.method || artifactKindLabel(artifact.kind), value: artifact.value })}
              disabled={building}
              style={{ background: building ? T.surfaceAlt : T.accent, color: building ? T.textMuted : (dark ? "#06110d" : "#fff"), border: `1px solid ${building ? T.border : T.accent}`, borderRadius: 999, padding: "7px 12px", cursor: building ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700, fontFamily: "Georgia,serif" }}
            >
              {building ? "Building graph..." : "Build graph from this"}
            </button>
          </div>
        )}
        {onAddToDossier && (
          <div style={{ gridColumn: "1 / -1" }}>
            <button
              type="button"
              onClick={addArtifactToDossier}
              style={{ background: isInDossier ? T.accentBg : T.surface, color: isInDossier ? T.accent : T.textMid, border: `1px solid ${isInDossier ? T.accent : T.border}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "Georgia,serif" }}
            >
              {isInDossier ? "Update dossier item" : "Add to dossier"}
            </button>
          </div>
        )}
      </DetailSection>

      {error && (
        <div style={{ background: dark ? "#2a0a08" : "#fef2f2", border: `1px solid ${dark ? "#5a1a16" : "#fecaca"}`, borderRadius: 6, padding: "9px 11px", color: dark ? "#ff9b8f" : "#991b1b", fontSize: 11, marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "28px 0", color: T.textMuted, fontSize: 11 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.8s linear infinite" }} />
          Loading artifact intelligence...
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : null}

      <DetailSection title="Companies Connected To This Artifact" T={T}>
        <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.5, gridColumn: "1 / -1" }}>
          Companies connected through graph, search, linkage, or association context.
        </div>
        {associatedCompanies.length ? associatedCompanies.map(company => (
          <div key={company.id} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 11px" }}>
            <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{company.name}</div>
            <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>Company ID: {company.id}</div>
          </div>
        )) : (
          <div style={{ color: T.textMuted, fontSize: 11, gridColumn: "1 / -1" }}>No connected companies are available for this artifact in the current view.</div>
        )}
      </DetailSection>

      <DetailSection title="Company-to-company association records" T={T}>
        <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.5, gridColumn: "1 / -1" }}>
          Explicit association-table rows using this artifact as the connection evidence.
        </div>
        {loading && (
          <div style={{ color: T.textMuted, fontSize: 11, gridColumn: "1 / -1" }}>
            Loading server-backed association rows for this artifact...
          </div>
        )}
        {showServerBackedSections && associationRows.length ? associationRows.map(row => (
          <div key={`association-${row.associationId}`} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 11px", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
              <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{row.companyName} ↔ {row.associatedCompanyName}</div>
              <div style={{ color: linkCol(row.method, dark), fontSize: 10, fontWeight: 700 }}>{row.method || row.linkageType || "Association"}</div>
            </div>
            <div style={{ color: T.textMuted, fontSize: 10, lineHeight: 1.5 }}>
              Association #{row.associationId || "unknown"} · {row.value || artifact.value}
            </div>
          </div>
        )) : (
          showServerBackedSections ? (
            <div style={{ color: T.textMuted, fontSize: 11, gridColumn: "1 / -1" }}>
              No company-to-company association records were returned for this artifact. {hasLocalFallback ? "Companies connected above may still come from graph, search, linkage, or other local context." : ""}
            </div>
          ) : null
        )}
      </DetailSection>

      <DetailSection title="Source linkage records" T={T}>
        <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.5, gridColumn: "1 / -1" }}>
          Raw linkage-table rows where this artifact appears.
        </div>
        {loading && (
          <div style={{ color: T.textMuted, fontSize: 11, gridColumn: "1 / -1" }}>
            Loading direct linkage records for this artifact...
          </div>
        )}
        {showServerBackedSections && linkageRows.length ? linkageRows.map(row => (
          <div key={`linkage-${row.linkageId}`} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 11px", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
              <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{row.companyName}</div>
              <div style={{ color: linkCol(row.method, dark), fontSize: 10, fontWeight: 700 }}>{row.method || artifact.method}</div>
            </div>
            <div style={{ color: T.textMuted, fontSize: 10, lineHeight: 1.5 }}>
              Linkage #{row.linkageId || "unknown"} · {row.valueType || artifactKindLabel(artifact.kind)} · {row.value || artifact.value}
            </div>
            {(row.sourceName || row.dataSourceId) && (
              <div style={{ color: T.textMuted, fontSize: 10, marginTop: 4, lineHeight: 1.5 }}>
                Source: {row.sourceName || row.dataSourceId}{row.sourceType ? ` · ${row.sourceType}` : ""}{row.dateLogged ? ` · ${row.dateLogged}` : ""}
              </div>
            )}
          </div>
        )) : (
          showServerBackedSections ? (
            <div style={{ color: T.textMuted, fontSize: 11, gridColumn: "1 / -1" }}>
              No source linkage records were found for this artifact. Companies connected above may come from graph, search, or association context.
            </div>
          ) : null
        )}
      </DetailSection>

      <DetailSection title="Direct Source References" T={T}>
        {loading && (
          <div style={{ color: T.textMuted, fontSize: 11, gridColumn: "1 / -1" }}>
            Loading source-linked references for this artifact...
          </div>
        )}
        {showServerBackedSections && sourceReferences.length ? sourceReferences.map(source => (
          <div key={source.dataSourceId} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 11px", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
              <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{source.sourceName || source.dataSourceId}</div>
              <div style={{ color: T.textMuted, fontSize: 10 }}>{source.linkageCount} linkage rows</div>
            </div>
            <div style={{ color: T.textMuted, fontSize: 10, lineHeight: 1.5 }}>
              {source.sourceType || "Source type unavailable"}{source.dateLogged ? ` · ${source.dateLogged}` : ""}
            </div>
            {source.sourceUrl && (
              <a href={source.sourceUrl} target="_blank" rel="noreferrer" style={{ color: T.accent, fontSize: 10, wordBreak: "break-all", display: "inline-block", marginTop: 5 }}>
                Open source reference
              </a>
            )}
          </div>
        )) : (
          showServerBackedSections ? (
            <div style={{ color: T.textMuted, fontSize: 11, gridColumn: "1 / -1" }}>
              No direct source-linked rows were returned for this artifact. This does not mean the artifact has no related companies or association context.
            </div>
          ) : null
        )}

        <DetailField
          label="Provenance Note"
          value={sourceReferences.length
            ? "Source references are derived from linkage rows that include data-source context."
            : "Source references depend on linkage rows that carry data-source context. Some artifacts will still have company or association context even when direct source references are unavailable."}
          T={T}
          wide
        />
        <DetailField
          label="Association IDs"
          value={(artifact.associationIds || []).join(", ") || "Not available from the current selection context"}
          T={T}
          mono
          wide
        />
      </DetailSection>
    </div>
  );
}

function GraphSummaryDetail({ graph, companies, associations, artifactEdges, dark, onAddToDossier, isInDossier }) {
  const T = dark ? DARK : LIGHT;
  const seed = graph?.seed || {};
  const companyMap = new Map(companies.map(company => [company.id, company]));
  const artifactMap = new Map();
  artifactEdges.forEach(edge => {
    const key = graphArtifactKey(edge);
    const current = artifactMap.get(key) || { key, kind: edge.kind, method: edge.method, value: edge.value, companyIds: new Set(), associationIds: new Set() };
    current.companyIds.add(edge.companyId);
    if (edge.associationId) current.associationIds.add(edge.associationId);
    artifactMap.set(key, current);
  });
  const artifacts = [...artifactMap.values()];
  const seedCompanyId = seed.type === "company" ? seed.id : null;
  const connectedCompanyIds = seed.type === "linkage_artifact"
    ? [...new Set(artifactEdges.map(edge => edge.companyId).filter(id => id != null))]
    : [...new Set(associations
      .filter(edge => edge.from === seedCompanyId || edge.to === seedCompanyId)
      .map(edge => edge.from === seedCompanyId ? edge.to : edge.from)
      .filter(id => id != null))];
  const connectedArtifacts = seed.type === "company"
    ? artifacts.filter(artifact => artifact.companyIds.has(seedCompanyId))
    : [];
  const connectedCompanies = connectedCompanyIds.map(id => companyMap.get(id) || { id, name: `Company #${id}` });
  const seedRenderedLinks = connectedCompanies.length + connectedArtifacts.length;
  const groupedCounts = [
    ["Visible graph associations", associations.length],
    ["Email artifacts", artifacts.filter(artifact => artifact.kind === "email").length],
    ["Phone artifacts", artifacts.filter(artifact => artifact.kind === "phone").length],
  ];
  const addGraphSummaryToDossier = () => {
    if (!onAddToDossier || !graph) return;
    onAddToDossier(buildGraphSummaryDossierItem({
      graph,
      connectedCompanies,
      connectedArtifacts,
      groupedCounts,
    }));
  };
  if (!graph) return null;

  return (
    <div style={{ padding: 18 }}>
      {onAddToDossier && (
        <div style={{ marginBottom: 14, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "11px 12px" }}>
          <div style={{ color: T.text, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Save this graph view to the dossier</div>
          <div style={{ color: T.textMuted, fontSize: 10, lineHeight: 1.5, marginBottom: 8 }}>
            Capture the current graph type, central seed, rendered connection counts, and scope metadata in the Graph summaries section.
          </div>
          <button
            type="button"
            onClick={addGraphSummaryToDossier}
            style={{ background: isInDossier ? T.accentBg : T.surface, color: isInDossier ? T.accent : T.text, border: `1px solid ${isInDossier ? T.accent : T.borderMid}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "Georgia,serif" }}
          >
            {isInDossier ? "Update dossier item" : "Add graph summary to dossier"}
          </button>
        </div>
      )}
      <DetailSection title="Graph Seed" T={T}>
        <DetailField label="Central Node" value={seed.label || seed.id || "Selected graph"} T={T} wide />
        <DetailField label="Node Type" value={seed.type === "linkage_artifact" ? artifactKindLabel(seed.kind) : "Company"} T={T} />
        <DetailField label={GRAPH_NODE_METRIC_LABEL} value={seedRenderedLinks} T={T} mono />
        <DetailField label="Scope" value="Currently rendered bounded graph" T={T} wide />
      </DetailSection>
      <DetailSection title="Grouped Connection Counts" T={T}>
        {groupedCounts.map(([label, count]) => <DetailField key={label} label={label} value={count} T={T} mono />)}
      </DetailSection>
      <DetailSection title="Directly Connected Companies" T={T}>
        {connectedCompanies.length ? connectedCompanies.map(company => (
          <div key={company.id} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 11px" }}>
            <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{company.name}</div>
            <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>Company ID: {company.id}</div>
          </div>
        )) : <DetailField label="Companies" value="No direct company nodes in the current rendered graph" T={T} wide />}
      </DetailSection>
      <DetailSection title="Directly Connected Artifacts" T={T}>
        {connectedArtifacts.length ? connectedArtifacts.map(artifact => (
          <div key={artifact.key} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 11px" }}>
            <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{artifact.value}</div>
            <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>{artifactKindLabel(artifact.kind)} · {artifact.companyIds.size} companies</div>
          </div>
        )) : <DetailField label="Artifacts" value="No artifact nodes are directly connected to the seed in the current rendered graph" T={T} wide />}
      </DetailSection>
    </div>
  );
}

function DossierReviewPanel({
  items,
  dark,
  mode,
  title,
  globalNote,
  sectionOrder,
  onTitleChange,
  onGlobalNoteChange,
  onRemove,
  onClear,
  onMoveItem,
  onMoveSection,
  onOpenSourceView,
  onUpdateItemNote,
  onExportJson,
  onViewReport,
}) {
  const T = dark ? DARK : LIGHT;
  const itemsByType = useMemo(
    () => items.reduce((acc, item) => {
      acc[item.type] = [...(acc[item.type] || []), item];
      return acc;
    }, {}),
    [items],
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px clamp(16px, 3vw, 32px)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 18, boxShadow: dark ? "0 12px 34px rgba(0,0,0,0.22)" : "0 12px 28px rgba(24,21,15,0.08)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 420px", minWidth: 260 }}>
              <div style={{ color: T.accent, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 700 }}>Dossier Review Workspace</div>
              <input
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                aria-label="Dossier title"
                placeholder="Untitled dossier"
                style={{ width: "100%", marginTop: 8, background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700 }}
              />
              <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.6, marginTop: 8 }}>
                Review and organize collected intelligence before export exists. This phase is still local and reference-based on purpose.
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, flex: "0 1 420px", minWidth: 260 }}>
              <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px" }}>
                <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>Mode</div>
                <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginTop: 4 }}>{APP_MODES[mode].label}</div>
              </div>
              <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px" }}>
                <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>Items</div>
                <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginTop: 4 }}>{items.length}</div>
              </div>
              <button
                type="button"
                onClick={onClear}
                disabled={items.length === 0 && !globalNote.trim()}
                style={{ background: "transparent", color: items.length === 0 && !globalNote.trim() ? T.textMuted : T.textMid, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px", cursor: items.length === 0 && !globalNote.trim() ? "not-allowed" : "pointer", fontFamily: "Georgia,serif", fontSize: 11, textAlign: "left" }}
              >
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: T.textMuted, marginBottom: 4 }}>Actions</div>
                Clear dossier
              </button>
              <button
                type="button"
                onClick={onExportJson}
                disabled={items.length === 0 && !globalNote.trim()}
                style={{ background: items.length === 0 && !globalNote.trim() ? "transparent" : T.accentBg, color: items.length === 0 && !globalNote.trim() ? T.textMuted : T.accent, border: `1px solid ${items.length === 0 && !globalNote.trim() ? T.border : T.accent}`, borderRadius: 10, padding: "11px 12px", cursor: items.length === 0 && !globalNote.trim() ? "not-allowed" : "pointer", fontFamily: "Georgia,serif", fontSize: 11, textAlign: "left" }}
              >
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: T.textMuted, marginBottom: 4 }}>Export</div>
                Download JSON
              </button>
              <button
                type="button"
                onClick={onViewReport}
                disabled={items.length === 0 && !globalNote.trim()}
                style={{ background: items.length === 0 && !globalNote.trim() ? "transparent" : T.surface, color: items.length === 0 && !globalNote.trim() ? T.textMuted : T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px", cursor: items.length === 0 && !globalNote.trim() ? "not-allowed" : "pointer", fontFamily: "Georgia,serif", fontSize: 11, textAlign: "left" }}
              >
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: T.textMuted, marginBottom: 4 }}>Report</div>
                View report
              </button>
              <div style={{ background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px", fontFamily: "Georgia,serif", fontSize: 11, textAlign: "left" }}>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>PDF</div>
                Prepare structure next
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
            <textarea
              value={globalNote}
              onChange={e => onGlobalNoteChange(e.target.value)}
              placeholder="Capture the packet-level narrative, scope, or review notes here."
              style={{ width: "100%", minHeight: 92, resize: "vertical", background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "Georgia,serif", fontSize: 12, lineHeight: 1.6 }}
            />
          </div>
        </div>

        {sectionOrder.map((sectionId, sectionIndex) => {
          const section = DOSSIER_SECTIONS.find(entry => entry.id === sectionId);
          if (!section) return null;
          const sectionItems = sectionId === "notes" ? [] : (itemsByType[sectionId] || []);
          const isNotesSection = sectionId === "notes";

          return (
            <section key={sectionId} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 16, boxShadow: dark ? "0 10px 26px rgba(0,0,0,0.16)" : "0 10px 24px rgba(24,21,15,0.05)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <div style={{ color: T.text, fontSize: 18, fontWeight: 700 }}>{section.label}</div>
                  <div style={{ color: T.textMuted, fontSize: 11, marginTop: 4 }}>
                    {isNotesSection
                      ? "Notes placeholders live here until standalone note items are implemented."
                      : `${sectionItems.length} collected item${sectionItems.length === 1 ? "" : "s"} in this section.`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => onMoveSection(sectionId, "up")}
                    disabled={sectionIndex === 0}
                    style={{ background: "transparent", color: sectionIndex === 0 ? T.textMuted : T.textMid, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 9px", cursor: sectionIndex === 0 ? "not-allowed" : "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                  >
                    ↑ Section
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSection(sectionId, "down")}
                    disabled={sectionIndex === sectionOrder.length - 1}
                    style={{ background: "transparent", color: sectionIndex === sectionOrder.length - 1 ? T.textMuted : T.textMid, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 9px", cursor: sectionIndex === sectionOrder.length - 1 ? "not-allowed" : "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                  >
                    ↓ Section
                  </button>
                </div>
              </div>

              {isNotesSection ? (
                <div style={{ color: T.textMuted, fontSize: 12, lineHeight: 1.6 }}>
                  Per-item notes are available directly on collected dossier items. Standalone note items can be added in a later phase if we need freeform narrative sections separate from entity/evidence records.
                </div>
              ) : sectionItems.length === 0 ? (
                <div style={{ color: T.textMuted, fontSize: 12, lineHeight: 1.6 }}>
                  No {section.label.toLowerCase()} collected yet.
                </div>
              ) : (
                sectionItems.map((item, itemIndex) => (
                  <article key={item.id} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "13px 14px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0, flex: "1 1 420px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                        {item.type === "media_image" && (
                          <div style={{ width: 88, flexShrink: 0 }}>
                            {item.previewUrl ? (
                              <img
                                src={item.previewUrl}
                                alt={item.title}
                                style={{ width: "100%", height: 66, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}`, display: "block", background: T.surface }}
                              />
                            ) : (
                              <div style={{ width: "100%", height: 66, display: "flex", alignItems: "center", justifyContent: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>
                                Preview on open
                              </div>
                            )}
                          </div>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accent}33`, borderRadius: 999, padding: "2px 8px", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
                            {dossierTypeLabel(item.type)}
                          </span>
                          <span style={{ color: T.textMuted, fontSize: 10 }}>Added {formatDossierTimestamp(item.addedAt)}</span>
                        </div>
                        <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginTop: 7, wordBreak: "break-word" }}>{item.title}</div>
                        {item.summary && <div style={{ color: T.textMid, fontSize: 12, lineHeight: 1.55, marginTop: 6 }}>{item.summary}</div>}
                      </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => onMoveItem(item.id, "up")}
                          disabled={itemIndex === 0}
                          style={{ background: "transparent", color: itemIndex === 0 ? T.textMuted : T.textMid, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 9px", cursor: itemIndex === 0 ? "not-allowed" : "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveItem(item.id, "down")}
                          disabled={itemIndex === sectionItems.length - 1}
                          style={{ background: "transparent", color: itemIndex === sectionItems.length - 1 ? T.textMuted : T.textMid, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 9px", cursor: itemIndex === sectionItems.length - 1 ? "not-allowed" : "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                        >
                          ↓
                        </button>
                        {item.sourceView && (
                          <button
                            type="button"
                            onClick={() => onOpenSourceView(item)}
                            style={{ background: T.surface, color: T.accent, border: `1px solid ${T.accent}44`, borderRadius: 999, padding: "5px 9px", cursor: "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                          >
                            Open source view
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          style={{ background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 9px", cursor: "pointer", fontSize: 10, fontFamily: "Georgia,serif" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {item.metrics?.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        {item.metrics.map(metric => (
                          <div key={`${item.id}:metric:${metric.label}`} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 10px", fontSize: 10 }}>
                            <span style={{ color: T.textMuted, marginRight: 6 }}>{metric.label}</span>
                            <span style={{ color: T.text, fontWeight: 700 }}>{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Citation-ready entity / record IDs</div>
                      {item.sourceIds?.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                          {item.sourceIds.map(reference => (
                            <div key={`${item.id}:${reference.label}:${reference.value}`} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 10px" }}>
                              <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 0.8 }}>{reference.label}</div>
                              <div style={{ color: T.text, fontSize: 11, marginTop: 4, fontFamily: reference.mono ? "monospace" : "Georgia,serif", wordBreak: "break-word" }}>{reference.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.55 }}>{dossierSourceIdsEmptyCopy(item.type)}</div>
                      )}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Provenance / source references</div>
                      {item.provenanceRefs?.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                          {item.provenanceRefs.map(reference => (
                            <div key={`${item.id}:prov:${reference.label}:${reference.value}`} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 10px" }}>
                              <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 0.8 }}>{reference.label}</div>
                              {reference.href ? (
                                <a href={reference.href} target="_blank" rel="noreferrer" style={{ color: T.accent, fontSize: 11, marginTop: 4, display: "inline-block", wordBreak: "break-all" }}>{reference.value}</a>
                              ) : (
                                <div style={{ color: T.text, fontSize: 11, marginTop: 4, fontFamily: reference.mono ? "monospace" : "Georgia,serif", wordBreak: "break-word" }}>{reference.value}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.55 }}>{dossierProvenanceEmptyCopy(item.type)}</div>
                      )}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
                      <textarea
                        value={item.note || ""}
                        onChange={e => onUpdateItemNote(item.id, e.target.value)}
                        placeholder="Add a short note about why this item belongs in the packet."
                        style={{ width: "100%", minHeight: 72, resize: "vertical", background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontFamily: "Georgia,serif", fontSize: 12, lineHeight: 1.55 }}
                      />
                    </div>
                  </article>
                ))
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DossierReportView({ items, mode, title, globalNote, sectionOrder, generatedAt, onBack, onPrint }) {
  const T = LIGHT;
  const orderedSectionIds = normalizedDossierSectionOrder(sectionOrder);
  const itemsByType = useMemo(
    () => items.reduce((acc, item) => {
      acc[item.type] = [...(acc[item.type] || []), item];
      return acc;
    }, {}),
    [items],
  );
  const sectionSummaries = orderedSectionIds.map(sectionId => {
    if (sectionId === "notes") {
      const noteCount = items.filter(item => item.note?.trim()).length + (globalNote.trim() ? 1 : 0);
      return { id: "notes", label: "Notes", items: [], count: noteCount };
    }
    const section = DOSSIER_SECTIONS.find(entry => entry.id === sectionId);
    const sectionItems = itemsByType[sectionId] || [];
    return { id: sectionId, label: section?.label || sectionId, items: sectionItems, count: sectionItems.length };
  });
  const reportSections = sectionSummaries.filter(section => section.id !== "notes" && section.count > 0);
  const notesItems = items.filter(item => item.note?.trim());
  const quickCounts = [
    { label: "Companies", value: itemsByType.company?.length || 0 },
    { label: "Linkage artifacts", value: itemsByType.linkage_artifact?.length || 0 },
    { label: "Ingredients", value: itemsByType.substance?.length || 0 },
    { label: "Evidence", value: itemsByType.evidence?.length || 0 },
    { label: "Media & documents", value: itemsByType.media_image?.length || 0 },
    { label: "Graph summaries", value: itemsByType.graph_summary?.length || 0 },
  ];
  const evidenceAppendixItems = items.filter(item => item.type === "evidence" || item.provenanceRefs?.length);
  const mediaAppendixItems = items.filter(item => item.type === "media_image");
  const itemCategoryLabel = item => {
    if (item.type === "evidence") return "Source evidence";
    if (item.type === "graph_summary") return "Derived summary";
    return "Reference item";
  };

  return (
    <div style={{ height: "100vh", overflowY: "auto", background: "#f5f1e8", color: T.text, fontFamily: "Georgia,serif" }}>
      <style>{`
        @media print {
          body { background: #ffffff !important; }
          .report-screen-only { display: none !important; }
          .report-root { padding: 0 !important; }
          .report-shell { box-shadow: none !important; border: none !important; max-width: none !important; }
          .report-card, .report-section, .report-cover { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      <div className="report-root" style={{ padding: "24px clamp(18px, 3vw, 36px)" }}>
        <div className="report-screen-only" style={{ maxWidth: 1040, margin: "0 auto 16px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onBack}
            style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 12 }}
          >
            Back to dossier
          </button>
          <button
            type="button"
            onClick={onPrint}
            style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accent}`, borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 12, fontWeight: 700 }}
          >
            Print / Save as PDF
          </button>
        </div>

        <div className="report-shell" style={{ maxWidth: 1040, margin: "0 auto", background: "#fffdf9", border: `1px solid ${T.border}`, boxShadow: "0 18px 44px rgba(24,21,15,0.10)" }}>
          <section className="report-cover" style={{ padding: "40px clamp(24px, 4vw, 48px)", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ color: T.accent, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Scrape &amp; Bake Dossier Report</div>
            <h1 style={{ margin: "14px 0 10px", fontSize: "clamp(32px, 4vw, 46px)", lineHeight: 1.05, color: T.text }}>{title || "Untitled dossier"}</h1>
            <div style={{ color: T.textMid, fontSize: 14, lineHeight: 1.7, maxWidth: 720 }}>
              This print-friendly report preserves the dossier’s current grouping, ordering, citation-ready identifiers, provenance references, and analyst notes. Source evidence, derived summaries, and analyst commentary remain distinct.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 22 }}>
              {[
                ["Mode", APP_MODES[mode]?.label || mode],
                ["Prepared", formatDossierTimestamp(generatedAt)],
                ["Items", items.length],
                ["Sections", reportSections.length + (globalNote.trim() || notesItems.length ? 1 : 0)],
              ].map(([label, value]) => (
                <div key={label} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px" }}>
                  <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
                  <div style={{ color: T.text, fontSize: 15, fontWeight: 700, marginTop: 4 }}>{value}</div>
                </div>
              ))}
            </div>
            {globalNote.trim() && (
              <div style={{ marginTop: 18, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 6 }}>Packet summary note</div>
                <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{globalNote}</div>
              </div>
            )}
          </section>

          <section className="report-section" style={{ padding: "28px clamp(24px, 4vw, 48px)", borderBottom: `1px solid ${T.border}` }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Packet Summary</h2>
            <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.65, marginTop: 8 }}>
              This summary reflects the currently collected dossier items. Evidence records are primary source-bearing entries. Graph summaries and aggregate counts are derived views. Analyst notes remain distinct from sourced facts.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 16 }}>
              {quickCounts.map(count => (
                <div key={count.label} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px" }}>
                  <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>{count.label}</div>
                  <div style={{ color: T.text, fontSize: 22, fontWeight: 700, marginTop: 5 }}>{count.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="report-section" style={{ padding: "28px clamp(24px, 4vw, 48px)", borderBottom: `1px solid ${T.border}` }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Section Index</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 14 }}>
              {sectionSummaries.filter(section => section.count > 0).map(section => (
                <div key={section.id} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px" }}>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>{section.label}</div>
                  <div style={{ color: T.textMuted, fontSize: 11, marginTop: 4 }}>{section.count} item{section.count === 1 ? "" : "s"}</div>
                </div>
              ))}
            </div>
          </section>

          {reportSections.map(section => (
            <section key={section.id} className="report-section" style={{ padding: "28px clamp(24px, 4vw, 48px)", borderBottom: `1px solid ${T.border}` }}>
              <h2 style={{ margin: 0, fontSize: 24 }}>{section.label}</h2>
              <div style={{ color: T.textMuted, fontSize: 12, marginTop: 6 }}>{section.count} collected item{section.count === 1 ? "" : "s"}</div>
              <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
                {section.items.map(item => (
                  <article key={item.id} className="report-card" style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 420px", minWidth: 0 }}>
                        <div style={{ display: "inline-flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accent}33`, borderRadius: 999, padding: "2px 8px", fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
                            {dossierTypeLabel(item.type)}
                          </span>
                          <span style={{ background: item.type === "evidence" ? "#fef2f2" : item.type === "graph_summary" ? "#fff7ed" : T.surfaceAlt, color: item.type === "evidence" ? "#b91c1c" : item.type === "graph_summary" ? "#c2410c" : T.textMid, borderRadius: 999, padding: "2px 8px", fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
                            {itemCategoryLabel(item)}
                          </span>
                        </div>
                        <div style={{ color: T.text, fontSize: 18, fontWeight: 700, marginTop: 8 }}>{item.title}</div>
                        {item.summary && <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.65, marginTop: 6 }}>{item.summary}</div>}
                      </div>
                      <div style={{ color: T.textMuted, fontSize: 11, minWidth: 180, textAlign: "right" }}>
                        Added {formatDossierTimestamp(item.addedAt)}
                      </div>
                    </div>

                    {item.metrics?.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        {item.metrics.map(metric => (
                          <div key={`${item.id}:report-metric:${metric.label}`} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 10px", fontSize: 10 }}>
                            <span style={{ color: T.textMuted, marginRight: 6 }}>{metric.label}</span>
                            <span style={{ color: T.text, fontWeight: 700 }}>{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 14 }}>
                      <div>
                        <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Citation-ready entity / record IDs</div>
                        {item.sourceIds?.length ? item.sourceIds.map(reference => (
                          <div key={`${item.id}:report-source:${reference.label}:${reference.value}`} style={{ marginBottom: 7 }}>
                            <div style={{ color: T.textMuted, fontSize: 9 }}>{reference.label}</div>
                            <div style={{ color: T.text, fontSize: 11, fontFamily: reference.mono ? "monospace" : "Georgia,serif", wordBreak: "break-word" }}>{reference.value}</div>
                          </div>
                        )) : <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.6 }}>{dossierSourceIdsEmptyCopy(item.type)}</div>}
                      </div>
                      <div>
                        <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Provenance / source references</div>
                        {item.provenanceRefs?.length ? item.provenanceRefs.map(reference => (
                          <div key={`${item.id}:report-prov:${reference.label}:${reference.value}`} style={{ marginBottom: 7 }}>
                            <div style={{ color: T.textMuted, fontSize: 9 }}>{reference.label}</div>
                            {reference.href ? (
                              <div style={{ color: T.text, fontSize: 11, wordBreak: "break-word" }}>{reference.value}</div>
                            ) : (
                              <div style={{ color: T.text, fontSize: 11, fontFamily: reference.mono ? "monospace" : "Georgia,serif", wordBreak: "break-word" }}>{reference.value}</div>
                            )}
                          </div>
                        )) : <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.6 }}>{dossierProvenanceEmptyCopy(item.type)}</div>}
                      </div>
                    </div>

                    {item.note?.trim() && (
                      <div style={{ marginTop: 14, background: "#fff9e8", border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px" }}>
                        <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Analyst note</div>
                        <div style={{ color: T.textMid, fontSize: 12, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{item.note}</div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}

          {(globalNote.trim() || notesItems.length > 0) && (
            <section className="report-section" style={{ padding: "28px clamp(24px, 4vw, 48px)", borderBottom: `1px solid ${T.border}` }}>
              <h2 style={{ margin: 0, fontSize: 24 }}>Notes</h2>
              {globalNote.trim() && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Packet note</div>
                  <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{globalNote}</div>
                </div>
              )}
              {notesItems.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Item notes</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {notesItems.map(item => (
                      <div key={`${item.id}:note`} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", background: T.surfaceAlt }}>
                        <div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                        <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>{dossierTypeLabel(item.type)}</div>
                        <div style={{ color: T.textMid, fontSize: 12, lineHeight: 1.65, marginTop: 8, whiteSpace: "pre-wrap" }}>{item.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="report-section" style={{ padding: "28px clamp(24px, 4vw, 48px)", borderBottom: `1px solid ${T.border}` }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Evidence / Provenance Appendix</h2>
            <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.65, marginTop: 8 }}>
              This appendix highlights explicitly collected evidence items and provenance-bearing references preserved in the current packet. Derived summaries remain separate from source-bearing entries.
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {evidenceAppendixItems.length ? evidenceAppendixItems.map(item => (
                <div key={`${item.id}:appendix-evidence`} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", background: T.surfaceAlt }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                      <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3 }}>{dossierTypeLabel(item.type)} · Added {formatDossierTimestamp(item.addedAt)}</div>
                    </div>
                    <div style={{ color: item.type === "evidence" ? "#b91c1c" : T.textMid, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      {item.type === "evidence" ? "Source evidence" : "Referenced provenance"}
                    </div>
                  </div>
                  {item.provenanceRefs?.length ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, marginTop: 10 }}>
                      {item.provenanceRefs.map(reference => (
                        <div key={`${item.id}:appendix-prov:${reference.label}:${reference.value}`} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ color: T.textMuted, fontSize: 9 }}>{reference.label}</div>
                          <div style={{ color: T.text, fontSize: 11, marginTop: 4, wordBreak: "break-word" }}>{reference.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.6, marginTop: 10 }}>{dossierProvenanceEmptyCopy(item.type)}</div>
                  )}
                </div>
              )) : (
                <div style={{ color: T.textMuted, fontSize: 12, lineHeight: 1.6 }}>No evidence or provenance appendix entries are currently stored in this packet.</div>
              )}
            </div>
          </section>

          <section className="report-section" style={{ padding: "28px clamp(24px, 4vw, 48px)" }}>
            <h2 style={{ margin: 0, fontSize: 24 }}>Media / Exhibits Appendix</h2>
            <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.65, marginTop: 8 }}>
              Media items remain reference-based exhibits. This appendix lists what was reviewed without duplicating files into the packet export model.
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {mediaAppendixItems.length ? mediaAppendixItems.map(item => (
                <div key={`${item.id}:appendix-media`} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", background: T.surfaceAlt, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 92, flexShrink: 0 }}>
                    {item.previewUrl ? (
                      <img src={item.previewUrl} alt={item.title} style={{ width: "100%", height: 68, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}`, display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: 68, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>
                        Reference only
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                    {item.summary && <div style={{ color: T.textMid, fontSize: 12, lineHeight: 1.6, marginTop: 4 }}>{item.summary}</div>}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginTop: 10 }}>
                      {(item.sourceIds || []).map(reference => (
                        <div key={`${item.id}:appendix-source:${reference.label}:${reference.value}`} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ color: T.textMuted, fontSize: 9 }}>{reference.label}</div>
                          <div style={{ color: T.text, fontSize: 11, marginTop: 4, wordBreak: "break-word" }}>{reference.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ color: T.textMuted, fontSize: 12, lineHeight: 1.6 }}>No media or exhibit items are currently stored in this packet.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function artifactKindLabel(kind) {
  if (kind === "email") return "Email";
  if (kind === "phone") return "Phone";
  return "Linkage Artifact";
}

function getExplorerDetailTitle(tableKey, row) {
  if (tableKey === "evidence_readable") return `Source Evidence #${displayValue(row.EVIDENCE_ID)}`;
  if (tableKey === "substance_reference") return row.SUBSTANCE_NAME || "Ingredient Detail";
  if (tableKey === "substance_sourcing") return row.SUBSTANCE_SOURCING_LOCAL_NAME || "Ingredient Alias Detail";
  if (tableKey === "linkage_readable") return `${row.LINKAGE_METHOD || "Linkage"} ${row.LINKAGE_VALUE ? `· ${row.LINKAGE_VALUE}` : ""}`;
  if (tableKey === "association_readable") return `${row.company_name || "Company"} ↔ ${row.associated_company_name || "Associated Company"}`;
  return "Record Detail";
}

function getExplorerDetailSubtitle(tableKey, row) {
  if (tableKey === "evidence_readable") return [row.company_name, row.substance_name, row.evidence_type].filter(Boolean).join(" · ");
  if (tableKey === "substance_reference") return [row.SUBSTANCE_ID, row.SUBSTANCE_WEIGHT != null ? `Weight ${row.SUBSTANCE_WEIGHT}` : null].filter(Boolean).join(" · ");
  if (tableKey === "substance_sourcing") return [row.SUBSTANCE_ID, row.DATA_SOURCE_ID ? `Data source ${row.DATA_SOURCE_ID}` : null].filter(Boolean).join(" · ");
  if (tableKey === "linkage_readable") return [row.COMPANY_NAME || row.COMPANY_ID, row.Linkage_Value_Type].filter(Boolean).join(" · ");
  if (tableKey === "association_readable") return [row.LINKAGE_METHOD, row.LINKAGE_TYPE].filter(Boolean).join(" · ");
  return "";
}

function searchResultToDetailRecord(result) {
  const data = result.data || {};
  if (result.type === "evidence") {
    return {
      tableKey: "evidence_readable",
      row: {
        EVIDENCE_ID: data.evidenceId || data.id,
        company_name: data.companyName,
        substance_name: data.substanceName,
        evidence_type: data.evidenceType,
        data_source: data.sourceName,
        LISTED_NAME_SUBSTANCE: data.listedName,
        REGION: data.region,
        EVIDENCE_WEIGHT: data.weight,
        URL: data.url,
      },
    };
  }

  if (result.type === "linkage") {
    return {
      tableKey: "linkage_readable",
      row: {
        LINKAGEID: data.linkageId,
        COMPANY_ID: data.companyId,
        COMPANY_NAME: data.companyName,
        LINKAGE_METHOD: data.method,
        Linkage_Value_Type: data.valueType,
        LINKAGE_VALUE: data.value || result.label,
        DATA_SOURCE_ID: data.dataSourceId,
      },
    };
  }

  if (result.type === "association") {
    return {
      tableKey: "association_readable",
      row: {
        ASSOCIATIONID: data.associationId || data.id,
        company_name: data.companyName,
        associated_company_name: data.associatedCompanyName,
        LINKAGE_METHOD: data.method,
        LINKAGE_TYPE: data.linkageType,
        LINKAGE_VALUE: data.value || result.label,
      },
    };
  }

  if (result.type === "synonym") {
    return {
      tableKey: "substance_sourcing",
      row: {
        SUBSTANCE_SOURCING_ID: data.sourcingId,
        SUBSTANCE_ID: data.substanceId,
        SUBSTANCE_SOURCING_LOCAL_NAME: data.name || result.label,
        SUBSTANCE_SOURCING_TYPE_ID: data.sourcingTypeId,
        DATA_SOURCE_ID: data.dataSourceId,
        SUBSTANCE_SOURCING_PRIMARY: data.primary,
      },
    };
  }

  return null;
}

function DataExplorer({ dark, onSelectCompany, onSelectArtifact, onAddEvidenceToDossier, isEvidenceInDossier, explorerContextRequest, onHandledExplorerContextRequest }) {
  const T = dark ? DARK : LIGHT;
  const [activeTable, setActiveTable] = useState(EXPLORER_TABLES[0]);
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortCol, setSortCol] = useState(EXPLORER_TABLES[0].defaultSort || null);
  const [sortDir, setSortDir] = useState(EXPLORER_TABLES[0].defaultDir || "asc");
  const [detailRecord, setDetailRecord] = useState(null);
  const [selectedEvidenceRowIds, setSelectedEvidenceRowIds] = useState([]);
  const dataRequestRef = useRef(0);
  const evidenceSelectionEnabled = activeTable.key === "evidence_readable";
  const evidenceRowKey = useCallback(row => String(row?.EVIDENCE_ID ?? row?.record_id ?? row?.URL ?? ""), []);

  const fetchData = useCallback(async (tbl, q, pg, col, dir) => {
    const requestId = ++dataRequestRef.current;
    setLoading(true);
    try {
      const cols = tbl.columns.map(c => `"${c}"`).join(",");
      let query = supabase.from(tbl.from).select(cols, { count: "exact" });
      if (q && tbl.searchCol) query = query.ilike(`"${tbl.searchCol}"`, `%${q}%`);
      if (col) query = query.order(`"${col}"`, { ascending: dir === "asc" });
      const { data, count, error } = await query.range(pg * PAGE_SIZE, pg * PAGE_SIZE + PAGE_SIZE - 1);
      if (error) throw error;
      let rows = data || [];
      // For linkage table: resolve COMPANY_ID to COMPANY_NAME
        if (tbl.renderCompanyName && rows.length) {
          const ids = [...new Set(rows.map(r => r.COMPANY_ID).filter(Boolean))];
          const { data: compData } = await supabase.from("company").select('"COMPANY_ID","COMPANY_NAME"').in('"COMPANY_ID"', ids);
          if (requestId !== dataRequestRef.current) return;
          const compMap = {};
          (compData || []).forEach(c => { compMap[c.COMPANY_ID] = c.COMPANY_NAME; });
          rows = rows.map(r => ({ ...r, COMPANY_NAME: compMap[r.COMPANY_ID] || `ID: ${r.COMPANY_ID}` }));
        }
      if (requestId !== dataRequestRef.current) return;
      setRows(rows); setTotal(count || 0);
    } catch (e) { if (requestId === dataRequestRef.current) { console.error(e); setRows([]); } } finally { if (requestId === dataRequestRef.current) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData(activeTable, searchQ, page, sortCol, sortDir);
  }, [activeTable, searchQ, page, sortCol, sortDir, fetchData]);

  useEffect(() => {
    setSelectedEvidenceRowIds([]);
  }, [activeTable.key, page, searchQ, sortCol, sortDir]);

  useEffect(() => {
    if (!explorerContextRequest) return;
    const requestedTable = EXPLORER_TABLES.find(tbl => tbl.key === explorerContextRequest.tableKey) || EXPLORER_TABLES[0];
    setActiveTable(requestedTable);
    setSearchQ(explorerContextRequest.search || "");
    setPage(0);
    setSortCol(requestedTable.defaultSort || null);
    setSortDir(requestedTable.defaultDir || "asc");
    setDetailRecord(null);
    setSelectedEvidenceRowIds([]);
    onHandledExplorerContextRequest?.();
  }, [explorerContextRequest, onHandledExplorerContextRequest]);

  const handleSort = col => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("asc"); } setPage(0); };
  const handleTableChange = tbl => {
    setActiveTable(tbl);
    setSearchQ("");
    setPage(0);
    setSortCol(tbl.defaultSort || null);
    setSortDir(tbl.defaultDir || "asc");
    setDetailRecord(null);
  };
  const handleSearchChange = value => {
    setSearchQ(value);
    setPage(0);
  };
  const selectedEvidenceRows = useMemo(() => {
    const selectedIds = new Set(selectedEvidenceRowIds);
    return evidenceSelectionEnabled ? rows.filter(row => selectedIds.has(evidenceRowKey(row))) : [];
  }, [evidenceRowKey, evidenceSelectionEnabled, rows, selectedEvidenceRowIds]);
  const allVisibleEvidenceSelected = evidenceSelectionEnabled && rows.length > 0 && rows.every(row => selectedEvidenceRowIds.includes(evidenceRowKey(row)));
  const toggleEvidenceRowSelection = row => {
    const key = evidenceRowKey(row);
    setSelectedEvidenceRowIds(current => (
      current.includes(key)
        ? current.filter(entry => entry !== key)
        : [...current, key]
    ));
  };
  const toggleSelectAllEvidenceRows = () => {
    if (!evidenceSelectionEnabled) return;
    setSelectedEvidenceRowIds(current => {
      if (allVisibleEvidenceSelected) return [];
      const visibleIds = rows.map(evidenceRowKey).filter(Boolean);
      return [...new Set([...current, ...visibleIds])];
    });
  };
  const addSelectedEvidenceRowsToDossier = () => {
    if (!onAddEvidenceToDossier) return;
    selectedEvidenceRows.forEach(row => onAddEvidenceToDossier(explorerEvidenceRowToDossierRow(row), "Evidence table selection"));
  };
  const handleExport = async () => {
    setLoading(true);
    try {
      const { rows: exportData } = await invokeAuthorizedData({
        action: "export",
        tableKey: activeTable.key,
        search: searchQ,
        sortCol,
        sortDir,
      });
      if (exportData?.length) downloadCSV(exportData, `${activeTable.key}_export.csv`);
    } finally { setLoading(false); }
  };
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeDetailSupported = DETAIL_TABLE_KEYS.has(activeTable.key);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "Georgia,serif" }}>
      <div style={{ padding: "14px 24px 0", borderBottom: `1px solid ${T.border}`, background: T.surface, overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 2, minWidth: "max-content" }}>
          {EXPLORER_TABLES.map(tbl => (
              <button key={tbl.key} onClick={() => handleTableChange(tbl)}
                style={{ padding: "7px 14px", borderRadius: "6px 6px 0 0", border: `1px solid ${activeTable.key === tbl.key ? T.border : "transparent"}`, borderBottom: activeTable.key === tbl.key ? `2px solid ${T.accent}` : "1px solid transparent", background: activeTable.key === tbl.key ? T.bg : "transparent", color: activeTable.key === tbl.key ? T.accent : T.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "Georgia,serif", fontWeight: activeTable.key === tbl.key ? 700 : 400, whiteSpace: "nowrap" }}>{tbl.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${searchQ ? T.accent : T.border}`, borderRadius: 6, padding: "6px 12px", flex: 1, maxWidth: 400 }}>
          <span style={{ color: T.textMuted, fontSize: 13 }}>⌕</span>
            <input value={searchQ} onChange={e => handleSearchChange(e.target.value)} placeholder={activeTable.searchCol ? `Search by ${activeTable.searchCol}...` : "No search available"} disabled={!activeTable.searchCol}
              style={{ background: "none", border: "none", outline: "none", color: T.text, fontSize: 11, fontFamily: "Georgia,serif", flex: 1 }} />
            {searchQ && <button onClick={() => handleSearchChange("")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 12 }}>✕</button>}
        </div>
        <div style={{ color: T.textMuted, fontSize: 11 }}>{total.toLocaleString()} rows{searchQ ? " (filtered)" : ""}</div>
        {evidenceSelectionEnabled && (
          <div style={{ color: T.textMuted, fontSize: 11 }}>
            {selectedEvidenceRowIds.length.toLocaleString()} selected
          </div>
        )}
        {sortCol && <div style={{ color: T.accent, fontSize: 10, background: T.accentBg, padding: "3px 10px", borderRadius: 3 }}>Sorted: {sortCol} {sortDir === "asc" ? "↑" : "↓"} <button onClick={() => setSortCol(null)} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 10, marginLeft: 4 }}>✕</button></div>}
        {evidenceSelectionEnabled && onAddEvidenceToDossier && (
          <button
            type="button"
            onClick={addSelectedEvidenceRowsToDossier}
            disabled={!selectedEvidenceRowIds.length}
            style={{ background: selectedEvidenceRowIds.length ? T.surface : T.surfaceAlt, border: `1px solid ${selectedEvidenceRowIds.length ? T.accent : T.border}`, color: selectedEvidenceRowIds.length ? T.accent : T.textMuted, padding: "6px 14px", borderRadius: 999, cursor: selectedEvidenceRowIds.length ? "pointer" : "not-allowed", fontSize: 11, fontFamily: "Georgia,serif", fontWeight: 700 }}
          >
            Add selected evidence to dossier
          </button>
        )}
        <button onClick={handleExport} style={{ background: T.accentBg, border: `1px solid ${T.accent}44`, color: T.accent, padding: "6px 16px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif", fontWeight: 600 }}>↓ Export CSV</button>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <span style={{ color: T.textMuted, fontSize: 11 }}>Loading...</span>
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 12 }}>No results found</div>
        ) : (
          <>
            {TABLE_DESCRIPTIONS[activeTable.from] && (
              <div style={{ padding: "10px 18px", background: T.accentBg, borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.textMid, fontFamily: "Georgia,serif" }}>
                <span style={{ color: T.accent, fontWeight: 700, marginRight: 8 }}>ⓘ</span>{TABLE_DESCRIPTIONS[activeTable.from]}
              </div>
            )}
	          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
	            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
	              <tr style={{ background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>
	                {evidenceSelectionEnabled && (
	                  <th style={{ textAlign: "center", padding: "9px 10px", color: T.textMuted, fontSize: 9, letterSpacing: 1.1, fontWeight: 700, borderRight: `1px solid ${T.border}`, width: 36 }}>
	                    <input
	                      type="checkbox"
	                      checked={allVisibleEvidenceSelected}
	                      onChange={toggleSelectAllEvidenceRows}
	                      aria-label="Select all visible evidence rows"
	                    />
	                  </th>
	                )}
	                {activeTable.columns.map(col => {
                  const tip = COLUMN_TOOLTIPS[col];
                  return (
                      <th key={col} tabIndex={0} onClick={() => handleSort(col)} onKeyDown={onKeyboardActivate(() => handleSort(col))}
                        style={{ textAlign: "left", padding: "9px 14px", color: sortCol === col ? T.accent : T.textMuted, fontSize: 9, letterSpacing: 1.1, fontWeight: 700, whiteSpace: "nowrap", borderRight: `1px solid ${T.border}`, cursor: "pointer", userSelect: "none", position: "relative" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {col.toUpperCase()}{sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                        {tip && (
                          <span className="col-tip-wrap" style={{ position: "relative", display: "inline-flex" }}>
                            <span style={{ fontSize: 9, color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: "50%", width: 13, height: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "help", flexShrink: 0 }}>?</span>
                            <span className="col-tip" style={{ display: "none", position: "absolute", top: "100%", left: 0, zIndex: 200, background: dark ? "#0f1520" : "#fff", border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 10px", fontSize: 11, color: T.text, fontWeight: 400, letterSpacing: 0, whiteSpace: "normal", width: 220, boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.12)", lineHeight: 1.5, marginTop: 4 }}>
                              {tip}
                            </span>
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => {
                  const canOpenCompany = activeTable.key === "company" && row.COMPANY_ID && onSelectCompany;
                  const artifactEntity = getArtifactEntityFromTableRow(activeTable.key, row);
                  const canOpenArtifact = Boolean(artifactEntity && onSelectArtifact);
                  const canOpenDetail = activeDetailSupported;
                  const openCompany = () => {
                    if (!canOpenCompany) return;
                    onSelectCompany({
                      id: row.COMPANY_ID, name: row.COMPANY_NAME, chineseName: row.CHINESE_NAME,
                      active: row.ACTIVE_INACTIVE, type: row.BUSINESS_TYPE,
                      region: row.PRC_HOME_BASE, gov: row.GOV_COMPLICITY,
                      connections: 0, weight: 0, risk: 0,
                    });
                  };
                  const openDetail = () => {
                    if (canOpenCompany) openCompany();
                    else if (canOpenArtifact) onSelectArtifact(artifactEntity);
                    else if (canOpenDetail) setDetailRecord({ tableKey: activeTable.key, row });
                  };
                  const canOpenRow = canOpenCompany || canOpenArtifact || canOpenDetail;
	                  return (
	                  <tr key={i} tabIndex={canOpenRow ? 0 : undefined}
                    aria-label={canOpenCompany ? `Open company ${row.COMPANY_NAME || row.COMPANY_ID}` : canOpenDetail ? `Open ${activeTable.label} detail` : undefined}
                    style={{ borderBottom: `1px solid ${T.border}`, cursor: canOpenRow ? "pointer" : "default" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
	                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
	                    onClick={openDetail}
	                    onKeyDown={canOpenRow ? onKeyboardActivate(openDetail) : undefined}>
	                    {evidenceSelectionEnabled && (
	                      <td style={{ padding: "8px 10px", borderRight: `1px solid ${T.border}`, textAlign: "center" }}>
	                        <input
	                          type="checkbox"
	                          checked={selectedEvidenceRowIds.includes(evidenceRowKey(row))}
	                          onClick={e => e.stopPropagation()}
	                          onChange={() => toggleEvidenceRowSelection(row)}
	                          aria-label={`Select evidence row ${row.EVIDENCE_ID}`}
	                        />
	                      </td>
	                    )}
	                    {activeTable.columns.map(col => {
                      const val = row[col];
                      if (col === "evidence_type" && val) return <td key={col} style={{ padding: "8px 14px", borderRight: `1px solid ${T.border}` }}><span style={{ color: evidCol(val, dark), fontWeight: 600, fontSize: 11 }}>{val}</span></td>;
                    if (col === "evidence_count" && val != null) return <td key={col} style={{ padding: "8px 14px", color: T.accent, fontWeight: 600, borderRight: `1px solid ${T.border}`, fontSize: 11 }}>{Number(val).toLocaleString()}</td>;
                    if (col === "EVIDENCE_WEIGHT" && val != null) return <td key={col} style={{ padding: "8px 14px", color: T.textMid, fontWeight: 600, borderRight: `1px solid ${T.border}`, fontSize: 11 }}>{Number(val).toLocaleString()}</td>;
                    if (col === "LINKAGE_METHOD" && val) return <td key={col} style={{ padding: "8px 14px", borderRight: `1px solid ${T.border}` }}><span style={{ color: linkCol(val, dark), fontWeight: 600, fontSize: 11 }}>{val}</span></td>;
                    return <td key={col} style={{ padding: "8px 14px", color: T.text, borderRight: `1px solid ${T.border}`, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val == null ? <span style={{ color: T.textMuted, fontStyle: "italic" }}>—</span> : String(val)}</td>;
                  })}
                  </tr>
                  );
                })}
            </tbody>
          </table>
          </>
        )}
      </div>
      <style>{`.col-tip-wrap:hover .col-tip { display: block !important; }`}</style>
      <div style={{ padding: "10px 24px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface }}>
        <div style={{ color: T.textMuted, fontSize: 11 }}>Page {page + 1} of {Math.max(totalPages, 1)} · {rows.length} of {total.toLocaleString()} rows</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["«", () => setPage(0), page === 0], ["‹", () => setPage(p => Math.max(0, p - 1)), page === 0], ["›", () => setPage(p => Math.min(totalPages - 1, p + 1)), page >= totalPages - 1], ["»", () => setPage(totalPages - 1), page >= totalPages - 1]].map(([label, action, disabled]) => (
            <button key={label} onClick={action} disabled={disabled} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: disabled ? T.textMuted : T.text, padding: "4px 12px", borderRadius: 4, cursor: disabled ? "default" : "pointer", fontSize: 11, fontFamily: "Georgia,serif", opacity: disabled ? 0.5 : 1 }}>{label}</button>
          ))}
        </div>
      </div>
      <BottomDrawer
        open={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        title={detailRecord ? getExplorerDetailTitle(detailRecord.tableKey, detailRecord.row) : ""}
        subtitle={detailRecord ? getExplorerDetailSubtitle(detailRecord.tableKey, detailRecord.row) : ""}
        dark={dark}
      >
        {detailRecord && <ExplorerDetailContent tableKey={detailRecord.tableKey} row={detailRecord.row} dark={dark} onAddEvidenceToDossier={onAddEvidenceToDossier} isEvidenceInDossier={isEvidenceInDossier} />}
      </BottomDrawer>
    </div>
  );
}

// ── Stats Bar ──────────────────────────────────────────────────────────────
function StatsBar({ ingredientCount, evidenceTotal, companyTotal, sourcePageTotal, networkLinkTotal, dark }) {
  const T = dark ? DARK : LIGHT;
  const stats = [
    { label: "Companies", value: companyTotal > 0 ? companyTotal.toLocaleString() : "…", bg: dark ? "#3d2641" : "#ffe0ea", accent: dark ? "#ffd166" : "#a0315b" },
    { label: "Ingredients", value: ingredientCount > 0 ? ingredientCount.toLocaleString() : "…", bg: dark ? "#2f5232" : "#e4f7d9", accent: dark ? "#ffd166" : "#2f6d3d" },
    { label: "Evidence rows", value: evidenceTotal > 0 ? evidenceTotal.toLocaleString() : "…", bg: dark ? "#63331e" : "#ffe5d2", accent: dark ? "#ffd166" : "#b55326" },
    { label: "Source pages", value: sourcePageTotal > 0 ? sourcePageTotal.toLocaleString() : "…", bg: dark ? "#2e3567" : "#e3e8ff", accent: dark ? "#ffd166" : "#233d8b" },
    { label: "Network links", value: networkLinkTotal > 0 ? networkLinkTotal.toLocaleString() : "…", bg: dark ? "#5a4720" : "#fff0b8", accent: dark ? "#ffd166" : "#8d5f00" },
  ];
  return (
    <div style={{ padding: "10px clamp(12px, 2vw, 24px)", background: T.bg, flexShrink: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))", gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: s.bg, border: `2px solid ${s.accent}`, borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ color: s.accent, fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 800 }}>{s.label}</div>
            <div style={{ color: T.text, fontSize: 20, fontWeight: 800, fontFamily: DISPLAY_FONT, lineHeight: 1.05, marginTop: 3 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineBar({ dark, selectedRunId, onSelectRun, movementSummary }) {
  const T = dark ? DARK : LIGHT;
  const activeRun = timelineOptionById(selectedRunId);
  return (
    <div style={{ padding: "2px clamp(12px, 2vw, 24px) 14px", background: T.bg, display: "grid", gap: 10, flexShrink: 0 }}>
      <div style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: T.text, fontSize: 12, fontWeight: 800, fontFamily: DISPLAY_FONT }}>Show network as of...</div>
          <div style={{ color: T.textMuted, fontSize: 10, marginTop: 3, fontFamily: BODY_FONT }}>
            {selectedRunId === "all_runs"
              ? "All synthetic scrape runs combined across bakery, supplier, distributor, and public-claim pages."
              : `${activeRun.platform} · ${formatTimelineDate(activeRun.date)}`}
          </div>
        </div>
        <div style={{ color: T.textMuted, fontSize: 10, fontFamily: BODY_FONT }}>
          {movementSummary?.newEvidenceRows != null ? `Latest step adds ${movementSummary.newEvidenceRows} evidence rows and ${movementSummary.newLinks} links.` : ""}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SCRAPE_RUN_OPTIONS.map(option => {
          const active = option.id === selectedRunId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectRun(option.id)}
              style={{
                background: active ? T.accentBg : T.surface,
                color: active ? T.accent : T.textMid,
                border: `2px solid ${active ? T.accent : T.border}`,
                borderRadius: 10,
                padding: "7px 10px",
                cursor: "pointer",
                textAlign: "left",
                minWidth: 132,
                fontFamily: BODY_FONT,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800 }}>{option.label}</div>
              {option.platform && option.id !== "all_runs" && <div style={{ fontSize: 9, color: active ? T.accent : T.textMuted, marginTop: 2 }}>{option.platform}</div>}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function NetworkMovementPanel({ dark, selectedRunId, summary }) {
  const T = dark ? DARK : LIGHT;
  if (!summary) return null;
  return (
    <div style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Network Movement</div>
      <div style={{ color: T.text, fontSize: 13, fontWeight: 800, fontFamily: DISPLAY_FONT, marginBottom: 5 }}>
        {selectedRunId === "all_runs" ? "Combined synthetic timeline" : summary.label}
      </div>
      <div style={{ color: T.textMid, fontSize: 11, lineHeight: 1.55, marginBottom: 10 }}>{summary.message}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 7 }}>
        {[
          ["New companies", summary.newCompanies],
          ["New ingredients", summary.newIngredients],
          ["New evidence", summary.newEvidenceRows],
          ["New links", summary.newLinks],
        ].map(([label, value]) => (
          <div key={label} style={{ background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 10, padding: "7px 8px" }}>
            <div style={{ color: T.textMuted, fontSize: 8, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</div>
            <div style={{ color: T.text, fontSize: 14, fontWeight: 800, fontFamily: DISPLAY_FONT, marginTop: 2 }}>{Number(value || 0).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphLegendPanel({ dark }) {
  const T = dark ? DARK : LIGHT;
  return (
    <div style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>Graph Legend</div>
      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, marginBottom: 9 }}>LINKAGE TYPE</div>
      {[["IP Address", linkCol("IP Address", dark)], ["Email", linkCol("Email", dark)], ["Phone", linkCol("Phone", dark)]].map(([k, v]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <div style={{ width: 20, height: 3, background: v, borderRadius: 2 }} />
          <span style={{ color: T.textMid, fontSize: 10 }}>{k}</span>
        </div>
      ))}
      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, marginTop: 11, marginBottom: 9 }}>{GRAPH_PRIORITY_LABEL.toUpperCase()}</div>
      {[[90, "≥85 Critical"], [70, "65–84 High"], [50, "45–64 Medium"], [30, "<45 Low"]].map(([sc, k]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: riskBg(sc, dark), border: `1.5px solid ${riskColor(sc, dark)}` }} />
          <span style={{ color: T.textMid, fontSize: 10 }}>{k}</span>
        </div>
      ))}
      <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, marginTop: 11, marginBottom: 9 }}>NODE TYPE</div>
      {[["Company", "circle", T.textMid], ["Email artifact", "diamond", linkCol("Email", dark)], ["Phone artifact", "square", linkCol("Phone", dark)]].map(([label, shape, color]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <div style={{ width: 11, height: 11, transform: shape === "diamond" ? "rotate(45deg)" : "none", borderRadius: shape === "circle" ? "50%" : 2, border: `1.5px solid ${color}`, background: shape === "circle" ? color : "transparent" }} />
          <span style={{ color: T.textMid, fontSize: 10 }}>{label}</span>
        </div>
      ))}
      <div style={{ color: T.textMuted, fontSize: 9, lineHeight: 1.45, marginTop: 10 }}>
        Node size reflects {GRAPH_NODE_METRIC_LABEL.toLowerCase()}. Color reflects {GRAPH_PRIORITY_LABEL.toLowerCase()}.
      </div>
    </div>
  );
}

function AccessDeniedPanel({ dark, title = "Not authorized", message = "Your current role does not have access to this workspace." }) {
  const T = dark ? DARK : LIGHT;
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "26px clamp(16px, 3vw, 34px)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <section style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ color: T.text, fontSize: 22, fontWeight: 700 }}>{title}</div>
          <div style={{ color: T.textMid, fontSize: 13, lineHeight: 1.7, marginTop: 10, maxWidth: 620 }}>
            {message}
          </div>
        </section>
      </div>
    </div>
  );
}

function HomeLanding({ mode, canToggleMode, onModeChange, onFocusSearch, onNavigate, dark }) {
  const T = dark ? DARK : LIGHT;
  const isInvestigator = mode === "investigator";
  const actionCards = {
    search: {
      action: "search",
      name: "Search",
      summary: isInvestigator
        ? "Jump straight into identifiers, source evidence, and contact-led lookup from the global search bar."
        : "Start with companies, ingredients, and supplier entities from the global search bar.",
      useCase: isInvestigator ? "Best for beginning with an email, phone, handle, or source clue." : "Best for beginning with a company, ingredient, or named supplier.",
      accent: "Primary entry",
    },
    network: {
      action: "navigate",
      view: "network",
      name: "Network Graph",
      summary: "Explore the top network or build a bounded graph from a company, email, or phone.",
      useCase: isInvestigator ? "Best for following pivots between companies and shared artifacts." : "Best for reading network shape and strategic relationships.",
      accent: "Graph launchpad",
    },
    substances: {
      action: "navigate",
      view: "substances",
      name: "Ingredient Matrix",
      summary: "Scan ingredients, aliases, and linked-company patterns in one place.",
      useCase: isInvestigator ? "Best for checking naming variants and supplier overlap." : "Best for strategic pattern review across ingredients and actors.",
      accent: "Ingredient patterns",
    },
    flags: {
      action: "navigate",
      view: "flags",
      name: "Company Signals",
      summary: "Review higher-signal companies with scoring, source evidence, and ingredient context.",
      useCase: isInvestigator ? "Best for triaging who needs deeper source review next." : "Best for prioritizing targets quickly.",
      accent: "Signal triage",
    },
    explorer: {
      action: "navigate",
      view: "explorer",
      name: "Data Explorer",
      summary: "Inspect source-bearing evidence, linkage, association, and reference tables directly.",
      useCase: isInvestigator ? "Best for row-level verification and artifact-led review." : "Best for checking what supports a summary or claim.",
      accent: "Row-level review",
    },
    dossier: {
      action: "navigate",
      view: "dossier",
      name: "Dossier",
      summary: "Collect reviewed entities, source evidence, graph context, and exhibits into a working packet.",
      useCase: isInvestigator ? "Best for building a demo brief from verified findings." : "Best for assembling a brief or target packet.",
      accent: "Packet builder",
    },
  };
  const orderedCardIds = isInvestigator
    ? ["search", "explorer", "network", "dossier", "flags", "substances"]
    : ["search", "flags", "network", "substances", "dossier", "explorer"];
  const orderedCards = orderedCardIds
    .map(id => actionCards[id]);
  const handleCardAction = card => {
    if (card.action === "search") {
      onFocusSearch?.();
      return;
    }
    onNavigate(card.view);
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "26px clamp(16px, 3vw, 34px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <section style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Workflow mode</div>
              <div style={{ color: T.text, fontSize: 18, fontWeight: 800, fontFamily: DISPLAY_FONT }}>{isInvestigator ? "Operations launchpad" : "Overview launchpad"}</div>
              <div style={{ color: T.textMid, fontSize: 12, lineHeight: 1.5, marginTop: 4, maxWidth: 620 }}>
                {isInvestigator
                  ? "Use the cards below to move quickly into search, row-level source review, graph pivots, and dossier building."
                  : "Use the cards below to move quickly into search, company signals, network structure, ingredient patterns, and packet review."}
              </div>
            </div>
            {canToggleMode ? (
              <div style={{ display: "inline-flex", background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 12, padding: 4, gap: 4 }}>
                {Object.entries(APP_MODES).map(([value, option]) => {
                  const active = mode === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onModeChange(value)}
                      aria-pressed={active}
                      style={{ background: active ? T.accent : "transparent", color: active ? "#fff7eb" : T.text, border: "none", borderRadius: 9, padding: "8px 12px", cursor: "pointer", fontSize: 11, fontFamily: BODY_FONT, fontWeight: 700 }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", color: T.textMuted, fontSize: 11 }}>
                {APP_MODES[mode]?.label || APP_MODES[DEFAULT_VIEWER_MODE].label}
              </div>
            )}
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 18 }}>
          {orderedCards.map(card => (
            <button
              key={card.name}
              type="button"
              onClick={() => handleCardAction(card)}
              style={{ textAlign: "left", background: T.surface, border: `2px solid ${T.border}`, borderRadius: 12, padding: 16, cursor: "pointer", color: T.text, fontFamily: BODY_FONT, minHeight: 176 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ color: T.accent, fontSize: 9, letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 8 }}>{card.accent}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{card.name}</div>
              <div style={{ color: T.textMid, fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{card.summary}</div>
              <div style={{ color: T.textMuted, fontSize: 10, lineHeight: 1.5 }}>
                <strong style={{ color: T.text }}>Primary use:</strong> {card.useCase}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const initialView = (() => {
    try {
      return window.sessionStorage.getItem(APP_VIEW_STORAGE_KEY) || "home";
    } catch {
      return "home";
    }
  })();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [appAccess, setAppAccess] = useState(null);
  const [appAccessLoading, setAppAccessLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState(getInitialMode);
  const [dossierItems, setDossierItems] = useState([]);
  const [dossierTitle, setDossierTitle] = useState(buildDefaultDossierTitle(getInitialMode()));
  const [dossierGlobalNote, setDossierGlobalNote] = useState("");
  const [dossierSectionOrder, setDossierSectionOrder] = useState(DOSSIER_SECTIONS.map(section => section.id));
  const [view, setView] = useState(initialView);
  const [reportViewGeneratedAt, setReportViewGeneratedAt] = useState("");
  const [explorerContextRequest, setExplorerContextRequest] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSubstance, setSelectedSubstance] = useState(null);
  const [selectedArtifactEntity, setSelectedArtifactEntity] = useState(null);
  const [mediaPreviewRequest, setMediaPreviewRequest] = useState(null);
  const [artifactIntelligence, setArtifactIntelligence] = useState(null);
  const [artifactIntelligenceLoading, setArtifactIntelligenceLoading] = useState(false);
  const [artifactIntelligenceError, setArtifactIntelligenceError] = useState("");
  const [searchDetailRecord, setSearchDetailRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [searchResolvedQuery, setSearchResolvedQuery] = useState("");
  const [selectedRunId, setSelectedRunId] = useState("all_runs");
  const [expandedSearchType, setExpandedSearchType] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const globalSearchInputRef = useRef(null);
  const searchDebounce = useRef(null);
  const searchRequestRef = useRef(0);
  const [companyGraph, setCompanyGraph] = useState(null);
  const [companyGraphLoadingId, setCompanyGraphLoadingId] = useState(null);
  const [artifactGraphLoadingKey, setArtifactGraphLoadingKey] = useState("");
  const [companyGraphError, setCompanyGraphError] = useState("");
  const [graphCompanyQuery, setGraphCompanyQuery] = useState("");
  const [graphCompanyMatches, setGraphCompanyMatches] = useState([]);
  const [graphSelectedSeed, setGraphSelectedSeed] = useState(null);
  const [graphCompanySearchLoading, setGraphCompanySearchLoading] = useState(false);
  const [showGraphSummary, setShowGraphSummary] = useState(false);
  const [graphLayers, setGraphLayers] = useState({ email: false, phone: false });
  const [defaultGraphNodeLimit, setDefaultGraphNodeLimit] = useState(25);
  const [graphArtifactMinCompanies, setGraphArtifactMinCompanies] = useState(2);
  const [graphViewApi, setGraphViewApi] = useState(null);
  const companyGraphRequestRef = useRef(0);
  const graphCompanySearchDebounce = useRef(null);
  const graphCompanySearchRequestRef = useRef(0);

  const [companies, setCompanies] = useState([]);
  const [topWeightCompanies, setTopWeightCompanies] = useState([]);
  const [substances, setSubstances] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [evidenceSummary, setEvidenceSummary] = useState([]);
  const [substanceDataSources, setSubstanceDataSources] = useState([]);
  const [evidenceTypes, setEvidenceTypes] = useState([]);
  const [evidenceTotal, setEvidenceTotal] = useState(0);
  const [companyTotal, setCompanyTotal] = useState(0);
  const [associationTotal, setAssociationTotal] = useState(0);
  const [sourcePageTotal, setSourcePageTotal] = useState(0);
  const [linkageTotal, setLinkageTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const initialDataRequestRef = useRef(0);
  const artifactIntelligenceRequestRef = useRef(0);

  const T = dark ? DARK : LIGHT;
  const selectedRunOption = useMemo(() => timelineOptionById(selectedRunId), [selectedRunId]);
  const movementSummary = useMemo(() => MOVEMENT_SUMMARIES[selectedRunId] || MOVEMENT_SUMMARIES.all_runs || null, [selectedRunId]);
  const sessionUserId = session?.user?.id || "";
  const sessionUserEmail = session?.user?.email || "";
  const sessionAccessToken = session?.access_token || "";
  const accessVerificationSession = useMemo(
    () => (sessionUserId && sessionAccessToken
      ? { user: { id: sessionUserId, email: sessionUserEmail }, access_token: sessionAccessToken }
      : null),
    [sessionAccessToken, sessionUserEmail, sessionUserId],
  );
  const appRole = normalizeAppRole(appAccess?.role);
  const isAdmin = appRole === "admin";
  const isAnalyst = appRole === "analyst";
  const canToggleMode = isAdmin || isAnalyst;
  const canAccessAdminViews = isAdmin;
  const canAccessScrapeAnalysis = isAdmin;
  const effectiveMode = canToggleMode ? mode : DEFAULT_VIEWER_MODE;
  const dossierItemIds = useMemo(() => new Set(dossierItems.map(item => item.id)), [dossierItems]);
  const displayedSearchResults = useMemo(
    () => prepareSearchResults(searchResults, effectiveMode, searchFilter),
    [effectiveMode, searchFilter, searchResults],
  );
  const searchResultCounts = useMemo(
    () => countSearchResults(searchResults, searchFilter),
    [searchFilter, searchResults],
  );
  const filteredSearchResultCount = Object.values(searchResultCounts).reduce((total, count) => total + count, 0);
  const expandedSearchResults = useMemo(
    () => getExpandedSearchResults(searchResults, effectiveMode, searchFilter, expandedSearchType),
    [effectiveMode, expandedSearchType, searchFilter, searchResults],
  );
  const companyGraphNetworkData = useMemo(() => graphToNetworkData(companyGraph), [companyGraph]);
  const companyDirectory = useMemo(
    () => new Map([...companies, ...topWeightCompanies].map(company => [company.id, company])),
    [companies, topWeightCompanies],
  );
  const activeGraphCompanies = useMemo(
    () => (companyGraphNetworkData?.companies || companies.slice(0, defaultGraphNodeLimit)).map(company => {
      const canonical = companyDirectory.get(company.id) || {};
      return {
        ...canonical,
        ...company,
        name: company.name || canonical.name || `Company #${company.id}`,
        chineseName: company.chineseName || canonical.chineseName || "",
        active: company.active || canonical.active || "Unknown",
        type: company.type || canonical.type || "Unknown",
        region: company.region || canonical.region || "Unknown",
        gov: company.gov || canonical.gov || "Unknown",
        weight: canonical.weight ?? company.weight ?? 0,
        legacyWeight: canonical.legacyWeight ?? company.legacyWeight ?? 0,
        evidenceScore: canonical.evidenceScore ?? company.evidenceScore ?? 0,
        substanceScore: canonical.substanceScore ?? company.substanceScore ?? 0,
        companyTagScore: canonical.companyTagScore ?? company.companyTagScore ?? 0,
        evidenceCount: canonical.evidenceCount ?? company.evidenceCount ?? 0,
        substancesLinked: canonical.substancesLinked ?? company.substancesLinked ?? 0,
        risk: canonical.risk ?? company.risk ?? 0,
        connections: canonical.connections ?? company.connections ?? 0,
      };
    }),
    [companies, companyDirectory, companyGraphNetworkData, defaultGraphNodeLimit],
  );
  const activeGraphCompanyIds = useMemo(
    () => new Set(activeGraphCompanies.map(company => company.id)),
    [activeGraphCompanies],
  );
  const rawActiveGraphAssociations = useMemo(
    () => (companyGraphNetworkData?.associations || associations).filter(edge => activeGraphCompanyIds.has(edge.from) && activeGraphCompanyIds.has(edge.to)),
    [activeGraphCompanyIds, associations, companyGraphNetworkData],
  );
  const activeGraphAssociations = useMemo(
    () => summarizeAssociationRows(rawActiveGraphAssociations).dedupedRows,
    [rawActiveGraphAssociations],
  );
  const availableGraphArtifactEdges = useMemo(
    () => dedupeArtifactEdges(companyGraphNetworkData?.artifactEdges || artifactEdgesFromAssociations(activeGraphAssociations)),
    [activeGraphAssociations, companyGraphNetworkData],
  );
  const thresholdedGraphArtifactEdges = useMemo(
    () => {
      if (companyGraph?.seed?.type === "linkage_artifact") return availableGraphArtifactEdges;
      return availableGraphArtifactEdges.filter(edge => (edge.companyCount || 0) >= effectiveGraphArtifactThreshold(graphArtifactMinCompanies, activeGraphCompanies.length));
    },
    [activeGraphCompanies.length, availableGraphArtifactEdges, companyGraph?.seed?.type, graphArtifactMinCompanies],
  );
  const activeGraphArtifactEdges = useMemo(
    () => thresholdedGraphArtifactEdges.filter(edge => graphLayers[edge.kind]),
    [graphLayers, thresholdedGraphArtifactEdges],
  );
  const graphArtifactCounts = useMemo(
    () => {
      const sets = { email: new Set(), phone: new Set() };
      thresholdedGraphArtifactEdges.forEach(edge => sets[edge.kind]?.add(graphArtifactKey(edge)));
      return { email: sets.email.size, phone: sets.phone.size };
    },
    [thresholdedGraphArtifactEdges],
  );
  const graphSeedNodeId = companyGraph?.seed?.type === "company" ? companyGraph.seed.id : companyGraph?.seed?.nodeId;
  const getCompanyGraphMetrics = useCallback((companyId) => {
    if (companyId == null) return null;
    const canonical = companyDirectory.get(companyId) || {};
    const associationRows = activeGraphAssociations.filter(edge => edge.from === companyId || edge.to === companyId);
    const artifactRows = activeGraphArtifactEdges.filter(edge => edge.companyId === companyId);
    const fallbackRenderedLinks = associationRows.length + artifactRows.length;
    return {
      sharedInfrastructureLinks: fallbackRenderedLinks,
      graphRenderedLinks: fallbackRenderedLinks,
      associationCount: associationRows.length,
      artifactLinkCount: artifactRows.length,
      risk: canonical.risk ?? 0,
      weight: canonical.weight ?? 0,
      evidenceCount: canonical.evidenceCount ?? 0,
      substancesLinked: canonical.substancesLinked ?? 0,
      evidenceScore: canonical.evidenceScore ?? 0,
      substanceScore: canonical.substanceScore ?? 0,
      companyTagScore: canonical.companyTagScore ?? 0,
    };
  }, [activeGraphArtifactEdges, activeGraphAssociations, companyDirectory]);
  const selectedGraphSeedLoading = graphSelectedSeed?.type === "company"
    ? companyGraphLoadingId === graphSelectedSeed.company?.id
    : artifactGraphLoadingKey === `${graphSelectedSeed?.kind}:${String(graphSelectedSeed?.value || "").toLowerCase()}`;
  const graphBuildInFlight = Boolean(companyGraphLoadingId || artifactGraphLoadingKey);
  const hasLoadedAppData = companies.length > 0 || substances.length > 0 || evidenceTypes.length > 0 || evidenceTotal > 0 || companyTotal > 0 || associationTotal > 0;

  const openArtifactEntity = useCallback((artifact) => {
    const entity = buildArtifactEntity(artifact);
    if (!entity) return;
    setShowGraphSummary(false);
    setSelectedCompany(null);
    setSelectedSubstance(null);
    setSearchDetailRecord(null);
    setSelectedArtifactEntity(entity);
  }, []);
  const addDossierItem = useCallback(item => {
    setDossierItems(current => upsertDossierItem(current, item));
  }, []);
  const addMediaToDossier = useCallback((media, previewUrl = "") => {
    if (!media) return;
    addDossierItem(buildMediaDossierItem({ media, previewUrl }));
  }, [addDossierItem]);
  const removeDossierItem = useCallback(itemId => {
    setDossierItems(current => current.filter(item => item.id !== itemId));
  }, []);
  const clearDossier = useCallback(() => {
    setDossierItems([]);
    setDossierGlobalNote("");
  }, []);
  const isDossierItemPresent = useCallback(itemId => dossierItemIds.has(itemId), [dossierItemIds]);
  const isMediaInDossier = useCallback(media => dossierItemIds.has(mediaDossierId(media)), [dossierItemIds]);
  const addEvidenceRowToDossier = useCallback((row, contextLabel) => {
    addDossierItem(buildEvidenceDossierItem(row, contextLabel));
  }, [addDossierItem]);
  const isEvidenceRowInDossier = useCallback(row => dossierItemIds.has(buildEvidenceDossierItem(row).id), [dossierItemIds]);
  const updateDossierItemNote = useCallback((itemId, note) => {
    setDossierItems(current => current.map(item => item.id === itemId ? { ...item, note } : item));
  }, []);
  const exportDossierJson = useCallback(() => {
    const payload = buildDossierExport({
      title: dossierTitle,
      mode: effectiveMode,
      globalNote: dossierGlobalNote,
      sectionOrder: dossierSectionOrder,
      items: dossierItems,
    });
    const safeTitle = (dossierTitle || "dossier")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "dossier";
    downloadJSON(payload, `${safeTitle}.json`);
  }, [dossierGlobalNote, dossierItems, dossierSectionOrder, dossierTitle, effectiveMode]);
  const openDossierReportView = useCallback(() => {
    setReportViewGeneratedAt(new Date().toISOString());
    setView("dossier-report");
    setSelectedCompany(null);
    setSelectedSubstance(null);
    setSelectedArtifactEntity(null);
    setSearchDetailRecord(null);
    setShowGraphSummary(false);
  }, []);
  const openCompanyEvidenceExplorer = useCallback(company => {
    if (!company?.name) return;
    setExplorerContextRequest({
      tableKey: "evidence_readable",
      search: company.name,
    });
    setSelectedCompany(null);
    setSelectedSubstance(null);
    setSelectedArtifactEntity(null);
    setSearchDetailRecord(null);
    setShowGraphSummary(false);
    setView("explorer");
  }, []);
  const moveDossierSection = useCallback((sectionId, direction) => {
    setDossierSectionOrder(current => reorderSectionIds(current, sectionId, direction));
  }, []);
  const moveDossierItem = useCallback((itemId, direction) => {
    setDossierItems(current => {
      const item = current.find(entry => entry.id === itemId);
      if (!item) return current;
      const sameTypeIndexes = current.reduce((indexes, entry, index) => entry.type === item.type ? [...indexes, index] : indexes, []);
      const currentIndex = current.findIndex(entry => entry.id === itemId);
      const positionInGroup = sameTypeIndexes.indexOf(currentIndex);
      const targetIndex = sameTypeIndexes[positionInGroup + (direction === "up" ? -1 : 1)];
      if (targetIndex == null) return current;
      return moveListItem(current, currentIndex, targetIndex);
    });
  }, []);

  useEffect(() => {
    getSession().then(s => { setSession(s); setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      if (s?.user?.id && isAuthVerificationPending()) {
        console.info("Deferring authenticated session event until allowlist verification completes.", { event });
        return;
      }
      setSession(current => {
        const currentUserId = current?.user?.id || "";
        const nextUserId = s?.user?.id || "";
        const currentToken = current?.access_token || "";
        const nextToken = s?.access_token || "";
        if (currentUserId === nextUserId && currentToken === nextToken) return current;
        return s;
      });
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const resolveAccess = async () => {
      if (!accessVerificationSession) {
        if (cancelled) return;
        setAppAccess(null);
        setAppAccessLoading(false);
        return;
      }

      const sameUser = appAccess?.userId && appAccess.userId === sessionUserId;
      if (!sameUser) setAppAccessLoading(true);
      try {
        const access = await verifyAppAccess(accessVerificationSession);
        if (cancelled) return;
        if (!access.allowed || access.enabled === false) {
          await signOut();
          if (cancelled) return;
          setSession(null);
          setAppAccess(null);
          setAppAccessLoading(false);
          return;
        }
        setAppAccess(access);
        setAppAccessLoading(false);
      } catch (accessError) {
        console.warn("Unable to resolve demo role/access profile.", {
          message: accessError?.message || "",
        });
        if (sameUser) {
          setAppAccessLoading(false);
          return;
        }
        await signOut();
        if (cancelled) return;
        setSession(null);
        setAppAccess(null);
        setAppAccessLoading(false);
      }
    };

    resolveAccess();
    return () => {
      cancelled = true;
    };
  }, [accessVerificationSession, appAccess?.userId, sessionUserId]);

  useEffect(() => {
    if (!canToggleMode && mode !== DEFAULT_VIEWER_MODE) {
      setMode(DEFAULT_VIEWER_MODE);
    }
  }, [canToggleMode, mode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, effectiveMode);
    } catch {
      // Mode is a convenience preference, not required for app functionality.
    }
  }, [effectiveMode]);

  useEffect(() => {
    if (!canAccessAdminViews && ADMIN_ONLY_VIEWS.has(view)) {
      setView("home");
    }
  }, [canAccessAdminViews, view]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(APP_VIEW_STORAGE_KEY, view);
    } catch {
      // View state persistence is a UX convenience only.
    }
  }, [view]);

  useEffect(() => {
    if (!sessionUserId) {
      setDossierItems([]);
      setDossierTitle(buildDefaultDossierTitle(effectiveMode));
      setDossierGlobalNote("");
      setDossierSectionOrder(DOSSIER_SECTIONS.map(section => section.id));
      return;
    }
    setDossierItems(readStoredDossierItems(sessionUserId));
    const meta = readStoredDossierMeta(sessionUserId, effectiveMode);
    setDossierTitle(meta.title);
    setDossierGlobalNote(meta.globalNote);
    setDossierSectionOrder(meta.sectionOrder);
  }, [effectiveMode, sessionUserId]);

  useEffect(() => {
    if (!sessionUserId) return;
    try {
      window.localStorage.setItem(dossierStorageKey(sessionUserId), JSON.stringify(dossierItems));
    } catch {
      // Local dossier state is a convenience draft; the app should keep working without storage persistence.
    }
  }, [dossierItems, sessionUserId]);
  useEffect(() => {
    if (!sessionUserId) return;
    try {
      window.localStorage.setItem(dossierMetaStorageKey(sessionUserId), JSON.stringify({
        title: dossierTitle,
        globalNote: dossierGlobalNote,
        sectionOrder: dossierSectionOrder,
      }));
    } catch {
      // The dossier workspace should still function if meta persistence is unavailable.
    }
  }, [dossierGlobalNote, dossierSectionOrder, dossierTitle, sessionUserId]);

  useEffect(() => {
    if (typeof supabase.setTimelineFilter === "function") {
      supabase.setTimelineFilter(selectedRunId);
    }
    APP_DATA_CACHE = null;
  }, [selectedRunId]);

  useEffect(() => {
    if (!sessionUserId) {
      initialDataRequestRef.current += 1;
      APP_DATA_CACHE = null;
      return;
    }
    if (APP_DATA_CACHE?.userId === sessionUserId && APP_DATA_CACHE?.runId === selectedRunId) {
      setCompanies(APP_DATA_CACHE.companies || []);
      setTopWeightCompanies(APP_DATA_CACHE.topWeightCompanies || []);
      setSubstances(APP_DATA_CACHE.substances || []);
      setAssociations(APP_DATA_CACHE.associations || []);
      setEvidenceSummary(APP_DATA_CACHE.evidenceSummary || []);
      setSubstanceDataSources(APP_DATA_CACHE.substanceDataSources || []);
      setEvidenceTypes(APP_DATA_CACHE.evidenceTypes || []);
      setEvidenceTotal(APP_DATA_CACHE.evidenceTotal || 0);
      setCompanyTotal(APP_DATA_CACHE.companyTotal || 0);
      setAssociationTotal(APP_DATA_CACHE.associationTotal || 0);
      setSourcePageTotal(APP_DATA_CACHE.sourcePageTotal || 0);
      setLinkageTotal(APP_DATA_CACHE.linkageTotal || 0);
      setLoading(false);
    }
    const requestId = ++initialDataRequestRef.current;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: etData } = await supabase.from("evidence_type").select('"EVIDENCE_TYPE_ID","EVIDENCE_TYPE_NAME"');
        if (requestId !== initialDataRequestRef.current) return;
          setEvidenceTypes((etData || []).map(r => ({ id: r.EVIDENCE_TYPE_ID, name: r.EVIDENCE_TYPE_NAME })));

        const { data: subData } = await supabase.from("substance_reference").select('"SUBSTANCE_REFERENCE_ID","SUBSTANCE_NAME","SUBSTANCE_ID","SUBSTANCE_WEIGHT","SUBSTANCE_DESCRIPTION"').order('"SUBSTANCE_WEIGHT"', { ascending: false });
        if (requestId !== initialDataRequestRef.current) return;
          setSubstances((subData || []).map(r => ({ id: r.SUBSTANCE_REFERENCE_ID, name: r.SUBSTANCE_NAME || r.SUBSTANCE_ID || `#${r.SUBSTANCE_REFERENCE_ID}`, casId: r.SUBSTANCE_ID, weight: r.SUBSTANCE_WEIGHT || 0, description: r.SUBSTANCE_DESCRIPTION || "" })));

          const { data: networkData } = await supabase.from("company_network_size").select("COMPANY_ID, COMPANY_NAME, CHINESE_NAME, ACTIVE_INACTIVE, BUSINESS_TYPE, PRC_HOME_BASE, GOV_COMPLICITY, connection_count").order("connection_count", { ascending: false }).limit(25);
        if (requestId !== initialDataRequestRef.current) return;
          const coIds = (networkData || []).map(r => r.COMPANY_ID);

        // ── V2 scoring from company_score_v2 view ──────────────────────────
          const { data: v2Data } = await supabase.from("company_score_v2")
            .select('"COMPANY_ID","COMPANY_NAME","CHINESE_NAME","ACTIVE_INACTIVE","BUSINESS_TYPE","PRC_HOME_BASE","GOV_COMPLICITY",evidence_score,substance_score,company_tag_score,total_score_v2,legacy_score,evidence_count,substances_linked')
            .order("total_score_v2", { ascending: false });
        if (requestId !== initialDataRequestRef.current) return;
        const v2All = v2Data || [];
        const v2Map = {};
        v2All.forEach(r => { v2Map[r.COMPANY_ID] = r; });
        const maxV2 = v2All[0]?.total_score_v2 || 1;

        // Top 25 by v2 score for flags tab
        const top25v2 = v2All.slice(0, 25);
        const top25Ids = top25v2.map(r => r.COMPANY_ID);
        const allCoIds = [...new Set([...coIds, ...top25Ids])];

        setCompanies((networkData || []).map(r => {
          const v2 = v2Map[r.COMPANY_ID] || {};
          return {
            id: r.COMPANY_ID, name: r.COMPANY_NAME || `Company #${r.COMPANY_ID}`,
            chineseName: r.CHINESE_NAME || "", active: r.ACTIVE_INACTIVE || "Unknown",
            type: r.BUSINESS_TYPE || "Unknown", region: r.PRC_HOME_BASE || "Unknown",
            gov: r.GOV_COMPLICITY || "Unknown", connections: r.connection_count || 0,
            weight: v2.total_score_v2 || 0,
            legacyWeight: v2.legacy_score || 0,
            evidenceScore: v2.evidence_score || 0,
            substanceScore: v2.substance_score || 0,
            companyTagScore: v2.company_tag_score || 0,
            evidenceCount: v2.evidence_count || 0,
            substancesLinked: v2.substances_linked || 0,
            risk: Math.max(Math.round(((v2.total_score_v2 || 0) / maxV2) * 100), 1),
          };
        }));

          const { data: assocData } = await supabase.from("association").select('"ASSOCIATIONID","COMPANY_ID","ASSOCIATED_COMPANY_ID","LINKAGE_METHOD","LINKAGE_VALUE"').in("COMPANY_ID", coIds);
        if (requestId !== initialDataRequestRef.current) return;
        const fetchedAssociationRows = (assocData || [])
          .filter(r => coIds.includes(r.ASSOCIATED_COMPANY_ID))
          .map(r => ({ id: r.ASSOCIATIONID, from: r.COMPANY_ID, to: r.ASSOCIATED_COMPANY_ID, method: r.LINKAGE_METHOD || "Unknown", value: r.LINKAGE_VALUE || "" }));
        const fetchedAssociationSanity = summarizeAssociationRows(fetchedAssociationRows);
          setAssociations(fetchedAssociationSanity.dedupedRows);

          const { data: evData } = await supabase.from("evidence_summary").select("*").in("COMPANY_ID", allCoIds);
        if (requestId !== initialDataRequestRef.current) return;
          setEvidenceSummary((evData || []).map(r => ({ company_id: r.COMPANY_ID, substance_reference_id: r.SUBSTANCE_REFERENCE_ID, evidence_type_id: r.EVIDENCE_TYPE_ID, evidence_count: r.evidence_count || 0, total_weight: r.total_weight || 0 })));

          const { data: totalData } = await supabase.rpc("get_evidence_total");
        if (requestId !== initialDataRequestRef.current) return;
          setEvidenceTotal(Number(totalData) || 0);
          const { data: coTotal } = await supabase.rpc("get_company_count");
        if (requestId !== initialDataRequestRef.current) return;
          setCompanyTotal(Number(coTotal) || 0);
          const { data: assocTotal } = await supabase.rpc("get_association_count");
        if (requestId !== initialDataRequestRef.current) return;
          setAssociationTotal(Number(assocTotal) || 0);
          const { count: sourceCount } = await supabase.from("data_source").select("DATA_SOURCE_ID", { count: "exact", head: true });
        if (requestId !== initialDataRequestRef.current) return;
        setSourcePageTotal(Number(sourceCount) || 0);
          const { count: linkageCount, error: linkageCountError } = await supabase.from("linkage").select("LINKAGEID", { count: "exact", head: true });
        if (requestId !== initialDataRequestRef.current) return;
        if (linkageCountError) {
          console.warn("Unable to load raw linkage count for homepage stats.", {
            message: linkageCountError.message || "",
          });
        }
        setLinkageTotal(Number(linkageCount) || 0);

          const { data: dsData } = await supabase.from("substance_datasource_summary").select("*").order("mention_count", { ascending: false });
        if (requestId !== initialDataRequestRef.current) return;
          setSubstanceDataSources((dsData || []).map(r => ({ substance_reference_id: r.SUBSTANCE_REFERENCE_ID, data_source_name: r.DATA_SOURCE_NAME, data_source_type: r.DATA_SOURCE_TYPE, mention_count: r.mention_count || 0 })));

        // Top 25 for flags tab
          const { data: flagsNetData } = await supabase.from("company_network_size").select("COMPANY_ID, connection_count").in("COMPANY_ID", top25Ids);
        if (requestId !== initialDataRequestRef.current) return;
        const flagsConnMap = {};
        (flagsNetData || []).forEach(r => { flagsConnMap[r.COMPANY_ID] = r.connection_count || 0; });
        const nextTopWeightCompanies = top25v2.map(r => ({
          id: r.COMPANY_ID, name: r.COMPANY_NAME || `Company #${r.COMPANY_ID}`,
          chineseName: r.CHINESE_NAME || "", active: r.ACTIVE_INACTIVE || "Unknown",
          type: r.BUSINESS_TYPE || "Unknown", region: r.PRC_HOME_BASE || "Unknown",
          gov: r.GOV_COMPLICITY || "Unknown",
          connections: flagsConnMap[r.COMPANY_ID] || 0,
          weight: r.total_score_v2 || 0,
          legacyWeight: r.legacy_score || 0,
          evidenceScore: r.evidence_score || 0,
          substanceScore: r.substance_score || 0,
          companyTagScore: r.company_tag_score || 0,
          evidenceCount: r.evidence_count || 0,
          substancesLinked: r.substances_linked || 0,
          risk: Math.max(Math.round(((r.total_score_v2 || 0) / maxV2) * 100), 1),
        }));
        setTopWeightCompanies(nextTopWeightCompanies);

        APP_DATA_CACHE = {
          userId: sessionUserId,
          runId: selectedRunId,
          companies: (networkData || []).map(r => {
            const v2 = v2Map[r.COMPANY_ID] || {};
            return {
              id: r.COMPANY_ID, name: r.COMPANY_NAME || `Company #${r.COMPANY_ID}`,
              chineseName: r.CHINESE_NAME || "", active: r.ACTIVE_INACTIVE || "Unknown",
              type: r.BUSINESS_TYPE || "Unknown", region: r.PRC_HOME_BASE || "Unknown",
              gov: r.GOV_COMPLICITY || "Unknown", connections: r.connection_count || 0,
              weight: v2.total_score_v2 || 0,
              legacyWeight: v2.legacy_score || 0,
              evidenceScore: v2.evidence_score || 0,
              substanceScore: v2.substance_score || 0,
              companyTagScore: v2.company_tag_score || 0,
              evidenceCount: v2.evidence_count || 0,
              substancesLinked: v2.substances_linked || 0,
              risk: Math.max(Math.round(((v2.total_score_v2 || 0) / maxV2) * 100), 1),
            };
          }),
          topWeightCompanies: nextTopWeightCompanies,
          substances: (subData || []).map(r => ({ id: r.SUBSTANCE_REFERENCE_ID, name: r.SUBSTANCE_NAME || r.SUBSTANCE_ID || `#${r.SUBSTANCE_REFERENCE_ID}`, casId: r.SUBSTANCE_ID, weight: r.SUBSTANCE_WEIGHT || 0, description: r.SUBSTANCE_DESCRIPTION || "" })),
          associations: fetchedAssociationSanity.dedupedRows,
          evidenceSummary: (evData || []).map(r => ({ company_id: r.COMPANY_ID, substance_reference_id: r.SUBSTANCE_REFERENCE_ID, evidence_type_id: r.EVIDENCE_TYPE_ID, evidence_count: r.evidence_count || 0, total_weight: r.total_weight || 0 })),
          substanceDataSources: (dsData || []).map(r => ({ substance_reference_id: r.SUBSTANCE_REFERENCE_ID, data_source_name: r.DATA_SOURCE_NAME, data_source_type: r.DATA_SOURCE_TYPE, mention_count: r.mention_count || 0 })),
          evidenceTypes: (etData || []).map(r => ({ id: r.EVIDENCE_TYPE_ID, name: r.EVIDENCE_TYPE_NAME })),
          evidenceTotal: Number(totalData) || 0,
          companyTotal: Number(coTotal) || 0,
          associationTotal: Number(assocTotal) || 0,
          sourcePageTotal: Number(sourceCount) || 0,
          linkageTotal: Number(linkageCount) || 0,
        };

        } catch (err) { if (requestId === initialDataRequestRef.current) setError(err.message); } finally { if (requestId === initialDataRequestRef.current) setLoading(false); }
    };
    fetchAll();
    return () => { initialDataRequestRef.current += 1; };
  }, [refreshNonce, selectedRunId, sessionUserId]);

  const handleViewChange = v => { setView(v); setSelectedCompany(null); setSelectedSubstance(null); setSelectedArtifactEntity(null); setSearchDetailRecord(null); setShowGraphSummary(false); };
  useEffect(() => {
    companyGraphRequestRef.current += 1;
    artifactIntelligenceRequestRef.current += 1;
    graphCompanySearchRequestRef.current += 1;
    clearTimeout(graphCompanySearchDebounce.current);
    setCompanyGraph(null);
    setCompanyGraphError("");
    setCompanyGraphLoadingId(null);
    setArtifactGraphLoadingKey("");
    setGraphCompanyQuery("");
    setGraphCompanyMatches([]);
    setGraphSelectedSeed(null);
    setGraphCompanySearchLoading(false);
    setSelectedArtifactEntity(null);
    setArtifactIntelligence(null);
    setArtifactIntelligenceLoading(false);
    setArtifactIntelligenceError("");
    setShowGraphSummary(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!selectedArtifactEntity?.kind || !selectedArtifactEntity?.value) {
      artifactIntelligenceRequestRef.current += 1;
      setArtifactIntelligence(null);
      setArtifactIntelligenceLoading(false);
      setArtifactIntelligenceError("");
      return;
    }
    const requestId = ++artifactIntelligenceRequestRef.current;
    setArtifactIntelligence(null);
    setArtifactIntelligenceLoading(true);
    setArtifactIntelligenceError("");
    invokeAuthorizedData({
      action: "artifactIntelligence",
      kind: selectedArtifactEntity.kind,
      value: selectedArtifactEntity.value,
      asOfRunId: selectedRunId,
    }).then(({ artifact }) => {
      if (requestId !== artifactIntelligenceRequestRef.current) return;
      setArtifactIntelligence(artifact || null);
    }).catch((err) => {
      if (requestId !== artifactIntelligenceRequestRef.current) return;
      console.error(err);
      setArtifactIntelligence(null);
      setArtifactIntelligenceError("The server-backed artifact lookup could not be loaded. The drawer is still showing the selected artifact and any companies already available from your current search or graph context.");
    }).finally(() => {
      if (requestId === artifactIntelligenceRequestRef.current) setArtifactIntelligenceLoading(false);
    });
  }, [selectedArtifactEntity, selectedRunId]);

  const resetCompanyGraph = () => {
    companyGraphRequestRef.current += 1;
    setCompanyGraph(null);
    setCompanyGraphError("");
    setCompanyGraphLoadingId(null);
    setArtifactGraphLoadingKey("");
    setSelectedArtifactEntity(null);
    setShowGraphSummary(false);
  };
  const handleBuildCompanyGraph = async company => {
    if (!company?.id) return;
    if (companyGraphLoadingId || artifactGraphLoadingKey) return;
    const requestId = ++companyGraphRequestRef.current;
    setCompanyGraphLoadingId(company.id);
    setArtifactGraphLoadingKey("");
    setCompanyGraphError("");
    setShowGraphSummary(false);
    setSelectedArtifactEntity(null);
    setView("network");
    try {
      const { graph } = await invokeAuthorizedData({ action: ACTION_COMPANY_GRAPH, companyId: company.id, asOfRunId: selectedRunId });
      if (requestId !== companyGraphRequestRef.current) return;
      setCompanyGraph(graph || null);
      const seedCompany = graphToNetworkData(graph)?.companies.find(c => c.id === company.id) || company;
      setSelectedCompany(seedCompany);
    } catch (e) {
      if (requestId !== companyGraphRequestRef.current) return;
      console.error(e);
      setCompanyGraph(null);
      setCompanyGraphError("Unable to build the company graph. The top-25 graph is still available.");
    } finally {
      if (requestId === companyGraphRequestRef.current) setCompanyGraphLoadingId(null);
    }
  };
  const selectGraphSeedMatch = result => {
    const seed = getGraphSeedFromSearchResult(result);
    if (!seed) return;
    setGraphSelectedSeed(seed);
    setGraphCompanyQuery(seed.label || "");
    setGraphCompanyMatches([]);
  };
  const buildSelectedGraphSeed = () => {
    if (!graphSelectedSeed) return;
    if (companyGraphLoadingId || artifactGraphLoadingKey) return;
    if (graphSelectedSeed.type === "company") handleBuildCompanyGraph(graphSelectedSeed.company);
    else handleBuildArtifactGraph(graphSelectedSeed, { openDetail: false });
  };
  const handleBuildArtifactGraph = async (seed, options = {}) => {
    const kind = seed?.kind || artifactKindFromMethod(seed?.method);
    const value = String(seed?.value || "").trim();
    if (!kind || !value) return;
    if (companyGraphLoadingId || artifactGraphLoadingKey) return;
    const requestId = ++companyGraphRequestRef.current;
    const loadingKey = `${kind}:${value.toLowerCase()}`;
    setArtifactGraphLoadingKey(loadingKey);
    setCompanyGraphError("");
    setSelectedCompany(null);
    setSearchDetailRecord(null);
    setSelectedArtifactEntity(null);
    setShowGraphSummary(false);
    setView("network");
    setGraphLayers(current => ({ ...current, [kind]: true }));
    try {
      const { graph } = await invokeAuthorizedData({ action: ACTION_ARTIFACT_GRAPH, kind, value, asOfRunId: selectedRunId });
      if (requestId !== companyGraphRequestRef.current) return;
      setCompanyGraph(graph || null);
      const networkData = graphToNetworkData(graph);
      const artifactEdges = networkData?.artifactEdges || [];
      const artifactDetail = {
        id: `artifact:${kind}:${value.toLowerCase()}`,
        kind,
        method: artifactMethodLabel(kind),
        value,
        companyIds: [...new Set(artifactEdges.map(edge => edge.companyId).filter(id => id != null))],
        associationIds: [...new Set(artifactEdges.map(edge => edge.associationId).filter(Boolean))],
      };
      setSelectedArtifactEntity(options.openDetail === false ? null : buildArtifactEntity(artifactDetail));
    } catch (e) {
      if (requestId !== companyGraphRequestRef.current) return;
      console.error(e);
      setCompanyGraph(null);
      setCompanyGraphError("Unable to build the linkage graph. The default company graph is still available.");
    } finally {
      if (requestId === companyGraphRequestRef.current) setArtifactGraphLoadingKey("");
    }
  };
  const handleBuildGraphFromSearchResult = result => {
    const seed = getSearchResultArtifactSeed(result);
    setExpandedSearchType(null);
    if (seed) handleBuildArtifactGraph(seed);
  };
  const toggleGraphLayer = kind => {
    setGraphLayers(current => ({ ...current, [kind]: !current[kind] }));
  };

  useEffect(() => {
    const requestId = ++graphCompanySearchRequestRef.current;
    const query = graphCompanyQuery.trim();
    if (!session || query.length < 2 || graphSelectedSeed?.label === query) {
      clearTimeout(graphCompanySearchDebounce.current);
      setGraphCompanyMatches([]);
      setGraphCompanySearchLoading(false);
      return;
    }
    clearTimeout(graphCompanySearchDebounce.current);
    graphCompanySearchDebounce.current = setTimeout(async () => {
      setGraphCompanySearchLoading(true);
      try {
        const { results } = await invokeAuthorizedData({ action: "search", search: query, asOfRunId: selectedRunId });
        if (requestId !== graphCompanySearchRequestRef.current) return;
        setGraphCompanyMatches((results || []).filter(result => getGraphSeedFromSearchResult(result)).slice(0, 7));
      } catch (e) {
        if (requestId === graphCompanySearchRequestRef.current) console.error(e);
      } finally {
        if (requestId === graphCompanySearchRequestRef.current) setGraphCompanySearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(graphCompanySearchDebounce.current);
  }, [graphCompanyQuery, graphSelectedSeed, selectedRunId, session]);

  useEffect(() => {
    if (!selectedCompany) return;
    if (!companyDirectory.has(selectedCompany.id)) {
      setSelectedCompany(null);
    }
  }, [companyDirectory, selectedCompany]);

  useEffect(() => {
    if (!selectedSubstance) return;
    if (!substances.some(substance => substance.id === selectedSubstance.id)) {
      setSelectedSubstance(null);
    }
  }, [selectedSubstance, substances]);

  useEffect(() => {
    if (!selectedArtifactEntity?.kind || !selectedArtifactEntity?.value) return;
    const available = activeGraphArtifactEdges.some(edge => edge.kind === selectedArtifactEntity.kind && String(edge.value || "").toLowerCase() === String(selectedArtifactEntity.value || "").toLowerCase());
    if (!available) {
      setSelectedArtifactEntity(null);
    }
  }, [activeGraphArtifactEdges, selectedArtifactEntity]);

  useEffect(() => {
    companyGraphRequestRef.current += 1;
    setCompanyGraph(null);
    setCompanyGraphError("");
    setCompanyGraphLoadingId(null);
    setArtifactGraphLoadingKey("");
    setShowGraphSummary(false);
    setSelectedArtifactEntity(null);
  }, [selectedRunId]);

  useEffect(() => {
    const requestId = ++searchRequestRef.current;
    if (!session || searchQuery.length < 2) {
      clearTimeout(searchDebounce.current);
      setSearchResults([]);
      setSearchResolvedQuery("");
      setSearchLoading(false);
      return;
    }
    setSearchResolvedQuery("");
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { results } = await invokeAuthorizedData({ action: "search", search: searchQuery, asOfRunId: selectedRunId });
        if (requestId !== searchRequestRef.current) return;
        setSearchResults(results || []);
        setSearchResolvedQuery(searchQuery);
      } catch(e) { if (requestId === searchRequestRef.current) console.error(e); } finally { if (requestId === searchRequestRef.current) setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(searchDebounce.current);
  }, [searchQuery, selectedRunId, session]);

  useEffect(() => {
    setExpandedSearchType(null);
  }, [effectiveMode, searchFilter, searchQuery]);

  const handleSearchSelect = result => {
    setExpandedSearchType(null);
    if (result.type === "company") {
      setSearchDetailRecord(null);
      setSelectedSubstance(null);
      setSelectedArtifactEntity(null);
      setSelectedCompany(result.data);
      setView("network");
    }
    else if (result.type === "substance") {
      setSearchDetailRecord(null);
      setSelectedCompany(null);
      setSelectedArtifactEntity(null);
      setSelectedSubstance(result.data);
      setView("substances");
    }
    else if (["linkage", "association", "evidence"].includes(result.type)) {
      const artifactEntity = getArtifactEntityFromSearchResult(result);
      if (artifactEntity) {
        openArtifactEntity(artifactEntity);
      } else {
        setSelectedCompany(null);
        setSelectedSubstance(null);
        setSelectedArtifactEntity(null);
        setSearchDetailRecord(searchResultToDetailRecord(result));
      }
    } else if (result.type === "synonym") {
      const sub = substances.find(s => s.casId === result.data.substanceId);
      setSearchDetailRecord(null);
      setSelectedCompany(null);
      setSelectedArtifactEntity(null);
      if (sub) { setSelectedSubstance(sub); setView("substances"); }
      else {
        setSelectedSubstance(null);
        setSearchDetailRecord(searchResultToDetailRecord(result));
      }
    }
  };
  const openDossierSourceView = item => {
    const sourceView = item?.sourceView;
    if (!sourceView) return;
    setMediaPreviewRequest(null);
    setSelectedCompany(null);
    setSelectedSubstance(null);
    setSelectedArtifactEntity(null);
    setSearchDetailRecord(null);
    setShowGraphSummary(false);

    if (sourceView.type === "company" && sourceView.company) {
      setView("network");
      setSelectedCompany(sourceView.company);
      return;
    }

    if (sourceView.type === "substance" && sourceView.substance) {
      setView("substances");
      setSelectedSubstance(sourceView.substance);
      return;
    }

    if (sourceView.type === "artifact" && sourceView.artifact) {
      setView("network");
      openArtifactEntity(sourceView.artifact);
      return;
    }

    if (sourceView.type === "evidence" && sourceView.row) {
      setSearchDetailRecord({ tableKey: "evidence_readable", row: sourceView.row });
      return;
    }

    if (sourceView.type === "media_image" && sourceView.media) {
      setView("media");
      setMediaPreviewRequest({ media: sourceView.media });
      return;
    }

    if (sourceView.type === "graph_summary" && sourceView.seed) {
      setView("network");
      const seed = sourceView.seed;
      if (seed.type === "company") {
        const company = companies.find(entry => entry.id === seed.id);
        if (company) {
          handleBuildCompanyGraph(company);
        } else {
          setView("network");
        }
        return;
      }
      if (seed.type === "linkage_artifact") {
        handleBuildArtifactGraph({ kind: seed.kind, method: artifactMethodLabel(seed.kind), value: seed.label || seed.value }, { openDetail: false });
        return;
      }
    }
  };

  const primaryTabs = [
    { id: "home", label: "⌂ Home" },
    { id: "dossier", label: "☰ Dossier" },
  ];
  const secondaryTabs = [
    { id: "network", label: "◈ Network Graph" },
    { id: "substances", label: "⬡ Ingredient Matrix" },
    { id: "flags", label: "⚑ Company Signals" },
    { id: "explorer", label: "⊞ Data Explorer" },
    { id: "scrape", label: "⌖ Scrape Analysis" },
    { id: "media", label: "⊟ Images & Docs" },
    { id: "about", label: "◎ About" },
  ].filter(tab => {
    if (tab.id === "scrape") return SHOW_SCRAPE_ANALYSIS && canAccessScrapeAnalysis;
    return true;
  });
  const activeSecondaryTab = secondaryTabs.find(tab => tab.id === view) || null;

  if (authLoading || (session && appAccessLoading && !appAccess)) return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#f2f0eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e0dbd2", borderTopColor: "#1b56a5", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!session) return <Login dark={dark} onLogin={setSession} />;

  if (view === "dossier-report") {
    return (
      <DossierReportView
        items={dossierItems}
        mode={effectiveMode}
        title={dossierTitle}
        globalNote={dossierGlobalNote}
        sectionOrder={dossierSectionOrder}
        generatedAt={reportViewGeneratedAt || new Date().toISOString()}
        onBack={() => handleViewChange("dossier")}
        onPrint={() => window.print()}
      />
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: T.bg, color: T.text, display: "flex", flexDirection: "column", fontFamily: BODY_FONT, overflowX: "hidden", overflowY: "visible" }}>
      <div style={{ padding: "14px clamp(12px, 2vw, 24px)", background: T.bg, display: "grid", gap: 10, flexShrink: 0 }}>
        <div style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "1 1 280px", minWidth: 220 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${T.navy} 0%, ${T.accent} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff7eb", fontSize: 19 }}>
              🍪
            </div>
            <div>
              <div style={{ fontSize: 34, lineHeight: 0.95, fontWeight: 800, fontFamily: DISPLAY_FONT, color: T.text }}>Scrape &amp; Bake</div>
              <div style={{ fontSize: 14, color: T.textMid, marginTop: 4 }}>It's not just for cookies...</div>
            </div>
          </div>
        <SearchBar query={searchQuery} onChange={setSearchQuery} T={T} dark={dark} mode={effectiveMode} filter={searchFilter} onFilterChange={setSearchFilter} results={displayedSearchResults} resultCounts={searchResultCounts} rawResultCount={filteredSearchResultCount} searched={searchResolvedQuery === searchQuery} onSelectResult={handleSearchSelect} onViewMore={setExpandedSearchType} onBuildGraphFromResult={handleBuildGraphFromSearchResult} loading={searchLoading} inputRef={globalSearchInputRef} />
        <div
          aria-label="Primary navigation"
          style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 1 auto", minWidth: 0, flexWrap: "wrap" }}
        >
          {primaryTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleViewChange(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: tab.id === "dossier" ? 8 : 0,
                background: view === tab.id ? T.accentBg : tab.id === "dossier" && dossierItems.length ? T.accentBg : T.surfaceAlt,
                border: `2px solid ${view === tab.id || (tab.id === "dossier" && dossierItems.length) ? T.accent : T.border}`,
                borderRadius: 10,
                padding: "6px 12px",
                cursor: "pointer",
                color: view === tab.id || (tab.id === "dossier" && dossierItems.length) ? T.accent : T.textMuted,
                fontSize: 10,
                fontFamily: BODY_FONT,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>{tab.id === "dossier" ? "Dossier" : tab.label}</span>
              {tab.id === "dossier" && (
                <span style={{ background: dossierItems.length ? T.accent : T.surface, color: dossierItems.length ? (dark ? "#06110d" : "#fff") : T.textMuted, borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, minWidth: 24, textAlign: "center" }}>
                  {dossierItems.length}
                </span>
              )}
            </button>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 7, border: `2px solid ${activeSecondaryTab ? T.accent : T.border}`, borderRadius: 10, padding: "5px 8px 5px 12px", color: activeSecondaryTab ? T.accent : T.textMuted, fontSize: 10, fontFamily: BODY_FONT, background: activeSecondaryTab ? T.accentBg : T.surfaceAlt }}>
            <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>Views</span>
            <select
              value={activeSecondaryTab?.id || ""}
              onChange={e => {
                if (!e.target.value) return;
                handleViewChange(e.target.value);
              }}
              aria-label="Open secondary feature view"
              style={{ appearance: "none", WebkitAppearance: "none", background: T.surface, border: `2px solid ${activeSecondaryTab ? T.accent : T.border}`, borderRadius: 8, color: T.text, cursor: "pointer", fontSize: 10, fontFamily: BODY_FONT, padding: "5px 8px", minWidth: 160 }}
            >
              <option value="">Open view...</option>
              {secondaryTabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 1 auto", marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => setRefreshNonce(current => current + 1)}
            style={{ background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 10, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, color: T.textMid, fontSize: 11, fontFamily: BODY_FONT, fontWeight: 700 }}
          >
            ↻ Refresh data
          </button>
          {canToggleMode && (
            <label style={{ display: "flex", alignItems: "center", gap: 7, border: `2px solid ${T.border}`, borderRadius: 10, padding: "5px 8px 5px 12px", color: T.textMuted, fontSize: 10, fontFamily: BODY_FONT, background: T.surfaceAlt }}>
              <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>Mode</span>
              <select
                value={effectiveMode}
                onChange={e => setMode(e.target.value)}
                aria-label="Workflow mode"
                style={{ appearance: "none", WebkitAppearance: "none", background: T.surface, border: `2px solid ${T.border}`, borderRadius: 8, color: T.text, cursor: "pointer", fontSize: 10, fontFamily: BODY_FONT, padding: "5px 8px" }}
              >
                {Object.entries(APP_MODES).map(([value, option]) => (
                  <option key={value} value={value}>{option.label}</option>
                ))}
              </select>
              <span style={{ fontSize: 9, color: T.textMuted }}>{APP_MODES[effectiveMode].hint}</span>
            </label>
          )}
          <button onClick={() => setDark(d => !d)} style={{ background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 10, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, color: T.textMid, fontSize: 11, fontFamily: BODY_FONT, fontWeight: 700 }}>
            <span>{dark ? "☀" : "☾"}</span>{dark ? "Light" : "Dark"}
          </button>
          <button onClick={() => signOut()} style={{ background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: T.textMid, fontSize: 10, fontFamily: BODY_FONT, fontWeight: 700 }}>Sign Out</button>
        </div>
      </div>
      </div>

      <StatsBar ingredientCount={substances.length} evidenceTotal={evidenceTotal} companyTotal={companyTotal} sourcePageTotal={sourcePageTotal} networkLinkTotal={associationTotal} dark={dark} />
      <TimelineBar dark={dark} selectedRunId={selectedRunId} onSelectRun={setSelectedRunId} movementSummary={movementSummary} />
      {error && <div style={{ background: "#2a0a08", border: "1px solid #ff3b30", color: "#ff3b30", padding: "10px 24px", fontSize: 12, fontFamily: "monospace", flexShrink: 0 }}>⚠ {error}</div>}

      <div style={{ flex: 1, overflow: "visible", position: "relative", minHeight: 0 }}>
        {loading && !hasLoadedAppData ? <Spinner T={T} /> : (
          <>
            {loading && hasLoadedAppData && (
              <div style={{ position: "absolute", top: 12, right: 18, zIndex: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 10px", color: T.textMuted, fontSize: 10 }}>
                Refreshing data…
              </div>
            )}
            {view === "home" && (
              <HomeLanding
                mode={effectiveMode}
                canToggleMode={canToggleMode}
                onModeChange={setMode}
                onFocusSearch={() => globalSearchInputRef.current?.focus()}
                onNavigate={handleViewChange}
                dark={dark}
              />
            )}

            <section className="network-stage-shell" style={{ display: view === "network" ? "block" : "none" }}>
              <div className="network-stage" style={{ background: dark ? "#24150f" : "#fff1d1", borderColor: T.border }}>
                <aside className="network-overlay network-overlay-controls">
                  <div className="network-panel-card" style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 12, padding: "10px 12px" }}>
                    <div style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Graph stage</div>
                    <div style={{ color: T.textMid, fontSize: 10, lineHeight: 1.55 }}>
                      {companyGraph
                        ? `${companyGraph.seed?.type === "linkage_artifact" ? "Linkage-seeded" : "Company-seeded"} · ${companyGraph.seed?.label || "Selected seed"} · ${activeGraphCompanies.length} companies · ${activeGraphAssociations.length} visible graph associations`
                        : `Top ${activeGraphCompanies.length} most-connected companies · ${activeGraphAssociations.length} visible graph associations`} · as of ${selectedRunId === "all_runs" ? "all runs" : formatTimelineDate(selectedRunOption.date)}
                    </div>
                    <div style={{ color: T.textMuted, fontSize: 10, marginTop: 6 }}>Zoom, pan, drag nodes, and hover labels directly inside the map.</div>
                    {companyGraph && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                        <button type="button" onClick={() => { setSelectedCompany(null); setSelectedArtifactEntity(null); setSearchDetailRecord(null); setShowGraphSummary(true); }} style={{ background: T.accentBg, color: T.accent, border: `2px solid ${T.accent}55`, borderRadius: 8, padding: "4px 8px", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", fontFamily: BODY_FONT, fontWeight: 700 }}>
                          View summary
                        </button>
                        <button type="button" onClick={resetCompanyGraph} style={{ background: T.surfaceAlt, color: T.textMid, border: `2px solid ${T.borderMid}`, borderRadius: 8, padding: "4px 8px", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", fontFamily: BODY_FONT, fontWeight: 700 }}>
                          Return to top 25
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="network-panel-card" style={{ position: "relative", background: T.surface, border: `2px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
                    <label htmlFor="company-graph-search" style={{ display: "block", color: T.textMuted, fontSize: 9, letterSpacing: 1.1, marginBottom: 6, textTransform: "uppercase" }}>Build graph from company, email, or phone</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        id="company-graph-search"
                        value={graphCompanyQuery}
                        autoComplete="off"
                        spellCheck={false}
                        onChange={e => { setGraphCompanyQuery(e.target.value); setGraphSelectedSeed(null); setCompanyGraphError(""); }}
                        onKeyDown={e => {
                          if (e.key === "Enter" && graphSelectedSeed) {
                            e.preventDefault();
                            buildSelectedGraphSeed();
                          }
                        }}
                        placeholder="Search a company, email, or phone..."
                        aria-label="Search for a company, email, or phone to build a graph"
                        style={{ flex: 1, minWidth: 0, background: T.surfaceAlt, color: T.text, border: `2px solid ${T.border}`, borderRadius: 10, padding: "8px 10px", fontFamily: BODY_FONT, fontSize: 12 }}
                      />
                      <button
                        type="button"
                        onClick={buildSelectedGraphSeed}
                        disabled={!graphSelectedSeed || graphBuildInFlight}
                        style={{ background: graphSelectedSeed && !graphBuildInFlight ? T.accent : T.surfaceAlt, color: graphSelectedSeed && !graphBuildInFlight ? "#fff7eb" : T.textMuted, border: `2px solid ${graphSelectedSeed && !graphBuildInFlight ? T.accent : T.border}`, borderRadius: 10, padding: "8px 10px", fontSize: 11, fontWeight: 700, cursor: graphSelectedSeed && !graphBuildInFlight ? "pointer" : "not-allowed", whiteSpace: "nowrap", fontFamily: BODY_FONT }}
                      >
                        {selectedGraphSeedLoading ? "Building..." : "Build"}
                      </button>
                    </div>
                    {graphSelectedSeed && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 7, background: T.accentBg, border: `2px solid ${T.accent}33`, color: T.textMid, borderRadius: 8, padding: "4px 8px", fontSize: 10 }}>
                        <span style={{ color: T.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{graphSeedTypeLabel(graphSelectedSeed)}</span>
                        <span>{graphSelectedSeed.label}</span>
                      </div>
                    )}
                    {graphCompanySearchLoading && <div style={{ color: T.textMuted, fontSize: 10, marginTop: 7 }}>Searching companies, emails, and phones...</div>}
                    {companyGraphError && <div style={{ color: dark ? "#fecaca" : "#991b1b", background: dark ? "rgba(74,20,20,0.5)" : "rgba(254,242,242,0.9)", border: `2px solid ${dark ? "#7f1d1d" : "#fecaca"}`, borderRadius: 10, padding: "6px 8px", fontSize: 10, marginTop: 8 }}>{companyGraphError}</div>}
                    {graphCompanyMatches.length > 0 && (
                      <div style={{ position: "relative", zIndex: 9, marginTop: 8, border: `2px solid ${T.border}`, borderRadius: 10, overflow: "hidden", background: T.surface }}>
                        {graphCompanyMatches.map(result => {
                          const seed = getGraphSeedFromSearchResult(result);
                          const style = SEARCH_TYPE_STYLE(result.type, dark);
                          return (
                            <button
                              key={result.data?.id || result.label}
                              type="button"
                              onClick={() => selectGraphSeedMatch(result)}
                              style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", color: T.text, border: 0, borderBottom: `1px solid ${T.border}`, padding: "7px 9px", cursor: "pointer", fontFamily: BODY_FONT }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, fontWeight: 700, background: style.bg, color: style.color }}>{graphSeedTypeLabel(seed).toUpperCase()}</span>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{seed?.label || result.label}</span>
                              </div>
                              <div style={{ color: T.textMuted, fontSize: 10, marginTop: 2 }}>{seed?.sublabel || result.sublabel}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, paddingTop: 9, borderTop: `1px solid ${T.border}` }}>
                      {!companyGraph && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", width: "100%" }}>
                          <span style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginRight: 2 }}>Companies</span>
                          {DEFAULT_GRAPH_NODE_LIMITS.map(limit => (
                            <button
                              key={limit}
                              type="button"
                              onClick={() => setDefaultGraphNodeLimit(limit)}
                              style={{ background: defaultGraphNodeLimit === limit ? T.accentBg : T.surfaceAlt, color: defaultGraphNodeLimit === limit ? T.accent : T.textMuted, border: `2px solid ${defaultGraphNodeLimit === limit ? T.accent : T.border}`, borderRadius: 8, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: BODY_FONT }}
                            >
                              {limit}
                            </button>
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", width: "100%" }}>
                        <span style={{ color: T.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginRight: 2 }}>Artifacts shared by</span>
                        {GRAPH_ARTIFACT_THRESHOLDS.map(threshold => (
                          <button
                            key={threshold}
                            type="button"
                            onClick={() => setGraphArtifactMinCompanies(threshold)}
                            style={{ background: graphArtifactMinCompanies === threshold ? T.accentBg : T.surfaceAlt, color: graphArtifactMinCompanies === threshold ? T.accent : T.textMuted, border: `2px solid ${graphArtifactMinCompanies === threshold ? T.accent : T.border}`, borderRadius: 8, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: BODY_FONT }}
                          >
                            {threshold}+
                          </button>
                        ))}
                        <span style={{ color: T.textMuted, fontSize: 10 }}>
                          effective {effectiveGraphArtifactThreshold(graphArtifactMinCompanies, activeGraphCompanies.length)}+
                        </span>
                      </div>
                      {[
                        ["email", "Emails", "Email"],
                        ["phone", "Phones", "Phone"],
                      ].map(([kind, label, method]) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => toggleGraphLayer(kind)}
                          disabled={!graphArtifactCounts[kind]}
                          style={{ background: graphLayers[kind] ? `${linkCol(method, dark)}22` : T.surfaceAlt, color: graphLayers[kind] ? linkCol(method, dark) : T.textMuted, border: `2px solid ${graphLayers[kind] ? linkCol(method, dark) : T.border}`, borderRadius: 8, padding: "5px 9px", fontSize: 10, fontWeight: 700, cursor: graphArtifactCounts[kind] ? "pointer" : "not-allowed", fontFamily: BODY_FONT }}
                        >
                          {label} {graphArtifactCounts[kind] ? `(${graphArtifactCounts[kind]})` : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>

                <div className="network-overlay network-overlay-zoom">
                  <div className="network-panel-card" style={{ width: "auto", background: T.surface, border: `2px solid ${T.border}`, borderRadius: 12, padding: 10 }}>
                    <div style={{ color: T.text, fontSize: 13, fontWeight: 800, fontFamily: DISPLAY_FONT, marginBottom: 4 }}>Network map</div>
                    <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 10 }}>Scroll or pinch inside the map to zoom. Drag to pan.</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => graphViewApi?.zoomOut?.()} style={{ background: T.surfaceAlt, color: T.textMid, border: `2px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 10, fontFamily: BODY_FONT, fontWeight: 700 }}>Zoom out</button>
                      <button type="button" onClick={() => graphViewApi?.zoomIn?.()} style={{ background: T.surfaceAlt, color: T.textMid, border: `2px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 10, fontFamily: BODY_FONT, fontWeight: 700 }}>Zoom in</button>
                      <button type="button" onClick={() => graphViewApi?.reset?.()} style={{ background: T.accentBg, color: T.accent, border: `2px solid ${T.accent}66`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 10, fontFamily: BODY_FONT, fontWeight: 700 }}>Reset view</button>
                    </div>
                    {companyGraph?.limits?.capped && (
                      <div style={{ marginTop: 10, background: T.surfaceAlt, border: `2px solid ${T.border}`, borderRadius: 10, padding: "8px 10px", fontSize: 10, color: T.textMuted }}>
                        Graph capped for readability and least-privilege access.
                      </div>
                    )}
                  </div>
                </div>

                <aside className="network-overlay network-overlay-legend">
                  <div className="network-panel-card">
                    <GraphLegendPanel dark={dark} />
                  </div>
                </aside>

                <aside className="network-overlay network-overlay-movement">
                  <div className="network-panel-card">
                    <NetworkMovementPanel dark={dark} selectedRunId={selectedRunId} summary={movementSummary} />
                  </div>
                </aside>

                <div className="network-canvas-layer">
                  <div className="network-canvas-wrap" style={{ background: dark ? "#2a1a15" : "#fff5da" }}>
                    {graphBuildInFlight && <GraphLoadingOverlay dark={dark} />}
                    {view === "network" && (
                      <NetworkGraph
                        companies={activeGraphCompanies}
                        associations={activeGraphAssociations}
                        artifactEdges={activeGraphArtifactEdges}
                        onSelectCompany={c => { setShowGraphSummary(false); setSelectedArtifactEntity(null); setSelectedCompany(prev => prev?.id === c.id ? null : c); }}
                        onSelectArtifact={artifact => openArtifactEntity(artifact)}
                        selectedId={selectedArtifactEntity?.id || selectedCompany?.id}
                        seedId={graphSeedNodeId}
                        dark={dark}
                        onViewApiChange={setGraphViewApi}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {view === "substances" && (
              <div style={{ height: "100%", overflowY: "auto", paddingTop: 22 }}>
                <SubstanceMatrix substances={substances} evidenceSummary={evidenceSummary} companies={companies} onSelectSubstance={s => setSelectedSubstance(prev => prev?.id === s.id ? null : s)} selectedId={selectedSubstance?.id} dark={dark} />
              </div>
            )}
            {view === "flags" && (
              <div style={{ height: "100%", overflowY: "auto", paddingTop: 22 }}>
                <FlagsTable companies={topWeightCompanies} onSelect={c => setSelectedCompany(prev => prev?.id === c.id ? null : c)} selectedId={selectedCompany?.id} dark={dark} getCompanyGraphMetrics={getCompanyGraphMetrics} />
              </div>
            )}
            {view === "dossier" && (
              <DossierReviewPanel
                items={dossierItems}
                dark={dark}
                mode={effectiveMode}
                title={dossierTitle}
                globalNote={dossierGlobalNote}
                sectionOrder={dossierSectionOrder}
                onTitleChange={setDossierTitle}
                onGlobalNoteChange={setDossierGlobalNote}
                onRemove={removeDossierItem}
                onClear={clearDossier}
                onMoveItem={moveDossierItem}
                onMoveSection={moveDossierSection}
                onOpenSourceView={openDossierSourceView}
                onUpdateItemNote={updateDossierItemNote}
                onExportJson={exportDossierJson}
                onViewReport={openDossierReportView}
              />
            )}
            {view === "explorer" && (
              <DataExplorer
                dark={dark}
                onSelectCompany={c => setSelectedCompany(prev => prev?.id === c.id ? null : c)}
                onSelectArtifact={openArtifactEntity}
                onAddEvidenceToDossier={addEvidenceRowToDossier}
                isEvidenceInDossier={isEvidenceRowInDossier}
                explorerContextRequest={explorerContextRequest}
                onHandledExplorerContextRequest={() => setExplorerContextRequest(null)}
              />
            )}
            {view === "scrape" && (
              canAccessScrapeAnalysis
                ? <ScrapeAnalysis dark={dark} />
                : <AccessDeniedPanel dark={dark} title="Scrape Analysis is restricted" message="Only admin users can open Scrape Analysis and source-review tooling." />
            )}
            {view === "media" && (
              <MediaTab
                dark={dark}
                onAddToDossier={addMediaToDossier}
                isInDossier={isMediaInDossier}
                previewRequest={mediaPreviewRequest}
                onHandledPreviewRequest={() => setMediaPreviewRequest(null)}
              />
            )}
            {view === "about" && <AboutTab dark={dark} substances={substances} evidenceTotal={evidenceTotal} companyTotal={companyTotal} associationTotal={associationTotal} sourcePageTotal={sourcePageTotal} linkageTotal={linkageTotal} graphAssociationTotal={activeGraphAssociations.length} />}
          </>
        )}
      </div>

      <BottomDrawer open={!!selectedCompany} onClose={() => setSelectedCompany(null)} title={selectedCompany?.name || ""} subtitle={selectedCompany?.chineseName || null} dark={dark} bodyScroll={false}>
        <CompanyDrawer
          company={selectedCompany}
          substances={substances}
          preloadedAssociations={associations}
          preloadedEvidence={evidenceSummary}
          evidenceTypes={evidenceTypes}
          timelineRunId={selectedRunId}
          onBuildCompanyGraph={handleBuildCompanyGraph}
          graphLoadingCompanyId={companyGraphLoadingId}
          onAddToDossier={addDossierItem}
          isInDossier={selectedCompany ? isDossierItemPresent(`company:${selectedCompany.id}`) : false}
          onAddMediaToDossier={addMediaToDossier}
          isMediaInDossier={isMediaInDossier}
          onAddEvidenceToDossier={row => addEvidenceRowToDossier(row, "Company provenance")}
          isEvidenceInDossier={isEvidenceRowInDossier}
          companyLookup={companyDirectory}
          getCompanyGraphMetrics={getCompanyGraphMetrics}
          onOpenEvidenceExplorer={openCompanyEvidenceExplorer}
          dark={dark}
        />
      </BottomDrawer>

      <BottomDrawer open={!!selectedSubstance} onClose={() => setSelectedSubstance(null)} title={selectedSubstance?.name || ""} subtitle={selectedSubstance ? `Ingredient ID: ${selectedSubstance.casId} · Weight: ${selectedSubstance.weight}` : null} dark={dark} bodyScroll={false}>
        <SubstanceDrawer
          substance={selectedSubstance}
          evidenceSummary={evidenceSummary}
          substanceDataSources={substanceDataSources}
          companies={companies}
          evidenceTypes={evidenceTypes}
          timelineRunId={selectedRunId}
          onAddToDossier={addDossierItem}
          isInDossier={selectedSubstance ? isDossierItemPresent(`substance:${selectedSubstance.id}`) : false}
          onAddEvidenceToDossier={row => addEvidenceRowToDossier(row, "Ingredient provenance")}
          isEvidenceInDossier={isEvidenceRowInDossier}
          dark={dark}
        />
      </BottomDrawer>

      <BottomDrawer
        open={showGraphSummary && !!companyGraph}
        onClose={() => setShowGraphSummary(false)}
        title="Graph Summary"
        subtitle={companyGraph ? `${companyGraph.seed?.type === "linkage_artifact" ? "Linkage-seeded" : "Company-seeded"} · ${companyGraph.seed?.label || "Selected seed"}` : ""}
        dark={dark}
      >
        {companyGraph && (
          <GraphSummaryDetail
            graph={companyGraph}
            companies={activeGraphCompanies}
            associations={activeGraphAssociations}
            artifactEdges={activeGraphArtifactEdges}
            onAddToDossier={addDossierItem}
            isInDossier={companyGraph ? isDossierItemPresent(`graph:${companyGraph.seed?.type || "graph"}:${companyGraph.seed?.nodeId || companyGraph.seed?.id || String(companyGraph.seed?.label || "").toLowerCase()}`) : false}
            dark={dark}
          />
        )}
      </BottomDrawer>

      <BottomDrawer
        open={!!selectedArtifactEntity}
        onClose={() => setSelectedArtifactEntity(null)}
        title={selectedArtifactEntity ? `${artifactKindLabel(selectedArtifactEntity.kind)} Artifact Intelligence` : "Linkage Artifact Intelligence"}
        subtitle={selectedArtifactEntity ? [selectedArtifactEntity.value, artifactIntelligence?.companyCount != null ? `${artifactIntelligence.companyCount} associated companies` : null].filter(Boolean).join(" · ") : ""}
        dark={dark}
      >
        {selectedArtifactEntity && (
          <LinkageArtifactIntelligenceView
            artifact={selectedArtifactEntity}
            intelligence={artifactIntelligence}
            companies={activeGraphCompanies}
            loading={artifactIntelligenceLoading}
            error={artifactIntelligenceError}
            onBuildArtifactGraph={handleBuildArtifactGraph}
            onAddToDossier={addDossierItem}
            isInDossier={selectedArtifactEntity ? isDossierItemPresent(`artifact:${selectedArtifactEntity.kind}:${String(selectedArtifactEntity.value || "").toLowerCase()}`) : false}
            building={artifactGraphLoadingKey === `${selectedArtifactEntity.kind}:${String(selectedArtifactEntity.value || "").toLowerCase()}`}
            dark={dark}
          />
        )}
      </BottomDrawer>

      <BottomDrawer
        open={!!searchDetailRecord}
        onClose={() => setSearchDetailRecord(null)}
        title={searchDetailRecord ? getExplorerDetailTitle(searchDetailRecord.tableKey, searchDetailRecord.row) : ""}
        subtitle={searchDetailRecord ? getExplorerDetailSubtitle(searchDetailRecord.tableKey, searchDetailRecord.row) : ""}
        dark={dark}
      >
        {searchDetailRecord && <ExplorerDetailContent tableKey={searchDetailRecord.tableKey} row={searchDetailRecord.row} onBuildGraphFromLinkage={handleBuildArtifactGraph} onAddEvidenceToDossier={addEvidenceRowToDossier} isEvidenceInDossier={isEvidenceRowInDossier} dark={dark} />}
      </BottomDrawer>

      <BottomDrawer
        open={!!expandedSearchType}
        onClose={() => setExpandedSearchType(null)}
        title={expandedSearchType ? `${searchTypeLabel(expandedSearchType)} Results` : "Search Results"}
        subtitle={expandedSearchType ? `${expandedSearchResults.length} matches for "${searchQuery}"` : ""}
        dark={dark}
      >
        {expandedSearchType && (
          <SearchResultsPanel
            query={searchQuery}
            type={expandedSearchType}
            results={expandedSearchResults}
            onSelect={result => {
              handleSearchSelect(result);
              setSearchQuery("");
            }}
            onBuildGraphFromResult={handleBuildGraphFromSearchResult}
            dark={dark}
          />
        )}
      </BottomDrawer>
    </div>
  );
}
