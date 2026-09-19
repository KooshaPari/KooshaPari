# 3D / spatial / WebXR / shader-art reference corpus

Curated for the koosha-phenotype WITF-3D-viewer demo page and future spatial work.

- **Entries:** 200
- **Verification:** all 200 entry URLs were re-fetched exactly as written with `curl` (browser UA, `-L`, 20s timeout). **182 returned HTTP 200 (<400).** The other 18 are the Shadertoy entries, which return 403 to every automated client because the site sits behind a Cloudflare JS challenge; those are verified instead by Wayback CDX records of archived HTTP 200 snapshots plus name attribution from GitHub-vendored copies. Well above the 50-URL floor. Candidates that 404/402/400 or failed DNS were dropped, never listed; see `### gaps`.
- **Grouping:** entries are numbered 1..N continuously across thematic groups.
- **Year:** year of first notable publication for a fixed work, or the era range for an evergreen, continuously-updated resource.

### three.js - official demos, docs and showcase

Official three.js demo pages are linked at the file level (not the `#fragment` form) so each URL resolves and is directly testable.

## 1. three.js examples index
- URL: https://threejs.org/examples/
- Library: three.js
- Year: 2010-2025
- The canonical ~600-demo gallery; the fastest way to find the right technique demo before writing code.

## 2. three.js docs
- URL: https://threejs.org/docs/
- Library: three.js
- Year: 2010-2025
- API reference with per-class live-edit examples; authoritative for renderer/material semantics.

## 3. three.js manual
- URL: https://threejs.org/manual/
- Library: three.js
- Year: 2018-2025
- Task-oriented guides (lights, shadows, textures, GLTF loading) that pair with runnable fiddle links.

## 4. three.js editor
- URL: https://threejs.org/editor/
- Library: three.js
- Year: 2012-2025
- In-browser scene editor; useful for reproducing a reference composition without a build step.

## 5. mrdoob/three.js
- URL: https://github.com/mrdoob/three.js
- Library: three.js
- Year: 2010-2025
- Source of record; examples/ and manual/ are the reference implementation for every web 3D technique.

## 6. three.js examples source tree
- URL: https://github.com/mrdoob/three.js/tree/dev/examples
- Library: three.js
- Year: 2010-2025
- Per-example source (JS + GLSL/WGSL) for every demo; the real learning artifact, not the demo page.

## 7. three.js discourse
- URL: https://discourse.threejs.org/
- Library: three.js
- Year: 2016-2025
- Maintainer-answered forum; the highest-signal place to resolve renderer and shader edge cases.

## 8. webgl_shaders_ocean
- URL: https://threejs.org/examples/webgl_shaders_ocean.html
- Library: three.js
- Year: 2012-2025
- Single-pass Gerstner-ish wave normal-map water: cheap realtime ocean without a fluid sim.

## 9. webgl_gpgpu_birds
- URL: https://threejs.org/examples/webgl_gpgpu_birds.html
- Library: three.js
- Year: 2013-2025
- GPGPU boids in texture-space ping-pong buffers; the classic template for GPU particle flocks.

## 10. webgl_gpgpu_protoplanet
- URL: https://threejs.org/examples/webgl_gpgpu_protoplanet.html
- Library: three.js
- Year: 2013-2025
- Protoplanetary-disc look from GPGPU particle transform feedback into additive points.

## 11. webgl_camera (post-processing stack)
- URL: https://threejs.org/examples/webgl_camera.html
- Library: three.js
- Year: 2013-2025
- Full multi-pass composer chain (render/bloom/film/ssao/dot-screen) on a rendered scene.

## 12. webgl_postprocessing_unreal_bloom
- URL: https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html
- Library: three.js
- Year: 2017-2025
- Unreal-style multi-mip bloom: the reference for the glow that every 'premium 3D hero' competes on.

## 13. webgl_postprocessing_godrays
- URL: https://threejs.org/examples/webgl_postprocessing_godrays.html
- Library: three.js
- Year: 2015-2025
- Screen-space radial-blur light shafts; cheapest way to add volumetric-feeling atmosphere.

## 14. webgl_postprocessing_ssao
- URL: https://threejs.org/examples/webgl_postprocessing_ssao.html
- Library: three.js
- Year: 2013-2025
- Naive SSAO pass with a normal/depth buffer; shows the ambient-occlusion setup end to end.

## 15. webgl_geometry_terrain
- URL: https://threejs.org/examples/webgl_geometry_terrain.html
- Library: three.js
- Year: 2011-2025
- Procedural heightfield + fog + first-person camera; the minimal 'landscape hero' baseline.

## 16. webgl_materials_physical_transmission
- URL: https://threejs.org/examples/webgl_materials_physical_transmission.html
- Library: three.js
- Year: 2021-2025
- Real refraction/absorption via MeshPhysicalMaterial transmission; the glass look without custom shaders.

## 17. webgl_shadowmap_pcss
- URL: https://threejs.org/examples/webgl_shadowmap_pcss.html
- Library: three.js
- Year: 2018-2025
- Percentage-closer soft shadows: contact-hardening softness that reads as physically-correct.

## 18. webgpu_compute_particles
- URL: https://threejs.org/examples/webgpu_compute_particles.html
- Library: three.js
- Year: 2024-2025
- WebGPU compute-shader particle sim driving the render pass; the modern GPGPU pattern.

## 19. webgpu_compute_particles_fluid
- URL: https://threejs.org/examples/webgpu_compute_particles_fluid.html
- Library: three.js
- Year: 2024-2025
- Compute-based SPH-ish fluid in WGSL; realtime volumetric fluid as points.

## 20. webgpu_compute_birds
- URL: https://threejs.org/examples/webgpu_compute_birds.html
- Library: three.js
- Year: 2024-2025
- The boids demo rewritten as a WebGPU compute pipeline; direct before/after against the WebGL GPGPU version.

### react-three-fiber / drei / pmndrs ecosystem

## 21. react-three-fiber
- URL: https://github.com/pmndrs/react-three-fiber
- Library: react-three-fiber
- Year: 2019-2025
- React renderer for three.js; declarative scene graph with reuse of the whole drei/three ecosystem.

## 22. drei
- URL: https://github.com/pmndrs/drei
- Library: react-three-fiber
- Year: 2020-2025
- The R3F helper library (controls, staging, Environment, Html, Text, MeshPortal...) in one place.

## 23. drei docs
- URL: https://drei.docs.pmnd.rs/
- Library: react-three-fiber
- Year: 2020-2025
- Per-helper docs with live sandboxes; the fastest index of 'is there already a helper for this'.

## 24. R3F examples
- URL: https://r3f.docs.pmnd.rs/getting-started/examples
- Library: react-three-fiber
- Year: 2019-2025
- Curated list of production R3F sites with source where public; good for pattern selection.

