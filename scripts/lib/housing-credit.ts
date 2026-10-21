import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';
import type {Importer} from './importer.ts';
import {validPeriod,type Observation,type Series,type Snapshot} from './schema.ts';

export const HOUSING_INPUTS={
  'mortgage-offer-rate-annual':{source:'snb-mortgage-offers',key:'zikrepro/M/50',url:'https://data.snb.ch/api/cube/zikrepro/data/csv/en?dimSel=D0(M),D1(50)&fromDate=2007-12&toDate=2025-12',first:2008,last:2025,dimension:'interest rate',code:'percent',scale:1,price:'not_applicable',aggregation:'annual_average'},
  'mortgage-outstanding-rate-annual':{source:'bwo-mortgage-reference',key:'BWO mortgage history / survey-date average',url:'https://www.bwo.admin.ch/de/entwicklung-referenzzinssatz-und-durchschnittszinssatz',first:2009,last:2025,dimension:'interest rate',code:'percent',scale:1,price:'not_applicable',aggregation:'annual_average'},
  'rental-reference-rate-annual':{source:'bwo-mortgage-reference',key:'BWO mortgage history / effective-date reference',url:'https://www.bwo.admin.ch/de/entwicklung-referenzzinssatz-und-durchschnittszinssatz',first:2009,last:2025,dimension:'interest rate',code:'percent',scale:1,price:'not_applicable',aggregation:'annual_average'},
  'real-residential-property-prices':{source:'bis-swiss-real-property',key:'WS_SPP/Q.CH.R.628',url:'https://stats.bis.org/api/v1/data/WS_SPP/Q.CH.R.628?format=csv',first:1970,last:2025,dimension:'real residential property price index 2010=100',code:'index',scale:1,price:'real',aggregation:'annual_average'},
  'private-credit-gdp':{source:'bis-swiss-private-credit',key:'WS_TC/Q.CH.P.A.M.770.A',url:'https://stats.bis.org/api/v1/data/WS_TC/Q.CH.P.A.M.770.A?format=csv',first:1960,last:2025,dimension:'share of GDP',code:'percent',scale:1,price:'not_applicable',aggregation:'end_of_period'},
  'domestic-mortgage-volume':{source:'snb-domestic-mortgages',key:'bakredinausbm/AV1/I/H/F',url:'https://data.snb.ch/api/cube/bakredinausbm/data/csv/en?dimSel=D0(AV1),D1(I),D2(H),D3(F)&fromDate=1985-06&toDate=2025-12',first:1985,last:2025,dimension:'CHF',code:'currency',scale:1000000,price:'nominal',aggregation:'end_of_period'},
} as const;
type HousingId=keyof typeof HOUSING_INPUTS;
function identity(series:Series,snapshot:Snapshot){
  const input=HOUSING_INPUTS[series.id as HousingId];
  if(!input||series.frequency!=='annual'||series.aggregation_kind!==input.aggregation||series.price_basis!==input.price||
    series.unit.dimension!==input.dimension||series.unit.code!==input.code||series.unit.scale!==input.scale||
    series.measurement!==(input.code==='percent'?'rate':'level')||series.source_identifier!==input.key||
    !series.source_ids.includes(input.source)||snapshot.source_id!==input.source||snapshot.source_url!==input.url)throw new Error('Incompatible housing/credit identity or source');
  return input;
}
function numeric(value:string){
  if(!/^\d+(?:\.\d+)?$/.test(value)||!Number.isFinite(Number(value)))throw new Error('Invalid housing/credit numeric value');
  return Number(value);
}
function unique(period:string,frequency:'monthly'|'quarterly',seen:Set<string>){
  if(!validPeriod(period,frequency))throw new Error('Invalid housing/credit period');
  if(seen.has(period))throw new Error('Duplicate housing/credit period');seen.add(period);
}
function obs(series:Series,snapshot:Snapshot,period:string,value:number,publication:string|null,reconstructed=false):Observation{
  return {series_id:series.id,reference_period:period,value:Number(value.toPrecision(15)),source_snapshot_ids:[snapshot.id],publication_date:publication,value_kind:reconstructed?'reconstructed':'observed',revision_status:'final'};
}
function complete(rows:Observation[],first:number,last:number){
  if(rows.length!==last-first+1||rows.some((r,i)=>r.reference_period!==String(first+i)))throw new Error('Incomplete housing/credit annual coverage');return rows;
}
function annual(series:Series,snapshot:Snapshot,values:Map<string,number>,frequency:'monthly'|'quarterly',first:number,last:number,publication:string|null,estimateBefore=0){
  const rows:Observation[]=[],n=frequency==='monthly'?12:4;
  for(let y=first;y<=last;y++){
    let value:number;
    if(series.aggregation_kind==='end_of_period'){
      const endpoint=`${y}-${frequency==='monthly'?'12':'Q4'}`;
      if(!values.has(endpoint))throw new Error('Missing year-end housing/credit stock');value=values.get(endpoint)!;
    }else{
      const periods=Array.from({length:n},(_,i)=>`${y}-${frequency==='monthly'?String(i+1).padStart(2,'0'):'Q'+(i+1)}`);
      if(periods.some(p=>!values.has(p)))throw new Error('Incomplete housing/credit average year');
      value=periods.reduce((sum,p)=>sum+values.get(p)!,0)/n;
    }
    rows.push(obs(series,snapshot,String(y),value,publication,y<estimateBefore));
  }
  return complete(rows,first,last);
}

