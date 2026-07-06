#!/usr/bin/env python3
"""Generate a multi-run synthetic Scrape & Bake demo dataset.

This script writes:
- seed CSVs for schema-compatible core and support tables
- SQL seed and compatibility view files
- a frontend demo data module used by the local mock adapter
- synthetic scrape fixture output folders for public walkthroughs
"""

from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSV_DIR = ROOT / "data" / "seed" / "csv"
SQL_DIR = ROOT / "data" / "seed" / "sql"
FRONTEND_DATA_FILE = ROOT / "frontend" / "src" / "data" / "demoData.js"
SCRAPER_OUTPUT_DIR = ROOT / "scraper_output"


def sql_literal(value):
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


SCRAPE_RUNS = [
    {
        "id": "2026-04-01_bakeryboard",
        "date": "2026-04-01",
        "platform": "BakeryBoard",
        "label": "2026-04-01 BakeryBoard",
        "narrative": "BakeryBoard established the initial bakery-product ingredient map.",
    },
    {
        "id": "2026-04-15_ingredienthub",
        "date": "2026-04-15",
        "platform": "IngredientHub",
        "label": "2026-04-15 IngredientHub",
        "narrative": "IngredientHub added supplier-side evidence for vanilla, flour, chocolate, oats, butter, and sugar.",
    },
    {
        "id": "2026-05-01_wholesalecrumb",
        "date": "2026-05-01",
        "platform": "WholesaleCrumb",
        "label": "2026-05-01 WholesaleCrumb",
        "narrative": "WholesaleCrumb connected bakeries and suppliers through one shared distributor.",
    },
    {
        "id": "2026-05-20_certibake_registry",
        "date": "2026-05-20",
        "platform": "CertiBake Registry",
        "label": "2026-05-20 CertiBake Registry",
        "narrative": "CertiBake Registry added public claim and allergen statement evidence.",
    },
    {
        "id": "2026-06-10_bakeryboard_refresh",
        "date": "2026-06-10",
        "platform": "BakeryBoard Refresh",
        "label": "2026-06-10 BakeryBoard Refresh",
        "narrative": "BakeryBoard Refresh added new bakery evidence and made Golden Grain Supply more central.",
    },
]

RUN_BY_ID = {run["id"]: run for run in SCRAPE_RUNS}
RUN_INDEX = {run["id"]: index for index, run in enumerate(SCRAPE_RUNS)}

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
        "GOV_COMPLICITY": "Neighborhood bakery",
    },
    {
        "COMPANY_ID": 3,
        "COMPANY_NAME": "Bluebird Oven Foods",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Pacific Northwest",
        "GOV_COMPLICITY": "Regional bakery",
    },
    {
        "COMPANY_ID": 4,
        "COMPANY_NAME": "Seaside Biscuit Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Southeast",
        "GOV_COMPLICITY": "Coastal bakery",
    },
    {
        "COMPANY_ID": 5,
        "COMPANY_NAME": "Golden Grain Supply",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Great Lakes",
        "GOV_COMPLICITY": "Flour supplier",
    },
    {
        "COMPANY_ID": 6,
        "COMPANY_NAME": "Orchard Vanilla Imports",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "East Coast",
        "GOV_COMPLICITY": "Vanilla importer",
    },
    {
        "COMPANY_ID": 7,
        "COMPANY_NAME": "Northwind Butter Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Wisconsin",
        "GOV_COMPLICITY": "Butter producer",
    },
    {
        "COMPANY_ID": 8,
        "COMPANY_NAME": "Cacao Coast Ingredients",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "West Coast",
        "GOV_COMPLICITY": "Chocolate supplier",
    },
    {
        "COMPANY_ID": 9,
        "COMPANY_NAME": "Clover Cane Sugars",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Gulf Coast",
        "GOV_COMPLICITY": "Sugar supplier",
    },
    {
        "COMPANY_ID": 10,
        "COMPANY_NAME": "Meadow Oat Collective",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Upper Midwest",
        "GOV_COMPLICITY": "Oat supplier",
    },
    {
        "COMPANY_ID": 11,
        "COMPANY_NAME": "Golden Crate Logistics",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Distributor",
        "PRC_HOME_BASE": "National",
        "GOV_COMPLICITY": "Wholesale distributor",
    },
    {
        "COMPANY_ID": 12,
        "COMPANY_NAME": "CertiBake Registry",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Source Entity",
        "PRC_HOME_BASE": "National",
        "GOV_COMPLICITY": "Public claims registry",
    },
]

CONSOLIDATED_COMPANY = [
    {"CONSOLIDATED_NAME_ID": 1, "CONSOLIDATED_NAME": "Bakery Network"},
    {"CONSOLIDATED_NAME_ID": 2, "CONSOLIDATED_NAME": "Ingredient Partners"},
    {"CONSOLIDATED_NAME_ID": 3, "CONSOLIDATED_NAME": "Movement & Registry"},
]

COMPANY_CONSOLIDATED_MAP = [
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 1},
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 2},
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 3},
    {"CONSOLIDATED_COMPANY_ID": 1, "COMPANY_ID": 4},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 5},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 6},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 7},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 8},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 9},
    {"CONSOLIDATED_COMPANY_ID": 2, "COMPANY_ID": 10},
    {"CONSOLIDATED_COMPANY_ID": 3, "COMPANY_ID": 11},
    {"CONSOLIDATED_COMPANY_ID": 3, "COMPANY_ID": 12},
]

SUBSTANCE_TYPE = [
    {
        "SUBSTANCE_TYPE_ID": 1,
        "SUBSTANCE_TYPE_TITLE": "Flour",
        "SUBSTANCE_TYPE_DESCRIPTION": "Flour ingredients used across cookie dough bases.",
    },
    {
        "SUBSTANCE_TYPE_ID": 2,
        "SUBSTANCE_TYPE_TITLE": "Flavor",
        "SUBSTANCE_TYPE_DESCRIPTION": "Flavor ingredients used for aroma and profile notes.",
    },
    {
        "SUBSTANCE_TYPE_ID": 3,
        "SUBSTANCE_TYPE_TITLE": "Inclusion",
        "SUBSTANCE_TYPE_DESCRIPTION": "Ingredient inclusions mixed into finished cookie dough.",
    },
    {
        "SUBSTANCE_TYPE_ID": 4,
        "SUBSTANCE_TYPE_TITLE": "Fat",
        "SUBSTANCE_TYPE_DESCRIPTION": "Butter and other fat ingredients used for texture.",
    },
    {
        "SUBSTANCE_TYPE_ID": 5,
        "SUBSTANCE_TYPE_TITLE": "Sweetener",
        "SUBSTANCE_TYPE_DESCRIPTION": "Sweet ingredients used in dough and finish blends.",
    },
]

