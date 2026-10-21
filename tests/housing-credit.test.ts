import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';
import {checksum,load} from '../scripts/lib/store.ts';
import {HOUSING_INPUTS,snbHousingImporter,bisHousingImporter,bwoHousingImporter,bwoCsv,extractBwoTable} from '../scripts/lib/housing-credit.ts';
import {productionAtlas} from '../scripts/lib/atlas-data.ts';
import {chartGeometry,colorFor,pointsFor} from '../src/atlas/geometry.ts';
import {housingCreditNote} from '../src/lib/housing-credit.ts';
import {loadScope,familyAvailability} from '../src/lib/scope.ts';

const {registry,observations}=await load(process.cwd());
const ids=Object.keys(HOUSING_INPUTS) as (keyof typeof HOUSING_INPUTS)[];
async function context(id:typeof ids[number]){
  const series=registry.series.find(s=>s.id===id)!,actual=observations.filter(o=>o.series_id===id);
  const snapshot=registry.snapshots.find(s=>s.id===actual[0].source_snapshot_ids[0])!;
  const bytes=await readFile(snapshot.file);assert.equal(checksum(bytes),snapshot.sha256);
  const importer=id.startsWith('mortgage-offer')||id==='domestic-mortgage-volume'?snbHousingImporter:id.startsWith('rental-')||id.startsWith('mortgage-outstanding')?bwoHousingImporter:bisHousingImporter;
  return {series,snapshot,actual,raw:bytes.toString('utf8'),importer};
}
type Row=Record<string,string>;
const near=(actual:number,expected:number)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('all six housing/credit datasets reproduce source snapshots, annual coverage and permitted lineage',async()=>{
  let count=0;
  for(const id of ids){
    const c=await context(id),input=HOUSING_INPUTS[id];assert.deepEqual(c.importer.parse(c.raw,c),c.actual);
    assert.equal(c.actual.length,input.last-input.first+1);assert.equal(c.actual[0].reference_period,String(input.first));assert.equal(c.actual.at(-1)!.reference_period,'2025');
    assert.equal(c.series.frequency,'annual');assert.equal(c.series.aggregation_kind,input.aggregation);
    assert.ok(c.actual.every(o=>o.value!>0&&o.revision_status==='final'&&o.reference_period<'2026'&&o.source_snapshot_ids.length===1));
    const source=registry.sources.find(s=>s.id===input.source)!;assert.equal(source.audit_status,'verified');assert.equal(source.rights.redistribution,'permitted');
    assert.ok(source.rights.evidence_url&&source.rights.attribution);assert.equal(source.rights.reviewed_on,'2026-10-21');count+=c.actual.length;
  }
  assert.equal(count,215);
  const credit=await context('private-credit-gdp');assert.equal(credit.actual[0].value,128.9);assert.equal(credit.actual.at(-1)!.value,251.9);
  assert.ok(credit.actual.filter(o=>o.reference_period<'1999').every(o=>o.value_kind==='reconstructed'));
  assert.equal(credit.actual.find(o=>o.reference_period==='1999')!.value_kind,'observed');
});

test('mortgage stock endpoints and mortgage-rate twelve-month means independently reproduce every annual value',async()=>{
  for(const id of ['mortgage-offer-rate-annual','domestic-mortgage-volume'] as const){
    const c=await context(id),rows=parse(c.raw,{bom:true,delimiter:';',skip_empty_lines:true,relax_column_count:true}) as string[][];
    const data=rows.slice(3);
    for(const o of c.actual){
      const selected=data.filter(r=>r[0].startsWith(o.reference_period));
      const expected=id==='domestic-mortgage-volume'?Number(selected.find(r=>r[0].endsWith('-12'))!.at(-1)):selected.reduce((sum,r)=>sum+Number(r.at(-1)),0)/12;
      near(o.value!,expected);
    }
  }
  const mortgage=await context('domestic-mortgage-volume');assert.equal(mortgage.actual.at(-1)!.value,1243226);assert.equal(mortgage.series.unit.scale,1000000);
  assert.equal(mortgage.actual[0].reference_period,'1985');assert.equal(mortgage.actual[0].value_kind,'reconstructed');
  const offers=await context('mortgage-offer-rate-annual');near(offers.actual[0].value!,3.8408333333333333);
});

