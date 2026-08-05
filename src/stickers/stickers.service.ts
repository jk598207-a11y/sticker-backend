import { Injectable, BadRequestException } from '@nestjs/common';
import { PassThrough } from 'stream';
import {
  cutImageToGrid,
  generateMainImage,
  generateTabImage,
} from './utils/image-cutter';
import { buildStickerPackZip } from './utils/zip-builder';
import { GenerateStickerPackDto } from './dto/generate-sticker-pack.dto';
import { OrdersService } from '../orders/orders.service';

export interface GeneratedPack {
  zipStream: PassThrough;
  tileCount: number;
}

@Injectable()
export class StickersService {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  async generatePack(
    sourceBuffer: Buffer,
    dto: GenerateStickerPackDto,
    userId?: string,  // 登錄用戶才有
  ): Promise<GeneratedPack> {
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

    // 如果有登錄就建立訂單記錄
    if (userId) {
      await this.ordersService.create(userId, {
        totalAmount: 0,
      });
    }

    return { zipStream, tileCount: tiles.length };
  }
}