const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes  =require("nice-color-palettes");



const sketch = () => {
  const colorCount = [random.rangeFloor(0,6),random.rangeFloor(0,6)]
  if(colorCount[0] === colorCount[1]){
    colorCount[1] += 1
  }
  const pallette = random.shuffle(random.pick(palettes)).slice(Math.min(...colorCount),Math.max(...colorCount));
  const createGrid = () => {
    const points = [];
    const count = 50;
    for(let x = 0; x < count; x++) {
      for(let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        points.push({
          color: random.pick(pallette),
          borderColor: random.pick(pallette),
          position:[u, v],
          rotation: random.noise2D(u, v),
          radius: Math.abs(random.noise2D(u, v)) * 0.05
          // radius: ( 0.001 + Math.abs(random.gaussian()) * 0.01)
          // radius: random.value() * 0.01
        })
      }
    }
    return points;
  }
  
  const points = createGrid();
  // const points = createGrid().filter(()=> random.value() > 0.5);
  const margin = 20;
  return ({ context, width, height }) => {

    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    
    points.forEach(({rotation, borderColor, position:[u,v],radius, color, ...other}) => {
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      // context.beginPath();
      // context.arc(x, y, radius * width, 0, Math.PI * 2, false);
      // context.strokeStyle = borderColor;
      // context.lineWidth = 4;
      // context.stroke();
      
      // context.fillStyle = color;
      // context.fill();
      context.save();
      context.fillStyle = color;
      context.font = `${radius * width}px "Arial"`;
      context.translate(x, y);
      context.rotate(rotation);
      context.fillText('0', 0, 0);
      context.restore();

    })
  };
};




function ite(){
  document.body.innerHTML = ''
  random.setSeed(random.getRandomSeed());
  const settings = {
    suffix: random.getSeed(),
    dimensions: [ 800, 800 ]
  };
  canvasSketch(sketch, settings);
  setTimeout(()=>{
    ite();
  }, 10000)
  // window.requestAnimationFrame(ite);
}
ite()


