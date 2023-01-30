// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  animate: true,

  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(4, 4, 4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16);

  const loader = new THREE.TextureLoader();
  const earthtexture = loader.load("./earth.jpg");
  const moontexture = loader.load("./moon.jpg");

  // Setup a material
  const material = new THREE.MeshBasicMaterial({
    map: earthtexture,
    wireframe: false
  });

  
  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const moonmaterial = new THREE.MeshBasicMaterial({
    map: moontexture,
    wireframe: false
  });

  const moonGroup = new THREE.Group();

  const moonmesh = new THREE.Mesh(geometry, moonmaterial);
  moonmesh.position.set(1.5,0,1.5);
  moonmesh.scale.setScalar(0.25);


  moonGroup.add(moonmesh);
  
  scene.add(moonGroup);

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
      mesh.rotation.y = time * 0.2;
      moonGroup.rotation.y = time * 1;
      moonmesh.rotation.y = time * 0.075;
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
