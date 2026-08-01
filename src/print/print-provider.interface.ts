/**
 * 印刷服務抽象層（Print Provider Adapter）
 *
 * 訂單系統只認識這個介面，完全不知道底層是「人工列印佇列」
 * 還是「某個國外/台灣POD廠商的API」。
 * 之後要換廠商、或同時接多家廠商分流，只需要新增一個 implements
 * 這個介面的 Provider，不需要改動訂單、金流相關的程式碼。
 */

export interface PrintJobInput {
  orderId: string;
  customerName: string;
  shippingAddress: string;
  /** 每個檔案對應一個商品項目，例如一份貼圖ZIP或單張貼紙設計檔 */
  designFiles: {
    productSku: string;
    quantity: number;
    fileUrl: string;
  }[];
}

export type PrintJobStatus = 'queued' | 'in_production' | 'shipped' | 'failed';

export interface PrintJobResult {
  /** 廠商或內部系統自己的工單編號 */
  providerJobId: string;
  status: PrintJobStatus;
  /** 若廠商支援，預估出貨日期 */
  estimatedShipDate?: string;
}

export interface PrintProvider {
  /** 建立一張印刷工單 */
  createPrintJob(input: PrintJobInput): Promise<PrintJobResult>;

  /** 查詢工單目前狀態，用於訂單後台顯示生產進度 */
  getJobStatus(providerJobId: string): Promise<PrintJobStatus>;
}

export const PRINT_PROVIDER = 'PRINT_PROVIDER';
