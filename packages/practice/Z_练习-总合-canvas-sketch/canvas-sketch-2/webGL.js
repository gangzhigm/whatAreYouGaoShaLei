global.THREE = require("three");
require("three/examples/js/controls/OrbitControls");
const palettes = require("nice-color-palettes");
const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const eases = require('eases');
const BezierEasing = require('bezier-easing');
const settings = {
  dimensions:[512, 512],
  fps: 24,
  duration:5,
  animate: true,
  context: "webgl",
  attributes: { antialias: true}
};

const sketch = ({ context }) => {
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  renderer.setClearColor("hsl(180, 20%, 95%)", 1);

  const camera = new THREE.OrthographicCamera();

  const scene = new THREE.Scene();

  const palette = random.pick(palettes)

  const box = new THREE.BoxGeometry(1,1,1);
  for(let i = 0; i < 40; i++) {
    const mesh = new THREE.Mesh(
      box,
      new THREE.MeshStandardMaterial({
        color: random.pick(palette),
      })
    );
    
    // mesh.position.set(
    //   random.gaussian(), random.gaussian(), random.gaussian()
    // )
    // mesh.scale.set(
    //   random.gaussian(), random.gaussian(), random.gaussian()
    // )
    
    mesh.position.set(
      random.range(-1, 1), random.range(-1, 1), random.range(-1, 1)
    )
    mesh.scale.set(
      random.range(-1, 1), random.range(-1, 1), random.range(-1, 1)
    )

    mesh.scale.multiplyScalar(0.5);
    scene.add(mesh);
  }

  scene.add(new THREE.AmbientLight(random.pick(palette), random.value()))

  const light = new THREE.DirectionalLight(random.pick(palette), random.value());
  light.position.set(0, 0, 5);
  scene.add(light);

  scene.add(light);

  const easeFn = BezierEasing(.67,.03,.29,.99);
  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);

      const aspect = viewportWidth / viewportHeight;

      const zoom = 1.5;
      
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      camera.near = -100;
      camera.far = 100;

      camera.position.set(zoom,zoom,zoom);
      camera.lookAt(new THREE.Vector3());

      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time, playhead }) {
      // scene.rotation.x = time * 0.1;
      const t = Math.sin(playhead * Math.PI)
      scene.rotation.y = easeFn(t);
      // scene.rotation.y = eases.expoInOut(t);
      
      // scene.rotation.y = playhead * Math.PI * 2;
      // scene.rotation.z = time * 0.1;
      // controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      // controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
