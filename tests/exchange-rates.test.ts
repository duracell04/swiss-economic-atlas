import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';
import {checksum,load} from '../scripts/lib/store.ts';
import {ecbFxImporter,snbEffectiveImporter,bbkDemImporter} from '../scripts/lib/exchange-rates.ts';
import {exchangeRateNote} from '../src/lib/exchange-rates.ts';
import {productionAtlas} from '../scripts/lib/atlas-data.ts';
import {colorFor,formatValue,pointsFor} from '../src/atlas/geometry.ts';

const {registry,observations}=await load(process.cwd());
const specs=[
  {id:'chf-eur-annual',first:'1999',last:'2025',count:27,importer:ecbFxImporter},
  {id:'chf-usd-annual',first:'1971',last:'2025',count:55},
  {id:'chf-dem-annual',first:'1950',last:'1998',count:49,importer:bbkDemImporter},
  {id:'chf-neer-annual',first:'1973',last:'2025',count:53,importer:snbEffectiveImporter},
  {id:'chf-reer-annual',first:'1973',last:'2025',count:53,importer:snbEffectiveImporter},
];
async function context(id:string){
  const series=registry.series.find(s=>s.id===id)!;
  const actual=observations.filter(o=>o.series_id===id);
  const snapshot=registry.snapshots.find(s=>actual[0].source_snapshot_ids.includes(s.id))!;
  const bytes=await readFile(snapshot.file);
  assert.equal(checksum(bytes),snapshot.sha256);
  return {series,snapshot,actual,raw:bytes.toString('utf8')};
}

test('five annual FX datasets retain complete years, original concepts, permitted lineage and published scope',async()=>{
  const data=await productionAtlas(process.cwd());
  const topic=data.topics.find(t=>t.id==='external')!;
  assert.equal(new Set(specs.map(spec=>colorFor(data,spec.id))).size,5,'FX curves need distinct, stable legend/axis colours');
  assert.equal(observations.filter(o=>specs.some(s=>s.id===o.series_id)).length,237);
  for(const spec of specs){
    const c=await context(spec.id);
    assert.equal(c.actual.length,spec.count);assert.equal(c.actual[0].reference_period,spec.first);assert.equal(c.actual.at(-1)!.reference_period,spec.last);
    assert.equal(c.series.frequency,'annual');assert.equal(c.series.aggregation_kind,'annual_average');
    assert.ok(topic.series_ids.includes(spec.id));
    assert.ok(c.actual.every(o=>o.reference_period<'2026' && o.value!>0 && o.value_kind==='observed' && o.revision_status==='final'));
    for(const id of c.series.source_ids){const source=registry.sources.find(s=>s.id===id)!;assert.equal(source.audit_status,'verified');assert.equal(source.rights.redistribution,'permitted');assert.equal(source.rights.reviewed_on,'2026-10-21');}
    if(spec.importer)assert.deepEqual(spec.importer.parse(c.raw,c),c.actual);
  }
  for(const id of ['chf-neer-annual','chf-reer-annual'])assert.equal(observations.find(o=>o.series_id===id&&o.reference_period==='2000')!.value,100);
  assert.equal(observations.find(o=>o.series_id==='chf-eur-annual'&&o.reference_period==='2025')!.value,0.9370309803922);
  assert.equal(observations.find(o=>o.series_id==='chf-usd-annual'&&o.reference_period==='2025')!.value,0.8305);
  assert.equal(observations.find(o=>o.series_id==='chf-neer-annual'&&o.reference_period==='2025')!.value,205.2127);
  assert.equal(observations.find(o=>o.series_id==='chf-reer-annual'&&o.reference_period==='2025')!.value,118.9349);
  assert.match(exchangeRateNote('chf-eur-annual')!,/Lower CHF/);assert.match(exchangeRateNote('chf-reer-annual')!,/Higher effective/);
  assert.equal(exchangeRateNote('nominal-gdp'),undefined);
  assert.equal(formatValue(0.8305,'CHF per USD'),'0.8305 CHF per USD');
  const demPanel={id:'dem',title:'Historical mark',series_ids:['chf-dem-annual'],axis:{mode:'native' as const,base_year:null},conventions_acknowledged:false};
  const demPoints=pointsFor(demPanel,'chf-dem-annual',data,1997,1999);
  assert.equal(demPoints[1].breakBefore,false,'ending coverage must not introduce a false 1997–1998 statistical break');
  assert.equal(demPoints[2].value,null);
});

