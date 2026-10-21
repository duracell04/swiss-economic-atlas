# Real GDP — verified source audit

Reviewed 12 October 2026. **Verified as a reproducible FSO-derived level; 1948–2025.**

The [FSO long GDP series](https://www.bfs.admin.ch/asset/en/ts-x-04.02.01.08) is published under FSO OPEN-BY and supplies annual nominal GDP levels plus annual real changes. Because the series uses 2020 as its reference year, the 2020 nominal GDP observation is the chain-linked volume anchor at 2020 prices. The atlas compounds the published `B1GQ/ACPP` real changes backward and forward from that anchor, retaining the FSO reconstruction break at 1995.

This reproduces the independently inspected SECO `real_y` annual level within workbook precision without importing or redistributing the SECO workbook. The calculation is registered as `chain_level`, so the canonical CSV is regenerated from the retained FSO source snapshots. 2026 is absent rather than filled with a partial-year observation or forecast.