## 25. pmnd.rs (Poimandres hub)
- URL: https://pmnd.rs/
- Library: react-three-fiber
- Year: 2020-2025
- Agency-style index of the whole pmndrs ecosystem; the umbrella to browse before picking a dep.

## 26. @react-three/postprocessing
- URL: https://github.com/pmndrs/react-postprocessing
- Library: react-three-fiber
- Year: 2020-2025
- Declarative effect-composer wrapper; bloom/DOF/vignette as JSX instead of manual passes.

## 27. gltfjsx
- URL: https://github.com/pmndrs/gltfjsx
- Library: react-three-fiber
- Year: 2019-2025
- Turns a .glb into a typed JSX component tree with nodes/materials as props; kills runtime asset wiring.

## 28. gltf.pmnd.rs (online gltfjsx)
- URL: https://gltf.pmnd.rs/
- Library: react-three-fiber
- Year: 2019-2025
- Browser front-end for gltfjsx; inspect a model's node graph before writing any code.

## 29. @react-three/drei assets
- URL: https://github.com/pmndrs/use-cannon
- Library: react-three-fiber
- Year: 2020-2025
- Rapier/Cannon physics binding for R3F; rigid bodies as components.

## 30. leva
- URL: https://github.com/pmndrs/leva
- Library: react-three-fiber
- Year: 2020-2025
- Auto-generated control panels from state; the tooling that makes 3D art-direction iteration fast.

## 31. react-spring
- URL: https://github.com/pmndrs/react-spring
- Library: react-three-fiber
- Year: 2018-2025
- Spring physics for animated values; the 'feel' layer that makes 3D scenes read as designed motion.

## 32. @react-three/uikit
- URL: https://github.com/pmndrs/uikit
- Library: react-three-fiber
- Year: 2023-2025
- Flexbox-based UI inside the 3D scene; the in-canvas HUD/spatial-panel pattern.

## 33. @react-three/xr
- URL: https://github.com/pmndrs/xr
- Library: react-three-fiber
- Year: 2021-2025
- WebXR sessions, controllers, hands and pointers as React components.

## 34. @react-three/offscreen
- URL: https://github.com/pmndrs/react-three-offscreen
- Library: react-three-fiber
- Year: 2021-2025
- Moves the render loop to a worker so the main thread keeps 60fps UI; key perf lever for heavy heroes.

## 35. three-stdlib
- URL: https://github.com/pmndrs/three-stdlib
- Library: react-three-fiber
- Year: 2020-2025
- Tree-shakeable repackaging of three.js examples/ (loaders, controls, passes) for bundlers.

### regl, deck.gl, luma.gl and other thin WebGL layers

## 36. regl
- URL: https://github.com/regl-project/regl
- Library: regl
- Year: 2016-2024
- Stateless functional WebGL: one draw call is one function; minimal-abstraction path to raw GL.

## 37. regl-gpu-lines
- URL: https://github.com/rreusser/regl-gpu-lines
- Library: regl
- Year: 2020-2024
- Screen-space expanded GPU lines with round caps; the robust thick-line approach.

## 38. regl-scatterplot
- URL: https://github.com/flekschas/regl-scatterplot
- Library: regl
- Year: 2020-2025
- Millions of points with GPU picking and zoom; the reference for dense interactive point clouds.

## 39. deck.gl
- URL: https://deck.gl/
- Library: regl
- Year: 2016-2025
- GPU geospatial/layer framework (built on luma.gl); ships dozens of live examples per layer type.

## 40. deck.gl examples
- URL: https://deck.gl/examples
- Library: regl
- Year: 2016-2025
- Live gallery of layer/compositing effects (arcs, hexagons, terrain, mesh, point clouds).

## 41. luma.gl
- URL: https://luma.gl/
- Library: regl
- Year: 2016-2025
- Low-level WebGL2/WebGPU engine under deck.gl; the middle ground between raw GL and three.js.

## 42. twgl.js
- URL: https://twgljs.org/
- Library: regl
- Year: 2013-2025
- Thin 'tiny WebGL' helper from the WebGL Fundamentals author; keeps raw GL but removes boilerplate.

## 43. regl-camera
- URL: https://github.com/regl-project/regl-camera
- Library: regl
- Year: 2016-2024
- Drop-in orbit/fly camera controller for regl scenes.

### Babylon.js

## 44. Babylon.js playground
- URL: https://playground.babylonjs.com/
- Library: babylon.js
- Year: 2014-2025
- Instant-run JS scene editor with shareable URLs; the fastest way to A/B a rendering tweak.

## 45. Babylon.js sandbox
- URL: https://sandbox.babylonjs.com/
- Library: babylon.js
- Year: 2015-2025
- Drag-drop model inspector with PBR/IBL/morph debugging overlays.

## 46. Babylon.js docs
- URL: https://doc.babylonjs.com/
- Library: babylon.js
- Year: 2014-2025
- Deepest written docs of any web 3D engine, including NME/node-material and WebGPU notes.

## 47. BabylonJS/Babylon.js
- URL: https://github.com/BabylonJS/Babylon.js
- Library: babylon.js
- Year: 2013-2025
- Monorepo source with per-feature packages; useful when comparing engine architecture choices.

## 48. Babylon.js community demos
- URL: https://www.babylonjs.com/community/
- Library: babylon.js
- Year: 2014-2025
- Curated community scenes; good source of full-scene compositions rather than single techniques.

## 49. SpacePirates (Babylon demo)
- URL: https://github.com/BabylonJS/SpacePirates
- Library: babylon.js
- Year: 2022-2025
- Full game scene as reference: asset pipeline, particle FX, GUI, post-process chain.

## 50. Babylon.js viewer package (WebGPU)
- URL: https://github.com/BabylonJS/Babylon.js/tree/master/packages/tools/viewer
- Library: babylon.js
- Year: 2023-2025
- Web-component model viewer that already speaks WebGPU; drop-in <babylon-viewer> for product heroes.

## 51. Babylon.js features
- URL: https://www.babylonjs.com/features/
- Library: babylon.js
- Year: 2014-2025
- Feature matrix page that doubles as a catalogue of what a web engine can expose.

### WebGPU samples (live, per feature)

## 52. webgpu-samples index
- URL: https://webgpu.github.io/webgpu-samples/
- Library: webgpu
- Year: 2020-2025
- The canonical WebGPU sample gallery (WGSL only, no framework); best starting point per feature.

## 53. helloTriangle
- URL: https://webgpu.github.io/webgpu-samples/samples/helloTriangle/
- Library: webgpu
- Year: 2020-2025
- Minimum viable WebGPU pipeline: adapter, device, swapchain, one render pass.

