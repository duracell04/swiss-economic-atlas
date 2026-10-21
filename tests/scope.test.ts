import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readAtlas } from '../scripts/lib/atlas-data.ts';
import { familyAvailability, loadScope, validateScope } from '../src/lib/scope.ts';

const data = await readAtlas(process.cwd());
const scope = await loadScope(process.cwd());

test('scope maps published data to catalogue modules and gives every P1 family an acquisition order', () => {
  assert.doesNotThrow(() => validateScope(scope, data));
  const missing = structuredClone(scope);
  missing.modules[0].families[0].series_ids = [];
  assert.throws(() => validateScope(missing, data), /Published series has no scope family/);
  const unordered = structuredClone(scope);
  unordered.acquisition_order.shift();
  assert.throws(() => validateScope(unordered, data), /P1 family has no acquisition order/);
});

test('scope rejects stale series references, duplicate owners and catalogue drift', () => {
  const unknown = structuredClone(scope);
  unknown.modules[0].families[0].series_ids.push('unregistered-input');
  assert.throws(() => validateScope(unknown, data), /Unknown scope series/);
  const duplicate = structuredClone(scope);
  duplicate.modules[0].families[1].series_ids.push('real-gdp');
  assert.throws(() => validateScope(duplicate, data), /Duplicate scope series membership/);
  const drift = structuredClone(scope);
  drift.modules[0].title = 'Unrelated module';
  assert.throws(() => validateScope(drift, data), /does not match catalogue topic/);
});

test('candidate definitions and planned views cannot claim published family coverage', () => {
  const published = new Set(data.observations.filter(row => row.value !== null && data.registry.series.find(series => series.id === row.series_id)?.verification === 'verified').map(row => row.series_id));
  const families = scope.modules.flatMap(module => module.families);
  assert.equal(familyAvailability(families.find(family => family.id === 'equity-returns')!, published), 'Planned');
  assert.equal(familyAvailability(families.find(family => family.id === 'bilateral-fx')!, published), 'Available');
  assert.equal(familyAvailability(families.find(family => family.id === 'effective-fx')!, published), 'Available');
  assert.equal(familyAvailability(families.find(family => family.id === 'government-yields')!, published), 'Partial');
  assert.equal(familyAvailability(families.find(family => family.id === 'unemployment')!, published), 'Available');
  const future = structuredClone(families.find(family => family.id === 'unemployment')!);
  future.planned = true;
  assert.equal(familyAvailability(future, published), 'Partial');
});
