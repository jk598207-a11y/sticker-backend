import { Injectable } from "@nestjs/common";
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

  async findByIdForUser(
  orderId: string,
  userId: string,
) {
  const order = await this.repo.findOne({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw new Error("找不到訂單");
  }

  return order;
}

  create(userId: string) {
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
      },
    });

    if (!order) {
      throw new Error("找不到訂單");
    }

    order.paypalOrderId = paypalOrderId;

    return this.repo.save(order);
  }

  async markAsPaid(
    paypalOrderId: string,
    userId: string,
  ) {
    const order = await this.repo.findOne({
      where: {
        paypalOrderId,
        userId,
      },
    });

    if (!order) {
      throw new Error("找不到訂單");
    }

    if (order.status === "paid") {
      return order;
    }

    order.status = "paid";

    return this.repo.save(order);
  }
}
