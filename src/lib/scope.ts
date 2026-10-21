import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { id } from '../../scripts/lib/schema.ts';
import type { AtlasData } from '../atlas/contracts.ts';

const text = z.string().trim().min(1);
const family = z.object({
  id, title: text, priority: z.enum(['foundation', 'next', 'following', 'later']),
  series_ids: z.array(id), planned: z.boolean(), annual_view: text, next_step: text,
}).strict();
export const scopeSchema = z.object({
  schema_version: z.literal('1.0.0'), statement: text,
  reference_only_series_ids: z.array(id),
  modules: z.array(z.object({ id, title: text, question: text, families: z.array(family).min(1) }).strict()).min(1),
  acquisition_order: z.array(z.object({ title: text, family_ids: z.array(id).min(1), why: text }).strict()),
  deferred_series: z.array(z.object({ series_id: id, blocker: text, next_step: text }).strict()),
}).strict();
export type Scope = z.infer<typeof scopeSchema>;
export type ScopeFamily = z.infer<typeof family>;
export const priorityLabels = { foundation: 'Maintain the foundation', next: 'P1 · Next additions', following: 'P2 · Following additions', later: 'P3 · Later extensions' };

export async function loadScope(root: string): Promise<Scope> {
  return scopeSchema.parse(JSON.parse(await readFile(path.join(root, 'data/registry/scope.json'), 'utf8')));
}

export function validateScope(scope: Scope, data: AtlasData): void {
  scopeSchema.parse(scope);
  const unique = (ids: string[], label: string) => {
    if (new Set(ids).size !== ids.length) throw new Error(`Duplicate scope ${label}`);
  };
  const families = scope.modules.flatMap(module => module.families);
  unique(scope.modules.map(module => module.id), 'module');
  unique(families.map(family => family.id), 'family');
  unique(scope.reference_only_series_ids, 'reference-only series');
  const series = new Map(data.registry.series.map(series => [series.id, series]));
  const mapped = families.flatMap(family => family.series_ids);
  unique(mapped, 'series membership');
  for (const seriesId of [...mapped, ...scope.reference_only_series_ids]) {
    if (!series.has(seriesId)) throw new Error(`Unknown scope series: ${seriesId}`);
  }
  for (const seriesId of scope.reference_only_series_ids) {
    if (mapped.includes(seriesId) || data.observations.some(row => row.series_id === seriesId)) throw new Error(`Reference-only scope entry has data or family membership: ${seriesId}`);
  }
  for (const module of scope.modules) {
    const topic = data.topics.find(topic => topic.id === module.id);
    if (!topic || topic.title !== module.title) throw new Error(`Scope module does not match catalogue topic: ${module.id}`);
    for (const seriesId of module.families.flatMap(family => family.series_ids)) {
      if (!topic.series_ids.includes(seriesId)) throw new Error(`Scope series is missing from its catalogue topic: ${seriesId}`);
    }
  }
  for (const row of data.observations) {
    const definition = series.get(row.series_id);
    if (definition?.data_class === 'real' && !mapped.includes(row.series_id)) throw new Error(`Published series has no scope family: ${row.series_id}`);
  }
  const ordered = scope.acquisition_order.flatMap(group => group.family_ids);
  unique(ordered, 'acquisition family');
  for (const familyId of ordered) {
    if (!families.some(family => family.id === familyId && family.priority === 'next')) throw new Error(`Acquisition order requires a P1 family: ${familyId}`);
  }
  for (const family of families.filter(family => family.priority === 'next')) {
    if (!ordered.includes(family.id)) throw new Error(`P1 family has no acquisition order: ${family.id}`);
  }
  unique(scope.deferred_series.map(item => item.series_id), 'deferred series');
  for (const item of scope.deferred_series) {
    if (!mapped.includes(item.series_id)) throw new Error(`Unknown deferred scope series: ${item.series_id}`);
  }
}

export function familyAvailability(family: ScopeFamily, publishedIds: Set<string>): 'Available' | 'Partial' | 'Planned' {
  const published = family.series_ids.filter(id => publishedIds.has(id));
  if (!published.length) return 'Planned';
  return family.planned || published.length < family.series_ids.length ? 'Partial' : 'Available';
}
