import { useEffect, useRef } from 'react';

const LINE_SPACING = 20;
const SAMPLE_STEP = 10;
const NOISE_SCALE_1 = 0.007;
const NOISE_SCALE_2 = 0.02;
const STOP_AFTER_MS = 5000;
const MIN_FREQ_FACTOR = 0.08;
const MIN_AMP_FACTOR = 0.25;

function parseRgba(value) {
  const parts = value
    .replace(/rgba?\(|\)|\s+/g, '')
    .split(',')
    .map(Number);

  if (parts.length === 4 && parts[3] <= 1) {
    return [parts[0], parts[1], parts[2], parts[3] * 255];
  }

  return parts;
}

function readThemeColors() {
  const rootStyles = getComputedStyle(document.documentElement);
  const bgParts = parseRgba(rootStyles.getPropertyValue('--canvas-background').trim());
  const strokeParts = parseRgba(rootStyles.getPropertyValue('--canvas-stroke').trim());

  return {
    background: bgParts.length === 4 ? bgParts : [...bgParts, 255],
    stroke: strokeParts.length === 4 ? strokeParts : [...strokeParts, 150],
  };
}

export default function NoiseBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let lineOffsets = [];
    let globalTimeOffset = 0;
    let startMillis = 0;
    let colors = readThemeColors();

    const sketch = (p) => {
      const initializeLineOffsets = () => {
        const visibleLines = Math.ceil(p.windowHeight / LINE_SPACING);
        const extraLines = 4;
        lineOffsets = Array.from({ length: visibleLines + extraLines * 2 }, () =>
          p.random(0, 1000),
        );
      };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.frameRate(12);
        startMillis = p.millis();
        initializeLineOffsets();
        globalTimeOffset = p.random(0, 10000);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        initializeLineOffsets();
        globalTimeOffset = p.random(0, 10000);
      };

      p.draw = () => {
        const elapsed = p.millis() - startMillis;
        const progress = p.constrain(elapsed / STOP_AFTER_MS, 0, 1);
        const speed = Math.max(0, 1 - progress * progress);

        p.background(...colors.background);
        p.noFill();
        p.stroke(...colors.stroke);
        p.strokeWeight(1);

        const elapsedSec = elapsed / 1000;
        const freqFactor = MIN_FREQ_FACTOR + (1 - MIN_FREQ_FACTOR) * speed;
        const time = elapsedSec * freqFactor;
        const ampFactor = MIN_AMP_FACTOR + (1 - MIN_AMP_FACTOR) * speed;
        const lineCount = Math.ceil(p.windowHeight / LINE_SPACING);
        const extraLines = 4;
        const totalLines = lineCount + extraLines * 2;

        for (let i = 0; i < totalLines; i += 1) {
          p.beginShape();
          const offset = lineOffsets[i] || 0;

          for (let x = 0; x < p.windowWidth; x += SAMPLE_STEP) {
            const noiseValue1 = p.noise(
              i * NOISE_SCALE_1 + time + offset + globalTimeOffset,
              x * NOISE_SCALE_1,
            );
            const noiseValue2 = p.noise(
              i * NOISE_SCALE_2 + time * 1.8 + offset * 1.3 + globalTimeOffset * 0.01,
              x * NOISE_SCALE_2,
            );
            const combinedNoise = noiseValue1 * 0.7 + noiseValue2 * 0.3;
            const y = i * LINE_SPACING + (combinedNoise - 0.5) * p.windowHeight * 0.7 * ampFactor;
            p.vertex(x, y);
          }

          p.endShape();
        }

        if (progress >= 1) {
          p.noLoop();
        }
      };
    };

    let instance;
    let cancelled = false;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onThemeChange = () => {
      colors = readThemeColors();
      instance?.redraw();
    };

    import('p5').then(({ default: p5 }) => {
      if (cancelled) return;
      instance = new p5(sketch, container);

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', onThemeChange);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(onThemeChange);
      }
    });

    return () => {
      cancelled = true;

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', onThemeChange);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(onThemeChange);
      }

      instance?.remove();
    };
  }, []);

  return <div ref={containerRef} className="noise-background" aria-hidden="true" />;
}
