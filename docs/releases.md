# Release notes

## 2026-10-21 — Housing costs, real property prices and private credit

- Added six annual charts and 215 observations: five-year mortgage offers (2008–2025), existing-mortgage average and rental reference rate (2009–2025), real house prices (1970–2025), private non-financial credit/GDP (1960–2025) and mortgage volumes (1985–2025).
- Verified SNB, BWO and BIS source selections, definitions and reuse evidence. Preserved immutable original CSVs, a reproducible BWO numeric-table extraction, unit/dimension evidence, source breaks and reconstructed historical segments.
- Kept survey/effective dates, legally applicable rates versus statistical means, offered versus outstanding mortgage rates, complete-year means versus Q4/December stocks, the compatible BIS GDP denominator and the pre-1999 narrower credit proxy explicit. No annual 2026 is manufactured.
- Added source notes beside charts, detailed methodology, downloads, regression tests and updated scope ownership. The atlas now publishes 41 datasets and 11,587 observations; trade/current-account flows and fiscal flows are the two remaining P1 groups. Rents, vacancies and other banking measures remain planned; existing licensing placeholders are unchanged.

## 2026-10-21 — Real wages and median disposable household income

- Added the FSO real gross wage index (1939=100), 84 annual values for 1942–2025. Retained the 1942 source estimate, the 1994 wage-source/CPI-timing change and published precision; no second deflation or growth derived from rounded levels.
- Added the FSO HBS total-population median disposable equivalised income, 24 annual values for 2000–2023, in CHF per month at 2023 prices. These are annual observations of monthly income amounts, not monthly-frequency data. No imputed rent, PPP conversion, SILC splice, mean-income substitution or invented recent years.
- Disconnected the income chart at the 2015 weighting break. Preserved 95% bounds in the original source download, with an explicit point-estimate/sampling-uncertainty note. Added source-specific imports, immutable evidence, audit documentation and desktop/mobile coverage.
- The atlas now publishes 35 datasets and 11,372 observations. The two purchasing-power families join the maintained foundation; housing and its financing lead the three remaining P1 acquisition groups.

## 2026-10-21 — Hourly labour productivity and compatible total hours

- Added 35 annual FSO real hourly-productivity observations (published index 1991=100) and 35 compatible total actual-hours observations (million hours), both 1991–2025.
- Used the matched 28 August 2026 WPS tables. Verified every hours total against the productivity denominator's index and every productivity value against its source GDP/hours identity. The current-price workbook supplies only the physical hours column, not nominal productivity.
- Preserved the FSO's pre-2010 harmonisation after the 2021 Work Volume Statistics revision without introducing an artificial 2010 gap. Retained 2023–2025 R flags as revised, with both source snapshots in hours lineage.
- Added source definitions beside charts, index/unit explanations, OPEN-BY source attribution, original workbook and metadata evidence, reproducible extraction and tests. No invented pre-1991 or partial-year 2026 observations.
- The atlas now publishes 33 datasets. Productivity/hours move into the maintained foundation; real wages and household income lead the remaining P1 roadmap.

## 2026-10-21 — Five verified annual exchange-rate charts

- Added CHF/EUR (ECB, 1999–2025), CHF/USD (Federal Reserve G.5A, 1971–2025), and historical CHF/DEM (Bundesbank daily Frankfurt fixings converted before annual averaging, 1950–1998).
- Added SNB-published annual nominal and CPI-based real effective overall indices for 1973–2025, 2000=100. Preserved the 2000 partner-pool change and modern-method backcast.
- Added direction/quotation notes beside charts, information and methodology pages, exact source/reuse audits, immutable raw snapshots and a reproducible checksum-pinned Federal Reserve ZIP extraction. No restricted SNB/Bloomberg bilateral quotes are published.
- Published 237 additional annual observations in five datasets. No incomplete 1949 mark year, synthetic pre-1999 euro, post-1998 mark or partial 2026 annual observation.
- Moved the two completed exchange-rate families into the verified foundation. The remaining P1 sequence begins with productivity and hours; the five previous source/licensing candidates remain unresolved.

