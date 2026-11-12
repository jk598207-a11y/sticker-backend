import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/users.entity';
import { Order } from '../orders/orders.entity';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  // =========================
  // 查詢目前匯出資格
  // 不修改資料庫
  // =========================
  async getEligibility(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('找不到使用者');
    }

    // Admin 永久免費
    if (user.role === UserRole.ADMIN) {
      return {
        canExport: true,
        reason: 'admin',
        freeRemaining: null,
      };
    }

    // 一般使用者前 3 次免費
    if (user.freeExportUsed < 3) {
      return {
        canExport: true,
        reason: 'free',
        freeRemaining: 3 - user.freeExportUsed,
      };
    }

    // 免費次數用完
    // 找尚未使用的已付款訂單
    const paidOrder = await this.ordersRepository.findOne({
      where: {
        userId,
        status: 'paid',
        exportUsed: false,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (paidOrder) {
      return {
        canExport: true,
        reason: 'paid',
        freeRemaining: 0,
        orderId: paidOrder.id,
      };
    }

    return {
      canExport: false,
      reason: 'payment_required',
      freeRemaining: 0,
    };
  }

  // =========================
  // 免費 / Admin 匯出
  // 付費訂單不要走這裡
  // =========================
  async consumeExport(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('找不到使用者');
    }

    // Admin 不扣次數
    if (user.role === UserRole.ADMIN) {
      return {
        allowed: true,
        reason: 'admin',
        freeRemaining: null,
      };
    }

    // 前 3 次免費
    if (user.freeExportUsed < 3) {
      user.freeExportUsed += 1;

      await this.usersRepository.save(user);

      return {
        allowed: true,
        reason: 'free',
        freeRemaining: 3 - user.freeExportUsed,
      };
    }

    // 免費額度已用完
    // 付費流程必須另外處理
    throw new ForbiddenException(
      '免費匯出次數已用完，請先完成付款',
    );
  }

  // =========================
  // 取得尚未使用的已付款訂單
  // =========================
  async getPaidOrder(
    userId: string,
    orderId: string,
  ) {
    const order = await this.ordersRepository.findOne({
      where: {
        id: orderId,
        userId,
        status: 'paid',
        exportUsed: false,
      },
    });

    if (!order) {
      throw new ForbiddenException(
        '找不到可使用的已付款訂單',
      );
    }

    return order;
  }

  // =========================
  // 第一次產生付費 ZIP
  //
  // 只記錄 ZIP 路徑
  // 不把 exportUsed 改成 true
  // =========================
  async attachPaidZip(
    userId: string,
    orderId: string,
    zipUrl: string,
  ) {
    const result = await this.ordersRepository.update(
      {
        id: orderId,
        userId,
        status: 'paid',
        exportUsed: false,
      },
      {
        zipUrl,
      },
    );

    if (result.affected !== 1) {
      throw new ForbiddenException(
        '無法記錄這筆 ZIP',
      );
    }
  }

  // =========================
  // 使用者真正成功存檔後
  // 才消耗這筆付款資格
  // =========================
  async completePaidExport(
    userId: string,
    orderId: string,
  ) {
    const order = await this.ordersRepository.findOne({
      where: {
        id: orderId,
        userId,
        status: 'paid',
        exportUsed: false,
      },
    });

    if (!order) {
      throw new ForbiddenException(
        '找不到可完成的已付款訂單',
      );
    }

    // 必須先真的產生過 ZIP
    if (!order.zipUrl) {
      throw new ForbiddenException(
        'ZIP 尚未產生，無法完成匯出',
      );
    }

    const result = await this.ordersRepository.update(
      {
        id: orderId,
        userId,
        status: 'paid',
        exportUsed: false,
      },
      {
        exportUsed: true,
      },
    );

    if (result.affected !== 1) {
      throw new ForbiddenException(
        '這筆訂單已經使用，或無法完成匯出',
      );
    }
  }
}