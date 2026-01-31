import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateAddonDto {
  @ApiProperty({ example: 'Extra Cheese' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 1.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number | null;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ example: 'Toppings', required: false })
  @IsOptional()
  @IsString()
  groupName?: string;
}

export class UpdateAddonDto {
  @ApiProperty({ example: 'Extra Cheese', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 1.99, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number | null;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ example: 'Toppings', required: false })
  @IsOptional()
  @IsString()
  groupName?: string;
}
