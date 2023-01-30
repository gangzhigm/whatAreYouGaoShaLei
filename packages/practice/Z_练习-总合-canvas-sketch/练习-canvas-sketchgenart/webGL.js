global.THREE = require("three");
require("three/examples/js/controls/OrbitControls");
const palettes = require("nice-color-palettes");
const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const eases = require('eases');
const BezierEasing = require('bezier-easing');
const glslify = require('glslify');
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


  const meshes = [];

  const fragmentShader = glslify(`
    #pragma glslify: noise = require("glsl-noise/simplex/3d");
    varying vec2 vUv;
    uniform vec3 color;
    uniform float time;
    void main() {
      float offset = 1.0 * noise(vec3(vUv.xy * 5.5, time));
      gl_FragColor = vec4(vec3( (color * vUv.x + offset) ), 1.0);
    }
  `);
  
  const vertexShader = glslify(`
    #pragma glslify: noise = require("glsl-noise/simplex/4d");
    varying vec2 vUv;
    uniform float time;
    void main() {
      vUv = uv;
      vec3 pos = position.xyz;
      pos += normal * noise(vec4(position.xyz * 10000.0, time * 0.4)) * 0.05;
      pos += normal * noise(vec4(position.xyz * 0.5, time * 0.4)) * 0.5;
      pos += normal * noise(vec4(position.xyz * 10000.0, time * 10.0)) * 0.005;
      pos += normal * noise(vec4(position.xyz * 10000.0, 1.0 * 0.4)) * 0.05;
      pos += normal * noise(vec4(position.xyz * 0.5, 1.0 * 0.4)) * 0.5;
      pos += normal * noise(vec4(position.xyz * 10000.0, time * 10.0)) * 0.02;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `);

  const geometry = new THREE.SphereGeometry(1,32,32);
  // const geometry = new THREE.BoxGeometry(1,1,1);
  for(let i = 0; i < 1; i++) {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms:{
          time: { value: 1 },
          color: { value: new THREE.Color(random.pick(palette))},
        },
        // new THREE.MeshBasicMaterial({
        // new THREE.MeshStandardMaterial({
        color: random.pick(palette),
      })
    );
    
    // mesh.position.set(
    //   random.gaussian(), random.gaussian(), random.gaussian()
    // )
    // mesh.scale.set(
    //   random.gaussian(), random.gaussian(), random.gaussian()
    // )
    
    // mesh.position.set(
    //   random.range(-1, 1), random.range(-1, 1), random.range(-1, 1)
    // )
    // mesh.scale.set(
    //   random.range(-1, 1), random.range(-1, 1), random.range(-1, 1)
    // )

    mesh.scale.multiplyScalar(0.5);
    scene.add(mesh);
    meshes.push(mesh);
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
      meshes.forEach(mesh=>{
        mesh.material.uniforms.time.value = time;
      })
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
