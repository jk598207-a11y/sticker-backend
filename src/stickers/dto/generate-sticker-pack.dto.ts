import { IsInt, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
import { Transform } from 'class-transformer';

const ALLOWED_COUNTS = [8, 16, 24, 32, 40];

export class GenerateStickerPackDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  rows!: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  cols!: number;

  @IsArray()
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  vLines!: number[];

  @IsArray()
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  hLines!: number[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isCustom?: boolean;

  validateCount(): void {
    if (this.isCustom) return;
    const total = this.rows * this.cols;
    if (!ALLOWED_COUNTS.includes(total)) {
      throw new Error(
        `張數 ${total} 不符合 LINE 官方規格，需為 ${ALLOWED_COUNTS.join('/')} 之一`,
      );
    }
  }
}