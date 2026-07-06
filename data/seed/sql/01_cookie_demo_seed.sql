-- Cookie demo seed data

-- The demo dataset is synthetic and regenerated for public walkthroughs.

TRUNCATE TABLE company RESTART IDENTITY CASCADE;

INSERT INTO company (COMPANY_ID, COMPANY_NAME, CHINESE_NAME, ACTIVE_INACTIVE, BUSINESS_TYPE, PRC_HOME_BASE, GOV_COMPLICITY) VALUES
(1, 'Harbor Batch Bakery', '', 'Active', 'Bakery', 'Midwest', 'Retail bakery'),
(2, 'Maple & Main Cookie Co.', '', 'Active', 'Bakery', 'Northeast', 'Neighborhood bakery'),
(3, 'Bluebird Oven Foods', '', 'Active', 'Bakery', 'Pacific Northwest', 'Regional bakery'),
(4, 'Seaside Biscuit Works', '', 'Active', 'Bakery', 'Southeast', 'Coastal bakery'),
(5, 'Golden Grain Supply', '', 'Active', 'Ingredient Supplier', 'Great Lakes', 'Flour supplier'),
(6, 'Orchard Vanilla Imports', '', 'Active', 'Ingredient Supplier', 'East Coast', 'Vanilla importer'),
(7, 'Northwind Butter Works', '', 'Active', 'Ingredient Supplier', 'Wisconsin', 'Butter producer'),
(8, 'Cacao Coast Ingredients', '', 'Active', 'Ingredient Supplier', 'West Coast', 'Chocolate supplier'),
(9, 'Clover Cane Sugars', '', 'Active', 'Ingredient Supplier', 'Gulf Coast', 'Sugar supplier'),
(10, 'Meadow Oat Collective', '', 'Active', 'Ingredient Supplier', 'Upper Midwest', 'Oat supplier'),
(11, 'Golden Crate Logistics', '', 'Active', 'Distributor', 'National', 'Wholesale distributor'),
(12, 'CertiBake Registry', '', 'Active', 'Source Entity', 'National', 'Public claims registry');

TRUNCATE TABLE consolidated_company RESTART IDENTITY CASCADE;

INSERT INTO consolidated_company (CONSOLIDATED_NAME_ID, CONSOLIDATED_NAME) VALUES
(1, 'Bakery Network'),
(2, 'Ingredient Partners'),
(3, 'Movement & Registry');

TRUNCATE TABLE company_consolidated_map RESTART IDENTITY CASCADE;

INSERT INTO company_consolidated_map (CONSOLIDATED_COMPANY_ID, COMPANY_ID) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(3, 11),
(3, 12);

TRUNCATE TABLE substance_type RESTART IDENTITY CASCADE;

INSERT INTO substance_type (SUBSTANCE_TYPE_ID, SUBSTANCE_TYPE_TITLE, SUBSTANCE_TYPE_DESCRIPTION) VALUES
(1, 'Flour', 'Flour ingredients used across cookie dough bases.'),
(2, 'Flavor', 'Flavor ingredients used for aroma and profile notes.'),
(3, 'Inclusion', 'Ingredient inclusions mixed into finished cookie dough.'),
(4, 'Fat', 'Butter and other fat ingredients used for texture.'),
(5, 'Sweetener', 'Sweet ingredients used in dough and finish blends.');

TRUNCATE TABLE substance_reference RESTART IDENTITY CASCADE;

INSERT INTO substance_reference (SUBSTANCE_REFERENCE_ID, SUBSTANCE_NAME, SUBSTANCE_ID, SUBSTANCE_WEIGHT, SUBSTANCE_DESCRIPTION, SUBSTANCE_TYPE_ID) VALUES
(1, 'All-purpose flour', 'ING-FLOUR-AP', 24, 'Core flour used in classic cookie dough.', 1),
(2, 'Madagascar vanilla extract', 'ING-VANILLA-MDG', 16, 'Vanilla ingredient used in bakery and supplier pages.', 2),
(3, 'Semisweet chocolate chips', 'ING-CHOC-SEMI', 22, 'Chocolate inclusion used across multiple cookie lines.', 3),
(4, 'Cultured butter', 'ING-BUTTER-CULTURED', 20, 'Butter ingredient used for richer doughs and shortbread styles.', 4),
(5, 'Brown sugar', 'ING-SUGAR-BROWN', 18, 'Sweetener used in chewy cookie profiles.', 5),
(6, 'Rolled oats', 'ING-OATS-ROLLED', 14, 'Oat inclusion used in bakery and supplier pages.', 3),
(7, 'Sea salt', 'ING-SALT-SEA', 9, 'Finishing salt used in sweet-savory cookie pages.', 2),
(8, 'Almond flour', 'ING-FLOUR-ALMOND', 17, 'Alternative flour used in specialty cookie batches.', 1);

