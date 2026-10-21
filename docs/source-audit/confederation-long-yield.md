# Historical long-term Confederation yield — verified source audit

Reviewed 12 October 2026. **Verified; 803 monthly observations imported.**

The [SNB historical-time-series catalogue](https://www.snb.ch/en/the-snb/mandates-goals/statistics/statistics-pub/publication-history/historical-time-series) links the official [historical rates workbook](https://www.snb.ch/dam/jcr%3A7d42dd04-945c-4e40-8e40-1fd20d372e3f/histz_rd.n.xls). Sheet `3.1a_M`, column C, is the monthly end-of-period **Yield by maturity** series. Numeric observations begin in January 1924 and end in December 1990; earlier rows contain only the 3.5% SBB/CFF series and later historical methods are represented in other tables.

The atlas retains the original monthly values at native frequency. It does not splice this coupon-bond measure into the fitted daily ten-year spot-rate series. The SNB table notes methodological changes around 1970, 1977 and 1981–1982; those boundaries are recorded in the registry and values are not smoothed or interpolated across them.

The committed source snapshot is a checked CSV extraction of the selected workbook column because the repository's raw-source convention is CSV. The original workbook URL, table identity, source attribution and extraction identity remain in the registry. The SNB historical publication grants reproduction with source reference; downstream use must preserve those terms.
