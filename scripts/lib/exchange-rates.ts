import { parse } from 'csv-parse/sync';
import type { Importer } from './importer.ts';
import { validPeriod, type Observation, type Series, type Snapshot } from './schema.ts';

export const ECB_FX_URL = 'https://data-api.ecb.europa.eu/service/data/EXR/A.CHF.EUR.SP00.A?startPeriod=1999&endPeriod=2025&format=csvdata';
export const SNB_EFFECTIVE_URL = 'https://data.snb.ch/api/cube/devwkieffia/data/csv/en?dimSel=D0(N,K),D1(G),D2(I)&fromDate=1973&toDate=2025';
export const BBK_DEM_URL = 'https://api.statistiken.bundesbank.de/rest/data/BBEX3/D.CHF.DEM.AA.AC.000?format=csv';
export const DEM_KEY = 'BBEX3.D.CHF.DEM.AA.AC.000 / mean(100/x)';

function identity(series: Series, snapshot: Snapshot, source: string, url: string, key: string, dimension: string, price: Series['price_basis']) {
  if (series.frequency !== 'annual' || series.aggregation_kind !== 'annual_average' || series.measurement !== 'level' ||
      series.unit.dimension !== dimension || series.unit.scale !== 1 || series.unit.code !== (dimension.startsWith('CHF per ') ? 'currency' : 'index') ||
      series.price_basis !== price || series.source_identifier !== key || !series.source_ids.includes(source) || snapshot.source_id !== source || snapshot.source_url !== url) {
    throw new Error('Exchange-rate importer: incompatible series identity or source');
  }
}
function number(raw: string): number {
  if (!/^\d+(?:\.\d+)?$/.test(raw) || !Number.isFinite(Number(raw)) || Number(raw) <= 0) throw new Error('Invalid exchange-rate value');
  return Number(raw);
}
function observation(series: Series, snapshot: Snapshot, period: string, value: number, publication: string | null): Observation {
  return {series_id:series.id,reference_period:period,value,source_snapshot_ids:[snapshot.id],publication_date:publication,value_kind:'observed',revision_status:'final'};
}
function year(period: string, first: number, last: number, seen: Set<string>) {
  if (!validPeriod(period, 'annual') || Number(period) < first || Number(period) > last) throw new Error('Unaudited exchange-rate period');
  if (seen.has(period)) throw new Error('Duplicate exchange-rate period');
  seen.add(period);
}
function complete(rows: Observation[], first: number, last: number) {
  rows.sort((a,b)=>a.reference_period.localeCompare(b.reference_period));
  if (rows.length !== last-first+1 || rows[0]?.reference_period !== String(first) || rows.at(-1)?.reference_period !== String(last)) throw new Error('Incomplete audited exchange-rate coverage');
  return rows;
}

export const ecbFxImporter: Importer = {
  name:'ecb-fx-annual',
  parse(contents,{series,snapshot}) {
    identity(series,snapshot,'ecb-chf-eur-annual',ECB_FX_URL,'EXR.A.CHF.EUR.SP00.A','CHF per EUR','nominal');
    if (series.id !== 'chf-eur-annual') throw new Error('Unexpected euro series');
    const data = parse(contents,{bom:true,columns:true,skip_empty_lines:true}) as Record<string,string>[];
    const seen = new Set<string>();
    const rows = data.map(row=>{
      if (row.KEY !== 'EXR.A.CHF.EUR.SP00.A' || row.FREQ !== 'A' || row.CURRENCY !== 'CHF' || row.CURRENCY_DENOM !== 'EUR' ||
          row.EXR_TYPE !== 'SP00' || row.EXR_SUFFIX !== 'A' || row.COLLECTION !== 'A' || row.UNIT !== 'CHF' || row.UNIT_MULT !== '0' ||
          row.OBS_STATUS !== 'A' || row.OBS_CONF !== 'F' || row.SOURCE_AGENCY !== '4F0') throw new Error('Unexpected ECB selection, unit or observation status');
      year(row.TIME_PERIOD,1999,2025,seen);
      // The vintage does not supply per-observation release dates; retrieval is not publication.
      return observation(series,snapshot,row.TIME_PERIOD,number(row.OBS_VALUE),null);
    });
    return complete(rows,1999,2025);
  },
};

