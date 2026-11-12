import { Module } from '@nestjs/common';
import { StickersController } from './stickers.controller';
import { StickersService } from './stickers.service';
import { OrdersModule } from '../orders/orders.module';
import { ExportsModule } from '../exports/exports.module';

@Module({
  imports: [OrdersModule, ExportsModule],
  controllers: [StickersController],
  providers: [StickersService],
})
export class StickersModule {}