SUBSTANCE_REFERENCE = [
    {
        "SUBSTANCE_REFERENCE_ID": 1,
        "SUBSTANCE_NAME": "All-purpose flour",
        "SUBSTANCE_ID": "ING-FLOUR-AP",
        "SUBSTANCE_WEIGHT": 24,
        "SUBSTANCE_DESCRIPTION": "Core flour used in classic cookie dough.",
        "SUBSTANCE_TYPE_ID": 1,
    },
    {
        "SUBSTANCE_REFERENCE_ID": 2,
        "SUBSTANCE_NAME": "Madagascar vanilla extract",
        "SUBSTANCE_ID": "ING-VANILLA-MDG",
        "SUBSTANCE_WEIGHT": 16,
        "SUBSTANCE_DESCRIPTION": "Vanilla ingredient used in bakery and supplier pages.",
        "SUBSTANCE_TYPE_ID": 2,
    },
    {
        "SUBSTANCE_REFERENCE_ID": 3,
        "SUBSTANCE_NAME": "Semisweet chocolate chips",
        "SUBSTANCE_ID": "ING-CHOC-SEMI",
        "SUBSTANCE_WEIGHT": 22,
        "SUBSTANCE_DESCRIPTION": "Chocolate inclusion used across multiple cookie lines.",
        "SUBSTANCE_TYPE_ID": 3,
    },
    {
        "SUBSTANCE_REFERENCE_ID": 4,
        "SUBSTANCE_NAME": "Cultured butter",
        "SUBSTANCE_ID": "ING-BUTTER-CULTURED",
        "SUBSTANCE_WEIGHT": 20,
        "SUBSTANCE_DESCRIPTION": "Butter ingredient used for richer doughs and shortbread styles.",
        "SUBSTANCE_TYPE_ID": 4,
    },
    {
        "SUBSTANCE_REFERENCE_ID": 5,
        "SUBSTANCE_NAME": "Brown sugar",
        "SUBSTANCE_ID": "ING-SUGAR-BROWN",
        "SUBSTANCE_WEIGHT": 18,
        "SUBSTANCE_DESCRIPTION": "Sweetener used in chewy cookie profiles.",
        "SUBSTANCE_TYPE_ID": 5,
    },
    {
        "SUBSTANCE_REFERENCE_ID": 6,
        "SUBSTANCE_NAME": "Rolled oats",
        "SUBSTANCE_ID": "ING-OATS-ROLLED",
        "SUBSTANCE_WEIGHT": 14,
        "SUBSTANCE_DESCRIPTION": "Oat inclusion used in bakery and supplier pages.",
        "SUBSTANCE_TYPE_ID": 3,
    },
    {
        "SUBSTANCE_REFERENCE_ID": 7,
        "SUBSTANCE_NAME": "Sea salt",
        "SUBSTANCE_ID": "ING-SALT-SEA",
        "SUBSTANCE_WEIGHT": 9,
        "SUBSTANCE_DESCRIPTION": "Finishing salt used in sweet-savory cookie pages.",
        "SUBSTANCE_TYPE_ID": 2,
    },
    {
        "SUBSTANCE_REFERENCE_ID": 8,
        "SUBSTANCE_NAME": "Almond flour",
        "SUBSTANCE_ID": "ING-FLOUR-ALMOND",
        "SUBSTANCE_WEIGHT": 17,
        "SUBSTANCE_DESCRIPTION": "Alternative flour used in specialty cookie batches.",
        "SUBSTANCE_TYPE_ID": 1,
    },
]

SUBSTANCE_SOURCING_TYPE = [
    {
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "SUBSTANCE_SOURCING_TYPE_TITLE": "Catalog family",
        "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "High-level family phrasing used in catalog pages.",
    },
    {
        "SUBSTANCE_SOURCING_TYPE_ID": 2,
        "SUBSTANCE_SOURCING_TYPE_TITLE": "Supplier alias",
        "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "Supplier-facing local phrasing or shorthand.",
    },
    {
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "SUBSTANCE_SOURCING_TYPE_TITLE": "Recipe phrasing",
        "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "Bakery-facing ingredient phrasing used in menus and labels.",
    },
]

EVIDENCE_TYPE = [
    {"EVIDENCE_TYPE_ID": 1, "EVIDENCE_TYPE_NAME": "Bakery menu"},
    {"EVIDENCE_TYPE_ID": 2, "EVIDENCE_TYPE_NAME": "Supplier catalog"},
    {"EVIDENCE_TYPE_ID": 3, "EVIDENCE_TYPE_NAME": "Ingredient spec sheet"},
    {"EVIDENCE_TYPE_ID": 4, "EVIDENCE_TYPE_NAME": "Distributor listing"},
    {"EVIDENCE_TYPE_ID": 5, "EVIDENCE_TYPE_NAME": "Public claim registry"},
]

WEIGHTING_TAG_TYPE = [
    {"WEIGHTING_TAG_TYPE_ID": 1, "WEIGHTING_TAG_TYPE_TITLE": "Supply-chain signal"},
]

WEIGHTING_TAG_CATEGORY = [
    {"WEIGHTING_TAG_CATEGORY_ID": 1, "WEIGHTING_TAG_CATEGORY_TITLE": "Product line", "WEIGHTING_TAG_TYPE_ID": 1},
    {"WEIGHTING_TAG_CATEGORY_ID": 2, "WEIGHTING_TAG_CATEGORY_TITLE": "Handling note", "WEIGHTING_TAG_TYPE_ID": 1},
    {"WEIGHTING_TAG_CATEGORY_ID": 3, "WEIGHTING_TAG_CATEGORY_TITLE": "Public claim", "WEIGHTING_TAG_TYPE_ID": 1},
]

WEIGHTING_TAG = [
    {
        "WEIGHTING_TAG_ID": 1,
        "WEIGHTING_TAG_TITLE": "Signature batch",
        "WEIGHTING_TAG_WEIGHT": 10,
        "WEIGHTING_TAG_DESCRIPTION": "Appears in a featured or signature product line.",
        "WEIGHTING_TAG_CATEGORY_ID": 1,
    },
    {
        "WEIGHTING_TAG_ID": 2,
        "WEIGHTING_TAG_TITLE": "Cold-chain handling",
        "WEIGHTING_TAG_WEIGHT": 7,
        "WEIGHTING_TAG_DESCRIPTION": "Requires chilled handling or careful storage.",
        "WEIGHTING_TAG_CATEGORY_ID": 2,
    },
    {
        "WEIGHTING_TAG_ID": 3,
        "WEIGHTING_TAG_TITLE": "Organic claim",
        "WEIGHTING_TAG_WEIGHT": 6,
        "WEIGHTING_TAG_DESCRIPTION": "Appears with an organic or ingredient-origin claim.",
        "WEIGHTING_TAG_CATEGORY_ID": 3,
    },
]

