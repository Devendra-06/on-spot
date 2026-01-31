import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: 'Downtown' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Central business district area', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 3.99 })
  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @ApiProperty({ example: 15.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrder?: number | null;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDeliveryMinutes?: number | null;

  @ApiProperty({ example: '10001,10002,10003', required: false })
  @IsOptional()
  @IsString()
  postalCodes?: string;

  @ApiProperty({ example: 'Manhattan,Midtown,Chelsea', required: false })
  @IsOptional()
  @IsString()
  areaNames?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
