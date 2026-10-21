export function purchasingPowerNote(id:string):string|undefined{
  if(id==='real-wage-index')return 'FSO real gross wage index (1939 = 100), 1942–2025. Measures wage purchasing power with a fixed employee structure, not median pay or take-home income. The survey and CPI timing change in 1994; 1942 is a source estimate.';
  if(id==='real-median-disposable-income')return 'FSO household-income median, adjusted for household size and inflation: CHF per month at 2023 prices, observed annually in 2000–2023. After taxes, social contributions and basic health-insurance premiums; excludes imputed rent. The 2015 weighting change breaks comparability. Point estimates; 95% intervals are retained in the source download.';
  return undefined;
}