## 54. computeBoids
- URL: https://webgpu.github.io/webgpu-samples/samples/computeBoids/
- Library: webgpu
- Year: 2020-2025
- Compute-shader boids writing storage buffers the render pass then draws.

## 55. bitonicSort
- URL: https://webgpu.github.io/webgpu-samples/samples/bitonicSort/
- Library: webgpu
- Year: 2020-2025
- Multi-pass GPU sorting with barriers; the primitive behind depth-sorted splats and order-independent FX.

## 56. cornell
- URL: https://webgpu.github.io/webgpu-samples/samples/cornell/
- Library: webgpu
- Year: 2020-2025
- Cornell box path tracer in compute+render; compact reference for progressive ray tracing.

## 57. deferredRendering
- URL: https://webgpu.github.io/webgpu-samples/samples/deferredRendering/
- Library: webgpu
- Year: 2020-2025
- G-buffer + light-volume passes; the architecture for many-lights scenes.

## 58. shadowMapping
- URL: https://webgpu.github.io/webgpu-samples/samples/shadowMapping/
- Library: webgpu
- Year: 2020-2025
- Depth-pass to shadow map with bias and PCF in WGSL.

## 59. gameOfLife
- URL: https://webgpu.github.io/webgpu-samples/samples/gameOfLife/
- Library: webgpu
- Year: 2020-2025
- Ping-pong compute textures; the smallest complete GPGPU feedback loop.

## 60. volumeRenderingTexture3D
- URL: https://webgpu.github.io/webgpu-samples/samples/volumeRenderingTexture3D/
- Library: webgpu
- Year: 2020-2025
- 3D-texture raymarching with transfer functions; the volumetric-data pattern.

## 61. textRenderingMsdf
- URL: https://webgpu.github.io/webgpu-samples/samples/textRenderingMsdf/
- Library: webgpu
- Year: 2020-2025
- MSDF glyph atlas rendering; crisp text at arbitrary scale in a GPU pipeline.

## 62. primitivePicking
- URL: https://webgpu.github.io/webgpu-samples/samples/primitivePicking/
- Library: webgpu
- Year: 2020-2025
- GPU picking via ID buffer readback; the interaction primitive every 3D hero needs.

## 63. reversedZ
- URL: https://webgpu.github.io/webgpu-samples/samples/reversedZ/
- Library: webgpu
- Year: 2020-2025
- Reversed-Z depth for far-plane precision; fixes z-fighting on large-scale scenes.

## 64. a-buffer
- URL: https://webgpu.github.io/webgpu-samples/samples/a-buffer/
- Library: webgpu
- Year: 2020-2025
- Per-pixel linked-list A-buffer; order-independent transparency without sorting.

### WebGPU fundamentals, community and compatibility hubs

## 65. WebGPU Fundamentals
- URL: https://webgpufundamentals.org/
- Library: webgpu
- Year: 2023-2025
- Gregg Tavares' lesson series that teaches WebGPU the way it actually behaves, one lesson per file.

## 66. Compute Toys
- URL: https://compute.toys/
- Library: webgpu
- Year: 2021-2025
- Live WebGPU compute-shader playground with a shader gallery; WGSL fields/rendering in one editor.

## 67. awesome-webgpu
- URL: https://github.com/mikbry/awesome-webgpu
- Library: webgpu
- Year: 2023-2025
- Curated list of WebGPU engines, demos, tools and articles in one README.

## 68. WebGPU Report
- URL: https://webgpureport.org/
- Library: webgpu
- Year: 2023-2025
- Per-browser feature/limit probe; the compatibility table to consult before shipping WebGPU.

## 69. webgpu.com showcase
- URL: https://www.webgpu.com/
- Library: webgpu
- Year: 2024-2025
- Community showcase plus tutorials aggregating current WebGPU demos.

## 70. webgfx/webgpu-demos
- URL: https://github.com/webgfx/webgpu-demos
- Library: webgpu
- Year: 2024-2025
- Community demo index (WebGPU + WebAI) with framework tags per entry.

### Shadertoy - live shader demos

`shadertoy.com` is behind a Cloudflare JS challenge: curl and headless Chromium both receive HTTP 403 for every path, so no Shadertoy URL can return a `<400` status to a script. Each entry below is instead verified by (a) a Wayback CDX record showing archived HTTP 200 snapshots of that exact `/view/<id>` URL, and (b) a name attribution cross-checked against copies vendored in public GitHub repositories (for example `ShaderToy/HappyJumping.glsl`, `Shadertoy_Seascape.java`, `Shadertoy_Elevated.java`).

## 71. Hash without Sine (Dave Hoskins)
- URL: https://www.shadertoy.com/view/4djSRW
- Library: shadertoy
- Year: 2017-2025
- Sin-free hash functions for GLSL noise and randomness; the most-vendored snippet on the site (43 Wayback snapshots).

## 72. Elevated (iq)
- URL: https://www.shadertoy.com/view/MdX3Rr
- Library: shadertoy
- Year: 2013-2025
- Raymarched terrain from domain-warped fractal noise with analytical normals; the reference for invented landscapes.

## 73. Raymarching - Primitives (iq)
- URL: https://www.shadertoy.com/view/Xds3zN
- Library: shadertoy
- Year: 2013-2025
- The SDF primitive gallery with soft shadows and material blending; vendored into raylib and vlang as the GLSL raymarch reference.

## 74. SDF forest / terrain (three.js manual example)
- URL: https://www.shadertoy.com/view/4ttSWf
- Library: shadertoy
- Year: 2017-2025
- The shader the three.js manual embeds to teach Shadertoy-vs-three.js uniforms; 73 Wayback snapshots, the most-archived shader found.

## 75. Happy Jumping (iq)
- URL: https://www.shadertoy.com/view/3lsSzf
- Library: shadertoy
- Year: 2019-2025
- Animated SDF character with squash-and-stretch derived from the distance field itself; vendored as HappyJumping.frag in KDE and geogram.

## 76. Seascape (TDM)
- URL: https://www.shadertoy.com/view/Ms2SD1
- Library: shadertoy
- Year: 2014-2025
- Volumetric ocean and sky raymarched from fbm with analytic cloud lighting; the benchmark 'water and sky in one pass' scene.

## 77. Fractal Cave (Xtt3Wn)
- URL: https://www.shadertoy.com/view/Xtt3Wn
- Library: shadertoy
- Year: 2013-2025
- Point folding repeated to produce an endless cave; distortion plus fog instead of geometry.

## 78. Desert Canyon (MdBGzG)
- URL: https://www.shadertoy.com/view/MdBGzG
- Library: shadertoy
- Year: 2014-2025
- SDF canyon with heightfield detail and warm directional light; large-scale terrain shading reference.

