import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { StickersService } from './stickers.service';
import { GenerateStickerPackDto } from './dto/generate-sticker-pack.dto';

@Controller('stickers')
export class StickersController {
  constructor(private readonly stickersService: StickersService) {}

  /**
   * Accepts an uploaded image and grid settings, then returns a ZIP file.
   *
   * multipart/form-data:
   * - image: source image
   * - rows / cols: grid size
   * - vLines / hLines: JSON arrays of normalized crop lines from 0 to 1
   */
  @Post('generate-pack')
  @UseInterceptors(FileInterceptor('image'))
  async generatePack(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: GenerateStickerPackDto,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('請上傳 image 圖片檔案。');
    }

    const { zipStream } = await this.stickersService.generatePack(file.buffer, dto);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="sticker-pack.zip"');
    zipStream.pipe(res);
  }
}
