import archiver from 'archiver';
import { PassThrough } from 'stream';
import type { CutTile } from './image-cutter';

export interface ZipBuildInput {
  mainImage: Buffer;
  tabImage: Buffer;
  tiles: CutTile[];
}

function padIndex(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * 依 LINE Creators Market 要求的命名規則打包成 ZIP：
 * main.png、tab.png、01.png ~ NN.png
 * 回傳一個可直接 pipe 給 HTTP response 的 stream。
 */
export function buildStickerPackZip(input: ZipBuildInput): PassThrough {
  const output = new PassThrough();
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err: Error) => {
    output.emit('error', err);
  });

  archive.pipe(output);

  archive.append(input.mainImage, { name: 'main.png' });
  archive.append(input.tabImage, { name: 'tab.png' });

  for (const tile of input.tiles) {
    archive.append(tile.buffer, { name: `${padIndex(tile.index)}.png` });
  }

  archive.finalize();

  return output;
}