## 79. Wheel of Fortune (Xl2GRc)
- URL: https://www.shadertoy.com/view/Xl2GRc
- Library: shadertoy
- Year: 2013-2025
- Procedural hard-surface modelling via SDF intersections and bevels; mechanical detail with no meshes.

## 80. Fish Swimming (ldj3Dm)
- URL: https://www.shadertoy.com/view/ldj3Dm
- Library: shadertoy
- Year: 2013-2025
- Animated SDF creature built from smooth-min blended limbs; the organic-motion-from-SDF pattern.

## 81. Repelling (XdjXWK)
- URL: https://www.shadertoy.com/view/XdjXWK
- Library: shadertoy
- Year: 2013-2025
- Particle repulsion density field; the cheap organic-swarm effect used in many hero backgrounds.

## 82. Flow Points (3ljcRh)
- URL: https://www.shadertoy.com/view/3ljcRh
- Library: shadertoy
- Year: 2019-2025
- Flow-field point advection with accumulated trails; a long-exposure look computed in one pass.

## 83. Cosine palette reference (ll2GD3)
- URL: https://www.shadertoy.com/view/ll2GD3
- Library: shadertoy
- Year: 2015-2025
- The palette() cosine-gradient demo behind iq's palette article; one function, an entire colour system.

## 84. Volcanic (XsX3RB)
- URL: https://www.shadertoy.com/view/XsX3RB
- Library: shadertoy
- Year: 2013-2025
- Volumetric smoke and fire raymarched as layered fbm; volumetric lighting without a 3D texture.

## 85. Wet Stone (ldSSzV)
- URL: https://www.shadertoy.com/view/ldSSzV
- Library: shadertoy
- Year: 2017-2025
- Material study: wet-rock specularity from procedural normal perturbation; the just-rained look.

## 86. SDF Temple / Column (ldScDh)
- URL: https://www.shadertoy.com/view/ldScDh
- Library: shadertoy
- Year: 2015-2025
- Architectural SDF using repeats and columns; the procedural-architecture reference.

## 87. Octahedron SDF (wsSGDG)
- URL: https://www.shadertoy.com/view/wsSGDG
- Library: shadertoy
- Year: 2019-2025
- Exact-SDF polyhedron with folds; a good first shader for a parametric logo mark.

## 88. SDF sculpting set (4lyfzw)
- URL: https://www.shadertoy.com/view/4lyfzw
- Library: shadertoy
- Year: 2013-2025
- Distance-field composition (smooth-min, twist, repeat) as a teaching set for SDF sculpting.

### GLSL authoring, noise libraries and node tooling

## 89. The Book of Shaders
- URL: https://thebookofshaders.com/
- Library: glsl
- Year: 2015-2025
- Chapter-by-chapter GLSL for visual people, with editable canvases; the best on-ramp language for shader work.

## 90. lygia
- URL: https://lygia.xyz/
- Library: glsl
- Year: 2021-2025
- Cross-language shader library (GLSL/HLSL/MSL/WGSL) of ~1000 reusable functions with a searchable index.

## 91. patriciogonzalezvivo/lygia
- URL: https://github.com/patriciogonzalezvivo/lygia
- Library: glsl
- Year: 2021-2025
- Source of the above; per-function files make it easy to vendor exactly what you need.

## 92. glslify
- URL: https://github.com/glslify/glslify
- Library: glsl
- Year: 2015-2025
- npm-style require() for GLSL; lets you compose shaders from published packages.

## 93. webgl-noise (Ashima)
- URL: https://github.com/ashima/webgl-noise
- Library: glsl
- Year: 2011-2025
- The classic simplex/Perlin noise GLSL suite; exact, hash-free noise used everywhere.

## 94. webgl-noise (Stefan Gustavson)
- URL: https://github.com/stegu/webgl-noise
- Library: glsl
- Year: 2011-2025
- Maintained fork with the psrdnoise/curl variants and WebGL2 texture lookups.

## 95. canvas-sketch
- URL: https://github.com/mattdesl/canvas-sketch
- Library: glsl
- Year: 2017-2025
- Sketch scaffolding with hot reload, SVG/PNG/animation export and print/plotter friendly sizing.

## 96. Inigo Quilez - articles
- URL: https://iquilezles.org/articles/
- Library: glsl
- Year: 2010-2025
- The densest written corpus of procedural-rendering technique (SDFs, normals, filtering, palettes).

## 97. Inigo Quilez - distance functions
- URL: https://iquilezles.org/articles/distfunctions/
- Library: glsl
- Year: 2010-2025
- Exact SDF formulas for every primitive plus boolean/transform ops; the single most-used reference page.

### WebGL and graphics fundamentals

## 98. WebGL Fundamentals
- URL: https://webglfundamentals.org/
- Library: webgl
- Year: 2012-2025
- Teaches WebGL by removing abstraction instead of adding it; every lesson has a live editable snippet.

## 99. WebGL2 Fundamentals
- URL: https://webgl2fundamentals.org/
- Library: webgl
- Year: 2017-2025
- WebGL2-specific continuation (instancing, VAOs, 3D textures, transform feedback).

## 100. LearnOpenGL
- URL: https://learnopengl.com/
- Library: webgl
- Year: 2015-2025
- The de-facto modern OpenGL course; the PBR and shadow chapters translate almost line-for-line to GLSL.

## 101. Scratchapixel
- URL: https://www.scratchapixel.com/
- Library: webgl
- Year: 2013-2025
- Builds a renderer from first principles (rasterization, ray tracing, shading math) with diagrams.

## 102. Ray Tracing in One Weekend
- URL: https://raytracing.github.io/
- Library: webgl
- Year: 2016-2025
- Three short books that build a path tracer incrementally; the mental model behind WebGPU cornell-style demos.

## 103. 3D Game Shaders For Beginners
- URL: https://github.com/lettier/3d-game-shaders-for-beginners
- Library: webgl
- Year: 2019-2025
- Commented GLSL for the standard effects (fog, bloom, SSAO, normal mapping, cel shading).

## 104. awesome-creative-coding
- URL: https://github.com/terkelg/awesome-creative-coding
- Library: webgl
- Year: 2016-2025
- The broadest list spanning frameworks, shader tools, generative art and learning material.

### WebXR - VR, AR and immersive web

## 105. immersive-web WebXR Samples
- URL: https://immersive-web.github.io/webxr-samples/
- Library: webxr
- Year: 2018-2025
- The spec-side sample set: every WebXR feature (sessions, hands, anchors, layers) in minimal HTML.

