-- Cookie demo compatibility views and lightweight RPCs.
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
