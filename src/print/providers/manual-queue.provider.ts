import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  PrintProvider,
  PrintJobInput,
  PrintJobResult,
  PrintJobStatus,
} from '../print-provider.interface';

/**
 * Phase 1 上線先用這個實作：把工單寫進內部資料庫的生產佇列，
 * 由內部人員在後台手動標記「生產中／已出貨」。
 *
 * 之後要接真正的印刷廠 API，只要寫一個新的 class（例如 NewebPrintProvider）
 * 實作同一個 PrintProvider 介面，再到 print.module.ts 換掉注入的 provider 即可，
 * StickersService / 訂單流程完全不用改。
 */
@Injectable()
export class ManualQueueProvider implements PrintProvider {
  // 這裡用記憶體陣列示意，實際專案請換成 PostgreSQL 的 production_jobs 表
  private readonly jobs = new Map<string, PrintJobStatus>();

  async createPrintJob(input: PrintJobInput): Promise<PrintJobResult> {
    const providerJobId = randomUUID();
    this.jobs.set(providerJobId, 'queued');

    // TODO: 寫入 production_jobs 表，欄位至少包含
    // order_id, design_file_urls, status, assigned_operator, created_at
    console.log(`[ManualQueueProvider] 新工單已建立 orderId=${input.orderId} jobId=${providerJobId}`);

    return { providerJobId, status: 'queued' };
  }

  async getJobStatus(providerJobId: string): Promise<PrintJobStatus> {
    return this.jobs.get(providerJobId) ?? 'failed';
  }

  /** 給後台「生產排程儀表板」呼叫，人工標記狀態用 */
  markStatus(providerJobId: string, status: PrintJobStatus): void {
    this.jobs.set(providerJobId, status);
  }
}
