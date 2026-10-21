import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';
import {checksum,load} from '../scripts/lib/store.ts';
import {fsoProductivityImporter,fsoHoursImporter,WPS_SNAPSHOT,WPS_SOURCE,HOURS_SOURCE} from '../scripts/lib/fso-productivity.ts';
import {productionAtlas} from '../scripts/lib/atlas-data.ts';
import {chartGeometry,colorFor,pointsFor} from '../src/atlas/geometry.ts';
import {labourInputNote} from '../src/lib/labour-input.ts';

const {registry,observations}=await load(process.cwd());
async function context(hours=false){
  const series=registry.series.find(s=>s.id===(hours?'total-hours-worked':'hourly-labour-productivity'))!;
  const actual=observations.filter(o=>o.series_id===series.id);
  const snapshot=registry.snapshots.find(s=>s.id===actual[0].source_snapshot_ids[0])!;
  const bytes=await readFile(snapshot.file);assert.equal(checksum(bytes),snapshot.sha256);
  return {series,snapshot,actual,raw:bytes.toString('utf8')};
}
type SourceRow=Record<string,string>;
const encode=(rows:SourceRow[])=>stringify(rows,{header:true});

test('both FSO labour-input series preserve annual coverage, native precision, concepts and open attribution',async()=>{
  for(const hours of [false,true]){
    const c=await context(hours),importer=hours?fsoHoursImporter:fsoProductivityImporter;
    assert.deepEqual(importer.parse(c.raw,c),c.actual);
    assert.equal(c.actual.length,35);assert.equal(c.actual[0].reference_period,'1991');assert.equal(c.actual.at(-1)!.reference_period,'2025');
    assert.equal(c.series.frequency,'annual');assert.equal(c.series.measurement,'level');
    assert.equal(c.series.price_basis,hours?'not_applicable':'real');
    assert.equal(c.series.unit.scale,hours?1_000_000:1);
    assert.ok(c.actual.every(o=>o.value!>0&&o.value_kind==='observed'&&o.publication_date==='2026-08-28'&&o.reference_period<'2026'));
    for(const id of c.series.source_ids){
      const source=registry.sources.find(s=>s.id===id)!;
      assert.equal(source.audit_status,'verified');assert.equal(source.rights.redistribution,'permitted');
      assert.match(source.rights.licence!,/OPEN-BY/);assert.ok(source.rights.attribution);assert.equal(source.rights.reviewed_on,'2026-10-21');
    }
  }
  assert.equal((await context()).actual.at(-1)!.value,149.397162056923);
  assert.equal((await context(true)).actual.at(-1)!.value,8088.3170130706385);
});

test('every published productivity value and physical hours denominator independently reconcile to the same-vintage indices',async()=>{
  const productivity=await context(),hours=await context(true);
  const rows=parse(productivity.raw,{columns:true,bom:true}) as SourceRow[];
  const base=hours.actual[0].value!;
  for(const observation of productivity.actual){
    const year=rows.filter(r=>r.PERIOD===observation.reference_period);
    const value=(indicator:string)=>Number(year.find(r=>r.INDICATOR===indicator)!.VALUE);
    const total=hours.actual.find(o=>o.reference_period===observation.reference_period)!.value!;
    assert.ok(Math.abs(observation.value!-100*value('GDP')/value('Actual hours worked'))<1e-10,observation.reference_period);
    assert.ok(Math.abs(value('Actual hours worked')-100*total/base)<1e-10,observation.reference_period);
    assert.equal(observation.value,value('Productivity'));
  }
});

test('hours extraction reproduces original workbook bytes and dataset-specific OPEN-BY evidence is pinned',async()=>{
  const recipe=JSON.parse(await readFile('data/extractions/total-hours-worked.json','utf8'));
  assert.equal(checksum(await readFile(recipe.original_file)),recipe.original_sha256);
  assert.equal(checksum(await readFile(recipe.revision_companion_file)),recipe.revision_companion_sha256);
  const directory=await mkdtemp(path.join(tmpdir(),'wps-hours-'));
  try{
    const output=path.join(directory,'hours.csv');
    execFileSync('python3',['scripts/prepare-extract.py','data/extractions/total-hours-worked.json',recipe.original_file,output]);
    assert.deepEqual(await readFile(output),await readFile((await context(true)).snapshot.file));
  }finally{await rm(directory,{recursive:true,force:true});}
  for(const [file,hash] of [
    ['fso-productivity-metadata-2026.xlsx','dfd77587d0a3f93c2a862c710ef835be25653bd7800eeb071058aeb8b9caaed9'],
    ['fso-productivity-asset-2026.json','01dfdb896c29f8aa9d4984b6fae188b706779df8356a0ef103a47295175400d6'],
    ['fso-hours-asset-2026.json','1d3d63022b928b31193cf6a590af97c7cad19479c079f0c812ead815e96a6284'],
  ]){
    const bytes=await readFile(`data/extractions/originals/${file}`);assert.equal(checksum(bytes),hash);
    if(file.endsWith('.json'))assert.equal(JSON.parse(bytes.toString()).description.categorization.termsOfUse[0].code,'OPEN-BY');
  }
});

