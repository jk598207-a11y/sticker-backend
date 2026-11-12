
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { User } from "../users/users.entity";

// =====================================
// 訂單狀態型別
// =====================================
// pending       = 待付款
// paid          = 已付款
// in_production = 生產中（目前 ZIP 工具未使用）
// shipped       = 已出貨（目前 ZIP 工具未使用）
export type OrderStatus =
  | "pending"
  | "paid"
  | "in_production"
  | "shipped";

// =====================================
// 訂單資料表
// =====================================
// @Entity("orders")
// 代表這個 Class 對應 PostgreSQL 的 orders 資料表
@Entity("orders")
export class Order {

  // =====================================
  // 訂單 ID
  // =====================================
  // UUID = 每筆訂單的唯一識別碼
  // 由資料庫自動產生
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // =====================================
  // 訂單與使用者的關聯
  // =====================================
  // ManyToOne = 多筆訂單可以屬於同一位使用者
  //
  // onDelete: "CASCADE"
  // 當使用者被刪除時，
  // 關聯的訂單也會一起刪除
  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  // 使用者 ID
  // 對應 PostgreSQL 欄位 user_id
  @Column({ name: "user_id" })
  userId!: string;

  // =====================================
  // 訂單付款狀態
  // =====================================
  // 新建立的訂單預設為 pending
  // PayPal Capture 成功後，才改成 paid
  @Column({ default: "pending" })
  status!: OrderStatus;

  // =====================================
  // 訂單金額
  // =====================================
  // 對應 PostgreSQL 欄位 total_amount
  //
  // 實際建立訂單時，
  // 金額由後端 OrdersService 設定
  // 不直接相信前端傳入的金額
  @Column({
    name: "total_amount",
    default: 0,
  })
  totalAmount!: number;

  // =====================================
  // ZIP 檔案位置
  // =====================================
  // 付費 ZIP 產生後，
  // 後端可以將 ZIP 的儲存位置記錄在這裡
  //
  // nullable: true
  // 表示尚未產生 ZIP 時允許 NULL
  @Column({
    name: "zip_url",
    nullable: true,
  })
  zipUrl?: string;

  // =====================================
  // PayPal 訂單 ID
  // =====================================
  // 這是 PayPal 產生的訂單編號
  // 與我們資料庫自己的 UUID 訂單 ID 不同
  //
  // 付款確認時，
  // 後端會使用這個 ID 找到對應的本地訂單
  @Column({
    name: "paypal_order_id",
    nullable: true,
  })
  paypalOrderId?: string;

  // =====================================
  // 付費匯出資格是否已使用
  // =====================================
  // false = 尚未完成付費 ZIP 匯出
  // true  = 已完成付費 ZIP 匯出
  //
  // 使用者取消儲存視窗時：
  // 不應將 exportUsed 改成 true
  //
  // 成功儲存 ZIP 且完成後端確認後：
  // 才將 exportUsed 改成 true
  @Column({
    name: "export_used",
    default: false,
  })
  exportUsed!: boolean;

  // =====================================
  // 付款成功時間（新增）
  // =====================================
  // 對應 PostgreSQL 欄位 paid_at
  //
  // pending 訂單：
  // paidAt = null
  //
  // PayPal Capture 成功後：
  // paidAt = new Date()
  //
  // 注意：
  // 這個欄位不會自動寫入時間
  // 必須由 OrdersService.markAsPaid() 設定
  //
  // nullable: true
  // 代表尚未付款的訂單可以沒有付款時間
  @Column({
    name: "paid_at",
    type: "timestamptz",
    nullable: true,
  })
  paidAt!: Date | null;

  // =====================================
  // 訂單建立時間
  // =====================================
  // 第一次建立訂單時由 TypeORM 自動記錄
  //
  // 就算之後重用舊 pending 訂單，
  // createdAt 也不會因此變成現在時間
  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;

  // =====================================
  // 訂單最後更新時間
  // =====================================
  // 訂單資料更新時由 TypeORM 自動更新
  //
  // 例如：
  // 綁定 PayPal 訂單 ID
  // 更新付款狀態
  // 更新 ZIP 相關欄位
  //
  // 因此 updatedAt 不等於付款成功時間
  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}
