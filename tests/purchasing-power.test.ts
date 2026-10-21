import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';
import {checksum,load} from '../scripts/lib/store.ts';
import {fsoRealWagesImporter,fsoRealMedianIncomeImporter} from '../scripts/lib/household-purchasing-power.ts';
import {productionAtlas} from '../scripts/lib/atlas-data.ts';
import {chartGeometry,colorFor,pointsFor} from '../src/atlas/geometry.ts';
import {purchasingPowerNote} from '../src/lib/purchasing-power.ts';

const {registry,observations}=await load(process.cwd());
async function context(income=false){
  const series=registry.series.find(s=>s.id===(income?'real-median-disposable-income':'real-wage-index'))!;
  const actual=observations.filter(o=>o.series_id===series.id);
  const snapshot=registry.snapshots.find(s=>s.id===actual[0].source_snapshot_ids[0])!;
  const bytes=await readFile(snapshot.file);assert.equal(checksum(bytes),snapshot.sha256);
  return {series,snapshot,actual,raw:bytes.toString('utf8')};
}
type Row=Record<string,string>;
const wagesRows=(raw:string)=>parse((parse(raw,{bom:true}) as string[][]).map(r=>r[0]).join('\n'),{columns:true}) as Row[];
const encodeWages=(rows:Row[])=>stringify(stringify(rows,{header:true}).trimEnd().split('\n').map(r=>[r]));
const encodeIncome=(rows:Row[])=>stringify(rows,{header:true,delimiter:'\t'});

test('real wage and income datasets retain native concepts, coverage, precision and permitted provenance',async()=>{
  for(const income of [false,true]){
    const c=await context(income),importer=income?fsoRealMedianIncomeImporter:fsoRealWagesImporter;
    assert.deepEqual(importer.parse(c.raw,c),c.actual);
    assert.equal(c.actual.length,income?24:84);assert.equal(c.actual[0].reference_period,income?'2000':'1942');assert.equal(c.actual.at(-1)!.reference_period,income?'2023':'2025');
    assert.equal(c.series.price_basis,'real');assert.equal(c.series.frequency,'annual');assert.equal(c.series.aggregation_kind,'native');
    assert.ok(c.actual.every(o=>o.value!>0&&o.revision_status==='final'&&o.reference_period<'2026'&&o.source_snapshot_ids.length===1));
    const source=registry.sources.find(s=>s.id===c.series.source_ids[0])!;
    assert.equal(source.audit_status,'verified');assert.equal(source.rights.redistribution,'permitted');assert.match(source.rights.licence!,/OPEN-BY/);
    assert.ok(source.rights.attribution);assert.equal(source.rights.reviewed_on,'2026-10-21');
  }
  const wage=await context(),income=await context(true);
  assert.equal(wage.actual[0].value,87);assert.equal(wage.actual[0].value_kind,'reconstructed');assert.ok(wage.actual.slice(1).every(o=>o.value_kind==='observed'));
  assert.equal(wage.actual.at(-1)!.value,321);assert.equal(income.actual[0].value,3701.7654811);assert.equal(income.actual.at(-1)!.value,4331.7226679);
  assert.ok(income.actual.every(o=>o.value_kind==='observed'&&o.publication_date==='2026-01-22'));
  assert.ok(wage.actual.every(o=>o.publication_date==='2026-04-21'));
});

