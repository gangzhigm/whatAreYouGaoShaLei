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
  const geometry = new THREE.SphereGeometry(1, 32, 16);

  const loader = new THREE.TextureLoader();
  
  
  const earthTexture = loader.load("./earth.jpg");

  // Setup a material
    const earthMaterial = new THREE.MeshStandardMaterial({
    roughness:1,
    metalness: 0,
    map:earthTexture,
    wireframe: false,
    flatShading: false
  });

  // Setup a mesh with geometry + material
  const earthMesh = new THREE.Mesh(geometry, earthMaterial);
  
  scene.add(earthMesh);


  const moonGroup = new THREE.Group();

  const moonTexture = loader.load("./moon.jpg");

  // Setup a material
    const moonMaterial = new THREE.MeshStandardMaterial({
    roughness:1,
    map:moonTexture,
    wireframe: false,
    flatShading: false
  });

  // Setup a mesh with geometry + material
  const moonMesh = new THREE.Mesh(geometry, moonMaterial);
  
  moonMesh.position.set(1,0,-1);
  moonMesh.scale.setScalar(0.3);
  moonGroup.add(moonMesh);
  scene.add(moonGroup);
  

  const lightGroup = new THREE.Group();

  const light = new THREE.PointLight("hsl(0,10%,100%)", 4);

  light.position.set(3,0,3);

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
      earthMesh.rotation.y = -time * 0.2;
      moonGroup.rotation.y = time * 0.8;
      moonMesh.rotation.y = time * 0.2;
      lightGroup.rotation.y = time * 0.15;
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