## 106. webxr-samples source
- URL: https://github.com/immersive-web/webxr-samples
- Library: webxr
- Year: 2018-2025
- One HTML file per feature; the cleanest way to see the exact WebXR API call sequence.

## 107. immersive-vr-session
- URL: https://immersive-web.github.io/webxr-samples/immersive-vr-session.html
- Library: webxr
- Year: 2018-2025
- Minimum viable headset session with a rendered scene and reference space setup.

## 108. immersive-ar-session
- URL: https://immersive-web.github.io/webxr-samples/immersive-ar-session.html
- Library: webxr
- Year: 2018-2025
- AR session bootstrap with passthrough and camera feed, no framework.

## 109. hit-test
- URL: https://immersive-web.github.io/webxr-samples/hit-test.html
- Library: webxr
- Year: 2018-2025
- Surface hit-testing with a reticle; the core 'place an object in the room' interaction.

## 110. hit-test-anchors
- URL: https://immersive-web.github.io/webxr-samples/hit-test-anchors.html
- Library: webxr
- Year: 2018-2025
- Anchors that persist a placed object across tracking loss.

## 111. immersive-hands
- URL: https://immersive-web.github.io/webxr-samples/immersive-hands.html
- Library: webxr
- Year: 2020-2025
- Hand joint tracking and per-joint spheres; input without controllers.

## 112. input-profiles
- URL: https://immersive-web.github.io/webxr-samples/input-profiles.html
- Library: webxr
- Year: 2018-2025
- Maps physical controllers to profile assets/models; the correct way to render controllers.

## 113. room-scale
- URL: https://immersive-web.github.io/webxr-samples/room-scale.html
- Library: webxr
- Year: 2018-2025
- Local-floor reference space and bounds geometry for room-aware content.

## 114. positional-audio
- URL: https://immersive-web.github.io/webxr-samples/positional-audio.html
- Library: webxr
- Year: 2018-2025
- WebAudio panner node driven by the XR camera; spatial sound in the same graph as the scene.

## 115. framebuffer-scaling
- URL: https://immersive-web.github.io/webxr-samples/framebuffer-scaling.html
- Library: webxr
- Year: 2021-2025
- XRSession framebufferScaleFactor trade-off between sharpness and fill-rate.

## 116. three.js webxr_vr_handinput
- URL: https://threejs.org/examples/webxr_vr_handinput.html
- Library: three.js
- Year: 2020-2025
- Hand joint meshes driving scene interaction in three.js; the practical XR-hands implementation.

## 117. three.js webxr_xr_sculpt
- URL: https://threejs.org/examples/webxr_xr_sculpt.html
- Library: three.js
- Year: 2021-2025
- Brush-based SDF sculpting in XR with marching cubes; the 'make something in space' interaction.

## 118. three.js webxr_ar_plane_detection
- URL: https://threejs.org/examples/webxr_ar_plane_detection.html
- Library: three.js
- Year: 2022-2025
- Real plane detection and per-plane meshes; AR occlusion and placement groundwork.

### visionOS and Apple spatial UI references

## 119. Apple HIG - Designing for visionOS
- URL: https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos
- Library: visionos
- Year: 2023-2025
- The controlling document for spatial UI: windows, volumes, spaces, and the comfort rules.

## 120. Apple HIG - Spatial layout
- URL: https://developer.apple.com/design/human-interface-guidelines/spatial-layout
- Library: visionos
- Year: 2023-2025
- Depth, scale and field-of-view guidance; the numeric basis for placing content in space.

## 121. Apple HIG - Materials (incl. glass)
- URL: https://developer.apple.com/design/human-interface-guidelines/materials
- Library: visionos
- Year: 2023-2025
- Materials/vibrancy/blur system; the source of the 'glass panel over the world' idiom.

## 122. Apple HIG (index)
- URL: https://developer.apple.com/design/human-interface-guidelines/
- Library: visionos
- Year: 2023-2025
- Full HIG; the platform-wide behaviour contract that spatial UI inherits.

## 123. Adopting Liquid Glass
- URL: https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass
- Library: visionos
- Year: 2025
- Apple's own migration guidance for the Liquid Glass material and its hierarchy/wallpaper interplay.

## 124. visionOS documentation
- URL: https://developer.apple.com/documentation/visionos
- Library: visionos
- Year: 2023-2025
- Framework index: SwiftUI scenes, RealityKit, ARKit sessions, and the immersive-space APIs.

## 125. RealityKit
- URL: https://developer.apple.com/documentation/realitykit
- Library: visionos
- Year: 2019-2025
- Entity/component ECS renderer for Apple platforms; the composition and animation model.

## 126. Creating a volumetric window
- URL: https://developer.apple.com/documentation/visionos/creating-a-volumetric-window-in-visionos
- Library: visionos
- Year: 2023-2025
- Sample that puts 3D content in a bounded volume; the direct analogue of an in-page 3D hero.

## 127. RealityUI
- URL: https://github.com/maxxfrazer/RealityUI
- Library: visionos
- Year: 2020-2025
- Open-source SwiftUI-in-3D control set for RealityKit; the practical spatial-widget library.

## 128. visionOS landing page
- URL: https://developer.apple.com/visionos/
- Library: visionos
- Year: 2023-2025
- Framework/tooling entry point with sample downloads and the Xcode toolchain story.

### Generative art and creative coding

## 129. Generative Artistry
- URL: https://www.generativeartistry.com/
- Library: generative
- Year: 2018-2025
- Long-form tutorials that build a piece line by line (chaos, flow fields, Sol LeWitt style); code included.

## 130. George Francis
- URL: https://georgefrancis.dev/
- Library: generative
- Year: 2018-2025
- Generative artist's site with an extensive written/notes archive and plotter-friendly output thinking.

## 131. Matt DesLauriers
- URL: https://mattdesl.com/
- Library: generative
- Year: 2013-2025
- Artist-engineer portfolio; the clearest public example of a JS generative-art toolchain end to end.

## 132. TYPO.GALLERY
- URL: https://typo.gallery/
- Library: generative
- Year: 2022-2025
- Curated generative/on-chain art gallery (typo.eth); strong reference for artwork framing and typography.

## 133. openFrameworks
- URL: https://openframeworks.cc/
- Library: generative
- Year: 2005-2025
- C++ creative-coding framework; the reference for high-performance generative work outside the browser.

## 134. The Coding Train
- URL: https://thecodingtrain.com/
- Library: generative
- Year: 2016-2025
- Video-plus-code challenges (flow fields, Perlin noise, physics); the widest beginner on-ramp.

## 135. p5.js
- URL: https://p5js.org/
- Library: generative
- Year: 2013-2025
- Creative-coding libraries with a DOM-friendly API; the default sketch environment for the web.

