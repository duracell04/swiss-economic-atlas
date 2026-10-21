# Real wages and real median disposable household income

Verified 21 October 2026. The atlas publishes two **annual level series**, not monthly observations or forecasts.

| Series | Native source and exact selection | Published coverage and unit |
| --- | --- | --- |
| `real-wage-index` | [FSO ts-x-03.04.03.02.01](https://www.bfs.admin.ch/asset/en/ts-x-03.04.03.02.01), [CSV asset 36506632](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36506632/master); `SEX=T`, `WAGE_TYPE=R`, `VALUE` | 1942–2025, 84 values; real gross wage index, 1939=100 |
| `real-median-disposable-income` | [FSO gr-e-20.03.01.02.02, asset 36355431](https://www.bfs.admin.ch/asset/en/36355431), its [embedded chart version 4](https://datawrapper.dwcdn.net/4bd288526038674e71356216f4ffb48b/4/) and [original dataset](https://datawrapper.dwcdn.net/4bd288526038674e71356216f4ffb48b/4/dataset.csv); `disposable equivalised income`, total population | 2000–2023, 24 annual values; equivalised CHF **per month at 2023 prices** |

## Wage concept, timing and flags

The Swiss Wage Index measures gross contractual wage-price evolution for employees in the secondary and tertiary sectors with an employee-structure weighting framework. It is not a median wage level, household disposable income, productivity measure or a measure of changes in the employment mix. The FSO has already adjusted the real index using the Swiss CPI. See its [wage-index factsheet](https://www.bfs.admin.ch/asset/en/7193).

The [source appendix](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36506632/appendix) documents the 1994 transition from the October wage survey to SSUV accident-report data and from October CPI to annual-average variation. The chart retains a break at 1994. Source precision conventions change in 2021. We preserve published index values, including the integer precision of this long-run index; we do not recompute growth from rounded levels or deflate them again.

The original CSV has a single-field outer CSV wrapper around each actual CSV record. The importer unwraps it explicitly, checks the seven-column header and all six sex/wage-type combinations per year, then selects total/real/index. `OBS_STATUS_VALUE=E` in 1942 means a source estimate, represented by the atlas's reconstructed/source-estimated category, not a forecast. Subsequent `A` values map to observed/final. Unknown flags are rejected. The CSV begins in 1942 although the base is 1939. No 1939 or 1940–1941 observations are fabricated. The 1942 `VALUE_P` is a 1939–1942 average, not an annual growth observation; it is not imported as such.

## Household-income concept and price base

Use the publisher's real median chart, not its [nominal workbook](https://www.bfs.admin.ch/asset/de/36347744). The FSO's [2026 methodology, sections 2.2 and 3.1 and glossary](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36337470/master) distinguishes the CPI-deflated chart from current-price workbook amounts. The native real values are retained without another deflation or PPP conversion. For 2023, the chart's `4331.7226679` matches the workbook's current-price total-population median `4331.7226679364994` within its seven-decimal display precision. Earlier nominal workbook values are **not** substituted. The workbook includes a nominal 1998 estimate, but that does not extend the selected native real chart's 2000–2023 coverage.

This is HBS/HABE total-population income in private households, not SILC or people in working households only. Disposable income includes transfers and subtracts social insurance contributions, taxes, basic health-insurance premiums and regular transfers to other households. It remains before ordinary consumption and rent. Imputed rent is excluded. The modified OECD scale assigns 1.0 to the oldest person, 0.5 to each additional person aged 14+, and 0.3 to each younger child. The median is evaluated at person level using equivalised household resources, not raw household totals or a mean.

Each HBS reference year supplies one estimate of a monthly income amount. We neither shift years as if these were SILC interview years nor multiply by twelve to imply a separately published annual total. The FSO chart asset was published 22 January 2026 and is non-provisional. No 2024–2026 income observations are invented.

## Comparability and uncertainty

The revised HBS weighting model applies from 2015 and cannot be applied to earlier data. The atlas disconnects the line before 2015 and explains that the 2014–2015 difference is not a comparable income change. This is a methodology break, not a missing 2015 value.

The tab-delimited original has decimal commas, both primary/disposable medians, asymmetric 95% bounds, a blank drawing row and a `2014,5` drawing-only row. Only the 24 integer-year disposable medians become canonical observations. Both separators are explicitly checked, never coerced into zero or a year. All confidence bounds are retained in the immutable raw source and [source download](https://datawrapper.dwcdn.net/4bd288526038674e71356216f4ffb48b/4/dataset.csv), and checked to contain their medians. The atlas chart shows point estimates, not confidence bands. Its note directs readers to the intervals; small annual changes alone are not significance tests. Recalculation under the revised weighting model is documented as a break; it does not justify inventing per-observation revised flags absent from the publisher's data.

## Redistribution and immutable evidence

The exact [wage asset metadata](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36506632) and [income chart metadata](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36355431) identify **OPEN-BY**, open reuse with source attribution. The [wage workbook metadata](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36506614) and [income workbook metadata](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36347744) have the same classification. Attribute FSO with dataset, vintage, units and retrieval date. The chart dataset is published by FSO through its embedded Datawrapper chart, not a third-party reconstruction. These rights are dataset-specific, not inferred from public access; the MIT software licence does not replace them.

| Retained original evidence | SHA-256 |
| --- | --- |
| Wage CSV snapshot | `3aec163bb2c4f8bb393f342793ea60173ff074551b2335b854fe1f11c7e88951` |
| Income chart dataset snapshot | `bdfa549b328ac6bd434730f2abac1cfb9357916e81d9cca05f300a12c21f9518` |
| `fso-wages-table-2026.xlsx` | `6a445ad0d196f700fff6e43cce70089125130c30670360855474ef0267c86e30` |
| `fso-wages-definitions-2026.ods` | `45005e783872828795020c9567cc20822864f811c9f916988d00f356f10c00a5` |
| `fso-wages-asset-2026.json` | `553d09c39e18794904e841f29d065608fb0b5cf73e65103900ec38477c7ded74` |
| `fso-wages-table-asset-2026.json` | `352739de1ea46aa6352b7a0ca4a8f99944fc22949bb9c8ccd6cf7f9da59a65ca` |
| `fso-income-chart-2026.html` | `fdbee04318e837d9a22069b01fb627c4141a38f0bfa2f26994d9a1d891afc8f7` |
| `fso-income-asset-2026.json` | `db3f3763723e2d74cdd06f2876a664d813db70d318bbf4e65d2322d4b1f3736f` |
| `fso-income-table-2026.xlsx` | `7e3f147d41242619ad7539a48ddbc833f4e9ed4a48f53f75f7bb54bbc634c7f2` |
| `fso-income-table-asset-2026.json` | `f8a05ee5703302cb49933c73080fbdd98f69093409ab0edae319262ef2b10448` |

Supporting originals are under `data/extractions/originals/`. Registry snapshots retain the exact original data bytes and source URLs. Build and tests are offline and deterministic. Reproduce imports with the retained raw paths:

```sh
npm run data:import -- --importer fso-real-wages --file data/raw/fso-real-wages-long-2026-10-21-3aec163bb2c4f8bb.csv --series real-wage-index --source fso-real-wages-long --retrieved-on 2026-10-21
npm run data:import -- --importer fso-real-median-income --file data/raw/fso-hbs-real-median-income-2026-10-21-bdfa549b328ac6bd.csv --series real-median-disposable-income --source fso-hbs-real-median-income --retrieved-on 2026-10-21
```

Existing observations require a reviewed `--replace`. New vintages require reviewing dates, flags, price base, chart version, break definitions and reuse evidence, not merely relaxing coverage checks. Tests independently cross-check all wage-index observations against the publisher workbook and the income base-year median against its nominal workbook, alongside source checksums, rejected inputs, missing years and desktop/mobile chart behaviour.
