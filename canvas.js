const width = 600;
const height = 400;
const cellSize = 4;

const lineSpacing = 32;
const sampleStep = 10;
const noiseScale1 = 0.0022;
const noiseScale2 = 0.006;
// const backgroundColor = [250, 248, 245];
const backgroundColor = [245, 243, 238];
const strokeColor = [24, 28, 32, 16];

const canvas = typeof DOM !== 'undefined' && typeof DOM.canvas === 'function'
  ? DOM.canvas(width, height)
  : typeof document !== 'undefined'
    ? document.createElement('canvas')
    : null;

if (!canvas) {
  throw new Error('Canvas element could not be created.');
}

const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Canvas 2D context is not available.');
}

let startMillis = 0;
const stopAfterMs = 5000;
let lineOffsets = [];
let globalTimeOffset = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function hashNoise(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function smoothNoise(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;

  const topLeft = hashNoise(x0, y0);
  const topRight = hashNoise(x0 + 1, y0);
  const bottomLeft = hashNoise(x0, y0 + 1);
  const bottomRight = hashNoise(x0 + 1, y0 + 1);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  return lerp(
    lerp(topLeft, topRight, u),
    lerp(bottomLeft, bottomRight, u),
    v,
  );
}

function fbm(x, y) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;

  for (let octave = 0; octave < 4; octave += 1) {
    value += smoothNoise(x * frequency, y * frequency) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value;
}

function initializeLineOffsets() {
  const lineCount = Math.ceil(height / lineSpacing);
  lineOffsets = [];

  for (let i = 0; i < lineCount; i += 1) {
    lineOffsets.push(randomBetween(0, 1000));
  }
}

function resizeCanvas() {
  canvas.width = width;
  canvas.height = height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  initializeLineOffsets();
  globalTimeOffset = randomBetween(0, 10000);
}

function drawFrame() {
  const elapsed = performance.now() - startMillis;
  const progress = Math.min(elapsed / stopAfterMs, 1);
  const speed = Math.max(0, 1 - progress * progress);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = `rgb(${backgroundColor.join(',')})`;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = `rgba(${strokeColor.join(',')})`;
  ctx.lineWidth = 0.1;

  const elapsedSec = elapsed / 1000;
  const time = elapsedSec * 0.012;
  const ampFactor = 0.13;
  const lineCount = Math.ceil(height / lineSpacing);

  for (let i = 0; i < lineCount; i += 1) {
    const offset = lineOffsets[i] || 0;
    ctx.beginPath();

    for (let x = 0; x <= width; x += sampleStep) {
      const noiseValue1 = fbm((x * noiseScale1) + time, (i * noiseScale2) + offset + globalTimeOffset);
      const noiseValue2 = fbm((x * (noiseScale1 * 0.75)) + time * 0.6, (i * (noiseScale2 * 1.2)) + offset * 1.2 + globalTimeOffset * 0.01);
      const combinedNoise = noiseValue1 * 0.7 + noiseValue2 * 0.3;
      const y = i * lineSpacing + (combinedNoise - 0.5) * height * ampFactor;

      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  if (progress < 1) {
    requestAnimationFrame(drawFrame);
  }
}

resizeCanvas();
startMillis = performance.now();
requestAnimationFrame(drawFrame);
canvas;
