import DEMO_DATA from "../data/demoData";

const TABLES = DEMO_DATA.tables || {};
const FAKE_SESSION = {
  user: {
    id: "demo-viewer",
    email: "demo@scrape-and-bake.local",
  },
  access_token: "demo-access-token",
};

const stripQuotes = (value) => String(value || "").replace(/^"+|"+$/g, "");
const normalize = (value) => String(value ?? "").trim().toLowerCase();
const cloneRows = rows => rows.map(row => ({ ...row }));
const maxScore = Math.max(...(TABLES.company_score_v2 || []).map(row => Number(row.total_score_v2) || 0), 1);

const companyById = new Map((TABLES.company || []).map(row => [row.COMPANY_ID, row]));
const companyScoreById = new Map((TABLES.company_score_v2 || []).map(row => [row.COMPANY_ID, row]));
const networkById = new Map((TABLES.company_network_size || []).map(row => [row.COMPANY_ID, row]));
const dataSourceById = new Map((TABLES.data_source || []).map(row => [row.DATA_SOURCE_ID, row]));
const evidenceTypeById = new Map((TABLES.evidence_type || []).map(row => [row.EVIDENCE_TYPE_ID, row]));

const companyNodeData = companyId => {
  const base = companyById.get(companyId);
  const score = companyScoreById.get(companyId);
  const network = networkById.get(companyId);
  if (!base) return null;
  return {
    id: companyId,
    name: base.COMPANY_NAME,
    chineseName: base.CHINESE_NAME || "",
    active: base.ACTIVE_INACTIVE || "Unknown",
    type: base.BUSINESS_TYPE || "Unknown",
    region: base.PRC_HOME_BASE || "Unknown",
    gov: base.GOV_COMPLICITY || "Unknown",
    connections: network?.connection_count || 0,
    weight: score?.total_score_v2 || 0,
    legacyWeight: score?.legacy_score || 0,
    evidenceScore: score?.evidence_score || 0,
    substanceScore: score?.substance_score || 0,
    companyTagScore: score?.company_tag_score || 0,
    evidenceCount: score?.evidence_count || 0,
    substancesLinked: score?.substances_linked || 0,
    risk: Math.max(Math.round(((score?.total_score_v2 || 0) / maxScore) * 100), 1),
  };
};

const artifactKindFromMethod = method => {
  const normalized = normalize(method);
  if (normalized.includes("email")) return "email";
  if (normalized.includes("phone") || normalized.includes("telephone")) return "phone";
  return null;
};

const artifactMethodLabel = kind => (kind === "email" ? "Email" : "Phone");
const artifactNodeId = (kind, value) => `artifact:${kind}:${normalize(value)}`;
const matchArtifact = (method, value, kind, artifactValue) => artifactKindFromMethod(method) === kind && normalize(value) === normalize(artifactValue);

const projectRow = (row, selectedColumns) => {
  if (!selectedColumns || selectedColumns === "*" || selectedColumns.length === 0) return { ...row };
  return selectedColumns.reduce((acc, column) => {
    acc[column] = row[column];
    return acc;
  }, {});
};

const parseSelectedColumns = cols => {
  if (!cols || cols === "*" || cols.trim() === "*") return "*";
  return cols.split(",").map(col => stripQuotes(col.trim())).filter(Boolean);
};

const parseLiteral = value => {
  const raw = String(value || "").trim();
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw;
};

const getTableRows = tableName => cloneRows(TABLES[tableName] || []);

const applySearchFilter = (rows, searchCol, pattern) => {
  const query = normalize(pattern).replace(/^%|%$/g, "");
  return rows.filter(row => normalize(row[searchCol]).includes(query));
};

