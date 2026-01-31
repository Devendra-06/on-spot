import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Menu } from '../menus/entities/menu.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async getDashboardStats() {
    const allOrders = await this.orderRepository.find();
    const allMenus = await this.menuRepository.find();

    const totalRevenue = allOrders.reduce((sum, order) => {
      const amount = Number(order.totalAmount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const pendingOrders = allOrders.filter((o) => o.status === 'PENDING').length;

    return {
      totalOrders: allOrders.length,
      totalRevenue: totalRevenue,
      totalMenuItems: allMenus.length,
      pendingOrders: pendingOrders,
    };
  }

  async getRevenueStats() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentOrders = await this.orderRepository.find({
      where: {
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
        status: 'COMPLETED',
      },
    });

    const dailyRevenue = this.groupByDate(recentOrders, 7);
    const weeklyRevenue = this.groupByWeek(recentOrders);

    const total = recentOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    return {
      daily: dailyRevenue,
      weekly: weeklyRevenue,
      total,
    };
  }

  async getOrdersByStatus() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const orders = await this.orderRepository.find({
      where: {
        createdAt: MoreThanOrEqual(sevenDaysAgo),
      },
    });

    const dailyData: Record<
      string,
      { pending: number; completed: number; cancelled: number }
    > = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { pending: 0, completed: 0, cancelled: 0 };
    }

    orders.forEach((order) => {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        if (order.status === 'PENDING') {
          dailyData[dateStr].pending++;
        } else if (order.status === 'COMPLETED') {
          dailyData[dateStr].completed++;
        } else if (order.status === 'CANCELLED') {
          dailyData[dateStr].cancelled++;
        }
      }
    });

    return {
      daily: Object.entries(dailyData).map(([date, counts]) => ({
        date,
        ...counts,
      })),
    };
  }

  async getRecentOrders(limit = 10) {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'items', 'items.menuItem'],
    });
  }

  async getPopularItems(limit = 5) {
    const result = await this.orderItemRepository
      .createQueryBuilder('item')
      .select('item.menuItemId', 'menuItemId')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.price * item.quantity)', 'totalRevenue')
      .groupBy('item.menuItemId')
      .orderBy('"totalQuantity"', 'DESC')
      .limit(limit)
      .getRawMany();

    const items = await Promise.all(
      result.map(async (r) => {
        const menu = await this.menuRepository.findOne({
          where: { id: r.menuItemId },
          relations: ['photo'],
        });
        return {
          id: r.menuItemId,
          name: menu?.name || 'Unknown',
          photo: menu?.photo || null,
          orderCount: parseInt(r.totalQuantity) || 0,
          revenue: parseFloat(r.totalRevenue) || 0,
        };
      }),
    );

    return { items: items.filter((i) => i.id) };
  }

  private groupByDate(
    orders: Order[],
    days: number,
  ): { date: string; revenue: number }[] {
    const now = new Date();
    const result: { date: string; revenue: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      const revenue = dayOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0,
      );
      result.push({ date: dateStr, revenue });
    }

    return result;
  }

  private groupByWeek(orders: Order[]): { week: string; revenue: number }[] {
    const weeks: Record<string, number> = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const weekStart = this.getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = 0;
      }
      weeks[weekKey] += Number(order.totalAmount);
    });

    return Object.entries(weeks)
      .map(([week, revenue]) => ({ week, revenue }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-4);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
