import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('sticker_presets')
export class StickerPreset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column()
  rows!: number;

  @Column()
  cols!: number;

  @Column({ name: 'is_custom', default: false })
  isCustom!: boolean;

  @Column({ name: 'v_lines', type: 'jsonb' })
  vLines!: number[];

  @Column({ name: 'h_lines', type: 'jsonb' })
  hLines!: number[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}