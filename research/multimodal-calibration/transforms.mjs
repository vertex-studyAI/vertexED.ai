import sharp from 'sharp';

export const TRANSFORM_SEED = 20260904;
export const TRANSFORM_LIBRARY = Object.freeze({
  package: 'sharp',
  version: '0.35.3'
});

export const SHIFT_CONDITIONS = Object.freeze({
  S0: 'clean',
  S1: 'gaussian_blur_sigma_1.0',
  S2: 'gaussian_blur_sigma_2.0',
  S3: 'gaussian_blur_sigma_4.0',
  S4: 'centered_neutral_occlusion_25_percent_area',
  S5: 'fixed_neutral_placeholder_original_dimensions'
});

const NEUTRAL_RGB = Object.freeze({ r: 127, g: 127, b: 127 });
const PNG_OPTIONS = Object.freeze({
  compressionLevel: 9,
  adaptiveFiltering: false,
  force: true
});

async function canonicalizeImage(input) {
  if (!Buffer.isBuffer(input) || input.length === 0) {
    throw new TypeError('input must be a non-empty Buffer');
  }

  return sharp(input, { failOn: 'error' })
    .rotate()
    .flatten({ background: NEUTRAL_RGB })
    .toColourspace('srgb')
    .removeAlpha()
    .png(PNG_OPTIONS)
    .toBuffer();
}

async function imageDimensions(buffer) {
  const metadata = await sharp(buffer, { failOn: 'error' }).metadata();
  if (!Number.isInteger(metadata.width) || metadata.width <= 0 || !Number.isInteger(metadata.height) || metadata.height <= 0) {
    throw new Error('decoded image must have positive integer dimensions');
  }
  return { width: metadata.width, height: metadata.height };
}

function requireCondition(condition) {
  if (!Object.hasOwn(SHIFT_CONDITIONS, condition)) {
    throw new Error(`unknown multimodal calibration shift condition: ${condition}`);
  }
}

export async function applyShiftTransform(input, condition) {
  requireCondition(condition);
  const canonical = await canonicalizeImage(input);

  if (condition === 'S0') return canonical;

  if (condition === 'S1' || condition === 'S2' || condition === 'S3') {
    const sigma = condition === 'S1' ? 1.0 : condition === 'S2' ? 2.0 : 4.0;
    return sharp(canonical, { failOn: 'error' })
      .blur(sigma)
      .png(PNG_OPTIONS)
      .toBuffer();
  }

  const { width, height } = await imageDimensions(canonical);

  if (condition === 'S4') {
    const patchWidth = Math.max(1, Math.floor(width / 2));
    const patchHeight = Math.max(1, Math.floor(height / 2));
    const left = Math.floor((width - patchWidth) / 2);
    const top = Math.floor((height - patchHeight) / 2);
    const patch = await sharp({
      create: {
        width: patchWidth,
        height: patchHeight,
        channels: 3,
        background: NEUTRAL_RGB
      }
    })
      .png(PNG_OPTIONS)
      .toBuffer();

    return sharp(canonical, { failOn: 'error' })
      .composite([{ input: patch, left, top, blend: 'over' }])
      .png(PNG_OPTIONS)
      .toBuffer();
  }

  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: NEUTRAL_RGB
    }
  })
    .png(PNG_OPTIONS)
    .toBuffer();
}