test('BIS real indices average four real quarters while credit ratios select Q4 with no substituted denominator',async()=>{
  for(const id of ['real-residential-property-prices','private-credit-gdp'] as const){
    const c=await context(id),rows=parse(c.raw,{columns:true}) as Row[];
    for(const o of c.actual){
      const selected=rows.filter(r=>r.TIME_PERIOD.startsWith(o.reference_period));
      const expected=id==='private-credit-gdp'?Number(selected.find(r=>r.TIME_PERIOD.endsWith('Q4'))!.OBS_VALUE):selected.reduce((sum,r)=>sum+Number(r.OBS_VALUE),0)/4;
      near(o.value!,expected);
    }
    assert.ok(rows.some(r=>r.TIME_PERIOD.startsWith('2026')));assert.ok(c.actual.every(o=>o.publication_date===null));
  }
  const prices=await context('real-residential-property-prices');near(prices.actual[0].value!,75.0834);near(prices.actual.at(-1)!.value!,158.874075);
  // Preserve the publisher's real-quarter calculation, not a forced annual rebasing.
  near(prices.actual.find(o=>o.reference_period==='2010')!.value!,100.00195);
  assert.equal(prices.actual.find(o=>o.reference_period==='2016')!.value_kind,'reconstructed');assert.equal(prices.actual.find(o=>o.reference_period==='2017')!.value_kind,'observed');
});

test('BWO effective-date day weighting includes leap years and is distinct from survey-date mortgage averages',async()=>{
  const c=await context('rental-reference-rate-annual'),average=await context('mortgage-outstanding-rate-annual');
  const rows=(parse(c.raw,{columns:true}) as Row[]).sort((a,b)=>a.effective_date.localeCompare(b.effective_date));
  for(const o of c.actual){
    const y=Number(o.reference_period),start=Date.UTC(y,0,1),end=Date.UTC(y+1,0,1);
    // Independent interval intersection, not the importer's day-by-day algorithm.
    const total=rows.reduce((sum,r,i)=>{
      const left=Math.max(start,Date.parse(r.effective_date)),right=Math.min(end,Date.parse(rows[i+1]?.effective_date??'2027-01-01'));
      return sum+Math.max(0,right-left)/86400000*Number(r.reference_rate_percent);
    },0);
    near(o.value!,total/((end-start)/86400000));
    const surveys=rows.filter(r=>r.survey_date.startsWith(o.reference_period));assert.equal(surveys.length,4);
    near(average.actual.find(r=>r.reference_period===o.reference_period)!.value!,surveys.reduce((s,r)=>s+Number(r.average_rate_percent),0)/4);
  }
  near(c.actual.at(-1)!.value!,(62*1.75+182*1.5+121*1.25)/365);assert.equal(c.actual.find(o=>o.reference_period==='2024')!.value,1.75);
  near(average.actual.at(-1)!.value!,1.365);assert.equal(rows.find(r=>r.survey_date==='2025-12-31')!.effective_date,'2026-03-03');
  assert.ok(rows.some(r=>r.note==='rounding-rule-change'&&r.effective_date==='2011-12-02'));
  assert.equal(c.actual[0].reference_period,'2009');assert.ok(c.actual.every(o=>o.publication_date===null));
});

test('retained BWO numeric table and SNB unit/dimension evidence are immutable and reproduce the checked extract',async()=>{
  const evidence=[
    ['bwo-mortgage-table-2026.json','6f49db023ccaae86754a085c13de39a526917def2ec27de88e81c8cccc89cb14'],
    ['snb-mortgage-offer-dimensions-2026.json','08bb4dce3c463b2c662c977c0855c9d51bde5ba1a99b80055b466a7a2a4d1cb2'],
    ['snb-mortgage-stock-dimensions-2026.json','993894c80e84e4dc5e7143eb09dc97a7f83267a2472729d51a68cee097904626'],
    ['snb-mortgage-stock-unit-2026.json','b6948534a065129f2ab491b60f29957258a8c18fd1044b4178d86ea9db828393'],
  ];
  for(const [file,hash] of evidence)assert.equal(checksum(await readFile(`data/extractions/originals/${file}`)),hash);
  const table=JSON.parse(await readFile('data/extractions/originals/bwo-mortgage-table-2026.json','utf8'));
  assert.equal(bwoCsv(table),(await context('rental-reference-rate-annual')).raw);
  assert.throws(()=>bwoCsv({...table,headers:['unrelated']}),/identity/);
  assert.throws(()=>bwoCsv({...table,rows:table.rows.filter((r:string[])=>r.length!==1)}),/footnote/);
  assert.throws(()=>extractBwoTable('<html></html>','a'.repeat(64)),/Missing/);
  const metadata=JSON.parse(await readFile('data/extractions/originals/snb-mortgage-stock-unit-2026.json','utf8'));
  assert.equal(metadata.timeseries[0].metadata.unit,'In CHF millions');assert.equal(metadata.timeseries[0].metadata.key,'EPB@SNB.bakredinausbm{AV1,I,H,F}');
});