const buildProvenanceRows = filterFn => (
  (TABLES.evidence_readable || [])
    .filter(filterFn)
    .map(row => ({
      evidence_id: row.EVIDENCE_ID,
      company_id: row.COMPANY_ID,
      substance_reference_id: row.SUBSTANCE_REFERENCE_ID,
      evidence_type_id: row.EVIDENCE_TYPE_ID,
      data_source_id: row.DATA_SOURCE_ID,
      company_name: row.company_name,
      canonical_substance_name: row.substance_name,
      observed_substance_text: row.LISTED_NAME_SUBSTANCE,
      source_name: row.data_source,
      source_type: dataSourceById.get(row.DATA_SOURCE_ID)?.DATA_SOURCE_TYPE || "",
      record_id: row.RECORD_ID,
      date_logged: row.DATE_LOGGED,
      score_contribution: row.EVIDENCE_WEIGHT,
      region: row.REGION,
      source_locator: row.URL,
      source_url: row.URL,
      scrape_run_id: row.SCRAPE_RUN_ID,
      evidence_type: evidenceTypeById.get(row.EVIDENCE_TYPE_ID)?.EVIDENCE_TYPE_NAME || "",
    }))
    .sort((a, b) => String(b.date_logged).localeCompare(String(a.date_logged)))
);

const buildAssociationRowsForArtifact = (kind, value) => (
  (TABLES.association_readable || [])
    .filter(row => matchArtifact(row.LINKAGE_METHOD, row.LINKAGE_VALUE, kind, value))
    .map(row => ({
      associationId: row.ASSOCIATIONID,
      companyId: row.COMPANY_ID,
      associatedCompanyId: row.ASSOCIATED_COMPANY_ID,
      companyName: row.company_name,
      associatedCompanyName: row.associated_company_name,
      method: row.LINKAGE_METHOD,
      linkageType: row.LINKAGE_TYPE,
      value: row.LINKAGE_VALUE,
    }))
);

const buildLinkageRowsForArtifact = (kind, value) => (
  (TABLES.linkage || [])
    .filter(row => matchArtifact(row.LINKAGE_METHOD, row.LINKAGE_VALUE, kind, value))
    .map(row => {
      const source = dataSourceById.get(row.DATA_SOURCE_ID);
      return {
        linkageId: row.LINKAGEID,
        companyId: row.COMPANY_ID,
        companyName: companyById.get(row.COMPANY_ID)?.COMPANY_NAME || `Company #${row.COMPANY_ID}`,
        method: row.LINKAGE_METHOD,
        valueType: row.Linkage_Value_Type,
        value: row.LINKAGE_VALUE,
        dataSourceId: row.DATA_SOURCE_ID,
        sourceName: source?.DATA_SOURCE_NAME || "",
        sourceType: source?.DATA_SOURCE_TYPE || "",
        sourceUrl: source?.URL || "",
        dateLogged: source?.DATE_LOGGED || "",
      };
    })
);

const buildSourceReferencesForArtifact = linkageRows => {
  const bucket = new Map();
  linkageRows.forEach(row => {
    if (!row.dataSourceId) return;
    const current = bucket.get(row.dataSourceId) || {
      dataSourceId: row.dataSourceId,
      sourceName: row.sourceName,
      sourceType: row.sourceType,
      sourceUrl: row.sourceUrl,
      dateLogged: row.dateLogged,
      linkageCount: 0,
    };
    current.linkageCount += 1;
    bucket.set(row.dataSourceId, current);
  });
  return [...bucket.values()].sort((a, b) => b.linkageCount - a.linkageCount);
};