test('WPS importers reject wrong identities, frequency, source, units and price basis',async()=>{
  for(const hours of [false,true]){
    const c=await context(hours),importer=hours?fsoHoursImporter:fsoProductivityImporter;
    for(const series of [
      {...c.series,id:'unrelated'}, {...c.series,frequency:'monthly' as const},
      {...c.series,unit:{...c.series.unit,scale:100}}, {...c.series,price_basis:'unknown' as const},
      {...c.series,source_identifier:'wrong column'}, {...c.series,source_ids:[]},
    ])assert.throws(()=>importer.parse(c.raw,{...c,series}),/identity/);
    assert.throws(()=>importer.parse(c.raw,{...c,snapshot:{...c.snapshot,source_url:'https://example.invalid'}}),/identity/);
    assert.throws(()=>importer.parse(c.raw,{...c,snapshot:{...c.snapshot,source_id:'unverified'}}),/identity/);
  }
});

test('native WPS importer rejects malformed inputs, future/incomplete years, unknown flags and inconsistent identities',async()=>{
  const c=await context();const rows=parse(c.raw,{columns:true,bom:true}) as SourceRow[];
  const altered=(field:string,value:string)=>{const changed=structuredClone(rows);changed[0][field]=value;return encode(changed);};
  for(const [field,value] of [['INDICATOR','Nominal productivity'],['UNIT_MEA','CHF'],['OBS_STATUS','P'],['PERIOD','2026'],['PERIOD','1990'],['VALUE','0'],['VALUE','NaN'],['VALUE','-1'],['VALUE',''],['VALUE','101']])assert.throws(()=>fsoProductivityImporter.parse(altered(field,value),c));
  assert.throws(()=>fsoProductivityImporter.parse(c.raw.replace('OBS_STATUS','FLAG'),c),/header/);
  assert.throws(()=>fsoProductivityImporter.parse(encode([...rows,rows[0]]),c),/Duplicate/);
  assert.throws(()=>fsoProductivityImporter.parse(encode(rows.slice(1)),c),/triplet/);
  assert.throws(()=>fsoProductivityImporter.parse(encode(rows.filter(r=>r.PERIOD!=='1991')),c),/coverage/);
  const flags=structuredClone(rows);for(const row of flags.filter(r=>r.PERIOD==='2025'))row.OBS_STATUS='A';
  assert.throws(()=>fsoProductivityImporter.parse(encode(flags),c),/revision/);
  const base=structuredClone(rows);for(const row of base.filter(r=>r.PERIOD==='1991'&&r.INDICATOR!=='Productivity'))row.VALUE='101';
  assert.throws(()=>fsoProductivityImporter.parse(encode(base),c),/base/);
});

test('hours importer rejects wrong selections, scales and periods; both chart series retain revision lineage without a false 2010 gap',async()=>{
  const c=await context(true);const rows=parse(c.raw,{columns:true}) as SourceRow[];
  for(const [field,value] of [['source_identifier','Nominal GDP'],['reference_period','2026'],['reference_period','invalid'],['value','8.088'],['value','8088317013'],['value','NaN'],['value','0']]){
    const changed=structuredClone(rows);changed[0][field]=value;assert.throws(()=>fsoHoursImporter.parse(encode(changed),c));
  }
  assert.throws(()=>fsoHoursImporter.parse(encode([...rows,rows[0]]),c),/Duplicate/);
  assert.throws(()=>fsoHoursImporter.parse(encode(rows.slice(1)),c),/coverage/);
  assert.throws(()=>fsoHoursImporter.parse(c.raw.replace('source_identifier','selection'),c),/header/);
  const source=parse((await context()).raw,{columns:true,bom:true}) as SourceRow[];
  for(const row of c.actual){
    assert.deepEqual(row.source_snapshot_ids,[c.snapshot.id,WPS_SNAPSHOT]);
    const flag=source.find(r=>r.PERIOD===row.reference_period&&r.INDICATOR==='Actual hours worked')!.OBS_STATUS;
    assert.equal(row.revision_status,flag==='R'?'revised':'final');
  }
  const data=await productionAtlas(process.cwd());
  const panel={id:'labour',title:'Labour input',series_ids:['hourly-labour-productivity','total-hours-worked'],axis:{mode:'native' as const,base_year:null},conventions_acknowledged:false};
  assert.notEqual(colorFor(data,panel.series_ids[0]),colorFor(data,panel.series_ids[1]));
  const geometry=chartGeometry(panel,data,1991,2025,800);assert.equal(geometry.axes.length,2);assert.equal(geometry.paths.length,2);
  assert.ok(geometry.axes.some(a=>a.label==='Index, 1991 = 100 (real)'));assert.ok(geometry.axes.some(a=>a.label==='Million hours'));
  for(const id of panel.series_ids){
    assert.equal(pointsFor(panel,id,data,2009,2011)[1].breakBefore,false);
    assert.equal(pointsFor(panel,id,data,2025,2026)[1].value,null);
    assert.match(labourInputNote(id)!,/pre-2010 hours were harmonised/);
    assert.equal(observations.filter(o=>o.series_id===id&&o.revision_status==='revised').length,3);
  }
  assert.equal(labourInputNote('nominal-gdp'),undefined);
  assert.deepEqual(c.series.source_ids,[HOURS_SOURCE,WPS_SOURCE]);
});