## 2026-10-21 — Governing scope and remaining-data roadmap

- Adopted the history of Swiss prosperity as the governing scope, documented in `docs/scope.md`, with a validated editorial registry of ten modules and 47 indicator families.
- Added the public Scope & roadmap page with ordered P1 acquisitions, P2/P3 priorities, manifest-derived availability and the five unresolved GMBF/SIX definitions.
- Aligned catalogue topics with the ten modules; preserved the legacy government-financing anchor and existing series IDs, observations, annual charts and saved layouts.
- Added scope links from the homepage, navigation, catalogue and methodology. The full policy covers historical events/institutions, annual and incomplete-year rules, long-run/geographical extensions, admission criteria and exclusions.
- Documented the six-panel overview as a development target, with the current empty-workspace experience retained. This release adds governance and discovery, not new economic observations.

## 2026-10-21 — Distinguish SECO registered unemployment and ILO / BFS unemployment

- Clarified the four monthly, quarterly and annual display titles with the responsible institution, retaining all series IDs and observations.
- Added source, method, actual coverage and annual-aggregation explanations to unemployment charts, the picker, information dialogs and series pages.
- Added a comparison note whenever both concepts appear in the workspace, including separate panels, overlays and restored layouts. The methodology explains RAV registration, benefit exhaustion, the ILO survey definition and why the rates' difference does not count unregistered jobseekers.
- Preserved complete-year SECO means, published BFS annual estimates, the 2021 survey break and the separate native-frequency downloads.

## 2026-10-12 — SECO registered unemployment

- Added the official SNB Labour market cube's total, unadjusted SECO registered-unemployment rate: 512 monthly observations for 1984-01–2026-08. The retained 21 September 2026 source vintage has no September observation; 2026 monthly points remain provisional.
- Added 42 complete annual arithmetic means for 1984–2025. The calculation requires all twelve monthly observations and deliberately omits partial 2026.
- Retained the exact SNB CSV snapshot, source selection, SHA-256 and non-commercial attribution conditions. The SNB cube identifies SECO as the underlying source; this does not grant broader commercial rights to SECO/third-party material.
- The remaining five planned datasets stay unpublished: three-month GMBF auction events and the daily/annual SMI and SMIC return series. Their source evidence and blockers are recorded in the audit files.

## 2026-10-12 — Four previously missing source series and two GDP levels

- Added FSO-derived annual real GDP and real GDP per capita for 1948–2025. Real GDP is reconstructed from the FSO 2020 nominal anchor and published annual real growth; per capita uses the explicitly documented 31-December permanent-resident denominator.
- Added FFA general-government gross debt, Confederation gross debt and Confederation debt/GDP for 1990–2026. 2026 highrechnung/forecast rows remain tagged forecast/provisional and are not treated as completed-year observations.
- Added 803 monthly SNB historical Confederation yields by maturity for 1924-01–1990-12 from table 3.1a_M, preserving the original series identity and method-change notes.
- Registered `chain_level`, `per_capita` and the FFA importer, added immutable source snapshots, and regenerated the public data export. The 2026 partial-year/forecast separation remains explicit.
- GMBF auction yields and SIX SMI/SMIC data remain unpublished until exact source reuse terms and/or licensing are established. The SECO registered-unemployment series was subsequently verified through the SNB Labour market cube; see the release above.

## 2026-10-08 — Annual unemployment and unrestricted chart overlays

- Added the FSO’s 16 published annual ILO unemployment rates for 2010–2025 from the checksum-verified retained workbook. Quarterly ILO data and SECO registered-unemployment candidates retain their separate identities.
- Any available annual chart can overlay any other chart. A chart’s Overlay button moves all its indicators; each indicator’s ↗ chooser moves one line to any destination. The Add to menu accepts all charts.
- Matching units share a scale; different units and price bases use separately labelled original-value axes. Additional axes scroll within the chart on phones, with all indicator labels and controls visible.
- Retained observation-status styling, missing years, definition breaks, independent chart ranges, browser-storage keys and saved/shared layout compatibility. Publication still requires verified, permitted observations and deploys only checked production `dist/`.
- Validation: 64 unit/data/configuration checks and 30 desktop/mobile browser cases passed, including unemployment/rate overlays, arbitrary destinations, three unit axes, original readouts, saved/shared restoration and annual downloads.

