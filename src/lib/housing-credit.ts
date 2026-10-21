/** Keep rate concepts, stock timing and historical scope differences visible on charts. */
export function housingCreditNote(id:string):string|undefined{
  const notes:Record<string,string>={
    'mortgage-offer-rate-annual':'Five-year fixed mortgage offers: annual mean of 12 month-end SNB unweighted bank averages, 2008–2025. Published offers, not negotiated contract rates or the cost of outstanding mortgages.',
    'mortgage-outstanding-rate-annual':'Existing domestic CHF mortgages: mean of four BWO volume-weighted survey-date rates, 2009–2025. Older fixed contracts remain included. December is assigned to its survey year even when published the next March.',
    'rental-reference-rate-annual':'BWO rental reference rate: calendar-day-weighted annual mean, 2009–2025. This statistical average is not a legally applicable reference rate or a rent index. Historical effective dates and the December 2011 rounding-rule change are preserved.',
    'real-residential-property-prices':'Real house prices: BIS quarterly index, CPI-deflated, 2010 = 100; four-quarter annual means, 1970–2025. Historical flats/houses use offer prices before 1985, transaction prices from 1985; FSO all dwellings from 2017. Source changes are not comparable price jumps.',
    'private-credit-gdp':'Private non-financial credit / GDP: BIS Q4 stock divided by the same vintage’s four-quarter nominal GDP, 1960–2025; not an annual average. Households and non-financial firms, gross and unconsolidated. Before 1999-Q4: narrower bank-credit proxy, despite break adjustment.',
    'domestic-mortgage-volume':'Domestic mortgages outstanding: SNB December stocks in nominal CHF million, 1985–2025; not new loans or a sum of monthly balances. Covers non-bank borrowers, not households alone. Pre-1997 totals include extrapolation; reporting changes remain marked.',
  };
  return notes[id];
}
