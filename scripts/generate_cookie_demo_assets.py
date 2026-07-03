#!/usr/bin/env python3
"""Generate a benign, schema-compatible Scrape & Bake demo dataset.

This script writes:
- seed CSVs for core and support tables
- SQL seed and compatibility view files
- a frontend demo data module used by the static demo adapter
"""

from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from datetime import date, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSV_DIR = ROOT / "data" / "seed" / "csv"
SQL_DIR = ROOT / "data" / "seed" / "sql"
FRONTEND_DATA_FILE = ROOT / "frontend" / "src" / "data" / "demoData.js"


def sql_literal(value):
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


COMPANIES = [
    {
        "COMPANY_ID": 1,
        "COMPANY_NAME": "Harbor Batch Bakery",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Midwest",
        "GOV_COMPLICITY": "Retail bakery",
    },
    {
        "COMPANY_ID": 2,
        "COMPANY_NAME": "Maple & Main Cookie Co.",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Northeast",
        "GOV_COMPLICITY": "Regional bakery",
    },
    {
        "COMPANY_ID": 3,
        "COMPANY_NAME": "Sunfield Flour Mills",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Great Lakes",
        "GOV_COMPLICITY": "Flour mill",
    },
    {
        "COMPANY_ID": 4,
        "COMPANY_NAME": "Orchard Vanilla Imports",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Importer",
        "PRC_HOME_BASE": "East Coast",
        "GOV_COMPLICITY": "Flavor importer",
    },
    {
        "COMPANY_ID": 5,
        "COMPANY_NAME": "Northwind Butter Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Dairy Processor",
        "PRC_HOME_BASE": "Wisconsin",
        "GOV_COMPLICITY": "Butter supplier",
    },
    {
        "COMPANY_ID": 6,
        "COMPANY_NAME": "Cacao Coast Ingredients",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "West Coast",
        "GOV_COMPLICITY": "Chocolate ingredient supplier",
    },
    {
        "COMPANY_ID": 7,
        "COMPANY_NAME": "Spruce Street Packing",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Co-Packer",
        "PRC_HOME_BASE": "Midwest",
        "GOV_COMPLICITY": "Packaging partner",
    },
    {
        "COMPANY_ID": 8,
        "COMPANY_NAME": "Golden Crate Logistics",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Distributor",
        "PRC_HOME_BASE": "National",
        "GOV_COMPLICITY": "Distribution partner",
    },
    {
        "COMPANY_ID": 9,
        "COMPANY_NAME": "Clover Cane Sugars",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Gulf Coast",
        "GOV_COMPLICITY": "Sugar refiner",
    },
    {
        "COMPANY_ID": 10,
        "COMPANY_NAME": "Copper Kettle Kitchen",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Contract Bakery",
        "PRC_HOME_BASE": "South",
        "GOV_COMPLICITY": "Private-label bakery",
    },
    {
        "COMPANY_ID": 11,
        "COMPANY_NAME": "Bluebird Oven Foods",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Pacific Northwest",
        "GOV_COMPLICITY": "Regional bakery",
    },
    {
        "COMPANY_ID": 12,
        "COMPANY_NAME": "Seaside Biscuit Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Southeast",
        "GOV_COMPLICITY": "Retail bakery",
    },
]

CONSOLIDATED_COMPANY = [
    {"CONSOLIDATED_NAME_ID": 1, "CONSOLIDATED_NAME": "Bakehouse Collective"},
    {"CONSOLIDATED_NAME_ID": 2, "CONSOLIDATED_NAME": "Pantry Inputs Cooperative"},
    {"CONSOLIDATED_NAME_ID": 3, "CONSOLIDATED_NAME": "Packing & Fulfillment Partners"},
]

COMPANY_CONSOLIDATED_MAP = [
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 1},
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 2},
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 10},
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 11},
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 12},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 3},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 4},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 5},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 6},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 9},
    {"CONSOLIDATED_COMPANY_ID": 3, "COMPANY_ID": 7},
    {"CONSOLIDATED_COMPANY_ID": 3, "COMPANY_ID": 8},
]

SUBSTANCE_TYPE = [
    {"SUBSTANCE_TYPE_ID": 1, "SUBSTANCE_TYPE_TITLE": "Flour", "SUBSTANCE_TYPE_DESCRIPTION": "Foundational flour ingredients used in cookie dough."},
    {"SUBSTANCE_TYPE_ID": 2, "SUBSTANCE_TYPE_TITLE": "Sweetener", "SUBSTANCE_TYPE_DESCRIPTION": "Sugars and sweet ingredients used for structure and flavor."},
    {"SUBSTANCE_TYPE_ID": 3, "SUBSTANCE_TYPE_TITLE": "Fat", "SUBSTANCE_TYPE_DESCRIPTION": "Butter and related fats that affect texture and shelf life."},
    {"SUBSTANCE_TYPE_ID": 4, "SUBSTANCE_TYPE_TITLE": "Flavor", "SUBSTANCE_TYPE_DESCRIPTION": "Flavoring ingredients such as vanilla and cinnamon."},
    {"SUBSTANCE_TYPE_ID": 5, "SUBSTANCE_TYPE_TITLE": "Inclusion", "SUBSTANCE_TYPE_DESCRIPTION": "Mix-ins such as chocolate chips, oats, and nuts."},
]

