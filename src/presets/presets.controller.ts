import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { PresetsService } from "./presets.service";
import { IsString, IsInt, IsBoolean, IsArray, Min } from "class-validator";
import { Transform } from "class-transformer";

class CreatePresetDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  rows!: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  cols!: number;

  @IsBoolean()
  isCustom!: boolean;

  @IsArray()
  vLines!: number[];

  @IsArray()
  hLines!: number[];
}

@Controller("presets")
@UseGuards(AuthGuard("jwt"))
export class PresetsController {
  constructor(private readonly presetsService: PresetsService) {}

  // GET /presets → 取得目前登錄用戶的所有裁切設定
  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.presetsService.findByUser(user.id);
  }

  // POST /presets → 儲存一個裁切設定
  @Post()
  create(@Req() req: Request, @Body() dto: CreatePresetDto) {
    const user = req.user as any;
    return this.presetsService.create(user.id, dto);
  }

  // DELETE /presets/:id → 刪除一個裁切設定
  @Delete(":id")
  remove(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as any;
    return this.presetsService.delete(id, user.id);
  }
}
