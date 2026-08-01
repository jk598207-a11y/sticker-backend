import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StickerPreset } from './presets.entity';

@Injectable()
export class PresetsService {
  constructor(
    @InjectRepository(StickerPreset)
    private readonly repo: Repository<StickerPreset>,
  ) {}

  findByUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  create(userId: string, data: {
    name: string;
    rows: number;
    cols: number;
    isCustom: boolean;
    vLines: number[];
    hLines: number[];
  }) {
    return this.repo.save(this.repo.create({ userId, ...data }));
  }

  delete(id: string, userId: string) {
    return this.repo.delete({ id, userId });
  }
}