TRUNCATE TABLE substance_sourcing_type RESTART IDENTITY CASCADE;

INSERT INTO substance_sourcing_type (SUBSTANCE_SOURCING_TYPE_ID, SUBSTANCE_SOURCING_TYPE_TITLE, SUBSTANCE_SOURCING_TYPE_DESCRIPTION) VALUES
(1, 'Catalog family', 'High-level family phrasing used in catalog pages.'),
(2, 'Supplier alias', 'Supplier-facing local phrasing or shorthand.'),
(3, 'Recipe phrasing', 'Bakery-facing ingredient phrasing used in menus and labels.');

TRUNCATE TABLE substance_sourcing RESTART IDENTITY CASCADE;

INSERT INTO substance_sourcing (SUBSTANCE_SOURCING_ID, SUBSTANCE_ID, SUBSTANCE_SOURCING_LOCAL_NAME, SUBSTANCE_SOURCING_TYPE_ID, DATA_SOURCE_ID, SUBSTANCE_SOURCING_PRIMARY, SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE, SUBSTANCE_SOURCING_REFERENCE) VALUES
(1, 'ING-FLOUR-AP', 'All-purpose flour', 1, 4, 'TRUE', 'Flour', 'All-purpose flour catalog family'),
(2, 'ING-FLOUR-AP', 'stone-milled flour', 3, 13, 'FALSE', 'Flour', 'Observed menu phrasing for All-purpose flour'),
(3, 'ING-VANILLA-MDG', 'Madagascar vanilla extract', 1, 5, 'TRUE', 'Flavor', 'Madagascar vanilla catalog family'),
(4, 'ING-VANILLA-MDG', 'Madagascar vanilla', 3, 1, 'FALSE', 'Flavor', 'Observed menu phrasing for Madagascar vanilla extract'),
(5, 'ING-CHOC-SEMI', 'Semisweet chocolate chips', 1, 6, 'TRUE', 'Inclusion', 'Chocolate chip catalog family'),
(6, 'ING-CHOC-SEMI', 'semisweet chocolate chips', 3, 2, 'FALSE', 'Inclusion', 'Observed menu phrasing for Semisweet chocolate chips'),
(7, 'ING-BUTTER-CULTURED', 'Cultured butter', 1, 7, 'TRUE', 'Fat', 'Cultured butter sheet family'),
(8, 'ING-BUTTER-CULTURED', 'cultured butter', 3, 2, 'FALSE', 'Fat', 'Observed menu phrasing for Cultured butter'),
(9, 'ING-SUGAR-BROWN', 'Brown sugar', 1, 8, 'TRUE', 'Sweetener', 'Brown sugar catalog family'),
(10, 'ING-SUGAR-BROWN', 'brown sugar', 3, 2, 'FALSE', 'Sweetener', 'Observed menu phrasing for Brown sugar'),
(11, 'ING-OATS-ROLLED', 'Rolled oats', 1, 9, 'TRUE', 'Inclusion', 'Rolled oat catalog family'),
(12, 'ING-OATS-ROLLED', 'rolled oats', 3, 3, 'FALSE', 'Inclusion', 'Observed menu phrasing for Rolled oats'),
(13, 'ING-SALT-SEA', 'Sea salt', 1, 2, 'TRUE', 'Flavor', 'Sea salt pantry reference'),
(14, 'ING-SALT-SEA', 'sea salt finish', 3, 13, 'FALSE', 'Flavor', 'Observed menu phrasing for Sea salt'),
(15, 'ING-FLOUR-ALMOND', 'Almond flour', 1, 4, 'TRUE', 'Flour', 'Almond flour catalog family'),
(16, 'ING-FLOUR-ALMOND', 'almond flour', 3, 12, 'FALSE', 'Flour', 'Observed public claim phrasing for Almond flour');

TRUNCATE TABLE evidence_type RESTART IDENTITY CASCADE;

