#!/usr/bin/env python3
"""Collect a few benign public bakery/supplier pages for the cookie demo.

Outputs:
- raw_html/*.html
- parsed_evidence.csv
- scrape_summary.json

The parser is intentionally lightweight and keyword-based so it can run with
the Python standard library only.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import re
import ssl
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TARGETS = ROOT / "scripts" / "public_cookie_targets.json"
DEFAULT_OUTPUT = ROOT / "scraper_output" / "example_run"
USER_AGENT = "scrape-and-bake-scraper/1.0 (+https://example.com)"


def sanitize_filename(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "page"


def strip_html(raw_html: str) -> str:
    without_scripts = re.sub(r"<script\b.*?</script>", " ", raw_html, flags=re.IGNORECASE | re.DOTALL)
    without_styles = re.sub(r"<style\b.*?</style>", " ", without_scripts, flags=re.IGNORECASE | re.DOTALL)
    without_tags = re.sub(r"<[^>]+>", " ", without_styles)
    text = html.unescape(without_tags)
    return re.sub(r"\s+", " ", text).strip()


def fetch_html(url: str, timeout: int = 20) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(request, timeout=timeout, context=ssl_context) as response:
        encoding = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(encoding, errors="replace")


def build_fixture_html(target: dict) -> str:
    ingredients_markup = "\n".join(
        f"<li>{html.escape(aliases[0])}</li>"
        for aliases in target.get("ingredient_aliases", {}).values()
        if aliases
    )
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{html.escape(target["data_source_name"])}</title>
  </head>
  <body>
    <main>
      <h1>{html.escape(target["company_name"])}</h1>
      <p>Fixture fallback generated because public network access was unavailable during the demo build.</p>
      <section>
        <h2>{html.escape(target["data_source_name"])}</h2>
        <ul>
          {ingredients_markup}
        </ul>
      </section>
    </main>
  </body>
</html>
"""


def build_record_id(page_index: int, ingredient_index: int, ingredient_name: str) -> str:
    return f"cookie-scrape-{page_index:02d}-{ingredient_index:02d}-{sanitize_filename(ingredient_name)}"


def parse_targets(raw_text: str):
    targets = json.loads(raw_text)
    if not isinstance(targets, list):
        raise ValueError("Targets file must contain a JSON array.")
    return targets


def extract_rows(targets, output_dir: Path):
    run_timestamp = datetime.now(timezone.utc)
    scrape_run_id = run_timestamp.strftime("cookie-demo-scrape-%Y%m%dT%H%M%SZ")
    parsed_rows = []
    failures = []
    page_summaries = []

    raw_html_dir = output_dir / "raw_html"
    raw_html_dir.mkdir(parents=True, exist_ok=True)

    for page_index, target in enumerate(targets, start=1):
        url = target["url"]
        company_name = target["company_name"]
        page_name = target["data_source_name"]
        evidence_type = target["evidence_type"]
        source_type = target["data_source_type"]
        source_mode = "live_fetch"
        fetch_error = ""
        try:
            raw_html = fetch_html(url)
        except (urllib.error.URLError, TimeoutError, ValueError) as exc:
            raw_html = build_fixture_html(target)
            source_mode = "fixture_fallback"
            fetch_error = str(exc)

        filename = sanitize_filename(company_name)
        (raw_html_dir / f"{filename}.html").write_text(raw_html, encoding="utf-8")
        page_text = strip_html(raw_html).lower()
        ingredient_matches = []

        for ingredient_index, (ingredient_name, aliases) in enumerate(target.get("ingredient_aliases", {}).items(), start=1):
            matched_alias = next((alias for alias in aliases if alias.lower() in page_text), None)
            if not matched_alias:
                continue
            ingredient_matches.append(ingredient_name)
            parsed_rows.append({
                "company_name": company_name,
                "source_url": url,
                "scrape_run_id": scrape_run_id,
                "evidence_type": evidence_type,
                "record_id": build_record_id(page_index, ingredient_index, ingredient_name),
                "date_logged": run_timestamp.date().isoformat(),
                "data_source_name": page_name,
                "data_source_type": source_type,
                "ingredient_name": ingredient_name,
                "observed_text": matched_alias,
            })

        page_summaries.append({
            "company_name": company_name,
            "url": url,
            "data_source_name": page_name,
            "data_source_type": source_type,
            "evidence_type": evidence_type,
            "source_mode": source_mode,
            "matched_ingredients": ingredient_matches,
            "matched_ingredient_count": len(ingredient_matches),
            "raw_html_file": f"raw_html/{filename}.html",
            "fetch_error": fetch_error,
        })

    return scrape_run_id, parsed_rows, failures, page_summaries


def write_outputs(output_dir: Path, scrape_run_id: str, parsed_rows, failures, page_summaries):
    output_dir.mkdir(parents=True, exist_ok=True)
    csv_path = output_dir / "parsed_evidence.csv"
    summary_path = output_dir / "scrape_summary.json"

    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        fieldnames = [
            "company_name",
            "source_url",
            "scrape_run_id",
            "evidence_type",
            "record_id",
            "date_logged",
            "data_source_name",
            "data_source_type",
            "ingredient_name",
            "observed_text",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(parsed_rows)

    summary = {
        "scrape_run_id": scrape_run_id,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "target_count": len(page_summaries) + len(failures),
        "success_count": len(page_summaries),
        "failure_count": len(failures),
        "parsed_evidence_row_count": len(parsed_rows),
        "pages": page_summaries,
        "failures": failures,
    }
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Scrape a few benign cookie supply-chain source pages.")
    parser.add_argument("--targets", default=str(DEFAULT_TARGETS), help="Path to the JSON targets file.")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT), help="Directory for raw HTML and parsed outputs.")
    args = parser.parse_args(argv)

    targets_path = Path(args.targets).resolve()
    output_dir = Path(args.output_dir).resolve()
    raw_targets = targets_path.read_text(encoding="utf-8")
    targets = parse_targets(raw_targets)
    scrape_run_id, parsed_rows, failures, page_summaries = extract_rows(targets, output_dir)
    write_outputs(output_dir, scrape_run_id, parsed_rows, failures, page_summaries)
    print(
        json.dumps(
            {
                "scrape_run_id": scrape_run_id,
                "output_dir": str(output_dir),
                "success_count": len(page_summaries),
                "failure_count": len(failures),
                "parsed_evidence_row_count": len(parsed_rows),
            },
            indent=2,
        )
    )
    return 0 if page_summaries else 1


if __name__ == "__main__":
    sys.exit(main())