const buildCompanyGraph = companyId => {
  const included = new Set([companyId]);
  const associations = (TABLES.association || []).filter(row => row.COMPANY_ID === companyId || row.ASSOCIATED_COMPANY_ID === companyId);
  associations.forEach(row => {
    included.add(row.COMPANY_ID);
    included.add(row.ASSOCIATED_COMPANY_ID);
  });
  const filteredAssociations = (TABLES.association || []).filter(row => included.has(row.COMPANY_ID) && included.has(row.ASSOCIATED_COMPANY_ID));
  const artifactGroups = new Map();
  filteredAssociations.forEach(row => {
    const kind = artifactKindFromMethod(row.LINKAGE_METHOD);
    if (!kind || !row.LINKAGE_VALUE) return;
    const key = `${kind}:${normalize(row.LINKAGE_VALUE)}`;
    const group = artifactGroups.get(key) || {
      id: artifactNodeId(kind, row.LINKAGE_VALUE),
      kind,
      method: artifactMethodLabel(kind),
      value: row.LINKAGE_VALUE,
      companyIds: new Set(),
      associationIds: [],
    };
    group.companyIds.add(row.COMPANY_ID);
    group.companyIds.add(row.ASSOCIATED_COMPANY_ID);
    group.associationIds.push(row.ASSOCIATIONID);
    artifactGroups.set(key, group);
  });

  const nodes = [...included].map(id => ({
    id,
    type: "company",
    data: companyNodeData(id),
  }));
  const artifactNodes = [...artifactGroups.values()].filter(group => group.companyIds.size >= 2);
  artifactNodes.forEach(group => {
    nodes.push({
      id: group.id,
      type: "linkage_artifact",
      data: {
        id: group.id,
        kind: group.kind,
        method: group.method,
        value: group.value,
        companyCount: group.companyIds.size,
      },
    });
  });

  const edges = filteredAssociations.map(row => ({
    id: `association:${row.ASSOCIATIONID}`,
    type: "company_association",
    label: row.LINKAGE_METHOD,
    data: {
      associationId: row.ASSOCIATIONID,
      fromCompanyId: row.COMPANY_ID,
      toCompanyId: row.ASSOCIATED_COMPANY_ID,
      method: row.LINKAGE_METHOD,
      value: row.LINKAGE_VALUE,
    },
  }));
  artifactNodes.forEach(group => {
    [...group.companyIds].forEach(companyIdValue => {
      edges.push({
        id: `artifact-edge:${group.id}:${companyIdValue}`,
        type: "company_linkage_artifact",
        target: group.id,
        data: {
          associationId: group.associationIds[0],
          companyId: companyIdValue,
          kind: group.kind,
          method: group.method,
          value: group.value,
        },
      });
    });
  });

  return {
    seed: {
      type: "company",
      id: companyId,
      label: companyById.get(companyId)?.COMPANY_NAME || `Company #${companyId}`,
    },
    nodes,
    edges,
    limits: {
      capped: false,
    },
  };
};

const buildArtifactGraph = (kind, value) => {
  const associationRows = buildAssociationRowsForArtifact(kind, value);
  const linkageRows = buildLinkageRowsForArtifact(kind, value);
  const included = new Set();
  associationRows.forEach(row => {
    included.add(row.companyId);
    included.add(row.associatedCompanyId);
  });
  linkageRows.forEach(row => included.add(row.companyId));
  const nodeId = artifactNodeId(kind, value);
  const nodes = [...included].map(id => ({
    id,
    type: "company",
    data: companyNodeData(id),
  }));
  nodes.push({
    id: nodeId,
    type: "linkage_artifact",
    data: {
      id: nodeId,
      kind,
      method: artifactMethodLabel(kind),
      value,
      companyCount: included.size,
    },
  });
  const edges = associationRows.map(row => ({
    id: `association:${row.associationId}`,
    type: "company_association",
    label: row.method,
    data: {
      associationId: row.associationId,
      fromCompanyId: row.companyId,
      toCompanyId: row.associatedCompanyId,
      method: row.method,
      value: row.value,
    },
  }));
  [...included].forEach(companyIdValue => {
    edges.push({
      id: `artifact-edge:${nodeId}:${companyIdValue}`,
      type: "company_linkage_artifact",
      target: nodeId,
      data: {
        associationId: associationRows.find(row => row.companyId === companyIdValue || row.associatedCompanyId === companyIdValue)?.associationId || null,
        companyId: companyIdValue,
        kind,
        method: artifactMethodLabel(kind),
        value,
      },
    });
  });
  return {
    seed: {
      type: "linkage_artifact",
      kind,
      value,
      label: value,
      nodeId,
    },
    nodes,
    edges,
    limits: {
      capped: false,
    },
  };
};

const buildArtifactIntelligence = (kind, value) => {
  const associationRows = buildAssociationRowsForArtifact(kind, value);
  const linkageRows = buildLinkageRowsForArtifact(kind, value);
  const associatedCompanyIds = new Set();
  associationRows.forEach(row => {
    associatedCompanyIds.add(row.companyId);
    associatedCompanyIds.add(row.associatedCompanyId);
  });
  linkageRows.forEach(row => associatedCompanyIds.add(row.companyId));
  const associatedCompanies = [...associatedCompanyIds].map(id => companyNodeData(id)).filter(Boolean);
  const sourceReferences = buildSourceReferencesForArtifact(linkageRows);
  return {
    method: artifactMethodLabel(kind),
    companyCount: associatedCompanies.length,
    associationCount: associationRows.length,
    linkageCount: linkageRows.length,
    sourceCount: sourceReferences.length,
    associatedCompanies,
    associationRows,
    linkageRows,
    sourceReferences,
  };
};

