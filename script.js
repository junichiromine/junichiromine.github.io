const lineSpacing = 20;
const sampleStep = 10;
const noiseScale1 = 0.007;
const noiseScale2 = 0.02;
let backgroundColor = [250, 248, 245, 255];
let strokeColor = [15, 25, 55, 150];

let startMillis = 0;
const stopAfterMs = 5000;
let lineOffsets = [];
let globalTimeOffset = 0;

function initializeLineOffsets() {
  const visibleLines = Math.ceil(windowHeight / lineSpacing);
  const extraLines = 4;
  lineOffsets = [];

  for (let i = 0; i < visibleLines + extraLines * 2; i++) {
    lineOffsets.push(random(0, 1000));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(12);

  startMillis = millis();
  initializeLineOffsets();
  globalTimeOffset = random(0, 10000);
  syncThemeColors();
  watchSystemTheme();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeLineOffsets();
  globalTimeOffset = random(0, 10000);
}

function syncThemeColors() {
  const rootStyles = getComputedStyle(document.documentElement);
  const bgValue = rootStyles.getPropertyValue('--canvas-background').trim();
  const strokeValue = rootStyles.getPropertyValue('--canvas-stroke').trim();

  const parseRgba = (value) => {
    const parts = value.replace(/rgba?\(|\)|\s+/g, '').split(',').map((part) => Number(part));
    if (parts.length === 4 && parts[3] <= 1) {
      return [parts[0], parts[1], parts[2], parts[3] * 255];
    }
    return parts;
  };

  const bgParts = parseRgba(bgValue);
  const strokeParts = parseRgba(strokeValue);

  backgroundColor = bgParts.length === 4 ? bgParts : [...bgParts, 255];
  strokeColor = strokeParts.length === 4 ? strokeParts : [...strokeParts, 150];
}

function watchSystemTheme() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    syncThemeColors();
    redraw();
  };

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', onChange);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(onChange);
  }
}

function draw() {
  const elapsed = millis() - startMillis;
  const progress = constrain(elapsed / stopAfterMs, 0, 1);
  const speed = max(0, 1 - progress * progress);

  background(...backgroundColor);
  noFill();
  stroke(...strokeColor);
  strokeWeight(1);

  const elapsedSec = elapsed / 1000;
  const minFreqFactor = 0.08;
  const freqFactor = minFreqFactor + (1 - minFreqFactor) * speed;
  const time = elapsedSec * freqFactor;
  const minAmpFactor = 0.25;
  const ampFactor = minAmpFactor + (1 - minAmpFactor) * speed;
  const lineCount = Math.ceil(windowHeight / lineSpacing);
  const extraLines = 4;
  const totalLines = lineCount + extraLines * 2;

  for (let i = 0; i < totalLines; i++) {
    beginShape();
    const offset = lineOffsets[i] || 0;

    for (let x = 0; x < windowWidth; x += sampleStep) {
      const noiseValue1 = noise((i * noiseScale1) + time + offset + globalTimeOffset, x * noiseScale1);
      const noiseValue2 = noise((i * noiseScale2) + (time * 1.8) + offset * 1.3 + globalTimeOffset * 0.01, x * noiseScale2);
      const combinedNoise = noiseValue1 * 0.7 + noiseValue2 * 0.3;
      const y = (i * lineSpacing) + (combinedNoise - 0.5) * windowHeight * 0.7 * ampFactor;
      vertex(x, y);
    }

    endShape();
  }

  if (progress >= 1) {
    noLoop();
  }
}
