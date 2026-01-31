import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { MenusService } from '../menus/menus.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        private menusService: MenusService,
    ) { }

    async create(createOrderDto: CreateOrderDto, user: any) {
        let totalAmount = 0;
        const orderItems: OrderItem[] = [];

        for (const itemDto of createOrderDto.items) {
            const menuItem = await this.menusService.findOne(itemDto.menuItemId);
            if (!menuItem) {
                throw new NotFoundException(`Menu item with ID ${itemDto.menuItemId} not found`);
            }

            const itemTotal = Number(menuItem.price) * itemDto.quantity;
            totalAmount += itemTotal;

            const orderItem = this.orderItemsRepository.create({
                menuItem,
                quantity: itemDto.quantity,
                price: Number(menuItem.price),
            });
            orderItems.push(orderItem);
        }

        const order = this.ordersRepository.create({
            status: createOrderDto.status || 'PENDING',
            totalAmount: createOrderDto.totalAmount || totalAmount,
            user,
            items: orderItems,
        });

        return this.ordersRepository.save(order);
    }

    findAll() {
        return this.ordersRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['user', 'items'],
        });
    }

    findByUser(userId: number) {
        return this.ordersRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    findReadyForDelivery() {
        return this.ordersRepository.find({
            where: { status: 'READY' },
            order: { createdAt: 'ASC' },
            relations: ['user'],
        });
    }

    async findOne(id: string) {
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }

    async update(id: string, updateOrderDto: UpdateOrderDto) {
        const order = await this.findOne(id);
        this.ordersRepository.merge(order, updateOrderDto);
        return this.ordersRepository.save(order);
    }

    async remove(id: string) {
        const order = await this.findOne(id);
        return this.ordersRepository.remove(order);
    }
}
