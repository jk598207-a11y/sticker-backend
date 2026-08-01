import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StickerPreset } from './presets.entity';
import { PresetsService } from './presets.service';

@Module({
  imports: [TypeOrmModule.forFeature([StickerPreset])],
  providers: [PresetsService],
  exports: [PresetsService],
})
export class PresetsModule {}