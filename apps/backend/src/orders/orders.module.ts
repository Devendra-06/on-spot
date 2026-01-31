import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusModule } from '../menus/menus.module';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem]), MenusModule],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
