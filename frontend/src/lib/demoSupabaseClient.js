import DEMO_DATA from "../data/demoData";

const TABLES = DEMO_DATA.tables || {};
const METADATA = DEMO_DATA.metadata || {};
const SCRAPE_RUNS = METADATA.scrapeRuns || [];
const SCRAPE_RUN_BY_ID = new Map(SCRAPE_RUNS.map(run => [run.id, run]));
const SCRAPE_RUN_LABELS = new Map(SCRAPE_RUNS.map(run => [run.id, run.label]));

const FAKE_SESSION = {
  user: {
    id: "demo-viewer",
    email: "demo@scrape-and-bake.local",
  },
  access_token: "demo-access-token",
};

const stripQuotes = value => String(value || "").replace(/^"+|"+$/g, "");
const normalize = value => String(value ?? "").trim().toLowerCase();
const cloneRows = rows => rows.map(row => ({ ...row }));
const parseSelectedColumns = cols => {
  if (!cols || cols === "*" || cols.trim() === "*") return "*";
  return cols.split(",").map(col => stripQuotes(col.trim())).filter(Boolean);
};
const parseLiteral = value => {
  const raw = String(value || "").trim();
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw;
};
const projectRow = (row, selectedColumns) => {
  if (!selectedColumns || selectedColumns === "*" || selectedColumns.length === 0) return { ...row };
  return selectedColumns.reduce((acc, column) => {
    acc[column] = row[column];
    return acc;
  }, {});
};
const rowObservedAt = row => row?.OBSERVED_AT || row?.DATE_LOGGED || row?.observed_at || row?.date_logged || "";
const normalizeRunId = runId => {
  if (!runId || runId === "all_runs") return "all_runs";
  return SCRAPE_RUN_BY_ID.has(runId) ? runId : "all_runs";
};
const cutoffDateForRun = runId => {
  const normalizedRunId = normalizeRunId(runId);
  if (normalizedRunId === "all_runs") return null;
  return SCRAPE_RUN_BY_ID.get(normalizedRunId)?.date || null;
};
const isVisibleAsOf = (row, cutoffDate) => !cutoffDate || String(rowObservedAt(row)) <= cutoffDate;

let activeTimelineRunId = "all_runs";
let snapshotCache = new Map();

const companyById = new Map((TABLES.company || []).map(row => [row.COMPANY_ID, row]));
const substanceById = new Map((TABLES.substance_reference || []).map(row => [row.SUBSTANCE_REFERENCE_ID, row]));
const dataSourceById = new Map((TABLES.data_source || []).map(row => [row.DATA_SOURCE_ID, row]));
const evidenceTypeById = new Map((TABLES.evidence_type || []).map(row => [row.EVIDENCE_TYPE_ID, row]));
const weightingTagById = new Map((TABLES.weighting_tag || []).map(row => [row.WEIGHTING_TAG_ID, row]));
const consolidatedCompanyById = new Map((TABLES.consolidated_company || []).map(row => [row.CONSOLIDATED_NAME_ID, row]));

const artifactKindFromMethod = method => {
  const normalized = normalize(method);
  if (normalized.includes("email")) return "email";
  if (normalized.includes("phone") || normalized.includes("telephone")) return "phone";
  return null;
};
const artifactMethodLabel = kind => (kind === "email" ? "Email" : "Phone");
const artifactNodeId = (kind, value) => `artifact:${kind}:${normalize(value)}`;
const matchArtifact = (method, value, kind, artifactValue) => artifactKindFromMethod(method) === kind && normalize(value) === normalize(artifactValue);

const clearSnapshotCache = () => {
  snapshotCache = new Map();
};

