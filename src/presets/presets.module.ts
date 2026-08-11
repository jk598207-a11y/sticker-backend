import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StickerPreset } from './presets.entity';
import { PresetsService } from './presets.service';
import { PresetsController } from './presets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StickerPreset])],
  providers: [PresetsService],
  exports: [PresetsService],
  controllers: [PresetsController],
})
export class PresetsModule {}