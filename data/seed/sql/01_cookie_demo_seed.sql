-- Cookie demo seed data

-- The demo dataset is synthetic and does not contain TraCCC source records.

TRUNCATE TABLE company RESTART IDENTITY CASCADE;

INSERT INTO company (COMPANY_ID, COMPANY_NAME, CHINESE_NAME, ACTIVE_INACTIVE, BUSINESS_TYPE, PRC_HOME_BASE, GOV_COMPLICITY) VALUES
(1, 'Harbor Batch Bakery', '', 'Active', 'Bakery', 'Midwest', 'Retail bakery'),
(2, 'Maple & Main Cookie Co.', '', 'Active', 'Bakery', 'Northeast', 'Regional bakery'),
(3, 'Sunfield Flour Mills', '', 'Active', 'Ingredient Supplier', 'Great Lakes', 'Flour mill'),
(4, 'Orchard Vanilla Imports', '', 'Active', 'Importer', 'East Coast', 'Flavor importer'),
(5, 'Northwind Butter Works', '', 'Active', 'Dairy Processor', 'Wisconsin', 'Butter supplier'),
(6, 'Cacao Coast Ingredients', '', 'Active', 'Ingredient Supplier', 'West Coast', 'Chocolate ingredient supplier'),
(7, 'Spruce Street Packing', '', 'Active', 'Co-Packer', 'Midwest', 'Packaging partner'),
(8, 'Golden Crate Logistics', '', 'Active', 'Distributor', 'National', 'Distribution partner'),
(9, 'Clover Cane Sugars', '', 'Active', 'Ingredient Supplier', 'Gulf Coast', 'Sugar refiner'),
(10, 'Copper Kettle Kitchen', '', 'Active', 'Contract Bakery', 'South', 'Private-label bakery'),
(11, 'Bluebird Oven Foods', '', 'Active', 'Bakery', 'Pacific Northwest', 'Regional bakery'),
(12, 'Seaside Biscuit Works', '', 'Active', 'Bakery', 'Southeast', 'Retail bakery');

TRUNCATE TABLE consolidated_company RESTART IDENTITY CASCADE;

INSERT INTO consolidated_company (CONSOLIDATED_NAME_ID, CONSOLIDATED_NAME) VALUES
(1, 'Bakehouse Collective'),
(2, 'Pantry Inputs Cooperative'),
(3, 'Packing & Fulfillment Partners');

TRUNCATE TABLE company_consolidated_map RESTART IDENTITY CASCADE;

INSERT INTO company_consolidated_map (CONSOLIDATED_COMPANY_ID, COMPANY_ID) VALUES
(1, 1),
(1, 2),
(1, 10),
(1, 11),
(1, 12),
(2, 3),
(2, 4),
(2, 5),
(2, 6),
(2, 9),
(3, 7),
(3, 8);

TRUNCATE TABLE substance_type RESTART IDENTITY CASCADE;

INSERT INTO substance_type (SUBSTANCE_TYPE_ID, SUBSTANCE_TYPE_TITLE, SUBSTANCE_TYPE_DESCRIPTION) VALUES
(1, 'Flour', 'Foundational flour ingredients used in cookie dough.'),
(2, 'Sweetener', 'Sugars and sweet ingredients used for structure and flavor.'),
(3, 'Fat', 'Butter and related fats that affect texture and shelf life.'),
(4, 'Flavor', 'Flavoring ingredients such as vanilla and cinnamon.'),
(5, 'Inclusion', 'Mix-ins such as chocolate chips, oats, and nuts.');

TRUNCATE TABLE substance_reference RESTART IDENTITY CASCADE;

