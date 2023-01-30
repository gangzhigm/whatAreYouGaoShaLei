// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const glsl = require("glslify");
// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const Random = require("canvas-sketch-utils/Random");
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
  renderer.setClearColor("#fff", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  // const geometry = new THREE.TorusGeometry(1, 0.5, 32);
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  // const geometry = new THREE.BoxGeometry(1, 1, 1);

  const baseGeom = new THREE.IcosahedronGeometry(1, 1);

  // const points = baseGeom.vertices;
  const pointsList = baseGeom.attributes.position.array;
  const pointsSize = baseGeom.attributes.position.itemSize;

  const points = [];
  
  for(let i = 0; i < pointsList.length; i += pointsSize){
    points.push(new THREE.Vector3(...pointsList.slice(i, i + pointsSize)));
  }

  const circleGeom = new THREE.CircleGeometry(1, 32);

  points.forEach(point => {
    const mesh = new THREE.Mesh(
      circleGeom, 
      new THREE.MeshBasicMaterial({
        color: "deepsky",
        side: THREE.BackSide
      })
    );
    mesh.position.copy(point);
    mesh.scale.setScalar(0.15 * Random.value());
    mesh.lookAt(new THREE.Vector3());
    scene.add(mesh);
  })

  const vertexShader = /* glsl */`
    uniform float time;
    varying vec2 vUv;
    void main () {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }
  `

  const fragmentShader = glsl(/* glsl */`
    #pragma glslify: noise = require("glsl-noise/simplex/3d");
    uniform vec3 color;
    uniform float time;
    varying vec2 vUv;
    void main () {
      gl_FragColor = vec4(color,1.0);
    }
  `)

  // Setup a material
  const material = new THREE.ShaderMaterial({
    uniforms:{
      time:{ value: 0},
      color:{ value: new THREE.Color("tomato")},
      // color:{ value: new THREE.Color("tomato")},
    },
    vertexShader,
    fragmentShader
  });

  const beseMaterial = new THREE.MeshNormalMaterial({
    wireframe: true
  });
  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  const besemesh = new THREE.Mesh(baseGeom, beseMaterial);
  scene.add(mesh);
  // scene.add(besemesh);

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
      material.uniforms.time.value = time;
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