SUBSTANCE_REFERENCE = [
    {"SUBSTANCE_REFERENCE_ID": 1, "SUBSTANCE_NAME": "All-purpose flour", "SUBSTANCE_ID": "ING-FLOUR-AP", "SUBSTANCE_WEIGHT": 24, "SUBSTANCE_DESCRIPTION": "Primary flour used across house cookie bases.", "SUBSTANCE_TYPE_ID": 1},
    {"SUBSTANCE_REFERENCE_ID": 2, "SUBSTANCE_NAME": "Brown sugar", "SUBSTANCE_ID": "ING-SUGAR-BROWN", "SUBSTANCE_WEIGHT": 18, "SUBSTANCE_DESCRIPTION": "Moisture-retaining sweetener used in classic cookie dough.", "SUBSTANCE_TYPE_ID": 2},
    {"SUBSTANCE_REFERENCE_ID": 3, "SUBSTANCE_NAME": "Cultured butter", "SUBSTANCE_ID": "ING-BUTTER-CULTURED", "SUBSTANCE_WEIGHT": 20, "SUBSTANCE_DESCRIPTION": "Premium butter used in rich dough and laminated inclusions.", "SUBSTANCE_TYPE_ID": 3},
    {"SUBSTANCE_REFERENCE_ID": 4, "SUBSTANCE_NAME": "Madagascar vanilla extract", "SUBSTANCE_ID": "ING-VANILLA-MDG", "SUBSTANCE_WEIGHT": 15, "SUBSTANCE_DESCRIPTION": "High-aroma vanilla extract used in signature cookie lines.", "SUBSTANCE_TYPE_ID": 4},
    {"SUBSTANCE_REFERENCE_ID": 5, "SUBSTANCE_NAME": "Semisweet chocolate chips", "SUBSTANCE_ID": "ING-CHOC-SEMI", "SUBSTANCE_WEIGHT": 22, "SUBSTANCE_DESCRIPTION": "Core inclusion for chocolate chip and double chocolate cookies.", "SUBSTANCE_TYPE_ID": 5},
    {"SUBSTANCE_REFERENCE_ID": 6, "SUBSTANCE_NAME": "Sea salt", "SUBSTANCE_ID": "ING-SALT-SEA", "SUBSTANCE_WEIGHT": 8, "SUBSTANCE_DESCRIPTION": "Finishing and balance ingredient used in sweet-savory blends.", "SUBSTANCE_TYPE_ID": 4},
    {"SUBSTANCE_REFERENCE_ID": 7, "SUBSTANCE_NAME": "Rolled oats", "SUBSTANCE_ID": "ING-OATS-ROLLED", "SUBSTANCE_WEIGHT": 14, "SUBSTANCE_DESCRIPTION": "Textural inclusion used in oatmeal cookie programs.", "SUBSTANCE_TYPE_ID": 5},
    {"SUBSTANCE_REFERENCE_ID": 8, "SUBSTANCE_NAME": "Cinnamon", "SUBSTANCE_ID": "ING-CINNAMON", "SUBSTANCE_WEIGHT": 11, "SUBSTANCE_DESCRIPTION": "Warm spice used in snickerdoodle and seasonal cookies.", "SUBSTANCE_TYPE_ID": 4},
    {"SUBSTANCE_REFERENCE_ID": 9, "SUBSTANCE_NAME": "Almond flour", "SUBSTANCE_ID": "ING-FLOUR-ALMOND", "SUBSTANCE_WEIGHT": 17, "SUBSTANCE_DESCRIPTION": "Alternative flour used in gluten-aware cookie lines.", "SUBSTANCE_TYPE_ID": 1},
    {"SUBSTANCE_REFERENCE_ID": 10, "SUBSTANCE_NAME": "Molasses", "SUBSTANCE_ID": "ING-MOLASSES", "SUBSTANCE_WEIGHT": 13, "SUBSTANCE_DESCRIPTION": "Dark sweetener used for ginger and chewy brown cookies.", "SUBSTANCE_TYPE_ID": 2},
]