INSERT INTO substance_reference (SUBSTANCE_REFERENCE_ID, SUBSTANCE_NAME, SUBSTANCE_ID, SUBSTANCE_WEIGHT, SUBSTANCE_DESCRIPTION, SUBSTANCE_TYPE_ID) VALUES
(1, 'All-purpose flour', 'ING-FLOUR-AP', 24, 'Primary flour used across house cookie bases.', 1),
(2, 'Brown sugar', 'ING-SUGAR-BROWN', 18, 'Moisture-retaining sweetener used in classic cookie dough.', 2),
(3, 'Cultured butter', 'ING-BUTTER-CULTURED', 20, 'Premium butter used in rich dough and laminated inclusions.', 3),
(4, 'Madagascar vanilla extract', 'ING-VANILLA-MDG', 15, 'High-aroma vanilla extract used in signature cookie lines.', 4),
(5, 'Semisweet chocolate chips', 'ING-CHOC-SEMI', 22, 'Core inclusion for chocolate chip and double chocolate cookies.', 5),
(6, 'Sea salt', 'ING-SALT-SEA', 8, 'Finishing and balance ingredient used in sweet-savory blends.', 4),
(7, 'Rolled oats', 'ING-OATS-ROLLED', 14, 'Textural inclusion used in oatmeal cookie programs.', 5),
(8, 'Cinnamon', 'ING-CINNAMON', 11, 'Warm spice used in snickerdoodle and seasonal cookies.', 4),
(9, 'Almond flour', 'ING-FLOUR-ALMOND', 17, 'Alternative flour used in gluten-aware cookie lines.', 1),
(10, 'Molasses', 'ING-MOLASSES', 13, 'Dark sweetener used for ginger and chewy brown cookies.', 2);

TRUNCATE TABLE substance_sourcing_type RESTART IDENTITY CASCADE;

INSERT INTO substance_sourcing_type (SUBSTANCE_SOURCING_TYPE_ID, SUBSTANCE_SOURCING_TYPE_TITLE, SUBSTANCE_SOURCING_TYPE_DESCRIPTION) VALUES
(1, 'Catalog family', 'High-level family or assortment name used in catalogs.'),
(2, 'Supplier alias', 'Localized supplier phrasing used on spec sheets or profiles.'),
(3, 'Recipe phrasing', 'Phrasing used on bakery menus or ingredient lists.');

TRUNCATE TABLE substance_sourcing RESTART IDENTITY CASCADE;

INSERT INTO substance_sourcing (SUBSTANCE_SOURCING_ID, SUBSTANCE_ID, SUBSTANCE_SOURCING_LOCAL_NAME, SUBSTANCE_SOURCING_TYPE_ID, DATA_SOURCE_ID, SUBSTANCE_SOURCING_PRIMARY, SUBSTANCE_SOURCE_LOCAL_ID_ATTRIBUTE, SUBSTANCE_SOURCING_REFERENCE) VALUES
(1, 'ING-FLOUR-AP', 'All-purpose flour', 1, 2, 'TRUE', 'Flour', 'All-purpose flour catalog family'),
(2, 'ING-FLOUR-AP', 'all-purpose flour', 3, 1, 'FALSE', 'Flour', 'Observed menu phrasing for All-purpose flour'),
(3, 'ING-SUGAR-BROWN', 'Brown sugar', 1, 2, 'TRUE', 'Sweetener', 'Brown sugar catalog family'),
(4, 'ING-SUGAR-BROWN', 'dark brown sugar', 3, 4, 'FALSE', 'Sweetener', 'Observed menu phrasing for Brown sugar'),
(5, 'ING-BUTTER-CULTURED', 'Cultured butter', 1, 2, 'TRUE', 'Fat', 'Cultured butter catalog family'),
(6, 'ING-BUTTER-CULTURED', 'cultured sweet cream butter', 3, 1, 'FALSE', 'Fat', 'Observed menu phrasing for Cultured butter'),
(7, 'ING-VANILLA-MDG', 'Madagascar vanilla extract', 1, 2, 'TRUE', 'Flavor', 'Madagascar vanilla extract catalog family'),
(8, 'ING-VANILLA-MDG', 'Madagascar vanilla', 3, 4, 'FALSE', 'Flavor', 'Observed menu phrasing for Madagascar vanilla extract'),
(9, 'ING-CHOC-SEMI', 'Semisweet chocolate chips', 1, 2, 'TRUE', 'Inclusion', 'Semisweet chocolate chips catalog family'),
(10, 'ING-CHOC-SEMI', 'semisweet chocolate chips', 3, 1, 'FALSE', 'Inclusion', 'Observed menu phrasing for Semisweet chocolate chips'),
(11, 'ING-SALT-SEA', 'Sea salt', 1, 2, 'TRUE', 'Flavor', 'Sea salt catalog family'),
(12, 'ING-SALT-SEA', 'flaky sea salt', 3, 4, 'FALSE', 'Flavor', 'Observed menu phrasing for Sea salt'),
(13, 'ING-OATS-ROLLED', 'Rolled oats', 1, 2, 'TRUE', 'Inclusion', 'Rolled oats catalog family'),
(14, 'ING-OATS-ROLLED', 'rolled oats', 3, 1, 'FALSE', 'Inclusion', 'Observed menu phrasing for Rolled oats'),
(15, 'ING-CINNAMON', 'Cinnamon', 1, 2, 'TRUE', 'Flavor', 'Cinnamon catalog family'),
(16, 'ING-CINNAMON', 'ground cinnamon', 3, 4, 'FALSE', 'Flavor', 'Observed menu phrasing for Cinnamon'),
(17, 'ING-FLOUR-ALMOND', 'Almond flour', 1, 2, 'TRUE', 'Flour', 'Almond flour catalog family'),
(18, 'ING-FLOUR-ALMOND', 'fine almond flour', 3, 1, 'FALSE', 'Flour', 'Observed menu phrasing for Almond flour'),
(19, 'ING-MOLASSES', 'Molasses', 1, 2, 'TRUE', 'Sweetener', 'Molasses catalog family'),
(20, 'ING-MOLASSES', 'blackstrap molasses', 3, 4, 'FALSE', 'Sweetener', 'Observed menu phrasing for Molasses');

