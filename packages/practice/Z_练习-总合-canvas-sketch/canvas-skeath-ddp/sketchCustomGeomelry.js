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

  scene.add(new THREE.GridHelper(5, 20, "red", "green"))


  const geometry = new THREE.BufferGeometry();

  const pointsArray = new Array()
  //加2000个顶点，范围为-1到1
  for(let i = 0;i<1000;i++){
    const x = Math.random() * 2 - 1 //范围在-1到1
    const y = Math.random() * 2 - 1
    const z = Math.random() * 2 - 1 
    pointsArray.push(new THREE.Vector3(x,y,z))
    //顶点
    //geometry.vertices.push(new THREE.Vector3(x,y,z))
  }
  //用这个api传入顶点数组
  geometry.setFromPoints(pointsArray)

  

  const material = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide
  })
  geometry.computeVertexNormals();
  //下述基本一样
  const mesh = new THREE.Line(geometry,material)
  // mesh.position.set(0,6,0)
  scene.add(mesh)




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