COMPANY_WEIGHTING_TAG = [
    {"COMPANY_WEIGHTING_TAG_ID": 1, "COMPANY_ID": 1, "WEIGHTING_TAG_ID": 1},
    {"COMPANY_WEIGHTING_TAG_ID": 2, "COMPANY_ID": 3, "WEIGHTING_TAG_ID": 1},
    {"COMPANY_WEIGHTING_TAG_ID": 3, "COMPANY_ID": 7, "WEIGHTING_TAG_ID": 2},
    {"COMPANY_WEIGHTING_TAG_ID": 4, "COMPANY_ID": 12, "WEIGHTING_TAG_ID": 3},
]

DATA_SOURCES = [
    {
        "DATA_SOURCE_ID": 1,
        "DATA_SOURCE_NAME": "Harbor Batch spring cookie board",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "URL": "https://cookie-demo.example/bakeryboard/harbor-batch-spring-board",
        "DATE_LOGGED": "2026-04-01",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-01_bakeryboard",
        "SOURCE_PLATFORM": "BakeryBoard",
        "OBSERVED_AT": "2026-04-01",
        "FIRST_SEEN_AT": "2026-04-01",
        "LAST_SEEN_AT": "2026-04-01",
    },
    {
        "DATA_SOURCE_ID": 2,
        "DATA_SOURCE_NAME": "Maple & Main cookie board",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "URL": "https://cookie-demo.example/bakeryboard/maple-main-cookie-board",
        "DATE_LOGGED": "2026-04-01",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-01_bakeryboard",
        "SOURCE_PLATFORM": "BakeryBoard",
        "OBSERVED_AT": "2026-04-01",
        "FIRST_SEEN_AT": "2026-04-01",
        "LAST_SEEN_AT": "2026-04-01",
    },
    {
        "DATA_SOURCE_ID": 3,
        "DATA_SOURCE_NAME": "Bluebird oatmeal board",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "URL": "https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board",
        "DATE_LOGGED": "2026-04-01",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-01_bakeryboard",
        "SOURCE_PLATFORM": "BakeryBoard",
        "OBSERVED_AT": "2026-04-01",
        "FIRST_SEEN_AT": "2026-04-01",
        "LAST_SEEN_AT": "2026-04-01",
    },
    {
        "DATA_SOURCE_ID": 4,
        "DATA_SOURCE_NAME": "Golden Grain Supply catalog",
        "DATA_SOURCE_TYPE": "supplier_catalog",
        "URL": "https://cookie-demo.example/ingredienthub/golden-grain-catalog",
        "DATE_LOGGED": "2026-04-15",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-15_ingredienthub",
        "SOURCE_PLATFORM": "IngredientHub",
        "OBSERVED_AT": "2026-04-15",
        "FIRST_SEEN_AT": "2026-04-15",
        "LAST_SEEN_AT": "2026-04-15",
    },
    {
        "DATA_SOURCE_ID": 5,
        "DATA_SOURCE_NAME": "Orchard Vanilla Imports catalog",
        "DATA_SOURCE_TYPE": "supplier_catalog",
        "URL": "https://cookie-demo.example/ingredienthub/orchard-vanilla-catalog",
        "DATE_LOGGED": "2026-04-15",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-15_ingredienthub",
        "SOURCE_PLATFORM": "IngredientHub",
        "OBSERVED_AT": "2026-04-15",
        "FIRST_SEEN_AT": "2026-04-15",
        "LAST_SEEN_AT": "2026-04-15",
    },
    {
        "DATA_SOURCE_ID": 6,
        "DATA_SOURCE_NAME": "Cacao Coast ingredients catalog",
        "DATA_SOURCE_TYPE": "supplier_catalog",
        "URL": "https://cookie-demo.example/ingredienthub/cacao-coast-catalog",
        "DATE_LOGGED": "2026-04-15",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-15_ingredienthub",
        "SOURCE_PLATFORM": "IngredientHub",
        "OBSERVED_AT": "2026-04-15",
        "FIRST_SEEN_AT": "2026-04-15",
        "LAST_SEEN_AT": "2026-04-15",
    },
    {
        "DATA_SOURCE_ID": 7,
        "DATA_SOURCE_NAME": "Northwind butter sheet",
        "DATA_SOURCE_TYPE": "ingredient_sheet",
        "URL": "https://cookie-demo.example/ingredienthub/northwind-butter-sheet",
        "DATE_LOGGED": "2026-04-15",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-15_ingredienthub",
        "SOURCE_PLATFORM": "IngredientHub",
        "OBSERVED_AT": "2026-04-15",
        "FIRST_SEEN_AT": "2026-04-15",
        "LAST_SEEN_AT": "2026-04-15",
    },
    {
        "DATA_SOURCE_ID": 8,
        "DATA_SOURCE_NAME": "Clover Cane sugars catalog",
        "DATA_SOURCE_TYPE": "supplier_catalog",
        "URL": "https://cookie-demo.example/ingredienthub/clover-cane-catalog",
        "DATE_LOGGED": "2026-04-15",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-15_ingredienthub",
        "SOURCE_PLATFORM": "IngredientHub",
        "OBSERVED_AT": "2026-04-15",
        "FIRST_SEEN_AT": "2026-04-15",
        "LAST_SEEN_AT": "2026-04-15",
    },
    {
        "DATA_SOURCE_ID": 9,
        "DATA_SOURCE_NAME": "Meadow Oat Collective catalog",
        "DATA_SOURCE_TYPE": "supplier_catalog",
        "URL": "https://cookie-demo.example/ingredienthub/meadow-oat-catalog",
        "DATE_LOGGED": "2026-04-15",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-04-15_ingredienthub",
        "SOURCE_PLATFORM": "IngredientHub",
        "OBSERVED_AT": "2026-04-15",
        "FIRST_SEEN_AT": "2026-04-15",
        "LAST_SEEN_AT": "2026-04-15",
    },
    {
        "DATA_SOURCE_ID": 10,
        "DATA_SOURCE_NAME": "WholesaleCrumb route sheet",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "URL": "https://cookie-demo.example/wholesalecrumb/route-sheet",
        "DATE_LOGGED": "2026-05-01",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-05-01_wholesalecrumb",
        "SOURCE_PLATFORM": "WholesaleCrumb",
        "OBSERVED_AT": "2026-05-01",
        "FIRST_SEEN_AT": "2026-05-01",
        "LAST_SEEN_AT": "2026-05-01",
    },
    {
        "DATA_SOURCE_ID": 11,
        "DATA_SOURCE_NAME": "CertiBake public claims registry",
        "DATA_SOURCE_TYPE": "claims_registry",
        "URL": "https://cookie-demo.example/certibake/public-claims",
        "DATE_LOGGED": "2026-05-20",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-05-20_certibake_registry",
        "SOURCE_PLATFORM": "CertiBake Registry",
        "OBSERVED_AT": "2026-05-20",
        "FIRST_SEEN_AT": "2026-05-20",
        "LAST_SEEN_AT": "2026-05-20",
    },
    {
        "DATA_SOURCE_ID": 12,
        "DATA_SOURCE_NAME": "CertiBake allergen notes registry",
        "DATA_SOURCE_TYPE": "claims_registry",
        "URL": "https://cookie-demo.example/certibake/allergen-notes",
        "DATE_LOGGED": "2026-05-20",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-05-20_certibake_registry",
        "SOURCE_PLATFORM": "CertiBake Registry",
        "OBSERVED_AT": "2026-05-20",
        "FIRST_SEEN_AT": "2026-05-20",
        "LAST_SEEN_AT": "2026-05-20",
    },
    {
        "DATA_SOURCE_ID": 13,
        "DATA_SOURCE_NAME": "Harbor Batch refresh board",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "URL": "https://cookie-demo.example/bakeryboard/harbor-batch-refresh-board",
        "DATE_LOGGED": "2026-06-10",
        "PARENT_DATA_SOURCE_ID": 1,
        "SCRAPE_RUN_ID": "2026-06-10_bakeryboard_refresh",
        "SOURCE_PLATFORM": "BakeryBoard Refresh",
        "OBSERVED_AT": "2026-06-10",
        "FIRST_SEEN_AT": "2026-06-10",
        "LAST_SEEN_AT": "2026-06-10",
    },
    {
        "DATA_SOURCE_ID": 14,
        "DATA_SOURCE_NAME": "Seaside Biscuit Works menu board",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "URL": "https://cookie-demo.example/bakeryboard/seaside-biscuit-board",
        "DATE_LOGGED": "2026-06-10",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "2026-06-10_bakeryboard_refresh",
        "SOURCE_PLATFORM": "BakeryBoard Refresh",
        "OBSERVED_AT": "2026-06-10",
        "FIRST_SEEN_AT": "2026-06-10",
        "LAST_SEEN_AT": "2026-06-10",
    },
]

