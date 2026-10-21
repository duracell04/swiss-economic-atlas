export type UnemploymentMethod = {
  family: 'registered' | 'ilo';
  source: string;
  method: string;
  definition: string;
  reference: { title: string; url: string };
};

const registered: UnemploymentMethod = {
  family: 'registered',
  source: 'SECO, via the SNB data portal',
  method: 'RAV administrative register',
  definition: 'Registered unemployment (registrierte Arbeitslosigkeit): people registered at a regional employment centre (RAV), without a job and immediately available, whether or not they receive unemployment benefits. People who remain registered after exhausting their benefits can still be counted.',
  reference: {
    title: 'BFS definitions of registered and ILO unemployment',
    url: 'https://www.bfs.admin.ch/bfsstatic/dam/assets/13695294/master',
  },
};
const ilo: UnemploymentMethod = {
  family: 'ilo',
  source: 'FSO (BFS), Swiss Labour Force Survey (SLFS / SAKE)',
  method: 'Household survey using the ILO definition',
  definition: 'ILO unemployment (Erwerbslosigkeit gemäss ILO): people aged 15–74 who were not employed in the reference week, actively looked for work in the previous four weeks and were available to start. RAV registration and benefit receipt are not required.',
  reference: {
    title: 'BFS definition of ILO unemployment',
    url: 'https://www.swissstats.bfs.admin.ch/data/webviewer/appId/ch.admin.bfs.swissstat/article/issue181516691600-07/package',
  },
};

export function unemploymentMethod(id: string): UnemploymentMethod | undefined {
  if (id === 'registered-unemployment' || id === 'registered-unemployment-annual') return registered;
  if (id === 'ilo-unemployment' || id === 'ilo-unemployment-annual') return ilo;
  return undefined;
}

export const unemploymentComparison = 'SECO registered unemployment and ILO unemployment from FSO (BFS) measure different populations using different methods. Compare their trends as separate indicators. Their gap is not a count of unregistered jobseekers and does not by itself explain why the rates differ.';
