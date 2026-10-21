# Annual registered unemployment — source audit

Reviewed 12 October 2026. **Verified derived companion.**

The monthly input is the verified [SNB Labour market cube](https://data.snb.ch/en/topics/uvo/cube/amarbma?dimSel=D0(T1)), whose `D0(T1)` selection is the total, non-seasonally-adjusted jobless rate sourced from SECO. The source snapshot and monthly extraction are documented in [registered unemployment](registered-unemployment.md).

The annual observation is derived by `derive-registered-unemployment-annual` in `data/registry/transformations.json`: arithmetic mean of the twelve full-precision monthly rates for each complete calendar year. This reproduces the usual annual-average concept while leaving the exact monthly source values auditable. A year is omitted unless all twelve monthly observations are present and non-null.

The resulting coverage is 1984–2025. 2026 has only January–August in the retained source vintage and is intentionally omitted; it is not a partial-year annual estimate or forecast. Derived observations inherit the source snapshot lineage and source publication date.

Registered and ILO unemployment use different definitions. The annual series must not be compared as though it were the ILO survey rate. The SNB non-commercial attribution terms recorded for the monthly input also govern this derived educational output.

Schema 2.0.0 and the existing series ID are preserved. The annual CSV is regenerated deterministically from the monthly canonical CSV.
