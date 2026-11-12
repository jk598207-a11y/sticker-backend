import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./orders.entity";

export const STICKER_PACK_PRICE_TWD = 100;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  findByUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async findByIdForUser(orderId: string, userId: string) {
    const order = await this.repo.findOne({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException("找不到訂單");
    }

    return order;
  }

  // 只能取得「目前使用者自己的 pending 訂單」
  async findPendingByIdForUser(orderId: string, userId: string) {
    const order = await this.repo.findOne({
      where: {
        id: orderId,
        userId,
        status: "pending",
      },
    });

    if (!order) {
      throw new BadRequestException("找不到可付款的 pending 訂單");
    }

    return order;
  }

  // =====================================
  // 建立全新的待付款訂單
  // =====================================
  // 每次使用者發起購買，都建立新的 pending 訂單
  // 不再查詢或重用以前的 pending 訂單
  //
  // 建立時：
  // 1. 自動產生新的 UUID 訂單編號
  // 2. createdAt 自動記錄訂單建立時間
  // 3. status 預設為 pending（待付款）
  // 4. totalAmount 由後端固定為 NT$100
  //
  // PayPal 付款成功後，再由 markAsPaid()
  // 將狀態改成 paid，並記錄 paidAt
  // 每次購買都建立全新的 pending 訂單
async createPendingOrder(userId: string) {
  return this.repo.save(
    this.repo.create({
      userId,
      status: "pending",
      totalAmount: STICKER_PACK_PRICE_TWD,
    }),
  );
}

  async attachPaypalOrderId(
    orderId: string,
    userId: string,
    paypalOrderId: string,
  ) {
    const order = await this.repo.findOne({
      where: {
        id: orderId,
        userId,
        status: "pending",
      },
    });

    if (!order) {
      throw new BadRequestException("找不到可付款的 pending 訂單");
    }

    order.paypalOrderId = paypalOrderId;

    return this.repo.save(order);
  }

  async findByPaypalOrderIdForUser(paypalOrderId: string, userId: string) {
    const order = await this.repo.findOne({
      where: {
        paypalOrderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException("找不到訂單");
    }

    return order;
  }

  async markAsPaid(paypalOrderId: string, userId: string) {
    const order = await this.repo.findOne({
      where: {
        paypalOrderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException("找不到訂單");
    }

    // 已經 paid 就直接回傳，避免重複更新
    if (order.status === "paid") {
      return order;
    }

    // 只有 pending 才能進入 paid
    if (order.status !== "pending") {
      throw new BadRequestException("目前訂單狀態無法更新為 paid");
    }
    // 付款成功後更新狀態與時間
    order.status = "paid";
    order.paidAt = new Date();

    return this.repo.save(order);
  }
}
