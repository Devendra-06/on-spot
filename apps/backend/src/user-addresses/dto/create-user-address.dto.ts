import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateUserAddressDto {
  @ApiProperty({ example: 'Home' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'New York' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '10001' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @ApiProperty({ example: -74.006, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @ApiProperty({ example: 'Ring bell twice', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
