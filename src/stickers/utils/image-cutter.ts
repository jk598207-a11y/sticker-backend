import sharp from 'sharp';

export interface GridSpec {
  rows: number;
  cols: number;
  vLines: number[];
  hLines: number[];
}

export interface CutTile {
  index: number;
  buffer: Buffer;
  sourceWidth: number;
  sourceHeight: number;
}

export interface LineSpecBox {
  maxWidth: number;
  maxHeight: number;
}

export const LINE_STICKER_BOX: LineSpecBox = { maxWidth: 370, maxHeight: 320 };
export const LINE_MAIN_IMAGE = { width: 240, height: 240 };
export const LINE_TAB_IMAGE = { width: 96, height: 74 };

function boundsFromLines(lines: number[], totalPx: number): number[] {
  const sorted = [...lines].sort((a, b) => a - b);
  return [0, ...sorted.map((f) => Math.round(f * totalPx)), totalPx];
}

export async function cutImageToGrid(
  sourceBuffer: Buffer,
  spec: GridSpec,
  box: LineSpecBox = LINE_STICKER_BOX,
): Promise<CutTile[]> {
  const image = sharp(sourceBuffer);
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (!width || !height) {
    throw new Error('無法讀取圖片尺寸，請確認上傳的是有效圖片。');
  }
  if (spec.vLines.length !== spec.cols - 1 || spec.hLines.length !== spec.rows - 1) {
    throw new Error(
      `切割線數量不正確：cols=${spec.cols} 需要 ${spec.cols - 1} 條直線，rows=${spec.rows} 需要 ${spec.rows - 1} 條橫線。`,
    );
  }

  const xBounds = boundsFromLines(spec.vLines, width);
  const yBounds = boundsFromLines(spec.hLines, height);

  const tiles: CutTile[] = [];
  let index = 1;

  for (let r = 0; r < spec.rows; r++) {
    for (let c = 0; c < spec.cols; c++) {
      const left = xBounds[c];
      const top = yBounds[r];
      const tileWidth = xBounds[c + 1] - left;
      const tileHeight = yBounds[r + 1] - top;

      if (tileWidth <= 0 || tileHeight <= 0) {
        throw new Error(`第 ${index} 張貼圖的切割範圍無效，請重新調整切割線。`);
      }

      const cropped = await sharp(sourceBuffer)
        .extract({ left, top, width: tileWidth, height: tileHeight })
        .resize({
          width: box.maxWidth,
          height: box.maxHeight,
          fit: 'inside',
          withoutEnlargement: false,
        })
        .toBuffer();

      const croppedMeta = await sharp(cropped).metadata();
      const fitW = croppedMeta.width ?? box.maxWidth;
      const fitH = croppedMeta.height ?? box.maxHeight;

      const finalBuffer = await sharp({
        create: {
          width: box.maxWidth,
          height: box.maxHeight,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([
          {
            input: cropped,
            left: Math.round((box.maxWidth - fitW) / 2),
            top: Math.round((box.maxHeight - fitH) / 2),
          },
        ])
        .png()
        .toBuffer();

      tiles.push({ index, buffer: finalBuffer, sourceWidth: tileWidth, sourceHeight: tileHeight });
      index++;
    }
  }

  return tiles;
}

export async function generateMainImage(sourceBuffer: Buffer): Promise<Buffer> {
  return sharp(sourceBuffer)
    .resize(LINE_MAIN_IMAGE.width, LINE_MAIN_IMAGE.height, { fit: 'cover' })
    .png()
    .toBuffer();
}

export async function generateTabImage(sourceBuffer: Buffer): Promise<Buffer> {
  return sharp(sourceBuffer)
    .resize(LINE_TAB_IMAGE.width, LINE_TAB_IMAGE.height, { fit: 'cover' })
    .png()
    .toBuffer();
}