## 2026-10-08 — Empty workspaces and chart-specific years

- New workspaces start without charts or timeline controls. An Add indicator card remains below the charts for the next addition; Reset clears the workspace.
- The indicator picker selects the full available annual range by default. Users can shorten it before adding or edit a chart's year button later without changing other charts.
- Saved/shared layouts retain their chart arrangements. Older layouts inherit their original shared years into each chart; source observations and publication safeguards are unchanged.

## 2026-10-08 — Original-unit charts only

- Removed the Original units / Index to 100 selector, base-year controls and optional Original-value labels control and rendering.
- Charts and inspection always use published original values. Indicators with incompatible units remain in separate synchronized panels.
- Former indexed saved/shared layouts migrate to original-unit panels without losing indicators. Existing version 2 layouts and browser-storage keys remain readable; former optional value-label flags are ignored.
- Updated demonstration presets, composition documentation and checks. Economic observations, sources, redistribution safeguards and downloads are unchanged.

## 2026-10-08 — Swiss Economic Atlas migration

- Rename the project branding and repository references to Swiss Economic Atlas / `swiss-economic-atlas`.
- Share the site/base configuration across Astro, publication checks, the browser-test server and Playwright. Both the former and new repository names derive their own Pages paths; local previews default to `/swiss-economic-atlas/`.
- Preserve all economic observations, source attribution, licences, identifiers and saved/shared chart formats. Production deployment retains the same validation gates and uploads only `dist/`.
- The new website address is https://duracell04.github.io/swiss-economic-atlas/. Repository links redirect after renaming, while the former Pages address does not. Existing shared fragments can be retained on the new address.

## 2026-10-08 — Nominal GDP

- Added 78 annual FSO current-price GDP values for 1948–2025 in CHF millions, preserving published numeric precision and original source bytes.
- Documented the pre-1995 retropolation, marked historical values reconstructed and the 1995 methodological boundary, and left 1946–1947 and 2026 without GDP observations.
- Recorded the exact August 2026 dataset, immutable checksum, normal source-status mapping and FSO OPEN-BY attribution terms. Other GDP identities remain separate candidates.
- Added optional `--importer fso-gdp`, retaining `canonical-csv` as the default. Nominal GDP is selectable and downloadable; the existing production default layout is preserved.
- Replaced production-wide fixed observation totals with scoped dataset checks so subsequent indicator additions do not invalidate the existing yield and debt tests.
- Validation: source-row reproduction, importer rejection/atomicity and CLI compatibility checks, production GDP chart/indexing/gaps and downloads at desktop and phone sizes, plus the full `npm run check:all` suite.

## 2026-10-07 — General government gross debt / GDP

- Published 81 annual ratios for 1946–2026 in their own production panel; the default now has yields, completed-year spreads and broad gross debt.
- Kept the broad concept distinct from Maastricht debt and Confederation-only debt. Marked historical reconstruction and the 1988/1990 source-vintage boundaries; 2025 is provisional and 2026 is an IMF forecast with a dashed connector.
- Retained three checked CSV extractions: JST R6 fractional ratios, official IMF DataMapper readings and the cited two-decimal WEO transcription. Documented attribution and non-commercial/share-alike terms on the downloads page and in the manifest.
- Confirmed the Guex & Guex supplementary table is downloadable; its earlier reconstruction is reserved for a separately audited extension rather than silently merged into this composite.
- Validation: production data, registry and reproducibility checks, Astro/TypeScript, static build/link checks, isolated demo and all 14 desktop/mobile browser checks passed. The production artifact has 255 data points in four datasets and no synthetic observations. The pending equity preparation remains outside this commit.

## 2026-10-07 — First verified data: Confederation yields