LISTED_NAME_MAP = {
    1: "all-purpose flour",
    2: "Madagascar vanilla",
    3: "semisweet chocolate chips",
    4: "cultured butter",
    5: "brown sugar",
    6: "rolled oats",
    7: "sea salt finish",
    8: "almond flour",
}

EVIDENCE_BLUEPRINTS = [
    (1, 1, 1, 1, "all-purpose flour"),
    (1, 4, 1, 1, "cultured butter"),
    (1, 3, 1, 1, "semisweet chocolate chips"),
    (1, 2, 1, 1, "Madagascar vanilla"),
    (1, 5, 1, 1, "brown sugar"),
    (2, 1, 2, 1, "all-purpose flour"),
    (2, 4, 2, 1, "cultured butter"),
    (2, 3, 2, 1, "semisweet chocolate chips"),
    (2, 5, 2, 1, "brown sugar"),
    (2, 7, 2, 1, "sea salt finish"),
    (3, 1, 3, 1, "all-purpose flour"),
    (3, 6, 3, 1, "rolled oats"),
    (3, 4, 3, 1, "cultured butter"),
    (3, 5, 3, 1, "brown sugar"),
    (5, 1, 4, 2, "all-purpose flour"),
    (5, 8, 4, 2, "almond flour"),
    (6, 2, 5, 2, "Madagascar vanilla extract"),
    (8, 3, 6, 2, "semisweet chocolate chips"),
    (7, 4, 7, 3, "cultured butter"),
    (9, 5, 8, 2, "brown sugar"),
    (10, 6, 9, 2, "rolled oats"),
    (11, 1, 10, 4, "all-purpose flour"),
    (11, 3, 10, 4, "semisweet chocolate chips"),
    (11, 4, 10, 4, "cultured butter"),
    (11, 5, 10, 4, "brown sugar"),
    (11, 6, 10, 4, "rolled oats"),
    (1, 1, 11, 5, "organic flour note"),
    (2, 3, 11, 5, "fair-trade chocolate note"),
    (3, 6, 11, 5, "gluten-free oats note"),
    (4, 8, 12, 5, "almond flour batch note"),
    (2, 4, 12, 5, "kosher-style butter cookie note"),
    (1, 1, 13, 1, "stone-milled flour"),
    (1, 6, 13, 1, "rolled oats"),
    (1, 7, 13, 1, "sea salt finish"),
    (4, 1, 14, 1, "all-purpose flour"),
    (4, 4, 14, 1, "cultured butter"),
    (4, 2, 14, 1, "Madagascar vanilla"),
    (4, 3, 14, 1, "semisweet chocolate chips"),
]

ASSOCIATION_BLUEPRINTS = [
    (1, 2, "Email", "orders@bakeryboard-kitchens.example", "Shared BakeryBoard inbox", 1),
    (5, 6, "Email", "catalog@ingredienthub.example", "Shared IngredientHub supplier inbox", 4),
    (5, 9, "Phone", "+1-414-555-0110", "Shared IngredientHub support line", 8),
    (6, 8, "Email", "catalog@ingredienthub.example", "Shared IngredientHub supplier inbox", 5),
    (1, 11, "Phone", "+1-773-555-0142", "Shared WholesaleCrumb route line", 10),
    (2, 11, "Phone", "+1-773-555-0142", "Shared WholesaleCrumb route line", 10),
    (8, 11, "Phone", "+1-773-555-0142", "Shared WholesaleCrumb route line", 10),
    (12, 1, "Email", "registry@certibake.example", "Listed in CertiBake claims registry", 11),
    (12, 2, "Email", "registry@certibake.example", "Listed in CertiBake claims registry", 11),
    (12, 3, "Email", "registry@certibake.example", "Listed in CertiBake claims registry", 11),
    (1, 5, "Email", "orders@goldengrain.example", "BakeryBoard refresh supplier reference", 13),
    (4, 11, "Phone", "+1-773-555-0142", "Shared WholesaleCrumb route line", 14),
    (4, 5, "Email", "orders@goldengrain.example", "BakeryBoard refresh supplier reference", 14),
]

