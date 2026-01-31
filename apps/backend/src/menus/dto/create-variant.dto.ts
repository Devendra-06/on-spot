import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ example: 'Large' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 14.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50, required: false })
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
}

export class UpdateVariantDto {
  @ApiProperty({ example: 'Large', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 14.99, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 50, required: false })
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
}
