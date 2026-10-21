export function labourInputNote(id:string):string|undefined{
  if(!['hourly-labour-productivity','total-hours-worked'].includes(id))return undefined;
  return 'FSO productivity is real output per actual hour (index 1991 = 100). Hours are annual totals in millions, not hours per person or job. These are matched WPS series: pre-2010 hours were harmonised after the 2021 revision. 2023–2025 are source-revised; no partial 2026.';
}
