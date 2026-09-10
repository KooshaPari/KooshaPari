import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { SHARECLI_RECORDINGS } from '../scripts/media/sharecli-recording.js';

test('ShareCLI recording catalog keeps replay artifacts attributable and separate from the Workbench', () => {
  assert.deepEqual(SHARECLI_RECORDINGS.map((recording) => recording.id), ['help', 'health']);
  assert.ok(SHARECLI_RECORDINGS.every((recording) => recording.href.endsWith('.cast')));
  assert.ok(SHARECLI_RECORDINGS.every((recording) => recording.command && recording.revision && recording.capturedAt));
  assert.ok(SHARECLI_RECORDINGS.every((recording) => /recorded|replay/i.test(recording.kind)));
  assert.ok(SHARECLI_RECORDINGS.every((recording) => /not.*illustrative|separate/i.test(recording.boundary)));
});

test('published recordings preserve the captured bytes and revision', async () => {
  const hashes = {
    help: '324a834cfe01fb12b345e775b2cde59e62215afe89eeab9b88a64457e4f8a96e',
    health: 'bdf24f25e24b1b9459e9e3d1e7aff6a7456300da6e7e2192b0d7f5510e4882fa',
  };
  for (const recording of SHARECLI_RECORDINGS) {
    for (const root of ['.', 'dist', '.vercel/output/static']) {
      const bytes = await readFile(`${root}${recording.href}`);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), hashes[recording.id]);
      const header = JSON.parse(bytes.toString('utf8').split('\n')[0]);
      assert.ok(header.title.includes(recording.revision));
    }
  }
});
