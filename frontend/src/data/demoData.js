export const DEMO_DATA = {
  "metadata": {
    "name": "Scrape & Bake",
    "seedVersion": "2026-07-03",
    "description": "Synthetic cookie ingredient supply-chain demo dataset.",
    "evidenceRowCount": 42
  },
  "tables": {
    "company": [
      {
        "COMPANY_ID": 1,
        "COMPANY_NAME": "Harbor Batch Bakery",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Midwest",
        "GOV_COMPLICITY": "Retail bakery"
      },
      {
        "COMPANY_ID": 2,
        "COMPANY_NAME": "Maple & Main Cookie Co.",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Northeast",
        "GOV_COMPLICITY": "Regional bakery"
      },
      {
        "COMPANY_ID": 3,
        "COMPANY_NAME": "Sunfield Flour Mills",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Great Lakes",
        "GOV_COMPLICITY": "Flour mill"
      },
      {
        "COMPANY_ID": 4,
        "COMPANY_NAME": "Orchard Vanilla Imports",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Importer",
        "PRC_HOME_BASE": "East Coast",
        "GOV_COMPLICITY": "Flavor importer"
      },
      {
        "COMPANY_ID": 5,
        "COMPANY_NAME": "Northwind Butter Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Dairy Processor",
        "PRC_HOME_BASE": "Wisconsin",
        "GOV_COMPLICITY": "Butter supplier"
      },
      {
        "COMPANY_ID": 6,
        "COMPANY_NAME": "Cacao Coast Ingredients",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "West Coast",
        "GOV_COMPLICITY": "Chocolate ingredient supplier"
      },
      {
        "COMPANY_ID": 7,
        "COMPANY_NAME": "Spruce Street Packing",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Co-Packer",
        "PRC_HOME_BASE": "Midwest",
        "GOV_COMPLICITY": "Packaging partner"
      },
      {
        "COMPANY_ID": 8,
        "COMPANY_NAME": "Golden Crate Logistics",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Distributor",
        "PRC_HOME_BASE": "National",
        "GOV_COMPLICITY": "Distribution partner"
      },
      {
        "COMPANY_ID": 9,
        "COMPANY_NAME": "Clover Cane Sugars",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Gulf Coast",
        "GOV_COMPLICITY": "Sugar refiner"
      },
      {
        "COMPANY_ID": 10,
        "COMPANY_NAME": "Copper Kettle Kitchen",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Contract Bakery",
        "PRC_HOME_BASE": "South",
        "GOV_COMPLICITY": "Private-label bakery"
      },
      {
        "COMPANY_ID": 11,
        "COMPANY_NAME": "Bluebird Oven Foods",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Pacific Northwest",
        "GOV_COMPLICITY": "Regional bakery"
      },
      {
        "COMPANY_ID": 12,
        "COMPANY_NAME": "Seaside Biscuit Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Southeast",
        "GOV_COMPLICITY": "Retail bakery"
      }
    ],
    "consolidated_company": [
      {
        "CONSOLIDATED_NAME_ID": 1,
        "CONSOLIDATED_NAME": "Bakehouse Collective"
      },
      {
        "CONSOLIDATED_NAME_ID": 2,
        "CONSOLIDATED_NAME": "Pantry Inputs Cooperative"
      },
      {
        "CONSOLIDATED_NAME_ID": 3,
        "CONSOLIDATED_NAME": "Packing & Fulfillment Partners"
      }
    ],
    "company_consolidated_map": [
      {
        "CONSOLIDATED_COMPANY_ID": 1,
        "COMPANY_ID": 1
      },
      {
        "CONSOLIDATED_COMPANY_ID": 1,
        "COMPANY_ID": 2
      },
      {
        "CONSOLIDATED_COMPANY_ID": 1,
        "COMPANY_ID": 10
      },
      {
        "CONSOLIDATED_COMPANY_ID": 1,
        "COMPANY_ID": 11
      },
      {
        "CONSOLIDATED_COMPANY_ID": 1,
        "COMPANY_ID": 12
      },
      {
        "CONSOLIDATED_COMPANY_ID": 2,
        "COMPANY_ID": 3
      },
      {
        "CONSOLIDATED_COMPANY_ID": 2,
        "COMPANY_ID": 4
      },
      {
        "CONSOLIDATED_COMPANY_ID": 2,
        "COMPANY_ID": 5
      },
      {
        "CONSOLIDATED_COMPANY_ID": 2,
        "COMPANY_ID": 6
      },
      {
        "CONSOLIDATED_COMPANY_ID": 2,
        "COMPANY_ID": 9
      },
      {
        "CONSOLIDATED_COMPANY_ID": 3,
        "COMPANY_ID": 7
      },
      {
        "CONSOLIDATED_COMPANY_ID": 3,
        "COMPANY_ID": 8
      }
    ],
    "substance_reference": [
      {
        "SUBSTANCE_REFERENCE_ID": 1,
        "SUBSTANCE_NAME": "All-purpose flour",
        "SUBSTANCE_ID": "ING-FLOUR-AP",
        "SUBSTANCE_WEIGHT": 24,
        "SUBSTANCE_DESCRIPTION": "Primary flour used across house cookie bases.",
        "SUBSTANCE_TYPE_ID": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 2,
        "SUBSTANCE_NAME": "Brown sugar",
        "SUBSTANCE_ID": "ING-SUGAR-BROWN",
        "SUBSTANCE_WEIGHT": 18,
        "SUBSTANCE_DESCRIPTION": "Moisture-retaining sweetener used in classic cookie dough.",
        "SUBSTANCE_TYPE_ID": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 3,
        "SUBSTANCE_NAME": "Cultured butter",
        "SUBSTANCE_ID": "ING-BUTTER-CULTURED",
        "SUBSTANCE_WEIGHT": 20,
        "SUBSTANCE_DESCRIPTION": "Premium butter used in rich dough and laminated inclusions.",
        "SUBSTANCE_TYPE_ID": 3
      },
      {
        "SUBSTANCE_REFERENCE_ID": 4,
        "SUBSTANCE_NAME": "Madagascar vanilla extract",
        "SUBSTANCE_ID": "ING-VANILLA-MDG",
        "SUBSTANCE_WEIGHT": 15,
        "SUBSTANCE_DESCRIPTION": "High-aroma vanilla extract used in signature cookie lines.",
        "SUBSTANCE_TYPE_ID": 4
      },
      {
        "SUBSTANCE_REFERENCE_ID": 5,
        "SUBSTANCE_NAME": "Semisweet chocolate chips",
        "SUBSTANCE_ID": "ING-CHOC-SEMI",
        "SUBSTANCE_WEIGHT": 22,
        "SUBSTANCE_DESCRIPTION": "Core inclusion for chocolate chip and double chocolate cookies.",
        "SUBSTANCE_TYPE_ID": 5
      },
      {
        "SUBSTANCE_REFERENCE_ID": 6,
        "SUBSTANCE_NAME": "Sea salt",
        "SUBSTANCE_ID": "ING-SALT-SEA",
        "SUBSTANCE_WEIGHT": 8,
        "SUBSTANCE_DESCRIPTION": "Finishing and balance ingredient used in sweet-savory blends.",
        "SUBSTANCE_TYPE_ID": 4
      },
      {
        "SUBSTANCE_REFERENCE_ID": 7,
        "SUBSTANCE_NAME": "Rolled oats",
        "SUBSTANCE_ID": "ING-OATS-ROLLED",
        "SUBSTANCE_WEIGHT": 14,
        "SUBSTANCE_DESCRIPTION": "Textural inclusion used in oatmeal cookie programs.",
        "SUBSTANCE_TYPE_ID": 5
      },
      {
        "SUBSTANCE_REFERENCE_ID": 8,
        "SUBSTANCE_NAME": "Cinnamon",
        "SUBSTANCE_ID": "ING-CINNAMON",
        "SUBSTANCE_WEIGHT": 11,
        "SUBSTANCE_DESCRIPTION": "Warm spice used in snickerdoodle and seasonal cookies.",
        "SUBSTANCE_TYPE_ID": 4
      },
      {
        "SUBSTANCE_REFERENCE_ID": 9,
        "SUBSTANCE_NAME": "Almond flour",
        "SUBSTANCE_ID": "ING-FLOUR-ALMOND",
        "SUBSTANCE_WEIGHT": 17,
        "SUBSTANCE_DESCRIPTION": "Alternative flour used in gluten-aware cookie lines.",
        "SUBSTANCE_TYPE_ID": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 10,
        "SUBSTANCE_NAME": "Molasses",
        "SUBSTANCE_ID": "ING-MOLASSES",
        "SUBSTANCE_WEIGHT": 13,
        "SUBSTANCE_DESCRIPTION": "Dark sweetener used for ginger and chewy brown cookies.",
        "SUBSTANCE_TYPE_ID": 2
      }
    ],
    "substance_type": [
      {
        "SUBSTANCE_TYPE_ID": 1,
        "SUBSTANCE_TYPE_TITLE": "Flour",
        "SUBSTANCE_TYPE_DESCRIPTION": "Foundational flour ingredients used in cookie dough."
      },
      {
        "SUBSTANCE_TYPE_ID": 2,
        "SUBSTANCE_TYPE_TITLE": "Sweetener",
        "SUBSTANCE_TYPE_DESCRIPTION": "Sugars and sweet ingredients used for structure and flavor."
      },
      {
        "SUBSTANCE_TYPE_ID": 3,
        "SUBSTANCE_TYPE_TITLE": "Fat",
        "SUBSTANCE_TYPE_DESCRIPTION": "Butter and related fats that affect texture and shelf life."
      },
      {
        "SUBSTANCE_TYPE_ID": 4,
        "SUBSTANCE_TYPE_TITLE": "Flavor",
        "SUBSTANCE_TYPE_DESCRIPTION": "Flavoring ingredients such as vanilla and cinnamon."
      },
      {
        "SUBSTANCE_TYPE_ID": 5,
        "SUBSTANCE_TYPE_TITLE": "Inclusion",
        "SUBSTANCE_TYPE_DESCRIPTION": "Mix-ins such as chocolate chips, oats, and nuts."
      }
    ],
    "substance_sourcing_type": [
      {
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "SUBSTANCE_SOURCING_TYPE_TITLE": "Catalog family",
        "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "High-level family or assortment name used in catalogs."
      },
      {
        "SUBSTANCE_SOURCING_TYPE_ID": 2,
        "SUBSTANCE_SOURCING_TYPE_TITLE": "Supplier alias",
        "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "Localized supplier phrasing used on spec sheets or profiles."
      },
      {
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "SUBSTANCE_SOURCING_TYPE_TITLE": "Recipe phrasing",
        "SUBSTANCE_SOURCING_TYPE_DESCRIPTION": "Phrasing used on bakery menus or ingredient lists."
      }
    ],
    "substance_sourcing": [
      {
        "SUBSTANCE_SOURCING_ID": 1,
        "SUBSTANCE_ID": "ING-FLOUR-AP",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "All-purpose flour",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flour",
        "SUBSTANCE_SOURCING_REFERENCE": "All-purpose flour catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 2,
        "SUBSTANCE_ID": "ING-FLOUR-AP",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "all-purpose flour",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flour",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for All-purpose flour"
      },
      {
        "SUBSTANCE_SOURCING_ID": 3,
        "SUBSTANCE_ID": "ING-SUGAR-BROWN",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Brown sugar",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Sweetener",
        "SUBSTANCE_SOURCING_REFERENCE": "Brown sugar catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 4,
        "SUBSTANCE_ID": "ING-SUGAR-BROWN",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "dark brown sugar",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Sweetener",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Brown sugar"
      },
      {
        "SUBSTANCE_SOURCING_ID": 5,
        "SUBSTANCE_ID": "ING-BUTTER-CULTURED",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Cultured butter",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Fat",
        "SUBSTANCE_SOURCING_REFERENCE": "Cultured butter catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 6,
        "SUBSTANCE_ID": "ING-BUTTER-CULTURED",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "cultured sweet cream butter",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Fat",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Cultured butter"
      },
      {
        "SUBSTANCE_SOURCING_ID": 7,
        "SUBSTANCE_ID": "ING-VANILLA-MDG",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Madagascar vanilla extract",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flavor",
        "SUBSTANCE_SOURCING_REFERENCE": "Madagascar vanilla extract catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 8,
        "SUBSTANCE_ID": "ING-VANILLA-MDG",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Madagascar vanilla",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flavor",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Madagascar vanilla extract"
      },
      {
        "SUBSTANCE_SOURCING_ID": 9,
        "SUBSTANCE_ID": "ING-CHOC-SEMI",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Semisweet chocolate chips",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Inclusion",
        "SUBSTANCE_SOURCING_REFERENCE": "Semisweet chocolate chips catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 10,
        "SUBSTANCE_ID": "ING-CHOC-SEMI",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "semisweet chocolate chips",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Inclusion",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Semisweet chocolate chips"
      },
      {
        "SUBSTANCE_SOURCING_ID": 11,
        "SUBSTANCE_ID": "ING-SALT-SEA",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Sea salt",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flavor",
        "SUBSTANCE_SOURCING_REFERENCE": "Sea salt catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 12,
        "SUBSTANCE_ID": "ING-SALT-SEA",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "flaky sea salt",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flavor",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Sea salt"
      },
      {
        "SUBSTANCE_SOURCING_ID": 13,
        "SUBSTANCE_ID": "ING-OATS-ROLLED",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Rolled oats",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Inclusion",
        "SUBSTANCE_SOURCING_REFERENCE": "Rolled oats catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 14,
        "SUBSTANCE_ID": "ING-OATS-ROLLED",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "rolled oats",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Inclusion",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Rolled oats"
      },
      {
        "SUBSTANCE_SOURCING_ID": 15,
        "SUBSTANCE_ID": "ING-CINNAMON",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Cinnamon",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flavor",
        "SUBSTANCE_SOURCING_REFERENCE": "Cinnamon catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 16,
        "SUBSTANCE_ID": "ING-CINNAMON",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "ground cinnamon",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flavor",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Cinnamon"
      },
      {
        "SUBSTANCE_SOURCING_ID": 17,
        "SUBSTANCE_ID": "ING-FLOUR-ALMOND",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Almond flour",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flour",
        "SUBSTANCE_SOURCING_REFERENCE": "Almond flour catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 18,
        "SUBSTANCE_ID": "ING-FLOUR-ALMOND",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "fine almond flour",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Flour",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Almond flour"
      },
      {
        "SUBSTANCE_SOURCING_ID": 19,
        "SUBSTANCE_ID": "ING-MOLASSES",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "Molasses",
        "SUBSTANCE_SOURCING_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "SUBSTANCE_SOURCING_PRIMARY": "TRUE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Sweetener",
        "SUBSTANCE_SOURCING_REFERENCE": "Molasses catalog family"
      },
      {
        "SUBSTANCE_SOURCING_ID": 20,
        "SUBSTANCE_ID": "ING-MOLASSES",
        "SUBSTANCE_SOURCING_LOCAL_NAME": "blackstrap molasses",
        "SUBSTANCE_SOURCING_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "SUBSTANCE_SOURCING_PRIMARY": "FALSE",
        "SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE": "Sweetener",
        "SUBSTANCE_SOURCING_REFERENCE": "Observed menu phrasing for Molasses"
      }
    ],
    "evidence": [
      {
        "EVIDENCE_ID": 1,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 31,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-1",
        "RECORD_ID": "cookie-demo-01-01-001",
        "DATE_LOGGED": "2026-06-03",
        "SCRAPE_RUN_ID": "cookie-demo-run-001"
      },
      {
        "EVIDENCE_ID": 2,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 21,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-2",
        "RECORD_ID": "cookie-demo-01-02-002",
        "DATE_LOGGED": "2026-06-04",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 3,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 25,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-3",
        "RECORD_ID": "cookie-demo-01-03-003",
        "DATE_LOGGED": "2026-06-05",
        "SCRAPE_RUN_ID": "cookie-demo-run-001"
      },
      {
        "EVIDENCE_ID": 4,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 22,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-4",
        "RECORD_ID": "cookie-demo-01-04-004",
        "DATE_LOGGED": "2026-06-06",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 5,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 25,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-5",
        "RECORD_ID": "cookie-demo-01-05-005",
        "DATE_LOGGED": "2026-06-07",
        "SCRAPE_RUN_ID": "cookie-demo-run-001"
      },
      {
        "EVIDENCE_ID": 6,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "flaky sea salt",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 13,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-6",
        "RECORD_ID": "cookie-demo-01-06-006",
        "DATE_LOGGED": "2026-06-08",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 7,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 32,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-7",
        "RECORD_ID": "cookie-demo-02-01-007",
        "DATE_LOGGED": "2026-06-05",
        "SCRAPE_RUN_ID": "cookie-demo-run-004"
      },
      {
        "EVIDENCE_ID": 8,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 22,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-8",
        "RECORD_ID": "cookie-demo-02-02-008",
        "DATE_LOGGED": "2026-06-06",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 9,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-9",
        "RECORD_ID": "cookie-demo-02-03-009",
        "DATE_LOGGED": "2026-06-07",
        "SCRAPE_RUN_ID": "cookie-demo-run-004"
      },
      {
        "EVIDENCE_ID": 10,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 23,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-10",
        "RECORD_ID": "cookie-demo-02-04-010",
        "DATE_LOGGED": "2026-06-08",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 11,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-11",
        "RECORD_ID": "cookie-demo-02-05-011",
        "DATE_LOGGED": "2026-06-09",
        "SCRAPE_RUN_ID": "cookie-demo-run-004"
      },
      {
        "EVIDENCE_ID": 12,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "ground cinnamon",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 17,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-12",
        "RECORD_ID": "cookie-demo-02-08-012",
        "DATE_LOGGED": "2026-06-10",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 13,
        "COMPANY_ID": 3,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Great Lakes",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-13",
        "RECORD_ID": "cookie-demo-03-01-013",
        "DATE_LOGGED": "2026-06-07",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 14,
        "COMPANY_ID": 3,
        "SUBSTANCE_REFERENCE_ID": 9,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "fine almond flour",
        "REGION": "Great Lakes",
        "EVIDENCE_WEIGHT": 21,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-14",
        "RECORD_ID": "cookie-demo-03-09-014",
        "DATE_LOGGED": "2026-06-08",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 15,
        "COMPANY_ID": 4,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 5,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "East Coast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-15",
        "RECORD_ID": "cookie-demo-04-04-015",
        "DATE_LOGGED": "2026-06-09",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 16,
        "COMPANY_ID": 5,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 3,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "Wisconsin",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/northwind-butter-sheet#record-16",
        "RECORD_ID": "cookie-demo-05-03-016",
        "DATE_LOGGED": "2026-06-11",
        "SCRAPE_RUN_ID": "cookie-demo-run-003"
      },
      {
        "EVIDENCE_ID": 17,
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 5,
        "DATA_SOURCE_ID": 5,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "West Coast",
        "EVIDENCE_WEIGHT": 32,
        "URL": "https://cookie-demo.example/sources/cacao-coast-profile#record-17",
        "RECORD_ID": "cookie-demo-06-05-017",
        "DATE_LOGGED": "2026-06-13",
        "SCRAPE_RUN_ID": "cookie-demo-run-005"
      },
      {
        "EVIDENCE_ID": 18,
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "flaky sea salt",
        "REGION": "West Coast",
        "EVIDENCE_WEIGHT": 10,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-18",
        "RECORD_ID": "cookie-demo-06-06-018",
        "DATE_LOGGED": "2026-06-14",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 19,
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 5,
        "DATA_SOURCE_ID": 5,
        "LISTED_NAME_SUBSTANCE": "ground cinnamon",
        "REGION": "West Coast",
        "EVIDENCE_WEIGHT": 21,
        "URL": "https://cookie-demo.example/sources/cacao-coast-profile#record-19",
        "RECORD_ID": "cookie-demo-06-08-019",
        "DATE_LOGGED": "2026-06-15",
        "SCRAPE_RUN_ID": "cookie-demo-run-005"
      },
      {
        "EVIDENCE_ID": 20,
        "COMPANY_ID": 7,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 31,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-20",
        "RECORD_ID": "cookie-demo-07-05-020",
        "DATE_LOGGED": "2026-06-15",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 21,
        "COMPANY_ID": 7,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "flaky sea salt",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 17,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-21",
        "RECORD_ID": "cookie-demo-07-06-021",
        "DATE_LOGGED": "2026-06-16",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 22,
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "National",
        "EVIDENCE_WEIGHT": 34,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-22",
        "RECORD_ID": "cookie-demo-08-01-022",
        "DATE_LOGGED": "2026-06-17",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 23,
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "National",
        "EVIDENCE_WEIGHT": 32,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-23",
        "RECORD_ID": "cookie-demo-08-05-023",
        "DATE_LOGGED": "2026-06-18",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 24,
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "blackstrap molasses",
        "REGION": "National",
        "EVIDENCE_WEIGHT": 23,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-24",
        "RECORD_ID": "cookie-demo-08-10-024",
        "DATE_LOGGED": "2026-06-19",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 25,
        "COMPANY_ID": 9,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "Gulf Coast",
        "EVIDENCE_WEIGHT": 20,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-25",
        "RECORD_ID": "cookie-demo-09-02-025",
        "DATE_LOGGED": "2026-06-19",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 26,
        "COMPANY_ID": 9,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "blackstrap molasses",
        "REGION": "Gulf Coast",
        "EVIDENCE_WEIGHT": 15,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-26",
        "RECORD_ID": "cookie-demo-09-10-026",
        "DATE_LOGGED": "2026-06-20",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 27,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 31,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-27",
        "RECORD_ID": "cookie-demo-10-01-027",
        "DATE_LOGGED": "2026-06-21",
        "SCRAPE_RUN_ID": "cookie-demo-run-004"
      },
      {
        "EVIDENCE_ID": 28,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 27,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-28",
        "RECORD_ID": "cookie-demo-10-02-028",
        "DATE_LOGGED": "2026-06-22",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 29,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 27,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-29",
        "RECORD_ID": "cookie-demo-10-03-029",
        "DATE_LOGGED": "2026-06-23",
        "SCRAPE_RUN_ID": "cookie-demo-run-004"
      },
      {
        "EVIDENCE_ID": 30,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 31,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-30",
        "RECORD_ID": "cookie-demo-10-05-030",
        "DATE_LOGGED": "2026-06-24",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 31,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "blackstrap molasses",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 20,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-31",
        "RECORD_ID": "cookie-demo-10-10-031",
        "DATE_LOGGED": "2026-06-01",
        "SCRAPE_RUN_ID": "cookie-demo-run-004"
      },
      {
        "EVIDENCE_ID": 32,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 7,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 32,
        "URL": "https://cookie-demo.example/sources/bluebird-archive#record-32",
        "RECORD_ID": "cookie-demo-11-01-032",
        "DATE_LOGGED": "2026-06-23",
        "SCRAPE_RUN_ID": "cookie-demo-run-007"
      },
      {
        "EVIDENCE_ID": 33,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 19,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-33",
        "RECORD_ID": "cookie-demo-11-04-033",
        "DATE_LOGGED": "2026-06-24",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 34,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 7,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 7,
        "LISTED_NAME_SUBSTANCE": "rolled oats",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 22,
        "URL": "https://cookie-demo.example/sources/bluebird-archive#record-34",
        "RECORD_ID": "cookie-demo-11-07-034",
        "DATE_LOGGED": "2026-06-01",
        "SCRAPE_RUN_ID": "cookie-demo-run-007"
      },
      {
        "EVIDENCE_ID": 35,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "ground cinnamon",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 15,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-35",
        "RECORD_ID": "cookie-demo-11-08-035",
        "DATE_LOGGED": "2026-06-02",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "EVIDENCE_ID": 36,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 9,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 7,
        "LISTED_NAME_SUBSTANCE": "fine almond flour",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 25,
        "URL": "https://cookie-demo.example/sources/bluebird-archive#record-36",
        "RECORD_ID": "cookie-demo-11-09-036",
        "DATE_LOGGED": "2026-06-03",
        "SCRAPE_RUN_ID": "cookie-demo-run-007"
      },
      {
        "EVIDENCE_ID": 37,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 30,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-37",
        "RECORD_ID": "cookie-demo-12-01-037",
        "DATE_LOGGED": "2026-06-01",
        "SCRAPE_RUN_ID": "cookie-demo-run-001"
      },
      {
        "EVIDENCE_ID": 38,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-38",
        "RECORD_ID": "cookie-demo-12-02-038",
        "DATE_LOGGED": "2026-06-02",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 39,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-39",
        "RECORD_ID": "cookie-demo-12-03-039",
        "DATE_LOGGED": "2026-06-03",
        "SCRAPE_RUN_ID": "cookie-demo-run-001"
      },
      {
        "EVIDENCE_ID": 40,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 23,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-40",
        "RECORD_ID": "cookie-demo-12-04-040",
        "DATE_LOGGED": "2026-06-04",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "EVIDENCE_ID": 41,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 28,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-41",
        "RECORD_ID": "cookie-demo-12-05-041",
        "DATE_LOGGED": "2026-06-05",
        "SCRAPE_RUN_ID": "cookie-demo-run-001"
      },
      {
        "EVIDENCE_ID": 42,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 7,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "rolled oats",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 22,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-42",
        "RECORD_ID": "cookie-demo-12-07-042",
        "DATE_LOGGED": "2026-06-06",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      }
    ],
    "evidence_type": [
      {
        "EVIDENCE_TYPE_ID": 1,
        "EVIDENCE_TYPE_NAME": "Catalog listing"
      },
      {
        "EVIDENCE_TYPE_ID": 2,
        "EVIDENCE_TYPE_NAME": "Ingredient spec sheet"
      },
      {
        "EVIDENCE_TYPE_ID": 3,
        "EVIDENCE_TYPE_NAME": "Bakery menu"
      },
      {
        "EVIDENCE_TYPE_ID": 4,
        "EVIDENCE_TYPE_NAME": "Distributor listing"
      },
      {
        "EVIDENCE_TYPE_ID": 5,
        "EVIDENCE_TYPE_NAME": "Supplier profile"
      }
    ],
    "data_source": [
      {
        "DATA_SOURCE_ID": 1,
        "DATA_SOURCE_NAME": "Harbor Batch seasonal cookie menu",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu",
        "DATE_LOGGED": "2026-06-03",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "cookie-demo-run-001"
      },
      {
        "DATA_SOURCE_ID": 2,
        "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog",
        "DATA_SOURCE_TYPE": "catalog",
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog",
        "DATE_LOGGED": "2026-06-05",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "cookie-demo-run-002"
      },
      {
        "DATA_SOURCE_ID": 3,
        "DATA_SOURCE_NAME": "Northwind butter spec sheet",
        "DATA_SOURCE_TYPE": "ingredient_sheet",
        "URL": "https://cookie-demo.example/sources/northwind-butter-sheet",
        "DATE_LOGGED": "2026-06-08",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "cookie-demo-run-003"
      },
      {
        "DATA_SOURCE_ID": 4,
        "DATA_SOURCE_NAME": "Maple & Main online ingredient panel",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "URL": "https://cookie-demo.example/sources/maple-main-panel",
        "DATE_LOGGED": "2026-06-10",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "cookie-demo-run-004"
      },
      {
        "DATA_SOURCE_ID": 5,
        "DATA_SOURCE_NAME": "Cacao Coast supplier profile",
        "DATA_SOURCE_TYPE": "supplier_profile",
        "URL": "https://cookie-demo.example/sources/cacao-coast-profile",
        "DATE_LOGGED": "2026-06-12",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "cookie-demo-run-005"
      },
      {
        "DATA_SOURCE_ID": 6,
        "DATA_SOURCE_NAME": "Golden Crate distribution roster",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "URL": "https://cookie-demo.example/sources/golden-crate-roster",
        "DATE_LOGGED": "2026-06-15",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "cookie-demo-run-006"
      },
      {
        "DATA_SOURCE_ID": 7,
        "DATA_SOURCE_NAME": "Bluebird seasonal recipe archive",
        "DATA_SOURCE_TYPE": "recipe_archive",
        "URL": "https://cookie-demo.example/sources/bluebird-archive",
        "DATE_LOGGED": "2026-06-18",
        "PARENT_DATA_SOURCE_ID": "",
        "SCRAPE_RUN_ID": "cookie-demo-run-007"
      }
    ],
    "linkage": [
      {
        "LINKAGEID": 1,
        "COMPANY_ID": 1,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "DATA_SOURCE_ID": 1
      },
      {
        "LINKAGEID": 2,
        "COMPANY_ID": 2,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "DATA_SOURCE_ID": 4
      },
      {
        "LINKAGEID": 3,
        "COMPANY_ID": 10,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "DATA_SOURCE_ID": 4
      },
      {
        "LINKAGEID": 4,
        "COMPANY_ID": 11,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "DATA_SOURCE_ID": 7
      },
      {
        "LINKAGEID": 5,
        "COMPANY_ID": 3,
        "LINKAGE_METHOD": "Phone",
        "Linkage_Value_Type": "Phone",
        "LINKAGE_VALUE": "+1-414-555-0110",
        "DATA_SOURCE_ID": 2
      },
      {
        "LINKAGEID": 6,
        "COMPANY_ID": 5,
        "LINKAGE_METHOD": "Phone",
        "Linkage_Value_Type": "Phone",
        "LINKAGE_VALUE": "+1-414-555-0110",
        "DATA_SOURCE_ID": 3
      },
      {
        "LINKAGEID": 7,
        "COMPANY_ID": 9,
        "LINKAGE_METHOD": "Phone",
        "Linkage_Value_Type": "Phone",
        "LINKAGE_VALUE": "+1-414-555-0110",
        "DATA_SOURCE_ID": 2
      },
      {
        "LINKAGEID": 8,
        "COMPANY_ID": 7,
        "LINKAGE_METHOD": "Phone",
        "Linkage_Value_Type": "Phone",
        "LINKAGE_VALUE": "+1-773-555-0142",
        "DATA_SOURCE_ID": 6
      },
      {
        "LINKAGEID": 9,
        "COMPANY_ID": 8,
        "LINKAGE_METHOD": "Phone",
        "Linkage_Value_Type": "Phone",
        "LINKAGE_VALUE": "+1-773-555-0142",
        "DATA_SOURCE_ID": 6
      },
      {
        "LINKAGEID": 10,
        "COMPANY_ID": 4,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "vanilla@pantry-inputs.example",
        "DATA_SOURCE_ID": 2
      },
      {
        "LINKAGEID": 11,
        "COMPANY_ID": 6,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "vanilla@pantry-inputs.example",
        "DATA_SOURCE_ID": 5
      },
      {
        "LINKAGEID": 12,
        "COMPANY_ID": 12,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "coastal-orders@bakehouse-collective.example",
        "DATA_SOURCE_ID": 1
      },
      {
        "LINKAGEID": 13,
        "COMPANY_ID": 1,
        "LINKAGE_METHOD": "Phone",
        "Linkage_Value_Type": "Phone",
        "LINKAGE_VALUE": "+1-312-555-0188",
        "DATA_SOURCE_ID": 1
      },
      {
        "LINKAGEID": 14,
        "COMPANY_ID": 7,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "packing@fulfillment-partners.example",
        "DATA_SOURCE_ID": 6
      },
      {
        "LINKAGEID": 15,
        "COMPANY_ID": 8,
        "LINKAGE_METHOD": "Email",
        "Linkage_Value_Type": "Email",
        "LINKAGE_VALUE": "packing@fulfillment-partners.example",
        "DATA_SOURCE_ID": 6
      }
    ],
    "association": [
      {
        "ASSOCIATIONID": 1,
        "COMPANY_ID": 1,
        "ASSOCIATED_COMPANY_ID": 2,
        "LINKAGE_METHOD": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "LINKAGE_TYPE": "Shared production inbox",
        "DATA_SOURCE_ID": 4
      },
      {
        "ASSOCIATIONID": 2,
        "COMPANY_ID": 1,
        "ASSOCIATED_COMPANY_ID": 10,
        "LINKAGE_METHOD": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "LINKAGE_TYPE": "Shared production inbox",
        "DATA_SOURCE_ID": 4
      },
      {
        "ASSOCIATIONID": 3,
        "COMPANY_ID": 2,
        "ASSOCIATED_COMPANY_ID": 11,
        "LINKAGE_METHOD": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "LINKAGE_TYPE": "Shared production inbox",
        "DATA_SOURCE_ID": 7
      },
      {
        "ASSOCIATIONID": 4,
        "COMPANY_ID": 3,
        "ASSOCIATED_COMPANY_ID": 5,
        "LINKAGE_METHOD": "Phone",
        "LINKAGE_VALUE": "+1-414-555-0110",
        "LINKAGE_TYPE": "Shared procurement phone",
        "DATA_SOURCE_ID": 3
      },
      {
        "ASSOCIATIONID": 5,
        "COMPANY_ID": 3,
        "ASSOCIATED_COMPANY_ID": 9,
        "LINKAGE_METHOD": "Phone",
        "LINKAGE_VALUE": "+1-414-555-0110",
        "LINKAGE_TYPE": "Shared procurement phone",
        "DATA_SOURCE_ID": 2
      },
      {
        "ASSOCIATIONID": 6,
        "COMPANY_ID": 7,
        "ASSOCIATED_COMPANY_ID": 8,
        "LINKAGE_METHOD": "Phone",
        "LINKAGE_VALUE": "+1-773-555-0142",
        "LINKAGE_TYPE": "Shared fulfillment line",
        "DATA_SOURCE_ID": 6
      },
      {
        "ASSOCIATIONID": 7,
        "COMPANY_ID": 4,
        "ASSOCIATED_COMPANY_ID": 6,
        "LINKAGE_METHOD": "Email",
        "LINKAGE_VALUE": "vanilla@pantry-inputs.example",
        "LINKAGE_TYPE": "Shared imports inbox",
        "DATA_SOURCE_ID": 5
      },
      {
        "ASSOCIATIONID": 8,
        "COMPANY_ID": 1,
        "ASSOCIATED_COMPANY_ID": 12,
        "LINKAGE_METHOD": "Phone",
        "LINKAGE_VALUE": "+1-312-555-0188",
        "LINKAGE_TYPE": "Shared bakery office line",
        "DATA_SOURCE_ID": 1
      }
    ],
    "weighting_tag_type": [
      {
        "WEIGHTING_TAG_TYPE_ID": 1,
        "WEIGHTING_TAG_TYPE_TITLE": "Supply-chain signal"
      }
    ],
    "weighting_tag_category": [
      {
        "WEIGHTING_TAG_CATEGORY_ID": 1,
        "WEIGHTING_TAG_CATEGORY_TITLE": "Product profile",
        "WEIGHTING_TAG_TYPE_ID": 1
      },
      {
        "WEIGHTING_TAG_CATEGORY_ID": 2,
        "WEIGHTING_TAG_CATEGORY_TITLE": "Operational note",
        "WEIGHTING_TAG_TYPE_ID": 1
      },
      {
        "WEIGHTING_TAG_CATEGORY_ID": 3,
        "WEIGHTING_TAG_CATEGORY_TITLE": "Seasonality",
        "WEIGHTING_TAG_TYPE_ID": 1
      }
    ],
    "weighting_tag": [
      {
        "WEIGHTING_TAG_ID": 1,
        "WEIGHTING_TAG_TITLE": "Signature cookie line",
        "WEIGHTING_TAG_WEIGHT": 10,
        "WEIGHTING_TAG_DESCRIPTION": "Appears in a highlighted or signature product line.",
        "WEIGHTING_TAG_CATEGORY_ID": 1
      },
      {
        "WEIGHTING_TAG_ID": 2,
        "WEIGHTING_TAG_TITLE": "Cold-chain handling",
        "WEIGHTING_TAG_WEIGHT": 8,
        "WEIGHTING_TAG_DESCRIPTION": "Requires careful storage or temperature handling.",
        "WEIGHTING_TAG_CATEGORY_ID": 2
      },
      {
        "WEIGHTING_TAG_ID": 3,
        "WEIGHTING_TAG_TITLE": "Private-label partner",
        "WEIGHTING_TAG_WEIGHT": 7,
        "WEIGHTING_TAG_DESCRIPTION": "Supports co-manufacturing or private-label output.",
        "WEIGHTING_TAG_CATEGORY_ID": 2
      },
      {
        "WEIGHTING_TAG_ID": 4,
        "WEIGHTING_TAG_TITLE": "Seasonal rotation",
        "WEIGHTING_TAG_WEIGHT": 5,
        "WEIGHTING_TAG_DESCRIPTION": "Referenced in seasonal or limited-run assortment pages.",
        "WEIGHTING_TAG_CATEGORY_ID": 3
      },
      {
        "WEIGHTING_TAG_ID": 5,
        "WEIGHTING_TAG_TITLE": "Organic positioning",
        "WEIGHTING_TAG_WEIGHT": 6,
        "WEIGHTING_TAG_DESCRIPTION": "Markets an organic or specialty sourcing claim.",
        "WEIGHTING_TAG_CATEGORY_ID": 1
      }
    ],
    "company_weighting_tag": [
      {
        "COMPANY_WEIGHTING_TAG_ID": 1,
        "COMPANY_ID": 1,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "COMPANY_WEIGHTING_TAG_ID": 2,
        "COMPANY_ID": 2,
        "WEIGHTING_TAG_ID": 4
      },
      {
        "COMPANY_WEIGHTING_TAG_ID": 3,
        "COMPANY_ID": 5,
        "WEIGHTING_TAG_ID": 2
      },
      {
        "COMPANY_WEIGHTING_TAG_ID": 4,
        "COMPANY_ID": 7,
        "WEIGHTING_TAG_ID": 3
      },
      {
        "COMPANY_WEIGHTING_TAG_ID": 5,
        "COMPANY_ID": 10,
        "WEIGHTING_TAG_ID": 3
      },
      {
        "COMPANY_WEIGHTING_TAG_ID": 6,
        "COMPANY_ID": 11,
        "WEIGHTING_TAG_ID": 5
      },
      {
        "COMPANY_WEIGHTING_TAG_ID": 7,
        "COMPANY_ID": 12,
        "WEIGHTING_TAG_ID": 1
      }
    ],
    "evidence_weighting_tag": [
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 1,
        "EVIDENCE_ID": 1,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 2,
        "EVIDENCE_ID": 3,
        "WEIGHTING_TAG_ID": 2
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 3,
        "EVIDENCE_ID": 5,
        "WEIGHTING_TAG_ID": 5
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 4,
        "EVIDENCE_ID": 7,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 5,
        "EVIDENCE_ID": 9,
        "WEIGHTING_TAG_ID": 2
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 6,
        "EVIDENCE_ID": 11,
        "WEIGHTING_TAG_ID": 5
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 7,
        "EVIDENCE_ID": 13,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 8,
        "EVIDENCE_ID": 16,
        "WEIGHTING_TAG_ID": 2
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 9,
        "EVIDENCE_ID": 17,
        "WEIGHTING_TAG_ID": 5
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 10,
        "EVIDENCE_ID": 20,
        "WEIGHTING_TAG_ID": 5
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 11,
        "EVIDENCE_ID": 22,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 12,
        "EVIDENCE_ID": 23,
        "WEIGHTING_TAG_ID": 5
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 13,
        "EVIDENCE_ID": 24,
        "WEIGHTING_TAG_ID": 3
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 14,
        "EVIDENCE_ID": 26,
        "WEIGHTING_TAG_ID": 3
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 15,
        "EVIDENCE_ID": 27,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 16,
        "EVIDENCE_ID": 29,
        "WEIGHTING_TAG_ID": 2
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 17,
        "EVIDENCE_ID": 30,
        "WEIGHTING_TAG_ID": 5
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 18,
        "EVIDENCE_ID": 31,
        "WEIGHTING_TAG_ID": 3
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 19,
        "EVIDENCE_ID": 32,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 20,
        "EVIDENCE_ID": 37,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 21,
        "EVIDENCE_ID": 39,
        "WEIGHTING_TAG_ID": 2
      },
      {
        "EVIDENCE_WEIGHTING_TAG_ID": 22,
        "EVIDENCE_ID": 41,
        "WEIGHTING_TAG_ID": 5
      }
    ],
    "substance_weighting_tag": [
      {
        "SUBSTANCE_WEIGHTING_TAG_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 1,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "SUBSTANCE_WEIGHTING_TAG_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 3,
        "WEIGHTING_TAG_ID": 2
      },
      {
        "SUBSTANCE_WEIGHTING_TAG_ID": 3,
        "SUBSTANCE_REFERENCE_ID": 5,
        "WEIGHTING_TAG_ID": 1
      },
      {
        "SUBSTANCE_WEIGHTING_TAG_ID": 4,
        "SUBSTANCE_REFERENCE_ID": 9,
        "WEIGHTING_TAG_ID": 5
      }
    ],
    "company_evaluation": [
      {
        "COMPANY_ID": 1,
        "COMPANY_NAME": "Harbor Batch Bakery",
        "EVIDENCE_COMPANY_WEIGHT": 137,
        "TOTAL_WEIGHT": 184
      },
      {
        "COMPANY_ID": 2,
        "COMPANY_NAME": "Maple & Main Cookie Co.",
        "EVIDENCE_COMPANY_WEIGHT": 146,
        "TOTAL_WEIGHT": 189
      },
      {
        "COMPANY_ID": 3,
        "COMPANY_NAME": "Sunfield Flour Mills",
        "EVIDENCE_COMPANY_WEIGHT": 47,
        "TOTAL_WEIGHT": 61
      },
      {
        "COMPANY_ID": 4,
        "COMPANY_NAME": "Orchard Vanilla Imports",
        "EVIDENCE_COMPANY_WEIGHT": 26,
        "TOTAL_WEIGHT": 31
      },
      {
        "COMPANY_ID": 5,
        "COMPANY_NAME": "Northwind Butter Works",
        "EVIDENCE_COMPANY_WEIGHT": 26,
        "TOTAL_WEIGHT": 41
      },
      {
        "COMPANY_ID": 6,
        "COMPANY_NAME": "Cacao Coast Ingredients",
        "EVIDENCE_COMPANY_WEIGHT": 63,
        "TOTAL_WEIGHT": 77
      },
      {
        "COMPANY_ID": 7,
        "COMPANY_NAME": "Spruce Street Packing",
        "EVIDENCE_COMPANY_WEIGHT": 48,
        "TOTAL_WEIGHT": 65
      },
      {
        "COMPANY_ID": 8,
        "COMPANY_NAME": "Golden Crate Logistics",
        "EVIDENCE_COMPANY_WEIGHT": 89,
        "TOTAL_WEIGHT": 110
      },
      {
        "COMPANY_ID": 9,
        "COMPANY_NAME": "Clover Cane Sugars",
        "EVIDENCE_COMPANY_WEIGHT": 35,
        "TOTAL_WEIGHT": 46
      },
      {
        "COMPANY_ID": 10,
        "COMPANY_NAME": "Copper Kettle Kitchen",
        "EVIDENCE_COMPANY_WEIGHT": 136,
        "TOTAL_WEIGHT": 177
      },
      {
        "COMPANY_ID": 11,
        "COMPANY_NAME": "Bluebird Oven Foods",
        "EVIDENCE_COMPANY_WEIGHT": 113,
        "TOTAL_WEIGHT": 147
      },
      {
        "COMPANY_ID": 12,
        "COMPANY_NAME": "Seaside Biscuit Works",
        "EVIDENCE_COMPANY_WEIGHT": 155,
        "TOTAL_WEIGHT": 205
      }
    ],
    "evidence_summary": [
      {
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 31
      },
      {
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 21
      },
      {
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "evidence_count": 1,
        "total_weight": 25
      },
      {
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 22
      },
      {
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 25
      },
      {
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 2,
        "evidence_count": 1,
        "total_weight": 13
      },
      {
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 32
      },
      {
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 22
      },
      {
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "evidence_count": 1,
        "total_weight": 26
      },
      {
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 23
      },
      {
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 26
      },
      {
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 2,
        "evidence_count": 1,
        "total_weight": 17
      },
      {
        "COMPANY_ID": 3,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 26
      },
      {
        "COMPANY_ID": 3,
        "SUBSTANCE_REFERENCE_ID": 9,
        "EVIDENCE_TYPE_ID": 2,
        "evidence_count": 1,
        "total_weight": 21
      },
      {
        "COMPANY_ID": 4,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 5,
        "evidence_count": 1,
        "total_weight": 26
      },
      {
        "COMPANY_ID": 5,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "evidence_count": 1,
        "total_weight": 26
      },
      {
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 5,
        "evidence_count": 1,
        "total_weight": 32
      },
      {
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 10
      },
      {
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 5,
        "evidence_count": 1,
        "total_weight": 21
      },
      {
        "COMPANY_ID": 7,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 31
      },
      {
        "COMPANY_ID": 7,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 17
      },
      {
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 34
      },
      {
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 32
      },
      {
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 23
      },
      {
        "COMPANY_ID": 9,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 20
      },
      {
        "COMPANY_ID": 9,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 15
      },
      {
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 31
      },
      {
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 27
      },
      {
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 27
      },
      {
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 31
      },
      {
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 20
      },
      {
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 32
      },
      {
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 19
      },
      {
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 7,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 22
      },
      {
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 1,
        "evidence_count": 1,
        "total_weight": 15
      },
      {
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 9,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 25
      },
      {
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 30
      },
      {
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 26
      },
      {
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 26
      },
      {
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 23
      },
      {
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 3,
        "evidence_count": 1,
        "total_weight": 28
      },
      {
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 7,
        "EVIDENCE_TYPE_ID": 4,
        "evidence_count": 1,
        "total_weight": 22
      }
    ],
    "company_network_size": [
      {
        "COMPANY_ID": 1,
        "COMPANY_NAME": "Harbor Batch Bakery",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Midwest",
        "GOV_COMPLICITY": "Retail bakery",
        "connection_count": 3
      },
      {
        "COMPANY_ID": 2,
        "COMPANY_NAME": "Maple & Main Cookie Co.",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Northeast",
        "GOV_COMPLICITY": "Regional bakery",
        "connection_count": 2
      },
      {
        "COMPANY_ID": 3,
        "COMPANY_NAME": "Sunfield Flour Mills",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Great Lakes",
        "GOV_COMPLICITY": "Flour mill",
        "connection_count": 2
      },
      {
        "COMPANY_ID": 4,
        "COMPANY_NAME": "Orchard Vanilla Imports",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Importer",
        "PRC_HOME_BASE": "East Coast",
        "GOV_COMPLICITY": "Flavor importer",
        "connection_count": 1
      },
      {
        "COMPANY_ID": 5,
        "COMPANY_NAME": "Northwind Butter Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Dairy Processor",
        "PRC_HOME_BASE": "Wisconsin",
        "GOV_COMPLICITY": "Butter supplier",
        "connection_count": 1
      },
      {
        "COMPANY_ID": 6,
        "COMPANY_NAME": "Cacao Coast Ingredients",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "West Coast",
        "GOV_COMPLICITY": "Chocolate ingredient supplier",
        "connection_count": 1
      },
      {
        "COMPANY_ID": 7,
        "COMPANY_NAME": "Spruce Street Packing",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Co-Packer",
        "PRC_HOME_BASE": "Midwest",
        "GOV_COMPLICITY": "Packaging partner",
        "connection_count": 1
      },
      {
        "COMPANY_ID": 8,
        "COMPANY_NAME": "Golden Crate Logistics",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Distributor",
        "PRC_HOME_BASE": "National",
        "GOV_COMPLICITY": "Distribution partner",
        "connection_count": 1
      },
      {
        "COMPANY_ID": 9,
        "COMPANY_NAME": "Clover Cane Sugars",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Gulf Coast",
        "GOV_COMPLICITY": "Sugar refiner",
        "connection_count": 1
      },
      {
        "COMPANY_ID": 10,
        "COMPANY_NAME": "Copper Kettle Kitchen",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Contract Bakery",
        "PRC_HOME_BASE": "South",
        "GOV_COMPLICITY": "Private-label bakery",
        "connection_count": 1
      },
      {
        "COMPANY_ID": 11,
        "COMPANY_NAME": "Bluebird Oven Foods",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Pacific Northwest",
        "GOV_COMPLICITY": "Regional bakery",
        "connection_count": 1
      },
      {
        "COMPANY_ID": 12,
        "COMPANY_NAME": "Seaside Biscuit Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Southeast",
        "GOV_COMPLICITY": "Retail bakery",
        "connection_count": 1
      }
    ],
    "company_score_v2": [
      {
        "COMPANY_ID": 12,
        "COMPANY_NAME": "Seaside Biscuit Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Southeast",
        "GOV_COMPLICITY": "Retail bakery",
        "evidence_score": 155,
        "substance_score": 113,
        "company_tag_score": 10,
        "total_score_v2": 205,
        "legacy_score": 165,
        "evidence_count": 6,
        "substances_linked": 6
      },
      {
        "COMPANY_ID": 2,
        "COMPANY_NAME": "Maple & Main Cookie Co.",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Northeast",
        "GOV_COMPLICITY": "Regional bakery",
        "evidence_score": 146,
        "substance_score": 110,
        "company_tag_score": 5,
        "total_score_v2": 189,
        "legacy_score": 151,
        "evidence_count": 6,
        "substances_linked": 6
      },
      {
        "COMPANY_ID": 1,
        "COMPANY_NAME": "Harbor Batch Bakery",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Midwest",
        "GOV_COMPLICITY": "Retail bakery",
        "evidence_score": 137,
        "substance_score": 107,
        "company_tag_score": 10,
        "total_score_v2": 184,
        "legacy_score": 147,
        "evidence_count": 6,
        "substances_linked": 6
      },
      {
        "COMPANY_ID": 10,
        "COMPANY_NAME": "Copper Kettle Kitchen",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Contract Bakery",
        "PRC_HOME_BASE": "South",
        "GOV_COMPLICITY": "Private-label bakery",
        "evidence_score": 136,
        "substance_score": 97,
        "company_tag_score": 7,
        "total_score_v2": 177,
        "legacy_score": 143,
        "evidence_count": 5,
        "substances_linked": 5
      },
      {
        "COMPANY_ID": 11,
        "COMPANY_NAME": "Bluebird Oven Foods",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Bakery",
        "PRC_HOME_BASE": "Pacific Northwest",
        "GOV_COMPLICITY": "Regional bakery",
        "evidence_score": 113,
        "substance_score": 81,
        "company_tag_score": 6,
        "total_score_v2": 147,
        "legacy_score": 119,
        "evidence_count": 5,
        "substances_linked": 5
      },
      {
        "COMPANY_ID": 8,
        "COMPANY_NAME": "Golden Crate Logistics",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Distributor",
        "PRC_HOME_BASE": "National",
        "GOV_COMPLICITY": "Distribution partner",
        "evidence_score": 89,
        "substance_score": 59,
        "company_tag_score": 0,
        "total_score_v2": 110,
        "legacy_score": 89,
        "evidence_count": 3,
        "substances_linked": 3
      },
      {
        "COMPANY_ID": 6,
        "COMPANY_NAME": "Cacao Coast Ingredients",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "West Coast",
        "GOV_COMPLICITY": "Chocolate ingredient supplier",
        "evidence_score": 63,
        "substance_score": 41,
        "company_tag_score": 0,
        "total_score_v2": 77,
        "legacy_score": 63,
        "evidence_count": 3,
        "substances_linked": 3
      },
      {
        "COMPANY_ID": 7,
        "COMPANY_NAME": "Spruce Street Packing",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Co-Packer",
        "PRC_HOME_BASE": "Midwest",
        "GOV_COMPLICITY": "Packaging partner",
        "evidence_score": 48,
        "substance_score": 30,
        "company_tag_score": 7,
        "total_score_v2": 65,
        "legacy_score": 55,
        "evidence_count": 2,
        "substances_linked": 2
      },
      {
        "COMPANY_ID": 3,
        "COMPANY_NAME": "Sunfield Flour Mills",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Great Lakes",
        "GOV_COMPLICITY": "Flour mill",
        "evidence_score": 47,
        "substance_score": 41,
        "company_tag_score": 0,
        "total_score_v2": 61,
        "legacy_score": 47,
        "evidence_count": 2,
        "substances_linked": 2
      },
      {
        "COMPANY_ID": 9,
        "COMPANY_NAME": "Clover Cane Sugars",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Ingredient Supplier",
        "PRC_HOME_BASE": "Gulf Coast",
        "GOV_COMPLICITY": "Sugar refiner",
        "evidence_score": 35,
        "substance_score": 31,
        "company_tag_score": 0,
        "total_score_v2": 46,
        "legacy_score": 35,
        "evidence_count": 2,
        "substances_linked": 2
      },
      {
        "COMPANY_ID": 5,
        "COMPANY_NAME": "Northwind Butter Works",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Dairy Processor",
        "PRC_HOME_BASE": "Wisconsin",
        "GOV_COMPLICITY": "Butter supplier",
        "evidence_score": 26,
        "substance_score": 20,
        "company_tag_score": 8,
        "total_score_v2": 41,
        "legacy_score": 34,
        "evidence_count": 1,
        "substances_linked": 1
      },
      {
        "COMPANY_ID": 4,
        "COMPANY_NAME": "Orchard Vanilla Imports",
        "CHINESE_NAME": "",
        "ACTIVE_INACTIVE": "Active",
        "BUSINESS_TYPE": "Importer",
        "PRC_HOME_BASE": "East Coast",
        "GOV_COMPLICITY": "Flavor importer",
        "evidence_score": 26,
        "substance_score": 15,
        "company_tag_score": 0,
        "total_score_v2": 31,
        "legacy_score": 26,
        "evidence_count": 1,
        "substances_linked": 1
      }
    ],
    "substance_datasource_summary": [
      {
        "SUBSTANCE_REFERENCE_ID": 4,
        "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog",
        "DATA_SOURCE_TYPE": "catalog",
        "mention_count": 4
      },
      {
        "SUBSTANCE_REFERENCE_ID": 2,
        "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog",
        "DATA_SOURCE_TYPE": "catalog",
        "mention_count": 3
      },
      {
        "SUBSTANCE_REFERENCE_ID": 5,
        "DATA_SOURCE_NAME": "Golden Crate distribution roster",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "mention_count": 3
      },
      {
        "SUBSTANCE_REFERENCE_ID": 1,
        "DATA_SOURCE_NAME": "Harbor Batch seasonal cookie menu",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "mention_count": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 1,
        "DATA_SOURCE_NAME": "Maple & Main online ingredient panel",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "mention_count": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 2,
        "DATA_SOURCE_NAME": "Golden Crate distribution roster",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "mention_count": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 3,
        "DATA_SOURCE_NAME": "Harbor Batch seasonal cookie menu",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "mention_count": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 3,
        "DATA_SOURCE_NAME": "Maple & Main online ingredient panel",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "mention_count": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 5,
        "DATA_SOURCE_NAME": "Harbor Batch seasonal cookie menu",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "mention_count": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 6,
        "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog",
        "DATA_SOURCE_TYPE": "catalog",
        "mention_count": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 8,
        "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog",
        "DATA_SOURCE_TYPE": "catalog",
        "mention_count": 2
      },
      {
        "SUBSTANCE_REFERENCE_ID": 1,
        "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog",
        "DATA_SOURCE_TYPE": "catalog",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 1,
        "DATA_SOURCE_NAME": "Golden Crate distribution roster",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 1,
        "DATA_SOURCE_NAME": "Bluebird seasonal recipe archive",
        "DATA_SOURCE_TYPE": "recipe_archive",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 3,
        "DATA_SOURCE_NAME": "Northwind butter spec sheet",
        "DATA_SOURCE_TYPE": "ingredient_sheet",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 4,
        "DATA_SOURCE_NAME": "Golden Crate distribution roster",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 5,
        "DATA_SOURCE_NAME": "Maple & Main online ingredient panel",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 5,
        "DATA_SOURCE_NAME": "Cacao Coast supplier profile",
        "DATA_SOURCE_TYPE": "supplier_profile",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 6,
        "DATA_SOURCE_NAME": "Golden Crate distribution roster",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 7,
        "DATA_SOURCE_NAME": "Bluebird seasonal recipe archive",
        "DATA_SOURCE_TYPE": "recipe_archive",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 7,
        "DATA_SOURCE_NAME": "Golden Crate distribution roster",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 8,
        "DATA_SOURCE_NAME": "Cacao Coast supplier profile",
        "DATA_SOURCE_TYPE": "supplier_profile",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 9,
        "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog",
        "DATA_SOURCE_TYPE": "catalog",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 9,
        "DATA_SOURCE_NAME": "Bluebird seasonal recipe archive",
        "DATA_SOURCE_TYPE": "recipe_archive",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 10,
        "DATA_SOURCE_NAME": "Golden Crate distribution roster",
        "DATA_SOURCE_TYPE": "distributor_listing",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 10,
        "DATA_SOURCE_NAME": "Pantry inputs wholesale catalog",
        "DATA_SOURCE_TYPE": "catalog",
        "mention_count": 1
      },
      {
        "SUBSTANCE_REFERENCE_ID": 10,
        "DATA_SOURCE_NAME": "Maple & Main online ingredient panel",
        "DATA_SOURCE_TYPE": "bakery_menu",
        "mention_count": 1
      }
    ],
    "evidence_readable": [
      {
        "EVIDENCE_ID": 1,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 31,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-1",
        "RECORD_ID": "cookie-demo-01-01-001",
        "DATE_LOGGED": "2026-06-03",
        "SCRAPE_RUN_ID": "cookie-demo-run-001",
        "company_name": "Harbor Batch Bakery",
        "substance_name": "All-purpose flour",
        "evidence_type": "Bakery menu",
        "data_source": "Harbor Batch seasonal cookie menu"
      },
      {
        "EVIDENCE_ID": 2,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 21,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-2",
        "RECORD_ID": "cookie-demo-01-02-002",
        "DATE_LOGGED": "2026-06-04",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Harbor Batch Bakery",
        "substance_name": "Brown sugar",
        "evidence_type": "Catalog listing",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 3,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 25,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-3",
        "RECORD_ID": "cookie-demo-01-03-003",
        "DATE_LOGGED": "2026-06-05",
        "SCRAPE_RUN_ID": "cookie-demo-run-001",
        "company_name": "Harbor Batch Bakery",
        "substance_name": "Cultured butter",
        "evidence_type": "Ingredient spec sheet",
        "data_source": "Harbor Batch seasonal cookie menu"
      },
      {
        "EVIDENCE_ID": 4,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 22,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-4",
        "RECORD_ID": "cookie-demo-01-04-004",
        "DATE_LOGGED": "2026-06-06",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Harbor Batch Bakery",
        "substance_name": "Madagascar vanilla extract",
        "evidence_type": "Bakery menu",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 5,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 25,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-5",
        "RECORD_ID": "cookie-demo-01-05-005",
        "DATE_LOGGED": "2026-06-07",
        "SCRAPE_RUN_ID": "cookie-demo-run-001",
        "company_name": "Harbor Batch Bakery",
        "substance_name": "Semisweet chocolate chips",
        "evidence_type": "Catalog listing",
        "data_source": "Harbor Batch seasonal cookie menu"
      },
      {
        "EVIDENCE_ID": 6,
        "COMPANY_ID": 1,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "flaky sea salt",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 13,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-6",
        "RECORD_ID": "cookie-demo-01-06-006",
        "DATE_LOGGED": "2026-06-08",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Harbor Batch Bakery",
        "substance_name": "Sea salt",
        "evidence_type": "Ingredient spec sheet",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 7,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 32,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-7",
        "RECORD_ID": "cookie-demo-02-01-007",
        "DATE_LOGGED": "2026-06-05",
        "SCRAPE_RUN_ID": "cookie-demo-run-004",
        "company_name": "Maple & Main Cookie Co.",
        "substance_name": "All-purpose flour",
        "evidence_type": "Bakery menu",
        "data_source": "Maple & Main online ingredient panel"
      },
      {
        "EVIDENCE_ID": 8,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 22,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-8",
        "RECORD_ID": "cookie-demo-02-02-008",
        "DATE_LOGGED": "2026-06-06",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Maple & Main Cookie Co.",
        "substance_name": "Brown sugar",
        "evidence_type": "Catalog listing",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 9,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-9",
        "RECORD_ID": "cookie-demo-02-03-009",
        "DATE_LOGGED": "2026-06-07",
        "SCRAPE_RUN_ID": "cookie-demo-run-004",
        "company_name": "Maple & Main Cookie Co.",
        "substance_name": "Cultured butter",
        "evidence_type": "Ingredient spec sheet",
        "data_source": "Maple & Main online ingredient panel"
      },
      {
        "EVIDENCE_ID": 10,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 23,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-10",
        "RECORD_ID": "cookie-demo-02-04-010",
        "DATE_LOGGED": "2026-06-08",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Maple & Main Cookie Co.",
        "substance_name": "Madagascar vanilla extract",
        "evidence_type": "Bakery menu",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 11,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-11",
        "RECORD_ID": "cookie-demo-02-05-011",
        "DATE_LOGGED": "2026-06-09",
        "SCRAPE_RUN_ID": "cookie-demo-run-004",
        "company_name": "Maple & Main Cookie Co.",
        "substance_name": "Semisweet chocolate chips",
        "evidence_type": "Catalog listing",
        "data_source": "Maple & Main online ingredient panel"
      },
      {
        "EVIDENCE_ID": 12,
        "COMPANY_ID": 2,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "ground cinnamon",
        "REGION": "Northeast",
        "EVIDENCE_WEIGHT": 17,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-12",
        "RECORD_ID": "cookie-demo-02-08-012",
        "DATE_LOGGED": "2026-06-10",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Maple & Main Cookie Co.",
        "substance_name": "Cinnamon",
        "evidence_type": "Ingredient spec sheet",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 13,
        "COMPANY_ID": 3,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Great Lakes",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-13",
        "RECORD_ID": "cookie-demo-03-01-013",
        "DATE_LOGGED": "2026-06-07",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Sunfield Flour Mills",
        "substance_name": "All-purpose flour",
        "evidence_type": "Catalog listing",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 14,
        "COMPANY_ID": 3,
        "SUBSTANCE_REFERENCE_ID": 9,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "fine almond flour",
        "REGION": "Great Lakes",
        "EVIDENCE_WEIGHT": 21,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-14",
        "RECORD_ID": "cookie-demo-03-09-014",
        "DATE_LOGGED": "2026-06-08",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Sunfield Flour Mills",
        "substance_name": "Almond flour",
        "evidence_type": "Ingredient spec sheet",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 15,
        "COMPANY_ID": 4,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 5,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "East Coast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-15",
        "RECORD_ID": "cookie-demo-04-04-015",
        "DATE_LOGGED": "2026-06-09",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Orchard Vanilla Imports",
        "substance_name": "Madagascar vanilla extract",
        "evidence_type": "Supplier profile",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 16,
        "COMPANY_ID": 5,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 2,
        "DATA_SOURCE_ID": 3,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "Wisconsin",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/northwind-butter-sheet#record-16",
        "RECORD_ID": "cookie-demo-05-03-016",
        "DATE_LOGGED": "2026-06-11",
        "SCRAPE_RUN_ID": "cookie-demo-run-003",
        "company_name": "Northwind Butter Works",
        "substance_name": "Cultured butter",
        "evidence_type": "Ingredient spec sheet",
        "data_source": "Northwind butter spec sheet"
      },
      {
        "EVIDENCE_ID": 17,
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 5,
        "DATA_SOURCE_ID": 5,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "West Coast",
        "EVIDENCE_WEIGHT": 32,
        "URL": "https://cookie-demo.example/sources/cacao-coast-profile#record-17",
        "RECORD_ID": "cookie-demo-06-05-017",
        "DATE_LOGGED": "2026-06-13",
        "SCRAPE_RUN_ID": "cookie-demo-run-005",
        "company_name": "Cacao Coast Ingredients",
        "substance_name": "Semisweet chocolate chips",
        "evidence_type": "Supplier profile",
        "data_source": "Cacao Coast supplier profile"
      },
      {
        "EVIDENCE_ID": 18,
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "flaky sea salt",
        "REGION": "West Coast",
        "EVIDENCE_WEIGHT": 10,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-18",
        "RECORD_ID": "cookie-demo-06-06-018",
        "DATE_LOGGED": "2026-06-14",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Cacao Coast Ingredients",
        "substance_name": "Sea salt",
        "evidence_type": "Catalog listing",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 19,
        "COMPANY_ID": 6,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 5,
        "DATA_SOURCE_ID": 5,
        "LISTED_NAME_SUBSTANCE": "ground cinnamon",
        "REGION": "West Coast",
        "EVIDENCE_WEIGHT": 21,
        "URL": "https://cookie-demo.example/sources/cacao-coast-profile#record-19",
        "RECORD_ID": "cookie-demo-06-08-019",
        "DATE_LOGGED": "2026-06-15",
        "SCRAPE_RUN_ID": "cookie-demo-run-005",
        "company_name": "Cacao Coast Ingredients",
        "substance_name": "Cinnamon",
        "evidence_type": "Supplier profile",
        "data_source": "Cacao Coast supplier profile"
      },
      {
        "EVIDENCE_ID": 20,
        "COMPANY_ID": 7,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 31,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-20",
        "RECORD_ID": "cookie-demo-07-05-020",
        "DATE_LOGGED": "2026-06-15",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Spruce Street Packing",
        "substance_name": "Semisweet chocolate chips",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 21,
        "COMPANY_ID": 7,
        "SUBSTANCE_REFERENCE_ID": 6,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "flaky sea salt",
        "REGION": "Midwest",
        "EVIDENCE_WEIGHT": 17,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-21",
        "RECORD_ID": "cookie-demo-07-06-021",
        "DATE_LOGGED": "2026-06-16",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Spruce Street Packing",
        "substance_name": "Sea salt",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 22,
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "National",
        "EVIDENCE_WEIGHT": 34,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-22",
        "RECORD_ID": "cookie-demo-08-01-022",
        "DATE_LOGGED": "2026-06-17",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Golden Crate Logistics",
        "substance_name": "All-purpose flour",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 23,
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "National",
        "EVIDENCE_WEIGHT": 32,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-23",
        "RECORD_ID": "cookie-demo-08-05-023",
        "DATE_LOGGED": "2026-06-18",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Golden Crate Logistics",
        "substance_name": "Semisweet chocolate chips",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 24,
        "COMPANY_ID": 8,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "blackstrap molasses",
        "REGION": "National",
        "EVIDENCE_WEIGHT": 23,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-24",
        "RECORD_ID": "cookie-demo-08-10-024",
        "DATE_LOGGED": "2026-06-19",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Golden Crate Logistics",
        "substance_name": "Molasses",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 25,
        "COMPANY_ID": 9,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "Gulf Coast",
        "EVIDENCE_WEIGHT": 20,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-25",
        "RECORD_ID": "cookie-demo-09-02-025",
        "DATE_LOGGED": "2026-06-19",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Clover Cane Sugars",
        "substance_name": "Brown sugar",
        "evidence_type": "Catalog listing",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 26,
        "COMPANY_ID": 9,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "blackstrap molasses",
        "REGION": "Gulf Coast",
        "EVIDENCE_WEIGHT": 15,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-26",
        "RECORD_ID": "cookie-demo-09-10-026",
        "DATE_LOGGED": "2026-06-20",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Clover Cane Sugars",
        "substance_name": "Molasses",
        "evidence_type": "Catalog listing",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 27,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 31,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-27",
        "RECORD_ID": "cookie-demo-10-01-027",
        "DATE_LOGGED": "2026-06-21",
        "SCRAPE_RUN_ID": "cookie-demo-run-004",
        "company_name": "Copper Kettle Kitchen",
        "substance_name": "All-purpose flour",
        "evidence_type": "Bakery menu",
        "data_source": "Maple & Main online ingredient panel"
      },
      {
        "EVIDENCE_ID": 28,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 27,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-28",
        "RECORD_ID": "cookie-demo-10-02-028",
        "DATE_LOGGED": "2026-06-22",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Copper Kettle Kitchen",
        "substance_name": "Brown sugar",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 29,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 27,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-29",
        "RECORD_ID": "cookie-demo-10-03-029",
        "DATE_LOGGED": "2026-06-23",
        "SCRAPE_RUN_ID": "cookie-demo-run-004",
        "company_name": "Copper Kettle Kitchen",
        "substance_name": "Cultured butter",
        "evidence_type": "Bakery menu",
        "data_source": "Maple & Main online ingredient panel"
      },
      {
        "EVIDENCE_ID": 30,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 31,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-30",
        "RECORD_ID": "cookie-demo-10-05-030",
        "DATE_LOGGED": "2026-06-24",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Copper Kettle Kitchen",
        "substance_name": "Semisweet chocolate chips",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 31,
        "COMPANY_ID": 10,
        "SUBSTANCE_REFERENCE_ID": 10,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 4,
        "LISTED_NAME_SUBSTANCE": "blackstrap molasses",
        "REGION": "South",
        "EVIDENCE_WEIGHT": 20,
        "URL": "https://cookie-demo.example/sources/maple-main-panel#record-31",
        "RECORD_ID": "cookie-demo-10-10-031",
        "DATE_LOGGED": "2026-06-01",
        "SCRAPE_RUN_ID": "cookie-demo-run-004",
        "company_name": "Copper Kettle Kitchen",
        "substance_name": "Molasses",
        "evidence_type": "Bakery menu",
        "data_source": "Maple & Main online ingredient panel"
      },
      {
        "EVIDENCE_ID": 32,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 7,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 32,
        "URL": "https://cookie-demo.example/sources/bluebird-archive#record-32",
        "RECORD_ID": "cookie-demo-11-01-032",
        "DATE_LOGGED": "2026-06-23",
        "SCRAPE_RUN_ID": "cookie-demo-run-007",
        "company_name": "Bluebird Oven Foods",
        "substance_name": "All-purpose flour",
        "evidence_type": "Bakery menu",
        "data_source": "Bluebird seasonal recipe archive"
      },
      {
        "EVIDENCE_ID": 33,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 19,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-33",
        "RECORD_ID": "cookie-demo-11-04-033",
        "DATE_LOGGED": "2026-06-24",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Bluebird Oven Foods",
        "substance_name": "Madagascar vanilla extract",
        "evidence_type": "Catalog listing",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 34,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 7,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 7,
        "LISTED_NAME_SUBSTANCE": "rolled oats",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 22,
        "URL": "https://cookie-demo.example/sources/bluebird-archive#record-34",
        "RECORD_ID": "cookie-demo-11-07-034",
        "DATE_LOGGED": "2026-06-01",
        "SCRAPE_RUN_ID": "cookie-demo-run-007",
        "company_name": "Bluebird Oven Foods",
        "substance_name": "Rolled oats",
        "evidence_type": "Bakery menu",
        "data_source": "Bluebird seasonal recipe archive"
      },
      {
        "EVIDENCE_ID": 35,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 8,
        "EVIDENCE_TYPE_ID": 1,
        "DATA_SOURCE_ID": 2,
        "LISTED_NAME_SUBSTANCE": "ground cinnamon",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 15,
        "URL": "https://cookie-demo.example/sources/pantry-inputs-catalog#record-35",
        "RECORD_ID": "cookie-demo-11-08-035",
        "DATE_LOGGED": "2026-06-02",
        "SCRAPE_RUN_ID": "cookie-demo-run-002",
        "company_name": "Bluebird Oven Foods",
        "substance_name": "Cinnamon",
        "evidence_type": "Catalog listing",
        "data_source": "Pantry inputs wholesale catalog"
      },
      {
        "EVIDENCE_ID": 36,
        "COMPANY_ID": 11,
        "SUBSTANCE_REFERENCE_ID": 9,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 7,
        "LISTED_NAME_SUBSTANCE": "fine almond flour",
        "REGION": "Pacific Northwest",
        "EVIDENCE_WEIGHT": 25,
        "URL": "https://cookie-demo.example/sources/bluebird-archive#record-36",
        "RECORD_ID": "cookie-demo-11-09-036",
        "DATE_LOGGED": "2026-06-03",
        "SCRAPE_RUN_ID": "cookie-demo-run-007",
        "company_name": "Bluebird Oven Foods",
        "substance_name": "Almond flour",
        "evidence_type": "Bakery menu",
        "data_source": "Bluebird seasonal recipe archive"
      },
      {
        "EVIDENCE_ID": 37,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 1,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "all-purpose flour",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 30,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-37",
        "RECORD_ID": "cookie-demo-12-01-037",
        "DATE_LOGGED": "2026-06-01",
        "SCRAPE_RUN_ID": "cookie-demo-run-001",
        "company_name": "Seaside Biscuit Works",
        "substance_name": "All-purpose flour",
        "evidence_type": "Bakery menu",
        "data_source": "Harbor Batch seasonal cookie menu"
      },
      {
        "EVIDENCE_ID": 38,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 2,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "dark brown sugar",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-38",
        "RECORD_ID": "cookie-demo-12-02-038",
        "DATE_LOGGED": "2026-06-02",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Seaside Biscuit Works",
        "substance_name": "Brown sugar",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 39,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 3,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "cultured sweet cream butter",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 26,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-39",
        "RECORD_ID": "cookie-demo-12-03-039",
        "DATE_LOGGED": "2026-06-03",
        "SCRAPE_RUN_ID": "cookie-demo-run-001",
        "company_name": "Seaside Biscuit Works",
        "substance_name": "Cultured butter",
        "evidence_type": "Bakery menu",
        "data_source": "Harbor Batch seasonal cookie menu"
      },
      {
        "EVIDENCE_ID": 40,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 4,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "Madagascar vanilla",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 23,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-40",
        "RECORD_ID": "cookie-demo-12-04-040",
        "DATE_LOGGED": "2026-06-04",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Seaside Biscuit Works",
        "substance_name": "Madagascar vanilla extract",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      },
      {
        "EVIDENCE_ID": 41,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 5,
        "EVIDENCE_TYPE_ID": 3,
        "DATA_SOURCE_ID": 1,
        "LISTED_NAME_SUBSTANCE": "semisweet chocolate chips",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 28,
        "URL": "https://cookie-demo.example/sources/harbor-batch-menu#record-41",
        "RECORD_ID": "cookie-demo-12-05-041",
        "DATE_LOGGED": "2026-06-05",
        "SCRAPE_RUN_ID": "cookie-demo-run-001",
        "company_name": "Seaside Biscuit Works",
        "substance_name": "Semisweet chocolate chips",
        "evidence_type": "Bakery menu",
        "data_source": "Harbor Batch seasonal cookie menu"
      },
      {
        "EVIDENCE_ID": 42,
        "COMPANY_ID": 12,
        "SUBSTANCE_REFERENCE_ID": 7,
        "EVIDENCE_TYPE_ID": 4,
        "DATA_SOURCE_ID": 6,
        "LISTED_NAME_SUBSTANCE": "rolled oats",
        "REGION": "Southeast",
        "EVIDENCE_WEIGHT": 22,
        "URL": "https://cookie-demo.example/sources/golden-crate-roster#record-42",
        "RECORD_ID": "cookie-demo-12-07-042",
        "DATE_LOGGED": "2026-06-06",
        "SCRAPE_RUN_ID": "cookie-demo-run-006",
        "company_name": "Seaside Biscuit Works",
        "substance_name": "Rolled oats",
        "evidence_type": "Distributor listing",
        "data_source": "Golden Crate distribution roster"
      }
    ],
    "association_readable": [
      {
        "ASSOCIATIONID": 1,
        "COMPANY_ID": 1,
        "ASSOCIATED_COMPANY_ID": 2,
        "LINKAGE_METHOD": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "LINKAGE_TYPE": "Shared production inbox",
        "DATA_SOURCE_ID": 4,
        "company_name": "Harbor Batch Bakery",
        "associated_company_name": "Maple & Main Cookie Co."
      },
      {
        "ASSOCIATIONID": 2,
        "COMPANY_ID": 1,
        "ASSOCIATED_COMPANY_ID": 10,
        "LINKAGE_METHOD": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "LINKAGE_TYPE": "Shared production inbox",
        "DATA_SOURCE_ID": 4,
        "company_name": "Harbor Batch Bakery",
        "associated_company_name": "Copper Kettle Kitchen"
      },
      {
        "ASSOCIATIONID": 3,
        "COMPANY_ID": 2,
        "ASSOCIATED_COMPANY_ID": 11,
        "LINKAGE_METHOD": "Email",
        "LINKAGE_VALUE": "batches@bakehouse-collective.example",
        "LINKAGE_TYPE": "Shared production inbox",
        "DATA_SOURCE_ID": 7,
        "company_name": "Maple & Main Cookie Co.",
        "associated_company_name": "Bluebird Oven Foods"
      },
      {
        "ASSOCIATIONID": 4,
        "COMPANY_ID": 3,
        "ASSOCIATED_COMPANY_ID": 5,
        "LINKAGE_METHOD": "Phone",
        "LINKAGE_VALUE": "+1-414-555-0110",
        "LINKAGE_TYPE": "Shared procurement phone",
        "DATA_SOURCE_ID": 3,
        "company_name": "Sunfield Flour Mills",
        "associated_company_name": "Northwind Butter Works"
      },
      {
        "ASSOCIATIONID": 5,
        "COMPANY_ID": 3,
        "ASSOCIATED_COMPANY_ID": 9,
        "LINKAGE_METHOD": "Phone",
        "LINKAGE_VALUE": "+1-414-555-0110",
        "LINKAGE_TYPE": "Shared procurement phone",
        "DATA_SOURCE_ID": 2,
        "company_name": "Sunfield Flour Mills",
        "associated_company_name": "Clover Cane Sugars"
      },
      {
        "ASSOCIATIONID": 6,
        "COMPANY_ID": 7,
        "ASSOCIATED_COMPANY_ID": 8,
        "LINKAGE_METHOD": "Phone",
        "LINKAGE_VALUE": "+1-773-555-0142",
        "LINKAGE_TYPE": "Shared fulfillment line",
        "DATA_SOURCE_ID": 6,
        "company_name": "Spruce Street Packing",
        "associated_company_name": "Golden Crate Logistics"
      },
      {
        "ASSOCIATIONID": 7,
        "COMPANY_ID": 4,
        "ASSOCIATED_COMPANY_ID": 6,
        "LINKAGE_METHOD": "Email",
        "LINKAGE_VALUE": "vanilla@pantry-inputs.example",
        "LINKAGE_TYPE": "Shared imports inbox",
        "DATA_SOURCE_ID": 5,
        "company_name": "Orchard Vanilla Imports",
        "associated_company_name": "Cacao Coast Ingredients"
      },
      {
        "ASSOCIATIONID": 8,
        "COMPANY_ID": 1,
        "ASSOCIATED_COMPANY_ID": 12,
        "LINKAGE_METHOD": "Phone",
        "LINKAGE_VALUE": "+1-312-555-0188",
        "LINKAGE_TYPE": "Shared bakery office line",
        "DATA_SOURCE_ID": 1,
        "company_name": "Harbor Batch Bakery",
        "associated_company_name": "Seaside Biscuit Works"
      }
    ],
    "consolidated_company_readable": [
      {
        "CONSOLIDATED_COMPANY_ID": 1,
        "CONSOLIDATED_NAME": "Bakehouse Collective",
        "COMPANY_NAME": "Harbor Batch Bakery",
        "COMPANY_ID": 1
      },
      {
        "CONSOLIDATED_COMPANY_ID": 2,
        "CONSOLIDATED_NAME": "Bakehouse Collective",
        "COMPANY_NAME": "Maple & Main Cookie Co.",
        "COMPANY_ID": 2
      },
      {
        "CONSOLIDATED_COMPANY_ID": 3,
        "CONSOLIDATED_NAME": "Bakehouse Collective",
        "COMPANY_NAME": "Copper Kettle Kitchen",
        "COMPANY_ID": 10
      },
      {
        "CONSOLIDATED_COMPANY_ID": 4,
        "CONSOLIDATED_NAME": "Bakehouse Collective",
        "COMPANY_NAME": "Bluebird Oven Foods",
        "COMPANY_ID": 11
      },
      {
        "CONSOLIDATED_COMPANY_ID": 5,
        "CONSOLIDATED_NAME": "Bakehouse Collective",
        "COMPANY_NAME": "Seaside Biscuit Works",
        "COMPANY_ID": 12
      },
      {
        "CONSOLIDATED_COMPANY_ID": 6,
        "CONSOLIDATED_NAME": "Pantry Inputs Cooperative",
        "COMPANY_NAME": "Sunfield Flour Mills",
        "COMPANY_ID": 3
      },
      {
        "CONSOLIDATED_COMPANY_ID": 7,
        "CONSOLIDATED_NAME": "Pantry Inputs Cooperative",
        "COMPANY_NAME": "Orchard Vanilla Imports",
        "COMPANY_ID": 4
      },
      {
        "CONSOLIDATED_COMPANY_ID": 8,
        "CONSOLIDATED_NAME": "Pantry Inputs Cooperative",
        "COMPANY_NAME": "Northwind Butter Works",
        "COMPANY_ID": 5
      },
      {
        "CONSOLIDATED_COMPANY_ID": 9,
        "CONSOLIDATED_NAME": "Pantry Inputs Cooperative",
        "COMPANY_NAME": "Cacao Coast Ingredients",
        "COMPANY_ID": 6
      },
      {
        "CONSOLIDATED_COMPANY_ID": 10,
        "CONSOLIDATED_NAME": "Pantry Inputs Cooperative",
        "COMPANY_NAME": "Clover Cane Sugars",
        "COMPANY_ID": 9
      },
      {
        "CONSOLIDATED_COMPANY_ID": 11,
        "CONSOLIDATED_NAME": "Packing & Fulfillment Partners",
        "COMPANY_NAME": "Spruce Street Packing",
        "COMPANY_ID": 7
      },
      {
        "CONSOLIDATED_COMPANY_ID": 12,
        "CONSOLIDATED_NAME": "Packing & Fulfillment Partners",
        "COMPANY_NAME": "Golden Crate Logistics",
        "COMPANY_ID": 8
      }
    ],
    "rpcs": {
      "get_evidence_total": 42,
      "get_company_count": 12,
      "get_association_count": 8
    }
  }
};

export default DEMO_DATA;