- Added the supplied 1946–2026 annual long-yield history and 1980–2026 GMBF history, retaining three decimals, publisher terms and four immutable source snapshots.
- Identified 1946–1954 as the historical yield-by-maturity proxy; marked the 1955 change to the OECD benchmark and preserved the separate daily spot-rate candidate.
- Added the 10Y − 3M spread for matched completed years 1980–2025. Added optional explicit spread-period exclusions so unequal 2026 Jan–Aug / Jan–Sep averages cannot produce a misleading spread.
- Made financing yields and their spread the production default. Year inspection displays source-convention notes and both 2026 averaging windows; partial-year points are provisional observations, not forecasts. The synthetic local demonstration retains its original layout.
- Checked every OECD completed-year value against the source table and reproduced all 2007–2026 GMBF averages from SNB EG3M. Added source audit and reproducibility tests.
- Validation: 21 data/calculation/composition tests, zero TypeScript/Astro diagnostics, 31 production pages and 442 internal links, isolated demo build and all 14 desktop/mobile browser checks passed. Production contains 174 verified observations and no synthetic series.

## 0.2.0 — Interactive atlas

- Simplified the toolbar: removed preset selection and made the original three-panel arrangement the default and Reset destination. Internal preset records and saved/shared layouts remain supported.

- Replaced the portal homepage with synchronized configurable annual SVG charts inspired by the original HTML.
- Migrated registries/manifest to schema 2.0.0 with independent topics, transformations, presets and statistical metadata.
- Added indicator selection, overlay/separation/reordering, explicit fixed-base indexing, ranges, context and synchronized inspection.
- Added demo-only deterministic observations, status/gap/break styling, sourced-annotation contracts and isolated share/save state.
- Added extensibility, desktop/mobile interaction and publication-isolation checks; Pages deploys only checked production artifacts.

No Swiss observations or historical reference claims are verified in this release. The production shell is deployed at https://duracell04.github.io/helvetic-economic-indicators/ through GitHub Actions; synthetic preview observations are excluded.

## 0.1.0 — Foundation

- Established source and series contracts, immutable snapshots, canonical CSV and deterministic public exports.
- Added annual growth, rebasing and aligned spread calculations with validation.
- Added 18 candidate series in six planned analytical bands, with publisher audit templates.
- Added the static catalogue, methodology and download shell and GitHub Pages workflows.

No real observations, verified historical coverage, chart findings or unrestricted dataset licence are claimed.

## 8 October 2026 — real GDP growth

Add 77 published FSO real annual changes, 1949–2025, in a separate indicator commit. [Audit](source-audit/real-gdp-growth.md).

## 8 October 2026 — population

Add 165 published year-end counts, 1861–2025, preserving reconstructed census history and register transitions. [Audit](source-audit/population.md).

## 8 October 2026 — ILO unemployment

Add 85 published quarterly survey unemployment rates, preserving Q2-only historical coverage and survey transitions. [Audit](source-audit/ilo-unemployment.md).

## 8 October 2026 — Consumer price index

Add 526 monthly total CPI levels on the December 2025 base, preserving published precision and frequency. [Audit](source-audit/cpi.md).

## 8 October 2026 — Annual CPI inflation

Add 42 published complete-year annual-average CPI inflation rates, 1984–2025, as a separate indicator. [Audit](source-audit/cpi-inflation.md).

## 8 October 2026 — SNB policy rate

Add 12 SNB policy-rate effective-change events, with the exact daily source retained and earlier instruments kept separate. [Audit](source-audit/snb-policy-rate.md).

## 8 October 2026 — Annual SNB policy rate

Add six explicitly calculated complete-year calendar-day-weighted policy-rate averages, 2020–2025; omit partial 2019 and 2026. [Audit](source-audit/snb-policy-rate-annual.md).

## 8 October 2026 — Historical SNB Libor target range — lower bound

Add 26 historical lower Libor target-bound events, preserving the separate instrument identity. [Audit](source-audit/snb-libor-target-lower.md).

## 8 October 2026 — Historical SNB Libor target range — upper bound

Add 28 historical upper Libor target-bound events, preserving the separate instrument identity. [Audit](source-audit/snb-libor-target-upper.md).

