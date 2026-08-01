import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { cutImageToGrid, generateMainImage, generateTabImage } from './src/stickers/utils/image-cutter';
import { buildStickerPackZip } from './src/stickers/utils/zip-builder';

async function main() {
  const width = 1200;
  const height = 900;
  const svg = Buffer.from(
    `<svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7F77DD"/>
          <stop offset="100%" stop-color="#1D9E75"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle">test photo</text>
    </svg>`,
  );
  const testImage = await sharp(svg).png().toBuffer();

  const rows = 2;
  const cols = 4;
  const vLines = [0.25, 0.5, 0.75];
  const hLines = [0.5];

  const tiles = await cutImageToGrid(testImage, { rows, cols, vLines, hLines });
  console.log(`裁切完成，共 ${tiles.length} 張，預期 ${rows * cols} 張`);
  tiles.forEach((t) =>
    console.log(`  第${t.index}張：來源裁切區塊 ${t.sourceWidth}x${t.sourceHeight}px`),
  );

  const mainImage = await generateMainImage(testImage);
  const tabImage = await generateTabImage(testImage);

  const outDir = path.join(__dirname, 'test-output');
  fs.mkdirSync(outDir, { recursive: true });

  const zipStream = buildStickerPackZip({ mainImage, tabImage, tiles });
  const zipPath = path.join(outDir, 'sticker-pack.zip');
  const writeStream = fs.createWriteStream(zipPath);

  await new Promise<void>((resolve, reject) => {
    zipStream.pipe(writeStream);
    writeStream.on('close', () => resolve());
    writeStream.on('error', reject);
    zipStream.on('error', reject);
  });

  const stat = fs.statSync(zipPath);
  console.log(`ZIP 已產生：${zipPath}，檔案大小 ${stat.size} bytes`);
}

main().catch((err) => {
  console.error('測試失敗:', err);
  process.exit(1);
});
