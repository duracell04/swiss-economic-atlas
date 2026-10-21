import { readAtlas, validateAtlas } from './lib/atlas-data.ts';
import { loadScope, validateScope } from '../src/lib/scope.ts';
const data = await readAtlas(process.cwd());
validateAtlas(data, true);
const scope = await loadScope(process.cwd());
validateScope(scope, data);
console.log(`Validated ${data.topics.length} topics, ${data.presets.length} configuration-driven presets and ${scope.modules.flatMap(module => module.families).length} scope families.`);
