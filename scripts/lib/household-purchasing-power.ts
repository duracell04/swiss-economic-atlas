import {parse} from 'csv-parse/sync';
import type {Importer} from './importer.ts';
import type {Observation,Series,Snapshot} from './schema.ts';

export const WAGES_SOURCE='fso-real-wages-long';
export const WAGES_URL='https://dam-api.bfs.admin.ch/hub/api/dam/assets/36506632/master';
export const WAGES_KEY='ts-x-03.04.03.02.01 / SEX=T / WAGE_TYPE=R / VALUE';
export const INCOME_SOURCE='fso-hbs-real-median-income';
export const INCOME_URL='https://datawrapper.dwcdn.net/4bd288526038674e71356216f4ffb48b/4/dataset.csv';
export const INCOME_KEY='gr-e-20.03.01.02.02 / total population / disposable equivalised income / 2023 prices';

function identity(series:Series,snapshot:Snapshot,income:boolean){
  const source=income?INCOME_SOURCE:WAGES_SOURCE;
  if(series.id!==(income?'real-median-disposable-income':'real-wage-index')||series.frequency!=='annual'||
    series.measurement!=='level'||series.price_basis!=='real'||series.aggregation_kind!=='native'||
    series.unit.code!==(income?'currency':'index')||series.unit.scale!==1||
    series.unit.dimension!==(income?'CHF per equivalised person/month, 2023 prices':'real wage index 1939=100')||
    series.source_identifier!==(income?INCOME_KEY:WAGES_KEY)||!series.source_ids.includes(source)||
    snapshot.source_id!==source||snapshot.source_url!==(income?INCOME_URL:WAGES_URL))throw new Error('Incompatible purchasing-power identity or source');
}
function numeric(value:string,comma=false):number{
  if(!(comma?/^-?\d+(?:,\d+)?$/:/^-?\d+(?:\.\d+)?$/).test(value))throw new Error('Invalid purchasing-power numeric value');
  const number=Number(comma?value.replace(',','.'):value);
  if(!Number.isFinite(number))throw new Error('Invalid purchasing-power numeric value');
  return number;
}
function complete(rows:Observation[],first:number,last:number){
  rows.sort((a,b)=>a.reference_period.localeCompare(b.reference_period));
  if(rows.length!==last-first+1||rows.some((r,i)=>Number(r.reference_period)!==first+i))throw new Error('Incomplete purchasing-power coverage');
  return rows;
}
function row(series:Series,snapshot:Snapshot,year:string,value:number,publication:string,estimated=false):Observation{
  return {series_id:series.id,reference_period:year,value,source_snapshot_ids:[snapshot.id],publication_date:publication,
    value_kind:estimated?'reconstructed':'observed',revision_status:'final'};
}

/** The publisher wraps each CSV record in a second, single-field CSV layer. */
export const fsoRealWagesImporter:Importer={
  name:'fso-real-wages',
  parse(contents,{series,snapshot}){
    identity(series,snapshot,false);
    const wrapped=parse(contents,{bom:true,skip_empty_lines:true}) as string[][];
    if(!wrapped.length||wrapped.some(r=>r.length!==1))throw new Error('Unexpected FSO wage CSV wrapper');
    const data=parse(wrapped.map(r=>r[0]).join('\n'),{columns:true,skip_empty_lines:true}) as Record<string,string>[];
    if(!data.length||Object.keys(data[0]).join(',')!=='YEAR,SEX,WAGE_TYPE,VALUE,VALUE_P,CPI,OBS_STATUS_VALUE')throw new Error('Unexpected FSO wage header');
    const seen=new Set<string>(),years=new Map<string,number>(),result:Observation[]=[];
    for(const item of data){
      if(!/^\d{4}$/.test(item.YEAR)||item.YEAR<'1942'||item.YEAR>'2025')throw new Error('Unaudited wage year');
      if(!['T','M','W'].includes(item.SEX)||!['N','R'].includes(item.WAGE_TYPE))throw new Error('Unexpected wage selection');
      const key=`${item.YEAR}/${item.SEX}/${item.WAGE_TYPE}`;
      if(seen.has(key))throw new Error('Duplicate wage observation');seen.add(key);
      years.set(item.YEAR,(years.get(item.YEAR)??0)+1);
      if(item.OBS_STATUS_VALUE!==(item.YEAR==='1942'?'E':'A'))throw new Error('Unaudited wage observation flag');
      const value=numeric(item.VALUE);numeric(item.VALUE_P);numeric(item.CPI);
      if(value<=0)throw new Error('Invalid wage index');
      if(item.SEX==='T'&&item.WAGE_TYPE==='R')result.push(row(series,snapshot,item.YEAR,value,'2026-04-21',item.OBS_STATUS_VALUE==='E'));
    }
    if([...years.values()].some(n=>n!==6))throw new Error('Incomplete wage selections');
    return complete(result,1942,2025);
  },
};

/** FSO-published CPI-deflated medians, not nominal workbook medians or primary income. */
export const fsoRealMedianIncomeImporter:Importer={
  name:'fso-real-median-income',
  parse(contents,{series,snapshot}){
    identity(series,snapshot,true);
    const data=parse(contents,{bom:true,columns:true,delimiter:'\t',skip_empty_lines:true}) as Record<string,string>[];
    const columns=['Jahr','primary equivalised income','VI-','VI+','disposable equivalised income','VI-1','VI+1'];
    if(!data.length||Object.keys(data[0]).join('|')!==columns.join('|'))throw new Error('Unexpected FSO income header');
    const seen=new Set<string>(),separators=new Set<string>(),result:Observation[]=[];
    for(const item of data){
      // These publisher drawing rows are deliberately not years, missing observations or zeros.
      if(item.Jahr===''||item.Jahr==='2014,5'){
        if(columns.slice(1).some(k=>item[k]!==''))throw new Error('Nonempty income chart separator');
        if(separators.has(item.Jahr))throw new Error('Duplicate income chart separator');separators.add(item.Jahr);continue;
      }
      if(!/^\d{4}$/.test(item.Jahr)||item.Jahr<'2000'||item.Jahr>'2023')throw new Error('Unaudited income year');
      if(seen.has(item.Jahr))throw new Error('Duplicate income year');seen.add(item.Jahr);
      const values=columns.slice(1).map(k=>numeric(item[k],true));
      if(values.some(v=>v<=0))throw new Error('Invalid income or confidence bound');
      if(!(values[1]<=values[0]&&values[0]<=values[2]&&values[4]<=values[3]&&values[3]<=values[5]))throw new Error('Income confidence interval does not contain its median');
      result.push(row(series,snapshot,item.Jahr,values[3],'2026-01-22'));
    }
    if(separators.size!==2)throw new Error('Missing audited income chart separators');
    return complete(result,2000,2023);
  },
};
