import { Injectable } from "@nestjs/common";
import { OrdersService } from "../orders/orders.service";
import {
  Client,
  Environment,
  CheckoutPaymentIntent,
  OrdersController,
} from "@paypal/paypal-server-sdk";

@Injectable()
export class PaypalService {
  private readonly client: Client;
  private readonly ordersController: OrdersController;

  constructor(private readonly ordersService: OrdersService) {
    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      },
      environment:
        process.env.PAYPAL_MODE === "live"
          ? Environment.Production
          : Environment.Sandbox,
    });

    this.ordersController = new OrdersController(this.client);
  }

  async createOrder(
    orderId: string,
    userId: string,
  ) {
    // 從自己的資料庫取得訂單
    const order = await this.ordersService.findPendingByIdForUser(
      orderId,
      userId,
    );

    // 使用資料庫裡的金額，不信任前端傳入的 amount
    const amount = Number(order.totalAmount).toFixed(2);
    console.log("目前付款訂單 ID：", order.id);
    console.log("資料庫訂單金額：", order.totalAmount);

    // 幣別由後端固定，不信任前端傳入的 currency
    const currency = "TWD";

    const collect = {
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    // 建立 PayPal 訂單
  // 建立 PayPal 訂單
let response;

try {
  response = await this.ordersController.createOrder(collect);
} catch (error: unknown) {
  console.error("PayPal Create Order 失敗");

  if (error && typeof error === "object") {
    const err = error as {
      statusCode?: number;
      body?: unknown;
      message?: string;
    };

    console.error("HTTP 狀態碼：", err.statusCode);
    console.error("PayPal 錯誤內容：", err.body);
    console.error("錯誤訊息：", err.message);
  }

  throw error;
}

    const result = response.result;

    // 將 PayPal 訂單 ID 寫回自己的訂單
    await this.ordersService.attachPaypalOrderId(
      orderId,
      userId,
      result.id!,
    );

    return result;
  }

  async captureOrder(
    orderId: string,
    userId: string,
  ) {
    // Capture PayPal 訂單
    const response =
      await this.ordersController.captureOrder({
        id: orderId,
      });

    const result = response.result;

    console.log("PayPal Capture result:", result);

    // PayPal 確認完成後，更新自己的訂單
    if (result.status === "COMPLETED") {
      await this.ordersService.markAsPaid(
        orderId,
        userId,
      );
    }

    return result;
  }
}