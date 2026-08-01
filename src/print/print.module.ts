import { Module } from '@nestjs/common';
import { PrintService } from './print.service';
import { ManualQueueProvider } from './providers/manual-queue.provider';
import { PRINT_PROVIDER } from './print-provider.interface';

@Module({
  providers: [
    ManualQueueProvider,
    {
      // 之後要換成真正的印刷廠 API，只要把 useClass 換成新的 Provider class
      // 例如：useClass: NewebPrintProvider
      provide: PRINT_PROVIDER,
      useClass: ManualQueueProvider,
    },
    PrintService,
  ],
  exports: [PrintService],
})
export class PrintModule {}
