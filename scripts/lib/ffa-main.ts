import { parse } from 'csv-parse/sync';
import type { Importer } from './importer.ts';
import type { Observation } from './schema.ts';

export const FFA_MAIN_SOURCE_ID = 'ffa-main-aggregates';
export const FFA_MAIN_DATA_URL = 'https://www.data.finance.admin.ch/static/assets/datasets/fs_dashboard/main_extern.csv';

type Selection = { hh: string; model: string; variable: string; sourceIdentifier: string; ratio?: boolean };

const selections: Record<string, Selection> = {
  'general-government-debt': {
    hh: 'staat', model: 'fs', variable: 'bruttoschuld_fs',
    sourceIdentifier: 'main_extern / staat / fs / bruttoschuld_fs / CHF millions',
  },
  'confederation-debt': {
    hh: 'bund', model: 'fs', variable: 'bruttoschuld_fs',
    sourceIdentifier: 'main_extern / bund / fs / bruttoschuld_fs / CHF millions',
  },
  'confederation-debt-ratio': {
    hh: 'bund', model: 'gfs', variable: 'bruttoschuldenquote',
    sourceIdentifier: 'main_extern / bund / gfs / bruttoschuldenquote / fraction converted to percent', ratio: true,
  },
};

export const ffaMainImporter: Importer = {
  name: 'ffa-main',
  parse(contents, { series, snapshot }) {
    const selection = selections[series.id];
    if (!selection || series.frequency !== 'annual' || !series.source_ids.includes(FFA_MAIN_SOURCE_ID) ||
        snapshot.source_id !== FFA_MAIN_SOURCE_ID || snapshot.source_url !== FFA_MAIN_DATA_URL) {
      throw new Error('ffa-main requires one of the audited annual FFA aggregate identities and source');
    }
    const rows = parse(contents, { bom: true, columns: true, skip_empty_lines: true }) as Record<string, string>[];
    if (!rows.length || Object.keys(rows[0]).join(',') !== ',hh,model,variable,jahr,value,source') {
      throw new Error('ffa-main: unexpected source CSV header');
    }
    const selected = rows.filter(row => row.hh === selection.hh && row.model === selection.model && row.variable === selection.variable && /^\d{4}$/.test(row.jahr) && Number(row.jahr) <= 2026);
    if (!selected.length) throw new Error(`ffa-main: no ${selection.sourceIdentifier} observations`);
    const periods = new Set<string>();
    return selected.flatMap((row): Observation[] => {
      if (!/^\d{4}$/.test(row.jahr) || Number(row.jahr) < 1990 || Number(row.jahr) > 2026) throw new Error('ffa-main: period outside the retained 1990–2026 vintage');
      if (periods.has(row.jahr)) throw new Error(`ffa-main: duplicate period ${row.jahr}`);
      periods.add(row.jahr);
      const raw = Number(row.value);
      if (!Number.isFinite(raw)) throw new Error(`ffa-main/${row.jahr}: value must be numeric`);
      if (!['Rechnung', 'Hochrechnung', 'Prognosen'].includes(row.source)) throw new Error(`ffa-main/${row.jahr}: unexpected source status ${row.source}`);
      const value = selection.ratio ? raw * 100 : raw;
      if (!Number.isFinite(value) || value < 0) throw new Error(`ffa-main/${row.jahr}: value must be non-negative`);
      return [{
        series_id: series.id, reference_period: row.jahr, value,
        source_snapshot_ids: [snapshot.id], publication_date: null,
        value_kind: row.source === 'Rechnung' ? 'observed' : 'forecast',
        revision_status: row.source === 'Rechnung' ? 'final' : 'provisional',
      }];
    });
  },
};
