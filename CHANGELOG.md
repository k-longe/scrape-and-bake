# Terminology Changelog

This demo preserves the existing interaction model while replacing sensitive domain wording with benign cookie ingredient terminology.

## Core UI label changes

- `Substance` → `Ingredient`
- `Substances` → `Ingredients`
- `Substance Matrix` → `Ingredient Matrix`
- `Substance Synonyms` → `Ingredient Synonyms`
- `Substance Sourcing` / sourcing references → `Ingredient Aliases` / `Ingredient References`
- `Evidence` → `Source Evidence`
- `Entity Flags` → `Company Signals`
- scoring methodology labels → `Signal Score Methodology`
- priority labels → `Supply Signal`

## Public-demo wording changes

- sensitive supply-chain framing → `Cookie ingredient supply-chain demo`
- document bucket labels → benign `Spec Sheets` / `Source Packets`
- restricted-material framing → ingredient reference and source-evidence framing
- enforcement-oriented copy → company signal and sourcing language
- legacy project-specific documentation copy → demo-specific public documentation

## Schema compatibility note

`SUBSTANCE_REFERENCE` remains the underlying table name for compatibility, but the demo relabels it to `Ingredient` in the UI where applicable.