export const snbHousingImporter:Importer={name:'snb-housing-annual',parse(contents,{series,snapshot}){
  const input=identity(series,snapshot),stock=series.id==='domestic-mortgage-volume';
  if(!stock&&series.id!=='mortgage-offer-rate-annual')throw new Error('Unexpected SNB housing selection');
  const data=parse(contents,{bom:true,delimiter:';',skip_empty_lines:true,relax_column_count:true}) as string[][];
  const cube=stock?'bakredinausbm':'zikrepro',publication=stock?'2026-10-21':'2026-10-01';
  const header=stock?'Date,D0,D1,D2,D3,Value':'Date,D0,D1,Value';
  if(data[0]?.join(',')!==`CubeId,${cube}`||data[1]?.join(',')!==`PublishingDate,${publication} ${stock?'09:00':'14:30'}`||data[2]?.join(',')!==header)throw new Error('Unexpected SNB housing cube, vintage or header');
  const values=new Map<string,number>(),seen=new Set<string>();
  for(const r of data.slice(3)){
    if(r.length!==(stock?6:4)||r.slice(1,-1).join('/')!==(stock?'AV1/I/H/F':'M/50'))throw new Error('Unexpected SNB housing selection');
    unique(r[0],'monthly',seen);
    if(r[0]<(stock?'1985-06':'2007-12')||r[0]>'2025-12')throw new Error('Unaudited SNB housing period');
    values.set(r[0],numeric(r.at(-1)!));
  }
  // December 1985 is an actual year-end stock despite the partial first source year.
  if(seen.size!==(stock?487:217))throw new Error('Incomplete SNB housing source');
  return annual(series,snapshot,values,'monthly',input.first,input.last,publication,stock?1997:0);
}};

