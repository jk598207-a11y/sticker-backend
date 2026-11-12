import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exports')
export class ExportsController {
  constructor(
    private readonly exportsService: ExportsService,
  ) {}

  // =========================
  // 查詢目前匯出資格
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get('eligibility')
  async getEligibility(@Req() req: any) {
    return this.exportsService.getEligibility(
      req.user.id,
    );
  }

  // =========================
  // 免費 / Admin 匯出
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post('consume')
  async consumeExport(@Req() req: any) {
    return this.exportsService.consumeExport(
      req.user.id,
    );
  }

  // =========================
  // 付費 ZIP 真正存檔成功
  // 才正式消耗這筆付款資格
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post('complete-paid')
  async completePaidExport(
    @Req() req: any,
    @Body('orderId') orderId: string,
  ) {
    await this.exportsService.completePaidExport(
      req.user.id,
      orderId,
    );

    return {
      success: true,
    };
  }
}