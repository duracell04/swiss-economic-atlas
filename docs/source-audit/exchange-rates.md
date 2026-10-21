# Exchange rates: exact source and reuse audit

Verified 21 October 2026. Five annual datasets, 237 observations. Different markets, quotations and index concepts remain separate; none is a simultaneous executable transaction price.

| Atlas series | Original source / selection | Complete annual coverage | Convention |
| --- | --- | --- | --- |
| `chf-eur-annual` | [ECB EXR.A.CHF.EUR.SP00.A](https://data.ecb.europa.eu/data/datasets/EXR/EXR.A.CHF.EUR.SP00.A) | 1999–2025 (27) | Published mean of daily reference rates, CHF per EUR |
| `chf-usd-annual` | [Federal Reserve G.5A](https://www.federalreserve.gov/releases/g5a/current/), H10/H10/RXI_N.A.SZ | 1971–2025 (55) | Published mean of daily New York noon buying rates, CHF per USD |
| `chf-dem-annual` | [Bundesbank BBEX3.D.CHF.DEM.AA.AC.000](https://api.statistiken.bundesbank.de/rest/data/BBEX3/D.CHF.DEM.AA.AC.000?format=csv) | 1950–1998 (49) | Convert each daily DEM-per-100-CHF fixing x to 100/x CHF per DEM, then average |
| `chf-neer-annual` | [SNB devwkieffia N/G/I](https://data.snb.ch/en/topics/ziredev/cube/devwkieffia) | 1973–2025 (53) | Published nominal effective overall index, annual mean, 2000=100 |
| `chf-reer-annual` | SNB devwkieffia K/G/I | 1973–2025 (53) | Published CPI-based real effective overall index, annual mean, 2000=100 |

Exact API requests, access dates and SHA-256 values are in `data/registry/registry.json`; the public manifest carries source terms and snapshot lineage. Original CSV bytes and line endings are preserved. Per-observation release dates are null unless provided by the retained source: retrieval is not publication. The SNB vintage is dated 7 October 2026. Final status here means completed-year observations without a provisional flag; future statistical revisions remain possible.

## Quotation and annual arithmetic

The three bilateral charts quote **CHF per one foreign currency**. Lower values mean franc appreciation. Effective indices run in the opposite direction: higher values mean nominal or real franc appreciation. An index value is not a percentage overvaluation or an equilibrium estimate.

ECB annual data are imported unchanged with their original numerical precision, annual-average collection code, CHF unit, zero unit exponent and observed/non-confidential status. Annual Federal Reserve XML uses `YYYY-12-31` period labels, but these are **annual averages**, not endpoint spot rates. The release defines its New York noon buying-rate survey. ECB and Federal Reserve values are not reconstructed from rounded monthly averages and are not silently substituted for SNB fixings.

Bundesbank's original daily fixing is **DEM per 100 CHF**. Its source notes distinguish Bank deutscher Länder conversion rates through 3 May 1953, agreement rates from 4 May–25 July 1953, and official Frankfurt quotations from 27 July 1953. The 1953 mean spans those conventions and is marked. The file starts on 21 December 1949: that incomplete year is excluded. The final observed fixing is 30 December 1998.

For each complete 1950–1998 calendar year the importer averages `100 / daily_quote`, requiring every month and at least 200 valid fixings. These coverage checks accommodate documented market closures; they do not invent prices for closed days. Missing-value/closure flags stay missing, never zero or forward-filled. Only the final mean is rounded to 15 significant digits. **`mean(100/x)` is not `100/mean(x)`.** The result is an atlas calculation, not the Bundesbank's published annual series. All daily observations, annotations and metadata remain intact in the raw snapshot. No post-1998 DEM or pre-1999 synthetic euro is produced.

## Effective-index definitions and changes

The [SNB notes](https://data.snb.ch/en/topics/ziredev/doc/explanations_ziredev) define the current-method nominal and real indices. Select overall `G`, not euro-area-only `E`; index level `I`, not percentage change `V`; CPI-based real `K`, not PPI-based `P`.

The chained Törnqvist index uses the IMF competition-weighting approach. Goods and services trade includes imports, exports, precious metals and third-market competition. Index country weights use two-year averages of annually computed IMF total weights. The country pool is 15 trading partners for 1973–1999; from 2000 it selects partners exceeding 0.2% of Swiss foreign trade from a 54-country pool. The change is retained in series metadata. We use the SNB's current-method backcast to 1973, not a splice with the discontinued export-weighted 2001-method index. CPI and weight revisions can change history, requiring a new snapshot.

## Rights and source selection

- **ECB:** [copyright conditions](https://www.ecb.europa.eu/services/using-our-site/disclaimer/html/index.en.html) allow free use with accurate reproduction and attribution, with modifications identified. Our euro annual averages are unmodified.
- **Federal Reserve:** [Board disclaimer](https://www.federalreserve.gov/disclaimer.htm) places its information in the public domain unless otherwise indicated and requests citation. H.10/G.5A identifies its own New York Fed survey; no proprietary benchmark copyright notice applies to these selected observations. The Board is the originator, not merely a generic FRED landing page.
- **Bundesbank:** [statistical reuse terms](https://www.bundesbank.de/en/homepage/user-information/terms-of-use-regarding-the-reuse-of-escb-statistics-621188) provide free reuse with source attribution and preservation of statistical identity. Source: Deutsche Bundesbank. Preserve the original unchanged daily file and metadata; identify the converted/averaged output as an independent atlas calculation. The selected `AA` Frankfurt series has no external-source field; the alternative `CA` Swiss-market series cites banks/newspapers and is not used. No source endorsement is implied.
- **SNB:** [copyright conditions](https://www.snb.ch/en/srv/disclaimer_copyright) allow non-commercial use compatible with purpose, with source reference. The effective-index cube identifies SNB as source of its calculated indices. These conditions do not grant a commercial-use licence.

The separate [SNB current bilateral-rate notice](https://www.snb.ch/en/the-snb/mandates-goals/statistics/statistics-pub/current_interest_exchange_rates) restricts its Bloomberg-based quotes and refers licensing to Bloomberg. We do **not** retain or publish those quotes. ECB/Federal Reserve/Bundesbank observations are independently sourced under the terms above; non-commercial research does not automatically override licensing. Software's MIT licence does not cover source observations.

## Reproduction

Registered `ecb-fx-annual`, `bbk-dem-annual` and `snb-effective-annual` importers consume original publisher CSVs and reject changed selections, units, duplicate periods, unexpected status flags, invalid values and incomplete coverage. The two SNB series share one immutable snapshot.

The Federal Reserve's original [release ZIP](https://www.federalreserve.gov/releases/h10/data/FRB_h10_xml.zip) is retained at `data/extractions/originals/fed-h10-2026-10-19.zip`, SHA-256 `8f370f9c57b73e1c0b68a2ee72ddecd3abaffb21fa627fcfd4f8a3612798c6a8`. Recipe `data/extractions/chf-usd-annual.json` pins that hash and selects `RXI_N.A.SZ` in `H10_data.xml`, checking CHF, annual frequency 203, currency-per-USD unit and scale. The existing extraction script produces a checksum-pinned CSV; `audited-extract` imports it. No unrelated release series enters the atlas. All 55 rows are regenerated and compared in tests.

```sh
python3 scripts/prepare-extract.py data/extractions/chf-usd-annual.json data/extractions/originals/fed-h10-2026-10-19.zip /tmp/chf-usd-annual.csv
npm run data:import -- --importer audited-extract --file /tmp/chf-usd-annual.csv --series chf-usd-annual --source fed-chf-usd-annual --retrieved-on 2026-10-21
```

Use `--replace` only for a reviewed revision. Tests reparse all five datasets, independently recompute every DEM annual mean, check representative source values and coverage, verify raw hashes and ZIP extraction, and exercise directions/axes on desktop and mobile. Builds make no source requests. New vintages require reviewed dates, selections, coverage, terms and tests; none of the five datasets includes a full-year 2026 observation.
