import type { Observation, Series, Transformation } from './schema.ts';

export function assertCompatible(target: Series, inputs: Series[], spec: Transformation): void {
  if (!spec) throw new Error(`${target.id}: missing calculation definition`);
  if (spec.output_series_id !== target.id) throw new Error('Calculation output does not match target');
  if (inputs.length !== spec.inputs.length || inputs.some((s, i) => s.id !== spec.inputs[i])) throw new Error(`${target.id}: incorrect input series`);
  if (spec.method === 'annual_mean') {
    if (target.frequency !== 'annual' || inputs[0].frequency !== 'monthly') throw new Error('Annual means require one monthly input and one annual output');
    if (target.aggregation_kind !== 'annual_average' || target.measurement !== inputs[0].measurement || target.unit.code !== inputs[0].unit.code || target.unit.dimension !== inputs[0].unit.dimension || target.unit.scale !== inputs[0].unit.scale || target.price_basis !== inputs[0].price_basis) {
      throw new Error('Annual means must preserve the monthly input identity and use annual-average aggregation');
    }
  } else if (target.frequency !== 'annual' || inputs.some(s => s.frequency !== 'annual')) throw new Error('Initial transforms require annual inputs; native frequencies are preserved separately');
  const coverageMismatch = spec.method === 'per_capita'
    ? inputs[1].institutional_coverage !== target.institutional_coverage
    : inputs.some(s => s.institutional_coverage !== target.institutional_coverage);
  if (coverageMismatch || inputs.some(s => s.data_class !== target.data_class)) throw new Error(`${target.id}: incompatible coverage or data class`);
  if (inputs.some(s => s.aggregation_kind === 'unknown' || s.price_basis === 'unknown')) throw new Error('Calculation requires known input conventions');
  if (spec.method === 'annual_mean') {
    // Compatibility was checked above; monthly rows are grouped into complete years in derive().
  } else if (spec.method === 'spread') {
    if (inputs.some(s => s.unit.code !== 'percent') || target.unit.code !== 'percentage_points') throw new Error('Spread requires percent inputs and a percentage-point output');
    if (inputs[0].unit.dimension !== inputs[1].unit.dimension || inputs[0].unit.scale !== inputs[1].unit.scale || inputs[0].aggregation_kind !== inputs[1].aggregation_kind || inputs[0].price_basis !== inputs[1].price_basis) throw new Error('Spread requires matching scales, price basis and annual aggregation conventions');
  } else if (spec.method === 'chain_level') {
    if (inputs[0].measurement !== 'level' || inputs[1].measurement !== 'growth' || inputs[1].unit.code !== 'percent') throw new Error('Chained levels require a level and an annual percentage-growth input');
    if (target.measurement !== 'level' || target.unit.code !== inputs[0].unit.code || target.unit.dimension !== inputs[0].unit.dimension || target.unit.scale !== inputs[0].unit.scale || target.price_basis !== 'real') throw new Error('Chained level output must preserve the level unit and use real prices');
    if (inputs[0].price_basis !== 'nominal' || inputs[1].price_basis !== 'real') throw new Error('Chained levels require a nominal anchor and real growth');
  } else if (spec.method === 'per_capita') {
    if (inputs[0].measurement !== 'level' || inputs[1].measurement !== 'level' || inputs[1].unit.code !== 'count') throw new Error('Per-capita derivations require a level and a population count');
    if (target.measurement !== 'level' || target.unit.code !== 'currency' || target.price_basis !== inputs[0].price_basis) throw new Error('Per-capita output must be a currency level with the input price basis');
  } else {
    if (inputs[0].measurement !== 'level') throw new Error('Growth and rebasing require a level measurement');
    if (!['currency', 'count', 'index'].includes(inputs[0].unit.code)) throw new Error('Growth and rebasing require a level series');
    if (target.unit.code !== (spec.method === 'growth' ? 'percent' : 'index')) throw new Error('Incorrect derived output unit');
  }
}

function combine(target: Series, period: string, rows: Observation[], value: number | null): Observation {
  if (rows.some(row => row.value_kind !== rows[0].value_kind || row.revision_status !== rows[0].revision_status)) {
    throw new Error(`${target.id}/${period}: input statuses differ; resolve explicitly before deriving`);
  }
  if (value !== null && !Number.isFinite(value)) throw new Error(`${target.id}/${period}: non-finite result`);
  return {
    series_id: target.id, reference_period: period, value,
    source_snapshot_ids: [...new Set(rows.flatMap(row => row.source_snapshot_ids))].sort(),
    publication_date: rows.every(row => row.publication_date !== null) ? rows.map(row => row.publication_date!).sort().at(-1)! : null,
    value_kind: rows[0].value_kind, revision_status: rows[0].revision_status,
  };
}

