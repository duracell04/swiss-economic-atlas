# Registered unemployment — source audit

Reviewed 12 October 2026. **Verified and imported from the SNB public data portal.**

[SECO labour statistics](https://www.seco.admin.ch/en/labour-market-statistics) identifies [AMSTAT](https://www.amstat.ch/v2/amstat_de.html) as the current register-statistics portal. The [SNB Labour market cube](https://data.snb.ch/en/topics/uvo/cube/amarbma?dimSel=D0(T1)) provides a stable, machine-readable alternative: `D0(T1)` is the total jobless rate with the non-seasonally-adjusted `Total` selection. Its footnote defines the rate as registered unemployed divided by the labour force, and identifies SECO as the source.

The retained source is `data/raw/snb-seco-registered-unemployment-2026-10-12-bbeca1289c6c95da.csv`, SHA-256 `bbeca1289c6c95dab58f8d69b1f4d2a847b2d63150acc31f62cf131882743ba0`, with SNB `PublishingDate` 21 September 2026. It contains empty rows before January 1984 and numeric observations from January 1984 through August 2026. The latest available month is August 2026; September is absent rather than inferred.

The [SNB data-portal usage guidance](https://data.snb.ch/en/topics/texts/doc/introduction) permits saving, transmitting and otherwise using its data for non-commercial purposes compatible with the purpose of the information, with source reference. This educational atlas records that condition; commercial reuse requires a separate review. SECO's definitions remain relevant: the [SECO labour-market explanation](https://www.arbeit.swiss/en/information-centre/labour-market-statistics-switzerland) documents the registration concept, labour-force denominator and historical denominator periods.

Registered and ILO unemployment use different definitions. The existing ILO rate is not substituted for this register-based rate. The atlas keeps the monthly frequency and the unadjusted/seasonally-adjusted identity explicit; only the unadjusted total selection is imported here. 2026 monthly values are provisional in the retained atlas vintage.

The importer checks the exact cube selection, source URL, monthly periods, dimension code and numeric values. It omits source-empty rows and does not fill pre-1984 history.

Schema 2.0.0 and the existing series ID are preserved. The registered snapshot and canonical CSV are the checked extraction, not a claim that the SNB/SECO history is unrevisable.
