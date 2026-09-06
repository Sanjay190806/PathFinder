import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'frontend', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createProceduralPng(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const half = size / 2;
  const rows = [];

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // Filter type: None
    
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 3;
      
      // Normalized coordinates from -1.0 to 1.0
      const nx = (x - half) / half;
      const ny = (y - half) / half;
      const dist = Math.sqrt(nx * nx + ny * ny);

      // 1. Sleek dark space background gradient (Radial and linear blend)
      let r = Math.round(10 - ny * 4); 
      let g = Math.round(12 + nx * 5); 
      let b = Math.round(28 + dist * 10);

      // Make it cap at 0-255
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      // 2. Draw outer neon cyan glow ring
      const ringRadius = 0.75;
      const ringThickness = 0.03;
      const ringDist = Math.abs(dist - ringRadius);
      if (ringDist < ringThickness) {
        const intensity = Math.pow(1.0 - (ringDist / ringThickness), 2);
        // Blend with Neon Cyan (#00f0ff)
        r = Math.round(r * (1 - intensity) + 0 * intensity);
        g = Math.round(g * (1 - intensity) + 240 * intensity);
        b = Math.round(b * (1 - intensity) + 255 * intensity);
      }

      // 3. Draw a glowing 4-point tech star in the center (representing Sanzz OS direction/navigation)
      // Equation of a 4-point star (astroid-like shape)
      const starValue = Math.sqrt(Math.abs(nx)) + Math.sqrt(Math.abs(ny));
      
      // If inside the star shape
      if (starValue < 0.8) {
        const intensity = Math.pow(1.0 - (starValue / 0.8), 1.5);
        // Blend with Neon Violet/Purple (#a855f7)
        r = Math.round(r * (1 - intensity) + 168 * intensity);
        g = Math.round(g * (1 - intensity) + 85 * intensity);
        b = Math.round(b * (1 - intensity) + 247 * intensity);
      }

      // 4. Draw horizontal/vertical crosshairs (grid accents)
      if (Math.abs(nx) < 0.006 && dist < 0.85) {
        const intensity = (0.85 - dist) * 0.7;
        r = Math.round(r * (1 - intensity) + 0 * intensity);
        g = Math.round(g * (1 - intensity) + 240 * intensity);
        b = Math.round(b * (1 - intensity) + 255 * intensity);
      }
      if (Math.abs(ny) < 0.006 && dist < 0.85) {
        const intensity = (0.85 - dist) * 0.7;
        r = Math.round(r * (1 - intensity) + 0 * intensity);
        g = Math.round(g * (1 - intensity) + 240 * intensity);
        b = Math.round(b * (1 - intensity) + 255 * intensity);
      }

      row[i] = r;
      row[i + 1] = g;
      row[i + 2] = b;
    }
    rows.push(row);
  }

  const raw = Buffer.concat(rows);
  const compressed = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  const png = createProceduralPng(size);
  writeFileSync(join(outDir, `icon-${size}.png`), png);
  console.log(`Wrote premium icon-${size}.png`);
}
