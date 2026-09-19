/**
 * WITF 3D Keyboard Viewer
 *
 * Lazy-loads Three.js from CDN via importmap and renders the WITF keyboard
 * GLB model with orbit controls. Falls back to a static poster if WebGL or
 * the CDN is unavailable.
 */

let _scene = null;
let _renderer = null;
let _camera = null;
let _controls = null;
let _animationId = null;
let _container = null;
let _hintEl = null;
let _hintFaded = false;
let _cleanupFns = [];
let _destroyed = false;
let _frameEnabled = true;
let _gateObserver = null;
let _viewObservers = [];

const GLB_PATH = '/public/projects/witf/witf-keyboard.glb';
const POSTER_SRC = '/public/projects/witf/hero-blender.webp';
const POSTER_ALT = 'Blender 3D render of WITF Board split Alice keyboard with teal accent keys and brass weight.';

/**
 * How close the container must come before the model payload is fetched.
 * The viewer sits roughly 1100 px down on desktop and 1565 px down at 390x844,
 * so this keeps the whole three.js + GLB fetch off the first paint.
 */
const VIEWER_GATE_MARGIN = '300px';

/* ------------------------------------------------------------------ */
/*  WebGL feature detection                                           */
/* ------------------------------------------------------------------ */

/**
 * Cached WebGL capability probe. `null` until the first probe.
 * @type {boolean | null}
 */
let _webglSupport = null;

/**
 * Probe once per session and release the probe context.
 *
 * This used to build a fresh WebGL context on every home render (measured: 7
 * contexts after 7 in-app navigations) and never release them. Browsers cap
 * live WebGL contexts per page, so the probe both cost a context creation per
 * render and eventually forced the oldest context to be dropped.
 */
