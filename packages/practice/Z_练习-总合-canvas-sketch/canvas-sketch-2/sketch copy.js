const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: 'A4',
  units: 'cm',
  orientation: 'landscape',
  pixelsPerInch: 300
  // dimensions: [ 480, 480 ]
};

const sketch = () => {
  return ({ context, width, height }) => {
    console.info(width);
    console.info(height);
    context.fillStyle = '#000f0f';
    context.fillRect(0, 0, width, height);
    context.beginPath();
    context.arc(width / 2, height / 2, width * 0.2, 0, Math.PI * 2, false);
    context.fillStyle = '#0f0f0f';
    context.fill();
    context.lineWidth = 0.1;
    context.strokeStyle = '#f0f0f0';
    context.stroke();
  };
};

canvasSketch(sketch, settings);