const buildSnapshotContext = (runId = activeTimelineRunId) => {
  const normalizedRunId = normalizeRunId(runId);
  if (snapshotCache.has(normalizedRunId)) return snapshotCache.get(normalizedRunId);

  const cutoffDate = cutoffDateForRun(normalizedRunId);
  const evidenceRows = cloneRows((TABLES.evidence || []).filter(row => isVisibleAsOf(row, cutoffDate)));
  const associationRows = cloneRows((TABLES.association || []).filter(row => isVisibleAsOf(row, cutoffDate)));
  const linkageRows = cloneRows((TABLES.linkage || []).filter(row => isVisibleAsOf(row, cutoffDate)));
  const dataSourceRows = cloneRows((TABLES.data_source || []).filter(row => isVisibleAsOf(row, cutoffDate)));
  const visibleDataSourceIds = new Set(dataSourceRows.map(row => row.DATA_SOURCE_ID));

  const companyIds = new Set();
  const ingredientIds = new Set();
  evidenceRows.forEach(row => {
    companyIds.add(row.COMPANY_ID);
    ingredientIds.add(row.SUBSTANCE_REFERENCE_ID);
  });
  associationRows.forEach(row => {
    companyIds.add(row.COMPANY_ID);
    companyIds.add(row.ASSOCIATED_COMPANY_ID);
  });
  linkageRows.forEach(row => {
    companyIds.add(row.COMPANY_ID);
  });

  const companyRows = cloneRows((TABLES.company || []).filter(row => companyIds.has(row.COMPANY_ID)));
  const substanceRows = cloneRows((TABLES.substance_reference || []).filter(row => ingredientIds.has(row.SUBSTANCE_REFERENCE_ID)));
  const substanceSourcingRows = cloneRows((TABLES.substance_sourcing || []).filter(row => {
    const matchesIngredient = ingredientIds.has(row.SUBSTANCE_REFERENCE_ID) || ingredientIds.has(row.SUBSTANCE_ID);
    const matchesSource = row.DATA_SOURCE_ID == null || visibleDataSourceIds.has(row.DATA_SOURCE_ID);
    return matchesIngredient && matchesSource;
  }));
  const companyConsolidatedMapRows = cloneRows((TABLES.company_consolidated_map || []).filter(row => companyIds.has(row.COMPANY_ID)));
  const companyWeightingTagRows = cloneRows((TABLES.company_weighting_tag || []).filter(row => companyIds.has(row.COMPANY_ID)));
  const visibleEvidenceIds = new Set(evidenceRows.map(row => row.EVIDENCE_ID));
  const evidenceWeightingTagRows = cloneRows((TABLES.evidence_weighting_tag || []).filter(row => visibleEvidenceIds.has(row.EVIDENCE_ID)));
  const visibleIngredientIds = new Set(substanceRows.map(row => row.SUBSTANCE_REFERENCE_ID));
  const substanceWeightingTagRows = cloneRows((TABLES.substance_weighting_tag || []).filter(row => visibleIngredientIds.has(row.SUBSTANCE_REFERENCE_ID)));

  const evidenceReadableRows = evidenceRows.map(row => {
    const source = dataSourceById.get(row.DATA_SOURCE_ID) || {};
    const evidenceType = evidenceTypeById.get(row.EVIDENCE_TYPE_ID) || {};
    const company = companyById.get(row.COMPANY_ID) || {};
    const substance = substanceById.get(row.SUBSTANCE_REFERENCE_ID) || {};
    return {
      ...row,
      company_name: company.COMPANY_NAME || `Company #${row.COMPANY_ID}`,
      substance_name: substance.SUBSTANCE_NAME || `Ingredient #${row.SUBSTANCE_REFERENCE_ID}`,
      evidence_type: evidenceType.EVIDENCE_TYPE_NAME || "",
      data_source: source.DATA_SOURCE_NAME || "",
      source_type: source.DATA_SOURCE_TYPE || "",
      source_platform: source.SOURCE_PLATFORM || row.SOURCE_PLATFORM || "",
      observed_at: source.OBSERVED_AT || row.OBSERVED_AT || row.DATE_LOGGED || "",
    };
  });

  const evidenceSummaryMap = new Map();
  evidenceRows.forEach(row => {
    const key = `${row.COMPANY_ID}:${row.SUBSTANCE_REFERENCE_ID}:${row.EVIDENCE_TYPE_ID}`;
    const current = evidenceSummaryMap.get(key) || {
      COMPANY_ID: row.COMPANY_ID,
      SUBSTANCE_REFERENCE_ID: row.SUBSTANCE_REFERENCE_ID,
      EVIDENCE_TYPE_ID: row.EVIDENCE_TYPE_ID,
      evidence_count: 0,
      total_weight: 0,
    };
    current.evidence_count += 1;
    current.total_weight += Number(row.EVIDENCE_WEIGHT) || 0;
    evidenceSummaryMap.set(key, current);
  });
  const evidenceSummaryRows = [...evidenceSummaryMap.values()].sort((left, right) => right.total_weight - left.total_weight);

  const substanceDatasourceMap = new Map();
  evidenceRows.forEach(row => {
    const source = dataSourceById.get(row.DATA_SOURCE_ID) || {};
    const key = `${row.SUBSTANCE_REFERENCE_ID}:${source.DATA_SOURCE_NAME || ""}:${source.DATA_SOURCE_TYPE || ""}`;
    const current = substanceDatasourceMap.get(key) || {
      SUBSTANCE_REFERENCE_ID: row.SUBSTANCE_REFERENCE_ID,
      DATA_SOURCE_NAME: source.DATA_SOURCE_NAME || "",
      DATA_SOURCE_TYPE: source.DATA_SOURCE_TYPE || "",
      mention_count: 0,
    };
    current.mention_count += 1;
    substanceDatasourceMap.set(key, current);
  });
  const substanceDatasourceSummaryRows = [...substanceDatasourceMap.values()].sort((left, right) => right.mention_count - left.mention_count);

  const connectionCounts = new Map();
  associationRows.forEach(row => {
    connectionCounts.set(row.COMPANY_ID, (connectionCounts.get(row.COMPANY_ID) || 0) + 1);
    connectionCounts.set(row.ASSOCIATED_COMPANY_ID, (connectionCounts.get(row.ASSOCIATED_COMPANY_ID) || 0) + 1);
  });
  const companyNetworkRows = companyRows
    .map(row => ({
      ...row,
      connection_count: connectionCounts.get(row.COMPANY_ID) || 0,
    }))
    .sort((left, right) => (right.connection_count || 0) - (left.connection_count || 0));

  const evidenceScores = new Map();
  const evidenceCounts = new Map();
  const substanceScores = new Map();
  const companyTagScores = new Map();
  const substancesLinked = new Map();

  evidenceRows.forEach(row => {
    const substance = substanceById.get(row.SUBSTANCE_REFERENCE_ID) || {};
    evidenceScores.set(row.COMPANY_ID, (evidenceScores.get(row.COMPANY_ID) || 0) + (Number(row.EVIDENCE_WEIGHT) || 0));
    evidenceCounts.set(row.COMPANY_ID, (evidenceCounts.get(row.COMPANY_ID) || 0) + 1);
    substanceScores.set(row.COMPANY_ID, (substanceScores.get(row.COMPANY_ID) || 0) + (Number(substance.SUBSTANCE_WEIGHT) || 0));
    const current = substancesLinked.get(row.COMPANY_ID) || new Set();
    current.add(row.SUBSTANCE_REFERENCE_ID);
    substancesLinked.set(row.COMPANY_ID, current);
  });
  companyWeightingTagRows.forEach(row => {
    const weightingTag = weightingTagById.get(row.WEIGHTING_TAG_ID) || {};
    companyTagScores.set(row.COMPANY_ID, (companyTagScores.get(row.COMPANY_ID) || 0) + (Number(weightingTag.WEIGHTING_TAG_WEIGHT) || 0));
  });

  const companyScoreRows = companyRows
    .map(row => {
      const evidenceScore = evidenceScores.get(row.COMPANY_ID) || 0;
      const substanceScore = substanceScores.get(row.COMPANY_ID) || 0;
      const companyTagScore = companyTagScores.get(row.COMPANY_ID) || 0;
      const totalScoreV2 = evidenceScore + Math.round(substanceScore * 0.35) + companyTagScore;
      return {
        ...row,
        evidence_score: evidenceScore,
        substance_score: substanceScore,
        company_tag_score: companyTagScore,
        total_score_v2: totalScoreV2,
        legacy_score: evidenceScore + companyTagScore,
        evidence_count: evidenceCounts.get(row.COMPANY_ID) || 0,
        substances_linked: (substancesLinked.get(row.COMPANY_ID) || new Set()).size,
      };
    })
    .sort((left, right) => (right.total_score_v2 || 0) - (left.total_score_v2 || 0));

  const companyEvaluationRows = companyScoreRows.map(row => ({
    COMPANY_ID: row.COMPANY_ID,
    COMPANY_NAME: row.COMPANY_NAME,
    EVIDENCE_COMPANY_WEIGHT: row.evidence_score,
    TOTAL_WEIGHT: row.total_score_v2,
  }));

  const associationReadableRows = associationRows.map(row => ({
    ...row,
    company_name: companyById.get(row.COMPANY_ID)?.COMPANY_NAME || `Company #${row.COMPANY_ID}`,
    associated_company_name: companyById.get(row.ASSOCIATED_COMPANY_ID)?.COMPANY_NAME || `Company #${row.ASSOCIATED_COMPANY_ID}`,
  }));

  const consolidatedCompanyReadableRows = companyConsolidatedMapRows.map((row, index) => ({
    CONSOLIDATED_COMPANY_ID: index + 1,
    CONSOLIDATED_NAME: consolidatedCompanyById.get(row.CONSOLIDATED_COMPANY_ID)?.CONSOLIDATED_NAME || "",
    COMPANY_NAME: companyById.get(row.COMPANY_ID)?.COMPANY_NAME || `Company #${row.COMPANY_ID}`,
    COMPANY_ID: row.COMPANY_ID,
  }));

  const context = {
    runId: normalizedRunId,
    cutoffDate,
    companyIds,
    ingredientIds,
    evidenceRows,
    associationRows,
    linkageRows,
    dataSourceRows,
    companyRows,
    substanceRows,
    substanceSourcingRows,
    companyConsolidatedMapRows,
    companyWeightingTagRows,
    evidenceWeightingTagRows,
    substanceWeightingTagRows,
    evidenceReadableRows,
    evidenceSummaryRows,
    substanceDatasourceSummaryRows,
    companyNetworkRows,
    companyScoreRows,
    companyEvaluationRows,
    associationReadableRows,
    consolidatedCompanyReadableRows,
    companyScoreById: new Map(companyScoreRows.map(row => [row.COMPANY_ID, row])),
    networkById: new Map(companyNetworkRows.map(row => [row.COMPANY_ID, row])),
    sourcePageCount: dataSourceRows.length,
  };
  snapshotCache.set(normalizedRunId, context);
  return context;
};