export const bisHousingImporter:Importer={name:'bis-housing-credit-annual',parse(contents,{series,snapshot}){
  const input=identity(series,snapshot),credit=series.id==='private-credit-gdp';
  if(!credit&&series.id!=='real-residential-property-prices')throw new Error('Unexpected BIS housing selection');
  const data=parse(contents,{bom:true,columns:true,skip_empty_lines:true}) as Record<string,string>[];
  const header=credit?'FREQ,BORROWERS_CTY,TC_BORROWERS,TC_LENDERS,VALUATION,UNIT_TYPE,TC_ADJUST,COLLECTION,DECIMALS,UNIT_MULT,UNIT_MEASURE,TITLE_TS,TIME_PERIOD,OBS_VALUE,OBS_STATUS,OBS_PRE_BREAK,OBS_CONF':'FREQ,REF_AREA,VALUE,UNIT_MEASURE,UNIT_MULT,BREAKS,COVERAGE,TITLE_TS,TIME_PERIOD,OBS_VALUE,OBS_STATUS,OBS_CONF,OBS_PRE_BREAK';
  if(!data.length||Object.keys(data[0]).join(',')!==header)throw new Error('Unexpected BIS housing header');
  const values=new Map<string,number>(),seen=new Set<string>();
  for(const r of data){
    const selected=credit?r.BORROWERS_CTY==='CH'&&r.TC_BORROWERS==='P'&&r.TC_LENDERS==='A'&&r.VALUATION==='M'&&r.UNIT_TYPE==='770'&&r.TC_ADJUST==='A'&&r.COLLECTION==='E'&&r.DECIMALS==='1'&&r.UNIT_MEASURE==='367'&&r.TITLE_TS==='Switzerland - Credit to Private non-financial sector from All sectors at Market value - Percentage of GDP - Adjusted for breaks':r.REF_AREA==='CH'&&r.VALUE==='R'&&r.UNIT_MEASURE==='628'&&r.BREAKS===''&&r.COVERAGE===''&&r.TITLE_TS==='';
    if(!selected||r.FREQ!=='Q'||r.UNIT_MULT!=='0'||r.OBS_STATUS!=='A'||r.OBS_CONF!=='F'||r.OBS_PRE_BREAK!=='')throw new Error('Unexpected BIS selection, unit or observation flag');
    unique(r.TIME_PERIOD,'quarterly',seen);
    if(r.TIME_PERIOD<(credit?'1960-Q4':'1970-Q1')||r.TIME_PERIOD>(credit?'2026-Q1':'2026-Q2'))throw new Error('Unaudited BIS housing period');
    values.set(r.TIME_PERIOD,numeric(r.OBS_VALUE));
  }
  if(seen.size!==(credit?262:226))throw new Error('Incomplete BIS housing source');
  // Retain partial 2026 source quarters for audit, never publish them as a full year.
  return annual(series,snapshot,values,'quarterly',input.first,input.last,null,credit?1999:2017);
}};