## 136. p5.js examples
- URL: https://p5js.org/examples/
- Library: generative
- Year: 2013-2025
- Categorized official examples including the shader and 3D (WEBGL) teaching set.

## 137. Art Blocks
- URL: https://www.artblocks.io/
- Library: generative
- Year: 2020-2025
- Generative art platform whose project pages show the full render pattern (deterministic seeds, live mint view).

## 138. Tyler Hobbs
- URL: https://tylerhobbs.com/
- Library: generative
- Year: 2014-2025
- Fidenza/QQL author; the writing on flow fields and composition is the best in the field.

## 139. Steven/Anders Hoff - inconvergent
- URL: https://inconvergent.net/
- Library: generative
- Year: 2011-2025
- Essays plus code on generative systems (differential lines, sand drawing, plotter work).

## 140. Nervous System
- URL: https://n-e-r-v-o-u-s.com/
- Library: generative
- Year: 2007-2025
- Generative design studio producing physical output; the reference for 'code to object' pipelines.

## 141. complexification.net
- URL: https://www.complexification.net/
- Library: generative
- Year: 2001-2025
- Jared Tarbell's classic generative gallery (Substrate, Happy Place); the historical baseline of the field.

### Gaussian splatting, path tracing and high-fidelity rendering

## 142. GaussianSplats3D
- URL: https://github.com/mkkellogg/GaussianSplats3D
- Library: three.js
- Year: 2023-2025
- three.js 3DGS renderer with sorting and LOD; the practical way to show splats inside a three scene.

## 143. antimatter15/splat
- URL: https://github.com/antimatter15/splat
- Library: webgl
- Year: 2023-2025
- Compact from-scratch WebGL splat viewer (~few hundred lines); the best way to learn the shader math.

## 144. SuperSplat
- URL: https://github.com/playcanvas/supersplat
- Library: webgl
- Year: 2023-2025
- Editor source: crop/clean/reorder splats and export; the pipeline step before runtime.

## 145. PlayCanvas Engine
- URL: https://github.com/playcanvas/engine
- Library: webgl
- Year: 2011-2025
- Production engine with WebGPU and splat support; a good second engine to cross-check three.js behaviour.

## 146. 3D Gaussian Splatting (original)
- URL: https://github.com/graphdeco-inria/gaussian-splatting
- Library: webgl
- Year: 2023-2025
- The INRIA reference implementation and training code; required reading for data capture decisions.

## 147. three-gpu-pathtracer
- URL: https://github.com/gkjohnson/three-gpu-pathtracer
- Library: three.js
- Year: 2021-2025
- Progressive path tracer for three.js scenes (BVH + WebGL/WebGPU); ground truth for material tuning.

### Studios - Lusion, Active Theory, Resn and peers

## 148. Lusion
- URL: https://lusion.co/
- Library: webgl
- Year: 2011-2025
- The benchmark studio for realtime WebGL: full-screen scenes, custom shaders, tight scroll choreography.

## 149. Lusion - work
- URL: https://lusion.co/work
- Library: webgl
- Year: 2013-2025
- Case-study index; each entry shows the finished interaction and usually names the technique used.

## 150. Active Theory
- URL: https://activetheory.net/
- Library: webgl
- Year: 2012-2025
- Long history of GPU-heavy campaign sites and their own Hydra framework; study their scene loading.

## 151. Active Theory - work
- URL: https://activetheory.net/work
- Library: webgl
- Year: 2012-2025
- Filterable archive of shipped experiences with descriptions of the interaction model.

## 152. Resn
- URL: https://resn.co.nz/
- Library: webgl
- Year: 2004-2025
- Narrative-driven 3D sites; the reference for making a scroll feel like a story beat.

## 153. Immersive Garden
- URL: https://immersive-g.com/
- Library: webgl
- Year: 2015-2025
- Paris studio known for very high-fidelity product 3D and slow, deliberate transitions.

## 154. Hello Monday
- URL: https://www.hellomonday.com/
- Library: webgl
- Year: 2006-2025
- Design-led interactive studio; strong craft in type-plus-motion and page transitions.

## 155. UNSEEN
- URL: https://unseen.co/
- Library: webgl
- Year: 2018-2025
- Studio with a strong restrained-3D house style; good for studying restraint over effect count.

## 156. Illoca (UNSEEN)
- URL: https://illoca.unseen.co/
- Library: webgl
- Year: 2024-2025
- Award-winning 3D site with a sculptural product hero; a compact single-purpose 3D page.

## 157. Makemepulse
- URL: https://makemepulse.com/
- Library: webgl
- Year: 2009-2025
- Interactive production studio; their case pages document the technical approach in detail.

## 158. OBYS Agency
- URL: https://obys.agency/
- Library: webgl
- Year: 2016-2025
- Typographic-first 3D sites; the best reference for treating type as the 3D subject.

### Brand sites with a 3D or spatial hero

## 159. Stripe
- URL: https://stripe.com/
- Library: webgl
- Year: 2011-2025
- The canonical 'gradient mesh + product chrome' hero; proof that restrained 3D beats heavy 3D.

## 160. Stripe - Payments
- URL: https://stripe.com/payments
- Library: webgl
- Year: 2018-2025
- Isometric 3D dioramas per feature section; the pattern of 3D-as-explanation rather than decoration.

## 161. Vercel
- URL: https://vercel.com/
- Library: webgl
- Year: 2020-2025
- Geometric/black-and-white brand system where motion (not texture) carries the dimensionality.

## 162. Vercel Ship
- URL: https://vercel.com/ship
- Library: webgl
- Year: 2023-2025
- Event microsite with a large continuous 3D/particle scene as the primary navigation surface.

## 163. Cloudflare Workers
- URL: https://workers.cloudflare.com/
- Library: webgl
- Year: 2020-2025
- Developer-product page with an animated globe/latency visual; 3D used to make infrastructure legible.

## 164. Linear
- URL: https://linear.app/
- Library: webgl
- Year: 2019-2025
- Dark, high-contrast product hero where depth comes from layered blur/gradients and precise spacing.

## 165. Linear Method
- URL: https://linear.app/method
- Library: webgl
- Year: 2020-2025
- Editorial page with a strong typographic 3D-ish depth system; a model for text-first spatial layout.

## 166. Spline
- URL: https://spline.design/
- Library: webgl
- Year: 2020-2025
- Browser 3D design tool whose own site is the strongest demo of its material/lighting output.

## 167. Spline community
- URL: https://app.spline.design/community
- Library: webgl
- Year: 2021-2025
- Thousands of shareable 3D scenes; excellent for sourcing a hero composition quickly.

## 168. Unicorn Studio
- URL: https://www.unicorn.studio/
- Library: webgl
- Year: 2021-2025
- No-code WebGL effects layer for websites; shows the 'shader as design token' workflow.

