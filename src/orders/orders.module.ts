import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  exports: [TypeOrmModule],
})
export class OrdersModule {}