test('all 84 wage indices independently reproduce the FSO workbook and the real income base year matches its nominal median',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'purchasing-power-'));
  const wage=await context(),income=await context(true);
  try{
    async function extract(original:string,hash:string,sheet:string,first:number,last:number,column:string,assertCell:Record<string,string>){
      const file=`data/extractions/originals/${original}`,recipe=path.join(directory,'recipe.json'),output=path.join(directory,'extracted.csv');
      assert.equal(checksum(await readFile(file)),hash);
      await writeFile(recipe,JSON.stringify({format:'xlsx',original_sha256:hash,sheet,layout:'vertical',first_row:first,last_row:last,period_column:'A',value_column:column,key:'independent workbook cross-check',assert_cell:assertCell}));
      execFileSync('python3',['scripts/prepare-extract.py',recipe,file,output]);
      return parse(await readFile(output),{columns:true}) as Row[];
    }
    const hash='6a445ad0d196f700fff6e43cce70089125130c30670360855474ef0267c86e30';
    const values:Row[]=[];
    for(const [sheet,first,last,header] of [['1942-1975',17,50,'I11'],['1976-2009',14,47,'I11'],['2010-2025',13,28,'I10']] as const){
      values.push(...await extract('fso-wages-table-2026.xlsx',hash,sheet,first,last,'I',{[header]:' Total'}));
    }
    assert.equal(values.length,84);
    for(const value of values)assert.equal(wage.actual.find(o=>o.reference_period===value.reference_period.trim())!.value,Number(value.value));
    const base=await extract('fso-income-table-2026.xlsx','7e3f147d41242619ad7539a48ddbc833f4e9ed4a48f53f75f7bb54bbc634c7f2','2023',9,9,'F',{'A2':'2023','A9':'Median [3]','B4':'Gesamtbevölkerung','F5':'Verfügbares Äquivalenzeinkommen'});
    assert.equal(base.length,1);assert.ok(Math.abs(Number(base[0].value)-income.actual.at(-1)!.value!)<=5e-8);
  }finally{await rm(directory,{recursive:true,force:true});}
});

test('source-specific reuse, price-base and weighting evidence is retained immutably',async()=>{
  for(const [file,hash] of [
    ['fso-wages-definitions-2026.ods','45005e783872828795020c9567cc20822864f811c9f916988d00f356f10c00a5'],
    ['fso-wages-asset-2026.json','553d09c39e18794904e841f29d065608fb0b5cf73e65103900ec38477c7ded74'],
    ['fso-wages-table-asset-2026.json','352739de1ea46aa6352b7a0ca4a8f99944fc22949bb9c8ccd6cf7f9da59a65ca'],
    ['fso-income-chart-2026.html','fdbee04318e837d9a22069b01fb627c4141a38f0bfa2f26994d9a1d891afc8f7'],
    ['fso-income-asset-2026.json','db3f3763723e2d74cdd06f2876a664d813db70d318bbf4e65d2322d4b1f3736f'],
    ['fso-income-table-asset-2026.json','f8a05ee5703302cb49933c73080fbdd98f69093409ab0edae319262ef2b10448'],
  ]){
    const bytes=await readFile(`data/extractions/originals/${file}`);assert.equal(checksum(bytes),hash);
    if(file.endsWith('.json'))assert.equal(JSON.parse(bytes.toString()).description.categorization.termsOfUse[0].code,'OPEN-BY');
    if(file.endsWith('.html')){
      assert.match(bytes.toString(),/Amount in equivalent CHF per month at 2023 prices, without imputed rent/);
      assert.match(bytes.toString(),/Results from 2015 onwards have been recalculated with the revised weighting model/);
      assert.match(bytes.toString(),/confidence interval \(95%\)/);
    }
  }
});

test('purchasing-power importers reject incompatible series identities, sources, units, frequency and nominal substitutions',async()=>{
  for(const income of [false,true]){
    const c=await context(income),importer=income?fsoRealMedianIncomeImporter:fsoRealWagesImporter;
    for(const series of [
      {...c.series,id:'unrelated'}, {...c.series,price_basis:'nominal' as const}, {...c.series,frequency:'monthly' as const},
      {...c.series,unit:{...c.series.unit,scale:12}}, {...c.series,unit:{...c.series.unit,dimension:'CHF'}},
      {...c.series,source_identifier:'mean or nominal income'}, {...c.series,source_ids:[]},
    ])assert.throws(()=>importer.parse(c.raw,{...c,series}),/identity/);
    assert.throws(()=>importer.parse(c.raw,{...c,snapshot:{...c.snapshot,source_url:'https://example.invalid'}}),/identity/);
    assert.throws(()=>importer.parse(c.raw,{...c,snapshot:{...c.snapshot,source_id:'unverified'}}),/identity/);
  }
});

