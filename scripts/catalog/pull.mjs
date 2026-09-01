import { writeSnapshot } from './lib/snapshots.mjs';
import { loadSources, sourceIds } from './sources/index.mjs';

const parseArgs = (argv) => {
  const options = { only: null, list: false };
  for (const arg of argv) {
    if (arg === '--list') options.list = true;
    else if (arg.startsWith('--only=')) options.only = arg.slice('--only='.length).split(',').map((id) => id.trim()).filter(Boolean);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (options.list) {
    for (const id of sourceIds()) console.log(id);
    return;
  }

  const sources = await loadSources(options.only);
  const results = [];

  for (const source of sources) {
    process.stdout.write(`pulling ${source.id} ... `);
    try {
      const { products, mode, notes = [] } = await source.fetch();
      await writeSnapshot(source, products, { mode, notes });
      console.log(`${products.length} beers (${mode})`);
      for (const note of notes) console.log(`    ${note}`);
      results.push({ id: source.id, count: products.length, mode });
    } catch (error) {
      // One unreachable shop must not stop the rest of the pull; the previous
      // snapshot for that retailer stays on disk and is still used by the merge.
      console.log(`FAILED — ${error.message}`);
      results.push({ id: source.id, count: 0, mode: 'failed', error: error.message });
    }
  }

  const failed = results.filter((result) => result.mode === 'failed');
  const total = results.reduce((sum, result) => sum + result.count, 0);
  console.log(`\n${results.length - failed.length}/${results.length} sources pulled, ${total} beer listings total`);
  if (failed.length) {
    console.log('failed sources (existing snapshots left untouched):');
    for (const result of failed) console.log(`  ${result.id}: ${result.error}`);
  }
  console.log('\nnext: pnpm catalog:merge');
};

await main();
