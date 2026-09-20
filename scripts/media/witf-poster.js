/**
 * WITF viewer asset URLs and copy constants.
 *
 * Centralised so the helper module can import them without creating a circular
 * dependency back to the orchestrator (which imports the helpers).
 */

export const POSTER_SRC = '/public/projects/witf/hero-blender.webp';

export const POSTER_ALT = 'Blender 3D render of WITF Board split Alice keyboard with teal accent keys and brass weight.';

export const GLB_PATH = '/public/projects/witf/witf-keyboard.glb';

/**
 * How close the container must come before the model payload is fetched.
 * The viewer sits roughly 1100 px down on desktop and 1565 px down at 390x844,
 * so this keeps the whole three.js + GLB fetch off the first paint.
 */
export const VIEWER_GATE_MARGIN = '300px';

/**
 * How long to wait for the three.js CDN before giving up and showing the
 * poster. Without this the viewer sat on "Loading 3D model…" for as long as
 * the CDN took to fail — on a slow or blocked jsDelivr that was up to ~30s of
 * empty black rectangle above the fold with no way for the visitor to tell
 * whether anything was happening.
 */
export const THREE_LOAD_TIMEOUT_MS = 6000;
