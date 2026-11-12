import { Body, Controller, Post, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { PaypalService } from "./paypal.service";

@Controller("paypal")
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post("create-order")
  @UseGuards(AuthGuard("jwt"))
  createOrder(
    @Req() req: Request,
    @Body()
    body: {
      orderId: string;
    },
  ) {
    const user = req.user as { id: string };

    return this.paypalService.createOrder(
      body.orderId,
      user.id,
    );
  }

  @Post("capture-order")
  @UseGuards(AuthGuard("jwt"))
  captureOrder(
    @Req() req: Request,
    @Body()
    body: {
      orderId: string;
    },
  ) {
    const user = req.user as { id: string };

    return this.paypalService.captureOrder(
      body.orderId,
      user.id,
    );
  }
}