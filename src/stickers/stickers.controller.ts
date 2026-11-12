import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  BadRequestException,
  Req,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import { StickersService } from "./stickers.service";
import { GenerateStickerPackDto } from "./dto/generate-sticker-pack.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ExportsService } from "../exports/exports.service";
import { User } from "../users/users.entity";

@Controller("stickers")
export class StickersController {
  constructor(
    private readonly stickersService: StickersService,
    private readonly exportsService: ExportsService,
  ) {}

  @Post("generate-pack")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("image", {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },

      fileFilter: (_req, file, callback) =>
        callback(
          null,
          file.mimetype.startsWith("image/"),
        ),
    }),
  )
  async generatePack(
    @UploadedFile()
    file: Express.Multer.File,

    @Body()
    dto: GenerateStickerPackDto,

    @Res()
    res: Response,

    @Req()
    req: Request & { user: User },
  ) {
    const userId = req.user.id;

    // =====================================
    // 付費匯出
    // =====================================
    if (dto.orderId) {
      // 確認：
      // 1. 訂單屬於目前登入使用者
      // 2. 訂單已付款
      // 3. 這筆付費資格尚未被正式消耗
      const paidOrder =
        await this.exportsService.getPaidOrder(
          userId,
          dto.orderId,
        );

      // -------------------------------------
      // 已經產生過 ZIP
      //
      // 代表使用者可能上次：
      // - 開啟儲存視窗後取消
      // - 下載中斷
      //
      // 直接把原本 ZIP 再送一次，
      // 不重新產生，也不消耗資格。
      // -------------------------------------
      if (paidOrder.zipUrl) {
        const zipBuffer =
          await this.stickersService.readZipFile(
            paidOrder.zipUrl,
          );

        res.setHeader(
          "Content-Type",
          "application/zip",
        );

        res.setHeader(
          "Content-Disposition",
          'attachment; filename="sticker-pack.zip"',
        );

        res.send(zipBuffer);
        return;
      }

      // -------------------------------------
      // 第一次建立這筆付費訂單的 ZIP
      // -------------------------------------
      if (!file) {
        throw new BadRequestException(
          "請上傳 image 圖片檔案。",
        );
      }

      // 產生 ZIP
      const { zipBuffer } =
        await this.stickersService.generatePack(
          file.buffer,
          dto,
        );

      // 將 ZIP 保存到伺服器
      const zipUrl =
        await this.stickersService.saveZipFile(
          paidOrder.id,
          zipBuffer,
        );

      // 只記錄 ZIP 路徑
      // 注意：
      // 這裡不能 exportUsed = true
      //
      // 使用者真正成功存到電腦後，
      // 才會另外呼叫 complete API。
      await this.exportsService.attachPaidZip(
        userId,
        paidOrder.id,
        zipUrl,
      );

      res.setHeader(
        "Content-Type",
        "application/zip",
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="sticker-pack.zip"',
      );

      res.send(zipBuffer);
      return;
    }

    // =====================================
    // 免費 / Admin 匯出
    // =====================================

    if (!file) {
      throw new BadRequestException(
        "請上傳 image 圖片檔案。",
      );
    }

    // 先確認目前資格
    const eligibility =
      await this.exportsService.getEligibility(
        userId,
      );

    // 已經沒有免費次數
    // 但前端又沒有傳 orderId
    //
    // 不允許直接產 ZIP
    if (
      eligibility.reason === "paid" ||
      eligibility.reason ===
        "payment_required"
    ) {
      throw new BadRequestException(
        "免費匯出次數已用完，請先完成付款。",
      );
    }

    // 產生免費 / Admin ZIP
    const { zipBuffer } =
      await this.stickersService.generatePack(
        file.buffer,
        dto,
      );

    // 免費使用者：
    // freeExportUsed +1
    //
    // Admin：
    // 不扣次數
    await this.exportsService.consumeExport(
      userId,
    );

    res.setHeader(
      "Content-Type",
      "application/zip",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sticker-pack.zip"',
    );

    res.send(zipBuffer);
  }
}