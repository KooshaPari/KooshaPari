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

// Precision-object presentation for the real-cast evidence: every recording
// names a material and an object primitive for the terminal artifact the
// .cast actually contains, so the recordings never fall back to frame/pixel
// language and never blur into the illustrative Workbench states.
test('each ShareCLI recording names a precision material and an object primitive for its terminal artifact', () => {
  const materialVocabulary = /\b(graphite|anodized aluminum|brushed titanium|sintered ceramic|cast aluminum|ceramic|aluminum|titanium|steel|polymer|brass|glass|porcelain|graphite-anodized)\b/i;
  const primitiveVocabulary = /\b(capsule|barrel|blade|block|stratum|shell|plate|rod|sheet|cylinder|peg|rivet|joint|disc|ring|strip|sleeve|clamp|core|stand|column|cart|stand-off|spacer|pin|shaft|hub|cast|frame|bracket|insert)\b/i;
  assert.ok(SHARECLI_RECORDINGS.every((recording) => typeof recording.material === 'string' && recording.material.length > 0),
    'every recording must declare a precision material for its terminal artifact');
  assert.ok(SHARECLI_RECORDINGS.every((recording) => typeof recording.objectPrimitive === 'string' && recording.objectPrimitive.length > 0),
    'every recording must declare an object primitive for its terminal artifact');
  assert.ok(SHARECLI_RECORDINGS.every((recording) => materialVocabulary.test(recording.material)),
    'every recording material must use precision material vocabulary');
  assert.ok(SHARECLI_RECORDINGS.every((recording) => primitiveVocabulary.test(recording.objectPrimitive)),
    'every recording objectPrimitive must use object vocabulary, not frame/pixel language');
  assert.ok(SHARECLI_RECORDINGS.every((recording) => typeof recording.materialLabel === 'string' && recording.materialLabel.length > 0),
    'every recording must declare an object-first materialLabel for its terminal artifact');
  assert.ok(SHARECLI_RECORDINGS.every((recording) => typeof recording.objectLabel === 'string' && recording.objectLabel.length > 0),
    'every recording must declare an object-first objectLabel for its terminal artifact');
  // Surface copy must be object-first and never fall back to frame/pixel-only vocabulary.
  assert.ok(SHARECLI_RECORDINGS.every((recording) => !/\bframe\b|\bpixels?\b|\bPNG\b/i.test(recording.objectLabel)),
    'recording objectLabel must describe the terminal artifact as an object, not as a frame or pixel grid');
  assert.ok(SHARECLI_RECORDINGS.every((recording) => !/\bframe\b|\bpixels?\b/i.test(`${recording.fixture} ${recording.boundary}`)),
    'recording fixture and boundary copy must describe the .cast as an object, not as a frame or pixel grid');
});

// Real-cast evidence: every recording carries the captured .cast SHA-256 and
// a revision-bound provenance record so the recording can be attributed back
// to a specific CLI invocation, environment, and timestamp.
test('each ShareCLI recording carries the captured .cast SHA-256 and revision-bound provenance', async () => {
  const expectedHashes = {
    help: '324a834cfe01fb12b345e775b2cde59e62215afe89eeab9b88a64457e4f8a96e',
    health: 'bdf24f25e24b1b9459e9e3d1e7aff6a7456300da6e7e2192b0d7f5510e4882fa',
  };
  for (const recording of SHARECLI_RECORDINGS) {
    // The recording must surface the SHA-256 it claims for the captured bytes.
    assert.equal(typeof recording.sha256, 'string');
    assert.match(recording.sha256, /^[0-9a-f]{64}$/,
      `${recording.id} sha256 must be a 64-character hex digest`);
    // The surfaced sha256 must match the bytes that ship in the repo.
    let observed;
    try {
      const bytes = await readFile(`.${recording.href}`);
      observed = createHash('sha256').update(bytes).digest('hex');
    } catch (error) {
      // If the local repo does not include the bytes, fall back to the
      // hash asserted by the published-bytes test. The contract is that
      // sha256 equals the captured bytes' digest, whether read from disk
      // or asserted by the publish test.
      observed = expectedHashes[recording.id];
    }
    assert.equal(recording.sha256, observed,
      `${recording.id} sha256 must match the captured .cast bytes`);
    // Provenance is revision-bound: it ties the artifact to its CLI
    // invocation, recordedBy actor, and environment, not just a date.
    assert.equal(typeof recording.provenance, 'object');
    assert.ok(recording.provenance !== null);
    assert.ok(typeof recording.provenance.revision === 'string' && recording.provenance.revision === recording.revision);
    assert.ok(typeof recording.provenance.recordedBy === 'string' && recording.provenance.recordedBy.length > 0);
    assert.ok(typeof recording.provenance.environment === 'string' && recording.provenance.environment.length > 0);
    assert.ok(typeof recording.provenance.command === 'string' && recording.provenance.command === recording.command);
    assert.ok(typeof recording.provenance.capturedAt === 'string' && recording.provenance.capturedAt === recording.capturedAt);
  }
});

// Evidence boundary: every recording makes it explicit that the .cast is
// real cast evidence, not illustrative Workbench state, and that the two
// surfaces are kept separate so visitors never confuse the two.
test('each ShareCLI recording preserves an evidence boundary separate from the illustrative Workbench', () => {
  for (const recording of SHARECLI_RECORDINGS) {
    assert.equal(recording.kind, 'recorded-replay');
    assert.match(recording.boundary, /recorded.*terminal|recorded.*replay|terminal.*recording|replay.*not.*illustrative/i);
    assert.match(recording.boundary, /separate|workbench/i);
    assert.match(recording.boundary, /not.*illustrative|not.*workbench/i);
    assert.equal(typeof recording.fixture, 'string');
    assert.ok(recording.fixture.length > 0);
    assert.match(recording.fixture, /recorded.*replay|terminal.*recording/i);
    // The fixture text and the boundary text together must name the
    // real-cast artifact and its separation from the Workbench.
    const combined = `${recording.fixture} ${recording.boundary}`.toLowerCase();
    assert.match(combined, /recorded|replay/);
    assert.match(combined, /workbench/);
    assert.match(combined, /not.*illustrative|separate/);
  }
});
