// Firecrawl helper — web search + scrape (returns clean markdown for the agent)
// Usage:
//   node scripts/web.mjs scrape <url>
//   node scripts/web.mjs search <query>
// API key: FIRECRAWL_API_KEY env var, or a .firecrawl-key file in the project root.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function getKey() {
  if (process.env.FIRECRAWL_API_KEY) return process.env.FIRECRAWL_API_KEY.trim();
  try {
    return readFileSync(join(root, '.firecrawl-key'), 'utf8').trim();
  } catch {
    return '';
  }
}

const key = getKey();
if (!key) {
  console.error('No Firecrawl API key found. Set FIRECRAWL_API_KEY or create a .firecrawl-key file.');
  process.exit(1);
}

const [cmd, arg] = process.argv.slice(2);
const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

async function main() {
  if (cmd === 'scrape') {
    if (!arg) {
      console.error('usage: node scripts/web.mjs scrape <url>');
      process.exit(1);
    }
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers,
      body: JSON.stringify({ url: arg, formats: ['markdown'] }),
    });
    const json = await res.json();
    if (!json.success) {
      console.error('scrape failed:', JSON.stringify(json).slice(0, 800));
      process.exit(1);
    }
    console.log(json.data?.markdown || JSON.stringify(json.data));
  } else if (cmd === 'search') {
    if (!arg) {
      console.error('usage: node scripts/web.mjs search <query>');
      process.exit(1);
    }
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: arg, limit: 5 }),
    });
    const json = await res.json();
    if (!json.success) {
      console.error('search failed:', JSON.stringify(json).slice(0, 800));
      process.exit(1);
    }
    for (const item of json.data ?? []) {
      console.log(`\n=== ${item.title || item.url} ===`);
      console.log(item.url);
      if (item.description) console.log(item.description);
    }
  } else {
    console.error('usage:\n  node scripts/web.mjs scrape <url>\n  node scripts/web.mjs search <query>');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