function webglSupported() {
  if (_webglSupport !== null) return _webglSupport;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    _webglSupport = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { _webglSupport = false; }
  return _webglSupport;
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function isCoarsePointer() {
  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

/* ------------------------------------------------------------------ */
/*  Fallback poster                                                   */
/* ------------------------------------------------------------------ */

function showPoster(container) {
  container.innerHTML = '';
  const img = document.createElement('img');
  img.src = POSTER_SRC;
  img.alt = POSTER_ALT;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;aspect-ratio:16/9;';
  container.appendChild(img);
}

/* ------------------------------------------------------------------ */
/*  Loading indicator                                                 */
/* ------------------------------------------------------------------ */

function createLoadingIndicator(container) {
  const el = document.createElement('div');
  el.className = 'witf-viewer-loading';
  el.textContent = 'Loading 3D model\u2026';
  container.appendChild(el);
  return el;
}

/* ------------------------------------------------------------------ */
/*  Interaction hint                                                  */
/* ------------------------------------------------------------------ */

function createHint(container) {
  const el = document.createElement('div');
  el.className = 'witf-viewer-hint';
  el.textContent = isCoarsePointer() ? 'Pinch to zoom \u00b7 Drag to rotate' : 'Drag to rotate \u00b7 Scroll to zoom';
  container.appendChild(el);
  return el;
}

function fadeHint() {
  if (_hintFaded || !_hintEl) return;
  _hintFaded = true;
  _hintEl.classList.add('witf-viewer-hint--hidden');
  setTimeout(() => { _hintEl?.remove(); _hintEl = null; }, 600);
}

/* ------------------------------------------------------------------ */
/*  Cleanup                                                            */
/* ------------------------------------------------------------------ */

export function destroyWitfViewer() {
  _destroyed = true;

  // Cancel a pending lazy-load gate so a route change cannot start the fetch.
  _gateObserver?.disconnect();
  _gateObserver = null;

  for (const observer of _viewObservers) observer.disconnect();
  _viewObservers = [];
  _frameEnabled = true;

  if (_animationId != null) {
    cancelAnimationFrame(_animationId);
    _animationId = null;
  }

  _controls?.dispose();
  _controls = null;

  if (_renderer) {
    _renderer.dispose();
    _renderer.forceContextLoss?.();
    _renderer.domElement?.remove();
    _renderer = null;
  }

  _scene = null;
  _camera = null;
  _hintEl = null;
  _hintFaded = false;

  for (const fn of _cleanupFns) { try { fn(); } catch { /* ignore */ } }
  _cleanupFns = [];
}

/* ------------------------------------------------------------------ */
/*  Main init                                                         */
/* ------------------------------------------------------------------ */

async function startWitfViewer(container) {
  // The gate may fire after a route change destroyed the viewer.
  if (_destroyed) return;

  _container = container;

  const loadingEl = createLoadingIndicator(container);

  try {
    // Dynamic imports via importmap
    const [{ Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Color, Vector3 },
            { OrbitControls },
            { GLTFLoader }] = await Promise.all([
      import('three'),
      import('three/addons/controls/OrbitControls.js'),
      import('three/addons/loaders/GLTFLoader.js'),
    ]);

    if (_destroyed) return;

    // ---- Scene ----
    _scene = new Scene();
    _scene.background = new Color(0x0F1012);

    // ---- Renderer ----
    _renderer = new WebGLRenderer({ antialias: true, alpha: false });
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.toneMapping = 4;  // ACESFilmicToneMapping
    _renderer.toneMappingExposure = 1.1;
    _renderer.outputColorSpace = 'srgb';
    const rect = container.getBoundingClientRect();
    _renderer.setSize(rect.width, rect.height);
    container.appendChild(_renderer.domElement);

    // ---- Camera ----
    _camera = new PerspectiveCamera(35, rect.width / rect.height, 0.1, 100);
    _camera.position.set(0, 0.8, 2.2);

    // ---- Controls ----
    _controls = new OrbitControls(_camera, _renderer.domElement);
    _controls.enableDamping = true;
    _controls.dampingFactor = 0.08;
    _controls.minDistance = 1.2;
    _controls.maxDistance = 5;
    _controls.maxPolarAngle = Math.PI * 0.75;
    _controls.target.set(0, 0.1, 0);
    _controls.autoRotate = true;
    _controls.autoRotateSpeed = 1.2;

    // Fade hint on first user interaction
    const onInteract = () => { fadeHint(); _controls.removeEventListener('start', onInteract); };
    _controls.addEventListener('start', onInteract);

    // ---- Lighting (product photography feel) ----
    const ambient = new AmbientLight(0xffffff, 0.4);
    _scene.add(ambient);

    // Key light (warm)
    const keyLight = new DirectionalLight(0xfff5e6, 1.6);
    keyLight.position.set(3, 5, 4);
    _scene.add(keyLight);

    // Fill light (cool)
    const fillLight = new DirectionalLight(0xe6f0ff, 0.6);
    fillLight.position.set(-3, 2, -2);
    _scene.add(fillLight);

    // Rim / back light
    const rimLight = new DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 3, -4);
    _scene.add(rimLight);

    // Subtle bottom fill to lift shadows
    const bottomFill = new DirectionalLight(0xffffff, 0.15);
    bottomFill.position.set(0, -2, 2);
    _scene.add(bottomFill);

    // ---- Hint overlay ----
    _hintEl = createHint(container);
    _hintFaded = false;
    // Auto-fade after 4s even without interaction
    setTimeout(() => fadeHint(), 4000);

    // ---- Load GLB ----
    const loader = new GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
      loader.load(GLB_PATH, resolve, undefined, reject);
    });

    if (_destroyed) return;

    // Remove loading indicator
    loadingEl.remove();

    const model = gltf.scene;

    // Auto-center and scale model to fit viewport
    let firstMesh = true;
    const bbox = { min: new Vector3(), max: new Vector3() };
    model.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.geometry.computeBoundingBox();
        const bb = child.geometry.boundingBox;
        if (firstMesh) {
          bbox.min.copy(bb.min);
          bbox.max.copy(bb.max);
          firstMesh = false;
        } else {
          bbox.min.min(bb.min);
          bbox.max.max(bb.max);
        }
      }
    });

    // Compute center and size
    const center = new Vector3().addVectors(bbox.min, bbox.max).multiplyScalar(0.5);
    const size = new Vector3().subVectors(bbox.max, bbox.min);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.5 / maxDim;

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));

    // Try to orient keyboard flat-ish; flip Y if model is vertical
    if (size.y > size.x * 0.6) {
      // Model appears vertical — rotate to lay flat
      model.rotation.x = -Math.PI / 2;
    }

    _scene.add(model);

    // ---- Animation loop ----
    // Skip the draw whenever the viewer is offscreen. The scene auto-rotates,
    // so an unpaused loop keeps burning GPU for the rest of the session after
    // the visitor scrolls past the model.
    if (typeof IntersectionObserver !== 'undefined') {
      const view = new IntersectionObserver((entries) => {
        for (const entry of entries) _frameEnabled = entry.isIntersecting;
      }, { rootMargin: '100px' });
      view.observe(container);
      _viewObservers.push(view);
      _cleanupFns.push(() => {
        view.disconnect();
        _viewObservers = _viewObservers.filter((observer) => observer !== view);
      });
    }

    const animate = () => {
      if (_destroyed) return;
      _animationId = requestAnimationFrame(animate);
      if (!_frameEnabled) return;
      _controls.update();
      _renderer.render(_scene, _camera);
    };
    animate();

    // ---- Resize handling ----
    const onResize = () => {
      if (_destroyed || !_renderer) return;
      const r = container.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      _camera.aspect = r.width / r.height;
      _camera.updateProjectionMatrix();
      _renderer.setSize(r.width, r.height);
    };
    window.addEventListener('resize', onResize);
    _cleanupFns.push(() => window.removeEventListener('resize', onResize));

    // Use ResizeObserver for container-level size changes
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(onResize);
      ro.observe(container);
      _cleanupFns.push(() => ro.disconnect());
    }

  } catch (err) {
    console.warn('[WITF Viewer] Failed to load 3D model, falling back to poster:', err);
    loadingEl.remove();
    showPoster(container);
  }
}

/**
 * Initialise the WITF viewer for a container, deferring the model payload.
 *
 * three.js is ~1.31 MB raw (~265 KB gzip), OrbitControls + GLTFLoader add
 * ~30 KB gzip, and the GLB is 2.67 MB. That is ~3 MB of third-party payload
 * that the landing page used to fetch during the first idle callback, before
 * the visitor had scrolled anywhere near the model. The imports now wait until
 * the container is within VIEWER_GATE_MARGIN of the viewport.
 */
export async function initWitfViewer(containerId = 'witf-viewer') {
  if (_destroyed) _destroyed = false;

  const container = document.getElementById(containerId);
  if (!container) return;

  _container = container;

  // Guard: WebGL + motion
  if (!webglSupported() || prefersReducedMotion()) {
    showPoster(container);
    return;
  }

  if (typeof IntersectionObserver !== 'undefined') {
    const gate = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      gate.disconnect();
      if (_gateObserver === gate) _gateObserver = null;
      startWitfViewer(container);
    }, { rootMargin: VIEWER_GATE_MARGIN });
    _gateObserver = gate;
    gate.observe(container);
    return;
  }

  await startWitfViewer(container);
}