TRUNCATE TABLE evidence_type RESTART IDENTITY CASCADE;

INSERT INTO evidence_type (EVIDENCE_TYPE_ID, EVIDENCE_TYPE_NAME) VALUES
(1, 'Catalog listing'),
(2, 'Ingredient spec sheet'),
(3, 'Bakery menu'),
(4, 'Distributor listing'),
(5, 'Supplier profile');

TRUNCATE TABLE data_source RESTART IDENTITY CASCADE;

INSERT INTO data_source (DATA_SOURCE_ID, DATA_SOURCE_NAME, DATA_SOURCE_TYPE, URL, DATE_LOGGED, PARENT_DATA_SOURCE_ID, SCRAPE_RUN_ID) VALUES
(1, 'Harbor Batch seasonal cookie menu', 'bakery_menu', 'https://cookie-demo.example/sources/harbor-batch-menu', '2026-06-03', '', 'cookie-demo-run-001'),
(2, 'Pantry inputs wholesale catalog', 'catalog', 'https://cookie-demo.example/sources/pantry-inputs-catalog', '2026-06-05', '', 'cookie-demo-run-002'),
(3, 'Northwind butter spec sheet', 'ingredient_sheet', 'https://cookie-demo.example/sources/northwind-butter-sheet', '2026-06-08', '', 'cookie-demo-run-003'),
(4, 'Maple & Main online ingredient panel', 'bakery_menu', 'https://cookie-demo.example/sources/maple-main-panel', '2026-06-10', '', 'cookie-demo-run-004'),
(5, 'Cacao Coast supplier profile', 'supplier_profile', 'https://cookie-demo.example/sources/cacao-coast-profile', '2026-06-12', '', 'cookie-demo-run-005'),
(6, 'Golden Crate distribution roster', 'distributor_listing', 'https://cookie-demo.example/sources/golden-crate-roster', '2026-06-15', '', 'cookie-demo-run-006'),
(7, 'Bluebird seasonal recipe archive', 'recipe_archive', 'https://cookie-demo.example/sources/bluebird-archive', '2026-06-18', '', 'cookie-demo-run-007');

TRUNCATE TABLE weighting_tag_type RESTART IDENTITY CASCADE;

INSERT INTO weighting_tag_type (WEIGHTING_TAG_TYPE_ID, WEIGHTING_TAG_TYPE_TITLE) VALUES
(1, 'Supply-chain signal');

