import { Injectable, BadRequestException } from "@nestjs/common";
import { PassThrough } from "stream";
import {
  cutImageToGrid,
  generateMainImage,
  generateTabImage,
} from "./utils/image-cutter";
import { buildStickerPackZip } from "./utils/zip-builder";
import { GenerateStickerPackDto } from "./dto/generate-sticker-pack.dto";
import { promises as fs } from "fs";
import { join } from "path";

export interface GeneratedPack {
  zipBuffer: Buffer;
  tileCount: number;
}

@Injectable()
export class StickersService {
  async generatePack(
    sourceBuffer: Buffer,
    dto: GenerateStickerPackDto,
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

    const zipBuffer = await this.streamToBuffer(zipStream);

    return { zipBuffer, tileCount: tiles.length };
  }

  async saveZipFile(orderId: string, zipBuffer: Buffer): Promise<string> {
    const dirPath = join(process.cwd(), "uploads", "zips");

    await fs.mkdir(dirPath, {
      recursive: true,
    });

    const fileName = `${orderId}.zip`;

    const fullPath = join(dirPath, fileName);

    await fs.writeFile(fullPath, zipBuffer);

    return join("uploads", "zips", fileName);
  }

  async readZipFile(relativePath: string): Promise<Buffer> {
    const fullPath = join(process.cwd(), relativePath);

    return fs.readFile(fullPath);
  }
  private streamToBuffer(stream: PassThrough): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", (err) => reject(err));
    });
  }
}