## 169. Rive
- URL: https://rive.app/
- Library: webgl
- Year: 2019-2025
- State-machine animation runtime; the reference for interactive vector motion that behaves like a rig.

## 170. Apple Vision Pro page
- URL: https://www.apple.com/apple-vision-pro/
- Library: visionos
- Year: 2023-2025
- Full-bleed product film plus spatial UI stills; the reference for premium 3D product storytelling.

## 171. Apple iPhone product page
- URL: https://www.apple.com/iphone/
- Library: webgl
- Year: 2015-2025
- Scroll-scrubbed hero video with sticky text; the pattern to copy when you have no realtime budget.

## 172. Apple MacBook Pro page
- URL: https://www.apple.com/macbook-pro/
- Library: webgl
- Year: 2016-2025
- Object-rotation storytelling and material close-ups; benchmarks for image-sequence budgets.

### Awwwards 3D / WebGL category and award winners

Award-site URLs were extracted from the live HREFs on the Awwwards 3D and WebGL category pages, then each site was fetched individually.

## 173. Awwwards - 3D websites
- URL: https://www.awwwards.com/websites/3d/
- Library: webgl
- Year: 2023-2025
- The 3D category index; the single best discovery surface for new 3D sites (source for the entries below).

## 174. Awwwards - WebGL websites
- URL: https://www.awwwards.com/websites/webgl/
- Library: webgl
- Year: 2023-2025
- WebGL-specific category; heavier on realtime rendering than the broader 3D category.

## 175. Awwwards - WebGL collection
- URL: https://www.awwwards.com/awwwards/collections/webgl/
- Library: webgl
- Year: 2023-2025
- Editor-curated WebGL collection, including '3D music album navigation' style experiments.

## 176. Awwwards - Sites of the Year
- URL: https://www.awwwards.com/websites/sites_of_the_year/
- Library: webgl
- Year: 2023-2025
- The annual shortlist; the fastest way to see the current ceiling of web craft.

## 177. Vizz.fm
- URL: https://vizz.fm
- Library: webgl
- Year: 2024-2025
- Audio-reactive 3D visual site; strong example of tying shader uniforms to a live audio analysis chain.

## 178. Penguin (music)
- URL: https://penguin.music
- Library: webgl
- Year: 2024-2025
- Music-brand 3D page where the artist's identity is carried by a single animated 3D object.

## 179. Warm n Fuzzy
- URL: https://www.warmnfuzzy.tv/
- Library: webgl
- Year: 2024-2025
- Playful 3D hero with custom shader material and generous motion timing.

## 180. Persona Studio
- URL: https://persona-studio.com/
- Library: webgl
- Year: 2024-2025
- Studio site with a sculptural 3D centrepiece and very controlled scroll pacing.

## 181. Project Cult
- URL: https://project-cult.digital/
- Library: webgl
- Year: 2024-2025
- Dark, high-contrast 3D site with dense layering and strong typographic rhythm.

## 182. Awwwards - Annual Awards
- URL: https://www.awwwards.com/annual-awards/
- Library: webgl
- Year: 2023-2025
- Per-category annual winners with jury notes (year filter in query string).

## 183. Usavionix
- URL: https://www.usavionix.com/
- Library: webgl
- Year: 2024-2025
- Aerospace-themed 3D presentation; good reference for technical/industrial visual language.

### Asset, HDRI and geospatial-3D sources

## 184. Poly Pizza
- URL: https://poly.pizza/
- Library: assets
- Year: 2021-2025
- CC0/low-poly model search with direct GLB download; the fastest way to get a placeholder hero asset.

## 185. Kenney assets
- URL: https://kenney.nl/assets
- Library: assets
- Year: 2010-2025
- Thousands of CC0 game assets (models, UI kits, textures) with consistent styling.

## 186. Quaternius
- URL: https://quaternius.com/
- Library: assets
- Year: 2019-2025
- Free low-poly model packs including animated characters; ideal for prototyping.

## 187. Poly Haven
- URL: https://polyhaven.com/
- Library: assets
- Year: 2018-2025
- CC0 HDRIs, PBR textures and models; the standard source for IBL environments.

## 188. ambientCG
- URL: https://ambientcg.com/
- Library: assets
- Year: 2017-2025
- CC0 PBR material library with 1K-8K maps and metalness/roughness sets.

## 189. Sketchfab
- URL: https://sketchfab.com/
- Library: assets
- Year: 2012-2025
- Largest browsable 3D model library with in-browser viewer and glTF download for many models.

## 190. Cesium ion / Cesium
- URL: https://cesium.com/
- Library: webgl
- Year: 2011-2025
- Geospatial 3D platform (terrain, photogrammetry, 3D Tiles); the reference for planet-scale scenes.

### Outrun, cyberpunk and retro-web 3D

## 191. Windows 93
- URL: https://www.windows93.net/
- Library: webgl
- Year: 2014-2025
- Fake OS with dozens of self-contained apps; the high-water mark of playful desktop-in-browser UI.

## 192. 98.js.org
- URL: https://98.js.org/
- Library: webgl
- Year: 2018-2025
- Accurate Windows 98 desktop recreation in the browser; strong reference for windowing chrome.

## 193. Poolsuite
- URL: https://poolsuite.net/
- Library: webgl
- Year: 2018-2025
- Vaporwave/outrun brand with a music player at its centre; the retro-sunset palette reference.

## 194. Poolside FM
- URL: https://poolside.fm/
- Library: webgl
- Year: 2018-2025
- The earlier Poolsuite identity; strong example of a coherent retro art direction across a whole app.

## 195. Cameron's World
- URL: https://www.cameronsworld.net/
- Library: webgl
- Year: 2015-2025
- Collage of archived 90s web pages; the reference for deliberate, curated nostalgia.

## 196. Orb Farm
- URL: https://orb.farm/
- Library: webgl
- Year: 2021-2025
- Tiny simulated ecosystem in a glass orb; a complete interactive toy in one page.

## 197. Neal.fun
- URL: https://neal.fun/
- Library: webgl
- Year: 2018-2025
- Collection of single-idea interactive sites; the best reference for scoping a fun micro-experience.

## 198. Hakim El Hattab - experiments
- URL: https://hakim.se/experiments
- Library: webgl
- Year: 2011-2025
- Decade of canvas/WebGL experiments (particles, cloth, fluid); each is a self-contained technique.

### Codrops playground and WebGL tutorial archive

## 199. Codrops
- URL: https://tympanus.net/codrops/
- Library: webgl
- Year: 2009-2025
- The definitive tutorial blog for web interaction craft; nearly every published effect has a demo repo.