test('wage importer rejects malformed wrapping, flags, duplicates, missing combinations and incomplete annual history',async()=>{
  const c=await context(),rows=wagesRows(c.raw);
  assert.throws(()=>fsoRealWagesImporter.parse(stringify(rows,{header:true}),c),/wrapper/);
  assert.throws(()=>fsoRealWagesImporter.parse(c.raw.replace('OBS_STATUS_VALUE','FLAGS'),c),/header/);
  for(const [field,value] of [['SEX','Unknown'],['WAGE_TYPE','Unknown'],['OBS_STATUS_VALUE','A'],['YEAR','2026'],['YEAR','1941'],['VALUE','0'],['VALUE','NaN'],['VALUE',''],['CPI','NaN']]){
    const changed=structuredClone(rows);changed[0][field]=value;assert.throws(()=>fsoRealWagesImporter.parse(encodeWages(changed),c));
  }
  const flags=structuredClone(rows);flags.find(r=>r.YEAR==='2025'&&r.SEX==='T'&&r.WAGE_TYPE==='R')!.OBS_STATUS_VALUE='P';
  assert.throws(()=>fsoRealWagesImporter.parse(encodeWages(flags),c),/flag/);
  assert.throws(()=>fsoRealWagesImporter.parse(encodeWages([...rows,rows[0]]),c),/Duplicate/);
  assert.throws(()=>fsoRealWagesImporter.parse(encodeWages(rows.slice(1)),c),/selections/);
  assert.throws(()=>fsoRealWagesImporter.parse(encodeWages(rows.filter(r=>r.YEAR!=='1942')),c),/coverage/);
});

test('income importer checks bounds, drawing rows and complete years; chart geometry preserves distinct units, breaks and missing periods',async()=>{
  const c=await context(true),rows=parse(c.raw,{columns:true,delimiter:'\t'}) as Row[];
  assert.throws(()=>fsoRealMedianIncomeImporter.parse(c.raw.replace('disposable equivalised income','mean income'),c),/header/);
  for(const [field,value] of [['Jahr','2024'],['Jahr','2014.5'],['disposable equivalised income','0'],['disposable equivalised income','NaN'],['disposable equivalised income','3701.7'],['VI-1','9999'],['VI+1','1']]){
    const changed=structuredClone(rows);changed[0][field]=value;assert.throws(()=>fsoRealMedianIncomeImporter.parse(encodeIncome(changed),c));
  }
  assert.throws(()=>fsoRealMedianIncomeImporter.parse(encodeIncome([...rows,rows[0]]),c),/Duplicate/);
  assert.throws(()=>fsoRealMedianIncomeImporter.parse(encodeIncome(rows.slice(1)),c),/coverage/);
  assert.throws(()=>fsoRealMedianIncomeImporter.parse(encodeIncome(rows.filter(r=>r.Jahr!=='')),c),/separator/);
  const separator=structuredClone(rows);separator.find(r=>r.Jahr==='2014,5')!['disposable equivalised income']='0';
  assert.throws(()=>fsoRealMedianIncomeImporter.parse(encodeIncome(separator),c),/separator/);
  const data=await productionAtlas(process.cwd());
  const panel={id:'purchasing',title:'Purchasing power',series_ids:['real-wage-index','real-median-disposable-income'],axis:{mode:'native' as const,base_year:null},conventions_acknowledged:false};
  const geometry=chartGeometry(panel,data,1942,2025,800);assert.equal(geometry.axes.length,2);assert.notEqual(colorFor(data,panel.series_ids[0]),colorFor(data,panel.series_ids[1]));
  const incomePaths=geometry.paths.filter(p=>p.id==='real-median-disposable-income');assert.equal(incomePaths.length,2);
  assert.equal(incomePaths[0].points.at(-1)!.year,2014);assert.equal(incomePaths[1].points[0].year,2015);
  assert.equal(pointsFor(panel,'real-wage-index',data,1993,1995)[1].breakBefore,true);
  assert.equal(pointsFor(panel,'real-median-disposable-income',data,1999,2000)[0].value,null);
  assert.equal(pointsFor(panel,'real-median-disposable-income',data,2023,2024)[1].value,null);
  assert.match(purchasingPowerNote('real-wage-index')!,/not median pay/);assert.match(purchasingPowerNote('real-median-disposable-income')!,/observed annually/);
  assert.equal(purchasingPowerNote('nominal-gdp'),undefined);
});