export interface BwoTable {source_url:string;source_sha256:string;headers:string[];rows:string[][]}
export function extractBwoTable(html:string,sha256:string):BwoTable{
  const script=html.match(/<script[^>]+id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if(!script)throw new Error('Missing BWO publisher table');
  const data=JSON.parse(script[1]);
  const tables=data.filter((x:unknown)=>x&&typeof x==='object'&&'bodyRows' in x);
  if(tables.length!==1)throw new Error('Ambiguous BWO publisher table');
  const table=tables[0],plain=(value:string)=>value.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim();
  const headers=data[table.headerColumns].map((i:number)=>plain(data[data[i].text]));
  const rows=data[table.bodyRows].map((i:number)=>data[i].map((j:number)=>data[data[j].cellContent].map((k:number)=>plain(data[data[k].text])).join('')));
  return {source_url:HOUSING_INPUTS['rental-reference-rate-annual'].url,source_sha256:sha256,headers,rows};
}
export function bwoCsv(table:BwoTable){
  if(table.source_url!==HOUSING_INPUTS['rental-reference-rate-annual'].url||! /^[a-f0-9]{64}$/.test(table.source_sha256)||table.headers.join('|')!=='Hypothekarischer Referenzzinssatz bei Mietverhältnissen|gültig ab|zugrundeliegender Durchschnittszinssatz|Stichtag der Erhebung')throw new Error('Unexpected BWO publisher identity');
  const expectedFootnote='* ab Dezember 2011 gemäss kaufmännischer Rundung des Durchschnittszinssatzes';
  if(table.rows.filter(r=>r.length===1&&r[0]===expectedFootnote).length!==1)throw new Error('Missing BWO rounding-rule footnote');
  const date=(value:string)=>{
    if(!/^\d{2}\.\d{2}\.\d{4}$/.test(value))throw new Error('Invalid BWO date');
    const iso=value.slice(6)+'-'+value.slice(3,5)+'-'+value.slice(0,2);
    if(!validPeriod(iso,'daily'))throw new Error('Invalid BWO date');return iso;
  };
  const percent=(value:string)=>{
    if(!/^\d+(?:,\d+)? %$/.test(value))throw new Error('Invalid BWO percentage');return numeric(value.replace(' %','').replace(',','.'));
  };
  const rows=table.rows.filter(r=>r.length!==1||r[0]!==expectedFootnote).map(r=>{
    if(r.length!==4)throw new Error('Unexpected BWO table row');
    const flagged=r[0].endsWith(' *');
    if(flagged&&r[1]!=='02.12.2011')throw new Error('Unexpected BWO footnote marker');
    return [date(r[1]),percent(r[0].replace(' *','')),date(r[3]),percent(r[2]),flagged?'rounding-rule-change':''];
  });
  return stringify(rows,{header:true,columns:['effective_date','reference_rate_percent','survey_date','average_rate_percent','note']});
}
export const bwoHousingImporter:Importer={name:'bwo-housing-annual',parse(contents,{series,snapshot}){
  const input=identity(series,snapshot),reference=series.id==='rental-reference-rate-annual';
  if(!reference&&series.id!=='mortgage-outstanding-rate-annual')throw new Error('Unexpected BWO selection');
  const data=parse(contents,{columns:true,skip_empty_lines:true}) as Record<string,string>[];
  if(!data.length||Object.keys(data[0]).join(',')!=='effective_date,reference_rate_percent,survey_date,average_rate_percent,note')throw new Error('Unexpected BWO CSV header');
  const events=new Map<string,number>(),surveys=new Map<string,number>();
  for(const r of data){
    if(!validPeriod(r.effective_date,'daily')||!validPeriod(r.survey_date,'daily')||r.effective_date<'2008-09-10'||r.effective_date>'2026-09-02'||r.survey_date<'2008-06-30'||r.survey_date>'2026-06-30'||r.survey_date>=r.effective_date)throw new Error('Unaudited BWO date');
    if(events.has(r.effective_date)||surveys.has(r.survey_date))throw new Error('Duplicate BWO observation');
    if(r.note!==(r.effective_date==='2011-12-02'?'rounding-rule-change':''))throw new Error('Unexpected BWO rounding flag');
    const rate=numeric(r.reference_rate_percent),average=numeric(r.average_rate_percent);
    if(rate*4!==Math.round(rate*4)||rate<=0||average<=0)throw new Error('Invalid BWO mortgage rate');
    // Keep the publisher's pre-December-2011 rule; do not recompute it using today's rounding.
    if(r.effective_date>='2011-12-02'&&Math.round(average*4)/4!==rate)throw new Error('Inconsistent BWO rounded reference rate');
    if(!/^\d{4}-(03-31|06-30|09-30|12-31)$/.test(r.survey_date))throw new Error('Unexpected BWO survey quarter');
    events.set(r.effective_date,rate);surveys.set(r.survey_date,average);
  }
  if(events.size!==73||!events.has('2008-09-10')||!events.has('2026-09-02'))throw new Error('Incomplete BWO source');
  if(!reference){
    const quarters=new Map([...surveys].map(([date,value])=>[date.slice(0,4)+'-Q'+Math.ceil(Number(date.slice(5,7))/3),value]));
    return annual(series,snapshot,quarters,'quarterly',input.first,input.last,null);
  }
  const changes=[...events].sort(([a],[b])=>a.localeCompare(b)),rows:Observation[]=[];
  for(let y=input.first;y<=input.last;y++){
    const start=Date.UTC(y,0,1),end=Date.UTC(y+1,0,1);let sum=0,days=0;
    // A later official observation bounds the carry-forward interval, including December.
    if(Date.parse(changes[0][0])>start||Date.parse(changes.at(-1)![0])<end)throw new Error('Unbounded BWO annual reference rate');
    for(let day=start;day<end;day+=86400000){
      const date=new Date(day).toISOString().slice(0,10),rate=changes.findLast(([effective])=>effective<=date)?.[1];
      if(rate===undefined)throw new Error('Incomplete BWO effective-date history');sum+=rate;days++;
    }
    rows.push(obs(series,snapshot,String(y),sum/days,null));
  }
  return complete(rows,input.first,input.last);
}};