TRUNCATE TABLE weighting_tag_category RESTART IDENTITY CASCADE;

INSERT INTO weighting_tag_category (WEIGHTING_TAG_CATEGORY_ID, WEIGHTING_TAG_CATEGORY_TITLE, WEIGHTING_TAG_TYPE_ID) VALUES
(1, 'Product profile', 1),
(2, 'Operational note', 1),
(3, 'Seasonality', 1);

TRUNCATE TABLE weighting_tag RESTART IDENTITY CASCADE;

INSERT INTO weighting_tag (WEIGHTING_TAG_ID, WEIGHTING_TAG_TITLE, WEIGHTING_TAG_WEIGHT, WEIGHTING_TAG_DESCRIPTION, WEIGHTING_TAG_CATEGORY_ID) VALUES
(1, 'Signature cookie line', 10, 'Appears in a highlighted or signature product line.', 1),
(2, 'Cold-chain handling', 8, 'Requires careful storage or temperature handling.', 2),
(3, 'Private-label partner', 7, 'Supports co-manufacturing or private-label output.', 2),
(4, 'Seasonal rotation', 5, 'Referenced in seasonal or limited-run assortment pages.', 3),
(5, 'Organic positioning', 6, 'Markets an organic or specialty sourcing claim.', 1);

TRUNCATE TABLE company_weighting_tag RESTART IDENTITY CASCADE;

INSERT INTO company_weighting_tag (COMPANY_WEIGHTING_TAG_ID, COMPANY_ID, WEIGHTING_TAG_ID) VALUES
(1, 1, 1),
(2, 2, 4),
(3, 5, 2),
(4, 7, 3),
(5, 10, 3),
(6, 11, 5),
(7, 12, 1);

TRUNCATE TABLE linkage RESTART IDENTITY CASCADE;

INSERT INTO linkage (LINKAGEID, COMPANY_ID, LINKAGE_METHOD, Linkage_Value_Type, LINKAGE_VALUE, DATA_SOURCE_ID) VALUES
(1, 1, 'Email', 'Email', 'batches@bakehouse-collective.example', 1),
(2, 2, 'Email', 'Email', 'batches@bakehouse-collective.example', 4),
(3, 10, 'Email', 'Email', 'batches@bakehouse-collective.example', 4),
(4, 11, 'Email', 'Email', 'batches@bakehouse-collective.example', 7),
(5, 3, 'Phone', 'Phone', '+1-414-555-0110', 2),
(6, 5, 'Phone', 'Phone', '+1-414-555-0110', 3),
(7, 9, 'Phone', 'Phone', '+1-414-555-0110', 2),
(8, 7, 'Phone', 'Phone', '+1-773-555-0142', 6),
(9, 8, 'Phone', 'Phone', '+1-773-555-0142', 6),
(10, 4, 'Email', 'Email', 'vanilla@pantry-inputs.example', 2),
(11, 6, 'Email', 'Email', 'vanilla@pantry-inputs.example', 5),
(12, 12, 'Email', 'Email', 'coastal-orders@bakehouse-collective.example', 1),
(13, 1, 'Phone', 'Phone', '+1-312-555-0188', 1),
(14, 7, 'Email', 'Email', 'packing@fulfillment-partners.example', 6),
(15, 8, 'Email', 'Email', 'packing@fulfillment-partners.example', 6);

TRUNCATE TABLE association RESTART IDENTITY CASCADE;

INSERT INTO association (ASSOCIATIONID, COMPANY_ID, ASSOCIATED_COMPANY_ID, LINKAGE_METHOD, LINKAGE_VALUE, LINKAGE_TYPE, DATA_SOURCE_ID) VALUES
(1, 1, 2, 'Email', 'batches@bakehouse-collective.example', 'Shared production inbox', 4),
(2, 1, 10, 'Email', 'batches@bakehouse-collective.example', 'Shared production inbox', 4),
(3, 2, 11, 'Email', 'batches@bakehouse-collective.example', 'Shared production inbox', 7),
(4, 3, 5, 'Phone', '+1-414-555-0110', 'Shared procurement phone', 3),
(5, 3, 9, 'Phone', '+1-414-555-0110', 'Shared procurement phone', 2),
(6, 7, 8, 'Phone', '+1-773-555-0142', 'Shared fulfillment line', 6),
(7, 4, 6, 'Email', 'vanilla@pantry-inputs.example', 'Shared imports inbox', 5),
(8, 1, 12, 'Phone', '+1-312-555-0188', 'Shared bakery office line', 1);