const getTableRows = (tableName, runId = activeTimelineRunId) => {
  const context = buildSnapshotContext(runId);
  switch (tableName) {
    case "company":
      return cloneRows(context.companyRows);
    case "company_consolidated_map":
      return cloneRows(context.companyConsolidatedMapRows);
    case "substance_reference":
      return cloneRows(context.substanceRows);
    case "substance_sourcing":
      return cloneRows(context.substanceSourcingRows);
    case "data_source":
      return cloneRows(context.dataSourceRows);
    case "linkage":
      return cloneRows(context.linkageRows);
    case "association":
      return cloneRows(context.associationRows);
    case "evidence":
      return cloneRows(context.evidenceRows);
    case "company_weighting_tag":
      return cloneRows(context.companyWeightingTagRows);
    case "evidence_weighting_tag":
      return cloneRows(context.evidenceWeightingTagRows);
    case "substance_weighting_tag":
      return cloneRows(context.substanceWeightingTagRows);
    case "evidence_summary":
      return cloneRows(context.evidenceSummaryRows);
    case "company_network_size":
      return cloneRows(context.companyNetworkRows);
    case "company_score_v2":
      return cloneRows(context.companyScoreRows);
    case "company_evaluation":
      return cloneRows(context.companyEvaluationRows);
    case "substance_datasource_summary":
      return cloneRows(context.substanceDatasourceSummaryRows);
    case "evidence_readable":
      return cloneRows(context.evidenceReadableRows);
    case "association_readable":
      return cloneRows(context.associationReadableRows);
    case "consolidated_company_readable":
      return cloneRows(context.consolidatedCompanyReadableRows);
    default:
      return cloneRows(TABLES[tableName] || []);
  }
};