SUBSTANCE_SOURCING_BLUEPRINTS = [
    (1, "All-purpose flour", 1, 4, "All-purpose flour catalog family"),
    (1, "stone-milled flour", 3, 13, "Observed menu phrasing for All-purpose flour"),
    (2, "Madagascar vanilla extract", 1, 5, "Madagascar vanilla catalog family"),
    (2, "Madagascar vanilla", 3, 1, "Observed menu phrasing for Madagascar vanilla extract"),
    (3, "Semisweet chocolate chips", 1, 6, "Chocolate chip catalog family"),
    (3, "semisweet chocolate chips", 3, 2, "Observed menu phrasing for Semisweet chocolate chips"),
    (4, "Cultured butter", 1, 7, "Cultured butter sheet family"),
    (4, "cultured butter", 3, 2, "Observed menu phrasing for Cultured butter"),
    (5, "Brown sugar", 1, 8, "Brown sugar catalog family"),
    (5, "brown sugar", 3, 2, "Observed menu phrasing for Brown sugar"),
    (6, "Rolled oats", 1, 9, "Rolled oat catalog family"),
    (6, "rolled oats", 3, 3, "Observed menu phrasing for Rolled oats"),
    (7, "Sea salt", 1, 2, "Sea salt pantry reference"),
    (7, "sea salt finish", 3, 13, "Observed menu phrasing for Sea salt"),
    (8, "Almond flour", 1, 4, "Almond flour catalog family"),
    (8, "almond flour", 3, 12, "Observed public claim phrasing for Almond flour"),
]


def compute_company_tag_scores():
    tag_lookup = {row["WEIGHTING_TAG_ID"]: row for row in WEIGHTING_TAG}
    scores = Counter()
    for row in COMPANY_WEIGHTING_TAG:
        scores[row["COMPANY_ID"]] += tag_lookup[row["WEIGHTING_TAG_ID"]]["WEIGHTING_TAG_WEIGHT"]
    return scores


def build_linkages():
    seen = set()
    rows = []
    row_id = 1
    for company_id, associated_company_id, method, value, _, source_id in ASSOCIATION_BLUEPRINTS:
        for linked_company_id in (company_id, associated_company_id):
            key = (linked_company_id, method, value, source_id)
            if key in seen:
                continue
            seen.add(key)
            rows.append(
                {
                    "LINKAGEID": row_id,
                    "COMPANY_ID": linked_company_id,
                    "LINKAGE_METHOD": method,
                    "Linkage_Value_Type": "Email" if method == "Email" else "Phone",
                    "LINKAGE_VALUE": value,
                    "DATA_SOURCE_ID": source_id,
                    "SCRAPE_RUN_ID": RUN_BY_ID[DATA_SOURCE_LOOKUP[source_id]["SCRAPE_RUN_ID"]]["id"],
                    "SOURCE_PLATFORM": DATA_SOURCE_LOOKUP[source_id]["SOURCE_PLATFORM"],
                    "OBSERVED_AT": DATA_SOURCE_LOOKUP[source_id]["OBSERVED_AT"],
                    "FIRST_SEEN_AT": DATA_SOURCE_LOOKUP[source_id]["OBSERVED_AT"],
                    "LAST_SEEN_AT": DATA_SOURCE_LOOKUP[source_id]["OBSERVED_AT"],
                }
            )
            row_id += 1
    return rows


def build_associations():
    rows = []
    for row_id, (company_id, associated_company_id, method, value, linkage_type, source_id) in enumerate(ASSOCIATION_BLUEPRINTS, start=1):
        source = DATA_SOURCE_LOOKUP[source_id]
        rows.append(
            {
                "ASSOCIATIONID": row_id,
                "COMPANY_ID": company_id,
                "ASSOCIATED_COMPANY_ID": associated_company_id,
                "LINKAGE_METHOD": method,
                "LINKAGE_VALUE": value,
                "LINKAGE_TYPE": linkage_type,
                "DATA_SOURCE_ID": source_id,
                "SCRAPE_RUN_ID": source["SCRAPE_RUN_ID"],
                "SOURCE_PLATFORM": source["SOURCE_PLATFORM"],
                "OBSERVED_AT": source["OBSERVED_AT"],
                "FIRST_SEEN_AT": source["OBSERVED_AT"],
                "LAST_SEEN_AT": source["OBSERVED_AT"],
            }
        )
    return rows


def build_substance_sourcing():
    rows = []
    for row_id, (substance_reference_id, local_name, sourcing_type_id, data_source_id, reference) in enumerate(SUBSTANCE_SOURCING_BLUEPRINTS, start=1):
        substance = SUBSTANCE_LOOKUP[substance_reference_id]
        rows.append(
            {
                "SUBSTANCE_SOURCING_ID": row_id,
                "SUBSTANCE_ID": substance["SUBSTANCE_ID"],
                "SUBSTANCE_SOURCING_LOCAL_NAME": local_name,
                "SUBSTANCE_SOURCING_TYPE_ID": sourcing_type_id,
                "DATA_SOURCE_ID": data_source_id,
                "SUBSTANCE_SOURCING_PRIMARY": "TRUE" if sourcing_type_id == 1 else "FALSE",
                "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": SUBSTANCE_TYPE_LOOKUP[substance["SUBSTANCE_TYPE_ID"]]["SUBSTANCE_TYPE_TITLE"],
                "SUBSTANCE_SOURCING_REFERENCE": reference,
            }
        )
    return rows


def build_evidence_rows():
    rows = []
    for row_id, (company_id, substance_reference_id, source_id, evidence_type_id, observed_text) in enumerate(EVIDENCE_BLUEPRINTS, start=1):
        source = DATA_SOURCE_LOOKUP[source_id]
        company = COMPANY_LOOKUP[company_id]
        substance = SUBSTANCE_LOOKUP[substance_reference_id]
        evidence_weight = substance["SUBSTANCE_WEIGHT"] + (evidence_type_id * 2) + (company_id % 4)
        rows.append(
            {
                "EVIDENCE_ID": row_id,
                "COMPANY_ID": company_id,
                "SUBSTANCE_REFERENCE_ID": substance_reference_id,
                "EVIDENCE_TYPE_ID": evidence_type_id,
                "DATA_SOURCE_ID": source_id,
                "LISTED_NAME_SUBSTANCE": observed_text,
                "REGION": company["PRC_HOME_BASE"],
                "EVIDENCE_WEIGHT": evidence_weight,
                "URL": f"{source['URL']}#record-{row_id}",
                "SOURCE_URL": source["URL"],
                "RECORD_ID": f"scrape-and-bake-{source['SCRAPE_RUN_ID']}-{company_id:02d}-{substance_reference_id:02d}-{row_id:03d}",
                "DATE_LOGGED": source["DATE_LOGGED"],
                "SCRAPE_RUN_ID": source["SCRAPE_RUN_ID"],
                "SOURCE_PLATFORM": source["SOURCE_PLATFORM"],
                "OBSERVED_AT": source["OBSERVED_AT"],
                "FIRST_SEEN_AT": source["OBSERVED_AT"],
                "LAST_SEEN_AT": source["OBSERVED_AT"],
            }
        )
    return rows


