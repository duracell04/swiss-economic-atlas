import { parse } from 'csv-parse/sync';
import type { Importer } from './importer.ts';
import type { Observation } from './schema.ts';

export const SNB_SECO_JOBLESS_SOURCE_ID = 'snb-seco-registered-unemployment';
export const SNB_SECO_JOBLESS_DATA_URL = 'https://data.snb.ch/api/cube/amarbma/data/csv/en?dimSel=D0(T1)&fromDate=1948-01&toDate=2026-09';
export const SNB_SECO_JOBLESS_PUBLICATION_DATE = '2026-09-21';

/** Total, non-seasonally-adjusted jobless rate sourced from SECO via SNB cube amarbma. */
export const snbJoblessRateImporter: Importer = {
  name: 'snb-jobless-rate',
  parse(contents, { series, snapshot }) {
    if (series.id !== 'registered-unemployment' || series.frequency !== 'monthly' || series.measurement !== 'rate' ||
        series.unit.code !== 'percent' || series.unit.dimension !== 'percent' || series.unit.scale !== 1 ||
        series.aggregation_kind !== 'native' || !series.source_ids.includes(SNB_SECO_JOBLESS_SOURCE_ID)) {
      throw new Error('snb-jobless-rate requires the monthly registered-unemployment rate identity');
    }
    if (snapshot.source_id !== SNB_SECO_JOBLESS_SOURCE_ID || snapshot.source_url !== SNB_SECO_JOBLESS_DATA_URL) {
      throw new Error('snb-jobless-rate requires the audited SNB amarbma selection and CSV URL');
    }
    const rows = parse(contents, { bom: true, delimiter: ';', skip_empty_lines: true, relax_column_count: true }) as string[][];
    const headerIndex = rows.findIndex(row => row.join(',') === 'Date,D0,Value');
    if (headerIndex < 0) throw new Error('snb-jobless-rate: missing Date,D0,Value header');
    const data = rows.slice(headerIndex + 1);
    const periods = new Set<string>();
    return data.flatMap((row): Observation[] => {
      if (row.length !== 3) throw new Error('snb-jobless-rate: unexpected row width');
      const [period, code, raw] = row;
      if (code !== 'T1') throw new Error(`snb-jobless-rate/${period}: unexpected dimension code`);
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) throw new Error(`snb-jobless-rate/${period}: invalid monthly period`);
      if (periods.has(period)) throw new Error(`snb-jobless-rate/${period}: duplicate period`);
      periods.add(period);
      if (raw === '') return [];
      if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw) || !Number.isFinite(Number(raw)) || Number(raw) < 0 || Number(raw) >= 100) {
        throw new Error(`snb-jobless-rate/${period}: invalid rate`);
      }
      return [{
        series_id: series.id,
        reference_period: period,
        value: Number(raw),
        source_snapshot_ids: [snapshot.id],
        publication_date: SNB_SECO_JOBLESS_PUBLICATION_DATE,
        value_kind: 'observed',
        revision_status: period.startsWith('2026-') ? 'provisional' : 'final',
      }];
    });
  },
};
