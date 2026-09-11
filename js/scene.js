import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.186.0/three.module.min.js";

/**
 * Ambient hero shader: three soft gooey blobs in the brand's real logo
 * colours (coral, sky, lime) that drift behind the hero photo card and
 * lean gently toward the pointer — an abstract echo of the logo's own
 * petal burst. One responsibility — ambient colour and depth — and it
 * stays fully subordinate to the real photo and copy stacked in front
 * of it. Nothing here is required to read or use the page.
 */
const VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uIntensity;
  uniform vec3 uCream;
  uniform vec3 uCoral;
  uniform vec3 uSky;
  uniform vec3 uLime;

  float blob(vec2 uv, vec2 center, float radius) {
    float d = length(uv - center);
    return radius * radius / (d * d + 0.0008);
  }

  void main() {
    vec2 res = uResolution;
    float aspect = res.x / max(res.y, 1.0);
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    float t = uTime * 0.06;

    vec2 c1 = vec2(sin(t * 1.3) * 0.5, cos(t * 1.1) * 0.32) + vec2(0.18, 0.06);
    vec2 c2 = vec2(cos(t * 0.9 + 1.7) * 0.42, sin(t * 1.4 + 0.6) * 0.4) - vec2(0.22, 0.1);
    vec2 c3 = vec2(sin(t * 0.7 + 3.1) * 0.36, cos(t * 0.6 + 2.0) * 0.3) + vec2(-0.05, 0.28);

    vec2 pointerPull = uPointer * 0.14;

    float f1 = blob(p, c1 + pointerPull, 0.30);
    float f2 = blob(p, c2 + pointerPull * 0.6, 0.26);
    float f3 = blob(p, c3 + pointerPull * 0.35, 0.22);
    float field = f1 + f2 + f3;

    float edge = smoothstep(0.55, 1.15, field);
    float core = smoothstep(1.3, 2.6, field);

    vec3 color = uCream;
    color = mix(color, uCoral, smoothstep(0.5, 1.1, f1));
    color = mix(color, uSky, smoothstep(0.5, 1.1, f2));
    color = mix(color, uLime, smoothstep(0.5, 1.1, f3) * 0.85);
    color = mix(color, mix(uCoral, uSky, 0.5), core * 0.35);

    vec2 glintPos = uPointer * vec2(aspect, 1.0) * 0.5;
    float glint = smoothstep(0.5, 0.0, length(p - glintPos)) * edge;
    color += glint * 0.16;

    float alpha = edge * uIntensity;
    float vignette = smoothstep(0.95, 0.35, length(uv - 0.5));
    alpha *= vignette;

    gl_FragColor = vec4(color, alpha);
  }
`;

export function initHeroScene(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch (err) {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 0.9 },
      uCream: { value: new THREE.Color("#FBF1E2") },
      uCoral: { value: new THREE.Color("#E9573E") },
      uSky: { value: new THREE.Color("#3FA7C9") },
      uLime: { value: new THREE.Color("#96C93E") },
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    targetX = ((x - rect.left) / rect.width - 0.5) * 2;
    targetY = -((y - rect.top) / rect.height - 0.5) * 2;
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    material.uniforms.uResolution.value.set(w, h);
  }
  resize();
  window.addEventListener("resize", resize);

  let running = false;
  let rafId = null;
  const clock = new THREE.Clock();

  function tick() {
    if (!running) return;
    rafId = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);

    pointerX += (targetX - pointerX) * 0.04;
    pointerY += (targetY - pointerY) * 0.04;
    material.uniforms.uPointer.value.set(pointerX, pointerY);
    material.uniforms.uTime.value += dt * 16.0;

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    tick();
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  function onVisibility() {
    if (document.hidden) stop();
    else if (io.takeRecords) start();
  }
  document.addEventListener("visibilitychange", onVisibility);

  function onContextLost(event) {
    event.preventDefault();
    stop();
    canvas.classList.remove("is-active");
  }
  canvas.addEventListener("webglcontextlost", onContextLost);

  function destroy() {
    stop();
    io.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  canvas.classList.add("is-active");

  return { destroy };
}
