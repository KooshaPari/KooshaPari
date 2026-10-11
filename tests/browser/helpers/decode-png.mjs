// Minimal PNG decoder: 8-bit RGB/RGBA, non-interlaced, which is exactly what
// Chromium emits for page.screenshot(). Uses node:zlib so there is no native
// dependency and no build step. Returns { width, height, data } where data is
// a Uint8Array of RGBA pixels (row-major, top-down).
import { inflateSync } from 'node:zlib';

const SIG = [137, 80, 78, 71, 13, 10, 26, 10];

export function decodePng(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  for (let i = 0; i < SIG.length; i += 1) {
    if (bytes[i] !== SIG[i]) throw new Error('not a PNG (bad signature)');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  while (offset < bytes.length) {
    const length = readUInt32BE(bytes, offset);
    const type = String.fromCharCode(
      bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7],
    );
    const dataStart = offset + 8;

    if (type === 'IHDR') {
      width = readUInt32BE(bytes, dataStart);
      height = readUInt32BE(bytes, dataStart + 4);
      bitDepth = bytes[dataStart + 8];
      colorType = bytes[dataStart + 9];
      const interlace = bytes[dataStart + 12];
      if (interlace !== 0) throw new Error('interlaced PNG is not supported');
    } else if (type === 'IDAT') {
      idat.push(bytes.subarray(dataStart, dataStart + length));
    } else if (type === 'IEND') {
      break;
    }

    offset = dataStart + length + 4; // skip data + CRC
  }

  if (!width || !height) throw new Error('PNG is missing IHDR');
  if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);
  if (colorType !== 2 && colorType !== 6) {
    throw new Error(`unsupported colour type ${colorType} (expected 2=RGB or 6=RGBA)`);
  }

  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = new Uint8Array(stride * height);

  // PNG scanlines are filtered per row; undo the filter in order.
  let rawPos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[rawPos];
    rawPos += 1;
    const rowStart = y * stride;

    for (let x = 0; x < stride; x += 1) {
      const rawByte = raw[rawPos + x];
      const left = x >= channels ? out[rowStart + x - channels] : 0;
      const up = y > 0 ? out[rowStart - stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? out[rowStart - stride + x - channels] : 0;

      let value;
      switch (filter) {
        case 0: value = rawByte; break;
        case 1: value = rawByte + left; break;
        case 2: value = rawByte + up; break;
        case 3: value = rawByte + Math.floor((left + up) / 2); break;
        case 4: value = rawByte + paeth(left, up, upLeft); break;
        default: throw new Error(`unknown PNG filter ${filter}`);
      }
      out[rowStart + x] = value & 0xff;
    }
    rawPos += stride;
  }

  return { width, height, channels, data: out };
}

// Read one pixel as [r, g, b] from a decoded image.
export function pixelAt(img, x, y) {
  const { width, channels, data } = img;
  if (x < 0 || y < 0 || x >= width) throw new Error(`pixel (${x},${y}) out of range`);
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2]];
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

function readUInt32BE(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16)
    | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}
