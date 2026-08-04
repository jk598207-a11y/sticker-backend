import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./orders.entity";

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

  create(
    userId: string,
    data: {
      zipUrl?: string;
      totalAmount?: number;
    },
  ) {
    return this.repo.save(
      this.repo.create({
        userId,
        status: "pending",
        ...data,
      }),
    );
  }
}