const getSignalScaleMax = runId => Math.max(...getTableRows("company_score_v2", runId).map(row => Number(row.total_score_v2) || 0), 1);

const companyNodeData = (companyId, runId = activeTimelineRunId) => {
  const snapshot = buildSnapshotContext(runId);
  if (!snapshot.companyIds.has(companyId)) return null;
  const base = companyById.get(companyId);
  const score = snapshot.companyScoreById.get(companyId);
  const network = snapshot.networkById.get(companyId);
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
    signalScore: Math.max(Math.round(((score?.total_score_v2 || 0) / getSignalScaleMax(runId)) * 100), 1),
    risk: Math.max(Math.round(((score?.total_score_v2 || 0) / getSignalScaleMax(runId)) * 100), 1),
  };
};

const buildProvenanceRows = (filterFn, runId = activeTimelineRunId) => (
  getTableRows("evidence_readable", runId)
    .filter(filterFn)
    .map(row => {
      const source = dataSourceById.get(row.DATA_SOURCE_ID) || {};
      return {
        evidence_id: row.EVIDENCE_ID,
        company_id: row.COMPANY_ID,
        substance_reference_id: row.SUBSTANCE_REFERENCE_ID,
        evidence_type_id: row.EVIDENCE_TYPE_ID,
        data_source_id: row.DATA_SOURCE_ID,
        company_name: row.company_name,
        canonical_substance_name: row.substance_name,
        observed_substance_text: row.LISTED_NAME_SUBSTANCE,
        source_name: row.data_source,
        source_type: source.DATA_SOURCE_TYPE || row.source_type || "",
        source_platform: source.SOURCE_PLATFORM || row.source_platform || "",
        record_id: row.RECORD_ID,
        date_logged: row.DATE_LOGGED,
        observed_at: source.OBSERVED_AT || row.OBSERVED_AT || row.observed_at || row.DATE_LOGGED || "",
        first_seen_at: source.FIRST_SEEN_AT || "",
        last_seen_at: source.LAST_SEEN_AT || "",
        score_contribution: row.EVIDENCE_WEIGHT,
        region: row.REGION,
        source_locator: row.URL,
        source_url: row.URL,
        scrape_run_id: row.SCRAPE_RUN_ID,
        scrape_run_label: SCRAPE_RUN_LABELS.get(row.SCRAPE_RUN_ID) || row.SCRAPE_RUN_ID,
        evidence_type: evidenceTypeById.get(row.EVIDENCE_TYPE_ID)?.EVIDENCE_TYPE_NAME || "",
      };
    })
    .sort((left, right) => String(right.observed_at || right.date_logged).localeCompare(String(left.observed_at || left.date_logged)))
);