export const snbEffectiveImporter: Importer = {
  name:'snb-effective-annual',
  parse(contents,{series,snapshot}) {
    const nominal = series.id === 'chf-neer-annual';
    if (!nominal && series.id !== 'chf-reer-annual') throw new Error('Unexpected effective-index series');
    const code = nominal ? 'N' : 'K';
    identity(series,snapshot,'snb-effective-annual',SNB_EFFECTIVE_URL,`devwkieffia/${code}/G/I`,'CHF effective index 2000=100',nominal?'nominal':'real');
    const data = parse(contents,{bom:true,delimiter:';',skip_empty_lines:true,relax_column_count:true}) as string[][];
    if (data[0]?.join(',') !== 'CubeId,devwkieffia' || data[1]?.join(',') !== 'PublishingDate,2026-10-07 09:00' || data[2]?.join(',') !== 'Date,D0,D1,D2,Value') throw new Error('Unexpected SNB cube, vintage or header');
    const seen = new Set<string>(), selected = new Set<string>();
    const rows: Observation[] = [];
    for (const row of data.slice(3)) {
      if (row.length !== 5 || !['N','K'].includes(row[1]) || row[2] !== 'G' || row[3] !== 'I') throw new Error('Unexpected SNB effective-index selection');
      year(row[0],1973,2025,row[1] === code ? selected : seen);
      const value = number(row[4]);
      if (row[1] === code) rows.push(observation(series,snapshot,row[0],value,'2026-10-07'));
    }
    if (seen.size !== 53) throw new Error('Incomplete companion SNB index');
    return complete(rows,1973,2025);
  },
};

export const bbkDemImporter: Importer = {
  name:'bbk-dem-annual',
  parse(contents,{series,snapshot}) {
    identity(series,snapshot,'bbk-historical-dem',BBK_DEM_URL,DEM_KEY,'CHF per DEM','nominal');
    if (series.id !== 'chf-dem-annual') throw new Error('Unexpected mark series');
    const data = parse(contents,{bom:true,delimiter:';',skip_empty_lines:true}) as string[][];
    const key = 'BBEX3.D.CHF.DEM.AA.AC.000';
    if (data[0]?.join(';') !== `;${key};${key}_FLAGS` ||
        data[1]?.[1] !== 'Devisenkurse der Frankfurter Börse / 100 CHF = ... DEM / Schweiz' ||
        !data.some(row=>row[0]==='Einheit' && row[1]==='DEM') || !data.some(row=>row[0]==='Format der Zeitangabe' && row[1]==='P1D')) throw new Error('Unexpected Bundesbank quotation or header');
    const start = data.findIndex(row=>/^\d{4}-/.test(row[0]));
    if (start < 0) throw new Error('Missing Bundesbank daily data');
    const seen = new Set<string>(), years = new Map<string,{values:number[];months:Set<string>}>();
    let annotations = false;
    for (const row of data.slice(start)) {
      if (row.length !== 3) throw new Error('Unexpected Bundesbank row width');
      if (row[0] === '' && row[1].startsWith('Bemerkung zu ')) { annotations = true; continue; }
      const [period,raw,flag] = row;
      if (annotations || !validPeriod(period,'daily') || period < '1949-12-21' || period > '1998-12-31') throw new Error('Unaudited Bundesbank daily period');
      if (seen.has(period)) throw new Error('Duplicate Bundesbank daily period');
      seen.add(period);
      if (raw === '.' && ['Kein Wert vorhanden','Kein Wert vorhanden, Bemerkung'].includes(flag)) continue;
      if (flag !== '' || !/^\d+,\d+$/.test(raw)) throw new Error('Unexpected Bundesbank daily value or flag');
      const value = 100/number(raw.replace(',','.'));
      const entry = years.get(period.slice(0,4)) ?? {values:[],months:new Set<string>()};
      entry.values.push(value);entry.months.add(period.slice(5,7));years.set(period.slice(0,4),entry);
    }
    const rows: Observation[] = [];
    for (let y=1950;y<=1998;y++) {
      const entry = years.get(String(y));
      // Holidays and documented exchange closures are missing, never forward-filled.
      if (!entry || entry.months.size !== 12 || entry.values.length < 200) throw new Error(`Incomplete Bundesbank fixing year ${y}`);
      rows.push(observation(series,snapshot,String(y),Number((entry.values.reduce((a,b)=>a+b,0)/entry.values.length).toPrecision(15)),null));
    }
    return complete(rows,1950,1998);
  },
};
