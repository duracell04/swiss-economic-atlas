/** Extract only BWO's numeric table, not the site's prose, design or other assets. */
import {readFile} from 'node:fs/promises';
import {checksum,atomicWrite,json} from './lib/store.ts';
import {extractBwoTable,bwoCsv} from './lib/housing-credit.ts';
const [input,tableOutput,csvOutput]=process.argv.slice(2);
if(!input||!tableOutput||!csvOutput)throw new Error('Usage: prepare-housing.ts publisher.html table.json output.csv');
const bytes=await readFile(input),table=extractBwoTable(bytes.toString('utf8'),checksum(bytes));
await atomicWrite(tableOutput,json(table));await atomicWrite(csvOutput,bwoCsv(table));
console.log(`Extracted BWO numeric table (${table.rows.length} rows including rounding footnote).`);