## 8 October 2026 — Ten-year Confederation spot rate

Add 7,826 native-date ten-year Confederation spot-rate estimates, preserving historical sampling gaps and the 1998 availability boundary. [Audit](source-audit/confederation-10y.md).

## 8 October 2026 — Historical SNB discount rate — year end

Add 92 published year-end historical discount-rate readings, 1907–1998, in a separate instrument series. [Audit](source-audit/snb-discount-rate.md).

## 8 October 2026 — Historical SNB Lombard rate — year end

Add 99 published year-end historical Lombard readings, 1907–2005, with 1989 and 2004 instrument annotations. Keep historical instruments separate. [Audit](source-audit/snb-lombard-rate.md).

## 8 October 2026 — Real GDP source audit

Remains candidate: Establish a dataset-specific redistribution grant for the annual real-volume workbook, or obtain a compatible FSO OPEN-BY real-volume dataset. [Audit](source-audit/real-gdp.md).

## 8 October 2026 — Real GDP per capita source audit

Remains candidate: Resolve the real-GDP source reuse grant and verify a compatible published annual-average population denominator, or obtain an official real-GDP-per-capita series with documented methodology and permission. [Audit](source-audit/real-gdp-per-capita.md).

## 8 October 2026 — Registered unemployment source audit

Superseded on 12 October 2026 by the verified SNB/SECO monthly cube extract. [Audit](source-audit/registered-unemployment.md).

## 8 October 2026 — Annual registered unemployment source audit

Superseded on 12 October 2026 by the verified annual mean derived from the SNB/SECO monthly cube. [Audit](source-audit/registered-unemployment-annual.md).

## 8 October 2026 — General-government gross debt source audit

Remains candidate: Retrieve usable original FFA data and codelists; verify consolidated general government, debt valuation/consolidation and the FS/GFS debt definition and currency scale. [Audit](source-audit/general-government-debt.md).

## 8 October 2026 — Confederation gross debt source audit

Remains candidate: Retrieve usable original FFA data and codelists; verify Confederation, debt valuation/consolidation and the FS/GFS debt definition and currency scale. [Audit](source-audit/confederation-debt.md).

## 8 October 2026 — Confederation debt / GDP source audit

Remains candidate: Retrieve usable original FFA data and codelists; verify Confederation debt and nominal-GDP denominator, debt valuation/consolidation and the matching annual nominal-GDP vintage and ratio convention. [Audit](source-audit/confederation-debt-ratio.md).

## 8 October 2026 — Historical long-term Confederation yield source audit

Remains candidate: Locate and retrieve the original SNB monthly historical long-term yield table; verify its exact series identity, method transitions, native periods and source-specific reuse terms. [Audit](source-audit/confederation-long-yield.md).

## 8 October 2026 — Three-month GMBF auction yield source audit

Remains candidate: Establish reuse permission for the exact FFA auction workbook, then audit the three-month tranche selection, event-date identity, quotation and duplicate-auction handling. [Audit](source-audit/gmbf-3m.md).

## 8 October 2026 — SMI price-return index source audit

Remains candidate: Obtain an authorized SIX historical SMI closing-level dataset and a licence covering public website display and CSV/JSON redistribution; verify trading-date closes and original historical precision. [Audit](source-audit/smi.md).

## 8 October 2026 — SMIC total-return index source audit

Remains candidate: Obtain an authorized SIX historical SMIC closing-level dataset and a licence covering public website display and CSV/JSON redistribution; verify trading-date closes and original historical precision. [Audit](source-audit/smic.md).

## 8 October 2026 — SMI annual price return source audit

Remains candidate: Obtain an authorized SIX historical SMI closing-level dataset and a licence covering public derived annual returns and downloads; verify matching year-end trading closes. [Audit](source-audit/smi-annual-return.md).

## 8 October 2026 — SMIC annual total return source audit

Remains candidate: Obtain an authorized SIX historical SMIC closing-level dataset and a licence covering public derived annual returns and downloads; verify matching year-end trading closes. [Audit](source-audit/smic-annual-return.md).
