// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#0f0f0f", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(4, 4, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.TorusGeometry(1, 0.5, 32, 16);
  // const geometry = new THREE.SphereGeometry(1, 32, 16);

  const loader = new THREE.TextureLoader();
  
  
  const map = loader.load("./brick-diffuse.jpg");
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1).multiplyScalar(4);


  const normalMap = loader.load("./brick-normal.jpg");
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.copy(map.repeat);

  // Setup a material
  const normalStrength = 1;
  const material = new THREE.MeshStandardMaterial({
    roughness:1,
    metalness: 0,
    normalScale: new THREE.Vector2(1, 1).multiplyScalar(normalStrength),
    map,
    normalMap,
    wireframe: false,
    flatShading: false
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  
  scene.add(mesh);


  const lightGroup = new THREE.Group();

  const light = new THREE.PointLight("hsl(0,10%,100%)", 1);

  light.position.set(2,3,2);

  lightGroup.add(light);
  scene.add(lightGroup);

  scene.add(new THREE.PointLightHelper(light, .15))
  scene.add(new THREE.GridHelper(5, 20, "red", "green"))

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      lightGroup.position.x = time * 10;
      lightGroup.position.y = time * 10;
      lightGroup.position.z = time * 10;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