def build_evidence_weighting(evidence_rows):
    rows = []
    row_id = 1
    for evidence in evidence_rows:
        if evidence["COMPANY_ID"] in {1, 3} and evidence["SUBSTANCE_REFERENCE_ID"] in {1, 3}:
            rows.append(
                {
                    "EVIDENCE_WEIGHTING_TAG_ID": row_id,
                    "EVIDENCE_ID": evidence["EVIDENCE_ID"],
                    "WEIGHTING_TAG_ID": 1,
                }
            )
            row_id += 1
        if evidence["COMPANY_ID"] == 12:
            rows.append(
                {
                    "EVIDENCE_WEIGHTING_TAG_ID": row_id,
                    "EVIDENCE_ID": evidence["EVIDENCE_ID"],
                    "WEIGHTING_TAG_ID": 3,
                }
            )
            row_id += 1
    return rows


def build_substance_weighting():
    return [
        {"SUBSTANCE_WEIGHTING_TAG_ID": 1, "SUBSTANCE_REFERENCE_ID": 1, "WEIGHTING_TAG_ID": 1},
        {"SUBSTANCE_WEIGHTING_TAG_ID": 2, "SUBSTANCE_REFERENCE_ID": 4, "WEIGHTING_TAG_ID": 2},
        {"SUBSTANCE_WEIGHTING_TAG_ID": 3, "SUBSTANCE_REFERENCE_ID": 8, "WEIGHTING_TAG_ID": 3},
    ]


