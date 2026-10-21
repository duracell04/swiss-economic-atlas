# Housing and private credit: exact source and reuse audit

Verified 21 October 2026. Six annual datasets, 215 observations. All stop at 2025; no partial 2026 quarter or announcement is presented as a completed annual observation. The four scope families join the maintained foundation. This does not complete rents, vacancies or the banking module.

| Atlas dataset | Exact source selection | Annual coverage | Convention |
| --- | --- | --- | --- |
| `mortgage-offer-rate-annual` | [SNB zikrepro](https://data.snb.ch/en/topics/snb/cube/zikrepro), D0=M, D1=50 | 2008–2025 (18) | Mean of 12 month-end unweighted bank averages of five-year fixed mortgage offers |
| `mortgage-outstanding-rate-annual` | [BWO official history](https://www.bwo.admin.ch/de/entwicklung-referenzzinssatz-und-durchschnittszinssatz), underlying average, survey date | 2009–2025 (17) | Equal-weight mean of four quarterly volume-weighted outstanding-mortgage rates |
| `rental-reference-rate-annual` | BWO same table, reference rate, effective date | 2009–2025 (17) | Calendar-day-weighted mean of the legal rates in force |
| `real-residential-property-prices` | [BIS WS_SPP Q.CH.R.628](https://stats.bis.org/api/v1/data/WS_SPP/Q.CH.R.628?format=csv) | 1970–2025 (56) | Mean of four published CPI-deflated quarterly index values, 2010=100 |
| `private-credit-gdp` | [BIS WS_TC Q.CH.P.A.M.770.A](https://data.bis.org/topics/TOTAL_CREDIT/BIS%2CWS_TC%2C2.0/Q.CH.P.A.M.770.A) | 1960–2025 (66) | Q4 ratio: end-quarter credit divided by the same vintage's four-quarter nominal GDP |
| `domestic-mortgage-volume` | [SNB bakredinausbm](https://data.snb.ch/en/topics/banken/cube/bakredinausbm), AV1/I/H/F | 1985–2025 (41) | December outstanding domestic mortgage utilisation, nominal CHF million |

Exact API requests, retrieval dates, immutable raw CSV hashes and source terms are in `data/registry/registry.json`. The export manifest retains lineage and definitions. SNB offer-rate vintage: 1 October 2026, 14:30; mortgage-stock vintage: 21 October 2026, 09:00. BWO history page: 1 September 2026. BIS selected-property release: 24 September 2026; credit release: 14 September 2026. Retrieval is not an observation's publication date. BIS and BWO per-observation publication dates remain null; SNB dates identify the retained publication vintage, not each observation's first release. Final status means completed observations without a source provisional flag, not immunity from revision. Historic proxy/composite estimates are identified separately as reconstructed.

## Three distinct mortgage-related rates

The SNB published-rate survey selects **five-year fixed mortgage offers**, not variable first mortgages, SARON mortgages or negotiated loan agreements. M is the unweighted cross-bank mean; product 50 is five-year fixed. The twelve month-end means receive equal weight. December 2007 is retained in the source but not passed off as an annual observation. The first complete year, 2008, follows the December 2007 survey expansion. No historical variable-rate splice is made. The 2008 mean is 3.84083333333333%; 2025 is 1.54994835583333%.

BWO's underlying average is the **volume-weighted rate on existing domestic CHF mortgages**, with Swiss property collateral, including older fixed-rate contracts. See its [reference-rate explanation](https://www.bwo.admin.ch/de/referenzzinssatz) and [official methodological flyer](https://www.bwo.admin.ch/dam/de/sd-web/RwTQ890N41a7/merkblatt_zum_hypothekarischenreferenzzinssatzbeimietverhaeltnis.pdf). Our annual average gives each quarterly survey reading equal weight; it is not an independently volume-weighted average across the whole year. Assign the rate to the **survey date**, not the later announcement/effective date. In particular, the 31 December 2025 reading of 1.32%, published in March 2026, contributes to the 2025 average: `(1.44 + 1.37 + 1.33 + 1.32) / 4 = 1.365%`. The first source year 2008 lacks Q1 and is omitted.

The legal rental reference rate is published in quarter-percentage-point steps. We use the **effective dates and published reference values**, not rounded annual averages of the underlying mortgage rates. The old threshold rule differs from commercial rounding introduced on 2 December 2011; preserve the original table and footnote rather than applying today's rounding retrospectively. The annual mean weights each day's actual rate, including leap days. For 2025: `(62 × 1.75 + 182 × 1.50 + 121 × 1.25) / 365 = 1.45958904109589%`. The official history continues into 2026, bounding the final December interval; no future rate is assumed. September–December 2008 is partial and excluded. The constant 2024 rate yields 1.75% over 366 days.

**These annual means are descriptive statistics, not legally applicable rental rates or rent changes.** Direct legal questions to the official effective-date history and applicable law. The atlas does not calculate an entitlement to a rent adjustment.

## Real residential property prices

The [BIS selected-series documentation](https://www.bis.org/statistics/pp_selected_documentation.pdf), updated 31 July 2026, identifies the national Swiss compilation:

- 1970–1984: unweighted average of owner-occupied flat and house **offer-price** series nationwide.
- 1985–2016: unweighted average of owner-occupied flat and house **transaction-price** series nationwide.
- From 2017-Q1: FSO all-dwellings residential property prices.

Attribute **BIS calculations, Federal Statistical Office, and Swiss National Bank data based on Wüest und Partner**. The pre-2017 long-run composite is marked reconstructed; source transitions in 1985 and 2017 disconnect the line. Historical coverage is best-effort, not a homogeneous modern transaction-price index. BIS documentation notes that some historical quarterly series may be interpolated from annual inputs; the atlas does not invent additional quarters or imply every historical quarter was separately surveyed.

The real series is already CPI-deflated. Unit 628 selects the **index**, not unit 771's growth rate, and VALUE=R selects real, not nominal, prices. Average the four published real quarters; do not deflate again, average growth rates, or use Q4 as an annual mean. The native 2010 real-quarter values average to **100.00195**, retained under the publisher's 2010=100 convention without forced annual rebasing. The means are 75.0834 in 1970 and 158.874075 in 2025. Native 2026-Q1/Q2 remain in the original snapshot only. This index is not a CHF property price, rent index, affordability ratio or total investment return.

## Private non-financial credit / GDP

The [BIS credit overview](https://data.bis.org/topics/TOTAL_CREDIT) and [country documentation, Switzerland](https://www.bis.org/statistics/totcredit/credpriv_doc.pdf) establish the definition. Borrowers are households including NPISH and non-financial corporations, including public corporations; financial firms and general government are excluded. Total/all-lender credit includes domestic banks, other domestic creditors and non-residents. Core debt includes loans, debt securities and currency/deposits where relevant. The stock is gross of assets and unconsolidated: intra-sector debt is not netted out. Debt securities use market value; loans use nominal values.

The selected series is **break-adjusted**, not the credit-to-GDP gap. The denominator is BIS's same-vintage four-quarter sum of nominal GDP, not the atlas's differently sourced GDP. Retain the published ratio and select Q4, rather than dividing incompatible inputs or averaging quarterly ratios. The ratio's available history begins in 1960-Q4 even though underlying credit data extend earlier. Q4 1960 is 128.9%; Q4 2025 is 251.9%.

Historical coverage is materially narrower: before **1999-Q4**, BIS uses domestic bank credit as a proxy; from then it uses quarterly financial accounts and all lenders. Pre-1999 annual readings are identified as reconstructed, and the 1999 transition is visible. Proxy compilation changes in 1975-Q2, 1981-Q4 and 1987-Q4 and the 2014 cross-border/securities-survey revision remain recorded. BIS level adjustments do not make definitions identical across time. The original observations' standard A status does not erase this documented historical construction. 2026-Q1 is retained but not published as year-end 2026.

## Mortgage volumes

SNB selection **AV1/I/H/F** means banks in Switzerland / domestic / mortgage loans / utilisation. Original JSON metadata confirms monthly frequency and **CHF millions**. It measures gross outstanding mortgage claims to non-banks reported as mortgage loans and relevant fair-value positions, not unused credit lines or new-mortgage flows. Non-bank borrowers are not just households, and collateral is not confined to owner-occupied dwellings. All maturities are included. It is not interchangeable with all-lender private credit.

Select December, unchanged, without summing or averaging monthly balance-sheet stocks. December 1985 is available despite the source beginning in June. The 2025 stock is **CHF 1,243,226 million**. Pre-June-1997 all-bank totals were extrapolated where possible; annual readings before 1997 are marked reconstructed. Preserve these source warnings:

- June 1997 reporting-population expansion.
- November 2001 utilisation changes from balance-sheet figures to gross claims.
- September 2006 includes all Raiffeisen banks rather than the 34 larger banks.
- June 2013 includes PostFinance.
- May 2017 intragroup-financing arrangements change.

The December 2014 clarification concerns **credit lines**, not this selected utilisation total; the June 2023 suppression concerns bank subgroups, not the retained all-bank total. These do not introduce artificial gaps in the selected line. The April 2026 collateral-allocation warning lies outside published annual coverage. See [SNB banking notes](https://data.snb.ch/en/topics/banken/doc/explanations_banken) and the cube's source-specific footnotes.

## Redistribution evidence and limits

- **SNB's own survey data:** [copyright terms](https://www.snb.ch/en/srv/disclaimer_copyright) expressly permit compatible non-commercial reuse with source attribution, without implying affiliation. Selected mortgage-rate and loan-stock statistics identify SNB as source. These terms are not a commercial licence and do not override third-party copyrights. No proprietary market benchmark quote is copied.
- **BIS:** [permitted-use terms](https://www.bis.org/about/legal/permitted-use-statistics), together with the selected-property and credit documentation, permit downloading, reproduction and dissemination of the selected statistics with BIS and appropriate national-source attribution. Preserve identity, identify our annual calculation, do not imply endorsement or mislead, and do not add a charge for statistical inclusion in a commercial product. Translations require an unofficial-translation notice. No warranty or investment recommendation is supplied. This is a dataset-specific permitted-use path, not an assertion that all underlying private-provider products are freely licensed.
- **BWO numeric statistical results:** the [official federal notice published on BWO](https://www.bwo.admin.ch/de/newnsb/f1zWSNpVPekdwKPMGT9dd), 5 June 2026, states that published federal statistical data may be freely reused and redistributed with attribution from **15 July 2026**, including commercial use without prior authorisation. This audit applies that notice to the published numeric mortgage-rate statistical results, not to website design, images, prose or other third-party content. The [general federal copyright notice](https://www.admin.ch/de/rechtliches) is not itself a licence; public access or a research purpose is not the permission relied upon. Retain only the numeric table, dates, headings and necessary rounding note, with attribution. Do not describe the derived annual mean as an official legal rate. Re-review this basis if source terms or product scope change.

Source software's MIT licence does not replace any data terms. No source endorsement is implied. Keep annual transformations and limits visible in the catalogue, charts, information cards, methodology and downloads.

## Reproduction and retained evidence

`snb-housing-annual`, `bis-housing-credit-annual` and `bwo-housing-annual` are registered importers. They pin the selected product/country/unit/frequency/price basis, source URL, audited vintage/coverage, headers and flags, reject duplicates, invalid numeric values, missing years/months/quarters and incompatible stock/flow identities, and reproduce all 215 annual observations offline.

SNB and BIS inputs are original CSV bytes. BWO has no standalone table CSV: `scripts/prepare-housing.ts` reads the publicly served Nuxt table without executing it, extracts the numerical table and preserves the rounding footnote. It outputs a numeric table JSON with the fetched page's SHA-256 plus a checked CSV. `data/extractions/originals/bwo-mortgage-table-2026.json` is the retained numeric-table evidence, not an original publisher JSON endpoint or the whole protected web page. Tests pin its hash, reproduce the raw checked CSV byte-for-byte, and independently recompute every annual mean using interval intersections and survey dates.

```sh
node --import tsx scripts/prepare-housing.ts downloaded-bwo-history.html checked-table.json checked-table.csv
npm run data:import -- --importer bwo-housing-annual --file checked-table.csv --series rental-reference-rate-annual --source bwo-mortgage-reference --retrieved-on 2026-10-21
npm run data:import -- --importer bwo-housing-annual --file checked-table.csv --series mortgage-outstanding-rate-annual --source bwo-mortgage-reference --retrieved-on 2026-10-21
```

Retained SNB evidence includes `snb-mortgage-offer-dimensions-2026.json`, `snb-mortgage-stock-dimensions-2026.json` and `snb-mortgage-stock-unit-2026.json`. Their hashes are fixed in tests. CSV source lineage/hashes remain in the registry and public manifest; the checked table records the original BWO page hash. New vintages require explicit review of coverage, status flags, methodology and terms, not silent scraping or source substitution. Production builds make no requests to economic-data services.
