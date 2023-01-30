const canvasSketch = require("canvas-sketch");

global.THREE = require("three");

require("three/examples/js/controls/OrbitControls");


const settings = {

    animate: true,

    context: "webgl",
    
    attributes:{ antialias: true }
};

const sketch = ({ context }) => {
  const renderer = new THREE.WebGLRenderer({
    context
  });

  renderer.setClearColor("hsl(0, 0%, 95%)", 0.2);
  // renderer.setClearColor("#ff0", 0.2);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(2, 2, -4);
  camera.lookAt(new THREE.Vector3());

  const controls = new THREE.OrbitControls(camera, context.canvas);

  const scene = new THREE.Scene();

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhysicalMaterial({
        color:'white',
        roughness: 0.75,
        flatShading: true
    })
  );
  scene.add(mesh);

  // scene.add(new THREE.AmbientLight("#59314f"));

  // const light = new THREE.PointLight('#45caf7', 1, 15.5);
  // light.position.set(2, 2, -4).multiplyScalar(1.5);
  // scene.add(light);

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    render({ time }) {
      mesh.rotation.x = time * 0.1;
      mesh.rotation.y = time * 0.1;
      mesh.rotation.z = time * 0.1;
      // controls.update();
      renderer.render(scene, camera);
    },
    unload() {
      // controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
