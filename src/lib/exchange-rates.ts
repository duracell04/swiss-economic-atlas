/** Interpretations shared by chart notes, series pages and tests. */
export function exchangeRateNote(id: string): string | undefined {
  if (['chf-eur-annual','chf-usd-annual','chf-dem-annual'].includes(id)) {
    return 'Lower CHF per foreign currency = a stronger franc. Annual mean, not year-end. EUR starts in 1999; historical DEM ends in 1998. ECB, New York and Frankfurt fixing conventions differ; these are separate histories, not a spliced benchmark.';
  }
  if (['chf-neer-annual','chf-reer-annual'].includes(id)) {
    return 'Higher effective index = a stronger franc. SNB annual mean, 2000 = 100; the real index is CPI-based. The partner-country pool changes in 2000. The index is not an estimate of overvaluation or fair value.';
  }
}
