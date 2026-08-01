import { Injectable, BadRequestException } from '@nestjs/common';
import { PassThrough } from 'stream';
import {
  cutImageToGrid,
  generateMainImage,
  generateTabImage,
} from './utils/image-cutter';
import { buildStickerPackZip } from './utils/zip-builder';
import { GenerateStickerPackDto } from './dto/generate-sticker-pack.dto';

export interface GeneratedPack {
  zipStream: PassThrough;
  tileCount: number;
}

@Injectable()
export class StickersService {
  async generatePack(sourceBuffer: Buffer, dto: GenerateStickerPackDto): Promise<GeneratedPack> {
    try {
      dto.validateCount();
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }

    const tiles = await cutImageToGrid(sourceBuffer, {
      rows: dto.rows,
      cols: dto.cols,
      vLines: dto.vLines,
      hLines: dto.hLines,
    });

    const [mainImage, tabImage] = await Promise.all([
      generateMainImage(sourceBuffer),
      generateTabImage(sourceBuffer),
    ]);

    const zipStream = buildStickerPackZip({ mainImage, tabImage, tiles });

    return { zipStream, tileCount: tiles.length };
  }
}
