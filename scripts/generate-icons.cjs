const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGE = path.join(__dirname, '../src/assets/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public');
const THEME_COLOR = '#5A5A40';

async function generateIcons() {
  try {
    console.log(`Reading source image from ${SOURCE_IMAGE}...`);
    const image = await Jimp.read(SOURCE_IMAGE);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }

    // 1. Generate 192x192
    console.log('Generating pwa-192x192.png...');
    // Clone, resize, and save
    const icon192 = image.clone().resize({ w: 192, h: 192 });
    await icon192.write(path.join(OUTPUT_DIR, 'pwa-192x192.png'));

    // 2. Generate 512x512
    console.log('Generating pwa-512x512.png...');
    // Clone, resize, and save
    const icon512 = image.clone().resize({ w: 512, h: 512 });
    await icon512.write(path.join(OUTPUT_DIR, 'pwa-512x512.png'));

    // 3. Generate Maskable Icon (512x512 with padding)
    console.log('Generating maskable-icon-512x512.png...');
    // Create a 512x512 canvas with theme color background
    // Jimp constructor might also need object or different args in v1.x
    // Let's try standard constructor, if fails we fix.
    // Actually, Jimp 1.x might not have `new Jimp`. It might be `new Jimp({ width, height, color })`
    const maskableCanvas = new Jimp({ width: 512, height: 512, color: THEME_COLOR });

    // Resize original image to 400x400
    const resizedIcon = image.clone().resize({ w: 400, h: 400 });
    // Composite the resized icon onto the center of the canvas
    const x = (512 - 400) / 2;
    const y = (512 - 400) / 2;
    maskableCanvas.composite(resizedIcon, x, y);
    await maskableCanvas.write(path.join(OUTPUT_DIR, 'maskable-icon-512x512.png'));

    // 4. Generate Favicon (64x64)
    console.log('Generating favicon.png...');
    // Clone, resize, and save
    const favicon = image.clone().resize({ w: 64, h: 64 });
    await favicon.write(path.join(OUTPUT_DIR, 'favicon.png'));

    console.log('All icons generated successfully!');

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