test('DEM annual means independently reproduce daily inversions, not inverted annual averages',async()=>{
  const c=await context('chf-dem-annual');
  const rows=parse(c.raw,{bom:true,delimiter:';',skip_empty_lines:true}) as string[][];
  const values=rows.filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r[0])&&r[1]!=='.');
  for(const row of c.actual){
    const days=values.filter(r=>r[0].startsWith(row.reference_period));
    assert.equal(new Set(days.map(r=>r[0].slice(5,7))).size,12);assert.ok(days.length>=200);
    // Online mean is independent of the importer's sum-then-divide implementation.
    const mean=days.reduce((mean,r,i)=>mean+(100/Number(r[1].replace(',','.'))-mean)/(i+1),0);
    assert.ok(Math.abs(mean-row.value!)<1e-13,row.reference_period);
  }
  const days=values.filter(r=>r[0].startsWith('1973'));
  const inverseMean=100/(days.reduce((sum,r)=>sum+Number(r[1].replace(',','.')),0)/days.length);
  assert.ok(Math.abs(inverseMean-c.actual.find(o=>o.reference_period==='1973')!.value!)>0.0001);
  assert.equal(c.actual[0].value,1.04112441436752);assert.equal(c.actual.at(-1)!.value,0.82378507488846);
});

test('FX importers reject incompatible identities and sources',async()=>{
  for(const spec of specs.filter(s=>s.importer)){
    const c=await context(spec.id), importer=spec.importer!;
    assert.throws(()=>importer.parse(c.raw,{...c,series:{...c.series,frequency:'monthly'}}),/identity/);
    assert.throws(()=>importer.parse(c.raw,{...c,series:{...c.series,unit:{...c.series.unit,scale:100}}}),/identity/);
    assert.throws(()=>importer.parse(c.raw,{...c,series:{...c.series,price_basis:'unknown'}}),/identity/);
    assert.throws(()=>importer.parse(c.raw,{...c,snapshot:{...c.snapshot,source_url:'https://example.invalid/unverified'}}),/identity/);
  }
});

test('ECB importer rejects inverse quotes, endpoints, flags, missing years, duplicate periods and invalid values',async()=>{
  const c=await context('chf-eur-annual');
  const rows=parse(c.raw,{bom:true,columns:true,skip_empty_lines:true}) as Record<string,string>[];
  const encode=(r:typeof rows)=>stringify(r,{header:true});
  for(const [field,value] of Object.entries({CURRENCY:'EUR',CURRENCY_DENOM:'CHF',EXR_SUFFIX:'E',OBS_STATUS:'P',UNIT_MULT:'2',SOURCE_AGENCY:'other'})){
    const changed=structuredClone(rows);changed[0][field]=value;assert.throws(()=>ecbFxImporter.parse(encode(changed),c),/selection/);
  }
  for(const value of ['0','NaN','-1','']){const changed=structuredClone(rows);changed[0].OBS_VALUE=value;assert.throws(()=>ecbFxImporter.parse(encode(changed),c),/Invalid/);}
  assert.throws(()=>ecbFxImporter.parse(encode([...rows,rows[0]]),c),/Duplicate/);
  assert.throws(()=>ecbFxImporter.parse(encode(rows.slice(1)),c),/coverage/);
  const future=structuredClone(rows);future[0].TIME_PERIOD='2026';assert.throws(()=>ecbFxImporter.parse(encode(future),c),/period/);
});

test('SNB importer rejects wrong cube, vintage, CPI variant, country group, growth, duplicates and incomplete history',async()=>{
  const c=await context('chf-reer-annual');
  for(const [before,after] of [['devwkieffia','devwkieffim'],['2026-10-07','2026-10-08'],['"K";"G"','"P";"G"'],['"G";"I"','"E";"I"'],['"G";"I"','"G";"V"'],['"79.86"','"NaN"']])assert.throws(()=>snbEffectiveImporter.parse(c.raw.replace(before,after),c));
  const lines=c.raw.trimEnd().split(/\r?\n/);
  assert.throws(()=>snbEffectiveImporter.parse([...lines,lines[4]].join('\n'),c),/Duplicate/);
  assert.throws(()=>snbEffectiveImporter.parse(lines.filter(l=>!l.includes('"1973";"K"')).join('\n'),c),/coverage/);
});

test('DEM importer rejects quotation changes, invalid flags, duplicate days and incomplete annual inputs',async()=>{
  const c=await context('chf-dem-annual');
  assert.throws(()=>bbkDemImporter.parse(c.raw.replace('100 CHF = ... DEM','100 DEM = ... CHF'),c),/quotation/);
  assert.throws(()=>bbkDemImporter.parse(c.raw.replace('96,050','0,000'),c),/Invalid/);
  assert.throws(()=>bbkDemImporter.parse(c.raw.replace('Kein Wert vorhanden','Unverified flag'),c),/flag/);
  const lines=c.raw.trimEnd().split(/\r?\n/),day=lines.find(l=>l.startsWith('1950-01-02;'))!;
  const index=lines.indexOf(day);const duplicate=[...lines];duplicate.splice(index,0,day);
  assert.throws(()=>bbkDemImporter.parse(duplicate.join('\n'),c),/Duplicate/);
  assert.throws(()=>bbkDemImporter.parse(lines.filter(l=>!l.startsWith('1998-01-')).join('\n'),c),/Incomplete/);
});