SUBSTANCE_SOURCING_TYPE = [
    {"SUBSTANCE_SOURCING_TYPE_ID": 1, "SUBSTANCE_SOURCING_TYPE_TITLE": "Catalog family", "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "High-level family or assortment name used in catalogs."},
    {"SUBSTANCE_SOURCING_TYPE_ID": 2, "SUBSTANCE_SOURCING_TYPE_TITLE": "Supplier alias", "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "Localized supplier phrasing used on spec sheets or profiles."},
    {"SUBSTANCE_SOURCING_TYPE_ID": 3, "SUBSTANCE_SOURCING_TYPE_TITLE": "Recipe phrasing", "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "Phrasing used on bakery menus or ingredient lists."},
]

EVIDENCE_TYPE = [
    {"EVIDENCE_TYPE_ID": 1, "EVIDENCE_TYPE_NAME": "Catalog listing"},
    {"EVIDENCE_TYPE_ID": 2, "EVIDENCE_TYPE_NAME": "Ingredient spec sheet"},
    {"EVIDENCE_TYPE_ID": 3, "EVIDENCE_TYPE_NAME": "Bakery menu"},
    {"EVIDENCE_TYPE_ID": 4, "EVIDENCE_TYPE_NAME": "Distributor listing"},
    {"EVIDENCE_TYPE_ID": 5, "EVIDENCE_TYPE_NAME": "Supplier profile"},
]

DATA_SOURCE = [
    {"DATA_SOURCE_ID": 1, "DATA_SOURCE_NAME": "Harbor Batch seasonal cookie menu", "DATA_SOURCE_TYPE": "bakery_menu", "URL": "https://cookie-demo.example/sources/harbor-batch-menu", "DATE_LOGGED": "2026-06-03", "PARENT_DATA_SOURCE_ID": "", "SCRAPE_RUN_ID": "cookie-demo-run-001"},
    {"DATA_SOURCE_ID": 2, "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog", "DATA_SOURCE_TYPE": "catalog", "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog", "DATE_LOGGED": "2026-06-05", "PARENT_DATA_SOURCE_ID": "", "SCRAPE_RUN_ID": "cookie-demo-run-002"},
    {"DATA_SOURCE_ID": 3, "DATA_SOURCE_NAME": "Northwind butter spec sheet", "DATA_SOURCE_TYPE": "ingredient_sheet", "URL": "https://cookie-demo.example/sources/northwind-butter-sheet", "DATE_LOGGED": "2026-06-08", "PARENT_DATA_SOURCE_ID": "", "SCRAPE_RUN_ID": "cookie-demo-run-003"},
    {"DATA_SOURCE_ID": 4, "DATA_SOURCE_NAME": "Maple & Main online ingredient panel", "DATA_SOURCE_TYPE": "bakery_menu", "URL": "https://cookie-demo.example/sources/maple-main-panel", "DATE_LOGGED": "2026-06-10", "PARENT_DATA_SOURCE_ID": "", "SCRAPE_RUN_ID": "cookie-demo-run-004"},
    {"DATA_SOURCE_ID": 5, "DATA_SOURCE_NAME": "Cacao Coast supplier profile", "DATA_SOURCE_TYPE": "supplier_profile", "URL": "https://cookie-demo.example/sources/cacao-coast-profile", "DATE_LOGGED": "2026-06-12", "PARENT_DATA_SOURCE_ID": "", "SCRAPE_RUN_ID": "cookie-demo-run-005"},
    {"DATA_SOURCE_ID": 6, "DATA_SOURCE_NAME": "Golden Crate distribution roster", "DATA_SOURCE_TYPE": "distributor_listing", "URL": "https://cookie-demo.example/sources/golden-crate-roster", "DATE_LOGGED": "2026-06-15", "PARENT_DATA_SOURCE_ID": "", "SCRAPE_RUN_ID": "cookie-demo-run-006"},
    {"DATA_SOURCE_ID": 7, "DATA_SOURCE_NAME": "Bluebird seasonal recipe archive", "DATA_SOURCE_TYPE": "recipe_archive", "URL": "https://cookie-demo.example/sources/bluebird-archive", "DATE_LOGGED": "2026-06-18", "PARENT_DATA_SOURCE_ID": "", "SCRAPE_RUN_ID": "cookie-demo-run-007"},
]

WEIGHTING_TAG_TYPE = [
    {"WEIGHTING_TAG_TYPE_ID": 1, "WEIGHTING_TAG_TYPE_TITLE": "Supply-chain signal"},
]

WEIGHTING_TAG_CATEGORY = [
    {"WEIGHTING_TAG_CATEGORY_ID": 1, "WEIGHTING_TAG_CATEGORY_TITLE": "Product profile", "WEIGHTING_TAG_TYPE_ID": 1},
    {"WEIGHTING_TAG_CATEGORY_ID": 2, "WEIGHTING_TAG_CATEGORY_TITLE": "Operational note", "WEIGHTING_TAG_TYPE_ID": 1},
    {"WEIGHTING_TAG_CATEGORY_ID": 3, "WEIGHTING_TAG_CATEGORY_TITLE": "Seasonality", "WEIGHTING_TAG_TYPE_ID": 1},
]

WEIGHTING_TAG = [
    {"WEIGHTING_TAG_ID": 1, "WEIGHTING_TAG_TITLE": "Signature cookie line", "WEIGHTING_TAG_WEIGHT": 10, "WEIGHTING_TAG_DESCRIPTION": "Appears in a highlighted or signature product line.", "WEIGHTING_TAG_CATEGORY_ID": 1},
    {"WEIGHTING_TAG_ID": 2, "WEIGHTING_TAG_TITLE": "Cold-chain handling", "WEIGHTING_TAG_WEIGHT": 8, "WEIGHTING_TAG_DESCRIPTION": "Requires careful storage or temperature handling.", "WEIGHTING_TAG_CATEGORY_ID": 2},
    {"WEIGHTING_TAG_ID": 3, "WEIGHTING_TAG_TITLE": "Private-label partner", "WEIGHTING_TAG_WEIGHT": 7, "WEIGHTING_TAG_DESCRIPTION": "Supports co-manufacturing or private-label output.", "WEIGHTING_TAG_CATEGORY_ID": 2},
    {"WEIGHTING_TAG_ID": 4, "WEIGHTING_TAG_TITLE": "Seasonal rotation", "WEIGHTING_TAG_WEIGHT": 5, "WEIGHTING_TAG_DESCRIPTION": "Referenced in seasonal or limited-run assortment pages.", "WEIGHTING_TAG_CATEGORY_ID": 3},
    {"WEIGHTING_TAG_ID": 5, "WEIGHTING_TAG_TITLE": "Organic positioning", "WEIGHTING_TAG_WEIGHT": 6, "WEIGHTING_TAG_DESCRIPTION": "Markets an organic or specialty sourcing claim.", "WEIGHTING_TAG_CATEGORY_ID": 1},
]

COMPANY_WEIGHTING_TAG = [
    {"COMPANY_WEIGHTING_TAG_ID": 1, "COMPANY_ID": 1, "WEIGHTING_TAG_ID": 1},
    {"COMPANY_WEIGHTING_TAG_ID": 2, "COMPANY_ID": 2, "WEIGHTING_TAG_ID": 4},
    {"COMPANY_WEIGHTING_TAG_ID": 3, "COMPANY_ID": 5, "WEIGHTING_TAG_ID": 2},
    {"COMPANY_WEIGHTING_TAG_ID": 4, "COMPANY_ID": 7, "WEIGHTING_TAG_ID": 3},
    {"COMPANY_WEIGHTING_TAG_ID": 5, "COMPANY_ID": 10, "WEIGHTING_TAG_ID": 3},
    {"COMPANY_WEIGHTING_TAG_ID": 6, "COMPANY_ID": 11, "WEIGHTING_TAG_ID": 5},
    {"COMPANY_WEIGHTING_TAG_ID": 7, "COMPANY_ID": 12, "WEIGHTING_TAG_ID": 1},
]

LINKAGE_BLUEPRINTS = [
    (1, "Email", "batches@bakehouse-collective.example", 1),
    (2, "Email", "batches@bakehouse-collective.example", 4),
    (10, "Email", "batches@bakehouse-collective.example", 4),
    (11, "Email", "batches@bakehouse-collective.example", 7),
    (3, "Phone", "+1-414-555-0110", 2),
    (5, "Phone", "+1-414-555-0110", 3),
    (9, "Phone", "+1-414-555-0110", 2),
    (7, "Phone", "+1-773-555-0142", 6),
    (8, "Phone", "+1-773-555-0142", 6),
    (4, "Email", "vanilla@pantry-inputs.example", 2),
    (6, "Email", "vanilla@pantry-inputs.example", 5),
    (12, "Email", "coastal-orders@bakehouse-collective.example", 1),
    (1, "Phone", "+1-312-555-0188", 1),
    (7, "Email", "packing@fulfillment-partners.example", 6),
    (8, "Email", "packing@fulfillment-partners.example", 6),
]

ASSOCIATION_BLUEPRINTS = [
    (1, 2, "Email", "batches@bakehouse-collective.example", "Shared production inbox", 4),
    (1, 10, "Email", "batches@bakehouse-collective.example", "Shared production inbox", 4),
    (2, 11, "Email", "batches@bakehouse-collective.example", "Shared production inbox", 7),
    (3, 5, "Phone", "+1-414-555-0110", "Shared procurement phone", 3),
    (3, 9, "Phone", "+1-414-555-0110", "Shared procurement phone", 2),
    (7, 8, "Phone", "+1-773-555-0142", "Shared fulfillment line", 6),
    (4, 6, "Email", "vanilla@pantry-inputs.example", "Shared imports inbox", 5),
    (1, 12, "Phone", "+1-312-555-0188", "Shared bakery office line", 1),
]

COMPANY_INGREDIENT_MAP = {
    1: [1, 2, 3, 4, 5, 6],
    2: [1, 2, 3, 4, 5, 8],
    3: [1, 9],
    4: [4],
    5: [3],
    6: [5, 6, 8],
    7: [5, 6],
    8: [1, 5, 10],
    9: [2, 10],
    10: [1, 2, 3, 5, 10],
    11: [1, 4, 7, 8, 9],
    12: [1, 2, 3, 4, 5, 7],
}

LISTED_NAME_MAP = {
    1: "all-purpose flour",
    2: "dark brown sugar",
    3: "cultured sweet cream butter",
    4: "Madagascar vanilla",
    5: "semisweet chocolate chips",
    6: "flaky sea salt",
    7: "rolled oats",
    8: "ground cinnamon",
    9: "fine almond flour",
    10: "blackstrap molasses",
}

COMPANY_SOURCE_CYCLE = {
    1: [1, 2],
    2: [4, 2],
    3: [2],
    4: [2, 5],
    5: [3],
    6: [5, 2],
    7: [6],
    8: [6],
    9: [2],
    10: [4, 6],
    11: [7, 2],
    12: [1, 6],
}

COMPANY_EVIDENCE_TYPE_CYCLE = {
    1: [3, 1, 2],
    2: [3, 1, 2],
    3: [1, 2],
    4: [5, 2],
    5: [2],
    6: [5, 1],
    7: [4],
    8: [4],
    9: [1],
    10: [3, 4],
    11: [3, 1],
    12: [3, 4],
}


def build_substance_sourcing():
    rows = []
    row_id = 1
    for substance in SUBSTANCE_REFERENCE:
        substance_id = substance["SUBSTANCE_ID"]
        substance_name = substance["SUBSTANCE_NAME"]
        base_category = next(item["SUBSTANCE_TYPE_TITLE"] for item in SUBSTANCE_TYPE if item["SUBSTANCE_TYPE_ID"] == substance["SUBSTANCE_TYPE_ID"])
        rows.append({
            "SUBSTANCE_SOURCING_ID": row_id,
            "SUBSTANCE_ID": substance_id,
            "SUBSTANCE_SOURCING_LOCAL_NAME": substance_name,
            "SUBSTANCE_SOURCING_TYPE_ID": 1,
            "DATA_SOURCE_ID": 2,
            "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
            "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": base_category,
            "SUBSTANCE_SOURCING_REFERENCE": f"{substance_name} catalog family",
        })
        row_id += 1
        rows.append({
            "SUBSTANCE_SOURCING_ID": row_id,
            "SUBSTANCE_ID": substance_id,
            "SUBSTANCE_SOURCING_LOCAL_NAME": LISTED_NAME_MAP[substance["SUBSTANCE_REFERENCE_ID"]],
            "SUBSTANCE_SOURCING_TYPE_ID": 3,
            "DATA_SOURCE_ID": 1 if substance["SUBSTANCE_REFERENCE_ID"] % 2 else 4,
            "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
            "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": base_category,
            "SUBSTANCE_SOURCING_REFERENCE": f"Observed menu phrasing for {substance_name}",
        })
        row_id += 1
    return rows


def build_evidence_rows():
    start = date(2026, 6, 1)
    rows = []
    row_id = 1
    company_lookup = {row["COMPANY_ID"]: row for row in COMPANIES}
    source_lookup = {row["DATA_SOURCE_ID"]: row for row in DATA_SOURCE}
    ingredient_lookup = {row["SUBSTANCE_REFERENCE_ID"]: row for row in SUBSTANCE_REFERENCE}
    for company_id, ingredient_ids in COMPANY_INGREDIENT_MAP.items():
        source_cycle = COMPANY_SOURCE_CYCLE[company_id]
        evidence_cycle = COMPANY_EVIDENCE_TYPE_CYCLE[company_id]
        for index, ingredient_id in enumerate(ingredient_ids):
            source_id = source_cycle[index % len(source_cycle)]
            evidence_type_id = evidence_cycle[index % len(evidence_cycle)]
            source = source_lookup[source_id]
            ingredient = ingredient_lookup[ingredient_id]
            company = company_lookup[company_id]
            logged_on = start + timedelta(days=((company_id * 2) + index) % 24)
            rows.append({
                "EVIDENCE_ID": row_id,
                "COMPANY_ID": company_id,
                "SUBSTANCE_REFERENCE_ID": ingredient_id,
                "EVIDENCE_TYPE_ID": evidence_type_id,
                "DATA_SOURCE_ID": source_id,
                "LISTED_NAME_SUBSTANCE": LISTED_NAME_MAP[ingredient_id],
                "REGION": company["PRC_HOME_BASE"],
                "EVIDENCE_WEIGHT": ingredient["SUBSTANCE_WEIGHT"] + (evidence_type_id * 2) + (company_id % 3),
                "URL": f"{source['URL']}#record-{row_id}",
                "RECORD_ID": f"cookie-demo-{company_id:02d}-{ingredient_id:02d}-{row_id:03d}",
                "DATE_LOGGED": logged_on.isoformat(),
                "SCRAPE_RUN_ID": source["SCRAPE_RUN_ID"],
            })
            row_id += 1
    return rows


def build_linkages():
    rows = []
    for row_id, (company_id, method, value, source_id) in enumerate(LINKAGE_BLUEPRINTS, start=1):
        rows.append({
            "LINKAGEID": row_id,
            "COMPANY_ID": company_id,
            "LINKAGE_METHOD": method,
            "Linkage_Value_Type": "Email" if method == "Email" else "Phone",
            "LINKAGE_VALUE": value,
            "DATA_SOURCE_ID": source_id,
        })
    return rows


def build_associations():
    rows = []
    for row_id, (company_id, associated_company_id, method, value, linkage_type, source_id) in enumerate(ASSOCIATION_BLUEPRINTS, start=1):
        rows.append({
            "ASSOCIATIONID": row_id,
            "COMPANY_ID": company_id,
            "ASSOCIATED_COMPANY_ID": associated_company_id,
            "LINKAGE_METHOD": method,
            "LINKAGE_VALUE": value,
            "LINKAGE_TYPE": linkage_type,
            "DATA_SOURCE_ID": source_id,
        })
    return rows


def build_evidence_weighting(evidence_rows):
    rows = []
    tag_pairs = {
        1: [1],
        3: [2],
        5: [5],
        10: [3],
        12: [4],
    }
    row_id = 1
    for evidence in evidence_rows:
        for substance_id, tag_ids in tag_pairs.items():
            if evidence["SUBSTANCE_REFERENCE_ID"] == substance_id:
                for tag_id in tag_ids:
                    rows.append({
                        "EVIDENCE_WEIGHTING_TAG_ID": row_id,
                        "EVIDENCE_ID": evidence["EVIDENCE_ID"],
                        "WEIGHTING_TAG_ID": tag_id,
                    })
                    row_id += 1
    return rows


def build_substance_weighting():
    return [
        {"SUBSTANCE_WEIGHTING_TAG_ID": 1, "SUBSTANCE_REFERENCE_ID": 1, "WEIGHTING_TAG_ID": 1},
        {"SUBSTANCE_WEIGHTING_TAG_ID": 2, "SUBSTANCE_REFERENCE_ID": 3, "WEIGHTING_TAG_ID": 2},
        {"SUBSTANCE_WEIGHTING_TAG_ID": 3, "SUBSTANCE_REFERENCE_ID": 5, "WEIGHTING_TAG_ID": 1},
        {"SUBSTANCE_WEIGHTING_TAG_ID": 4, "SUBSTANCE_REFERENCE_ID": 9, "WEIGHTING_TAG_ID": 5},
    ]


def derive_tables():
    substance_sourcing = build_substance_sourcing()
    evidence = build_evidence_rows()
    linkages = build_linkages()
    associations = build_associations()
    evidence_weighting = build_evidence_weighting(evidence)
    substance_weighting = build_substance_weighting()

    company_by_id = {row["COMPANY_ID"]: row for row in COMPANIES}
    ingredient_by_id = {row["SUBSTANCE_REFERENCE_ID"]: row for row in SUBSTANCE_REFERENCE}
    source_by_id = {row["DATA_SOURCE_ID"]: row for row in DATA_SOURCE}
    evidence_type_by_id = {row["EVIDENCE_TYPE_ID"]: row for row in EVIDENCE_TYPE}
    tag_by_id = {row["WEIGHTING_TAG_ID"]: row for row in WEIGHTING_TAG}
    consolidated_by_id = {row["CONSOLIDATED_NAME_ID"]: row for row in CONSOLIDATED_COMPANY}

    evidence_summary_bucket = defaultdict(lambda: {"evidence_count": 0, "total_weight": 0})
    for row in evidence:
        bucket = evidence_summary_bucket[(row["COMPANY_ID"], row["SUBSTANCE_REFERENCE_ID"], row["EVIDENCE_TYPE_ID"])]
        bucket["evidence_count"] += 1
        bucket["total_weight"] += row["EVIDENCE_WEIGHT"]
    evidence_summary = [
        {
            "COMPANY_ID": company_id,
            "SUBSTANCE_REFERENCE_ID": substance_id,
            "EVIDENCE_TYPE_ID": evidence_type_id,
            "evidence_count": values["evidence_count"],
            "total_weight": values["total_weight"],
        }
        for (company_id, substance_id, evidence_type_id), values in sorted(evidence_summary_bucket.items())
    ]

    connection_counts = Counter()
    for row in associations:
        connection_counts[row["COMPANY_ID"]] += 1
        connection_counts[row["ASSOCIATED_COMPANY_ID"]] += 1
    company_network_size = [
        {
            **company,
            "connection_count": connection_counts.get(company["COMPANY_ID"], 0),
        }
        for company in COMPANIES
    ]

    company_tag_scores = Counter()
    for row in COMPANY_WEIGHTING_TAG:
        company_tag_scores[row["COMPANY_ID"]] += tag_by_id[row["WEIGHTING_TAG_ID"]]["WEIGHTING_TAG_WEIGHT"]

    evidence_counts = Counter()
    substances_linked = defaultdict(set)
    evidence_scores = Counter()
    substance_scores = Counter()
    for row in evidence:
        company_id = row["COMPANY_ID"]
        evidence_counts[company_id] += 1
        evidence_scores[company_id] += row["EVIDENCE_WEIGHT"]
        substance_scores[company_id] += ingredient_by_id[row["SUBSTANCE_REFERENCE_ID"]]["SUBSTANCE_WEIGHT"]
        substances_linked[company_id].add(row["SUBSTANCE_REFERENCE_ID"])

    company_score_v2 = []
    company_evaluation = []
    for company in COMPANIES:
        company_id = company["COMPANY_ID"]
        evidence_score = evidence_scores[company_id]
        substance_score = substance_scores[company_id]
        tag_score = company_tag_scores[company_id]
        total_score = evidence_score + tag_score + round(substance_score * 0.35)
        legacy_score = evidence_score + tag_score
        row = {
            **company,
            "evidence_score": evidence_score,
            "substance_score": substance_score,
            "company_tag_score": tag_score,
            "total_score_v2": total_score,
            "legacy_score": legacy_score,
            "evidence_count": evidence_counts[company_id],
            "substances_linked": len(substances_linked[company_id]),
        }
        company_score_v2.append(row)
        company_evaluation.append({
            "COMPANY_ID": company_id,
            "COMPANY_NAME": company["COMPANY_NAME"],
            "EVIDENCE_COMPANY_WEIGHT": evidence_score,
            "TOTAL_WEIGHT": total_score,
        })
    company_score_v2.sort(key=lambda row: row["total_score_v2"], reverse=True)

    ds_bucket = defaultdict(int)
    for row in evidence:
        source = source_by_id[row["DATA_SOURCE_ID"]]
        ds_bucket[(row["SUBSTANCE_REFERENCE_ID"], source["DATA_SOURCE_NAME"], source["DATA_SOURCE_TYPE"])] += 1
    substance_datasource_summary = [
        {
            "SUBSTANCE_REFERENCE_ID": substance_id,
            "DATA_SOURCE_NAME": source_name,
            "DATA_SOURCE_TYPE": source_type,
            "mention_count": count,
        }
        for (substance_id, source_name, source_type), count in sorted(ds_bucket.items(), key=lambda item: (-item[1], item[0][0]))
    ]

    evidence_readable = []
    for row in evidence:
        company = company_by_id[row["COMPANY_ID"]]
        ingredient = ingredient_by_id[row["SUBSTANCE_REFERENCE_ID"]]
        evidence_type = evidence_type_by_id[row["EVIDENCE_TYPE_ID"]]
        source = source_by_id[row["DATA_SOURCE_ID"]]
        evidence_readable.append({
            **row,
            "company_name": company["COMPANY_NAME"],
            "substance_name": ingredient["SUBSTANCE_NAME"],
            "evidence_type": evidence_type["EVIDENCE_TYPE_NAME"],
            "data_source": source["DATA_SOURCE_NAME"],
        })

    association_readable = []
    for row in associations:
        association_readable.append({
            **row,
            "company_name": company_by_id[row["COMPANY_ID"]]["COMPANY_NAME"],
            "associated_company_name": company_by_id[row["ASSOCIATED_COMPANY_ID"]]["COMPANY_NAME"],
        })

    consolidated_company_readable = []
    for row_id, row in enumerate(COMPANY_CONSOLIDATED_MAP, start=1):
        consolidated_company_readable.append({
            "CONSOLIDATED_COMPANY_ID": row_id,
            "CONSOLIDATED_NAME": consolidated_by_id[row["CONSOLIDATED_COMPANY_ID"]]["CONSOLIDATED_NAME"],
            "COMPANY_NAME": company_by_id[row["COMPANY_ID"]]["COMPANY_NAME"],
            "COMPANY_ID": row["COMPANY_ID"],
        })

    return {
        "company": COMPANIES,
        "consolidated_company": CONSOLIDATED_COMPANY,
        "company_consolidated_map": COMPANY_CONSOLIDATED_MAP,
        "substance_reference": SUBSTANCE_REFERENCE,
        "substance_type": SUBSTANCE_TYPE,
        "substance_sourcing_type": SUBSTANCE_SOURCING_TYPE,
        "substance_sourcing": substance_sourcing,
        "evidence": evidence,
        "evidence_type": EVIDENCE_TYPE,
        "data_source": DATA_SOURCE,
        "linkage": linkages,
        "association": associations,
        "weighting_tag_type": WEIGHTING_TAG_TYPE,
        "weighting_tag_category": WEIGHTING_TAG_CATEGORY,
        "weighting_tag": WEIGHTING_TAG,
        "company_weighting_tag": COMPANY_WEIGHTING_TAG,
        "evidence_weighting_tag": evidence_weighting,
        "substance_weighting_tag": substance_weighting,
        "company_evaluation": company_evaluation,
        "evidence_summary": evidence_summary,
        "company_network_size": company_network_size,
        "company_score_v2": company_score_v2,
        "substance_datasource_summary": substance_datasource_summary,
        "evidence_readable": evidence_readable,
        "association_readable": association_readable,
        "consolidated_company_readable": consolidated_company_readable,
        "rpcs": {
            "get_evidence_total": len(evidence),
            "get_company_count": len(COMPANIES),
            "get_association_count": len(associations),
        },
    }


def write_csv(table_name, rows):
    path = CSV_DIR / f"{table_name.upper()}.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_seed_sql(dataset):
    ordered_tables = [
        "company",
        "consolidated_company",
        "company_consolidated_map",
        "substance_type",
        "substance_reference",
        "substance_sourcing_type",
        "substance_sourcing",
        "evidence_type",
        "data_source",
        "weighting_tag_type",
        "weighting_tag_category",
        "weighting_tag",
        "company_weighting_tag",
        "linkage",
        "association",
        "evidence",
        "evidence_weighting_tag",
        "substance_weighting_tag",
    ]
    statements = [
        "-- Cookie demo seed data",
        "-- The demo dataset is synthetic and does not contain TraCCC source records.",
    ]
    for table_name in ordered_tables:
        rows = dataset[table_name]
        statements.append(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;")
        if not rows:
            continue
        columns = list(rows[0].keys())
        values = ",\n".join(
            "(" + ", ".join(sql_literal(row[column]) for column in columns) + ")"
            for row in rows
        )
        statements.append(
            f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES\n{values};"
        )
    (SQL_DIR / "01_cookie_demo_seed.sql").write_text("\n\n".join(statements) + "\n", encoding="utf-8")


def write_compatibility_sql():
    sql = """-- Cookie demo compatibility views and lightweight RPCs.
-- These keep the demo frontend query surface stable when the benign seed
-- data is loaded into a Supabase/Postgres environment.

create or replace view evidence_summary as
select
  "COMPANY_ID",
  "SUBSTANCE_REFERENCE_ID",
  "EVIDENCE_TYPE_ID",
  count(*)::int as evidence_count,
  coalesce(sum("EVIDENCE_WEIGHT"), 0)::int as total_weight
from evidence
group by 1, 2, 3;

create or replace view company_network_size as
with company_connection_counts as (
  select "COMPANY_ID" as company_id, count(*)::int as count_value
  from association
  group by 1
  union all
  select "ASSOCIATED_COMPANY_ID" as company_id, count(*)::int as count_value
  from association
  group by 1
)
select
  c.*,
  coalesce(sum(cc.count_value), 0)::int as connection_count
from company c
left join company_connection_counts cc on cc.company_id = c."COMPANY_ID"
group by c."COMPANY_ID", c."COMPANY_NAME", c."CHINESE_NAME", c."ACTIVE_INACTIVE", c."BUSINESS_TYPE", c."PRC_HOME_BASE", c."GOV_COMPLICITY";

create or replace view company_score_v2 as
with evidence_rollup as (
  select
    e."COMPANY_ID",
    coalesce(sum(e."EVIDENCE_WEIGHT"), 0)::int as evidence_score,
    count(*)::int as evidence_count,
    count(distinct e."SUBSTANCE_REFERENCE_ID")::int as substances_linked
  from evidence e
  group by 1
),
substance_rollup as (
  select
    e."COMPANY_ID",
    coalesce(sum(sr."SUBSTANCE_WEIGHT"), 0)::int as substance_score
  from evidence e
  join substance_reference sr on sr."SUBSTANCE_REFERENCE_ID" = e."SUBSTANCE_REFERENCE_ID"
  group by 1
),
tag_rollup as (
  select
    cwt."COMPANY_ID",
    coalesce(sum(wt."WEIGHTING_TAG_WEIGHT"), 0)::int as company_tag_score
  from company_weighting_tag cwt
  join weighting_tag wt on wt."WEIGHTING_TAG_ID" = cwt."WEIGHTING_TAG_ID"
  group by 1
)
select
  c.*,
  coalesce(er.evidence_score, 0)::int as evidence_score,
  coalesce(sr.substance_score, 0)::int as substance_score,
  coalesce(tr.company_tag_score, 0)::int as company_tag_score,
  (coalesce(er.evidence_score, 0) + round(coalesce(sr.substance_score, 0) * 0.35) + coalesce(tr.company_tag_score, 0))::int as total_score_v2,
  (coalesce(er.evidence_score, 0) + coalesce(tr.company_tag_score, 0))::int as legacy_score,
  coalesce(er.evidence_count, 0)::int as evidence_count,
  coalesce(er.substances_linked, 0)::int as substances_linked
from company c
left join evidence_rollup er on er."COMPANY_ID" = c."COMPANY_ID"
left join substance_rollup sr on sr."COMPANY_ID" = c."COMPANY_ID"
left join tag_rollup tr on tr."COMPANY_ID" = c."COMPANY_ID";

create or replace view company_evaluation as
select
  "COMPANY_ID",
  "COMPANY_NAME",
  evidence_score as "EVIDENCE_COMPANY_WEIGHT",
  total_score_v2 as "TOTAL_WEIGHT"
from company_score_v2;

create or replace view evidence_readable as
select
  e.*,
  c."COMPANY_NAME" as company_name,
  sr."SUBSTANCE_NAME" as substance_name,
  et."EVIDENCE_TYPE_NAME" as evidence_type,
  ds."DATA_SOURCE_NAME" as data_source
from evidence e
join company c on c."COMPANY_ID" = e."COMPANY_ID"
join substance_reference sr on sr."SUBSTANCE_REFERENCE_ID" = e."SUBSTANCE_REFERENCE_ID"
join evidence_type et on et."EVIDENCE_TYPE_ID" = e."EVIDENCE_TYPE_ID"
join data_source ds on ds."DATA_SOURCE_ID" = e."DATA_SOURCE_ID";

create or replace view association_readable as
select
  a.*,
  c."COMPANY_NAME" as company_name,
  ac."COMPANY_NAME" as associated_company_name
from association a
join company c on c."COMPANY_ID" = a."COMPANY_ID"
join company ac on ac."COMPANY_ID" = a."ASSOCIATED_COMPANY_ID";

create or replace view consolidated_company_readable as
select
  row_number() over (order by ccm."CONSOLIDATED_COMPANY_ID", ccm."COMPANY_ID")::int as "CONSOLIDATED_COMPANY_ID",
  cc."CONSOLIDATED_NAME",
  c."COMPANY_NAME",
  c."COMPANY_ID"
from company_consolidated_map ccm
join consolidated_company cc on cc."CONSOLIDATED_NAME_ID" = ccm."CONSOLIDATED_COMPANY_ID"
join company c on c."COMPANY_ID" = ccm."COMPANY_ID";

create or replace view substance_datasource_summary as
select
  e."SUBSTANCE_REFERENCE_ID",
  ds."DATA_SOURCE_NAME",
  ds."DATA_SOURCE_TYPE",
  count(*)::int as mention_count
from evidence e
join data_source ds on ds."DATA_SOURCE_ID" = e."DATA_SOURCE_ID"
group by 1, 2, 3;

create or replace function get_evidence_total()
returns int language sql stable as $$
  select count(*)::int from evidence;
$$;

create or replace function get_company_count()
returns int language sql stable as $$
  select count(*)::int from company;
$$;

create or replace function get_association_count()
returns int language sql stable as $$
  select count(*)::int from association;
$$;
"""
    (SQL_DIR / "02_cookie_demo_compat_views.sql").write_text(sql, encoding="utf-8")


def write_frontend_module(dataset):
    payload = {
        "metadata": {
            "name": "Scrape & Bake",
            "seedVersion": "2026-07-03",
            "description": "Synthetic cookie ingredient supply-chain demo dataset.",
            "evidenceRowCount": len(dataset["evidence"]),
        },
        "tables": dataset,
    }
    FRONTEND_DATA_FILE.write_text(
        "export const DEMO_DATA = " + json.dumps(payload, indent=2) + ";\n\nexport default DEMO_DATA;\n",
        encoding="utf-8",
    )


def main():
    dataset = derive_tables()
    for table_name, rows in dataset.items():
        if table_name == "rpcs":
            continue
        write_csv(table_name, rows)
    write_seed_sql(dataset)
    write_compatibility_sql()
    write_frontend_module(dataset)
    print(
        json.dumps(
            {
                "csv_tables": len([name for name in dataset if name != "rpcs"]),
                "evidence_rows": len(dataset["evidence"]),
                "company_rows": len(dataset["company"]),
                "association_rows": len(dataset["association"]),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
