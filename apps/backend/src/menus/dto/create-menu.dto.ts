import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FileDto } from '../../files/dto/file.dto';
import { CreateVariantDto } from './create-variant.dto';
import { CreateAddonDto } from './create-addon.dto';

export class MenuCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CreateMenuDto {
  @ApiProperty({ example: 'Cheeseburger' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Juice beef patty based burger', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 12.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ type: () => FileDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileDto)
  photo?: FileDto | null;

  @ApiProperty({ type: () => MenuCategoryDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MenuCategoryDto)
  category?: MenuCategoryDto | null;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number | null;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  autoDisableOnStockout?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ type: () => [CreateVariantDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];

  @ApiProperty({ type: () => [CreateAddonDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddonDto)
  addons?: CreateAddonDto[];
}