def derive_tables():
    substance_sourcing = build_substance_sourcing()
    evidence = build_evidence_rows()
    associations = build_associations()
    linkages = build_linkages()
    evidence_weighting = build_evidence_weighting(evidence)
    substance_weighting = build_substance_weighting()

    evidence_summary_bucket = defaultdict(lambda: {"evidence_count": 0, "total_weight": 0})
    evidence_counts = Counter()
    evidence_scores = Counter()
    substance_scores = Counter()
    substances_linked = defaultdict(set)

    for row in evidence:
        key = (row["COMPANY_ID"], row["SUBSTANCE_REFERENCE_ID"], row["EVIDENCE_TYPE_ID"])
        evidence_summary_bucket[key]["evidence_count"] += 1
        evidence_summary_bucket[key]["total_weight"] += row["EVIDENCE_WEIGHT"]
        evidence_counts[row["COMPANY_ID"]] += 1
        evidence_scores[row["COMPANY_ID"]] += row["EVIDENCE_WEIGHT"]
        substance_scores[row["COMPANY_ID"]] += SUBSTANCE_LOOKUP[row["SUBSTANCE_REFERENCE_ID"]]["SUBSTANCE_WEIGHT"]
        substances_linked[row["COMPANY_ID"]].add(row["SUBSTANCE_REFERENCE_ID"])

    evidence_summary = [
        {
            "COMPANY_ID": company_id,
            "SUBSTANCE_REFERENCE_ID": substance_reference_id,
            "EVIDENCE_TYPE_ID": evidence_type_id,
            "evidence_count": values["evidence_count"],
            "total_weight": values["total_weight"],
        }
        for (company_id, substance_reference_id, evidence_type_id), values in sorted(evidence_summary_bucket.items())
    ]

    connection_counts = Counter()
    for row in associations:
        connection_counts[row["COMPANY_ID"]] += 1
        connection_counts[row["ASSOCIATED_COMPANY_ID"]] += 1

    company_network_size = [
        {**company, "connection_count": connection_counts.get(company["COMPANY_ID"], 0)}
        for company in COMPANIES
    ]

    company_tag_scores = compute_company_tag_scores()
    company_score_v2 = []
    company_evaluation = []
    for company in COMPANIES:
        company_id = company["COMPANY_ID"]
        evidence_score = evidence_scores[company_id]
        substance_score = substance_scores[company_id]
        company_tag_score = company_tag_scores[company_id]
        total_score = evidence_score + round(substance_score * 0.35) + company_tag_score
        company_score_v2.append(
            {
                **company,
                "evidence_score": evidence_score,
                "substance_score": substance_score,
                "company_tag_score": company_tag_score,
                "total_score_v2": total_score,
                "legacy_score": evidence_score + company_tag_score,
                "evidence_count": evidence_counts[company_id],
                "substances_linked": len(substances_linked[company_id]),
            }
        )
        company_evaluation.append(
            {
                "COMPANY_ID": company_id,
                "COMPANY_NAME": company["COMPANY_NAME"],
                "EVIDENCE_COMPANY_WEIGHT": evidence_score,
                "TOTAL_WEIGHT": total_score,
            }
        )
    company_score_v2.sort(key=lambda row: row["total_score_v2"], reverse=True)

    datasource_bucket = defaultdict(int)
    for row in evidence:
        source = DATA_SOURCE_LOOKUP[row["DATA_SOURCE_ID"]]
        datasource_bucket[(row["SUBSTANCE_REFERENCE_ID"], source["DATA_SOURCE_NAME"], source["DATA_SOURCE_TYPE"])] += 1
    substance_datasource_summary = [
        {
            "SUBSTANCE_REFERENCE_ID": substance_reference_id,
            "DATA_SOURCE_NAME": data_source_name,
            "DATA_SOURCE_TYPE": data_source_type,
            "mention_count": count,
        }
        for (substance_reference_id, data_source_name, data_source_type), count in sorted(
            datasource_bucket.items(), key=lambda item: (-item[1], item[0][0], item[0][1])
        )
    ]

    evidence_readable = []
    for row in evidence:
        source = DATA_SOURCE_LOOKUP[row["DATA_SOURCE_ID"]]
        evidence_readable.append(
            {
                **row,
                "company_name": COMPANY_LOOKUP[row["COMPANY_ID"]]["COMPANY_NAME"],
                "substance_name": SUBSTANCE_LOOKUP[row["SUBSTANCE_REFERENCE_ID"]]["SUBSTANCE_NAME"],
                "evidence_type": EVIDENCE_TYPE_LOOKUP[row["EVIDENCE_TYPE_ID"]]["EVIDENCE_TYPE_NAME"],
                "data_source": source["DATA_SOURCE_NAME"],
                "SOURCE_PLATFORM": source["SOURCE_PLATFORM"],
                "OBSERVED_AT": source["OBSERVED_AT"],
            }
        )

    association_readable = []
    for row in associations:
        association_readable.append(
            {
                **row,
                "company_name": COMPANY_LOOKUP[row["COMPANY_ID"]]["COMPANY_NAME"],
                "associated_company_name": COMPANY_LOOKUP[row["ASSOCIATED_COMPANY_ID"]]["COMPANY_NAME"],
            }
        )

    consolidated_company_readable = []
    for row_id, row in enumerate(COMPANY_CONSOLIDATED_MAP, start=1):
        consolidated_company_readable.append(
            {
                "CONSOLIDATED_COMPANY_ID": row_id,
                "CONSOLIDATED_NAME": CONSOLIDATED_LOOKUP[row["CONSOLIDATED_COMPANY_ID"]]["CONSOLIDATED_NAME"],
                "COMPANY_NAME": COMPANY_LOOKUP[row["COMPANY_ID"]]["COMPANY_NAME"],
                "COMPANY_ID": row["COMPANY_ID"],
            }
        )

    return {
        "company": COMPANIES,
        "consolidated_company": CONSOLIDATED_COMPANY,
        "company_consolidated_map": COMPANY_CONSOLIDATED_MAP,
        "substance_reference": SUBSTANCE_REFERENCE,
        "substance_type": SUBSTANCE_TYPE,
        "substance_sourcing_type": SUBSTANCE_SOURCING_TYPE,
        "substance_sourcing": substance_sourcing,
        "evidence_type": EVIDENCE_TYPE,
        "data_source": DATA_SOURCES,
        "weighting_tag_type": WEIGHTING_TAG_TYPE,
        "weighting_tag_category": WEIGHTING_TAG_CATEGORY,
        "weighting_tag": WEIGHTING_TAG,
        "company_weighting_tag": COMPANY_WEIGHTING_TAG,
        "linkage": linkages,
        "association": associations,
        "evidence": evidence,
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


def is_visible_as_of(row, cutoff_date):
    if cutoff_date is None:
        return True
    observed_at = row.get("OBSERVED_AT") or row.get("DATE_LOGGED") or row.get("observed_at") or row.get("date_logged")
    return str(observed_at) <= cutoff_date


def build_snapshot(dataset, run_id=None):
    cutoff_date = None if run_id is None else RUN_BY_ID[run_id]["date"]
    evidence_rows = [row for row in dataset["evidence"] if is_visible_as_of(row, cutoff_date)]
    association_rows = [row for row in dataset["association"] if is_visible_as_of(row, cutoff_date)]
    linkage_rows = [row for row in dataset["linkage"] if is_visible_as_of(row, cutoff_date)]
    data_sources = [row for row in dataset["data_source"] if is_visible_as_of(row, cutoff_date)]

    company_ids = set()
    ingredient_ids = set()
    for row in evidence_rows:
        company_ids.add(row["COMPANY_ID"])
        ingredient_ids.add(row["SUBSTANCE_REFERENCE_ID"])
    for row in association_rows:
        company_ids.add(row["COMPANY_ID"])
        company_ids.add(row["ASSOCIATED_COMPANY_ID"])
    for row in linkage_rows:
        company_ids.add(row["COMPANY_ID"])

    return {
        "company_ids": sorted(company_ids),
        "ingredient_ids": sorted(ingredient_ids),
        "evidence_count": len(evidence_rows),
        "source_page_count": len({row["DATA_SOURCE_ID"] for row in evidence_rows}) or len(data_sources),
        "network_link_count": len(association_rows),
        "linkage_count": len(linkage_rows),
    }


def build_movement_summaries(dataset):
    movement = {}
    previous_snapshot = {
        "company_ids": [],
        "ingredient_ids": [],
        "evidence_count": 0,
        "network_link_count": 0,
    }
    for run in SCRAPE_RUNS:
        snapshot = build_snapshot(dataset, run["id"])
        new_companies = len(set(snapshot["company_ids"]) - set(previous_snapshot["company_ids"]))
        new_ingredients = len(set(snapshot["ingredient_ids"]) - set(previous_snapshot["ingredient_ids"]))
        new_evidence_rows = snapshot["evidence_count"] - previous_snapshot["evidence_count"]
        new_links = snapshot["network_link_count"] - previous_snapshot["network_link_count"]
        movement[run["id"]] = {
            "label": run["label"],
            "platform": run["platform"],
            "date": run["date"],
            "message": run["narrative"],
            "newCompanies": new_companies,
            "newIngredients": new_ingredients,
            "newEvidenceRows": new_evidence_rows,
            "newLinks": new_links,
        }
        previous_snapshot = snapshot
    movement["all_runs"] = {
        "label": "All runs",
        "platform": "Synthetic timeline",
        "date": SCRAPE_RUNS[-1]["date"],
        "message": "All five synthetic scrape runs combine bakery pages, supplier catalogs, distributor listings, and public claim pages into one source-backed ingredient map.",
        "newCompanies": len(build_snapshot(dataset)["company_ids"]),
        "newIngredients": len(build_snapshot(dataset)["ingredient_ids"]),
        "newEvidenceRows": build_snapshot(dataset)["evidence_count"],
        "newLinks": build_snapshot(dataset)["network_link_count"],
    }
    return movement


def build_scrape_run_metadata(dataset):
    evidence_rows = dataset["evidence"]
    data_sources = dataset["data_source"]
    run_metadata = []
    for run in SCRAPE_RUNS:
        run_sources = [row for row in data_sources if row["SCRAPE_RUN_ID"] == run["id"]]
        run_evidence = [row for row in evidence_rows if row["SCRAPE_RUN_ID"] == run["id"]]
        run_metadata.append(
            {
                **run,
                "sourcePageCount": len(run_sources),
                "evidenceRowCount": len(run_evidence),
            }
        )
    return run_metadata


def build_fixture_html(source, rows):
    ingredient_items = "\n".join(f"          <li>{row['LISTED_NAME_SUBSTANCE']}</li>" for row in rows) or "          <li>synthetic fixture content</li>"
    notes = {
        "BakeryBoard": "Synthetic bakery menu collection fixture.",
        "IngredientHub": "Synthetic supplier catalog collection fixture.",
        "WholesaleCrumb": "Synthetic distributor collection fixture.",
        "CertiBake Registry": "Synthetic public claim registry fixture.",
        "BakeryBoard Refresh": "Synthetic bakery refresh fixture.",
    }
    platform_note = notes.get(source["SOURCE_PLATFORM"], "Synthetic scrape fixture output.")
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{source["DATA_SOURCE_NAME"]}</title>
  </head>
  <body>
    <main>
      <h1>{source["DATA_SOURCE_NAME"]}</h1>
      <p>{platform_note}</p>
      <p>Source platform: {source["SOURCE_PLATFORM"]}</p>
      <p>Observed on: {source["OBSERVED_AT"]}</p>
      <ul>
{ingredient_items}
      </ul>
    </main>
  </body>
</html>
"""


def write_scraper_outputs(dataset):
    evidence_rows = dataset["evidence"]
    for run in SCRAPE_RUNS:
        folder = SCRAPER_OUTPUT_DIR / run["id"]
        raw_dir = folder / "raw_html"
        raw_dir.mkdir(parents=True, exist_ok=True)

        run_sources = [row for row in dataset["data_source"] if row["SCRAPE_RUN_ID"] == run["id"]]
        run_evidence = [row for row in evidence_rows if row["SCRAPE_RUN_ID"] == run["id"]]

        for source in run_sources:
            source_rows = [row for row in run_evidence if row["DATA_SOURCE_ID"] == source["DATA_SOURCE_ID"]]
            filename = source["DATA_SOURCE_NAME"].lower().replace(" ", "_").replace("&", "and").replace("/", "_")
            (raw_dir / f"{filename}.html").write_text(build_fixture_html(source, source_rows), encoding="utf-8")

        with (folder / "parsed_evidence.csv").open("w", encoding="utf-8", newline="") as handle:
            fieldnames = [
                "company_name",
                "source_platform",
                "source_url",
                "scrape_run_id",
                "observed_at",
                "evidence_type",
                "record_id",
                "date_logged",
                "ingredient_name",
                "observed_text",
            ]
            writer = csv.DictWriter(handle, fieldnames=fieldnames)
            writer.writeheader()
            for row in run_evidence:
                writer.writerow(
                    {
                        "company_name": COMPANY_LOOKUP[row["COMPANY_ID"]]["COMPANY_NAME"],
                        "source_platform": row["SOURCE_PLATFORM"],
                        "source_url": row["SOURCE_URL"],
                        "scrape_run_id": row["SCRAPE_RUN_ID"],
                        "observed_at": row["OBSERVED_AT"],
                        "evidence_type": EVIDENCE_TYPE_LOOKUP[row["EVIDENCE_TYPE_ID"]]["EVIDENCE_TYPE_NAME"],
                        "record_id": row["RECORD_ID"],
                        "date_logged": row["DATE_LOGGED"],
                        "ingredient_name": SUBSTANCE_LOOKUP[row["SUBSTANCE_REFERENCE_ID"]]["SUBSTANCE_NAME"],
                        "observed_text": row["LISTED_NAME_SUBSTANCE"],
                    }
                )

        summary = {
            "scrape_run_id": run["id"],
            "platform": run["platform"],
            "run_date": run["date"],
            "total_targets": len(run_sources),
            "successful_targets": len(run_sources),
            "failed_targets": 0,
            "evidence_rows_produced": len(run_evidence),
            "notes": "Synthetic fixture output for public walkthroughs.",
            "source_pages": [
                {
                    "data_source_name": source["DATA_SOURCE_NAME"],
                    "source_platform": source["SOURCE_PLATFORM"],
                    "source_url": source["URL"],
                    "raw_html_file": f"raw_html/{source['DATA_SOURCE_NAME'].lower().replace(' ', '_').replace('&', 'and').replace('/', '_')}.html",
                }
                for source in run_sources
            ],
        }
        (folder / "scrape_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")


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
        "-- The demo dataset is synthetic and regenerated for public walkthroughs.",
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
        statements.append(f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES\n{values};")
    (SQL_DIR / "01_cookie_demo_seed.sql").write_text("\n\n".join(statements) + "\n", encoding="utf-8")


def write_compatibility_sql():
    sql = """-- Cookie demo compatibility views and lightweight RPCs.
-- These keep the demo frontend query surface stable in a Supabase/Postgres environment.

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
  ds."DATA_SOURCE_NAME" as data_source,
  ds."DATA_SOURCE_TYPE" as source_type,
  ds."SOURCE_PLATFORM" as source_platform,
  ds."OBSERVED_AT" as observed_at
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


def write_frontend_module(dataset, movement_summaries, scrape_run_metadata):
    payload = {
        "metadata": {
            "name": "Scrape & Bake",
            "seedVersion": "2026-07-06",
            "description": "Synthetic cookie ingredient supply-chain demo dataset with multiple scrape runs.",
            "evidenceRowCount": len(dataset["evidence"]),
            "scrapeRuns": scrape_run_metadata,
            "movementSummaries": movement_summaries,
        },
        "tables": dataset,
    }
    FRONTEND_DATA_FILE.write_text(
        "export const DEMO_DATA = " + json.dumps(payload, indent=2) + ";\n\nexport default DEMO_DATA;\n",
        encoding="utf-8",
    )


def main():
    dataset = derive_tables()
    movement_summaries = build_movement_summaries(dataset)
    scrape_run_metadata = build_scrape_run_metadata(dataset)

    for table_name, rows in dataset.items():
        if table_name == "rpcs":
            continue
        write_csv(table_name, rows)
    write_seed_sql(dataset)
    write_compatibility_sql()
    write_frontend_module(dataset, movement_summaries, scrape_run_metadata)
    write_scraper_outputs(dataset)

    print(
        json.dumps(
            {
                "scrape_runs": len(SCRAPE_RUNS),
                "evidence_rows": len(dataset["evidence"]),
                "companies": len(dataset["company"]),
                "ingredients": len(dataset["substance_reference"]),
                "source_pages": len(dataset["data_source"]),
                "network_links": len(dataset["association"]),
            },
            indent=2,
        )
    )


COMPANY_LOOKUP = {row["COMPANY_ID"]: row for row in COMPANIES}
CONSOLIDATED_LOOKUP = {row["CONSOLIDATED_NAME_ID"]: row for row in CONSOLIDATED_COMPANY}
SUBSTANCE_LOOKUP = {row["SUBSTANCE_REFERENCE_ID"]: row for row in SUBSTANCE_REFERENCE}
SUBSTANCE_TYPE_LOOKUP = {row["SUBSTANCE_TYPE_ID"]: row for row in SUBSTANCE_TYPE}
EVIDENCE_TYPE_LOOKUP = {row["EVIDENCE_TYPE_ID"]: row for row in EVIDENCE_TYPE}
DATA_SOURCE_LOOKUP = {row["DATA_SOURCE_ID"]: row for row in DATA_SOURCES}


if __name__ == "__main__":
    main()
