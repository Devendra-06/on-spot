import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: 'Foodly', required: false })
  @IsOptional()
  @IsString()
  siteName?: string;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: '$', required: false })
  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @ApiProperty({ example: 5.0, required: false })
  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @ApiProperty({ example: 10.0, required: false })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiProperty({ example: 15.0, required: false })
  @IsOptional()
  @IsNumber()
  minimumOrder?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;
}
