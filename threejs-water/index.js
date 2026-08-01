const canvas = document.getElementById('canvas-water');

let renderer;
let uniforms;
let lastDPR = window.devicePixelRatio;

// resize the canvas to fill browser window dynamically, and keep the
// renderer/uniforms in sync. Browser zoom also fires a 'resize' event
// (innerWidth/innerHeight change in CSS px) but changes devicePixelRatio
// too — a real window resize at a fixed zoom level does not, so use
// that to ignore zoom-triggered resizes.
function resizeCanvas() {
  const currentDPR = window.devicePixelRatio;
  if (Math.abs(currentDPR - lastDPR) > 0.001) {
    lastDPR = currentDPR;
    return;
  }

  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w;
  canvas.height = h;

  if (renderer) renderer.setSize(w, h, false);
  if (uniforms) uniforms.uResolution.value.set(w, h);
}

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 100);
}, false);

resizeCanvas();

const width = canvas.width;
const height = canvas.height;

function loadFile(filename) {
  return new Promise((resolve) => {
    new THREE.FileLoader().load(filename, resolve);
  });
}

const MAX_RIPPLES = 16;
let rippleHead = 0;
const clock = new THREE.Clock();

Promise.all([
  loadFile('threejs-water/shaders/ripple/vertex.glsl'),
  loadFile('threejs-water/shaders/ripple/fragment.glsl'),
]).then(([vertexShader, fragmentShader]) => {

  renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  camera.position.z = 1;

  const tiles = new THREE.TextureLoader().load('threejs-water/tiles.jpg');
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping;

  uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(width, height) },
    uRippleCount: { value: 0 },
    uRipples: { value: new Float32Array(MAX_RIPPLES * 3) },
    uTiles: { value: tiles },
  };

  const material = new THREE.RawShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  const geometry = new THREE.PlaneBufferGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function addRipple(clientX, clientY) {
    const x = clientX / window.innerWidth;
    const y = 1.0 - clientY / window.innerHeight;

    const i = rippleHead % MAX_RIPPLES;
    uniforms.uRipples.value[i * 3 + 0] = x;
    uniforms.uRipples.value[i * 3 + 1] = y;
    uniforms.uRipples.value[i * 3 + 2] = clock.getElapsedTime();

    rippleHead += 1;
    uniforms.uRippleCount.value = Math.min(rippleHead, MAX_RIPPLES);
  }

  canvas.addEventListener('mousedown', (e) => addRipple(e.clientX, e.clientY));
  canvas.addEventListener('touchstart', (e) => {
    for (const touch of e.changedTouches) addRipple(touch.clientX, touch.clientY);
  }, {passive: true});

  // seed a couple of ripples so the surface isn't static on load
  addRipple(window.innerWidth * 0.35, window.innerHeight * 0.4);
  addRipple(window.innerWidth * 0.65, window.innerHeight * 0.6);

  function animate() {
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  animate();
});
