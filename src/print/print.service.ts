import { Inject, Injectable } from '@nestjs/common';
import {
  PrintProvider,
  PrintJobInput,
  PrintJobResult,
  PRINT_PROVIDER,
} from './print-provider.interface';

@Injectable()
export class PrintService {
  constructor(@Inject(PRINT_PROVIDER) private readonly provider: PrintProvider) {}

  async createJobForOrder(input: PrintJobInput): Promise<PrintJobResult> {
    return this.provider.createPrintJob(input);
  }

  async checkStatus(providerJobId: string) {
    return this.provider.getJobStatus(providerJobId);
  }
}
