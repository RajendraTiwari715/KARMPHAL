import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PROJECT_ROOT = path.resolve('.');
const ASSETS_SRC_DIR = path.join(PROJECT_ROOT, 'assets-src');
const ASSETS_OUT_DIR = path.join(PROJECT_ROOT, 'src/assets');

// Ensure directories exist
if (!fs.existsSync(ASSETS_SRC_DIR)) {
  fs.mkdirSync(ASSETS_SRC_DIR, { recursive: true });
}
if (!fs.existsSync(ASSETS_OUT_DIR)) {
  fs.mkdirSync(ASSETS_OUT_DIR, { recursive: true });
}

const IMAGE_CONFIGS = [
  {
    filename: 'vedic_ashram_bg.jpg',
    baseName: 'vedic_ashram_bg',
    maxWidth: 800, // Background, max <= 1080px, optimized under 100KB
    webpQuality: 50,
    avifQuality: 45,
    description: 'Vedic Ashram Background'
  },
  {
    filename: 'temple_hero.jpg',
    baseName: 'temple_hero',
    maxWidth: 1080, // Hero background, max 1080px
    webpQuality: 70,
    avifQuality: 55,
    description: 'Temple Hero Banner'
  },
  {
    filename: 'guru_avatar.jpg',
    baseName: 'guru_avatar',
    maxWidth: 256, // Avatar, max 256px
    webpQuality: 80,
    avifQuality: 75,
    description: 'Guru / Acharya Avatar'
  },
  {
    filename: 'app_logo.jpg',
    baseName: 'app_logo',
    maxWidth: 512, // App Logo, max 512px
    webpQuality: 80,
    avifQuality: 75,
    description: '3D App Logo'
  }
];

async function optimizeImages() {
  console.log('=== Karmphal Web Image Optimization Pipeline ===\n');
  console.log(`Source Folder: ${ASSETS_SRC_DIR}`);
  console.log(`Output Folder: ${ASSETS_OUT_DIR}\n`);

  const summary = [];

  for (const config of IMAGE_CONFIGS) {
    let sourcePath = path.join(ASSETS_SRC_DIR, config.filename);

    // If not in assets-src, copy from src/assets if present
    if (!fs.existsSync(sourcePath)) {
      const srcAssetPath = path.join(ASSETS_OUT_DIR, config.filename);
      if (fs.existsSync(srcAssetPath)) {
        fs.copyFileSync(srcAssetPath, sourcePath);
        console.log(`[Backup] Copied ${config.filename} to assets-src/`);
      } else {
        console.error(`[Error] Source image ${config.filename} not found in assets-src or src/assets!`);
        continue;
      }
    }

    const srcStat = fs.statSync(sourcePath);
    const originalBytes = srcStat.size;
    const originalKB = (originalBytes / 1024).toFixed(1);

    // Read metadata
    const meta = await sharp(sourcePath).metadata();
    const originalDimensions = `${meta.width}x${meta.height}`;

    // Base resize pipeline
    const baseSharp = sharp(sourcePath).resize({
      width: config.maxWidth,
      withoutEnlargement: true
    });

    // 1. Generate WebP
    const webpBuffer = await baseSharp.clone().webp({
      quality: config.webpQuality,
      effort: 6
    }).toBuffer();

    const webpOutPath = path.join(ASSETS_OUT_DIR, `${config.baseName}.webp`);
    fs.writeFileSync(webpOutPath, webpBuffer);
    const webpKB = (webpBuffer.length / 1024).toFixed(1);
    const webpReduction = (((originalBytes - webpBuffer.length) / originalBytes) * 100).toFixed(1);

    // 2. Generate AVIF
    const avifBuffer = await baseSharp.clone().avif({
      quality: config.avifQuality,
      effort: 6
    }).toBuffer();

    const avifOutPath = path.join(ASSETS_OUT_DIR, `${config.baseName}.avif`);
    fs.writeFileSync(avifOutPath, avifBuffer);
    const avifKB = (avifBuffer.length / 1024).toFixed(1);
    const avifReduction = (((originalBytes - avifBuffer.length) / originalBytes) * 100).toFixed(1);

    // Verify under 100KB target
    const isWebPUnder100KB = webpBuffer.length < 100 * 1024;
    const isAvifUnder100KB = avifBuffer.length < 100 * 1024;

    summary.push({
      name: config.baseName,
      originalSize: `${originalKB} KB`,
      originalDim: originalDimensions,
      targetDim: `${config.maxWidth}w max`,
      webpSize: `${webpKB} KB (-${webpReduction}%)`,
      avifSize: `${avifKB} KB (-${avifReduction}%)`,
      under100KB: isWebPUnder100KB && isAvifUnder100KB ? 'YES (<100KB)' : 'NO'
    });

    // Clean up original JPG from src/assets if it exists there
    const oldJpgInSrc = path.join(ASSETS_OUT_DIR, config.filename);
    if (fs.existsSync(oldJpgInSrc)) {
      fs.unlinkSync(oldJpgInSrc);
      console.log(`[Clean] Removed original ${config.filename} from src/assets/ (kept in assets-src/)`);
    }
  }

  console.log('\n--- Optimization Results Summary ---');
  console.table(summary);

  // Check all targets
  const allUnder100 = summary.every(s => s.under100KB === 'YES (<100KB)');
  if (allUnder100) {
    console.log('\nSUCCESS: All converted images are strictly under 100KB!');
  } else {
    console.warn('\nWARNING: Some images exceeded 100KB target!');
  }
}

optimizeImages().catch(err => {
  console.error('Fatal error optimizing images:', err);
  process.exit(1);
});