const buildAssociationRowsForArtifact = (kind, value, runId = activeTimelineRunId) => (
  getTableRows("association_readable", runId)
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

const buildLinkageRowsForArtifact = (kind, value, runId = activeTimelineRunId) => (
  getTableRows("linkage", runId)
    .filter(row => matchArtifact(row.LINKAGE_METHOD, row.LINKAGE_VALUE, kind, value))
    .map(row => {
      const source = dataSourceById.get(row.DATA_SOURCE_ID) || {};
      return {
        linkageId: row.LINKAGEID,
        companyId: row.COMPANY_ID,
        companyName: companyById.get(row.COMPANY_ID)?.COMPANY_NAME || `Company #${row.COMPANY_ID}`,
        method: row.LINKAGE_METHOD,
        valueType: row.Linkage_Value_Type,
        value: row.LINKAGE_VALUE,
        dataSourceId: row.DATA_SOURCE_ID,
        sourceName: source.DATA_SOURCE_NAME || "",
        sourceType: source.DATA_SOURCE_TYPE || "",
        sourcePlatform: source.SOURCE_PLATFORM || "",
        sourceUrl: source.URL || "",
        dateLogged: source.DATE_LOGGED || row.DATE_LOGGED || "",
        observedAt: source.OBSERVED_AT || row.OBSERVED_AT || row.DATE_LOGGED || "",
        scrapeRunId: row.SCRAPE_RUN_ID || source.SCRAPE_RUN_ID || "",
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
      sourcePlatform: row.sourcePlatform,
      sourceUrl: row.sourceUrl,
      dateLogged: row.dateLogged,
      observedAt: row.observedAt,
      linkageCount: 0,
      scrapeRunId: row.scrapeRunId,
    };
    current.linkageCount += 1;
    bucket.set(row.dataSourceId, current);
  });
  return [...bucket.values()].sort((left, right) => right.linkageCount - left.linkageCount);
};

const buildCompanyGraph = (companyId, runId = activeTimelineRunId) => {
  const snapshot = buildSnapshotContext(runId);
  const included = new Set([companyId]);
  const associations = snapshot.associationRows.filter(row => row.COMPANY_ID === companyId || row.ASSOCIATED_COMPANY_ID === companyId);
  associations.forEach(row => {
    included.add(row.COMPANY_ID);
    included.add(row.ASSOCIATED_COMPANY_ID);
  });
  const filteredAssociations = snapshot.associationRows.filter(row => included.has(row.COMPANY_ID) && included.has(row.ASSOCIATED_COMPANY_ID));
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

  const nodes = [...included]
    .map(id => ({
      id,
      type: "company",
      data: companyNodeData(id, runId),
    }))
    .filter(node => node.data);
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
    [...group.companyIds].forEach(groupCompanyId => {
      edges.push({
        id: `artifact-edge:${group.id}:${groupCompanyId}`,
        type: "company_linkage_artifact",
        target: group.id,
        data: {
          associationId: group.associationIds[0],
          companyId: groupCompanyId,
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
      asOfRunId: normalizeRunId(runId),
    },
    nodes,
    edges,
    limits: {
      capped: false,
      returnedCompanyNodes: nodes.filter(node => node.type === "company").length,
      returnedEdges: edges.length,
    },
  };
};

const buildArtifactGraph = (kind, value, runId = activeTimelineRunId) => {
  const associationRows = buildAssociationRowsForArtifact(kind, value, runId);
  const linkageRows = buildLinkageRowsForArtifact(kind, value, runId);
  const included = new Set();
  associationRows.forEach(row => {
    included.add(row.companyId);
    included.add(row.associatedCompanyId);
  });
  linkageRows.forEach(row => included.add(row.companyId));

  const nodeId = artifactNodeId(kind, value);
  const nodes = [...included]
    .map(id => ({
      id,
      type: "company",
      data: companyNodeData(id, runId),
    }))
    .filter(node => node.data);
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
      asOfRunId: normalizeRunId(runId),
    },
    nodes,
    edges,
    limits: {
      capped: false,
      returnedCompanyNodes: nodes.filter(node => node.type === "company").length,
      returnedEdges: edges.length,
    },
  };
};

const buildArtifactIntelligence = (kind, value, runId = activeTimelineRunId) => {
  const associationRows = buildAssociationRowsForArtifact(kind, value, runId);
  const linkageRows = buildLinkageRowsForArtifact(kind, value, runId);
  const associatedCompanyIds = new Set();
  associationRows.forEach(row => {
    associatedCompanyIds.add(row.companyId);
    associatedCompanyIds.add(row.associatedCompanyId);
  });
  linkageRows.forEach(row => associatedCompanyIds.add(row.companyId));
  const associatedCompanies = [...associatedCompanyIds].map(id => companyNodeData(id, runId)).filter(Boolean);
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

const searchResults = (search, runId = activeTimelineRunId) => {
  const query = normalize(search);
  if (query.length < 2) return [];
  const results = [];
  const context = buildSnapshotContext(runId);

  context.companyScoreRows.forEach(row => {
    if (normalize(row.COMPANY_NAME).includes(query) || normalize(row.BUSINESS_TYPE).includes(query) || normalize(row.PRC_HOME_BASE).includes(query)) {
      results.push({
        type: "company",
        label: row.COMPANY_NAME,
        sublabel: [row.BUSINESS_TYPE, row.PRC_HOME_BASE].filter(Boolean).join(" · "),
        data: companyNodeData(row.COMPANY_ID, runId),
      });
    }
  });

  context.substanceRows.forEach(row => {
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

  context.substanceSourcingRows.forEach(row => {
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

  context.evidenceReadableRows.forEach(row => {
    if (
      normalize(row.company_name).includes(query) ||
      normalize(row.substance_name).includes(query) ||
      normalize(row.LISTED_NAME_SUBSTANCE).includes(query) ||
      normalize(row.data_source).includes(query) ||
      normalize(row.RECORD_ID).includes(query) ||
      normalize(row.SOURCE_PLATFORM).includes(query)
    ) {
      results.push({
        type: "evidence",
        label: row.company_name,
        sublabel: [row.substance_name, row.evidence_type, row.SOURCE_PLATFORM].filter(Boolean).join(" · "),
        data: {
          id: row.EVIDENCE_ID,
          evidenceId: row.EVIDENCE_ID,
          companyName: row.company_name,
          substanceName: row.substance_name,
          evidenceType: row.evidence_type,
          sourceName: row.data_source,
          sourcePlatform: row.SOURCE_PLATFORM,
          listedName: row.LISTED_NAME_SUBSTANCE,
          region: row.REGION,
          weight: row.EVIDENCE_WEIGHT,
          url: row.URL,
          scrapeRunId: row.SCRAPE_RUN_ID,
          observedAt: row.OBSERVED_AT,
        },
      });
    }
  });

  context.linkageRows.forEach(row => {
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

  context.associationReadableRows.forEach(row => {
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

const applySearchFilter = (rows, searchCol, pattern) => {
  const query = normalize(pattern).replace(/^%|%$/g, "");
  return rows.filter(row => normalize(row[searchCol]).includes(query));
};

const runExport = ({ tableKey, search, sortCol, sortDir, asOfRunId }) => {
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
  let rows = getTableRows(tableMap[tableKey] || tableKey, asOfRunId);
  if (search) rows = applySearchFilter(rows, searchColMap[tableKey] || searchColMap.company, search);
  if (sortCol) {
    const key = stripQuotes(sortCol);
    const direction = sortDir === "desc" ? -1 : 1;
    rows = rows.sort((left, right) => {
      const a = left[key];
      const b = right[key];
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
  const runId = body?.asOfRunId || activeTimelineRunId;
  switch (body?.action) {
    case "provenance":
      if (body.entityType === "company") {
        return { rows: buildProvenanceRows(row => row.COMPANY_ID === body.companyId, runId) };
      }
      return { rows: buildProvenanceRows(row => row.SUBSTANCE_REFERENCE_ID === body.substanceReferenceId || row.SUBSTANCE_ID === body.substanceId, runId) };
    case "companyGraph":
      return { graph: buildCompanyGraph(body.companyId, runId) };
    case "artifactGraph":
      return { graph: buildArtifactGraph(body.kind, body.value, runId) };
    case "artifactIntelligence":
      return { artifact: buildArtifactIntelligence(body.kind, body.value, runId) };
    case "search":
      return { results: searchResults(body.search, runId) };
    case "export":
      return { rows: runExport({ ...body, asOfRunId: runId }) };
    default:
      return {};
  }
};

export const supabase = {
  setTimelineFilter(runId) {
    activeTimelineRunId = normalizeRunId(runId);
    clearSnapshotCache();
    return activeTimelineRunId;
  },
  getTimelineFilter() {
    return activeTimelineRunId;
  },
  getTimelineOptions() {
    return cloneRows(SCRAPE_RUNS);
  },
  from(tableName) {
    return new DemoQuery(tableName);
  },
  rpc(name) {
    const snapshot = buildSnapshotContext();
    let data = TABLES.rpcs?.[name] ?? null;
    if (name === "get_evidence_total") data = snapshot.evidenceRows.length;
    if (name === "get_company_count") data = snapshot.companyRows.length;
    if (name === "get_association_count") data = snapshot.associationRows.length;
    return Promise.resolve({
      data,
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