const searchResults = search => {
  const query = normalize(search);
  if (query.length < 2) return [];
  const results = [];

  (TABLES.company_score_v2 || []).forEach(row => {
    if (normalize(row.COMPANY_NAME).includes(query) || normalize(row.BUSINESS_TYPE).includes(query) || normalize(row.PRC_HOME_BASE).includes(query)) {
      results.push({
        type: "company",
        label: row.COMPANY_NAME,
        sublabel: [row.BUSINESS_TYPE, row.PRC_HOME_BASE].filter(Boolean).join(" · "),
        data: companyNodeData(row.COMPANY_ID),
      });
    }
  });

  (TABLES.substance_reference || []).forEach(row => {
    if (normalize(row.SUBSTANCE_NAME).includes(query) || normalize(row.SUBSTANCE_ID).includes(query) || normalize(row.SUBSTANCE_DESCRIPTION).includes(query)) {
      results.push({
        type: "substance",
        label: row.SUBSTANCE_NAME,
        sublabel: `${row.SUBSTANCE_ID} · Weight ${row.SUBSTANCE_WEIGHT}`,
        data: {
          id: row.SUBSTANCE_REFERENCE_ID,
          name: row.SUBSTANCE_NAME,
          casId: row.SUBSTANCE_ID,
          weight: row.SUBSTANCE_WEIGHT,
          description: row.SUBSTANCE_DESCRIPTION,
        },
      });
    }
  });

  (TABLES.substance_sourcing || []).forEach(row => {
    if (normalize(row.SUBSTANCE_SOURCING_LOCAL_NAME).includes(query) || normalize(row.SUBSTANCE_ID).includes(query) || normalize(row.SUBSTANCE_SOURCING_REFERENCE).includes(query)) {
      results.push({
        type: "synonym",
        label: row.SUBSTANCE_SOURCING_LOCAL_NAME,
        sublabel: row.SUBSTANCE_SOURCING_REFERENCE,
        data: {
          sourcingId: row.SUBSTANCE_SOURCING_ID,
          substanceId: row.SUBSTANCE_ID,
          name: row.SUBSTANCE_SOURCING_LOCAL_NAME,
          sourcingTypeId: row.SUBSTANCE_SOURCING_TYPE_ID,
          dataSourceId: row.DATA_SOURCE_ID,
          primary: row.SUBSTANCE_SOURCING_PRIMARY,
        },
      });
    }
  });

  (TABLES.evidence_readable || []).forEach(row => {
    if (
      normalize(row.company_name).includes(query) ||
      normalize(row.substance_name).includes(query) ||
      normalize(row.LISTED_NAME_SUBSTANCE).includes(query) ||
      normalize(row.data_source).includes(query) ||
      normalize(row.RECORD_ID).includes(query)
    ) {
      results.push({
        type: "evidence",
        label: row.company_name,
        sublabel: [row.substance_name, row.evidence_type].filter(Boolean).join(" · "),
        data: {
          id: row.EVIDENCE_ID,
          evidenceId: row.EVIDENCE_ID,
          companyName: row.company_name,
          substanceName: row.substance_name,
          evidenceType: row.evidence_type,
          sourceName: row.data_source,
          listedName: row.LISTED_NAME_SUBSTANCE,
          region: row.REGION,
          weight: row.EVIDENCE_WEIGHT,
          url: row.URL,
        },
      });
    }
  });

  (TABLES.linkage || []).forEach(row => {
    if (normalize(row.LINKAGE_VALUE).includes(query) || normalize(row.LINKAGE_METHOD).includes(query)) {
      results.push({
        type: "linkage",
        label: row.LINKAGE_VALUE,
        sublabel: `${row.LINKAGE_METHOD} · ${companyById.get(row.COMPANY_ID)?.COMPANY_NAME || row.COMPANY_ID}`,
        data: {
          linkageId: row.LINKAGEID,
          companyId: row.COMPANY_ID,
          companyName: companyById.get(row.COMPANY_ID)?.COMPANY_NAME || `Company #${row.COMPANY_ID}`,
          method: row.LINKAGE_METHOD,
          valueType: row.Linkage_Value_Type,
          value: row.LINKAGE_VALUE,
          dataSourceId: row.DATA_SOURCE_ID,
        },
      });
    }
  });

  (TABLES.association_readable || []).forEach(row => {
    if (
      normalize(row.company_name).includes(query) ||
      normalize(row.associated_company_name).includes(query) ||
      normalize(row.LINKAGE_VALUE).includes(query) ||
      normalize(row.LINKAGE_TYPE).includes(query)
    ) {
      results.push({
        type: "association",
        label: row.LINKAGE_VALUE,
        sublabel: `${row.company_name} ↔ ${row.associated_company_name}`,
        data: {
          id: row.ASSOCIATIONID,
          associationId: row.ASSOCIATIONID,
          companyName: row.company_name,
          associatedCompanyName: row.associated_company_name,
          method: row.LINKAGE_METHOD,
          linkageType: row.LINKAGE_TYPE,
          value: row.LINKAGE_VALUE,
        },
      });
    }
  });

  const seen = new Set();
  return results.filter(result => {
    const key = `${result.type}:${normalize(result.label)}:${normalize(result.sublabel)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 80);
};

const runExport = ({ tableKey, search, sortCol, sortDir }) => {
  const tableMap = {
    company: "company",
    evidence_readable: "evidence_readable",
    company_score_v2: "company_score_v2",
    substance_reference: "substance_reference",
    substance_sourcing: "substance_sourcing",
    substance_sourcing_type: "substance_sourcing_type",
    substance_type: "substance_type",
    linkage_readable: "linkage",
    association_readable: "association_readable",
    consolidated_company_readable: "consolidated_company_readable",
    weighting_tag: "weighting_tag",
    data_source: "data_source",
    evidence_type: "evidence_type",
    company_evaluation: "company_evaluation",
  };
  const searchColMap = {
    company: "COMPANY_NAME",
    evidence_readable: "company_name",
    company_score_v2: "COMPANY_NAME",
    substance_reference: "SUBSTANCE_NAME",
    substance_sourcing: "SUBSTANCE_SOURCING_LOCAL_NAME",
    substance_sourcing_type: "SUBSTANCE_SOURCING_TYPE_TITLE",
    substance_type: "SUBSTANCE_TYPE_TITLE",
    linkage_readable: "LINKAGE_VALUE",
    association_readable: "company_name",
    consolidated_company_readable: "CONSOLIDATED_NAME",
    weighting_tag: "WEIGHTING_TAG_TITLE",
    data_source: "DATA_SOURCE_NAME",
    evidence_type: "EVIDENCE_TYPE_NAME",
    company_evaluation: "COMPANY_NAME",
  };
  let rows = getTableRows(tableMap[tableKey] || tableKey);
  if (search) rows = applySearchFilter(rows, searchColMap[tableKey] || searchColMap.company, search);
  if (sortCol) {
    const key = stripQuotes(sortCol);
    rows = rows.sort((left, right) => {
      const a = left[key];
      const b = right[key];
      const direction = sortDir === "desc" ? -1 : 1;
      if (typeof a === "number" && typeof b === "number") return (a - b) * direction;
      return String(a ?? "").localeCompare(String(b ?? "")) * direction;
    });
  }
  return rows;
};

class DemoQuery {
  constructor(tableName) {
    this.tableName = tableName;
    this.selectedColumns = "*";
    this.countRequested = false;
    this.head = false;
    this.filters = [];
    this.sortColumn = null;
    this.sortAscending = true;
    this.rangeStart = null;
    this.rangeEnd = null;
    this.singleRow = false;
    this.limitCount = null;
  }

  select(cols = "*", options = {}) {
    this.selectedColumns = parseSelectedColumns(cols);
    this.countRequested = options.count === "exact";
    this.head = options.head === true;
    return this;
  }

  eq(column, value) {
    const key = stripQuotes(column);
    this.filters.push(row => row[key] === value);
    return this;
  }

  in(column, values) {
    const key = stripQuotes(column);
    const lookup = new Set(values || []);
    this.filters.push(row => lookup.has(row[key]));
    return this;
  }

  or(expression) {
    const predicates = String(expression || "")
      .split(",")
      .map(entry => entry.trim())
      .filter(Boolean)
      .map(entry => {
        const match = entry.match(/^"?([^"]+)"?\.eq\.(.+)$/);
        if (!match) return null;
        const key = stripQuotes(match[1]);
        const value = parseLiteral(match[2]);
        return row => row[key] === value;
      })
      .filter(Boolean);
    this.filters.push(row => predicates.some(predicate => predicate(row)));
    return this;
  }

  ilike(column, pattern) {
    const key = stripQuotes(column);
    this.filters.push(row => normalize(row[key]).includes(normalize(pattern).replace(/^%|%$/g, "")));
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.sortColumn = stripQuotes(column);
    this.sortAscending = ascending;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  range(start, end) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this.execute();
  }

  single() {
    this.singleRow = true;
    return this.execute();
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  execute() {
    let rows = getTableRows(this.tableName);
    this.filters.forEach(predicate => {
      rows = rows.filter(predicate);
    });
    const count = rows.length;
    if (this.sortColumn) {
      const key = this.sortColumn;
      const direction = this.sortAscending ? 1 : -1;
      rows.sort((left, right) => {
        const a = left[key];
        const b = right[key];
        if (typeof a === "number" && typeof b === "number") return (a - b) * direction;
        return String(a ?? "").localeCompare(String(b ?? "")) * direction;
      });
    }
    if (this.limitCount != null) rows = rows.slice(0, this.limitCount);
    if (this.rangeStart != null && this.rangeEnd != null) rows = rows.slice(this.rangeStart, this.rangeEnd + 1);
    const projectedRows = rows.map(row => projectRow(row, this.selectedColumns));
    if (this.head) return Promise.resolve({ data: null, count, error: null });
    if (this.singleRow) return Promise.resolve({ data: projectedRows[0] || null, error: null });
    return Promise.resolve({
      data: projectedRows,
      count: this.countRequested ? count : null,
      error: null,
    });
  }
}

const invokeAuthorizedData = body => {
  switch (body?.action) {
    case "provenance":
      if (body.entityType === "company") {
        return { rows: buildProvenanceRows(row => row.COMPANY_ID === body.companyId) };
      }
      return { rows: buildProvenanceRows(row => row.SUBSTANCE_REFERENCE_ID === body.substanceReferenceId || row.SUBSTANCE_ID === body.substanceId) };
    case "companyGraph":
      return { graph: buildCompanyGraph(body.companyId) };
    case "artifactGraph":
      return { graph: buildArtifactGraph(body.kind, body.value) };
    case "artifactIntelligence":
      return { artifact: buildArtifactIntelligence(body.kind, body.value) };
    case "search":
      return { results: searchResults(body.search) };
    case "export":
      return { rows: runExport(body) };
    default:
      return {};
  }
};

export const supabase = {
  from(tableName) {
    return new DemoQuery(tableName);
  },
  rpc(name) {
    return Promise.resolve({
      data: TABLES.rpcs?.[name] ?? null,
      error: null,
    });
  },
  schema() {
    return {
      from(tableName) {
        return new DemoQuery(tableName);
      },
    };
  },
  auth: {
    getSession() {
      return Promise.resolve({ data: { session: FAKE_SESSION }, error: null });
    },
    getUser() {
      return Promise.resolve({ data: { user: FAKE_SESSION.user }, error: null });
    },
    signInWithPassword() {
      return Promise.resolve({ data: { session: FAKE_SESSION }, error: null });
    },
    signOut() {
      return Promise.resolve({ error: null });
    },
    onAuthStateChange() {
      return {
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      };
    },
  },
  functions: {
    invoke(name, { body } = {}) {
      if (name === "verify-allowed-user") {
        return Promise.resolve({
          data: {
            allowed: true,
            role: "viewer",
            enabled: true,
            userId: FAKE_SESSION.user.id,
            userEmail: FAKE_SESSION.user.email,
            requestId: "demo-access",
            matchedBy: "demo-mode",
          },
          error: null,
        });
      }
      if (name === "authorized-data") {
        return Promise.resolve({ data: invokeAuthorizedData(body || {}), error: null });
      }
      if (name === "authorized-media") {
        if (body?.action === "sign") {
          return Promise.resolve({ data: { signedUrl: null }, error: null });
        }
        return Promise.resolve({ data: { images: [], pdfs: [] }, error: null });
      }
      return Promise.resolve({ data: {}, error: null });
    },
  },
};

export default supabase;