function derivedObservation(target: Series, period: string, rows: Observation[], value: number | null): Observation {
  if (value !== null && !Number.isFinite(value)) throw new Error(`${target.id}/${period}: non-finite result`);
  const publicationDates = rows.map(row => row.publication_date).filter((date): date is string => date !== null).sort();
  const valueKind = rows.some(row => row.value_kind === 'forecast') ? 'forecast' : rows.some(row => row.value_kind === 'reconstructed') ? 'reconstructed' : 'observed';
  const revisionStatus = rows.some(row => row.revision_status === 'revised') ? 'revised' : rows.some(row => row.revision_status === 'provisional') ? 'provisional' : 'final';
  return {
    series_id: target.id, reference_period: period, value,
    source_snapshot_ids: [...new Set(rows.flatMap(row => row.source_snapshot_ids))].sort(),
    publication_date: publicationDates.at(-1) ?? null,
    value_kind: valueKind, revision_status: revisionStatus,
  };
}

export function derive(target: Series, inputs: Series[], observations: Observation[], spec: Transformation): Observation[] {
  assertCompatible(target, inputs, spec);
  const first = observations.filter(o => o.series_id === inputs[0].id).sort((a, b) => a.reference_period.localeCompare(b.reference_period));
  const second = new Map(observations.filter(o => o.series_id === inputs[1]?.id).map(o => [o.reference_period, o]));
  const lookup = new Map(first.map(o => [o.reference_period, o]));
  if (spec.method === 'growth') {
    return first.flatMap(row => {
      const previous = lookup.get(String(Number(row.reference_period) - 1));
      if (!previous) return [];
      if (previous.value !== null && previous.value <= 0) throw new Error('Growth requires a positive denominator');
      return [combine(target, row.reference_period, [previous, row], row.value === null || previous.value === null ? null : 100 * (row.value / previous.value - 1))];
    });
  }
  if (spec.method === 'rebase') {
    const base = lookup.get(spec.base_period);
    if (!base || base.value === null || base.value <= 0) throw new Error('Rebasing requires a present, positive base value');
    return first.map(row => combine(target, row.reference_period, [base, row], row.value === null ? null : 100 * row.value / base.value!));
  }
  if (spec.method === 'chain_level') {
    const level = new Map(first.map(row => [row.reference_period, row]));
    const growth = new Map(second);
    const anchor = level.get(spec.anchor_period);
    if (!anchor || anchor.value === null) throw new Error(`${target.id}: chained level anchor is missing`);
    const periods = [...level.keys()].sort((a, b) => Number(a) - Number(b));
    const values = new Map<string, number>([[spec.anchor_period, anchor.value]]);
    const anchorYear = Number(spec.anchor_period);
    for (const period of periods.filter(period => Number(period) > anchorYear)) {
      const previous = values.get(String(Number(period) - 1));
      const rate = growth.get(period);
      if (previous === undefined || !rate || rate.value === null || rate.value <= -100) throw new Error(`${target.id}/${period}: missing chained growth input`);
      values.set(period, previous * (1 + rate.value / 100));
    }
    for (const period of periods.filter(period => Number(period) < anchorYear).sort((a, b) => Number(b) - Number(a))) {
      const next = values.get(String(Number(period) + 1));
      const rate = growth.get(String(Number(period) + 1));
      if (next === undefined || !rate || rate.value === null || rate.value <= -100) throw new Error(`${target.id}/${period}: missing chained growth input`);
      values.set(period, next / (1 + rate.value / 100));
    }
    return periods.map(period => {
      const levelRow = level.get(period)!;
      const growthRow = growth.get(period) ?? growth.get(String(Number(period) + 1));
      const rows = growthRow ? [levelRow, growthRow] : [levelRow];
      return derivedObservation(target, period, rows, values.get(period)!);
    });
  }
  if (spec.method === 'per_capita') {
    return first.flatMap(levelRow => {
      const populationRow = second.get(levelRow.reference_period);
      if (!populationRow) return [];
      const value = levelRow.value === null || populationRow.value === null ? null :
        levelRow.value * inputs[0].unit.scale / (populationRow.value * inputs[1].unit.scale) / target.unit.scale;
      return [derivedObservation(target, levelRow.reference_period, [levelRow, populationRow], value)];
    });
  }
  if (spec.method === 'annual_mean') {
    const byYear = new Map<string, Observation[]>();
    for (const row of first) {
      const year = row.reference_period.slice(0, 4);
      const rows = byYear.get(year) ?? [];
      rows.push(row);
      byYear.set(year, rows);
    }
    return [...byYear.entries()].sort(([a], [b]) => a.localeCompare(b)).flatMap(([year, rows]) => {
      const periods = new Set(rows.map(row => row.reference_period));
      if (rows.length !== 12 || periods.size !== 12 || !Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`).every(period => periods.has(period)) || rows.some(row => row.value === null)) return [];
      if (rows.some(row => row.value_kind !== rows[0].value_kind || row.revision_status !== rows[0].revision_status)) throw new Error(`${target.id}/${year}: input statuses differ; resolve explicitly before deriving`);
      const value = Number((rows.reduce((sum, row) => sum + row.value!, 0) / rows.length).toPrecision(15));
      return [derivedObservation(target, year, rows, value)];
    });
  }
  return first.flatMap(row => {
    if (spec.exclude_periods?.includes(row.reference_period)) return [];
    const other = second.get(row.reference_period);
    return other ? [combine(target, row.reference_period, [row, other], row.value === null || other.value === null ? null : row.value - other.value)] : [];
  });
}
