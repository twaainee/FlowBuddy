import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const mount = document.getElementById('about-hero-3d');

if (mount) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // --- Core setup ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  // Adjusted camera to lower the model slightly
  camera.position.set(0, 0.5, 5.5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Tone mapping for realistic lighting
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  mount.appendChild(renderer.domElement);

  // --- Environment for PBR materials ---
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  // --- OrbitControls: restricted drag ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.enableZoom = false; // Prevent zooming in/out to keep the framing nice
  controls.minDistance = 2.5;
  controls.maxDistance = 10;
  // Constrain rotation to just up and down (no left/right spinning)
  controls.minAzimuthAngle = 0;
  controls.maxAzimuthAngle = 0;
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 1.5;
  // Adjusted target to match new camera framing
  controls.target.set(0, -0.2, 0); 
  controls.update();

  // --- State ---
  const clock = new THREE.Clock();
  const modelRoot = new THREE.Group();
  let loadedModel = null;
  let frameId = null;

  scene.add(modelRoot);

  // --- Lighting ---
  // Hemisphere: warm sky, cool ground
  scene.add(new THREE.HemisphereLight(0xfff5e8, 0xd0e8dc, 1.2));

  // Key light — warm, from upper-right-front
  const keyLight = new THREE.DirectionalLight(0xfff0d8, 3.2);
  keyLight.position.set(3, 4, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  // Fill light — cool, from left
  const fillLight = new THREE.DirectionalLight(0xa8c8e0, 1.2);
  fillLight.position.set(-3, 1.5, 3);
  scene.add(fillLight);

  // Rim light — from behind, gives 3D edge definition
  const rimLight = new THREE.DirectionalLight(0xe8f0ff, 1.6);
  rimLight.position.set(0, 2, -4);
  scene.add(rimLight);

  // Close point light for warmth
  const pointLight = new THREE.PointLight(0xffeedd, 0.5, 8);
  pointLight.position.set(0, 1.2, 2.4);
  scene.add(pointLight);

  // --- Ground shadow + grid ---
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.14 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.2;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const gridHelper = new THREE.GridHelper(10, 20, 0xd0d8d4, 0xe8ecea);
  gridHelper.position.y = -1.21;
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // --- Resize ---
  function resize() {
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  // --- Center + scale model to fit viewport ---
  function centerAndScaleModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.5 / largest;
    object.scale.setScalar(scale);
    // Shift so bounding-box center lands at origin
    object.position.copy(center.multiplyScalar(-scale));
  }

  // --- Animate ---
  function animate() {
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (loadedModel && !prefersReducedMotion.matches) {
      // Subtle floating animation (just up and down)
      modelRoot.position.y = Math.sin(t * 1.4) * 0.15;

      // Punchier lighting shifts
      keyLight.intensity = 3.2 + Math.sin(t * 0.5) * 1.0;
      rimLight.intensity = 1.6 + Math.sin(t * 0.7) * 0.8;
      pointLight.intensity = 0.5 + Math.sin(t * 1.1) * 0.4;
    }

    controls.update(); // required for damping
    renderer.render(scene, camera);
  }

  // --- Load model ---
  function loadModel(urls, index = 0) {
    if (!urls[index]) {
      mount.classList.add('is-error');
      console.warn('[3D] No model could be loaded.');
      return;
    }
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      urls[index],
      (gltf) => {
        loadedModel = gltf.scene;
        
        // Reset to natural orientation - the custom rotations were flipping it!
        loadedModel.rotation.set(0, 0, 0);
        
        centerAndScaleModel(loadedModel);
        
        loadedModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        modelRoot.add(loadedModel);
        mount.classList.add('is-loaded', 'is-idle');
      },
      undefined,
      () => loadModel(urls, index + 1)
    );
  }

  // --- Boot ---
  const ro = new ResizeObserver(resize);
  ro.observe(mount);
  resize();

  loadModel([
    '../assets/models/about-hero-opt.glb',
  ]);

  animate();

  window.addEventListener('pagehide', () => {
    if (frameId) cancelAnimationFrame(frameId);
    ro.disconnect();
    controls.dispose();
    pmremGenerator.dispose();
    renderer.dispose();
  });
}