## 200. Codrops playground
- URL: https://tympanus.net/codrops/category/playground/
- Library: webgl
- Year: 2014-2025
- Short experimental demos, often WebGL/shader based, published before they become a full tutorial.

### top 10 to study for WITF-3D viewer improvements

1. **three.js `webgl_postprocessing_unreal_bloom` + `webgpu_volume_cloud`** - https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html
   The two effects that make a flat 3D viewer read as premium: a proper multi-mip bloom and a raymarched volume. Both are drop-in, well-parameterised reference implementations.
2. **UNSEEN** - https://unseen.co/
   The closest studio analogue to WITF: restraint, one idea per page, and scroll pacing that never fights the 3D.
3. **UNSEEN - Illoca** - https://illoca.unseen.co/
   A single sculptural 3D hero held together by typography and negative space. Exactly the WITF-3D-viewer information density.
4. **react-three-fiber + drei docs** - https://drei.docs.pmnd.rs/
   If the viewer ships as React, drei's `Environment`, `Bounds`, `Center`, `Stage` and `Html` remove most of the viewer scaffolding code.
5. **three.js `webgl_materials_physical_transmission`** - https://threejs.org/examples/webgl_materials_physical_transmission.html
   Transmission/absorption is the single highest-value material upgrade for a hero object, and needs no custom shader.
6. **Elevated (iq)** - https://www.shadertoy.com/view/MdX3Rr
   The template for an invented landscape from pure math: domain-warped fbm, analytical normals, one pass. Portable to a three.js ShaderMaterial almost verbatim.
7. **Bitonic sort + A-buffer (WebGPU samples)** - https://webgpu.github.io/webgpu-samples/samples/bitonicSort/
   GPU sorting and per-pixel linked lists are what you need for correct transparency and dense particle ordering; both samples are minimal and readable.
8. **`<model-viewer>`** - https://modelviewer.dev/
   A zero-framework baseline for a product 3D hero with IBL presets, hotspots, poster images and AR. Use it as the floor the custom viewer must beat.
9. **Spline community** - https://app.spline.design/community
   Fastest source of ready-made hero compositions and lighting setups, and a way to sanity-check what a good default looks like without a 3D artist.
10. **three.js `webgl_postprocessing_godrays` + `webgl_shadowmap_pcss`** - https://threejs.org/examples/webgl_postprocessing_godrays.html
   Light shafts plus contact-hardening soft shadows are the cheapest large perceived-quality jump for an existing scene.

### gaps

**Requested sources that could not be verified (dropped or substituted):**

- `webgpulabs.com` and `webgpufun.com` do not resolve in DNS (no A/AAAA record). Substituted with `webgpu.com`, `webgpu-demos.rivendellweb.net` / `webgfx.github.io/webgpu-demos`, `compute.toys` and `webgpureport.org`.
- `webgpu-fundamentals` has no repository at `github.com/greggman/webgpu-fundamentals` or `github.com/webgpu/webgpu-fundamentals`; the material is published as the site `webgpufundamentals.org`, which is what the list points at.
- `typo/typo` is present as `typo.gallery` (title: "TYPO.GALLERY by typo.eth") plus `typo.xyz`. The guessed forms `typo.typo.xyz`, `typo-typo.com` and `typo.tools` do not resolve.
- `supersplat.playcanvas.com` has no DNS entry; the live editor is `superspl.at`. `themes.8thwall.com` also does not resolve, so only `8thwall.com` is listed.
- `zachlieberman.us` and `zach.li` do not resolve; substituted with the artist's studio site `yesyesno.com`.
- `complexification.net` and `levitated.net` (Jared Tarbell) present a self-signed TLS certificate, so they cannot pass a strict `curl` TLS check; both return HTTP 200 with certificate verification disabled (`curl -k`) and are live.
- `openprocessing.org` and `fxhash.xyz` return 403 / 402 to automated clients (bot wall / payment gate). Neither is represented in the numbered list; if you want generative-art platform coverage beyond Art Blocks and Verse, these two are the obvious next additions and need a real browser session.
- `three.js` example filenames that do not exist (`webgl_lightning`, `webgl_lights_ies`, `webgl_godrays`, `webgl_postprocessing_motion_blur`, `webgl_water_flowmap`) were replaced with the real files (`webgpu_lights_ies_spotlight`, `webgl_postprocessing_godrays`, `webgpu_compute_water`).
- `artblocks.io/explore` and `market.pmnd.rs` 404; only the working roots are listed.
- `developers.meta.com/horizon/documentation/web/webxr-overview/` returns 400 to automated clients, so the Meta WebXR doc is not in the list.
- Awwwards category pages carry no per-site technique notes; the one-line descriptions for the award sites are my reading of the pages, not Awwwards copy.

**Coverage that is thinner than requested:**

- **Apple Vision Pro / visionOS public showcases.** Apple publishes design guidance and framework docs but almost no standalone public demo URLs; the HIG and documentation pages are the authoritative substitute. Community visionOS apps are discoverable only through GitHub topics.
- **WebXR sites with a stable public URL.** Most WebXR showcases are conference builds or client work with no durable public URL, so the list leans on the spec samples, three.js XR examples, A-Frame and `<model-viewer>`.
- **Shadertoy top-reviewed ranking.** The site's popular/love/hot browse views are Cloudflare-gated and have no archived listing pages, so ranking could not be read programmatically. Entries were selected by archived-snapshot frequency (a proxy for citation), and each name was confirmed against a GitHub-vendored copy.
- **Awwwards annual winners by year (2023 / 2024 / 2025).** The annual-awards page is JS-filtered by year; the site list here comes from the live 3D and WebGL category pages, which are not year-segmented. The 2024 Site of the Year (Igloo Inc by abeto) is recorded against the annual-awards index URL.
- **Drei-specific showcase apps.** drei ships helpers, not demo apps; the list points at the drei docs/examples surfaces rather than inventing app URLs.

**Excluded to hold the 100-200 entry budget (147 further verified URLs beyond the 200 listed):**

- 147 other verified URLs by group: WebXR (23), brand 3D heroes (19), Awwwards (15), three.js (10), WebGPU samples (10), generative art (10), graphics fundamentals (9), react-three-fiber (7), studios (7), visionOS (5), splatting/path tracing (5), retro/outrun (5), regl/deck.gl (4), Shadertoy (4), GLSL tooling (4), assets (4), WebGPU hubs (3), Babylon.js (2), Codrops (2).
- These remain live and valid, they were simply cut for length. The largest trims were additional three.js example pages, extra individual WebGPU samples, additional Awwwards category winners, and additional Apple product pages. The group source URLs (three.js examples index, webgpu-samples index, Awwwards 3D category) are all in the list so the trimmed candidates remain discoverable.

