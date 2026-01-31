import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Burgers' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Delicious juicy burgers', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'burgers', required: false })
  @IsOptional()
  @IsString()
  slug?: string;
}
