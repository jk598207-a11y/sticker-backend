import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StickersModule } from './stickers/stickers.module';
import { PrintModule } from './print/print.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { PresetsModule } from './presets/presets.module';
import { User } from './users/users.entity';
import { Order } from './orders/orders.entity';
import { StickerPreset } from './presets/presets.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:     process.env.DB_HOST     ?? 'localhost',
      port:     Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER     ?? 'sticker',
      password: process.env.DB_PASS     ?? 'sticker1234',
      database: process.env.DB_NAME     ?? 'stickerdb',
      entities: [User, Order, StickerPreset],
      synchronize: true,
    }),
    StickersModule,
    PrintModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    PresetsModule,
  ],
})
export class AppModule {}