TRUNCATE TABLE evidence RESTART IDENTITY CASCADE;

INSERT INTO evidence (EVIDENCE_ID, COMPANY_ID, SUBSTANCE_REFERENCE_ID, EVIDENCE_TYPE_ID, DATA_SOURCE_ID, LISTED_NAME_SUBSTANCE, REGION, EVIDENCE_WEIGHT, URL, RECORD_ID, DATE_LOGGED, SCRAPE_RUN_ID) VALUES
(1, 1, 1, 3, 1, 'all-purpose flour', 'Midwest', 31, 'https://cookie-demo.example/sources/harbor-batch-menu#record-1', 'cookie-demo-01-01-001', '2026-06-03', 'cookie-demo-run-001'),
(2, 1, 2, 1, 2, 'dark brown sugar', 'Midwest', 21, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-2', 'cookie-demo-01-02-002', '2026-06-04', 'cookie-demo-run-002'),
(3, 1, 3, 2, 1, 'cultured sweet cream butter', 'Midwest', 25, 'https://cookie-demo.example/sources/harbor-batch-menu#record-3', 'cookie-demo-01-03-003', '2026-06-05', 'cookie-demo-run-001'),
(4, 1, 4, 3, 2, 'Madagascar vanilla', 'Midwest', 22, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-4', 'cookie-demo-01-04-004', '2026-06-06', 'cookie-demo-run-002'),
(5, 1, 5, 1, 1, 'semisweet chocolate chips', 'Midwest', 25, 'https://cookie-demo.example/sources/harbor-batch-menu#record-5', 'cookie-demo-01-05-005', '2026-06-07', 'cookie-demo-run-001'),
(6, 1, 6, 2, 2, 'flaky sea salt', 'Midwest', 13, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-6', 'cookie-demo-01-06-006', '2026-06-08', 'cookie-demo-run-002'),
(7, 2, 1, 3, 4, 'all-purpose flour', 'Northeast', 32, 'https://cookie-demo.example/sources/maple-main-panel#record-7', 'cookie-demo-02-01-007', '2026-06-05', 'cookie-demo-run-004'),
(8, 2, 2, 1, 2, 'dark brown sugar', 'Northeast', 22, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-8', 'cookie-demo-02-02-008', '2026-06-06', 'cookie-demo-run-002'),
(9, 2, 3, 2, 4, 'cultured sweet cream butter', 'Northeast', 26, 'https://cookie-demo.example/sources/maple-main-panel#record-9', 'cookie-demo-02-03-009', '2026-06-07', 'cookie-demo-run-004'),
(10, 2, 4, 3, 2, 'Madagascar vanilla', 'Northeast', 23, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-10', 'cookie-demo-02-04-010', '2026-06-08', 'cookie-demo-run-002'),
(11, 2, 5, 1, 4, 'semisweet chocolate chips', 'Northeast', 26, 'https://cookie-demo.example/sources/maple-main-panel#record-11', 'cookie-demo-02-05-011', '2026-06-09', 'cookie-demo-run-004'),
(12, 2, 8, 2, 2, 'ground cinnamon', 'Northeast', 17, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-12', 'cookie-demo-02-08-012', '2026-06-10', 'cookie-demo-run-002'),
(13, 3, 1, 1, 2, 'all-purpose flour', 'Great Lakes', 26, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-13', 'cookie-demo-03-01-013', '2026-06-07', 'cookie-demo-run-002'),
(14, 3, 9, 2, 2, 'fine almond flour', 'Great Lakes', 21, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-14', 'cookie-demo-03-09-014', '2026-06-08', 'cookie-demo-run-002'),
(15, 4, 4, 5, 2, 'Madagascar vanilla', 'East Coast', 26, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-15', 'cookie-demo-04-04-015', '2026-06-09', 'cookie-demo-run-002'),
(16, 5, 3, 2, 3, 'cultured sweet cream butter', 'Wisconsin', 26, 'https://cookie-demo.example/sources/northwind-butter-sheet#record-16', 'cookie-demo-05-03-016', '2026-06-11', 'cookie-demo-run-003'),
(17, 6, 5, 5, 5, 'semisweet chocolate chips', 'West Coast', 32, 'https://cookie-demo.example/sources/cacao-coast-profile#record-17', 'cookie-demo-06-05-017', '2026-06-13', 'cookie-demo-run-005'),
(18, 6, 6, 1, 2, 'flaky sea salt', 'West Coast', 10, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-18', 'cookie-demo-06-06-018', '2026-06-14', 'cookie-demo-run-002'),
(19, 6, 8, 5, 5, 'ground cinnamon', 'West Coast', 21, 'https://cookie-demo.example/sources/cacao-coast-profile#record-19', 'cookie-demo-06-08-019', '2026-06-15', 'cookie-demo-run-005'),
(20, 7, 5, 4, 6, 'semisweet chocolate chips', 'Midwest', 31, 'https://cookie-demo.example/sources/golden-crate-roster#record-20', 'cookie-demo-07-05-020', '2026-06-15', 'cookie-demo-run-006'),
(21, 7, 6, 4, 6, 'flaky sea salt', 'Midwest', 17, 'https://cookie-demo.example/sources/golden-crate-roster#record-21', 'cookie-demo-07-06-021', '2026-06-16', 'cookie-demo-run-006'),
(22, 8, 1, 4, 6, 'all-purpose flour', 'National', 34, 'https://cookie-demo.example/sources/golden-crate-roster#record-22', 'cookie-demo-08-01-022', '2026-06-17', 'cookie-demo-run-006'),
(23, 8, 5, 4, 6, 'semisweet chocolate chips', 'National', 32, 'https://cookie-demo.example/sources/golden-crate-roster#record-23', 'cookie-demo-08-05-023', '2026-06-18', 'cookie-demo-run-006'),
(24, 8, 10, 4, 6, 'blackstrap molasses', 'National', 23, 'https://cookie-demo.example/sources/golden-crate-roster#record-24', 'cookie-demo-08-10-024', '2026-06-19', 'cookie-demo-run-006'),
(25, 9, 2, 1, 2, 'dark brown sugar', 'Gulf Coast', 20, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-25', 'cookie-demo-09-02-025', '2026-06-19', 'cookie-demo-run-002'),
(26, 9, 10, 1, 2, 'blackstrap molasses', 'Gulf Coast', 15, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-26', 'cookie-demo-09-10-026', '2026-06-20', 'cookie-demo-run-002'),
(27, 10, 1, 3, 4, 'all-purpose flour', 'South', 31, 'https://cookie-demo.example/sources/maple-main-panel#record-27', 'cookie-demo-10-01-027', '2026-06-21', 'cookie-demo-run-004'),
(28, 10, 2, 4, 6, 'dark brown sugar', 'South', 27, 'https://cookie-demo.example/sources/golden-crate-roster#record-28', 'cookie-demo-10-02-028', '2026-06-22', 'cookie-demo-run-006'),
(29, 10, 3, 3, 4, 'cultured sweet cream butter', 'South', 27, 'https://cookie-demo.example/sources/maple-main-panel#record-29', 'cookie-demo-10-03-029', '2026-06-23', 'cookie-demo-run-004'),
(30, 10, 5, 4, 6, 'semisweet chocolate chips', 'South', 31, 'https://cookie-demo.example/sources/golden-crate-roster#record-30', 'cookie-demo-10-05-030', '2026-06-24', 'cookie-demo-run-006'),
(31, 10, 10, 3, 4, 'blackstrap molasses', 'South', 20, 'https://cookie-demo.example/sources/maple-main-panel#record-31', 'cookie-demo-10-10-031', '2026-06-01', 'cookie-demo-run-004'),
(32, 11, 1, 3, 7, 'all-purpose flour', 'Pacific Northwest', 32, 'https://cookie-demo.example/sources/bluebird-archive#record-32', 'cookie-demo-11-01-032', '2026-06-23', 'cookie-demo-run-007'),
(33, 11, 4, 1, 2, 'Madagascar vanilla', 'Pacific Northwest', 19, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-33', 'cookie-demo-11-04-033', '2026-06-24', 'cookie-demo-run-002'),
(34, 11, 7, 3, 7, 'rolled oats', 'Pacific Northwest', 22, 'https://cookie-demo.example/sources/bluebird-archive#record-34', 'cookie-demo-11-07-034', '2026-06-01', 'cookie-demo-run-007'),
(35, 11, 8, 1, 2, 'ground cinnamon', 'Pacific Northwest', 15, 'https://cookie-demo.example/sources/pantry-inputs-catalog#record-35', 'cookie-demo-11-08-035', '2026-06-02', 'cookie-demo-run-002'),
(36, 11, 9, 3, 7, 'fine almond flour', 'Pacific Northwest', 25, 'https://cookie-demo.example/sources/bluebird-archive#record-36', 'cookie-demo-11-09-036', '2026-06-03', 'cookie-demo-run-007'),
(37, 12, 1, 3, 1, 'all-purpose flour', 'Southeast', 30, 'https://cookie-demo.example/sources/harbor-batch-menu#record-37', 'cookie-demo-12-01-037', '2026-06-01', 'cookie-demo-run-001'),
(38, 12, 2, 4, 6, 'dark brown sugar', 'Southeast', 26, 'https://cookie-demo.example/sources/golden-crate-roster#record-38', 'cookie-demo-12-02-038', '2026-06-02', 'cookie-demo-run-006'),
(39, 12, 3, 3, 1, 'cultured sweet cream butter', 'Southeast', 26, 'https://cookie-demo.example/sources/harbor-batch-menu#record-39', 'cookie-demo-12-03-039', '2026-06-03', 'cookie-demo-run-001'),
(40, 12, 4, 4, 6, 'Madagascar vanilla', 'Southeast', 23, 'https://cookie-demo.example/sources/golden-crate-roster#record-40', 'cookie-demo-12-04-040', '2026-06-04', 'cookie-demo-run-006'),
(41, 12, 5, 3, 1, 'semisweet chocolate chips', 'Southeast', 28, 'https://cookie-demo.example/sources/harbor-batch-menu#record-41', 'cookie-demo-12-05-041', '2026-06-05', 'cookie-demo-run-001'),
(42, 12, 7, 4, 6, 'rolled oats', 'Southeast', 22, 'https://cookie-demo.example/sources/golden-crate-roster#record-42', 'cookie-demo-12-07-042', '2026-06-06', 'cookie-demo-run-006');

TRUNCATE TABLE evidence_weighting_tag RESTART IDENTITY CASCADE;

INSERT INTO evidence_weighting_tag (EVIDENCE_WEIGHTING_TAG_ID, EVIDENCE_ID, WEIGHTING_TAG_ID) VALUES
(1, 1, 1),
(2, 3, 2),
(3, 5, 5),
(4, 7, 1),
(5, 9, 2),
(6, 11, 5),
(7, 13, 1),
(8, 16, 2),
(9, 17, 5),
(10, 20, 5),
(11, 22, 1),
(12, 23, 5),
(13, 24, 3),
(14, 26, 3),
(15, 27, 1),
(16, 29, 2),
(17, 30, 5),
(18, 31, 3),
(19, 32, 1),
(20, 37, 1),
(21, 39, 2),
(22, 41, 5);

TRUNCATE TABLE substance_weighting_tag RESTART IDENTITY CASCADE;

INSERT INTO substance_weighting_tag (SUBSTANCE_WEIGHTING_TAG_ID, SUBSTANCE_REFERENCE_ID, WEIGHTING_TAG_ID) VALUES
(1, 1, 1),
(2, 3, 2),
(3, 5, 1),
(4, 9, 5);
