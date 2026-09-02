import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BEIGE = [244, 241, 234];
const INK = [26, 26, 26];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([length, crcInput, crc]);
}

function encodePng(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function setPixel(rgba, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) {
    return;
  }
  const i = (y * size + x) * 4;
  rgba[i] = color[0];
  rgba[i + 1] = color[1];
  rgba[i + 2] = color[2];
  rgba[i + 3] = 255;
}

function fillCircle(rgba, size, cx, cy, radius, color) {
  const r2 = radius * radius;
  const minX = Math.floor(cx - radius);
  const maxX = Math.ceil(cx + radius);
  const minY = Math.floor(cy - radius);
  const maxY = Math.ceil(cy + radius);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(rgba, size, x, y, color);
      }
    }
  }
}

function fillRoundedRect(rgba, size, x0, y0, x1, y1, radius, color) {
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const left = x0 + radius;
      const right = x1 - radius;
      const top = y0 + radius;
      const bottom = y1 - radius;
      let inside = px >= left && px < right;
      if (py >= top && py < bottom) {
        inside = true;
      }
      if (!inside) {
        const cx = px < left ? left : px >= right ? right : px;
        const cy = py < top ? top : py >= bottom ? bottom : py;
        const dx = px - cx;
        const dy = py - cy;
        inside = dx * dx + dy * dy <= radius * radius;
      }
      if (inside) {
        setPixel(rgba, size, x, y, color);
      }
    }
  }
}

function fillTriangle(rgba, size, x0, y0, x1, y1, x2, y2, color) {
  const minX = Math.floor(Math.min(x0, x1, x2));
  const maxX = Math.ceil(Math.max(x0, x1, x2));
  const minY = Math.floor(Math.min(y0, y1, y2));
  const maxY = Math.ceil(Math.max(y0, y1, y2));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const d0 = (px - x1) * (y0 - y1) - (x0 - x1) * (py - y1);
      const d1 = (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
      const d2 = (px - x0) * (y2 - y0) - (x2 - x0) * (py - y0);
      const hasNeg = d0 < 0 || d1 < 0 || d2 < 0;
      const hasPos = d0 > 0 || d1 > 0 || d2 > 0;
      if (!(hasNeg && hasPos)) {
        setPixel(rgba, size, x, y, color);
      }
    }
  }
}

function drawIcon(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    rgba[i * 4] = BEIGE[0];
    rgba[i * 4 + 1] = BEIGE[1];
    rgba[i * 4 + 2] = BEIGE[2];
    rgba[i * 4 + 3] = 255;
  }

  const inset = maskable ? size * 0.18 : size * 0.08;
  const radius = size * 0.18;
  fillRoundedRect(
    rgba,
    size,
    Math.round(inset),
    Math.round(inset),
    Math.round(size - inset),
    Math.round(size - inset),
    radius,
    INK,
  );

  const cx = size / 2;
  const pinR = size * 0.16;
  const pinCy = size * 0.42;
  fillCircle(rgba, size, cx, pinCy, pinR, BEIGE);
  fillCircle(rgba, size, cx, pinCy, pinR * 0.38, INK);
  fillTriangle(
    rgba,
    size,
    cx - pinR * 0.82,
    pinCy + pinR * 0.35,
    cx + pinR * 0.82,
    pinCy + pinR * 0.35,
    cx,
    size * (maskable ? 0.74 : 0.78),
    BEIGE,
  );

  return encodePng(size, rgba);
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../public/icons");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "icon-192.png"), drawIcon(192, false));
writeFileSync(join(outDir, "icon-512.png"), drawIcon(512, false));
writeFileSync(join(outDir, "icon-512-maskable.png"), drawIcon(512, true));
writeFileSync(join(outDir, "apple-touch-icon.png"), drawIcon(180, false));
console.log("Wrote PWA icons to public/icons");
