import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('Vercel static output includes the SPA entrypoint and core assets', () => {
  for (const file of ['index.html', 'scripts/app.js', 'styles/base.css']) {
    assert.ok(
      existsSync(`.vercel/output/static/${file}`),
      `missing ${file} from Vercel output`,
    );
  }
});
