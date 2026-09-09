import { Module } from '@nestjs/common';

import { PaypalController } from './paypal.controller';
import { PaypalService } from './paypal.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [PaypalController],
  providers: [PaypalService],
})
export class PaypalModule {}