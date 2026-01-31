import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';

@ApiTags('Stats')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'stats',
  version: '1',
})
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue statistics with daily and weekly breakdown' })
  async getRevenueStats() {
    return this.statsService.getRevenueStats();
  }

  @Get('orders-by-status')
  @ApiOperation({ summary: 'Get order counts grouped by status per day' })
  async getOrdersByStatus() {
    return this.statsService.getOrdersByStatus();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentOrders(@Query('limit') limit?: number) {
    return this.statsService.getRecentOrders(limit || 10);
  }

  @Get('popular-items')
  @ApiOperation({ summary: 'Get popular menu items by order count' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularItems(@Query('limit') limit?: number) {
    return this.statsService.getPopularItems(limit || 5);
  }
}
