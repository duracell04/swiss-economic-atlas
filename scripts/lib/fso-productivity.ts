import {parse} from 'csv-parse/sync';
import type {Importer} from './importer.ts';
import type {Observation,Series,Snapshot} from './schema.ts';

export const WPS_SOURCE='fso-wps-productivity';
export const WPS_URL='https://dam-api.bfs.admin.ch/hub/api/dam/assets/36731796/master';
export const HOURS_SOURCE='fso-wps-hours-levels';
export const HOURS_URL='https://dam-api.bfs.admin.ch/hub/api/dam/assets/36731757/master';
export const HOURS_KEY='T 04.07.04.01 / A5:A39 / C5:C39 / actual hours (millions)';
// This immutable companion supplies the hours revision flags as well as its compatible index.
export const WPS_SNAPSHOT='fso-wps-productivity-2026-10-21-0e549062511d456f';
export const WPS_PUBLICATION='2026-08-28';
const revisedYears=new Set(['2023','2024','2025']);
function numeric(value:string):number{
  if(!/^\d+(?:\.\d+)?$/.test(value)||!Number.isFinite(Number(value))||Number(value)<=0)throw new Error('Invalid WPS numeric value');
  return Number(value);
}
function checkedYear(period:string,seen:Set<string>){
  if(!/^\d{4}$/.test(period)||period<'1991'||period>'2025')throw new Error('Unaudited WPS year');
  if(seen.has(period))throw new Error('Duplicate WPS period');seen.add(period);
}
function identity(series:Series,snapshot:Snapshot,hours:boolean){
  const source=hours?HOURS_SOURCE:WPS_SOURCE;
  if(series.id!==(hours?'total-hours-worked':'hourly-labour-productivity')||series.frequency!=='annual'||series.measurement!=='level'||
     series.unit.code!==(hours?'count':'index')||series.unit.dimension!==(hours?'hours':'hourly productivity index 1991=100')||
     series.unit.scale!==(hours?1_000_000:1)||series.price_basis!==(hours?'not_applicable':'real')||
     series.aggregation_kind!==(hours?'sum':'native')||series.source_identifier!==(hours?HOURS_KEY:'ts-x-04.07.01.01 / Productivity / Index')||
     !series.source_ids.includes(source)||!series.source_ids.includes(WPS_SOURCE)||snapshot.source_id!==source||snapshot.source_url!==(hours?HOURS_URL:WPS_URL))throw new Error('Incompatible WPS series identity or source');
}
function row(series:Series,snapshot:Snapshot,period:string,value:number,revised:boolean,hours=false):Observation{
  return {series_id:series.id,reference_period:period,value,source_snapshot_ids:hours?[snapshot.id,WPS_SNAPSHOT]:[snapshot.id],publication_date:WPS_PUBLICATION,value_kind:'observed',revision_status:revised?'revised':'final'};
}
function complete(rows:Observation[]){
  rows.sort((a,b)=>a.reference_period.localeCompare(b.reference_period));
  if(rows.length!==35||rows[0].reference_period!=='1991'||rows.at(-1)!.reference_period!=='2025')throw new Error('Incomplete audited WPS coverage');
  return rows;
}

export const fsoProductivityImporter:Importer={
  name:'fso-productivity',
  parse(contents,{series,snapshot}){
    identity(series,snapshot,false);
    const data=parse(contents,{bom:true,columns:true,skip_empty_lines:true}) as Record<string,string>[];
    if(!data.length||Object.keys(data[0]).join(',')!=='PERIOD,INDICATOR,UNIT_MEA,VALUE,OBS_STATUS')throw new Error('Unexpected WPS CSV header');
    const grouped=new Map<string,Map<string,{value:number;status:string}>>();
    for(const item of data){
      if(!['GDP','Actual hours worked','Productivity'].includes(item.INDICATOR)||item.UNIT_MEA!=='Index')throw new Error('Unexpected WPS indicator or unit');
      if(!['A','R'].includes(item.OBS_STATUS))throw new Error('Unaudited WPS observation status');
      if(!/^\d{4}$/.test(item.PERIOD)||item.PERIOD<'1991'||item.PERIOD>'2025')throw new Error('Unaudited WPS year');
      const year=grouped.get(item.PERIOD)??new Map<string,{value:number;status:string}>();
      if(year.has(item.INDICATOR))throw new Error('Duplicate WPS observation');
      year.set(item.INDICATOR,{value:numeric(item.VALUE),status:item.OBS_STATUS});grouped.set(item.PERIOD,year);
    }
    const result:Observation[]=[];
    for(const [period,year] of grouped){
      if(year.size!==3)throw new Error('Incomplete WPS numerator/denominator triplet');
      const gdp=year.get('GDP')!,hours=year.get('Actual hours worked')!,productivity=year.get('Productivity')!;
      if(new Set([...year.values()].map(x=>x.status)).size!==1||productivity.status!==(revisedYears.has(period)?'R':'A'))throw new Error('Unexpected WPS revision vintage');
      if(Math.abs(productivity.value-gdp.value/hours.value*100)>1e-10)throw new Error('WPS productivity does not reconcile to its compatible GDP/hours indices');
      if(period==='1991'&&[gdp,hours,productivity].some(x=>x.value!==100))throw new Error('Unexpected WPS index base');
      result.push(row(series,snapshot,period,productivity.value,productivity.status==='R'));
    }
    return complete(result);
  },
};

/** Checked, reproducible column C extraction; the original workbook is checksum-pinned. */
export const fsoHoursImporter:Importer={
  name:'fso-productivity-hours',
  parse(contents,{series,snapshot}){
    identity(series,snapshot,true);
    const data=parse(contents,{bom:true,columns:true,skip_empty_lines:true}) as Record<string,string>[];
    if(!data.length||Object.keys(data[0]).join(',')!=='reference_period,source_identifier,value')throw new Error('Unexpected WPS hours extract header');
    const seen=new Set<string>();
    return complete(data.map(item=>{
      if(item.source_identifier!==HOURS_KEY)throw new Error('Unexpected WPS hours column selection');
      checkedYear(item.reference_period,seen);
      const value=numeric(item.value);
      if(value<1_000||value>20_000)throw new Error('Unaudited WPS hours scale');
      return row(series,snapshot,item.reference_period,value,revisedYears.has(item.reference_period),true);
    }));
  },
};