test('housing importers reject incompatible identities, sources, frequency, price bases and stock/flow substitutions',async()=>{
  for(const id of ids){
    const c=await context(id);
    for(const series of [{...c.series,id:'unrelated'},{...c.series,source_identifier:'other product'},
      {...c.series,frequency:'monthly' as const},{...c.series,unit:{...c.series.unit,scale:17}},
      {...c.series,unit:{...c.series.unit,dimension:'unrelated'}},{...c.series,source_ids:[]},
      {...c.series,price_basis:'unknown' as const},{...c.series,aggregation_kind:'sum' as const},
    ])assert.throws(()=>c.importer.parse(c.raw,{...c,series}),/identity/);
    assert.throws(()=>c.importer.parse(c.raw,{...c,snapshot:{...c.snapshot,source_url:'https://example.com/'}}),/identity/);
  }
});

test('housing imports fail closed on malformed headers, missing periods, duplicates, flags and wrong selections',async()=>{
  for(const id of ['mortgage-offer-rate-annual','domestic-mortgage-volume'] as const){
    const c=await context(id);
    assert.throws(()=>c.importer.parse(c.raw.replace('CubeId','NotCube'),c),/header/);
    const rows=parse(c.raw,{bom:true,delimiter:';',skip_empty_lines:true,relax_column_count:true}) as string[][];
    const encode=(r:string[][])=>stringify(r,{delimiter:';'});
    assert.throws(()=>c.importer.parse(encode(rows.slice(0,-1)),c),/Incomplete/);
    assert.throws(()=>c.importer.parse(encode([...rows,rows.at(-1)!]),c),/Duplicate/);
    const wrong=structuredClone(rows);wrong.at(-1)![1]='wrong';assert.throws(()=>c.importer.parse(encode(wrong),c),/selection/);
  }
  for(const id of ['private-credit-gdp','real-residential-property-prices'] as const){
    const c=await context(id),rows=parse(c.raw,{columns:true}) as Row[],encode=(r:Row[])=>stringify(r,{header:true});
    assert.throws(()=>c.importer.parse(encode([...rows,rows[0]]),c),/Duplicate/);
    assert.throws(()=>c.importer.parse(encode(rows.slice(1)),c),/Incomplete/);
    for(const [key,value] of [['OBS_STATUS','P'],['UNIT_MULT','6'],['UNIT_MEASURE','771'],['OBS_CONF','C'],['FREQ','A']]){
      const wrong=structuredClone(rows);wrong[0][key]=value;assert.throws(()=>c.importer.parse(encode(wrong),c),/selection/);
    }
  }
  const c=await context('rental-reference-rate-annual'),rows=parse(c.raw,{columns:true}) as Row[],encode=(r:Row[])=>stringify(r,{header:true});
  assert.throws(()=>c.importer.parse(encode([...rows,rows[0]]),c),/Duplicate/);
  assert.throws(()=>c.importer.parse(encode(rows.slice(1)),c),/Incomplete/);
  for(const [key,value] of [['reference_rate_percent','1.3'],['survey_date','2026-06-29'],['effective_date','2026-02-30'],['note','unknown'],['average_rate_percent','NaN']]){
    const wrong=structuredClone(rows);wrong[0][key]=value;assert.throws(()=>c.importer.parse(encode(wrong),c));
  }
  const changed=structuredClone(rows);changed[0].reference_rate_percent='1.5';assert.throws(()=>c.importer.parse(encode(changed),c),/rounded/);
});

test('housing charts preserve axes, gaps, source breaks, reconstructed segments and scope priorities',async()=>{
  const data=await productionAtlas(process.cwd()),scope=await loadScope(process.cwd());
  const panel={id:'housing',title:'Housing',series_ids:ids,axis:{mode:'native' as const,base_year:null},conventions_acknowledged:true};
  const geometry=chartGeometry(panel,data,1960,2025,800);assert.equal(geometry.axes.length,4);
  assert.equal(new Set(ids.map(id=>colorFor(data,id))).size,6);
  for(const id of ids){assert.ok(housingCreditNote(id));assert.ok(data.observations.some(o=>o.series_id===id));}
  assert.equal(housingCreditNote('nominal-gdp'),undefined);
  assert.equal(pointsFor(panel,'mortgage-offer-rate-annual',data,2007,2008)[0].value,null);
  for(const year of [1985,2017])assert.equal(pointsFor(panel,'real-residential-property-prices',data,year,year)[0].breakBefore,true);
  assert.equal(pointsFor(panel,'private-credit-gdp',data,1999,1999)[0].breakBefore,true);
  assert.equal(pointsFor(panel,'rental-reference-rate-annual',data,2025,2026)[1].value,null);
  const published=new Set(data.observations.map(o=>o.series_id));
  for(const f of scope.modules.find(m=>m.id==='credit-housing')!.families.filter(f=>f.series_ids.some(id=>ids.includes(id as typeof ids[number])))){
    assert.equal(familyAvailability(f,published),'Available');assert.equal(f.priority,'foundation');assert.equal(f.planned,false);
  }
  assert.equal(scope.acquisition_order.length,2);assert.match(scope.acquisition_order[0].title,/Trade/);
});