INSERT INTO evidence_type (EVIDENCE_TYPE_ID, EVIDENCE_TYPE_NAME) VALUES
(1, 'Bakery menu'),
(2, 'Supplier catalog'),
(3, 'Ingredient spec sheet'),
(4, 'Distributor listing'),
(5, 'Public claim registry');

TRUNCATE TABLE data_source RESTART IDENTITY CASCADE;

INSERT INTO data_source (DATA_SOURCE_ID, DATA_SOURCE_NAME, DATA_SOURCE_TYPE, URL, DATE_LOGGED, PARENT_DATA_SOURCE_ID, SCRAPE_RUN_ID, SOURCE_PLATFORM, OBSERVED_AT, FIRST_SEEN_AT, LAST_SEEN_AT) VALUES
(1, 'Harbor Batch spring cookie board', 'bakery_menu', 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board', '2026-04-01', '', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(2, 'Maple & Main cookie board', 'bakery_menu', 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board', '2026-04-01', '', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(3, 'Bluebird oatmeal board', 'bakery_menu', 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board', '2026-04-01', '', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(4, 'Golden Grain Supply catalog', 'supplier_catalog', 'https://cookie-demo.example/ingredienthub/golden-grain-catalog', '2026-04-15', '', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(5, 'Orchard Vanilla Imports catalog', 'supplier_catalog', 'https://cookie-demo.example/ingredienthub/orchard-vanilla-catalog', '2026-04-15', '', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(6, 'Cacao Coast ingredients catalog', 'supplier_catalog', 'https://cookie-demo.example/ingredienthub/cacao-coast-catalog', '2026-04-15', '', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(7, 'Northwind butter sheet', 'ingredient_sheet', 'https://cookie-demo.example/ingredienthub/northwind-butter-sheet', '2026-04-15', '', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(8, 'Clover Cane sugars catalog', 'supplier_catalog', 'https://cookie-demo.example/ingredienthub/clover-cane-catalog', '2026-04-15', '', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(9, 'Meadow Oat Collective catalog', 'supplier_catalog', 'https://cookie-demo.example/ingredienthub/meadow-oat-catalog', '2026-04-15', '', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(10, 'WholesaleCrumb route sheet', 'distributor_listing', 'https://cookie-demo.example/wholesalecrumb/route-sheet', '2026-05-01', '', '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(11, 'CertiBake public claims registry', 'claims_registry', 'https://cookie-demo.example/certibake/public-claims', '2026-05-20', '', '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(12, 'CertiBake allergen notes registry', 'claims_registry', 'https://cookie-demo.example/certibake/allergen-notes', '2026-05-20', '', '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(13, 'Harbor Batch refresh board', 'bakery_menu', 'https://cookie-demo.example/bakeryboard/harbor-batch-refresh-board', '2026-06-10', 1, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(14, 'Seaside Biscuit Works menu board', 'bakery_menu', 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board', '2026-06-10', '', '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10');

TRUNCATE TABLE weighting_tag_type RESTART IDENTITY CASCADE;

INSERT INTO weighting_tag_type (WEIGHTING_TAG_TYPE_ID, WEIGHTING_TAG_TYPE_TITLE) VALUES
(1, 'Supply-chain signal');

TRUNCATE TABLE weighting_tag_category RESTART IDENTITY CASCADE;

INSERT INTO weighting_tag_category (WEIGHTING_TAG_CATEGORY_ID, WEIGHTING_TAG_CATEGORY_TITLE, WEIGHTING_TAG_TYPE_ID) VALUES
(1, 'Product line', 1),
(2, 'Handling note', 1),
(3, 'Public claim', 1);

TRUNCATE TABLE weighting_tag RESTART IDENTITY CASCADE;

INSERT INTO weighting_tag (WEIGHTING_TAG_ID, WEIGHTING_TAG_TITLE, WEIGHTING_TAG_WEIGHT, WEIGHTING_TAG_DESCRIPTION, WEIGHTING_TAG_CATEGORY_ID) VALUES
(1, 'Signature batch', 10, 'Appears in a featured or signature product line.', 1),
(2, 'Cold-chain handling', 7, 'Requires chilled handling or careful storage.', 2),
(3, 'Organic claim', 6, 'Appears with an organic or ingredient-origin claim.', 3);

TRUNCATE TABLE company_weighting_tag RESTART IDENTITY CASCADE;

INSERT INTO company_weighting_tag (COMPANY_WEIGHTING_TAG_ID, COMPANY_ID, WEIGHTING_TAG_ID) VALUES
(1, 1, 1),
(2, 3, 1),
(3, 7, 2),
(4, 12, 3);

TRUNCATE TABLE linkage RESTART IDENTITY CASCADE;

INSERT INTO linkage (LINKAGEID, COMPANY_ID, LINKAGE_METHOD, Linkage_Value_Type, LINKAGE_VALUE, DATA_SOURCE_ID, SCRAPE_RUN_ID, SOURCE_PLATFORM, OBSERVED_AT, FIRST_SEEN_AT, LAST_SEEN_AT) VALUES
(1, 1, 'Email', 'Email', 'orders@bakeryboard-kitchens.example', 1, '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(2, 2, 'Email', 'Email', 'orders@bakeryboard-kitchens.example', 1, '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(3, 5, 'Email', 'Email', 'catalog@ingredienthub.example', 4, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(4, 6, 'Email', 'Email', 'catalog@ingredienthub.example', 4, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(5, 5, 'Phone', 'Phone', '+1-414-555-0110', 8, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(6, 9, 'Phone', 'Phone', '+1-414-555-0110', 8, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(7, 6, 'Email', 'Email', 'catalog@ingredienthub.example', 5, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(8, 8, 'Email', 'Email', 'catalog@ingredienthub.example', 5, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(9, 1, 'Phone', 'Phone', '+1-773-555-0142', 10, '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(10, 11, 'Phone', 'Phone', '+1-773-555-0142', 10, '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(11, 2, 'Phone', 'Phone', '+1-773-555-0142', 10, '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(12, 8, 'Phone', 'Phone', '+1-773-555-0142', 10, '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(13, 12, 'Email', 'Email', 'registry@certibake.example', 11, '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(14, 1, 'Email', 'Email', 'registry@certibake.example', 11, '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(15, 2, 'Email', 'Email', 'registry@certibake.example', 11, '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(16, 3, 'Email', 'Email', 'registry@certibake.example', 11, '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(17, 1, 'Email', 'Email', 'orders@goldengrain.example', 13, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(18, 5, 'Email', 'Email', 'orders@goldengrain.example', 13, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(19, 4, 'Phone', 'Phone', '+1-773-555-0142', 14, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(20, 11, 'Phone', 'Phone', '+1-773-555-0142', 14, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(21, 4, 'Email', 'Email', 'orders@goldengrain.example', 14, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(22, 5, 'Email', 'Email', 'orders@goldengrain.example', 14, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10');

TRUNCATE TABLE association RESTART IDENTITY CASCADE;

INSERT INTO association (ASSOCIATIONID, COMPANY_ID, ASSOCIATED_COMPANY_ID, LINKAGE_METHOD, LINKAGE_VALUE, LINKAGE_TYPE, DATA_SOURCE_ID, SCRAPE_RUN_ID, SOURCE_PLATFORM, OBSERVED_AT, FIRST_SEEN_AT, LAST_SEEN_AT) VALUES
(1, 1, 2, 'Email', 'orders@bakeryboard-kitchens.example', 'Shared BakeryBoard inbox', 1, '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(2, 5, 6, 'Email', 'catalog@ingredienthub.example', 'Shared IngredientHub supplier inbox', 4, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(3, 5, 9, 'Phone', '+1-414-555-0110', 'Shared IngredientHub support line', 8, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(4, 6, 8, 'Email', 'catalog@ingredienthub.example', 'Shared IngredientHub supplier inbox', 5, '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(5, 1, 11, 'Phone', '+1-773-555-0142', 'Shared WholesaleCrumb route line', 10, '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(6, 2, 11, 'Phone', '+1-773-555-0142', 'Shared WholesaleCrumb route line', 10, '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(7, 8, 11, 'Phone', '+1-773-555-0142', 'Shared WholesaleCrumb route line', 10, '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(8, 12, 1, 'Email', 'registry@certibake.example', 'Listed in CertiBake claims registry', 11, '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(9, 12, 2, 'Email', 'registry@certibake.example', 'Listed in CertiBake claims registry', 11, '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(10, 12, 3, 'Email', 'registry@certibake.example', 'Listed in CertiBake claims registry', 11, '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(11, 1, 5, 'Email', 'orders@goldengrain.example', 'BakeryBoard refresh supplier reference', 13, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(12, 4, 11, 'Phone', '+1-773-555-0142', 'Shared WholesaleCrumb route line', 14, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(13, 4, 5, 'Email', 'orders@goldengrain.example', 'BakeryBoard refresh supplier reference', 14, '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10');

TRUNCATE TABLE evidence RESTART IDENTITY CASCADE;

INSERT INTO evidence (EVIDENCE_ID, COMPANY_ID, SUBSTANCE_REFERENCE_ID, EVIDENCE_TYPE_ID, DATA_SOURCE_ID, LISTED_NAME_SUBSTANCE, REGION, EVIDENCE_WEIGHT, URL, SOURCE_URL, RECORD_ID, DATE_LOGGED, SCRAPE_RUN_ID, SOURCE_PLATFORM, OBSERVED_AT, FIRST_SEEN_AT, LAST_SEEN_AT) VALUES
(1, 1, 1, 1, 1, 'all-purpose flour', 'Midwest', 27, 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board#record-1', 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board', 'scrape-and-bake-2026-04-01_bakeryboard-01-01-001', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(2, 1, 4, 1, 1, 'cultured butter', 'Midwest', 23, 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board#record-2', 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board', 'scrape-and-bake-2026-04-01_bakeryboard-01-04-002', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(3, 1, 3, 1, 1, 'semisweet chocolate chips', 'Midwest', 25, 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board#record-3', 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board', 'scrape-and-bake-2026-04-01_bakeryboard-01-03-003', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(4, 1, 2, 1, 1, 'Madagascar vanilla', 'Midwest', 19, 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board#record-4', 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board', 'scrape-and-bake-2026-04-01_bakeryboard-01-02-004', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(5, 1, 5, 1, 1, 'brown sugar', 'Midwest', 21, 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board#record-5', 'https://cookie-demo.example/bakeryboard/harbor-batch-spring-board', 'scrape-and-bake-2026-04-01_bakeryboard-01-05-005', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(6, 2, 1, 1, 2, 'all-purpose flour', 'Northeast', 28, 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board#record-6', 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board', 'scrape-and-bake-2026-04-01_bakeryboard-02-01-006', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(7, 2, 4, 1, 2, 'cultured butter', 'Northeast', 24, 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board#record-7', 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board', 'scrape-and-bake-2026-04-01_bakeryboard-02-04-007', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(8, 2, 3, 1, 2, 'semisweet chocolate chips', 'Northeast', 26, 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board#record-8', 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board', 'scrape-and-bake-2026-04-01_bakeryboard-02-03-008', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(9, 2, 5, 1, 2, 'brown sugar', 'Northeast', 22, 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board#record-9', 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board', 'scrape-and-bake-2026-04-01_bakeryboard-02-05-009', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(10, 2, 7, 1, 2, 'sea salt finish', 'Northeast', 13, 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board#record-10', 'https://cookie-demo.example/bakeryboard/maple-main-cookie-board', 'scrape-and-bake-2026-04-01_bakeryboard-02-07-010', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(11, 3, 1, 1, 3, 'all-purpose flour', 'Pacific Northwest', 29, 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board#record-11', 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board', 'scrape-and-bake-2026-04-01_bakeryboard-03-01-011', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(12, 3, 6, 1, 3, 'rolled oats', 'Pacific Northwest', 19, 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board#record-12', 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board', 'scrape-and-bake-2026-04-01_bakeryboard-03-06-012', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(13, 3, 4, 1, 3, 'cultured butter', 'Pacific Northwest', 25, 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board#record-13', 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board', 'scrape-and-bake-2026-04-01_bakeryboard-03-04-013', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(14, 3, 5, 1, 3, 'brown sugar', 'Pacific Northwest', 23, 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board#record-14', 'https://cookie-demo.example/bakeryboard/bluebird-oatmeal-board', 'scrape-and-bake-2026-04-01_bakeryboard-03-05-014', '2026-04-01', '2026-04-01_bakeryboard', 'BakeryBoard', '2026-04-01', '2026-04-01', '2026-04-01'),
(15, 5, 1, 2, 4, 'all-purpose flour', 'Great Lakes', 29, 'https://cookie-demo.example/ingredienthub/golden-grain-catalog#record-15', 'https://cookie-demo.example/ingredienthub/golden-grain-catalog', 'scrape-and-bake-2026-04-15_ingredienthub-05-01-015', '2026-04-15', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(16, 5, 8, 2, 4, 'almond flour', 'Great Lakes', 22, 'https://cookie-demo.example/ingredienthub/golden-grain-catalog#record-16', 'https://cookie-demo.example/ingredienthub/golden-grain-catalog', 'scrape-and-bake-2026-04-15_ingredienthub-05-08-016', '2026-04-15', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(17, 6, 2, 2, 5, 'Madagascar vanilla extract', 'East Coast', 22, 'https://cookie-demo.example/ingredienthub/orchard-vanilla-catalog#record-17', 'https://cookie-demo.example/ingredienthub/orchard-vanilla-catalog', 'scrape-and-bake-2026-04-15_ingredienthub-06-02-017', '2026-04-15', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(18, 8, 3, 2, 6, 'semisweet chocolate chips', 'West Coast', 26, 'https://cookie-demo.example/ingredienthub/cacao-coast-catalog#record-18', 'https://cookie-demo.example/ingredienthub/cacao-coast-catalog', 'scrape-and-bake-2026-04-15_ingredienthub-08-03-018', '2026-04-15', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(19, 7, 4, 3, 7, 'cultured butter', 'Wisconsin', 29, 'https://cookie-demo.example/ingredienthub/northwind-butter-sheet#record-19', 'https://cookie-demo.example/ingredienthub/northwind-butter-sheet', 'scrape-and-bake-2026-04-15_ingredienthub-07-04-019', '2026-04-15', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(20, 9, 5, 2, 8, 'brown sugar', 'Gulf Coast', 23, 'https://cookie-demo.example/ingredienthub/clover-cane-catalog#record-20', 'https://cookie-demo.example/ingredienthub/clover-cane-catalog', 'scrape-and-bake-2026-04-15_ingredienthub-09-05-020', '2026-04-15', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(21, 10, 6, 2, 9, 'rolled oats', 'Upper Midwest', 20, 'https://cookie-demo.example/ingredienthub/meadow-oat-catalog#record-21', 'https://cookie-demo.example/ingredienthub/meadow-oat-catalog', 'scrape-and-bake-2026-04-15_ingredienthub-10-06-021', '2026-04-15', '2026-04-15_ingredienthub', 'IngredientHub', '2026-04-15', '2026-04-15', '2026-04-15'),
(22, 11, 1, 4, 10, 'all-purpose flour', 'National', 35, 'https://cookie-demo.example/wholesalecrumb/route-sheet#record-22', 'https://cookie-demo.example/wholesalecrumb/route-sheet', 'scrape-and-bake-2026-05-01_wholesalecrumb-11-01-022', '2026-05-01', '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(23, 11, 3, 4, 10, 'semisweet chocolate chips', 'National', 33, 'https://cookie-demo.example/wholesalecrumb/route-sheet#record-23', 'https://cookie-demo.example/wholesalecrumb/route-sheet', 'scrape-and-bake-2026-05-01_wholesalecrumb-11-03-023', '2026-05-01', '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(24, 11, 4, 4, 10, 'cultured butter', 'National', 31, 'https://cookie-demo.example/wholesalecrumb/route-sheet#record-24', 'https://cookie-demo.example/wholesalecrumb/route-sheet', 'scrape-and-bake-2026-05-01_wholesalecrumb-11-04-024', '2026-05-01', '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(25, 11, 5, 4, 10, 'brown sugar', 'National', 29, 'https://cookie-demo.example/wholesalecrumb/route-sheet#record-25', 'https://cookie-demo.example/wholesalecrumb/route-sheet', 'scrape-and-bake-2026-05-01_wholesalecrumb-11-05-025', '2026-05-01', '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(26, 11, 6, 4, 10, 'rolled oats', 'National', 25, 'https://cookie-demo.example/wholesalecrumb/route-sheet#record-26', 'https://cookie-demo.example/wholesalecrumb/route-sheet', 'scrape-and-bake-2026-05-01_wholesalecrumb-11-06-026', '2026-05-01', '2026-05-01_wholesalecrumb', 'WholesaleCrumb', '2026-05-01', '2026-05-01', '2026-05-01'),
(27, 1, 1, 5, 11, 'organic flour note', 'Midwest', 35, 'https://cookie-demo.example/certibake/public-claims#record-27', 'https://cookie-demo.example/certibake/public-claims', 'scrape-and-bake-2026-05-20_certibake_registry-01-01-027', '2026-05-20', '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(28, 2, 3, 5, 11, 'fair-trade chocolate note', 'Northeast', 34, 'https://cookie-demo.example/certibake/public-claims#record-28', 'https://cookie-demo.example/certibake/public-claims', 'scrape-and-bake-2026-05-20_certibake_registry-02-03-028', '2026-05-20', '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(29, 3, 6, 5, 11, 'gluten-free oats note', 'Pacific Northwest', 27, 'https://cookie-demo.example/certibake/public-claims#record-29', 'https://cookie-demo.example/certibake/public-claims', 'scrape-and-bake-2026-05-20_certibake_registry-03-06-029', '2026-05-20', '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(30, 4, 8, 5, 12, 'almond flour batch note', 'Southeast', 27, 'https://cookie-demo.example/certibake/allergen-notes#record-30', 'https://cookie-demo.example/certibake/allergen-notes', 'scrape-and-bake-2026-05-20_certibake_registry-04-08-030', '2026-05-20', '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(31, 2, 4, 5, 12, 'kosher-style butter cookie note', 'Northeast', 32, 'https://cookie-demo.example/certibake/allergen-notes#record-31', 'https://cookie-demo.example/certibake/allergen-notes', 'scrape-and-bake-2026-05-20_certibake_registry-02-04-031', '2026-05-20', '2026-05-20_certibake_registry', 'CertiBake Registry', '2026-05-20', '2026-05-20', '2026-05-20'),
(32, 1, 1, 1, 13, 'stone-milled flour', 'Midwest', 27, 'https://cookie-demo.example/bakeryboard/harbor-batch-refresh-board#record-32', 'https://cookie-demo.example/bakeryboard/harbor-batch-refresh-board', 'scrape-and-bake-2026-06-10_bakeryboard_refresh-01-01-032', '2026-06-10', '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(33, 1, 6, 1, 13, 'rolled oats', 'Midwest', 17, 'https://cookie-demo.example/bakeryboard/harbor-batch-refresh-board#record-33', 'https://cookie-demo.example/bakeryboard/harbor-batch-refresh-board', 'scrape-and-bake-2026-06-10_bakeryboard_refresh-01-06-033', '2026-06-10', '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(34, 1, 7, 1, 13, 'sea salt finish', 'Midwest', 12, 'https://cookie-demo.example/bakeryboard/harbor-batch-refresh-board#record-34', 'https://cookie-demo.example/bakeryboard/harbor-batch-refresh-board', 'scrape-and-bake-2026-06-10_bakeryboard_refresh-01-07-034', '2026-06-10', '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(35, 4, 1, 1, 14, 'all-purpose flour', 'Southeast', 26, 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board#record-35', 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board', 'scrape-and-bake-2026-06-10_bakeryboard_refresh-04-01-035', '2026-06-10', '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(36, 4, 4, 1, 14, 'cultured butter', 'Southeast', 22, 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board#record-36', 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board', 'scrape-and-bake-2026-06-10_bakeryboard_refresh-04-04-036', '2026-06-10', '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(37, 4, 2, 1, 14, 'Madagascar vanilla', 'Southeast', 18, 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board#record-37', 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board', 'scrape-and-bake-2026-06-10_bakeryboard_refresh-04-02-037', '2026-06-10', '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10'),
(38, 4, 3, 1, 14, 'semisweet chocolate chips', 'Southeast', 24, 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board#record-38', 'https://cookie-demo.example/bakeryboard/seaside-biscuit-board', 'scrape-and-bake-2026-06-10_bakeryboard_refresh-04-03-038', '2026-06-10', '2026-06-10_bakeryboard_refresh', 'BakeryBoard Refresh', '2026-06-10', '2026-06-10', '2026-06-10');

TRUNCATE TABLE evidence_weighting_tag RESTART IDENTITY CASCADE;

INSERT INTO evidence_weighting_tag (EVIDENCE_WEIGHTING_TAG_ID, EVIDENCE_ID, WEIGHTING_TAG_ID) VALUES
(1, 1, 1),
(2, 3, 1),
(3, 11, 1),
(4, 27, 1),
(5, 32, 1);

TRUNCATE TABLE substance_weighting_tag RESTART IDENTITY CASCADE;

INSERT INTO substance_weighting_tag (SUBSTANCE_WEIGHTING_TAG_ID, SUBSTANCE_REFERENCE_ID, WEIGHTING_TAG_ID) VALUES
(1, 1, 1),
(2, 4, 2),
(3, 8, 3);
