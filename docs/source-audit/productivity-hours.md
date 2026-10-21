# Real hourly labour productivity and total actual hours worked

Verified 21 October 2026. Both series use the **28 August 2026 FSO Growth and productivity statistics (WPS) vintage**, cover **1991–2025** and contain 35 annual observations. No pre-1991 history, monthly approximation or full-year 2026 value is manufactured.

| Atlas series | Exact source | Selection and unit |
| --- | --- | --- |
| `hourly-labour-productivity` | [FSO ts-x-04.07.01.01](https://www.bfs.admin.ch/asset/en/ts-x-04.07.01.01), [CSV asset 36731796](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36731796/master) | `INDICATOR=Productivity`, `UNIT_MEA=Index`; published real output per actual hour, 1991=100 |
| `total-hours-worked` | [FSO T 04.07.04.01](https://www.bfs.admin.ch/asset/en/je-e-04.07.04.01), [workbook asset 36731757](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36731757/master) | Sheet `T 04.07.04.01`, years `A5:A39`, total actual hours `C5:C39`, **millions of hours** |

## Definitions and compatibility

Hourly productivity is economy-wide real output per **actual hour worked**, not output per employed person, wages, individual performance or nominal CHF per hour. The FSO publishes a volume index based on previous-year-price GDP evolution. A productivity index of 149.397 in 2025 means approximately 49.4% more real output per hour than in the 1991 reference year; it does not mean CHF 149.397 per hour.

The denominator is total actual hours in domestic production. It is not average hours per job or person, normal or contractual hours, or a resident-only employment measure. Physical hours have no nominal/real price basis. Although the hours workbook is titled *productivity at current prices*, **only its physical total-hours column C is imported**. Its nominal-productivity column D and nominal GDP are not substituted for real hourly productivity.

The companion CSV contains GDP, actual-hours and productivity indices with the same 1991=100 base. For every year we verify:

`productivity_index = 100 × GDP_volume_index / actual_hours_index`

`actual_hours_index = 100 × total_actual_hours / total_actual_hours_1991`

The first identity uses only the same-vintage source indices. We do not recompute productivity from the atlas's independently reconstructed real GDP series or mix GDP vintages. All source numeric precision is retained; reconciliation tolerance is `1e-10` index points.

Representative retained values:

| Year | Productivity index | Total hours, millions |
| --- | ---: | ---: |
| 1991 | 100 | 6746.5378194407094 |
| 2010 | 127.415535865017 | 7221.3306854526854 |
| 2020 | 138.687903901496 | 7608.2067407738396 |
| 2025 | 149.397162056923 | 8088.3170130706385 |

These are the WPS-vintage hours. They should not be replaced by a separately dated headline Work Volume Statistics release simply because both are described as total hours.

## Historical adjustment and revision status

The [CSV definition appendix](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36731796/appendix) and the hours workbook explain that the 2021 Work Volume Statistics revision affected reference years from 2010 onward. WPS adjusted pre-2010 hours to maintain continuity in the productivity history. Consequently, pre-2010 WPS hours differ from the unadjusted WV series. We preserve the FSO-published adjustment; we neither splice the two histories nor introduce a false statistical break/gap at 2010. The adjustment is visible beside the charts and in series definitions.

The appendix defines `A` as standard value and `R` as **revised**. The retained CSV marks all three indicators for 2023, 2024 and 2025 `R`; preceding observations are `A`. The atlas preserves these as revised/final respectively, not as forecasts or automatically provisional recent years. A completed year without a provisional flag is not a promise that future revisions are impossible.

The workbook does not provide a separate per-row status column. Its hours totals reconcile with the CSV's hours index for every year, and its update date matches. The total-hours import therefore retains **both immutable snapshots** and applies the companion's actual-hours revision flags. The pinned pairing is reviewed with each new vintage.

## Reuse evidence

The exact FSO [productivity asset metadata](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36731796) and [hours asset metadata](https://dam-api.bfs.admin.ch/hub/api/dam/assets/36731757) both identify `OPEN-BY`, “Open use — must provide the source”. The [Swiss open-data terms](https://opendata.swiss/en/terms-of-use) explain that this category permits commercial and non-commercial reuse with source attribution. This is dataset-specific evidence, not an assumption that public access implies redistribution rights. Preserve source definitions, units and attribution; software's MIT licence does not replace these data terms.

Attribution: **Federal Statistical Office, Growth and productivity statistics (WPS), ts-x-04.07.01.01 and T 04.07.04.01, publication 28 August 2026, retrieved 21 October 2026.**

## Immutable evidence and reproduction

Registry snapshots pin the original CSV and checked hours extraction. Supporting publisher bytes are retained under `data/extractions/originals/`:

| Evidence | SHA-256 |
| --- | --- |
| Original hours workbook `fso-productivity-hours-2026.xlsx` | `f7b0a5e7f6941432b8a04be4dd2d60775a5ea828deb5c0325035a0cd5eae000d` |
| Productivity definition appendix `fso-productivity-metadata-2026.xlsx` | `dfd77587d0a3f93c2a862c710ef835be25653bd7800eeb071058aeb8b9caaed9` |
| Productivity asset metadata `fso-productivity-asset-2026.json` | `01dfdb896c29f8aa9d4984b6fae188b706779df8356a0ef103a47295175400d6` |
| Hours asset metadata `fso-hours-asset-2026.json` | `1d3d63022b928b31193cf6a590af97c7cad19479c079f0c812ead815e96a6284` |

The original productivity CSV hash is `0e549062511d456f66e4615c8d39d9bbde2cc362978fcfbc0f8bcdd47d6c5d5d`. Its snapshot is shared in the hours lineage. The recipe `data/extractions/total-hours-worked.json` fixes the workbook hash, sheet, cells, source title, units and update date. Run:

```sh
python3 scripts/prepare-extract.py data/extractions/total-hours-worked.json data/extractions/originals/fso-productivity-hours-2026.xlsx /tmp/fso-total-hours.csv
npm run data:import -- --importer fso-productivity --file /absolute/path/original-productivity.csv --series hourly-labour-productivity --source fso-wps-productivity --retrieved-on 2026-10-21
npm run data:import -- --importer fso-productivity-hours --file /tmp/fso-total-hours.csv --series total-hours-worked --source fso-wps-hours-levels --retrieved-on 2026-10-21
```

Use `--replace` only for a reviewed revision. The source-specific importers reject wrong identities, units, periods, duplicate observations, unknown flags, invalid numbers and incomplete coverage. Native productivity import also checks the GDP/hours identity and index base. Tests regenerate the workbook extraction byte-for-byte, reconcile every annual denominator, check flag lineage and rights evidence, and exercise both annual charts on desktop/mobile. Builds use committed inputs, not live source requests.
