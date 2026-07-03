# Terminology Changelog

This demo preserves the existing interaction model while replacing sensitive domain language with benign cookie ingredient terminology.

## Core UI label changes

- `Substance` → `Ingredient`
- `Substances` → `Ingredients`
- `Substance Matrix` → `Ingredient Matrix`
- `Substance Synonyms` → `Ingredient Synonyms`
- `Substance Sourcing` / sourcing references → `Ingredient Aliases` / `Ingredient References`
- `Evidence` → `Source Evidence`
- `Entity Flags` → `Company Signals`
- `Risk Score Methodology` → `Signal Score Methodology`
- `Investigative Priority` → `Supply Signal`

## Sensitive language removed or replaced

- `Illicit substance supply chain intelligence` → `Cookie ingredient supply chain demo`
- sanction / indictment document labels → benign `Spec Sheets` / `Source Packets`
- scheduled / controlled-substance framing → ingredient reference and source-evidence framing
- high-risk actor / flagging copy → company signal / signal scoring copy
- TraCCC-specific descriptive copy in the UI → demo-specific documentation copy

## Schema compatibility note

`SUBSTANCE_REFERENCE` remains the underlying table name for compatibility, but the demo relabels it to `Ingredient` in the UI where applicable.
