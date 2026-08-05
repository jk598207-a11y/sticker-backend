import { Module } from '@nestjs/common';
import { StickersController } from './stickers.controller';
import { StickersService } from './stickers.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [StickersController],
  providers: [StickersService],
})
export class StickersModule {}