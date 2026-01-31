import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @ApiProperty()
    @IsString()
    menuItemId: string;

    @ApiProperty()
    @IsNumber()
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    totalAmount?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    status?: string;
}
