import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
    path: 'orders',
    version: '1',
})
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Request() request, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto, request.user);
    }

    @Get('me')
    findMyOrders(@Request() request) {
        return this.ordersService.findByUser(request.user.id);
    }

    @Get('ready')
    findReadyOrders() {
        return this.ordersService.findReadyForDelivery();
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.update(id, updateOrderDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ordersService.remove(id);
    }
}
