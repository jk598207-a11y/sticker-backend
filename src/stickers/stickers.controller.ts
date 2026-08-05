import {
  Controller, Post, UploadedFile, UseInterceptors,
  Body, Res, BadRequestException, Req, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { StickersService } from './stickers.service';
import { GenerateStickerPackDto } from './dto/generate-sticker-pack.dto';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';

@Controller('stickers')
export class StickersController {
  constructor(private readonly stickersService: StickersService) {}

  @Post('generate-pack')
  @UseGuards(OptionalJwtGuard)
  @UseInterceptors(FileInterceptor('image'))
  async generatePack(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: GenerateStickerPackDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('請上傳 image 圖片檔案。');
    }

    const userId = (req.user as any)?.id;

    const { zipStream } = await this.stickersService.generatePack(
      file.buffer,
      dto,
      userId,
    );

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="sticker-pack.zip"');
    zipStream.pipe(res);
  }
}